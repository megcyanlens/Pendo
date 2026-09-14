(function goToStepOnResponse() {
    if (!pendo.designerEnabled) {
        var desiredStepId = "Dza2yC6Xw7R5y4YvdICPzQQA-M8";
        var responseSelector = '#ua-chat-window';
        var actionButtonSelector = '[data-testid="UA-input-action-button"]';
        var textAreaSelector = '[data-testid="UA-input-text-area"]';
        var copyButtonSelector = '#pendo-button-d75ceb20';
        var hasTriggered = false;

        function pathMatchesSelector(e, selector) {
            var path = e.composedPath ? e.composedPath() : [];
            for (var i = 0; i < path.length; i++) {
                var el = path[i];
                if (el instanceof Element && el.matches && el.matches(selector)) {
                    return true;
                }
                // also check closest, in case matches() alone misses a nested match
                if (el instanceof Element && el.closest && el.closest(selector)) {
                    return true;
                }
            }
            return false;
        }

        function watchForResponse() {
            console.log('watchforresponse');
            if (hasTriggered) {
                console.log('watch already triggered, ignoring duplicate call');
                return;
            }
            hasTriggered = true;
            var existing = document.querySelector(responseSelector);
            if (existing) {
                console.log(guide.id + ': response content wrapper already present, advancing to step ' + desiredStepId);
                pendo.goToStep({ destinationStepId: desiredStepId });
                return;
            }
            console.log(guide.id + ': watching DOM for response content wrapper');
            var observer = new MutationObserver(function (mutations, obs) {
            
            setTimeout(function () {
                var el = document.querySelector(responseSelector);
                if (el) {
                    obs.disconnect();
                    console.log(guide.id + ': response box appeared, advancing to step ' + desiredStepId);
                    pendo.goToStep({ destinationStepId: desiredStepId });
                    }
                }, 500); // adjust delay as needed
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // --- Existing watch behavior: action button click / Enter key ---
        document.addEventListener('click', function onDocumentClick(e) {
            console.log('document click', e.target, e.composedPath ? e.composedPath() : 'no composedPath');
            if (pathMatchesSelector(e, actionButtonSelector)) {
                console.log('action button clicked, starting DOM watch for response');
                watchForResponse();
            }
        }, true);

        document.addEventListener('keydown', function onDocumentKeydown(e) {
           // console.log('keydown', e.key, e.target);
            if (e.key === 'Enter' && !e.shiftKey && pathMatchesSelector(e, textAreaSelector)) {
                console.log(guide.id + ': Enter key pressed in text area, starting DOM watch for response');
                watchForResponse();
            }
        }, true);

        // --- New: copy button behavior ---
        function copyButtonText(btn) {
            var textToCopy = (btn.textContent || '').trim();
            if (!textToCopy) {
                console.log(guide.id + ': copy button has no text content, nothing to copy');
                return;
            }

            navigator.clipboard.writeText(textToCopy).then(function () {
                pendo.log(guide.id + ': copied button text to clipboard: ' + textToCopy);
            }).catch(function (err) {
                console.log(guide.id + ': clipboard write failed, using fallback - ' + err);
                var textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    pendo.log(guide.id + ': copied via fallback method');
                } catch (e) {
                    pendo.log(guide.id + ': fallback copy also failed - ' + e);
                }
                document.body.removeChild(textarea);
            });
        }

        document.addEventListener('click', function onDocumentClickCopy(e) {
            var copyBtn = e.target.closest ? e.target.closest(copyButtonSelector) : null;
            if (copyBtn) {
                console.log(guide.id + ': copy button clicked');
                copyButtonText(copyBtn);
            }
        }, true);
    }
})();
