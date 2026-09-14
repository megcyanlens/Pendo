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
        var hasAdvanced = false;
        var settleDelayMs = 800; // how long the element must remain present before we advance
        // goToStep can silently do nothing if Pendo isn't able to show the
        // destination step at that moment, which used to leave the visitor
        // stuck until they pressed Enter again. So each advance is verified,
        // and retried a couple of times if the destination step isn't showing.
        var advanceVerifyMs = 700;
        var maxAdvanceAttempts = 3;

        // The document listeners and setup polling are tracked here and removed
        // when the step is torn down. Otherwise every re-show of this step
        // stacked another full set, and stale ones could still start a watch
        // and call goToStep after the guide had moved on.
        //
        // A watch that's already in progress (response observer + settle
        // timer) is deliberately NOT cancelled on teardown: if Pendo re-renders
        // this step while the response is loading, the fresh copy of this
        // script only reacts to a new send, so cancelling would leave the
        // visitor needing to press Enter again. Duplicate advances from an old
        // and a new copy are prevented by the page-level guard in advance().
        var cleanups = [];
        function onCleanup(fn) { cleanups.push(fn); }
        if (typeof step !== 'undefined' && step && typeof step.after === 'function') {
            step.after('teardown', function () {
                cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
                cleanups = [];
            });
        }
        var ADVANCE_GUARD_MS = 5000;

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
            onCleanup(function () { clearInterval(interval); });
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
            onCleanup(function () { clearInterval(interval); });
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

        function getDestinationStep() {
            try {
                var currentGuide = pendo.findGuideById(guide.id);
                var steps = (currentGuide && currentGuide.steps) || [];
                for (var i = 0; i < steps.length; i++) {
                    if (steps[i].id === desiredStepId) return steps[i];
                }
            } catch (e) { /* fall through */ }
            return null;
        }

        // Calls goToStep, then checks the destination step actually showed.
        // Not tied to this step's teardown: a successful goToStep tears this
        // step down, and a failed one might too — the check is what tells
        // the two apart. Retries stop as soon as the destination is showing.
        function advance(attempt) {
            if (attempt === 1) {
                // Page-level, so an old copy of this script (whose watch
                // outlived a teardown) and a new one can't both advance.
                var lastAdvance = window.__pmjStep12AdvancedAt || 0;
                if (Date.now() - lastAdvance < ADVANCE_GUARD_MS) {
                    console.log('already advancing from another copy of this step, skipping');
                    hasAdvanced = true;
                    return;
                }
                window.__pmjStep12AdvancedAt = Date.now();
            }
            hasAdvanced = true;
            console.log('advancing to step ' + desiredStepId + ' (attempt ' + attempt + ')');
            pendo.goToStep({ destinationStepId: desiredStepId });
            setTimeout(function () {
                var destination = getDestinationStep();
                if (!destination || typeof destination.isShown !== 'function') return;
                if (destination.isShown()) {
                    console.log('destination step is showing');
                    return;
                }
                if (attempt < maxAdvanceAttempts) {
                    pendo.log(guide.id + ': destination step not showing after goToStep, retrying');
                    console.log('destination step not showing yet, retrying goToStep');
                    advance(attempt + 1);
                } else {
                    pendo.log(guide.id + ': ERROR - destination step still not showing after ' + attempt + ' goToStep attempts');
                }
            }, advanceVerifyMs);
        }

        function confirmAndAdvance() {
            console.log('confirm and advance');
            setTimeout(function () {
                if (hasAdvanced) return;
                var el = document.querySelector(responseSelector);
                if (el) {
                    pendo.log(guide.id + ': response wrapper stable after ' + settleDelayMs + 'ms, advancing to step ' + desiredStepId);
                    console.log('stable, go to designated step');
                    advance(1);
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
            if (hasAdvanced) return;
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

        function listen(type, handler) {
            document.addEventListener(type, handler, true);
            onCleanup(function () { document.removeEventListener(type, handler, true); });
        }

        function attachListeners() {
            listen('click', function onDocumentClick(e) {
                if (pathMatchesSelector(e, actionButtonSelector)) {
                    watchForResponse();
                }
            });

            listen('keydown', function onDocumentKeydown(e) {
                // isComposing: Enter that confirms an IME composition (e.g.
                // Japanese/Chinese input) doesn't send the message.
                if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && pathMatchesSelector(e, textAreaSelector)) {
                    pendo.log(guide.id + ': Enter key pressed in text area, starting DOM watch for response');
                    watchForResponse();
                }
            });

            listen('click', function onDocumentClickCopy(e) {
                var copyBtn = e.target.closest ? e.target.closest(copyButtonSelector) : null;
                if (copyBtn) {
                    copyButtonText(copyBtn);
                }
            });
        }

        // Listen for send (click/Enter) right away. These used to be attached
        // only after the whole agent/assistant selection sequence below had
        // finished (several polled waits), so an Enter pressed before then
        // was never seen — the visitor had to press Enter a second time.
        attachListeners();

        // --- Setup sequence: open agent selector, pick "assistant", pick the specific assistant ---
        waitForElement('[data-testid="ua-agent-selector"]', function (el) {
            if (!el) { return; } // listeners are already attached; nothing more to set up
            el.click();
            pendo.log(guide.id + ': clicked agent selector');
            //console.log('clicked agent selector');
            waitForElement('[data-testid="ua-agent-selector-assistant"] > button', function (el2) {
                if (!el2) { return; }
                el2.click();
                pendo.log(guide.id + ': clicked assistant option');

                waitForAssistantButton('[data-testid="sprout-floating"]', assistantName, function (el3) {
                    if (!el3) { return; }
                    el3.click();
                    pendo.log(guide.id + ': clicked assistant selection button - ' + assistantName);
                });
            });
        });
    }
})();
