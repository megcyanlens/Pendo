(function goToStepOnResponse() {
    if (!pendo.designerEnabled) {
     //   console.log('step 12 guide code starting');
        var desiredStepId = "WMgvsJy4jDQKCORaJcgIG6dwO4M";
        var responseSelector = '[data-testid="response-content-wrapper"]';
        var actionButtonSelector = '[data-testid="UA-input-action-button"]';
        var textAreaSelector = '[data-testid="UA-input-text-area"]';
        var copyButtonSelector = '#pendo-button-0e93bea8';
        var assistantName = 'Spark Electronics Assistant';
        var hasTriggered = false;
        var settleDelayMs = 800; // how long the element must remain present before we advance

        // --- Helpers: wait for elements (by selector or by text match) ---
        function waitForElement(selector, callback, timeoutMs) {
            var timeout = timeoutMs || 5000;
            var intervalMs = 100;
            var elapsed = 0;
            var interval = setInterval(function () {
                var el = document.querySelector(selector);
                if (el) {
                    clearInterval(interval);
                    callback(el);
                } else {
                    elapsed += intervalMs;
                    if (elapsed >= timeout) {
                        clearInterval(interval);
                        pendo.log(guide.id + ': ERROR - element not found in time: ' + selector);
                        callback(null);
                    }
                }
            }, intervalMs);
        }

        function findButtonByAssistantName(containerSelector, name) {
         //   console.log(findButtonByAssistantName);
            var container = document.querySelector(containerSelector);
            if (!container) return null;

            var items = container.querySelectorAll('li');
            for (var i = 0; i < items.length; i++) {
                if (items[i].textContent.toLowerCase().indexOf(name.toLowerCase()) !== -1) {
                    var btn = items[i].querySelector('button');
                    if (btn) return btn;
                }
            }
            return null;
        }

        function waitForAssistantButton(containerSelector, name, callback, timeoutMs) {
            var timeout = timeoutMs || 5000;
            var intervalMs = 100;
            var elapsed = 0;
            var interval = setInterval(function () {
                var btn = findButtonByAssistantName(containerSelector, name);
                if (btn) {
                    clearInterval(interval);
                    callback(btn);
                } else {
                    elapsed += intervalMs;
                    if (elapsed >= timeout) {
                        clearInterval(interval);
                        pendo.log(guide.id + ': ERROR - assistant button not found in time for "' + name + '"');
                        callback(null);
                    }
                }
            }, intervalMs);
        }

        function pathMatchesSelector(e, selector) {
            var path = e.composedPath ? e.composedPath() : [];
            for (var i = 0; i < path.length; i++) {
                var el = path[i];
                if (el instanceof Element && el.matches && el.matches(selector)) return true;
                if (el instanceof Element && el.closest && el.closest(selector)) return true;
            }
            return false;
        }

        function confirmAndAdvance() {
            console.log('confirm and advance');
            setTimeout(function () {
                var el = document.querySelector(responseSelector);
                if (el) {
                    pendo.log(guide.id + ': response wrapper stable after ' + settleDelayMs + 'ms, advancing to step ' + desiredStepId);
                    console.log('stable, go to designated step');
                    pendo.goToStep({ destinationStepId: desiredStepId });
                } else {
                    console.log('instable and disappeared,hold on again');
                    pendo.log(guide.id + ': response wrapper disappeared before settling, resetting watch');
                    hasTriggered = false;
                    watchForResponse();
                }
            }, settleDelayMs);
        }

        function watchForResponse() {
                console.log('watch for response code started');
            if (hasTriggered) {
                pendo.log('watch already triggered, ignoring duplicate call');
                console.log('watch already triggered');
                return;
            }
            hasTriggered = true;

            var existing = document.querySelector(responseSelector);
                    console.log('existing', existing);
            if (existing) {
                pendo.log(guide.id + ': response content wrapper already present, confirming stability');
                confirmAndAdvance();
                return;
            }

            pendo.log(guide.id + ': watching DOM for response content wrapper');
            console.log('watching dom for response content wrapper to appear');
            var observer = new MutationObserver(function (mutations, obs) {
                var el = document.querySelector(responseSelector);
                if (el) {
                    obs.disconnect();
                    pendo.log(guide.id + ': response content wrapper appeared, confirming stability');
                    console.log('esponse content wrapper appeared, confirming stability');

                    confirmAndAdvance();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        function copyButtonText(btn) {
            var textToCopy = (btn.textContent || '').trim();
            if (!textToCopy) {
                pendo.log(guide.id + ': copy button has no text content, nothing to copy');
                return;
            }

            navigator.clipboard.writeText(textToCopy).then(function () {
                pendo.log(guide.id + ': copied button text to clipboard: ' + textToCopy);
            }).catch(function (err) {
                pendo.log(guide.id + ': clipboard write failed, using fallback - ' + err);
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

        function attachListeners() {
            document.addEventListener('click', function onDocumentClick(e) {
                if (pathMatchesSelector(e, actionButtonSelector)) {
                    watchForResponse();
                }
            }, true);

            document.addEventListener('keydown', function onDocumentKeydown(e) {
                if (e.key === 'Enter' && !e.shiftKey && pathMatchesSelector(e, textAreaSelector)) {
                    pendo.log(guide.id + ': Enter key pressed in text area, starting DOM watch for response');
                    watchForResponse();
                }
            }, true);

            document.addEventListener('click', function onDocumentClickCopy(e) {
                var copyBtn = e.target.closest ? e.target.closest(copyButtonSelector) : null;
                if (copyBtn) {
                    copyButtonText(copyBtn);
                }
            }, true);
        }

        // --- Setup sequence: open agent selector, pick "assistant", pick the specific assistant ---
        waitForElement('[data-testid="ua-agent-selector"]', function (el) {
            if (!el) { return attachListeners(); } // proceed anyway rather than block forever
            el.click();
            pendo.log(guide.id + ': clicked agent selector');
            //console.log('clicked agent selector');
            waitForElement('[data-testid="ua-agent-selector-assistant"] > button', function (el2) {
                if (!el2) { return attachListeners(); }
                el2.click();
                pendo.log(guide.id + ': clicked assistant option');

                waitForAssistantButton('[data-testid="sprout-floating"]', assistantName, function (el3) {
                    if (!el3) { return attachListeners(); }
                    el3.click();
                    pendo.log(guide.id + ': clicked assistant selection button - ' + assistantName);
                    attachListeners();
                });
            });
        });
    }
})();
