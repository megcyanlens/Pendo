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
})();
