/* Pendo custom code block: JS tab
   Turns the "Customize messages for end-users" radio poll into multi-select toggles
   and writes the state of all three into the hidden open-text poll, so the Save
   button's poll submission records it, e.g.
   "Onboarding guides: On | New feature announcements: Off | Surveys and feedback: On" */
(function () {
  var CHOICE_POLL_ID = 'c9h0svnf0rs'; // multi-choice poll (the radios)
  var HIDDEN_POLL_ID = 'lexrb574p9e'; // open-text poll that stores the result
  var DEFAULT_ON = true;              // starting state of every toggle
  var SEPARATOR = ' | ';

  var root = document;
  try {
    if (typeof step !== 'undefined' && step && step.guideElement && step.guideElement[0]) {
      root = step.guideElement[0];
    }
  } catch (e) { /* fall back to document */ }

  function q(sel) { return root.querySelector(sel); }

  function init(attempt) {
    var group = q('div[role="group"] input.pendo-radio[data-pendo-poll-id="' + CHOICE_POLL_ID + '"]');
    var textarea = q('textarea[data-pendo-poll-id="' + HIDDEN_POLL_ID + '"]');
    if (!group || !textarea) {
      if (attempt < 20) setTimeout(function () { init(attempt + 1); }, 100);
      return;
    }
    group = group.closest('div[role="group"]');
    if (group.getAttribute('data-qt-toggles') === 'done') return;
    group.setAttribute('data-qt-toggles', 'done');

    var items = [];
    var inputs = group.querySelectorAll('input.pendo-radio[data-pendo-poll-id="' + CHOICE_POLL_ID + '"]');

    Array.prototype.forEach.call(inputs, function (input) {
      var row = input.parentNode;
      var label = row.querySelector('label[for="' + input.id + '"]');
      var fullText = label ? label.textContent.trim() : input.value;
      var name = fullText.split(':')[0].trim();

      // Keep the native radio out of the way: unchecked, hidden, not focusable.
      input.checked = false;
      input.tabIndex = -1;
      input.setAttribute('aria-hidden', 'true');
      input.className += ' qt-hidden-native';

      var sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'qt-switch';
      sw.setAttribute('role', 'switch');
      sw.setAttribute('aria-checked', String(DEFAULT_ON));
      if (label) {
        label.id = label.id || ('qt-label-' + input.value);
        sw.setAttribute('aria-labelledby', label.id);
        label.removeAttribute('for'); // stop the label from selecting the radio
        label.addEventListener('click', function (e) {
          e.preventDefault();
          toggle(sw);
        });
      } else {
        sw.setAttribute('aria-label', name);
      }
      sw.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggle(sw);
      });

      row.className += ' qt-toggle-row';
      row.insertBefore(sw, row.firstChild);
      items.push({ name: name, sw: sw });
    });

    function toggle(sw) {
      sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
      writeState();
    }

    function writeState() {
      textarea.value = items.map(function (it) {
        return it.name + ': ' + (it.sw.getAttribute('aria-checked') === 'true' ? 'On' : 'Off');
      }).join(SEPARATOR);
      ['input', 'change'].forEach(function (type) {
        var ev;
        try { ev = new Event(type, { bubbles: true }); } catch (e) {
          ev = document.createEvent('Event'); ev.initEvent(type, true, true);
        }
        textarea.dispatchEvent(ev);
      });
    }

    // Hide the hidden poll's rows so they take no space.
    var question = q('._pendo-open-text-poll-question[data-pendo-poll-id="' + HIDDEN_POLL_ID + '"]');
    [question, textarea.closest('._pendo-row')].forEach(function (el) {
      if (el) el.style.setProperty('display', 'none', 'important');
    });

    writeState();
    relayout(group);
  }

  // Pendo lays rows out with absolute positioning and fixed min-heights,
  // so resize the toggle row and the guide after the DOM changes.
  function relayout(group) {
    var mockRow = group.closest('.pendo-mock-flexbox-row');
    if (mockRow) mockRow.style.minHeight = group.offsetHeight + 'px';

    var recalculated = false;
    try {
      var containerId = (typeof step !== 'undefined' && step && step.containerId) ||
        (root.querySelector('[id^="pendo-guide-container-"]') || {}).id;
      var bbg = window.pendo && pendo.BuildingBlocks && pendo.BuildingBlocks.BuildingBlockGuides;
      if (bbg && bbg.recalculateGuideHeight && containerId) {
        bbg.recalculateGuideHeight(containerId);
        recalculated = true;
      }
    } catch (e) { /* fall through to manual sizing */ }

    if (!recalculated) {
      var size = root.querySelector('._pendo-step-container-size');
      if (size) size.style.height = 'auto';
    }
  }

  init(0);
})();
