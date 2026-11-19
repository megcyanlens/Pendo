/* Pendo code block: JS tab (Scopes step 1)
   Clicking anywhere on the header row clicks the row's button, so the row does
   whatever that button's Pendo action is. Clicks on the button itself are left
   alone, so its action runs once. The row also shows a pointer on hover. */
(function () {
  var HEADER_ROW_ID = 'pendo-row-c7986eb9';
  var HEADER_BUTTON_ID = 'pendo-button-6411e4eb';

  var root = document;
  try {
    if (typeof step !== 'undefined' && step && step.guideElement && step.guideElement[0]) {
      root = step.guideElement[0];
    }
  } catch (e) { /* fall back to document */ }

  function init(attempt) {
    var headerRow = root.querySelector('#' + HEADER_ROW_ID);
    if (!headerRow) {
      if (attempt < 20) setTimeout(function () { init(attempt + 1); }, 100);
      return;
    }
    if (headerRow.getAttribute('data-qs-row-click') === 'true') return;
    headerRow.setAttribute('data-qs-row-click', 'true');

    headerRow.style.cursor = 'pointer';
    Array.prototype.forEach.call(headerRow.querySelectorAll('*'), function (el) {
      el.style.cursor = 'pointer';
    });

    headerRow.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      var headerButton = root.querySelector('#' + HEADER_BUTTON_ID);
      if (headerButton) headerButton.click();
    });
  }

  init(0);
})();
