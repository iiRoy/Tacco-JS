(function (domLib, extAPI) {
 'use strict';

 // This particular variable will hold a domLib Object which encapsulates an HTML element
 // acting as a template for a local configuration entry (repository identifier -> local path).
 // Each configuration entry is rendered as a table row containing two input fields:
 // one for the repository's identifier and another for its corresponding local file system location.
 var $settingEntryTemplate;

 /**
  * Persists user settings into the browser's synchronized storage.
  *
  * @returns {void}
  */
 function storeConfiguration() {
  let pathConfigurations = {};

  // Populate the pathConfigurations object with data from visible input rows.
  $settingEntryTemplate.prevAll().each(function () {
   let $currentRowElement = domLib(this);
   let repositoryIdentifier = $currentRowElement.find('[data-field="repo-id"]').val();

   // Only include this mapping if the repository identifier is not blank or empty.
   if (repositoryIdentifier && repositoryIdentifier.trim() !== '') {
    let localDestination = $currentRowElement.find('[data-field="local-path-id"]').val();
    pathConfigurations[repositoryIdentifier] = localDestination;
   }
  });

  // Store the compiled path configurations object.
  extAPI.storage.sync.set({
   pathConfigurations: pathConfigurations
  }, function() {
   // Update the UI to inform the user that settings have been saved.
   let displayMessage = domLib('#status-feedback');
   displayMessage.text('Configuration stored successfully.');
   setTimeout(function() {
    displayMessage.text('');
   }, 750);
  });
 }

 /**
  * Retrieves stored configuration values from browser.storage and
  * populates them into the options form for user interaction.
  *
  * @returns {void}
  */
 function loadAndDisplaySettings() {
  $settingEntryTemplate = domLib('#config-row-blueprint').removeAttr('id');

  extAPI.storage.sync.get({
   pathConfigurations: {},
  }, function(retrievedData) {
   let storedPathConfigurations = retrievedData.pathConfigurations;

   // Iterate through and render each stored local mapping pair.
   for (let currentRepoKey in storedPathConfigurations) {
    if (storedPathConfigurations.hasOwnProperty(currentRepoKey)) {
     appendNewConfigurationRow(currentRepoKey, storedPathConfigurations[currentRepoKey]);
    }
   }

   // Append an empty row at the very end to allow for new entries.
   appendNewConfigurationRow();
  });
 }

 /**
  * Appends a new table row to the settings interface, representing a
  * single local mapping entry.
  *
  * @param {string} [repositoryIdentifier] The unique identifier for the repository to be displayed.
  * @param {string} [localDestination] The file path on the local machine corresponding to the repository.
  * @returns {void}
  */
 function appendNewConfigurationRow (repositoryIdentifier, localDestination) {
  let $newConfigRow = $settingEntryTemplate.clone().removeClass('hidden-item');
  if (repositoryIdentifier) {
   $newConfigRow.find('[data-field="repo-id"]').val(repositoryIdentifier);
  }
  if (localDestination) {
   $newConfigRow.find('[data-field="local-path-id"]').val(localDestination);
  }
  $settingEntryTemplate.before($newConfigRow);
 }

 /**
  * Handles the removal of a configuration row from the DOM,
  * triggered by its associated delete button.
  *
  * @returns {void}
  */
 function removeConfigurationRow () {
  // Locate and remove the parent table row from the document.
  domLib(this).closest('tr').remove();
 }

 // Execute functions once the Document Object Model is fully loaded.
 domLib(function () {
  loadAndDisplaySettings();

  // Attach an event listener to the save button.
  domLib('#save-settings-button').on('click', storeConfiguration);

  // Configure the button responsible for adding new configuration rows.
  domLib('#add-new-row-button').on('click', function () {
   // An anonymous function is used here to prevent the jQuery event object
   // from being passed as an argument to appendNewConfigurationRow.
   appendNewConfigurationRow();
  });

  // Delegate click events for all delete buttons within the body.
  domLib(document.body).on('click', '.remove-row-button',
   removeConfigurationRow);
 });

})(window.jQuery, window.chrome);