var activeConfigurationData;

/*
 * Fetches the stored configuration definitions from the browser's local storage.
 * @returns {Array<Object>} An array of objects, each containing { webAddress:String, requestModifiers:[ {key:String, data:String} ] }
 */
function fetchConfigurationData() {
 let storedConfigString = sessionStorage['proxyRules'];

 if (storedConfigString === undefined || storedConfigString === null) {
  return null;
 }

 return JSON.parse(storedConfigString);
}

/*
 * Persists the given settings into the browser's local storage area for the extension.
 * @param {Array<Object>} inputConfig - An array of objects, where each object contains { webAddress:String, requestModifiers:[ {key:String, data:String} ] }
 */
function saveConfigurationData(inputConfig) {
 sessionStorage['proxyRules'] = JSON.stringify(inputConfig);
}

/*
 * Renders the request modifiers for a specific entry within the settings display table.
 * @param {Object} ruleEntry - An object structured as { webAddress:String, requestModifiers:[ {key:String, data:String} ] }
 * @param {jQuery} targetTableElement - A jQuery reference pointing to the <tbody> tag where the modifier key/data pairs will be inserted.
 */
function displayRuleDetails(ruleEntry, targetTableElement) {
 targetTableElement.empty();

 if (!ruleEntry) {
  return;
 }

 if (!ruleEntry.requestModifiers) {
  return;
 }

 // This function generates a click event handler for enabling in-place editing of a table cell.
 // It requires references to the specific modifier data object and the property name to bind the edit to.
 var createEditClickHandler = function (ruleHeader, propertyKey) {
  return function (interactionEvent) {

   var clickedElement = $(interactionEvent.target);
   var textInputBox = $('<input type="text"/>').val(clickedElement.text());
   var saveButton = $('<button class="btn">Save</button>');

   var performSaveOperation = function () {
    // Remove all associated event listeners to prevent memory leaks or multiple bindings.
    saveButton.off();
    textInputBox.off();

    // Capture the newly entered value from the input field.
    ruleHeader[propertyKey] = $(textInputBox).val();

    // Revert the display field back to its non-editing state, showing the updated value.
    clickedElement.html(ruleHeader[propertyKey]);
   };

   saveButton.on('click', performSaveOperation);
   textInputBox.on('keydown', function (e) {
    if (e.which === 13) {
     performSaveOperation();
    }
   });

   clickedElement.html(textInputBox).append(saveButton);
   textInputBox.focus();
  };
 };

 /*
  * Constructs a <tr> HTML element suitable for insertion into the rule detail table.
  * @param {Object} modifierEntry - An object like {key:String, data:String} representing a single header.
  * @returns {jQuery} A jQuery reference to the newly created <tr> node containing the modifier display.
  */
 var buildHeaderRowElement = function (modifierEntry) {
  var rowElement = $('<tr></tr>');
  var nameCell = $('<td></td>').text(modifierEntry.key);
  var valueCell = $('<td></td>').text(modifierEntry.data);

  // Attach the click event to each of the data fields to make them editable upon interaction.
  nameCell.on('click', createEditClickHandler(modifierEntry, 'key'));
  valueCell.on('click', createEditClickHandler(modifierEntry, 'data'));

  rowElement.append(nameCell);
  rowElement.append(valueCell);
  return rowElement;
 };

 // Iterate through all available request modifiers and append each generated <tr> to the table body.
 for (let idx = 0, len = ruleEntry.requestModifiers.length; idx < len; idx++) {
  targetTableElement.append(buildHeaderRowElement(ruleEntry.requestModifiers[idx]));
 }

 // When the "add new modifier" button is clicked:
 // Add a new, empty modifier entry to the array, then render this new entry in the UI.
 var addNewRuleBtn = $('.addRuleHeaderButton');
 addNewRuleBtn.off(); // Remove previous handlers
 addNewRuleBtn.on('click', function () {
  ruleEntry.requestModifiers.push({
   key: '',
   data: ''
  });
  var newRow = buildHeaderRowElement(ruleEntry.requestModifiers[ruleEntry.requestModifiers.length - 1]);
  targetTableElement.append(newRow);

  newRow.find('td').first().click(); // Immediately trigger editing on the first cell of the new row.
 });
}

/*
 * Manages the change event triggered by the URL selection dropdown box.
 * @param {jQuery.Event} changeEvent - The jQuery event object.
 */
function handleUrlDropdownChange(changeEvent) {
 var selectedRule = activeConfigurationData[$(changeEvent.target).find('option:selected').index()];
 displayRuleDetails(selectedRule, $('#ruleDetailTable').find('tbody'));
}

function populateDropdownOptions() {
 // Initialize the URL selector dropdown.
 var ruleDropdown = $('#activeWebAddress');
 ruleDropdown.off();
 ruleDropdown.empty();

 // Fill the dropdown with all currently managed URLs.
 for (let idx = 0, len = activeConfigurationData.length; idx < len; idx++) {

  var optionItem = $('<option></option>').attr('value', idx).text(activeConfigurationData[idx].webAddress);
  if (idx === 0) {
   optionItem.attr("selected", "selected");
  }

  ruleDropdown.append(optionItem);
 }

 ruleDropdown.on('change', handleUrlDropdownChange);
 // Trigger the change handler immediately to display details for the first item.
 ruleDropdown.change();
 return ruleDropdown;
}

