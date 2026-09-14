(function enableNextOnSourceButton() {
 if (!pendo.designerEnabled) {
    var nextButtonSelector = "#pendo-button-7d837db7";
    var targetSelector = '[data-testid="sprout-cards-action-button-View source"]';
    var nextButton = document.querySelector(nextButtonSelector);
     var nextStepId = 'd3CjsP1p81T_zGviC9wUqQuFZ_E';

    // 1. Disable Next immediately
    if (nextButton) {
        nextButton.disabled = true;
       // console.log(guide.id + ': Next button disabled, watching for View source button');
    } else {
        pendo.log(guide.id + ': WARNING - Next button not found with selector ' + nextButtonSelector);
    }

    function reEnableNextButton() {
        var btn = document.querySelector(nextButtonSelector);
        if (btn) {
            btn.disabled = false;
            pendo.goToStep({destinationStepId: nextStepId})
            //console.log(guide.id + ': Next button re-enabled');
        }
    }

    // 2. Check immediately in case it's already present
    var existing = document.querySelector(targetSelector);
    if (existing) {
       // console.log(guide.id + ': View source button already present');
        reEnableNextButton();
    } else {
       // console.log(guide.id + ': watching DOM for View source button');

        var observer = new MutationObserver(function (mutations, obs) {
            var el = document.querySelector(targetSelector);
            if (el) {
                obs.disconnect();
                //console.log(guide.id + ': View source button appeared');
                reEnableNextButton();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
 }
})();
