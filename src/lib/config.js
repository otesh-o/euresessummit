// Flip these to true when the buttons should be clickable again.
export const JOIN_OPEN = false;
export const REGISTRATION_OPEN = false;

// Spread onto a link to switch it off: blurred (see .link-disabled), not focusable, not clickable.
export const lockedLinkProps = {
  "aria-disabled": "true",
  tabIndex: -1,
  onClick: (event) => event.preventDefault(),
};
