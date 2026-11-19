# Pendo: Notifications & messaging scopes (step 2)

Custom code for the "Notifications & messaging" section of the Manage default permissions dialog. This one step has both states, so no separate minimized step is needed.

- **Minimized and expanded.** The step opens minimized: just the "Notifications & messaging" header with a down chevron. Clicking anywhere on the header row (`#pendo-row-5124e943`), or its chevron button (`#pendo-button-fa1ae14b`), expands it to show the permission rows, and clicking again minimizes it. The chevron points up when expanded. The click is handled in the code, so the button's own Pendo action never runs.
- The code block draws three permission rows, styled like the Data quality list: a title, a grey description, and an Allowed / Not allowed dropdown. The JS turns each `<select>` into a Qlik-style dropdown: blue outline on focus, and a checkmark (not a blue fill) on the selected option. Mouse and keyboard (arrows, Enter, Escape) both work.
- Every change writes the value of all three into the open-text poll `6r0jeqmk6xd`, e.g.
  `Onboarding guides: Allowed | New feature announcements: Not allowed | Surveys and feedback: Allowed`

## Install

1. Delete the old minimized step, so this is the guide's only step.
2. In the Visual Design Studio, open this step's Code block (`pendo-code-6e448ffc`, under the "Notifications & messaging" header).
3. Paste `notificationScopes.html`, `notificationScopes.css` and `notificationScopes.js` into the HTML, CSS and JS tabs.
4. Make sure the Save button's action submits the poll (Submit Poll), so the text is recorded.

## Settings

- `START_EXPANDED` (JS): `false` opens the step minimized; `true` opens it expanded.
- `SHOW_HIDDEN_POLL` (JS): `true` keeps the open-text poll visible for testing. Set it to `false` before launch to hide it.
- `HIDDEN_POLL_ID` (JS): the open-text poll's ID. If it doesn't match, the code uses the step's open-text poll anyway.
- `HEADER_ROW_ID`, `HEADER_BUTTON_ID` (JS): the header row and its button. Update these if Pendo gives them new IDs.
- `SEPARATOR` (JS): text between entries (` | `).
- Row names and starting values live in the HTML: `data-name` is the text written to the poll, and the `selected` option is the starting value.

## Test

Serve this folder (`python -m http.server`) and open `test.html`. It's the step as Pendo renders it, with the code block filled in.
