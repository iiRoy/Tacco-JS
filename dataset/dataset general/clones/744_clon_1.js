/*jslint indent: 4 */
/*global $, ok, module, test, stop, start, expect */

/*
 * QUnit module definition for the jquery.recurrenceinput widget.
 * This helps organize the tests for the specific widget.
 */
module  (  "jquery.recurrenceinput widget"   ) ;



// --- HELPER FUNCTIONS ---
// These are utility functions used across multiple tests.

/*
 * Sets a date value on a given input element.
 *
 * @param {jQuery} ele - The jQuery wrapped input element.
 * @param {string} date - The date string, initially in 'YYYY/MM/DD' format.
 *                        Handles conversion to 'YYYY-MM-DD' for certain browsers (e.g., Chrome 20).
 */
function  set_date_value(  ele  ,  date  )
{
    // Attempt to set the date using the provided format.
    ele.val(  date  ) ;

    /*
     * Some browser implementations (like Chromium 20 for date inputs)
     * might not accept 'YYYY/MM/DD' and require 'YYYY-MM-DD' (ISO format).
     * This check ensures compatibility.
     */
    if   (  !ele.val()  )
    {
        // If setting the value failed, try the ISO format.
        ele.val(  date.replace(  /\//g,  '-'  )  ) ;
    }
}



// --- TEST SUITE ---
// This section contains all the QUnit tests for the recurrence input widget.

test(  "Basics"  ,  function  ()
{
    // Expecting 2 assertions to pass in this test.
    expect(  2  ) ;

    // Initialize the recurrence input widget on the designated textarea.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Define a sample recurrence rule string.
    var   rrule   =   "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8" ;

    // Set the initial value of the textarea with the recurrence rule.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Simulate clicking the "edit" link to open the recurrence dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Simulate clicking the save button within the dialog.
    // This should persist the current rule (which is 'rrule' in this case).
    input.form.find(  '.risavebutton'  ).click() ;

    // Assert that the textarea's value is still the original recurrence rule after saving.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;

    // Open the dialog box again.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Simulate clicking the cancel button.
    // This should close the dialog without saving any changes.
    input.form.find(  '.ricancelbutton'  ).click() ;

    // Assert that the dialog form is still visible after clicking cancel.
    // (This might be a bug or specific behavior being tested, as usually cancel closes it).
    ok(  input.form.is(  ':visible'  )  ) ;
}  ) ;

test(  "Invalid ical data"  ,  function  ()
{
    // Expecting 1 assertion.
    expect(  1  ) ;

    // Initialize the recurrence input.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Set a value that looks like an iCal rule but is missing "RRULE:".
    $(  "textarea[name=repeat]"  ).val(  "FREQ=MONTHLY;COUNT=3"  ) ;

    // Open the edit dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Verify that an error message indicating missing RRULE is displayed.
    ok(  input.form.find(  '#messagearea'  ).text().indexOf(  'No RRULE in RRULE data'  )   !==   -1  ) ;

    // Attempt to save the invalid data.
    input.form.find(  '.risavebutton'  ).click() ;
}  ) ;

test(  "No recurrence rule opens empty form with limited Recurrence Type to prevent unlimited Recurrences."  ,  function  ()
{
    // Expect 2 assertions.
    expect(  2  ) ;

    // Start with an empty recurrence rule in the textarea.
    var   rrule   =   "" ;
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Initialize the widget.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Open the dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Assert that 'BYOCCURRENCES' is the default selected recurrence range type.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYOCCURRENCES'  ) ;

    // Assert that the default number of occurrences is '10'.
    ok(  input.form.find(  'input[name=rirangebyoccurrencesvalue]'  ).val()   ===   '10'  ) ;

    // Save the default settings.
    input.form.find(  '.risavebutton'  ).click() ;
}  ) ;

test(  "Daily recurrence with count"  ,  function  ()
{
    // Expect 5 assertions.
    expect(  5  ) ;

    // Define a daily recurrence rule with an interval and count.
    var   rrule   =   "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8" ;

    // Set the textarea value.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the edit dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Initialize the widget (re-initializing is common in QUnit tests to ensure fresh state).
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Assert that the 'daily' template is selected.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'daily'  ) ;

    // Assert the daily interval value.
    ok(  input.form.find(  'input[name=ridailyinterval]'  ).val()   ===   '5'  ) ;

    // Assert that 'BYOCCURRENCES' range type is selected.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYOCCURRENCES'  ) ;

    // Assert the count of occurrences.
    ok(  input.form.find(  'input[name=rirangebyoccurrencesvalue]'  ).val()   ===   '8'  ) ;

    // Save the recurrence rule.
    input.form.find(  '.risavebutton'  ).click() ;

    // Verify the textarea content matches the original rule.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;
}  ) ;

test(  "Weekly recurrence with days and end"  ,  function  ()
{
    // Expect 12 assertions for this test case.
    expect(  12  ) ;

    // Define a complex weekly recurrence rule.
    var   rrule   =   "RRULE:FREQ=WEEKLY;INTERVAL=4;BYDAY=TU,TH,FR;UNTIL=20120922T000000" ;

    // Set the rule in the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the widget's edit dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Get the widget instance.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Assert that the 'weekly' template is selected.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'weekly'  ) ;

    // Assert the weekly interval.
    ok(  input.form.find(  'input[name=riweeklyinterval]'  ).val()   ===   '4'  ) ;

    // Assert the selected weekdays (TU, TH, FR).
    ok(  !input.form.find(  'input[name=riweeklyweekdaysMO]'  ).attr(  'checked'  )  ) ;
    ok(  input.form.find(  'input[name=riweeklyweekdaysTU]'  ).attr(  'checked'  )  ) ;
    ok(  !input.form.find(  'input[name=riweeklyweekdaysWE]'  ).attr(  'checked'  )  ) ;
    ok(  input.form.find(  'input[name=riweeklyweekdaysTH]'  ).attr(  'checked'  )  ) ;
    ok(  input.form.find(  'input[name=riweeklyweekdaysFR]'  ).attr(  'checked'  )  ) ;
    ok(  !input.form.find(  'input[name=riweeklyweekdaysSA]'  ).attr(  'checked'  )  ) ;
    ok(  !input.form.find(  'input[name=riweeklyweekdaysSU]'  ).attr(  'checked'  )  ) ;

    // Assert that the recurrence ends by date.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYENDDATE'  ) ;

    // Assert the end date value.
    ok(  input.form.find(  'input[name=rirangebyenddatecalendar]'  ).val()   ===   '09/22/2012'  ) ;

    // Save the changes.
    input.form.find(  '.risavebutton'  ).click() ;

    // Final assertion: the textarea value should remain the same as the initial rule.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;
}  ) ;

test(  "Bimonthly recurrence by month day"  ,  function  ()
{
    // Expect 5 assertions.
    expect(  5  ) ;

    // Define a bimonthly recurrence rule based on a specific day of the month.
    var   rrule   =   "RRULE:FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=12" ;

    // Set the textarea value with the rule.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the recurrence input dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Get the widget instance.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Assert that the 'monthly' template is active.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'monthly'  ) ;

    // Assert that 'DAYOFMONTH' is the selected monthly recurrence type.
    ok(  input.form.find(  'input[name=rimonthlytype]:checked'  ).val()   ===   'DAYOFMONTH'  ) ;

    // Assert the monthly interval.
    ok(  input.form.find(  'input[name=rimonthlyinterval]'  ).val()   ===   '2'  ) ;

    // Assert that 'NOENDDATE' is selected for the recurrence range.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'NOENDDATE'  ) ;

    // Save the configuration.
    input.form.find(  '.risavebutton'  ).click() ;

    // Verify the saved rule matches the original.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;
}  ) ;

test(  "Trimonthly recurrence by day"  ,  function  ()
{
    // Expect 7 assertions for this test.
    expect(  7  ) ;

    // Define a trimonthly recurrence rule based on the Nth weekday of the month.
    var   rrule   =   "RRULE:FREQ=MONTHLY;INTERVAL=3;BYDAY=+3TH" ;

    // Set the rule in the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the recurrence editor.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Obtain the recurrence input widget instance.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Verify the selected template is 'monthly'.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'monthly'  ) ;

    // Verify 'WEEKDAYOFMONTH' is the selected monthly recurrence type.
    ok(  input.form.find(  'input[name=rimonthlytype]:checked'  ).val()   ===   'WEEKDAYOFMONTH'  ) ;

    // Verify the index (e.g., +3 for third).
    ok(  input.form.find(  'select[name=rimonthlyweekdayofmonthindex]'  ).val()   ===   '+3'  ) ;

    // Verify the day of the week (e.g., TH for Thursday).
    ok(  input.form.find(  'select[name=rimonthlyweekdayofmonth]'  ).val()   ===   'TH'  ) ;

    // Verify the interval.
    ok(  input.form.find(  'input[name=rimonthlyinterval]'  ).val()   ===   '3'  ) ;

    // Verify that 'NOENDDATE' is selected for the recurrence range.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'NOENDDATE'  ) ;

    // Click the save button to apply changes.
    input.form.find(  '.risavebutton'  ).click() ;

    // Assert that the textarea's value matches the original rule.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;
}  ) ;

test(  "Yearly by month day recurrence without end"  ,  function  ()
{
    // Expect 7 assertions.
    expect(  7  ) ;

    // Define a yearly recurrence rule: 11th of April, every 3 years, indefinitely.
    var   rrule   =   "RRULE:FREQ=YEARLY;INTERVAL=3;BYMONTH=4;BYMONTHDAY=11" ;

    // Set the recurrence rule in the designated textarea element.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Simulate a click on the edit link to open the recurrence input dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Get a reference to the recurrence input widget instance.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Assert that the 'yearly' template is currently selected in the form.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'yearly'  ) ;

    // Assert that the yearly interval is set to '3'.
    ok(  input.form.find(  'input[name=riyearlyinterval]'  ).val()   ===   '3'  ) ;

    // Assert that the 'DAYOFMONTH' option for yearly recurrence is checked.
    ok(  input.form.find(  'input[name=riyearlyType]:checked'  ).val()   ===   'DAYOFMONTH'  ) ;

    // Assert that the month for the day-of-month recurrence is '4' (April).
    ok(  input.form.find(  'select[name=riyearlydayofmonthmonth]'  ).val()   ===   '4'  ) ;

    // Assert that the day for the day-of-month recurrence is '11'.
    ok(  input.form.find(  'select[name=riyearlydayofmonthday]'  ).val()   ===   '11'  ) ;

    // Assert that the recurrence range type is set to 'NOENDDATE'.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'NOENDDATE'  ) ;

    // Simulate clicking the save button in the dialog.
    input.form.find(  '.risavebutton'  ).click() ;

    // Final assertion: verify that the textarea's value is still the original recurrence rule.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;
}  ) ;

test(  "Yearly byday recurrence without end"  ,  function  ()
{
    // Expect 6 assertions.
    expect(  6  ) ;

    // Define a yearly recurrence rule: the second Wednesday of April, indefinitely.
    var   rrule   =   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE" ;

    // Set the recurrence rule in the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the recurrence editor dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Get the recurrence input widget instance.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Assert that the 'yearly' template is selected.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'yearly'  ) ;

    // Assert the index of the weekday (e.g., +2 for second).
    ok(  input.form.find(  'select[name=riyearlyweekdayofmonthindex]'  ).val()   ===   '+2'  ) ;

    // Assert the specific weekday (e.g., WE for Wednesday).
    ok(  input.form.find(  'select[name=riyearlyweekdayofmonthday]'  ).val()   ===   'WE'  ) ;

    // Assert the month (e.g., 4 for April).
    ok(  input.form.find(  'select[name=riyearlyweekdayofmonthmonth]'  ).val()   ===   '4'  ) ;

    // Assert that the recurrence has no end date.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'NOENDDATE'  ) ;

    // Save the configuration.
    input.form.find(  '.risavebutton'  ).click() ;

    // Verify the textarea content matches the original rule.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;
}  ) ;

test(  "Test of connected start field and showing of occurrences"  ,  function  ()
{
    // Expect 1 assertion in this test case.
    expect(  1  ) ;

    // Set a specific start date for the event. This is crucial for recurrence calculations.
    set_date_value(  $(  "input[name=start]"  )  ,  '2011/04/13'  ) ;

    // Define a yearly recurrence rule: the second Wednesday of April, indefinitely.
    var   rrule   =   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE" ;

    // Initialize the recurrence input widget on the designated textarea.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Set the recurrence rule in the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the recurrence editor dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Find all displayed occurrences within the form.
    var   occurrences   =   input.form.find(  'div.occurrence'  ) ;

    // Assert that exactly 10 occurrences are displayed.
    // This number is typically a default limit for previewing occurrences.
    ok(  occurrences.length   ===   10  ) ;

    // Save the current recurrence rule.
    input.form.find(  '.risavebutton'  ).click() ;
}  ) ;

test(  "RDATE and EXDATE"  ,  function  ()
{
    // Expect 12 assertions within this test function.
    expect(  12  ) ;

    // Set the start date for the event, which influences recurrence calculations.
    set_date_value(  $(  "input[name=start]"  )  ,  '2011/04/13'  ) ;

    // Define a complex recurrence rule including UNTIL, EXDATE, and RDATE.
    var   rrule   =   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000" ;

    // Set the defined recurrence rule into the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Initialize the recurrence input widget.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // --- Verify the list of displayed dates (initial display, before dialog opens) ---
    // QUnit's 'stop()' pauses the test until 'start()' is called.
    // This is necessary because recurrence calculations often involve asynchronous AJAX requests.
    stop() ;
    setTimeout(  function  ()
    {
        // After a delay, retrieve the displayed occurrences.
        var   occurrences   =   input.display.find(  '.rioccurrences .occurrence span'  ) ;

        // Assert the text content of the first occurrence.
        ok(  $.trim(  occurrences[0].firstChild.data  )   ===   "April 13, 2011"  ) ;

        // Assert the text content of the ninth occurrence (index 8).
        ok(  $.trim(  occurrences[8].firstChild.data  )   ===   "April 13, 2016"  ) ;

        // Resume QUnit testing.
        start() ;
    },   1000   ) ; // Wait for 1 second to allow AJAX to complete.


    // Simulate clicking the edit link to open the recurrence dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Assert that the 'yearly' template is selected.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'yearly'  ) ;

    // Assert the index of the weekday.
    ok(  input.form.find(  'select[name=riyearlyweekdayofmonthindex]'  ).val()   ===   '+2'  ) ;

    // Assert the specific weekday.
    ok(  input.form.find(  'select[name=riyearlyweekdayofmonthday]'  ).val()   ===   'WE'  ) ;

    // Assert the month.
    ok(  input.form.find(  'select[name=riyearlyweekdayofmonthmonth]'  ).val()   ===   '4'  ) ;

    // Assert that the recurrence ends by date.
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYENDDATE'  ) ;

    // Assert the end date value.
    ok(  input.form.find(  'input[name=rirangebyenddatecalendar]'  ).val()   ===   '04/19/2018'  ) ;

    // Get the list of occurrences displayed within the dialog.
    var   occurrences   =   input.form.find(  'div.occurrence'  ) ;

    // Assert the number of occurrences displayed in the dialog.
    ok(  occurrences.length   ===   9  ) ;

    // Click the save button to close the dialog and apply changes.
    input.form.find(  '.risavebutton'  ).click() ;

    // Assert that the textarea's value matches the original rule after saving.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   rrule  ) ;

    // --- Verify the list of displayed dates again (after dialog closes) ---
    stop() ; // Pause QUnit again for AJAX.
    setTimeout(  function  ()
    {
        var   occurrences   =   input.display.find(  '.rioccurrences .occurrence span'  ) ;

        // Re-assert the first occurrence.
        ok(  $.trim(  occurrences[0].firstChild.data  )   ===   "April 13, 2011"  ) ;

        // Re-assert the ninth occurrence.
        ok(  $.trim(  occurrences[8].firstChild.data  )   ===   "April 13, 2016"  ) ;

        start() ; // Resume QUnit.
    },   1000   ) ; // Wait for 1 second.
}  ) ;

test(  "Adding RDATE"  ,  function  ()
{
    // Expect 4 assertions in this test.
    expect(  4  ) ;

    // Set the start date for the recurrence input.
    set_date_value(  $(  "input[name=start]"  )  ,  '2011/04/13'  ) ;

    // Define a recurrence rule with an existing EXDATE and RDATE.
    var   rrule   =   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000" ;

    // Initialize the recurrence input widget.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Set the rule in the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the edit dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Simulate adding a new date (June 13, 2011) as an RDATE.
    input.form.find(  '#adddate'  ).data(  'dateinput'  ).setValue(  2011  ,  5  ,  13  ) ; // Month is 0-indexed (5 = June).
    input.form.find(  '#addaction'  ).click() ;

    // Check that the newly added entity has the 'rdate' class.
    var   entity   =   input.form.find(  '.rioccurrences .occurrence span'  )[0] ;
    ok(  entity.attributes[  'class'  ].value   ===   "rdate"  ) ;

    // Find the action link for the first occurrence (which should be the one we just added).
    entity   =   input.form.find(  '.rioccurrences .occurrence span.action a'  )[0] ;

    // Assert that its 'date' attribute matches the date we added.
    ok(  entity.attributes.date.value   ===   "20110613T000000"  ) ;

    // Simulate clicking the delete/remove action for this RDATE.
    $(  entity  ).click() ;

    // Pause QUnit execution to allow asynchronous operations (like re-rendering occurrences) to complete.
    stop() ;
    setTimeout(  function  ()
    {
        // After a delay, re-check the occurrences.
        entity   =   input.form.find(  '.rioccurrences .occurrence span.action a'  )[0] ;

        // Assert that the previously added RDATE is no longer present at the first position.
        ok(  entity.attributes.date.value   !==   "20110613T000000"  ) ;

        start() ; // Resume QUnit.
    },   1000   ) ; // Wait for 1 second.

    // Add another RDATE: June 14, 2011.
    input.form.find(  '#adddate'  ).data(  'dateinput'  ).setValue(  2011  ,  5  ,  14  ) ;
    input.form.find(  '#addaction'  ).click() ;

    // Save the changes.
    input.form.find(  '.risavebutton'  ).click() ;

    // Assert that the final textarea value reflects the added RDATE and the original RDATE.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20110614T000000,20120606T000000"  ) ;
}  ) ;

test(  "Adding EXDATE"  ,  function  ()
{
    // Expect 4 assertions in this test.
    expect(  4  ) ;

    // Set the start date for the recurrence input.
    set_date_value(  $(  "input[name=start]"  )  ,  '2011/04/13'  ) ;

    // Define a recurrence rule with an existing EXDATE and RDATE.
    var   rrule   =   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20210414T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000" ;

    // Initialize the recurrence input widget.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Set the rule in the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the edit dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Reinclude the EXDATE that was part of the original rrule.
    // This typically means clicking an 'exclude' item to make it an 'include' (or remove it from EXDATE).
    var   entity   =   input.form.find(  '.rioccurrences .occurrence span.action a'  )[0] ;
    ok(  entity.attributes.date.value   ===   "20120411T000000"  ) ;
    $(  entity  ).click() ;

    // Exclude another date: the third occurrence (index 2).
    entity   =   input.form.find(  '.rioccurrences .occurrence span.action a'  )[2] ;
    ok(  entity.attributes.date.value   ===   "20130410T000000"  ) ;
    $(  entity  ).click() ;

    // Simulate clicking on the second batching link (e.g., to load more occurrences).
    $(  input.form.find(  '.rioccurrences .batching a'  )[1]  ).click() ;

    // Pause QUnit to allow for AJAX operations to complete.
    stop() ;
    setTimeout(  function  ()
    {
        // After delay, check the current batching link.
        entity   =   input.form.find(  '.rioccurrences .batching .current a'  )[0] ;

        // Assert that the 'start' attribute of the current batching link is '11'.
        // This indicates that the second batch (starting from occurrence 11) is active.
        ok(  entity.attributes.start.value   ===   "11"  ) ;

        start() ; // Resume QUnit.
    },   1000   ) ; // Wait for 1 second.

    // Save the changes.
    input.form.find(  '.risavebutton'  ).click() ;

    // Assert that the final textarea value reflects the modified EXDATEs and RDATE.
    // The 20120411T000000 EXDATE should be removed, and 20130410T000000 should be added.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20210414T000000\nEXDATE:20130410T000000\nRDATE:20120606T000000"  ) ;
}  ) ;

test(  "Parameters get stripped, dates converted to date times, multiple row lines merged."  ,  function  ()
{
    // XXX: I suspect, but I have to verify this, that it should be the other way around.
    // We should force EXDATES and RDATES to by DATE's only.
    // Expect 1 assertion.
    expect(  1  ) ;

    // Initialize the recurrence input widget.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // Define a recurrence rule with parameters (VALUE=DATE) and line breaks.
    var   rrule   =   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;\n UNTIL=20180419T000000\nEXDATE;VALUE=DATE:20120411\nRDATE;VALUE=DATE:20120606" ;

    // Set this complex rule in the textarea.
    $(  "textarea[name=repeat]"  ).val(  rrule  ) ;

    // Open the edit dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Save the rule. The widget should process and normalize it.
    input.form.find(  '.risavebutton'  ).click() ;

    // Assert that parameters like 'VALUE=DATE' are stripped, dates are converted to full datetime format (T000000),
    // and multiple lines are merged into a canonical form.
    ok(  $(  "textarea[name=repeat]"  ).val()   ===   "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=+2WE;UNTIL=20180419T000000\nEXDATE:20120411T000000\nRDATE:20120606T000000"  ) ;
}  ) ;

test(  "Field validations"  ,  function  ()
{
    // This test expects a large number of assertions to cover various validation scenarios.
    expect(  49  ) ;

    // Define an initial daily recurrence rule.
    var   rrule   =   "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8" ;

    // Set the rule in the textarea.
    $(  'textarea[name=repeat]'  ).val(  rrule  ) ;

    // Set a start date for the recurrence.
    set_date_value(  $(  "input[name=start]"  )  ,  '2011/12/13'  ) ;

    // Open the recurrence editor dialog.
    $(  '.repeatfield a[name=riedit]'  ).click() ;

    // Get the recurrence input widget instance.
    var   input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;

    // --- Daily Recurrence Validations ---
    // Assert that the 'daily' template is initially selected.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'daily'  ) ;

    // Test case: Empty "Repeat every N days" field.
    input.form.find(  'input[name=ridailyinterval]'  ).val(  ''  ) ;
    input.form.find(  '.rirefreshbutton'  ).click() ; // Trigger refresh to show validation.
    ok(  input.form.find(  'input[name=ridailyinterval]'  ).val()   ===   ''  ) ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: The "Repeat every"-field must be between 1 and 1000'  ) ;
    input.form.find(  'input[name=ridailyinterval]'  ).val(  '5'  ) ; // Correct the value.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;
    ok(  input.form.find(  'input[name=ridailyinterval]'  ).val()   ===   '5'  ) ;

    // Test case: Empty "End recurrence after N occurrences" field.
    input.form.find(  'input[name=rirangebyoccurrencesvalue]'  ).val(  ''  ) ;
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYOCCURRENCES'  ) ;
    ok(  input.form.find(  'input[name=rirangebyoccurrencesvalue]'  ).val()   ===   ''  ) ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: The "After N occurrences"-field must be between 1 and 1000'  ) ;
    input.form.find(  'input[name=rirangebyoccurrencesvalue]'  ).val(  '5'  ) ; // Correct the value.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYOCCURRENCES'  ) ;
    ok(  input.form.find(  'input[name=rirangebyoccurrencesvalue]'  ).val()   ===   '5'  ) ;

    // Test case: Empty "End recurrence On" field.
    input.form.find(  'input[value=BYENDDATE]'  ).click() ; // Switch to BYENDDATE.
    input.form.find(  'input[name=rirangebyenddatecalendar]'  ).val(  ''  ) ;
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYENDDATE'  ) ;
    ok(  input.form.find(  'input[name=rirangebyenddatecalendar]'  ).val()   ===   ''  ) ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: End date is not set. Please set a correct value'  ) ;
    input.form.find(  'input[name=rirangebyenddatecalendar]'  ).data(  'dateinput'  ).setValue(  2015  ,  7  ,  15  ) ; // Correct the value.
    input.form.find(  'input[value=BYENDDATE]'  ).click() ; // Re-select to ensure state.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYENDDATE'  ) ;
    ok(  input.form.find(  'input[name=rirangebyenddatecalendar]'  ).val()   ===   '08/15/2015'  ) ;

    // Test case: End date before start date.
    input.form.find(  'input[name=rirangebyenddatecalendar]'  ).data(  'dateinput'  ).setValue(  2001  ,  7  ,  15  ) ; // Set an earlier date.
    input.form.find(  'input[value=BYENDDATE]'  ).click() ;
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: End date cannot be before start date'  ) ;
    input.form.find(  'input[name=rirangebyenddatecalendar]'  ).data(  'dateinput'  ).setValue(  2013  ,  7  ,  15  ) ; // Correct to a valid date.
    input.form.find(  'input[value=BYENDDATE]'  ).click() ;
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;
    ok(  input.form.find(  'input[name=rirangetype]:checked'  ).val()   ===   'BYENDDATE'  ) ;
    ok(  input.form.find(  'input[name=rirangebyenddatecalendar]'  ).val()   ===   '08/15/2013'  ) ;

    // --- Weekly Recurrence Validations ---
    input.form.find(  'select[name=rirtemplate]'  ).val(  'weekly'  ).change() ; // Switch to weekly template.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'weekly'  ) ;

    // Test case: Empty "Repeat every N days" field for weekly.
    input.form.find(  'input[name=riweeklyinterval]'  ).val(  ''  ) ;
    input.form.find(  '#riweeklyweekdays input:checkbox'  ).attr(  'checked'  ,  true  ) ; // Ensure at least one day is checked.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  'input[name=riweeklyinterval]'  ).val()   ===   ''  ) ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: The "Repeat every"-field must be between 1 and 1000'  ) ;
    input.form.find(  'input[name=riweeklyinterval]'  ).val(  '5'  ) ; // Correct the value.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;
    ok(  input.form.find(  'input[name=riweeklyinterval]'  ).val()   ===   '5'  ) ;

    // --- Monthly Recurrence Validations ---
    input.form.find(  'select[name=rirtemplate]'  ).val(  'monthly'  ).change() ; // Switch to monthly template.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'monthly'  ) ;

    // Test case: No "Repeat on" radio button selected.
    input.form.find(  '.rirefreshbutton'  ).click() ; // With no radio selected.
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: "Repeat on"-value must be selected'  ) ;
    input.form.find(  'input[name=rimonthlytype]'  ).attr(  'checked'  ,  true  ) ; // Select one.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;

    // Test case: Empty "Repeat every N days" field for monthly.
    input.form.find(  'input[name=rimonthlyinterval]'  ).val(  ''  ) ;
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  'input[name=rimonthlyinterval]'  ).val()   ===   ''  ) ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: The "Repeat every"-field must be between 1 and 1000'  ) ;
    input.form.find(  'input[name=rimonthlyinterval]'  ).val(  '5'  ) ; // Correct the value.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;
    ok(  input.form.find(  'input[name=rimonthlyinterval]'  ).val()   ===   '5'  ) ;

    // --- Yearly Recurrence Validations ---
    input.form.find(  'select[name=rirtemplate]'  ).val(  'yearly'  ).change() ; // Switch to yearly template.
    ok(  input.form.find(  'select[name=rirtemplate]'  ).val()   ===   'yearly'  ) ;

    // Test case: No "Repeat on" radio button selected for yearly.
    input.form.find(  'input[name=riyearlyType]'  ).attr(  'checked'  ,  false  ) ; // Deselect all.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: "Repeat on"-value must be selected'  ) ;
    input.form.find(  'input[name=riyearlyType]'  ).attr(  'checked'  ,  true  ) ; // Select one.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;

    // Test case: Empty "Repeat every N days" field for yearly.
    input.form.find(  'input[name=riyearlyinterval]'  ).val(  ''  ) ;
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  'input[name=riyearlyinterval]'  ).val()   ===   ''  ) ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'block'  ) ;
    ok(  input.form.find(  '#messagearea'  ).text()   ===   'Error: The "Repeat every"-field must be between 1 and 1000'  ) ;
    input.form.find(  'input[name=riyearlyinterval]'  ).val(  '5'  ) ; // Correct the value.
    input.form.find(  '.rirefreshbutton'  ).click() ;
    ok(  input.form.find(  '#messagearea'  ).css(  'display'  )   ===   'none'  ) ;
    ok(  input.form.find(  'input[name=riyearlyinterval]'  ).val()   ===   '5'  ) ;

    // Finally, save the (now valid) configuration.
    input.form.find(  '.risavebutton'  ).click() ;
}  ) ;

test(  "Unsupported features (incomplete)"  ,  function  ()
{
    // This test checks for handling of unsupported or partially supported recurrence features.
    expect(  13  ) ;

    // Initialize the recurrence input widget on a different textarea for 'custom' rules.
    var   input   =   $(  "textarea[name=custom]"  ).recurrenceinput() ;

    // Set a recurrence rule that might not match any predefined template.
    $(  "textarea[name=custom]"  ).val(  "RRULE:FREQ=MONTHLY;COUNT=3"  ) ;

    // Open the edit dialog for the custom field.
    $(  '.customfield a[name=riedit]'  ).click() ;

    // Assert that an error message indicating 'No matching recurrence template' is displayed.
    ok(  input.form.find(  '#messagearea'  ).text().indexOf(  'No matching recurrence template'  )   !==   -1  ) ;

    // Attempt to save the unsupported rule.
    input.form.find(  '.risavebutton'  ).click() ;

    // Re-initialize the widget on the standard 'repeat' textarea for subsequent tests (if any).
    // This line seems incomplete as it doesn't perform any assertions after re-initialization.
    input   =   $(  "textarea[name=repeat]"  ).recurrenceinput() ;
}  ) ;