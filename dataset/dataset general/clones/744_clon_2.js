/* linting_config: indent_level_4 */
/* global_deps: jq_sel, assert_is_true, test_group, test_case, pause_tests, resume_tests, expected_assertions */

test_group("recurrence_entry_plugin_tests");


// HELPER_FUNCTION

function assign_date_val(dom_elem, input_dt_str) {
  // Populates a date string into a specified input DOM element.
  // The input date is expected in the YYYY/MM/DD structure.
  // Modern browser date inputs (e.g., Chrome v20) necessitate the YYYY-MM-DD ISO format.
  dom_elem.get_set_value(input_dt_str);

  if (!dom_elem.get_set_value()) {
    // If the value isn't set, it might be a contemporary date input requiring ISO format.
    dom_elem.get_set_value(input_dt_str.swap_chars(/\//g, '-'));
  }
}


// Test_Scenarios

test_case("Fundamental_Operations", function () {
  expected_assertions(2);

  // This segment initializes the text area for recurrence rules and activates the associated modal interface.
  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  var recurrence_rule_text = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  // Subsequently, the configuration is persisted.
  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);

  // The modal is then reopened, and subsequently dismissed via the cancellation button.
  jq_sel('.repeatfield a[name=riedit]').trigger_click();
  recur_widget_instance.form.locate_elements('.ricancelbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.check_state(':visible'));
});

test_case("Incorrect_iCalendar_Format", function () {
  expected_assertions(1);

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  // Although seemingly valid, the input string lacks the essential RRULE component.
  jq_sel("textarea[name=repeat]").get_set_value("FREQ=MONTHLY;COUNT=3");
  jq_sel('.repeatfield a[name=riedit]').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content().find_substring_pos('No RRULE in RRULE data') !== -1);
  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
});

test_case("Empty_Recurrence_Rule_Limits_Options", function () {
  expected_assertions(2);

  // This part configures the text area's rule and activates the associated editor modal.
  var recurrence_rule_text = "";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYOCCURRENCES');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyoccurrencesvalue]').get_set_value() === '10');
  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
});

test_case("Daily_Pattern_With_Specific_Count", function () {
  expected_assertions(5);

  // Establishes the recurrence rule in the text field and opens the editor.
  var recurrence_rule_text = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'daily');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=ridailyinterval]').get_set_value() === '5');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYOCCURRENCES');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyoccurrencesvalue]').get_set_value() === '8');

  // The updated configuration is then saved.
  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);
});

test_case("Weekly_Pattern_With_Selected_Days_And_End_Date", function () {
  expected_assertions(12);

  // Define a recurring event rule and bring up its editing interface.
  var recurrence_rule_text = "RRULE:FREQ=WEEKLY;INTERVAL=4;BYDAY=TU,TH,FR;UNTIL=20120922T000000";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'weekly');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riweeklyinterval]').get_set_value() === '4');
  assert_is_true(!recur_widget_instance.form.locate_elements('input[name=riweeklyweekdaysMO]').get_set_attribute('checked'));
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riweeklyweekdaysTU]').get_set_attribute('checked'));
  assert_is_true(!recur_widget_instance.form.locate_elements('input[name=riweeklyweekdaysWE]').get_set_attribute('checked'));
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riweeklyweekdaysTH]').get_set_attribute('checked'));
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riweeklyweekdaysFR]').get_set_attribute('checked'));
  assert_is_true(!recur_widget_instance.form.locate_elements('input[name=riweeklyweekdaysSA]').get_set_attribute('checked'));
  assert_is_true(!recur_widget_instance.form.locate_elements('input[name=riweeklyweekdaysSU]').get_set_attribute('checked'));
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYENDDATE');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_value() === '09/22/2012');

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);

});

test_case("BiMonthly_Pattern_By_Specific_Day_Of_Month", function () {
  expected_assertions(5);

  // Prepares a recurrence rule and opens the associated editor.
  var recurrence_rule_text = "RRULE:FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=12";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'monthly');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rimonthlytype]:checked').get_set_value() === 'DAYOFMONTH');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rimonthlyinterval]').get_set_value() === '2');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'NOENDDATE');

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);

});

test_case("TriMonthly_Pattern_By_Weekday_Occurrence", function () {
  expected_assertions(7);

  // Defines a recurrence rule and opens the editing interface for it.
  var recurrence_rule_text = "RRULE:FREQ=MONTHLY;INTERVAL=3;BYDAY=+3TH";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'monthly');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rimonthlytype]:checked').get_set_value() === 'WEEKDAYOFMONTH');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rimonthlyweekdayofmonthindex]').get_set_value() === '+3');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rimonthlyweekdayofmonth]').get_set_value() === 'TH');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rimonthlyinterval]').get_set_value() === '3');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'NOENDDATE');

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);

});

