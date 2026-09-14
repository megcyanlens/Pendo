(function advanceOrFallbackOnClick(dom, step) {
  if (!step) return;
  const triggerSelectors = [
    '[data-testid="nav-menu.analytics_creation.create"]',
    '[data-testid="nav-menu.analytics_creation.visualize_analyze_home"]'
  ];
  const resourceGuideId = "7mL_jI1_v1Niv4OINB90_c_nZRE";
  const noAccessStep = 2;
  const cardStepId = "vD8s3dtxR2mfD2_-XQsPADie_5k";
  const targetPaths = ['/analytics/create', '/analytics/visualize'];
  const TARGET_SELECTOR =
    '[data-testid="content-and-collaboration-group-items"] #add-new-menu-item-create, ' +
    '[data-testid="minihome-cards-container"] > #add-new-menu-item-create';
  const checkInterval = 300;
  const maxWaitTime = 5000;

  function goToCardStep() {
    pendo.goToStep({ destinationStepId: cardStepId });
  }

  function isOnTargetPath() {
    return targetPaths.some((path) => window.location.pathname.indexOf(path) !== -1);
  }

  function waitForCards(callback) {
    const startTime = Date.now();
    function check() {
      const cardEls = document.querySelectorAll(".MuiPaper-root");
      if (cardEls.length > 0) {
        callback(true);
        return;
      }
      if (Date.now() - startTime < maxWaitTime) {
        setTimeout(check, checkInterval);
      } else {
        callback(false);
      }
    }
    check();
  }

  function checkTargetSelector(callback) {
    const matchedEls = document.querySelectorAll(TARGET_SELECTOR);
    if (matchedEls.length > 0) {
      callback(true);
      return;
    }
    setTimeout(() => {
      const retryEls = document.querySelectorAll(TARGET_SELECTOR);
      callback(retryEls.length > 0);
    }, 1000);
  }

  function runFallback() {
    pendo.onGuideDismissed();
    setTimeout(() => {
      pendo.showGuideById(resourceGuideId);
      setTimeout(() => {
        const fallbackGuide = pendo.getActiveGuide()?.guide;
        if (fallbackGuide?.id === resourceGuideId) {
          const fallbackStep = fallbackGuide.steps[noAccessStep - 1];
          if (fallbackStep) {
            pendo.goToStep({ destinationStepId: fallbackStep.id });
          }
        }
      }, 400);
    }, 200);
  }

  function waitForCardsThenCheckTarget() {
    waitForCards((cardsFound) => {
      if (!cardsFound) {
        runFallback();
        return;
      }
      checkTargetSelector((targetFound) => {
        if (targetFound) {
          goToCardStep();
        } else {
          runFallback();
        }
      });
    });
  }

  function handleClick() {
    waitForCardsThenCheckTarget();
  }

  if (isOnTargetPath()) {
    waitForCardsThenCheckTarget();
  }

  triggerSelectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      pendo.attachEvent(el, "click", handleClick);
      step.after("teardown", () => {
        pendo.detachEvent(el, "click", handleClick);
      });
    }
  });
})(pendo.dom, step);
