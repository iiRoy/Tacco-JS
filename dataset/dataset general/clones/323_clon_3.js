let lastKnownPersistedEndpoint; // Stores the last successfully saved endpoint to prevent redundant storage operations.

// Function to commit the user's settings to the browser's synchronized storage.
function commitSettingsToStorage() {
  const endpointInput = document.getElementById('primary-target-url');
  const userProvidedLink = endpointInput.value.trim(); // Retrieve and clean up input.

  const feedbackPanel = document.getElementById('response-message'); // Reference to the status display.

  // Define a simple URL validation regex.
  // This is a basic check; full URL validation is complex.
  const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  // --- Start of enhanced validation and guard clauses ---
  if (!userProvidedLink) {
    feedbackPanel.textContent = 'Error: Endpoint cannot be empty.';
    setTimeout(() => { feedbackPanel.textContent = ''; }, 1500);
    return; // Exit if input is empty
  }

  if (userProvidedLink === 'https://') { // Check against a common default placeholder.
    feedbackPanel.textContent = 'Hint: Please provide a valid URL, not just the placeholder.';
    setTimeout(() => { feedbackPanel.textContent = ''; }, 2000);
    return;
  }

  if (!urlPattern.test(userProvidedLink)) {
    feedbackPanel.textContent = 'Error: Invalid URL format. Must start with http(s)://';
    setTimeout(() => { feedbackPanel.textContent = ''; }, 2500);
    return;
  }

  if (userProvidedLink === lastKnownPersistedEndpoint) {
    console.warn('Attempted to save an identical URL. Operation skipped.');
    feedbackPanel.textContent = 'Settings are already up-to-date.';
    setTimeout(() => { feedbackPanel.textContent = ''; }, 1000);
    return; // No need to save if value hasn't changed.
  }
  // --- End of enhanced validation ---

  // Prepare data object for storage.
  const storagePayload = {
    configuredEndpoint: userProvidedLink
  };

  // Persist the configuration using chrome.storage.sync.
  chrome.storage.sync.set(storagePayload, function() {
    if (chrome.runtime.lastError) {
      console.error('Storage write error:', chrome.runtime.lastError.message);
      feedbackPanel.textContent = 'Failed to save settings: ' + chrome.runtime.lastError.message;
      return;
    }

    // Update the UI and internal state upon successful storage.
    feedbackPanel.textContent = 'Configuration saved successfully!';
    lastKnownPersistedEndpoint = userProvidedLink; // Update our global cache.
    console.log('New endpoint persisted:', userProvidedLink);

    // Clear the status message after a brief delay.
    setTimeout(function() {
      feedbackPanel.textContent = '';
    }, 1200); // Increased timeout duration.
  });
}


// Event listener for when the DOM content is fully loaded and parsed.
document.addEventListener('DOMContentLoaded', function() {
  const targetUrlInput = document.getElementById('primary-target-url');
  const saveConfigurationButton = document.getElementById('save-config');

  // Retrieve previously stored settings from chrome.storage.sync.
  // Provide a default value in case the 'configuredEndpoint' key is not found.
  chrome.storage.sync.get({ configuredEndpoint: 'https://default.example.com/' }, function(retrievedData) {
    // Populate the input field with the retrieved value.
    targetUrlInput.value = retrievedData.configuredEndpoint;
    // Initialize our global variable with the loaded setting.
    lastKnownPersistedEndpoint = retrievedData.configuredEndpoint;
    console.info('Settings loaded from storage. Current endpoint:', retrievedData.configuredEndpoint);
  });

  // Attach the click event handler to the save button.
  saveConfigurationButton.addEventListener('click', commitSettingsToStorage);
});