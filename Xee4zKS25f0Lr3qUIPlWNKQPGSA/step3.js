(function goToStepOnResponse() {
    if (!pendo.designerEnabled) {
        var desiredStepId = "Dza2yC6Xw7R5y4YvdICPzQQA-M8";
        // The response itself. (This used to be '#ua-chat-window' — the chat
        // window, which already exists when the visitor sends, so step 3
        // called goToStep immediately, before step 4's target existed. Pendo
        // can't show a step whose target isn't on the page, so that call
        // silently did nothing and step 3 never tried again.)
        var responseSelector = '[data-testid="response-content-wrapper"]';
        var actionButtonSelector = '[data-testid="UA-input-action-button"]';
        var textAreaSelector = '[data-testid="UA-input-text-area"]';
        var copyButtonSelector = '#pendo-button-d75ceb20';
        var hasTriggered = false;
        // goToStep is verified (the destination step must actually be showing)
        // and retried, in case step 4's target renders a moment after the
        // response wrapper does.
        var advanceVerifyMs = 500;
        var maxAdvanceAttempts = 6;
        var ADVANCE_GUARD_MS = 5000;

        // Document listeners are removed when this step is torn down —
        // otherwise they stayed on the page for the rest of the guide, and an
        // Enter in the same text area on a later step (e.g. step 12) could
        // send the guide back to step 4. A response watch that's already in
        // progress is left to finish, so a Pendo re-render mid-response
        // doesn't lose the advance; the page-level guard in advance() stops
        // two copies of this script from both advancing.
        var cleanups = [];
        if (typeof step !== 'undefined' && step && typeof step.after === 'function') {
            step.after('teardown', function () {
                cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
                cleanups = [];
            });
        }
        function listen(type, handler) {
            document.addEventListener(type, handler, true);
            cleanups.push(function () { document.removeEventListener(type, handler, true); });
        }

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

        function advance(attempt) {
            if (attempt === 1) {
                var lastAdvance = window.__pmjQlikExpStep3AdvancedAt || 0;
                if (Date.now() - lastAdvance < ADVANCE_GUARD_MS) {
                    console.log('already advancing from another copy of this step, skipping');
                    return;
                }
                window.__pmjQlikExpStep3AdvancedAt = Date.now();
            }
            console.log(guide.id + ': advancing to step ' + desiredStepId + ' (attempt ' + attempt + ')');
            pendo.goToStep({ destinationStepId: desiredStepId });
            setTimeout(function () {
                var destination = getDestinationStep();
                if (!destination || typeof destination.isShown !== 'function') return;
                if (destination.isShown()) return;
                if (attempt < maxAdvanceAttempts) {
                    console.log(guide.id + ': step 4 not showing yet (its target may still be rendering), retrying');
                    advance(attempt + 1);
                } else {
                    pendo.log(guide.id + ': ERROR - step ' + desiredStepId + ' still not showing after ' + attempt + ' goToStep attempts');
                }
            }, advanceVerifyMs);
        }

        function watchForResponse() {
            console.log('watchforresponse');
            if (hasTriggered) {
                console.log('watch already triggered, ignoring duplicate call');
                return;
            }
            hasTriggered = true;
            if (document.querySelector(responseSelector)) {
                console.log(guide.id + ': response content wrapper already present, advancing to step ' + desiredStepId);
                advance(1);
                return;
            }
            console.log(guide.id + ': watching DOM for response content wrapper');
            // One check per frame at most — previously every DOM change during
            // the response scheduled its own 500ms timer, and each of them
            // called goToStep once the wrapper existed.
            var checkScheduled = false;
            var observer = new MutationObserver(function () {
                if (checkScheduled) return;
                checkScheduled = true;
                requestAnimationFrame(function () {
                    checkScheduled = false;
                    if (document.querySelector(responseSelector)) {
                        observer.disconnect();
                        console.log(guide.id + ': response box appeared, advancing to step ' + desiredStepId);
                        advance(1);
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // --- Existing watch behavior: action button click / Enter key ---
        listen('click', function onDocumentClick(e) {
            if (pathMatchesSelector(e, actionButtonSelector)) {
                console.log('action button clicked, starting DOM watch for response');
                watchForResponse();
            }
        });

        listen('keydown', function onDocumentKeydown(e) {
           // console.log('keydown', e.key, e.target);
            // isComposing: Enter that confirms an IME composition doesn't send.
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && pathMatchesSelector(e, textAreaSelector)) {
                console.log(guide.id + ': Enter key pressed in text area, starting DOM watch for response');
                watchForResponse();
            }
        });

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

        listen('click', function onDocumentClickCopy(e) {
            var copyBtn = e.target.closest ? e.target.closest(copyButtonSelector) : null;
            if (copyBtn) {
                console.log(guide.id + ': copy button clicked');
                copyButtonText(copyBtn);
            }
        });
    }
})();
