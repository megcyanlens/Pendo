/* Pendo code block: JS tab
   Writes the value of every dropdown into the open-text poll, so the Save
   button's poll submission records it, e.g.
   "Onboarding guides: Allowed | New feature announcements: Not allowed | Surveys and feedback: Allowed" */
(function () {
  var HIDDEN_POLL_ID = '6r0jeqmk6xd'; // open-text poll that stores the result
  var SHOW_HIDDEN_POLL = true;        // true while testing; set to false before launch
  var SEPARATOR = ' | ';

  var root = document;
  try {
    if (typeof step !== 'undefined' && step && step.guideElement && step.guideElement[0]) {
      root = step.guideElement[0];
    }
  } catch (e) { /* fall back to document */ }

  function init(attempt) {
    var list = root.querySelector('.qs-list');
    // Use the poll ID, or the guide's only open-text poll if the ID has changed.
    var textarea = root.querySelector('textarea[data-pendo-poll-id="' + HIDDEN_POLL_ID + '"]') ||
      root.querySelector('textarea._pendo-open-text-poll-input');
    if (!list || !textarea) {
      if (attempt < 20) setTimeout(function () { init(attempt + 1); }, 100);
      return;
    }
    if (list.getAttribute('data-qs-ready') === 'true') return;
    list.setAttribute('data-qs-ready', 'true');

    var selects = Array.prototype.slice.call(list.querySelectorAll('.qs-select'));
    selects.forEach(function (sel) {
      sel.addEventListener('change', writeState);
    });

    function writeState() {
      textarea.value = selects.map(function (sel) {
        return sel.getAttribute('data-name') + ': ' + sel.value;
      }).join(SEPARATOR);
      ['input', 'change'].forEach(function (type) {
        var ev;
        try { ev = new Event(type, { bubbles: true }); } catch (e) {
          ev = document.createEvent('Event'); ev.initEvent(type, true, true);
        }
        textarea.dispatchEvent(ev);
      });
    }

    if (!SHOW_HIDDEN_POLL) {
      var pollId = textarea.getAttribute('data-pendo-poll-id');
      var question = root.querySelector('._pendo-open-text-poll-question[data-pendo-poll-id="' + pollId + '"]');
      [question, textarea.closest('._pendo-row')].forEach(function (el) {
        if (el) el.style.setProperty('display', 'none', 'important');
      });
    }

    writeState();
    relayout();
  }

  // Resize the guide to fit after the DOM changes.
  function relayout() {
    try {
      var containerId = (typeof step !== 'undefined' && step && step.containerId) ||
        (root.querySelector('[id^="pendo-guide-container-"]') || {}).id;
      var bbg = window.pendo && pendo.BuildingBlocks && pendo.BuildingBlocks.BuildingBlockGuides;
      if (bbg && bbg.recalculateGuideHeight && containerId) {
        bbg.recalculateGuideHeight(containerId);
        return;
      }
    } catch (e) { /* fall through to manual sizing */ }
    var size = root.querySelector('._pendo-step-container-size');
    if (size) size.style.height = 'auto';
  }

  init(0);
})();
