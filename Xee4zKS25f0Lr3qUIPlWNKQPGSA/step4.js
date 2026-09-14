(function enableNextOnSourceButton() {
 if (!pendo.designerEnabled) {
    var nextButtonSelector = "#pendo-button-7d837db7";
    var targetSelector = '[data-testid="sprout-cards-action-button-View source"]';
     var nextStepId = 'd3CjsP1p81T_zGviC9wUqQuFZ_E';

    // Pendo re-renders this step (re-running this script) as the page
    // changes around its target — e.g. each time a new element appears. Each
    // re-run used to disable Next again (flashing it enabled → disabled) and,
    // once View source existed, call goToStep again, so the step flickered
    // on every page change. State that must survive those re-runs lives on
    // window, for this page load:
    //   sourceSeen — View source has appeared at least once, so Next never
    //                needs disabling again.
    //   advanced   — goToStep has already been called once from this step;
    //                re-renders never auto-advance a second time (e.g. if the
    //                visitor comes back to this step with Back).
    var state = window.__pmjQlikExpStep4 || (window.__pmjQlikExpStep4 = { sourceSeen: false, advanced: false });

    function setNextDisabled(disabled) {
        var btn = document.querySelector(nextButtonSelector);
        if (!btn) {
            pendo.log(guide.id + ': WARNING - Next button not found with selector ' + nextButtonSelector);
            return;
        }
        if (btn.disabled !== disabled) btn.disabled = disabled;
    }

    function onSourceButtonFound() {
        state.sourceSeen = true;
        setNextDisabled(false);
        //console.log(guide.id + ': Next button re-enabled');
        if (!state.advanced) {
            state.advanced = true;
            pendo.goToStep({ destinationStepId: nextStepId });
        }
    }

    // 1. Already there (or seen earlier): enable Next straight away, without
    //    ever disabling it first.
    if (state.sourceSeen || document.querySelector(targetSelector)) {
       // console.log(guide.id + ': View source button already present');
        onSourceButtonFound();
        return;
    }

    // 2. Otherwise disable Next and watch for View source.
    setNextDisabled(true);
   // console.log(guide.id + ': Next button disabled, watching DOM for View source button');

    // Checks at most once per frame no matter how many DOM changes arrive,
    // rather than a querySelector on every single mutation batch.
    var checkScheduled = false;
    var observer = new MutationObserver(function () {
        if (checkScheduled) return;
        checkScheduled = true;
        requestAnimationFrame(function () {
            checkScheduled = false;
            if (document.querySelector(targetSelector)) {
                observer.disconnect();
                //console.log(guide.id + ': View source button appeared');
                onSourceButtonFound();
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Stop watching when this step goes away, so re-renders don't leave a
    // growing pile of observers each querying the page on every change.
    if (typeof step !== 'undefined' && step && typeof step.after === 'function') {
        step.after('teardown', function () {
            observer.disconnect();
        });
    }
 }
})();
