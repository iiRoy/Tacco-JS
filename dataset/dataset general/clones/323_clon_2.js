var last_known_uri;

/**
 * Commits the current user preferences to the browser's synchronized storage.
 * This function retrieves the URI from the input field, validates it,
 * and then saves it if it's new or valid.
 */
function store_settings()
{
  // Retrieve the value from the URI input field.
  var current_page_uri = document.querySelector('#uri_input').value;

  // Perform basic validation: check if the URI is empty, default, or unchanged.
  if (
    !current_page_uri ||
    current_page_uri === 'https://' ||
    last_known_uri === current_page_uri
  ) {
    // If validation fails, exit the function without saving.
    return;
  }

  // Use the browser's storage API to persist the new URI.
  chrome.storage.sync.set(
    {
      target_uri: current_page_uri
    },
    // Callback function executed after the settings have been saved.
    function() {
      // Get the element responsible for displaying status messages.
      var feedback_message_element = document.querySelector('#feedback_display');
      // Update the status message to confirm saving.
      feedback_message_element.innerText = 'Preferences updated.';
      // Update the global tracker for the last saved URI.
      last_known_uri = current_page_uri;
      // Schedule the status message to disappear after a short delay.
      setTimeout(
        function() {
          feedback_message_element.innerText = ''; // Clear the message.
        },
        750 // Delay in milliseconds.
      );
    }
  );
}

// Event listener to ensure the DOM is fully loaded before interacting with elements.
document.addEventListener('DOMContentLoaded', function() {
  // Retrieve previously saved URI from synchronized storage.
  chrome.storage.sync.get(
    {
      target_uri: '' // Default value if no URI is found.
    },
    function(retrieved_data) {
      // Populate the input field with the retrieved URI.
      document.querySelector('#uri_input').value = retrieved_data.target_uri;
      // Store this initial URI as the last known value.
      last_known_uri = retrieved_data.target_uri;
    }
  );

  // Attach an event listener to the save button to trigger the settings storage function.
  document.querySelector('#save_button').addEventListener('click', store_settings);
});