$(document).ready(function () {
 // Check browser's local storage for any existing URL definitions.
 activeConfigurationData = fetchConfigurationData() || [];

 var ruleDropdown = populateDropdownOptions();

 // Allow the user to add new URLs for management.
 var addNewUrlForm = $('#addNewWebAddressForm');
 addNewUrlForm.on('submit', function () {
  // Create a new, blank rule set.
  var urlInputBox = $('#newWebAddress');
  var newProxyRule = {
   webAddress: urlInputBox.val(),
   requestModifiers: []
  };
  activeConfigurationData.push(newProxyRule);

  // Add a new option to the URL selection dropdown.
  ruleDropdown.append($('<option></option>').attr('value', activeConfigurationData.length - 1).text(newProxyRule.webAddress));

  // Ensure the newly added option is selected.
  ruleDropdown.find('option').attr('selected', false).last().attr('selected', true);

  // Trigger the change handler to update the displayed details.
  ruleDropdown.change();

  // Clear the input field for a new entry.
  urlInputBox.val('');

  // Automatically add a new header for the newly created rule.
  $('.addRuleHeaderButton').click();

  return false; // Prevent default form submission.
 });

 // Hide any initial alert messages.
 $('.notification').hide();

 // Check if the user wishes to display the intercept count.
 var showCountCheckbox = $('#displayRequestCount');
 var countVisibility = sessionStorage['showRequestCount'];

 try {
  countVisibility = JSON.parse(countVisibility);
 } catch (e) {
  countVisibility = true; // Default to true if parsing fails.
 }

 showCountCheckbox.attr('checked', countVisibility ? 'checked' : null);

 // Enable the main save button.
 var saveAllButton = $('#saveAllSettings');
 saveAllButton.on('click', persistAndNotify);

 // Enable the functionality for deleting all settings.
 var deleteAllRulesButton = $('#clearAll');
 deleteAllRulesButton.on('click', function () {
  activeConfigurationData = []; // Clear all stored data.
  persistAndNotify(); // Save the empty state and notify.
  populateDropdownOptions(); // Refresh the dropdown.
 });

 // Enable deletion of a single, selected setting.
 var deleteSelectedRuleButton = $('#deleteCurrent');
 deleteSelectedRuleButton.on('click', function () {
  var indexToRemove = ruleDropdown.find('option:selected').val();
  activeConfigurationData.splice(indexToRemove, 1); // Remove from the array.
  persistAndNotify(); // Save and notify.
  populateDropdownOptions(); // Refresh the dropdown.
 });

 // Logic for import/export modal dialog.
 var exportImportDialog = $('#exportImportDialog');
 exportImportDialog.on('show.bs.modal', function () {
  var dialogElement = $(this);
  var textAreaInput = dialogElement.find('textarea');
  var controlGroupDiv = dialogElement.find('.form-group');
  var submitButton = dialogElement.find('.btn-primary');
  var errorMessageSpan = dialogElement.find('.error-message');

  textAreaInput.text(PrettyPrintJson(activeConfigurationData)); // Populate with current data.

  submitButton.on('click', function () {
   controlGroupDiv.removeClass('has-error');
   errorMessageSpan.hide();

   require(['validator', 'dataSchemaDefinition'], function (checkValidity, schemaDefinition) {
    try {
     var parsedValue = JSON.parse(textAreaInput.val());
     var validationResult = checkValidity(parsedValue, schemaDefinition);

     if (validationResult.isValid) {
      activeConfigurationData = parsedValue;
      dialogElement.modal('hide');
      persistAndNotify();
     } else {
      var messageText = "Validation issues encountered during JSON parsing:<ul>";
      for (let k = 0, lenK = validationResult.errors.length; k < lenK; k++) {
       messageText += "<li>" + validationResult.errors[k].property + " " + validationResult.errors[k].message + "</li>";
      }
      messageText += "</ul>";

      errorMessageSpan.html(messageText);
      errorMessageSpan.show();
      controlGroupDiv.addClass('has-error');
     }
    } catch (e) {
     errorMessageSpan.text('Failed to parse input as JSON: ' + e.toString());
     errorMessageSpan.show();
     controlGroupDiv.addClass('has-error');
    }
   });

  });
 }).on('hide.bs.modal', function () {
  var dialogElement = $(this);
  var submitButton = dialogElement.find('.btn-primary');
  submitButton.off(); // Unbind click handler when modal closes.
 });
});

/*
 * Saves the current settings and provides visual feedback to the user interface regarding success or failure.
 */
function persistAndNotify() {
 var successNotification = $('.notification-success');
 var errorNotification = $('.notification-error');
 try {
  saveConfigurationData(activeConfigurationData);
  sessionStorage['showRequestCount'] = $('#displayRequestCount').prop('checked'); // Use .prop() for checked state.

  browser.runtime.sendMessage('refresh', function () { // Simulating a browser extension message.
   populateDropdownOptions();
   successNotification.show();
   successNotification.fadeOut(2500); // Fade out after 2.5 seconds.
  });


 } catch (e) {
  errorNotification.text('An unexpected problem occurred: ' + e.toString());
  errorNotification.show();
  errorNotification.fadeOut(5000); // Fade out after 5 seconds.
 }
}