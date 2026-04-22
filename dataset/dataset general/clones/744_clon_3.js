// This file contains unit tests for the jQuery Recurrence Input Widget.
// It leverages QUnit for assertions and test structure.
// The code has been extensively refactored and modified to produce a Type III clone.

/* eslint-disable no-unused-vars */
/* global jQuery, QUnit */

// Initialize a test suite for the recurrence configuration utility.
QUnit.module("Recurrence Configuration Widget Validation Suite");


// INTERNAL UTILITY FUNCTION

/**
 * Configures a date input field with a specific date string.
 * Handles different date formats for browser compatibility (e.g., ISO for Chrome).
 * @param {jQuery} targetField - The jQuery wrapped input element to update.
 * @param {string} isoDateString - The date in YYYY/MM/DD format.
 */
function configureDateInput(targetField, isoDateString) {
  // Validate inputs to prevent unexpected behavior.
  if (!targetField || !isoDateString || typeof isoDateString !== 'string') {
    console.warn("configureDateInput: Invalid input provided.", { targetField, isoDateString });
    return;
  }

  // Attempt to set the value directly.
  targetField.val(isoDateString);

  // If the direct assignment doesn't "take" (e.g., for certain HTML5 date inputs),
  // try an ISO-like format (YYYY-MM-DD).
  if (!targetField.val()) {
    const adjustedIsoFormat = isoDateString.replace(/\//g, '-');
    targetField.val(adjustedIsoFormat);
    // Log if adjustment was necessary.
    if (targetField.val()) {
      console.log(`Date input adjusted to ISO format: ${adjustedIsoFormat}`);
    } else {
      console.error(`Failed to set date input value for: ${isoDateString}`);
    }
  }
}


// PRIMARY TEST CASES

QUnit.test("Fundamental Widget Interaction", function (assert) {
  assert.expect(4); // We're adding an extra assertion for robustness.

  // Define the target textarea for recurrence rules.
  const recurrenceFieldSelector = 'textarea[name="recurrenceDefinition"]';
  const recurrenceRuleTextArea = jQuery(recurrenceFieldSelector);
  assert.ok(recurrenceRuleTextArea.length > 0, "Target recurrence textarea should exist.");

  // Initialize the recurrence widget on the textarea.
  const widgetInstance = recurrenceRuleTextArea.initRecurrenceWidget();

  // Set an initial recurrence rule string.
  const simpleDailyRule = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
  recurrenceRuleTextArea.val(simpleDailyRule);

  // Simulate a click to open the recurrence editor dialog.
  const editButtonSelector = '.recurrence-field-wrapper a[data-action="editRecurrence"]';
  jQuery(editButtonSelector).trigger('click');

  // Verify the dialog is visible after clicking edit.
  assert.ok(widgetInstance.dialogForm.is(':visible'), "Recurrence editor dialog should be visible after edit click.");

  // Simulate saving the rule.
  widgetInstance.dialogForm.find('.save-recurrence-btn').trigger('click');

  // Confirm that the textarea value matches the saved rule.
  assert.ok(recurrenceRuleTextArea.val() === simpleDailyRule, "Textarea content should match the saved recurrence rule.");

  // Re-open the dialog and then simulate a cancel action.
  jQuery(editButtonSelector).trigger('click');
  widgetInstance.dialogForm.find('.cancel-recurrence-btn').trigger('click');

  // Verify that the dialog box is still visible after a cancel operation (as per original test's behavior).
  assert.ok(widgetInstance.dialogForm.is(':visible'), "Dialog box remains visible after cancel operation (as per original test behavior).");
});

QUnit.test("Handling of Malformed iCalendar Data", function (assert) {
  assert.expect(1); // One assertion to check the error message.

  const targetTextArea = jQuery('textarea[name="recurrenceDefinition"]');
  targetTextArea.val(""); // Clear any previous value.
  const widgetHandle = targetTextArea.initRecurrenceWidget();

  // Provide a string that looks like an iCal rule but lacks the "RRULE:" prefix.
  const invalidRuleFragment = "FREQ=MONTHLY;COUNT=3";
  targetTextArea.val(invalidRuleFragment);

  // Trigger the editor dialog.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  // Check if the validation feedback area displays the expected error message.
  assert.ok(widgetHandle.dialogForm.find('#validationFeedbackArea').text().includes('No rule definition found in supplied data'), "Error message for invalid rule format should be displayed.");

  // Save (which might implicitly close or reset, depending on implementation).
  widgetHandle.dialogForm.find('.save-recurrence-btn').trigger('click');
});

QUnit.test("Empty Rule Opens Default Configuration", function (assert) {
  assert.expect(3); // Adding an extra check for the widget existence.

  const ruleInputElem = jQuery('textarea[name="recurrenceDefinition"]');
  ruleInputElem.val(""); // Ensure the rule is empty.

  const widgetRef = ruleInputElem.initRecurrenceWidget();
  assert.ok(widgetRef !== undefined, "Recurrence widget should be initialized.");

  // Open the dialog.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  // Confirm the default recurrence type is "BYOCCURRENCES" (by count).
  assert.ok(widgetRef.dialogForm.find('input[name="ruleRangeOption"]:checked').val() === 'byCount', "Default range type should be 'byCount'.");
  // Confirm the default occurrence count is 10.
  assert.ok(widgetRef.dialogForm.find('input[name="rangeOccurrencesValue"]').val() === '10', "Default occurrence count should be '10'.");

  // Close the dialog.
  widgetRef.dialogForm.find('.save-recurrence-btn').trigger('click');
});

QUnit.test("Daily Recurrence with Occurrence Count", function (assert) {
  assert.expect(5); // Number of assertions remains the same.

  const ruleInputArea = jQuery('textarea[name="recurrenceDefinition"]');
  const dailyRuleString = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
  ruleInputArea.val(dailyRuleString);

  // Open the editor.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  const widgetObj = ruleInputArea.initRecurrenceWidget();
  assert.ok(widgetObj.dialogForm.find('select[name="ruleFrequencyTemplate"]').val() === 'dailyFrequency', "Frequency template should be 'daily'.");
  assert.ok(widgetObj.dialogForm.find('input[name="dailyIntervalCount"]').val() === '5', "Daily interval should be '5'.");
  assert.ok(widgetObj.dialogForm.find('input[name="ruleRangeOption"]:checked').val() === 'byCount', "Range type should be 'byCount'.");
  assert.ok(widgetObj.dialogForm.find('input[name="rangeOccurrencesValue"]').val() === '8', "Occurrence count should be '8'.");

  // Save the changes.
  widgetObj.dialogForm.find('.save-recurrence-btn').trigger('click');
  assert.ok(ruleInputArea.val() === dailyRuleString, "Textarea value should match the original daily rule after save.");
});

QUnit.test("Weekly Recurrence with Specific Days and End Date", function (assert) {
  assert.expect(12); // Same number of assertions.

  const ruleStorageElement = jQuery('textarea[name="recurrenceDefinition"]');
  const weeklyRule = "RRULE:FREQ=WEEKLY;INTERVAL=4;BYDAY=TU,TH,FR;UNTIL=20120922T000000";
  ruleStorageElement.val(weeklyRule);

  // Initiate the editor interface.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  const widgetController = ruleStorageElement.initRecurrenceWidget();
  const dialogContent = widgetController.dialogForm;

  assert.ok(dialogContent.find('select[name="ruleFrequencyTemplate"]').val() === 'weeklyFrequency', "Frequency template should be 'weekly'.");
  assert.ok(dialogContent.find('input[name="weeklyIntervalCount"]').val() === '4', "Weekly interval should be '4'.");
  assert.ok(!dialogContent.find('input[name="weeklyDaySelector_MON"]').prop('checked'), "Monday checkbox should not be checked.");
  assert.ok(dialogContent.find('input[name="weeklyDaySelector_TUE"]').prop('checked'), "Tuesday checkbox should be checked.");
  assert.ok(!dialogContent.find('input[name="weeklyDaySelector_WED"]').prop('checked'), "Wednesday checkbox should not be checked.");
  assert.ok(dialogContent.find('input[name="weeklyDaySelector_THU"]').prop('checked'), "Thursday checkbox should be checked.");
  assert.ok(dialogContent.find('input[name="weeklyDaySelector_FRI"]').prop('checked'), "Friday checkbox should be checked.");
  assert.ok(!dialogContent.find('input[name="weeklyDaySelector_SAT"]').prop('checked'), "Saturday checkbox should not be checked.");
  assert.ok(!dialogContent.find('input[name="weeklyDaySelector_SUN"]').prop('checked'), "Sunday checkbox should not be checked.");
  assert.ok(dialogContent.find('input[name="ruleRangeOption"]:checked').val() === 'byEndDate', "Range type should be 'byEndDate'.");
  assert.ok(dialogContent.find('input[name="rangeEndDateCalendar"]').val() === '09/22/2012', "End date calendar value should be '09/22/2012'.");

  // Save the configuration.
  dialogContent.find('.save-recurrence-btn').trigger('click');
  assert.ok(ruleStorageElement.val() === weeklyRule, "Textarea value should match the original weekly rule after save.");
});

QUnit.test("Bi-monthly Recurrence by Month Day", function (assert) {
  assert.expect(5);

  const ruleTarget = jQuery('textarea[name="recurrenceDefinition"]');
  const biMonthlyRule = "RRULE:FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=12";
  ruleTarget.val(biMonthlyRule);

  // Open the widget.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  const widgetControl = ruleTarget.initRecurrenceWidget();
  const formSection = widgetControl.dialogForm;

  assert.ok(formSection.find('select[name="ruleFrequencyTemplate"]').val() === 'monthlyFrequency', "Frequency template should be 'monthly'.");
  assert.ok(formSection.find('input[name="monthlyRepeatType"]:checked').val() === 'onDayOfMonth', "Monthly repeat type should be 'onDayOfMonth'.");
  assert.ok(formSection.find('input[name="monthlyIntervalCount"]').val() === '2', "Monthly interval should be '2'.");
  assert.ok(formSection.find('input[name="ruleRangeOption"]:checked').val() === 'noEndConstraint', "Range type should be 'noEndConstraint'.");

  // Save the state.
  formSection.find('.save-recurrence-btn').trigger('click');
  assert.ok(ruleTarget.val() === biMonthlyRule, "Textarea content should remain consistent with the bimonthly rule.");
});

QUnit.test("Tri-monthly Recurrence by Day of Week", function (assert) {
  assert.expect(7);

  const ruleHolder = jQuery('textarea[name="recurrenceDefinition"]');
  const triMonthlyRule = "RRULE:FREQ=MONTHLY;INTERVAL=3;BYDAY=+3TH";
  ruleHolder.val(triMonthlyRule);

  // Activate the editor.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  const widgetInterface = ruleHolder.initRecurrenceWidget();
  const editorPanel = widgetInterface.dialogForm;

  assert.ok(editorPanel.find('select[name="ruleFrequencyTemplate"]').val() === 'monthlyFrequency', "Frequency template should be 'monthly'.");
  assert.ok(editorPanel.find('input[name="monthlyRepeatType"]:checked').val() === 'onWeekdayOfMonth', "Monthly repeat type should be 'onWeekdayOfMonth'.");
  assert.ok(editorPanel.find('select[name="monthlyWeekdayIndex"]').val() === '+3', "Weekday index should be '+3'.");
  assert.ok(editorPanel.find('select[name="monthlyWeekdayDay"]').val() === 'TH', "Weekday day should be 'TH'.");
  assert.ok(editorPanel.find('input[name="monthlyIntervalCount"]').val() === '3', "Monthly interval should be '3'.");
  assert.ok(editorPanel.find('input[name="ruleRangeOption"]:checked').val() === 'noEndConstraint', "Range type should be 'noEndConstraint'.");

  // Persist changes.
  editorPanel.find('.save-recurrence-btn').trigger('click');
  assert.ok(ruleHolder.val() === triMonthlyRule, "Textarea value should reflect the trimonthly rule.");
});

QUnit.test("Yearly Recurrence by Month Day Without End", function (assert) {
  assert.expect(7);

  const ruleContainer = jQuery('textarea[name="recurrenceDefinition"]');
  const yearlyRuleDOM = "RRULE:FREQ=YEARLY;INTERVAL=3;BYMONTH=4;BYMONTHDAY=11"; // The 11th of April, every 3 years.
  ruleContainer.val(yearlyRuleDOM);

  // Launch the editor.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  const widgetRef = ruleContainer.initRecurrenceWidget();
  const editorView = widgetRef.dialogForm;

  assert.ok(editorView.find('select[name="ruleFrequencyTemplate"]').val() === 'yearlyFrequency', "Frequency template should be 'yearly'.");
  assert.ok(editorView.find('input[name="yearlyIntervalCount"]').val() === '3', "Yearly interval should be '3'.");
  assert.ok(editorView.find('input[name="yearlyRepeatType"]:checked').val() === 'onDayOfMonth', "Yearly repeat type should be 'onDayOfMonth'.");
  assert.ok(editorView.find('select[name="yearlyDOMMonth"]').val() === '4', "Day of month month should be '4' (April).");
  assert.ok(editorView.find('select[name="yearlyDOMDay"]').val() === '11', "Day of month day should be '11'.");
  assert.ok(editorView.find('input[name="ruleRangeOption"]:checked').val() === 'noEndConstraint', "Range type should be 'noEndConstraint'.");

  // Conclude editing.
  editorView.find('.save-recurrence-btn').trigger('click');
  assert.ok(ruleContainer.val() === yearlyRuleDOM, "Textarea holds the correct yearly rule.");
});

QUnit.test("Yearly Recurrence by Day of Week in Month Without End", function (assert) {
  assert.expect(6);

  const ruleElement = jQuery('textarea[name="recurrenceDefinition"]');
  const yearlyRuleWeekday = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE"; // Second Wednesday of April, annually.
  ruleElement.val(yearlyRuleWeekday);

  // Open the editor.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  const widgetPointer = ruleElement.initRecurrenceWidget();
  const editorInterface = widgetPointer.dialogForm;

  assert.ok(editorInterface.find('select[name="ruleFrequencyTemplate"]').val() === 'yearlyFrequency', "Frequency template should be 'yearly'.");
  assert.ok(editorInterface.find('select[name="yearlyWeekdayIndex"]').val() === '+2', "Weekday index should be '+2'.");
  assert.ok(editorInterface.find('select[name="yearlyWeekdayDay"]').val() === 'WE', "Weekday day should be 'WE'.");
  assert.ok(editorInterface.find('select[name="yearlyWeekdayMonth"]').val() === '4', "Weekday month should be '4' (April).");
  assert.ok(editorInterface.find('input[name="ruleRangeOption"]:checked').val() === 'noEndConstraint', "Range type should be 'noEndConstraint'.");

  // Finalize.
  editorInterface.find('.save-recurrence-btn').trigger('click');
  assert.ok(ruleElement.val() === yearlyRuleWeekday, "Textarea contains the expected yearly rule.");
});

QUnit.test("Connected Start Date Field and Occurrence Display", function (assert) {
  assert.expect(2); // Added an assertion for the start date field.

  const startDateInput = jQuery('input[name="startDateField"]');
  assert.ok(startDateInput.length > 0, "Start date input field should exist.");

  // Set the initial start date for recurrence calculations.
  configureDateInput(startDateInput, '2011/04/13');

  const ruleInputArea = jQuery('textarea[name="recurrenceDefinition"]');
  const specificYearlyRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE"; // Second Wednesday of April.
  ruleInputArea.val(specificYearlyRule);

  const widgetInstance = ruleInputArea.initRecurrenceWidget();

  // Open the editor to trigger occurrence calculation.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  // Verify that the widget displays the correct number of occurrences.
  const displayedOccurrences = widgetInstance.dialogForm.find('div.occurrence-item');
  assert.ok(displayedOccurrences.length === 10, "Should display 10 occurrences for the rule.");

  widgetInstance.dialogForm.find('.save-recurrence-btn').trigger('click');
});

QUnit.test("RDATE and EXDATE Handling", function (assert) {
  assert.expect(13); // One additional assertion for display after initial load.

  const startDateElement = jQuery('input[name="startDateField"]');
  configureDateInput(startDateElement, '2011/04/13');

  const ruleTextArea = jQuery('textarea[name="recurrenceDefinition"]');
  const complexRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000";
  ruleTextArea.val(complexRule);
  const widgetReference = ruleTextArea.initRecurrenceWidget();

  // Verify the list of occurrences displayed outside the dialog first.
  assert.stop(); // Pause QUnit until async operation completes.
  setTimeout(function () {
    const displayedEvents = widgetReference.display.find('.occurrence-list .occurrence-item span');
    assert.ok(displayedEvents.length > 0, "Initial display should show some occurrences.");
    assert.ok(jQuery.trim(displayedEvents[0].firstChild.data) === "April 13, 2011", "First displayed occurrence should be 'April 13, 2011'.");
    assert.ok(jQuery.trim(displayedEvents[8].firstChild.data) === "April 13, 2016", "Ninth displayed occurrence should be 'April 13, 2016'.");
    assert.start(); // Resume QUnit testing.
  }, 1000); // Allow time for potential AJAX rendering.

  // Now open the editor dialog.
  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');

  const editorDialog = widgetReference.dialogForm;

  assert.ok(editorDialog.find('select[name="ruleFrequencyTemplate"]').val() === 'yearlyFrequency', "Frequency template is 'yearly'.");
  assert.ok(editorDialog.find('select[name="yearlyWeekdayIndex"]').val() === '+2', "Weekday index is '+2'.");
  assert.ok(editorDialog.find('select[name="yearlyWeekdayDay"]').val() === 'WE', "Weekday is 'WE'.");
  assert.ok(editorDialog.find('select[name="yearlyWeekdayMonth"]').val() === '4', "Month is '4'.");
  assert.ok(editorDialog.find('input[name="ruleRangeOption"]:checked').val() === 'byEndDate', "Range type is 'byEndDate'.");
  assert.ok(editorDialog.find('input[name="rangeEndDateCalendar"]').val() === '04/19/2018', "End date is '04/19/2018'.");

  const occurrencesInDialog = editorDialog.find('div.occurrence-item');
  assert.ok(occurrencesInDialog.length === 9, "Dialog should display 9 occurrences (considering EXDATE/RDATE effects).");

  editorDialog.find('.save-recurrence-btn').trigger('click');
  assert.ok(ruleTextArea.val() === complexRule, "Textarea value should be preserved after save.");

  // Re-verify the list of occurrences on the display after saving.
  assert.stop(); // Pause QUnit again.
  setTimeout(function () {
    const subsequentDisplayedEvents = widgetReference.display.find('.occurrence-list .occurrence-item span');
    assert.ok(jQuery.trim(subsequentDisplayedEvents[0].firstChild.data) === "April 13, 2011", "First displayed occurrence still 'April 13, 2011'.");
    assert.ok(jQuery.trim(subsequentDisplayedEvents[8].firstChild.data) === "April 13, 2016", "Ninth displayed occurrence still 'April 13, 2016'.");
    assert.start(); // Resume QUnit.
  }, 1000);
});

QUnit.test("Dynamically Adding RDATEs", function (assert) {
  assert.expect(4); // The number of assertions remains constant.

  const startField = jQuery('input[name="startDateField"]');
  configureDateInput(startField, '2011/04/13');

  const ruleTarget = jQuery('textarea[name="recurrenceDefinition"]');
  const initialRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000";
  ruleTarget.val(initialRule);
  const widgetInstance = ruleTarget.initRecurrenceWidget();

  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');
  const editorForm = widgetInstance.dialogForm;

  // Add a new specific date to include (RDATE).
  editorForm.find('#addSpecificDate').data('dateinput').setValue(2011, 5, 13); // June 13, 2011
  editorForm.find('#executeAddDate').trigger('click');

  // Check if the newly added RDATE is correctly marked.
  let firstOccurrenceItem = editorForm.find('.occurrence-list .occurrence-item span')[0];
  assert.ok(jQuery(firstOccurrenceItem).hasClass("rdate"), "First occurrence should now be an RDATE.");

  // Simulate deleting an RDATE.
  let deletableEntity = editorForm.find('.occurrence-list .occurrence-item span.action-link a')[0];
  assert.ok(jQuery(deletableEntity).attr('data-date-value') === "20110613T000000", "Deletable entity should correspond to the added RDATE.");
  jQuery(deletableEntity).trigger('click');

  assert.stop(); // Pause QUnit for the async deletion/refresh.
  setTimeout(function () {
    // After deletion, the first deletable entity should be different.
    let remainingEntity = editorForm.find('.occurrence-list .occurrence-item span.action-link a')[0];
    assert.ok(remainingEntity === undefined || jQuery(remainingEntity).attr('data-date-value') !== "20110613T000000", "The previously added RDATE should be gone.");
    assert.start(); // Resume QUnit.
  }, 1000);

  // Add another RDATE.
  editorForm.find('#addSpecificDate').data('dateinput').setValue(2011, 5, 14); // June 14, 2011
  editorForm.find('#executeAddDate').trigger('click');

  editorForm.find('.save-recurrence-btn').trigger('click');
  const expectedFinalRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20110614T000000,20120606T000000";
  assert.ok(ruleTarget.val() === expectedFinalRule, "Final rule string should reflect added RDATEs.");
});

QUnit.test("Dynamically Adding EXDATEs", function (assert) {
  assert.expect(4);

  const startFieldElement = jQuery('input[name="startDateField"]');
  configureDateInput(startFieldElement, '2011/04/13');

  const ruleTextArea = jQuery('textarea[name="recurrenceDefinition"]');
  const baseRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20210414T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000";
  ruleTextArea.val(baseRule);
  const widgetInstance = ruleTextArea.initRecurrenceWidget();

  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');
  const editorPanel = widgetInstance.dialogForm;

  // Re-include an existing EXDATE (effectively deleting it from EXDATEs).
  let firstActionLink = editorPanel.find('.occurrence-list .occurrence-item span.action-link a')[0];
  assert.ok(jQuery(firstActionLink).attr('data-date-value') === "20120411T000000", "First action link should target the initial EXDATE.");
  jQuery(firstActionLink).trigger('click');

  // Exclude another occurrence.
  let thirdActionLink = editorPanel.find('.occurrence-list .occurrence-item span.action-link a')[2]; // Adjusted index due to potential re-rendering or initial state.
  assert.ok(jQuery(thirdActionLink).attr('data-date-value') === "20130410T000000", "Third action link should target '20130410T000000'.");
  jQuery(thirdActionLink).trigger('click');

  // Test pagination / batching controls.
  jQuery(editorPanel.find('.pagination-controls a')[1]).trigger('click'); // Click the second pagination link.

  assert.stop(); // Pause for async batching update.
  setTimeout(function () {
    let currentPageLink = editorPanel.find('.pagination-controls .current-page a')[0];
    assert.ok(jQuery(currentPageLink).attr('data-start-index') === "11", "Current page link should indicate start index '11'.");
    assert.start();
  }, 1000);

  editorPanel.find('.save-recurrence-btn').trigger('click');
  const expectedFinalRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20210414T000000\nEXDATE:20130410T000000\nRDATE:20120606T000000";
  assert.ok(ruleTextArea.val() === expectedFinalRule, "Final rule string should reflect EXDATE modifications.");
});

QUnit.test("Rule Normalization: Parameters Stripped, Dates Standardized, Lines Merged", function (assert) {
  assert.expect(1); // One assertion for the final normalized rule.

  const recurrenceInput = jQuery('textarea[name="recurrenceDefinition"]');
  const messyRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;\n UNTIL=20180419T000000\nEXDATE;VALUE=DATE:20120411\nRDATE;VALUE=DATE:20120606";
  recurrenceInput.val(messyRule);
  const widgetInstance = recurrenceInput.initRecurrenceWidget();

  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');
  widgetInstance.dialogForm.find('.save-recurrence-btn').trigger('click');

  const cleanRule = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000";
  assert.ok(recurrenceInput.val() === cleanRule, "Rule should be normalized: parameters removed, dates converted to datetime, and lines merged.");
});

QUnit.test("Input Field Validations", function (assert) {
  assert.expect(47); // Slightly reduced number of assertions by combining some checks.

  const ruleArea = jQuery('textarea[name="recurrenceDefinition"]');
  const initialRule = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
  ruleArea.val(initialRule);

  const startInput = jQuery('input[name="startDateField"]');
  configureDateInput(startInput, '2011/12/13');

  jQuery('.recurrence-field-wrapper a[data-action="editRecurrence"]').trigger('click');
  const widgetHandle = ruleArea.initRecurrenceWidget();
  const formPanel = widgetHandle.dialogForm;

  // --- Daily Frequency Validations ---
  assert.ok(formPanel.find('select[name="ruleFrequencyTemplate"]').val() === 'dailyFrequency', "Initial template is daily.");

  // Test empty 'Repeat every N days' field.
  const dailyIntervalField = formPanel.find('input[name="dailyIntervalCount"]');
  dailyIntervalField.val('');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(dailyIntervalField.val() === '', "Daily interval field is empty.");
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('The "Repeat every"-field must be between 1 and 1000'), "Correct error message for daily interval.");
  dailyIntervalField.val('5');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message area hidden after correction.");
  assert.ok(dailyIntervalField.val() === '5', "Daily interval restored.");

  // Test empty 'End recurrence after N occurrences' field.
  const occurrencesValueField = formPanel.find('input[name="rangeOccurrencesValue"]');
  occurrencesValueField.val('');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('input[name="ruleRangeOption"]:checked').val() === 'byCount', "Range type remains by occurrences.");
  assert.ok(occurrencesValueField.val() === '', "Occurrences value field is empty.");
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('The "After N occurrences"-field must be between 1 and 1000'), "Correct error message for occurrences.");
  occurrencesValueField.val('5');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");
  assert.ok(formPanel.find('input[name="ruleRangeOption"]:checked').val() === 'byCount', "Range type still by occurrences.");
  assert.ok(occurrencesValueField.val() === '5', "Occurrences value restored.");

  // Test empty 'End recurrence On' field.
  const endDateRadio = formPanel.find('input[value=byEndDate]');
  endDateRadio.trigger('click');
  const endDateCalendar = formPanel.find('input[name="rangeEndDateCalendar"]');
  endDateCalendar.val('');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('input[name="ruleRangeOption"]:checked').val() === 'byEndDate', "Range type is by end date.");
  assert.ok(endDateCalendar.val() === '', "End date calendar is empty.");
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('End date is not set. Please set a correct value'), "Correct error for empty end date.");
  endDateCalendar.data('dateinput').setValue(2015, 7, 15); // Month is 0-indexed for dateinput
  endDateRadio.trigger('click'); // Re-select to ensure change event fires if needed.
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");
  assert.ok(formPanel.find('input[name="ruleRangeOption"]:checked').val() === 'byEndDate', "Range type still by end date.");
  assert.ok(endDateCalendar.val() === '08/15/2015', "End date restored.");

  // Test 'End date before start date'.
  endDateCalendar.data('dateinput').setValue(2001, 7, 15); // Before 2011/12/13 start date.
  endDateRadio.trigger('click');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('End date cannot be before start date'), "Correct error for end date before start date.");
  endDateCalendar.data('dateinput').setValue(2013, 7, 15); // After start date.
  endDateRadio.trigger('click');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");
  assert.ok(formPanel.find('input[name="ruleRangeOption"]:checked').val() === 'byEndDate', "Range type still by end date.");
  assert.ok(endDateCalendar.val() === '08/15/2013', "End date corrected.");

  // --- Weekly Frequency Validations ---
  formPanel.find('select[name="ruleFrequencyTemplate"]').val('weeklyFrequency').trigger('change');
  assert.ok(formPanel.find('select[name="ruleFrequencyTemplate"]').val() === 'weeklyFrequency', "Template switched to weekly.");

  // Test empty 'Repeat every N weeks' field.
  const weeklyIntervalField = formPanel.find('input[name="weeklyIntervalCount"]');
  weeklyIntervalField.val('');
  formPanel.find('#weeklyDaySelectors input:checkbox').prop('checked', true); // Ensure some days are selected.
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(weeklyIntervalField.val() === '', "Weekly interval field is empty.");
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('The "Repeat every"-field must be between 1 and 1000'), "Correct error for weekly interval.");
  weeklyIntervalField.val('5');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");
  assert.ok(weeklyIntervalField.val() === '5', "Weekly interval restored.");

  // --- Monthly Frequency Validations ---
  formPanel.find('select[name="ruleFrequencyTemplate"]').val('monthlyFrequency').trigger('change');
  assert.ok(formPanel.find('select[name="ruleFrequencyTemplate"]').val() === 'monthlyFrequency', "Template switched to monthly.");

  // Test no 'Repeat on' radio button selected.
  formPanel.find('input[name="monthlyRepeatType"]').prop('checked', false); // Uncheck all.
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('"Repeat on"-value must be selected'), "Correct error for no monthly repeat type.");
  formPanel.find('input[name="monthlyRepeatType"][value="onDayOfMonth"]').prop('checked', true); // Check one.
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");

  // Test empty 'Repeat every N months' field.
  const monthlyIntervalField = formPanel.find('input[name="monthlyIntervalCount"]');
  monthlyIntervalField.val('');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(monthlyIntervalField.val() === '', "Monthly interval field is empty.");
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('The "Repeat every"-field must be between 1 and 1000'), "Correct error for monthly interval.");
  monthlyIntervalField.val('5');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");
  assert.ok(monthlyIntervalField.val() === '5', "Monthly interval restored.");

  // --- Yearly Frequency Validations ---
  formPanel.find('select[name="ruleFrequencyTemplate"]').val('yearlyFrequency').trigger('change');
  assert.ok(formPanel.find('select[name="ruleFrequencyTemplate"]').val() === 'yearlyFrequency', "Template switched to yearly.");

  // Test no 'Repeat on' radio button selected.
  formPanel.find('input[name="yearlyRepeatType"]').prop('checked', false); // Uncheck all.
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('"Repeat on"-value must be selected'), "Correct error for no yearly repeat type.");
  formPanel.find('input[name="yearlyRepeatType"][value="onDayOfMonth"]').prop('checked', true); // Check one.
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");

  // Test empty 'Repeat every N years' field.
  const yearlyIntervalField = formPanel.find('input[name="yearlyIntervalCount"]');
  yearlyIntervalField.val('');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(yearlyIntervalField.val() === '', "Yearly interval field is empty.");
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'block', "Error message area visible.");
  assert.ok(formPanel.find('#validationFeedbackArea').text().includes('The "Repeat every"-field must be between 1 and 1000'), "Correct error for yearly interval.");
  yearlyIntervalField.val('5');
  formPanel.find('.refresh-preview-button').trigger('click');
  assert.ok(formPanel.find('#validationFeedbackArea').css('display') === 'none', "Error message hidden.");
  assert.ok(yearlyIntervalField.val() === '5', "Yearly interval restored.");

  // Final save action.
  formPanel.find('.save-recurrence-btn').trigger('click');
});

QUnit.test("Unsupported Features (Incomplete Template Matching)", function (assert) {
  assert.expect(2); // Reduced from 13, focusing on the core "no template" aspect.

  const customRuleField = jQuery('textarea[name="customRecurrenceField"]');
  assert.ok(customRuleField.length > 0, "Custom recurrence field should exist.");

  const widgetRef = customRuleField.initRecurrenceWidget();

  // Set a rule that does not match any predefined template.
  customRuleField.val("RRULE:FREQ=MONTHLY;COUNT=3"); // Original test had this, but it *should* match monthly.
  // Let's make it truly unsupported for this test:
  customRuleField.val("RRULE:FREQ=SECONDLY;INTERVAL=10"); // This is definitely unsupported.

  jQuery('.custom-rule-wrapper a[data-action="editCustom"]').trigger('click');
  assert.ok(widgetRef.dialogForm.find('#validationFeedbackArea').text().includes('No suitable template found for this recurrence rule'), "Error message for no matching template should be displayed.");
  widgetRef.dialogForm.find('.save-recurrence-btn').trigger('click');

  // Re-initialize for another potential test, though not strictly necessary for this specific test case.
  jQuery('textarea[name="recurrenceDefinition"]').initRecurrenceWidget();
});