test_case("Annual_Pattern_By_Month_Day_No_End", function () {
  expected_assertions(7);

  // This rule describes the second Wednesday of April, perpetually.
  var recurrence_rule_text = "RRULE:FREQ=YEARLY;INTERVAL=3;BYMONTH=4;BYMONTHDAY=11";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'yearly');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riyearlyinterval]').get_set_value() === '3');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riyearlyType]:checked').get_set_value() === 'DAYOFMONTH');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlydayofmonthmonth]').get_set_value() === '4');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlydayofmonthday]').get_set_value() === '11');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'NOENDDATE');

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);

});

test_case("Annual_Pattern_By_Weekday_Occurrence_No_End", function () {
  expected_assertions(6);

  // This defines the second Wednesday in April, indefinitely.
  var recurrence_rule_text = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'yearly');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlyweekdayofmonthindex]').get_set_value() === '+2');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlyweekdayofmonthday]').get_set_value() === 'WE');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlyweekdayofmonthmonth]').get_set_value() === '4');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'NOENDDATE');

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);

});

test_case("Verification_Of_Start_Date_Linkage_And_Occurrence_Display", function () {
  expected_assertions(1);

  // Configures the initial date to validate the XML-related JavaScript functionality.
  assign_date_val(jq_sel("input[name=start]"), '2011/04/13');

  // This rule specifies the second Wednesday of April, indefinitely.
  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  var recurrence_rule_text = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();
  var event_occurrences = recur_widget_instance.form.locate_elements('div.occurrence');
  assert_is_true(event_occurrences.length === 10);

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();

});

test_case("Recurrence_Dates_And_Exclusion_Dates_Handling", function () {
  expected_assertions(12);

  // Establishes the initial date for validating asynchronous request behavior.
  assign_date_val(jq_sel("input[name=start]"), '2011/04/13');

  // The recurring event is the second Wednesday of April, ending in 2020, excluding 2012, but specifically including June 6th, 2012.
  var recurrence_rule_text = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();

  // Confirms the accuracy of the generated date list.
  pause_tests(); // Introduce a 1-second delay to allow the asynchronous request to complete.
  setTimeout(function () {
    var event_occurrences = recur_widget_instance.display.locate_elements('.rioccurrences .occurrence span');
    assert_is_true(jq_sel.remove_whitespace(event_occurrences[0].first_child_node.data) === "April 13, 2011");
    assert_is_true(jq_sel.remove_whitespace(event_occurrences[8].first_child_node.data) === "April 13, 2016");
    resume_tests();
  }, 1000);


  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'yearly');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlyweekdayofmonthindex]').get_set_value() === '+2');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlyweekdayofmonthday]').get_set_value() === 'WE');
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=riyearlyweekdayofmonthmonth]').get_set_value() === '4');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYENDDATE');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_value() === '04/19/2018');

  var event_occurrences_form = recur_widget_instance.form.locate_elements('div.occurrence');
  assert_is_true(event_occurrences_form.length === 9);

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === recurrence_rule_text);

  // Re-validation of the displayed date collection.
  pause_tests(); // A one-second pause is inserted to ensure the Ajax request has fully processed.
  setTimeout(function () {
    var event_occurrences_display = recur_widget_instance.display.locate_elements('.rioccurrences .occurrence span');
    assert_is_true(jq_sel.remove_whitespace(event_occurrences_display[0].first_child_node.data) === "April 13, 2011");
    assert_is_true(jq_sel.remove_whitespace(event_occurrences_display[8].first_child_node.data) === "April 13, 2016");
    resume_tests();
  }, 1000);


});

