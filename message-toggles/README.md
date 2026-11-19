# Pendo: message preference toggles

Custom code for the "Customize messages for end-users" lightbox guide.

- The code block draws three on/off toggles, each with a bold title and a smaller description (multi-select, keyboard accessible, `role="switch"`). Only the switch itself is clickable. No multi-choice poll is needed.
- Every change writes the state of all three into the open-text poll `lexrb574p9e`, e.g.
  `Onboarding guides: On | New feature announcements: Off | Surveys and feedback: On`

## Install

1. In the Visual Design Studio, delete the multi-choice (radio) poll. Keep the open-text poll.
2. Drag the guide's Code block to where the radios were (under the description, above Save).
3. Paste `customizeMessages.html`, `customizeMessages.css` and `customizeMessages.js` into the HTML, CSS and JS tabs.
4. Make sure the Save button's action submits the poll (Submit Poll), so the text is recorded.

## Settings

- `SHOW_HIDDEN_POLL` (JS): `true` keeps the open-text poll visible for testing. Set it to `false` before launch to hide it.
- `HIDDEN_POLL_ID` (JS): the open-text poll's ID. If it doesn't match, the code uses the guide's open-text poll anyway.
- `SEPARATOR` (JS): text between entries (` | `).
- Toggle names and starting states live in the HTML: `data-name` is the text written to the poll, `aria-checked="true"` starts the toggle On.

## Test

Serve this folder (`python -m http.server`) and open `test.html`. It's the guide without the radio poll, with the code block under the description.
