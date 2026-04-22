function initializeProgressTracker() {
  // Define constants for robust selection.
  const targetContainerSelector = ".form";
  const inputExclusionFilters = "button, [type='button'], [type='submit']";
  const progressDisplayElementSelector = ".top";

  // Select all pertinent input elements within the specified form container.
  // We exclude common button types as they are not typically 'fillable' fields.
  const relevantFormFields = $(`${targetContainerSelector} :input`).not(inputExclusionFilters);

  // Cache the progress bar element for efficiency.
  const completionIndicator = $(progressDisplayElementSelector);

  // Define the callback function that will update the completion status.
  // This function is triggered whenever an input field's value changes.
  function updateCompletionDisplay() {
    // Determine the total number of relevant input fields available for completion.
    const totalInputItems = relevantFormFields.length;
    let filledInputItems = 0; // Initialize counter for fields that have content.

    // Iterate through each relevant field to check its current state.
    relevantFormFields.each(function() {
      // Use .val().trim() to account for whitespace-only inputs as empty.
      if ($(this).val().trim() !== '') {
        filledInputItems++; // Increment if the field contains any non-whitespace characters.
      }
    });

    let currentCompletionPercentage;

    // Guard clause: Prevent division by zero if there are no fields to track.
    if (totalInputItems === 0) {
      currentCompletionPercentage = 100; // If no fields, consider it 100% complete.
      console.warn("No trackable input fields found in the form. Progress set to 100%.");
    } else {
      // Calculate the percentage of fields that have been filled.
      currentCompletionPercentage = (filledInputItems / totalInputItems) * 100;
      // Optional: Log the current status for debugging purposes.
      console.log(`Form completion status: ${filledInputItems} out of ${totalInputItems} fields filled. (${currentCompletionPercentage.toFixed(2)}%)`);
    }

    // Apply the calculated width to the progress bar element.
    // Ensure the percentage is formatted as a CSS width string.
    completionIndicator.css("width", `${currentCompletionPercentage}%`);
  }

  // Attach the update function to the 'input' event for all relevant form fields.
  // This ensures the progress bar updates in real-time as users type.
  relevantFormFields.on("input", updateCompletionDisplay);

  // Perform an initial update of the progress bar when the tracker is first initialized.
  // This sets the correct state immediately upon page load or function call.
  updateCompletionDisplay();
}