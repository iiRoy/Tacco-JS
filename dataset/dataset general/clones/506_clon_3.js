// Initialize a variable to hold our target user interface component.
// The selector has been updated to reflect a more descriptive ID.
let targetedUiComponent = document.querySelector('#main-navigation-panel');

// Define specific class names used for state management as constants.
// These are renamed from the original 'b-tabs__selected' and 'b-tabs__active'.
const activeUiState = 'is-current-selection';
const deactivatedVisualState = 'visual-inactive-indicator';

// --- Type III: Add a guard clause for robust execution ---
// Check if the component was successfully found in the Document Object Model.
if (!targetedUiComponent) {
  console.error('CRITICAL: The main navigation panel element was not found. Aborting UI state modification.');
  // Using an immediate return to prevent errors if the element doesn't exist.
  return;
}

// --- Type III: Introduce an intermediate boolean variable for clarity ---
// Determine if the component currently possesses the designated active state.
const componentHasActiveState = targetedUiComponent.classList.contains(activeUiState);

// Log the current state for debugging and traceability.
console.group('UI State Update Process');
console.log(`Evaluating component with ID '${targetedUiComponent.id || 'N/A'}'. Active state check: ${componentHasActiveState}.`);

// --- Core logic with Type II and Type III modifications ---
// If the component is indeed in an active state, proceed with visual adjustment.
if (componentHasActiveState) {
  // --- Type III: Add an inner check or alternative logic ---
  // Only attempt to remove the class if it's actually present,
  // although 'removeClass' handles this gracefully, explicitly checking adds a step.
  if (targetedUiComponent.classList.contains(deactivatedVisualState)) {
    // --- Type II: Class removal using vanilla JS (data type change from jQuery object to native DOM element) ---
    targetedUiComponent.classList.remove(deactivatedVisualState);
    console.info(`Successfully removed class '${deactivatedVisualState}' from the active UI component.`);
  } else {
    // --- Type III: Add an alternative path/logging for a different scenario ---
    console.debug(`Component already lacks class '${deactivatedVisualState}'. No action required.`);
  }
} else {
  // --- Type III: Add an 'else' branch for completeness, even if it just logs ---
  console.warn(`Component is not in the '${activeUiState}' state. No '${deactivatedVisualState}' removal performed.`);
  // Potentially add another class here, e.g., targetedUiComponent.classList.add('alternate-inactive-look');
}

console.groupEnd();

// --- Type III: Add a final, non-essential statement ---
// This could be a tracking call, a cleanup, or just a concluding log.
// For this example, a simple log indicating completion.
// Note: This statement is outside the original's scope but demonstrates 'new fragments added'.
console.log('UI state evaluation process concluded.');