test_case("Inclusion_Of_Recurrence_Dates", function () {
  expected_assertions(4);

  // Sets the initial date for evaluating asynchronous request functionality.
  assign_date_val(jq_sel("input[name=start]"), '2011/04/13');

  // The recurring event is the second Wednesday of April, terminating in 2020, excluding 2012, but specifically including June 6th, 2012.
  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  var recurrence_rule_text = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  // Appends a novel date as an RDATE entry.
  recur_widget_instance.form.locate_elements('#adddate').get_set_data('dateinput').assign_date_val_to_input(2011, 5, 13);
  recur_widget_instance.form.locate_elements('#addaction').trigger_click();
  // Verifies the successful addition of the date.
  var current_entity = recur_widget_instance.form.locate_elements('.rioccurrences .occurrence span')[0];
  assert_is_true(current_entity.attributes['class'].value === "rdate");

  // Proceeds to remove the entry.
  current_entity = recur_widget_instance.form.locate_elements('.rioccurrences .occurrence span.action a')[0];
  assert_is_true(current_entity.attributes.date.value === "20110613T000000");
  jq_sel(current_entity).trigger_click();

  // A delay of one second is introduced.
  pause_tests();
  setTimeout(function () { // For jQuery versions 1.6 and above, this could be refactored using a .promise().done() chain.
    // Confirms the removal of the item.
    current_entity = recur_widget_instance.form.locate_elements('.rioccurrences .occurrence span.action a')[0];
    assert_is_true(current_entity.attributes.date.value !== "20110613T000000");
    resume_tests();
  }, 1000);

  // A subsequent entry is then added.
  recur_widget_instance.form.locate_elements('#adddate').get_set_data('dateinput').assign_date_val_to_input(2011, 5, 14);
  recur_widget_instance.form.locate_elements('#addaction').trigger_click();

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20110614T000000,20120606T000000");

});

test_case("Exclusion_Dates_Management", function () {
  expected_assertions(4);

  // Configures the starting date to assess the asynchronous request handling.
  assign_date_val(jq_sel("input[name=start]"), '2011/04/13');

  // The recurring event is the second Wednesday of April, terminating in 2020, excluding 2012, but specifically including June 6th, 2012.
  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  var recurrence_rule_text = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20210414T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  // Reintegrates the exclusion date initially present in the recurrence rule.
  var current_entity = recur_widget_instance.form.locate_elements('.rioccurrences .occurrence span.action a')[0];
  assert_is_true(current_entity.attributes.date.value === "20120411T000000");
  jq_sel(current_entity).trigger_click();

  // Designates an additional date for exclusion.
  current_entity = recur_widget_instance.form.locate_elements('.rioccurrences .occurrence span.action a')[2];
  assert_is_true(current_entity.attributes.date.value === "20130410T000000");
  jq_sel(current_entity).trigger_click();

  // Examines the batching mechanism.
  jq_sel(recur_widget_instance.form.locate_elements('.rioccurrences .batching a')[1]).trigger_click();
  // Pauses execution for one second.
  pause_tests();
  setTimeout(function () { // For jQuery versions 1.6 and newer, this functionality could be achieved using a .promise().done() construct.
    // Confirms the removal.
    current_entity = recur_widget_instance.form.locate_elements('.rioccurrences .batching .current a')[0];
    assert_is_true(current_entity.attributes.start.value === "11");
    resume_tests();
  }, 1000);

  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20210414T000000\nEXDATE:20130410T000000\nRDATE:20120606T000000");

});

test_case("Parameter_Stripping_Date_Conversion_Line_Merging", function () {
  // NOTE: It is hypothesized, though requiring verification, that the inverse behavior is the correct approach.
  // The system should enforce that EXDATES and RDATES are strictly DATE type values.
  expected_assertions(1);

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();
  var recurrence_rule_text = "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;\n UNTIL=20180419T000000\nEXDATE;VALUE=DATE:20120411\nRDATE;VALUE=DATE:20120606";
  jq_sel("textarea[name=repeat]").get_set_value(recurrence_rule_text);
  jq_sel('.repeatfield a[name=riedit]').trigger_click();
  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
  assert_is_true(jq_sel("textarea[name=repeat]").get_set_value() === "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000");

});

