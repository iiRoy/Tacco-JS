/**
 * Initializes a monitoring system for form input completion,
 * updating a progress bar based on filled fields.
 */
function initFormCompletionMonitor()
{
  // Select all relevant input elements within the form, excluding buttons.
  // Attach an event listener for 'input' changes to trigger progress updates.
  var formInputElements = $(".form :input")
    .not('button, [type="button"], [type="submit"]')
    .on({
      input: updateCompletionStatus // Call the status update function on any input change.
    });

  /**
   * Callback function executed whenever an input field's value changes.
   * Calculates the completion percentage and updates the progress bar.
   */
  function updateCompletionStatus()
  {
    // Determine the number of input fields that are currently empty.
    var emptyInputCount = formInputElements.filter(function() {
        return !this.value.length; // Check if the current input's value has no length.
      }).length; // Get the count of such empty fields.

    // Get the total number of input fields being tracked.
    var totalInputCount = formInputElements.length;

    // Calculate the completion percentage and set the width of the progress bar.
    // The width is 100% minus the percentage of empty fields.
    $(".progressBar").css(
      "width",
      100 - (emptyInputCount / totalInputCount) * 100 + "%"
    );
  }
}