(function () {
  if (pendo.designerEnabled) return;

  // Ids specific to this step's own DOM.
  const GUIDE_CONTAINER_ID = 'pendo-guide-container-yD8Ga0j7tP2LQWVMs4s8BrILILQ';
  const ROOT_ID = 'pmj-shrunken-root';
  const LIST_ID = 'pendo-list-814928ee';

  function isStepCompleted(li) {
    const circleWrap = li.querySelector('.pendo-task-list-progress-circle');
    if (!circleWrap) return false;
    const svg = circleWrap.querySelector('svg');
    if (!svg) return false;
    return !!svg.querySelector('polyline');
  }

  // Read the checklist purely as a data source — it's hidden via CSS,
  // but a hidden element's text/attributes/children are still fully
  // queryable, exactly like step2.js's getStepsFromTaskList().
  function getSteps() {
    const list = document.getElementById(LIST_ID);
    if (!list) return [];
    return [...list.querySelectorAll('li')].map(li => ({
      guideId: li.getAttribute('data-pendo-show-guide-id'),
      completed: isStepCompleted(li)
    }));
  }

  function activeIndexOf(steps) {
    let activeIndex = -1;
    steps.forEach((step, i) => {
      if (!step.completed && activeIndex === -1) activeIndex = i;
    });
    return activeIndex === -1 ? steps.length - 1 : activeIndex;
  }

  function render() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    const bubblesEl = root.querySelector('[data-pmj="bubbles"]');
    const fillEl = root.querySelector('[data-pmj="progress-fill"]');
    const textEl = root.querySelector('[data-pmj="progress-text"]');

    const steps = getSteps();
    if (!steps.length) return;
    const activeIndex = activeIndexOf(steps);
    const completedCount = steps.filter(s => s.completed).length;

    if (bubblesEl) {
      bubblesEl.innerHTML = '';
      steps.forEach((step, i) => {
        const bubble = document.createElement('button');
        bubble.type = 'button';
        bubble.className = 'pmj-shrunken-bubble';
        if (step.completed) bubble.classList.add('is-completed');
        if (i === activeIndex) bubble.classList.add('is-active');
        bubble.setAttribute('aria-label', 'Step ' + (i + 1));
        bubble.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (step.guideId) pendo.showGuideById(step.guideId);
        });
        bubblesEl.appendChild(bubble);
      });
    }

    const percent = Math.round((completedCount / steps.length) * 100);
    if (fillEl) fillEl.style.width = percent + '%';
    if (textEl) textEl.textContent = percent + '%';
  }

  // The outer guide box carries a stale designer-time pixel height; force
  // it back to auto so it always fits this much shorter compact layout.
  function fixStepContainerHeight() {
    const stepContainer = document.getElementById(GUIDE_CONTAINER_ID)?.closest('._pendo-step-container-size');
    if (stepContainer) stepContainer.style.setProperty('height', 'auto', 'important');
  }

  function fullRender() {
    render();
    fixStepContainerHeight();
  }

  // Pendo can rebuild this step's DOM from its authored template on its
  // own (observed on window resize) — re-run whenever the guide's DOM
  // actually changes. Every call goes through renderProtected, which
  // disconnects the observer first so this script's own mutations don't
  // immediately re-trigger it.
  const observedRoot = document.getElementById(GUIDE_CONTAINER_ID)?.closest('._pendo-step-container-size') || document.body;
  let renderScheduled = false;

  function renderProtected() {
    observer.disconnect();
    fullRender();
    observer.observe(observedRoot, { childList: true, subtree: true });
  }

  const observer = new MutationObserver(() => {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      renderProtected();
    });
  });
  observer.observe(observedRoot, { childList: true, subtree: true });

  renderProtected();

  // ---------- Back to step 1 when a module guide is dismissed ----------
  // Launching any checklist module from step 1 collapses this embedded
  // guide to this step first. Once the visitor dismisses that module guide,
  // re-show the embedded guide, which starts it over at step 1.
  //
  // This Pendo agent has no pendo.Events to subscribe to guideDismissed, so
  // a dismiss is detected two ways (whichever fires first wins; the other
  // is ignored):
  //   1. pendo.onGuideDismissed — documented as "Hides the current guide
  //      and invokes the guideDismissed event" — is wrapped so we see every
  //      call to it before Pendo's own dismiss runs.
  //   2. A click on any ._pendo-close-guide button, as a backup in case
  //      Pendo dismisses through an internal reference that bypasses the
  //      public function.
  // Both are registered once per page, not once per run: Pendo re-runs
  // this script on every show, and stacked listeners would each re-show
  // the guide. So the handlers below read everything from the DOM/Pendo at
  // dismiss time instead of from any single run's state.
  const EMBEDDED_GUIDE_ID = 'qs5WkFBQ0jzlVQsLMKkLoSCEaxg';

  // The guide that's showing right now (still the one being dismissed, as
  // both detection paths run before Pendo's own dismiss does).
  function getActiveGuideId() {
    try {
      const active = pendo.getActiveGuide();
      if (!active) return null;
      return (active.guide && active.guide.id) || active.guideId || (active.step && active.step.guideId) || active.id || null;
    } catch (err) {
      return null;
    }
  }

  // Fallback for the close-button path: a guide's container id is
  // pendo-guide-container-<stepId>, so match that step id against each
  // checklist module guide's steps.
  function getModuleGuideIdForElement(el) {
    const container = el.closest('[id^="pendo-guide-container-"]');
    if (!container) return null;
    const stepId = container.id.replace('pendo-guide-container-', '');
    return getSteps().map(step => step.guideId).find(guideId => {
      const guide = pendo.findGuideById(guideId);
      return !!(guide && guide.steps && guide.steps.some(s => s.id === stepId));
    }) || null;
  }

  function handleGuideDismissed(guideId, via, raw) {
    // Only while this step is the one showing — i.e. the visitor got here by
    // launching a module from step 1.
    if (!document.getElementById(GUIDE_CONTAINER_ID)) return;
    if (!guideId) {
      console.log('shrunkenVersion: dismiss detected via', via, 'but no guide id found:', raw, 'active guide:', pendo.getActiveGuide && pendo.getActiveGuide());
      return;
    }
    const moduleGuideIds = getSteps().map(step => step.guideId);
    if (moduleGuideIds.indexOf(guideId) === -1) {
      console.log('shrunkenVersion: dismissed guide', guideId, 'via', via, 'is not a checklist module — ignoring');
      return;
    }
    if (window.__pmjShrunkenReshowScheduled) return;
    window.__pmjShrunkenReshowScheduled = true;
    console.log('shrunkenVersion: module guide dismissed', guideId, 'via', via, '— re-showing embedded guide', EMBEDDED_GUIDE_ID);
    // Deferred so Pendo finishes its own dismiss before the re-show.
    setTimeout(function () {
      window.__pmjShrunkenReshowScheduled = false;
      pendo.showGuideById(EMBEDDED_GUIDE_ID);
    }, 0);
  }

  if (typeof pendo.onGuideDismissed === 'function' && !pendo.onGuideDismissed.__pmjWrapped) {
    const originalOnGuideDismissed = pendo.onGuideDismissed;
    const wrappedOnGuideDismissed = function () {
      try {
        const arg = arguments[0];
        handleGuideDismissed((arg && arg.guideId) || getActiveGuideId(), 'onGuideDismissed', arg);
      } catch (err) {
        console.error('shrunkenVersion: dismiss handler failed:', err);
      }
      return originalOnGuideDismissed.apply(this, arguments);
    };
    wrappedOnGuideDismissed.__pmjWrapped = true;
    pendo.onGuideDismissed = wrappedOnGuideDismissed;
    console.log('shrunkenVersion: wrapped pendo.onGuideDismissed');
  }

  if (!window.__pmjShrunkenCloseListenerBound) {
    window.__pmjShrunkenCloseListenerBound = true;
    // Capture phase, so this runs before Pendo's own close handler hides the
    // guide (while it's still the active guide).
    document.addEventListener('click', function (e) {
      const closeButton = e.target.closest && e.target.closest('._pendo-close-guide');
      if (!closeButton) return;
      handleGuideDismissed(getModuleGuideIdForElement(closeButton) || getActiveGuideId(), 'close button', closeButton);
    }, true);
    console.log('shrunkenVersion: listening for ._pendo-close-guide clicks');
  }
})();
