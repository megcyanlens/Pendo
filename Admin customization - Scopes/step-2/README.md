# Pendo: Notifications & messaging scopes (step 2)

Custom code for the "Notifications & messaging" section of the Manage default permissions dialog.

- The code block draws three permission rows, styled like the Data quality list: a title, a grey description, and an Allowed / Not allowed dropdown. The JS turns each `<select>` into a Qlik-style dropdown: blue outline on focus, and a checkmark (not a blue fill) on the selected option. Mouse and keyboard (arrows, Enter, Escape) both work.
- Every change writes the value of all three into the open-text poll `6r0jeqmk6xd`, e.g.
  `Onboarding guides: Allowed | New feature announcements: Not allowed | Surveys and feedback: Allowed`

## Install

1. In the Visual Design Studio, open the step's Code block (`pendo-code-6e448ffc`, under the "Notifications & messaging" header).
2. Paste `notificationScopes.html`, `notificationScopes.css` and `notificationScopes.js` into the HTML, CSS and JS tabs.
3. Make sure the Save button's action submits the poll (Submit Poll), so the text is recorded.

## Settings

- `SHOW_HIDDEN_POLL` (JS): `true` keeps the open-text poll visible for testing. Set it to `false` before launch to hide it.
- `HIDDEN_POLL_ID` (JS): the open-text poll's ID. If it doesn't match, the code uses the step's open-text poll anyway.
- `SEPARATOR` (JS): text between entries (` | `).
- Row names and starting values live in the HTML: `data-name` is the text written to the poll, and the `selected` option is the starting value.

## Test

Serve this folder (`python -m http.server`) and open `test.html`. It's the step as Pendo renders it, with the code block filled in.
