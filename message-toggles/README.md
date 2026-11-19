# Pendo: message preference toggles

Custom code for the "Customize messages for end-users" lightbox guide.

- Replaces the three radio buttons of multi-choice poll `c9h0svnf0rs` with on/off toggles (multi-select, keyboard accessible, `role="switch"`).
- Writes the state of all three into the hidden open-text poll `lexrb574p9e`, e.g.
  `Onboarding guides: On | New feature announcements: Off | Surveys and feedback: On`
- Hides the hidden poll's question and textarea and resizes the guide.

## Install

1. In the Visual Design Studio, open the guide's existing Code block (`pendo-code-ffd0457f`).
2. Paste `customizeMessages.css` into the CSS tab and `customizeMessages.js` into the JS tab. The HTML tab stays empty.
3. Make sure the Save button's action submits the polls (Submit Poll), so the hidden poll's text is recorded.

## Settings (top of `customizeMessages.js`)

- `DEFAULT_ON`: starting state of every toggle (`true`).
- `SEPARATOR`: text between entries (` | `).
- Poll IDs: change these if the polls are recreated.

The native radios stay unchecked, so the multi-choice poll records no answer; the hidden poll is the source of truth.

## Test

Serve this folder (`python -m http.server`) and open `test.html`. It holds the guide's rendered HTML and shows the hidden poll value under the guide.
