/* Pendo code block: JS tab
   Turns each <select> from the HTML tab into a Qlik-style dropdown (checkmark on
   the selected option) and writes every value into the open-text poll, so the
   Save button's poll submission records it, e.g.
   "Onboarding guides: Allowed | New feature announcements: Not allowed | Surveys and feedback: Allowed" */
(function () {
  var HIDDEN_POLL_ID = '6r0jeqmk6xd'; // open-text poll that stores the result
  var HEADER_ROW_ID = 'pendo-row-5124e943';      // "Notifications & messaging" row
  var HEADER_BUTTON_ID = 'pendo-button-fa1ae14b'; // chevron button in that row
  var START_EXPANDED = false;         // false = the step opens minimized
  var ANIMATION_MS = 220;             // minimize / expand animation length (0 = none)
  var SHOW_HIDDEN_POLL = true;        // true while testing; set to false before launch
  var SEPARATOR = ' | ';

  var root = document;
  try {
    if (typeof step !== 'undefined' && step && step.guideElement && step.guideElement[0]) {
      root = step.guideElement[0];
    }
  } catch (e) { /* fall back to document */ }

  var openDropdown = null;

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

    var selects = Array.prototype.slice.call(list.querySelectorAll('select.qs-select'));
    selects.forEach(function (sel, i) { buildDropdown(sel, i, writeState); });

    // Close an open menu when clicking anywhere else.
    document.addEventListener('mousedown', function (e) {
      if (openDropdown && !openDropdown.wrap.contains(e.target)) openDropdown.close(false);
    }, true);

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

    // The hidden poll's question and textarea row stay hidden unless SHOW_HIDDEN_POLL.
    var pollId = textarea.getAttribute('data-pendo-poll-id');
    var pollParts = [
      root.querySelector('._pendo-open-text-poll-question[data-pendo-poll-id="' + pollId + '"]'),
      textarea.closest('._pendo-row')
    ].filter(Boolean);

    writeState();
    setupAccordion(pollParts);
  }

  // Minimized / expanded states. The header row (and its chevron button) toggles
  // everything below it: the permission rows, the hidden poll and Save.
  function setupAccordion(pollParts) {
    var headerRow = root.querySelector('#' + HEADER_ROW_ID);
    if (!headerRow) {
      relayout();
      return;
    }
    var headerButton = root.querySelector('#' + HEADER_BUTTON_ID);
    var body = Array.prototype.filter.call(headerRow.parentNode.children, function (el) {
      return el !== headerRow && (headerRow.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    var expanded = START_EXPANDED;

    if (headerButton) {
      headerButton.textContent = '';
      var chevron = document.createElement('span');
      chevron.className = 'qs-header-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      headerButton.appendChild(chevron);
      headerButton.classList.add('qs-header-button');
    }
    headerRow.classList.add('qs-header-row');

    function showBody(show) {
      body.forEach(function (el) {
        var hide = !show || (!SHOW_HIDDEN_POLL && pollParts.indexOf(el) !== -1);
        if (hide) el.style.setProperty('display', 'none', 'important');
        else el.style.setProperty('display', 'block');
      });
    }

    function render() {
      headerRow.classList.toggle('qs-expanded', expanded);
      if (headerButton) {
        headerButton.setAttribute('aria-expanded', String(expanded));
        headerButton.setAttribute('aria-label', expanded ? 'Minimize' : 'Expand');
      }
      if (!expanded && openDropdown) openDropdown.close(false);
    }

    // The box whose height animates: Pendo's step size container.
    var box = root.querySelector('._pendo-step-container-size') || headerRow.parentNode;
    var animating = null;

    function animateTo(show) {
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Start from the height on screen now, even if a previous animation is mid-way.
      var from = box.getBoundingClientRect().height;
      if (animating) animating.finish();
      // Measure the end height without painting: lay out the end state, then put it back.
      showBody(show);
      relayout();
      var to = box.getBoundingClientRect().height;

      if (reduceMotion || ANIMATION_MS <= 0 || Math.abs(to - from) < 1) {
        render();
        return;
      }

      // While closing, keep the rows visible until the box has shrunk.
      if (!show) showBody(true);
      render();

      var endHeight = box.style.getPropertyValue('height');
      var endPriority = box.style.getPropertyPriority('height');
      box.style.setProperty('overflow', 'hidden', 'important');
      box.style.setProperty('height', from + 'px', 'important');
      void box.offsetHeight; // start from the old height
      box.style.setProperty('transition', 'height ' + ANIMATION_MS + 'ms ease', 'important');
      box.style.setProperty('height', to + 'px', 'important');

      var timer;
      function finish() {
        clearTimeout(timer);
        box.removeEventListener('transitionend', onEnd);
        box.style.removeProperty('transition');
        box.style.removeProperty('overflow');
        if (endHeight) box.style.setProperty('height', endHeight, endPriority);
        else box.style.removeProperty('height');
        if (!show) showBody(false);
        relayout();
        animating = null;
      }
      function onEnd(e) { if (e.target === box && e.propertyName === 'height') finish(); }
      box.addEventListener('transitionend', onEnd);
      timer = setTimeout(finish, ANIMATION_MS + 100); // in case transitionend doesn't fire
      animating = { finish: finish };
    }

    // Capture phase, so the click is handled here and never reaches the button's
    // own Pendo action (which would leave the step).
    headerRow.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      expanded = !expanded;
      animateTo(expanded);
    }, true);

    showBody(expanded);
    render();
    relayout();
  }

  // Build a button + listbox in place of a native <select>. The <select> stays
  // in the DOM (hidden) and keeps the current value.
  function buildDropdown(sel, index, onChange) {
    var menuId = 'qs-menu-' + index;
    var wrap = document.createElement('div');
    wrap.className = 'qs-dropdown';

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'qs-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', menuId);
    ['aria-labelledby', 'aria-describedby'].forEach(function (a) {
      if (sel.getAttribute(a)) trigger.setAttribute(a, sel.getAttribute(a));
    });
    var valueEl = document.createElement('span');
    valueEl.className = 'qs-trigger-value';
    var chevron = document.createElement('span');
    chevron.className = 'qs-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.appendChild(valueEl);
    trigger.appendChild(chevron);

    var menu = document.createElement('ul');
    menu.className = 'qs-menu';
    menu.id = menuId;
    menu.setAttribute('role', 'listbox');
    menu.tabIndex = -1;
    if (sel.getAttribute('aria-labelledby')) menu.setAttribute('aria-labelledby', sel.getAttribute('aria-labelledby'));
    menu.hidden = true;

    var items = Array.prototype.map.call(sel.options, function (opt, i) {
      var li = document.createElement('li');
      li.className = 'qs-option';
      li.id = menuId + '-opt-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', opt.value);
      li.textContent = opt.text;
      li.addEventListener('mousedown', function (e) { e.preventDefault(); });
      li.addEventListener('click', function () { choose(i); });
      li.addEventListener('mousemove', function () { setActive(i); });
      menu.appendChild(li);
      return li;
    });

    var active = sel.selectedIndex;

    function render() {
      valueEl.textContent = sel.options[sel.selectedIndex].text;
      items.forEach(function (li, i) {
        li.setAttribute('aria-selected', String(i === sel.selectedIndex));
      });
    }

    function setActive(i) {
      active = i;
      items.forEach(function (li, j) { li.classList.toggle('qs-active', j === i); });
      menu.setAttribute('aria-activedescendant', items[i].id);
    }

    function open() {
      if (openDropdown && openDropdown !== api) openDropdown.close(false);
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      wrap.classList.add('qs-open');
      setActive(sel.selectedIndex);
      menu.focus();
      openDropdown = api;
    }

    function close(returnFocus) {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('qs-open');
      if (openDropdown === api) openDropdown = null;
      if (returnFocus) trigger.focus();
    }

    function choose(i) {
      var changed = sel.selectedIndex !== i;
      sel.selectedIndex = i;
      render();
      close(true);
      if (changed) onChange();
    }

    trigger.addEventListener('click', function () {
      if (menu.hidden) open(); else close(true);
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        open();
      }
    });
    menu.addEventListener('keydown', function (e) {
      var last = items.length - 1;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, last)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(last); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === 'Tab') { close(false); }
    });

    var api = { wrap: wrap, close: close };

    sel.classList.add('qs-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    wrap.appendChild(sel);
    render();
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
    if (size) size.style.setProperty('height', 'auto', 'important');
  }

  init(0);
})();