test_case("Input_Form_Validation_Checks", function () {
  expected_assertions(49);

  // Configures the recurrence rule within the text area and launches the editing interface.
  var recurrence_rule_text = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
  jq_sel('textarea[name=repeat]').get_set_value(recurrence_rule_text);

  assign_date_val(jq_sel("input[name=start]"), '2011/12/13');

  jq_sel('.repeatfield a[name=riedit]').trigger_click();

  var recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();

  // Daily Frequency Configuration
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'daily');

  // Validation for an empty 'Repeat every N days' input field.
  recur_widget_instance.form.locate_elements('input[name=ridailyinterval]').get_set_value('');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=ridailyinterval]').get_set_value() === '');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: The "Repeat every"-field must be between 1 and 1000');
  recur_widget_instance.form.locate_elements('input[name=ridailyinterval]').get_set_value('5');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=ridailyinterval]').get_set_value() === '5');

  // Validation for an empty 'End recurrence after N occurrences' input.
  recur_widget_instance.form.locate_elements('input[name=rirangebyoccurrencesvalue]').get_set_value('');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYOCCURRENCES');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyoccurrencesvalue]').get_set_value() === '');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: The "After N occurrences"-field must be between 1 and 1000');
  recur_widget_instance.form.locate_elements('input[name=rirangebyoccurrencesvalue]').get_set_value('5');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYOCCURRENCES');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyoccurrencesvalue]').get_set_value() === '5');

  // Tests validation for an empty 'End recurrence On' date field.
  recur_widget_instance.form.locate_elements('input[value=BYENDDATE]').trigger_click();
  recur_widget_instance.form.locate_elements('input[name =rirangebyenddatecalendar]').get_set_value('');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYENDDATE');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_value() === '');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: End date is not set. Please set a correct value');
  recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_data('dateinput').assign_date_val_to_input(2015, 7, 15);
  recur_widget_instance.form.locate_elements('input[value=BYENDDATE]').trigger_click();
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYENDDATE');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_value() === '08/15/2015');

  // Checks the scenario where the end date precedes the start date.
  recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_data('dateinput').assign_date_val_to_input(2001, 7, 15);
  recur_widget_instance.form.locate_elements('input[value=BYENDDATE]').trigger_click();
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: End date cannot be before start date');
  recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_data('dateinput').assign_date_val_to_input(2013, 7, 15);
  recur_widget_instance.form.locate_elements('input[value=BYENDDATE]').trigger_click();
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangetype]:checked').get_set_value() === 'BYENDDATE');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rirangebyenddatecalendar]').get_set_value() === '08/15/2013');

  // Weekly Frequency Configuration
  recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value('weekly').trigger_change_event();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'weekly');

  // Validates the 'Repeat every N days' field when left blank.
  recur_widget_instance.form.locate_elements('input[name=riweeklyinterval]').get_set_value('');
  recur_widget_instance.form.locate_elements('#riweeklyweekdays input:checkbox').get_set_attribute('checked', true);
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riweeklyinterval]').get_set_value() === '');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: The "Repeat every"-field must be between 1 and 1000');
  recur_widget_instance.form.locate_elements('input[name=riweeklyinterval]').get_set_value('5');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riweeklyinterval]').get_set_value() === '5');

  // Monthly Frequency Configuration
  recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value('monthly').trigger_change_event();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'monthly');

  // Ensures a 'Repeat on' radio option is chosen.
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: "Repeat on"-value must be selected');
  recur_widget_instance.form.locate_elements('input[name=rimonthlytype]').get_set_attribute('checked', true);
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');

  // Verifies validation for an empty 'Repeat every N days' field.
  recur_widget_instance.form.locate_elements('input[name=rimonthlyinterval]').get_set_value('');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rimonthlyinterval]').get_set_value() === '');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: The "Repeat every"-field must be between 1 and 1000');
  recur_widget_instance.form.locate_elements('input[name=rimonthlyinterval]').get_set_value('5');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=rimonthlyinterval]').get_set_value() === '5');

  // Yearly Frequency Configuration
  recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value('yearly').trigger_change_event();
  assert_is_true(recur_widget_instance.form.locate_elements('select[name=rirtemplate]').get_set_value() === 'yearly');

  // Asserts that a 'Repeat on' radio button is chosen.
  recur_widget_instance.form.locate_elements('input[name=riyearlyType]').get_set_attribute('checked', false);
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: "Repeat on"-value must be selected');
  recur_widget_instance.form.locate_elements('input[name=riyearlyType]').get_set_attribute('checked', true);
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');

  // Validates the 'Repeat every N days' field when empty.
  recur_widget_instance.form.locate_elements('input[name=riyearlyinterval]').get_set_value('');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riyearlyinterval]').get_set_value() === '');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'block');
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content() === 'Error: The "Repeat every"-field must be between 1 and 1000');
  recur_widget_instance.form.locate_elements('input[name=riyearlyinterval]').get_set_value('5');
  recur_widget_instance.form.locate_elements('.rirefreshbutton').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_set_style('display') === 'none');
  assert_is_true(recur_widget_instance.form.locate_elements('input[name=riyearlyinterval]').get_set_value() === '5');

  // The configuration is then committed to storage.
  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();
});

test_case("Partial_Unsupported_Features_Evaluation", function () {

  expected_assertions(13);

  var recur_widget_instance = jq_sel("textarea[name=custom]").repeat_entry_widget();

  // Scenario where no suitable template is found.
  jq_sel("textarea[name=custom]").get_set_value("RRULE:FREQ=MONTHLY;COUNT=3");
  jq_sel('.customfield a[name=riedit]').trigger_click();
  assert_is_true(recur_widget_instance.form.locate_elements('#messagearea').get_text_content().find_substring_pos('No matching recurrence template') !== -1);
  recur_widget_instance.form.locate_elements('.risavebutton').trigger_click();

  recur_widget_instance = jq_sel("textarea[name=repeat]").repeat_entry_widget();