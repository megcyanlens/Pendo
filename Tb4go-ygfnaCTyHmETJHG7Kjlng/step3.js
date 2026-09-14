(function advanceOrFallbackOnClick(dom, step) {
  if (pendo.designerEnabled || !step) return;

  const triggerSelectors = [
    '[data-testid="nav-menu.analytics_creation.create"]',
    '[data-testid="nav-menu.analytics_creation.visualize_analyze_home"]'
  ];
  const resourceGuideId = "7mL_jI1_v1Niv4OINB90_c_nZRE";
  const noAccessStep = 2;
  const cardStepId = "vD8s3dtxR2mfD2_-XQsPADie_5k";
  const targetPaths = ['/analytics/create', '/analytics/visualize'];
  // The Create card the next step points at.
  const TARGET_SELECTOR =
    '[data-testid="content-and-collaboration-group-items"] #add-new-menu-item-create, ' +
    '[data-testid="minihome-cards-container"] > #add-new-menu-item-create';
  // The card containers the Create card lives in. Once one has rendered on a
  // target page, the card either appears within a moment or this visitor
  // doesn't have it — no need to wait out the full timeout to decide.
  const CONTAINER_SELECTOR =
    '[data-testid="content-and-collaboration-group-items"], ' +
    '[data-testid="minihome-cards-container"]';
  const CONTAINER_GRACE_MS = 500;
  const MAX_WAIT_MS = 5000;
  const FALLBACK_GUIDE_MAX_WAIT_MS = 2000;

  function isOnTargetPath() {
    return targetPaths.some((path) => window.location.pathname.indexOf(path) !== -1);
  }

  // Watches the page for the Create card and advances the moment it appears,
  // instead of polling on fixed delays. Falls back if, on a target page, the
  // card containers render without the card, or if nothing shows up within
  // MAX_WAIT_MS.
  //
  // Only one watch runs at a time, tracked on window rather than per script
  // run: clicking Create navigates, Pendo can re-show this step on the new
  // URL (re-running this script, whose isOnTargetPath() check starts a watch
  // too), and two watches would each call goToStep/the fallback.
  function startWatching() {
    if (window.__pmjCreateCardWatch) return;

    let observer = null;
    let maxWaitTimer = null;
    let graceTimer = null;
    let checkScheduled = false;
    const watch = {};
    window.__pmjCreateCardWatch = watch;

    function finish(targetFound) {
      if (window.__pmjCreateCardWatch !== watch) return;
      window.__pmjCreateCardWatch = null;
      if (observer) observer.disconnect();
      clearTimeout(maxWaitTimer);
      clearTimeout(graceTimer);
      if (targetFound) {
        pendo.goToStep({ destinationStepId: cardStepId });
      } else {
        runFallback();
      }
    }

    function check() {
      checkScheduled = false;
      if (document.querySelector(TARGET_SELECTOR)) {
        finish(true);
        return;
      }
      // Only on a target page: the page the visitor clicked from may have a
      // card container of its own, which says nothing about the new page.
      if (!graceTimer && isOnTargetPath() && document.querySelector(CONTAINER_SELECTOR)) {
        graceTimer = setTimeout(() => finish(!!document.querySelector(TARGET_SELECTOR)), CONTAINER_GRACE_MS);
      }
    }

    check();
    if (window.__pmjCreateCardWatch !== watch) return;

    // Batches DOM changes into at most one check per frame.
    observer = new MutationObserver(() => {
      if (checkScheduled) return;
      checkScheduled = true;
      requestAnimationFrame(check);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    maxWaitTimer = setTimeout(() => finish(!!document.querySelector(TARGET_SELECTOR)), MAX_WAIT_MS);
  }

  function runFallback() {
    pendo.onGuideDismissed();
    setTimeout(() => {
      pendo.showGuideById(resourceGuideId);
      // Go to the no-access step as soon as the resource guide is active,
      // rather than after a fixed delay that may be too short or too long.
      const startTime = Date.now();
      (function waitForResourceGuide() {
        const fallbackGuide = pendo.getActiveGuide()?.guide;
        if (fallbackGuide?.id === resourceGuideId) {
          const fallbackStep = fallbackGuide.steps[noAccessStep - 1];
          if (fallbackStep) {
            pendo.goToStep({ destinationStepId: fallbackStep.id });
          }
          return;
        }
        if (Date.now() - startTime < FALLBACK_GUIDE_MAX_WAIT_MS) {
          setTimeout(waitForResourceGuide, 50);
        }
      })();
    }, 200);
  }

  if (isOnTargetPath()) {
    startWatching();
  }

  triggerSelectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      pendo.attachEvent(el, "click", startWatching);
      step.after("teardown", () => {
        pendo.detachEvent(el, "click", startWatching);
      });
    }
  });
})(pendo.dom, step);
