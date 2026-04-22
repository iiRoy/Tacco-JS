/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to make the code visually distinct from the original.
 *
 * This file contains a jQuery plugin-like structure for QUnit tests
 * focusing on DataTables AJAX interactions.
 */

;
(function($) {

    // Debug flag to enable/disable validation checks within the dTAjaxController.
    var debug = true,

        // Helper function to get the row count select element for DataTables.
        getRowCount$Select = function() {
            // Selects the dropdown that controls the number of entries shown.
            return $("select[name='table-id_length']");
        },

        /*
         * Converts a URL query string into a JavaScript object.
         * Handles array-like parameters (e.g., 'param_0', 'param_1').
         */
        queryStringToObject = function(queryString) {
            var vars = queryString.split('&'), // Split the string by '&' to get individual key-value pairs.
                returnVar = {}; // Initialize an empty object to store the results.

            // Iterate through each key-value pair.
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('='), // Split each pair by '='.
                    propName = decodeURIComponent(pair[0]), // Decode the property name (key).
                    val = decodeURIComponent(pair[1]), // Decode the value.
                    match = /^(\w+)_(\d+)$/.exec(propName); // Check for array-like naming pattern (e.g., 'name_0').

                // If an array-like pattern is found.
                if (match) {
                    propName = match[1]; // Use the base name (e.g., 'name').
                    // If the property is not already an array, initialize it as one.
                    if (!$.isArray(returnVar[propName])) {
                        returnVar[propName] = [];
                    }
                    // Assign the value to the specific index in the array.
                    returnVar[propName][parseInt(match[2])] = val;
                } else {
                    // Otherwise, assign the value directly to the property.
                    returnVar[propName] = val;
                }
            }
            return returnVar; // Return the constructed object.
        },

        /*
         * dTAjaxController: A module to manage DataTables AJAX requests
         * by hooking into jQuery's global AJAX events.
         * It allows for specific callbacks (onSend, onSuccess, onComplete)
         * to be associated with DataTables requests based on their sEcho parameter.
         *
         * Reference: Could also explore http://stackoverflow.com/questions/12003978/how-to-overwrite-the-success-function-via-jquery-ajaxsend-event#12010724
         */
        dTAjaxController = (function() {

            var pushStack = [], // Stores callbacks for active AJAX requests, indexed by sEcho.
                mostRecentArgs, // Holds arguments for the most recently added AJAX request.
                returnVar = {}, // The public interface of this module.

                // Global AJAX send handler.
                fnSend = function(event, jqXHR, ajaxOptions) {
                    // If no arguments were queued, just return.
                    if (!mostRecentArgs) {
                        return;
                    }

                    // Extract sEcho from the AJAX data.
                    var match = /\bsEcho=(\d+)/.exec(ajaxOptions.data),
                        sEcho;

                    // If an onSend callback is defined and sEcho is present or runSendIfNoEcho is true.
                    if (mostRecentArgs.onSend && (match || mostRecentArgs.runSendIfNoEcho)) {
                        // Execute the custom onSend callback.
                        mostRecentArgs.onSend.apply(this, arguments);
                    }

                    // If no sEcho parameter is found, cannot track this request.
                    if (!match) {
                        return;
                    }

                    sEcho = parseInt(match[1]); // Parse the sEcho value.

                    // Store the success and complete callbacks for this sEcho.
                    pushStack[sEcho] = {
                        onSuccess: mostRecentArgs.onSuccess,
                        onComplete: mostRecentArgs.onComplete
                    };

                    // Clear mostRecentArgs as it has been consumed.
                    mostRecentArgs = null;
                },

                // Global AJAX success handler.
                fnSuccess = function(event, XMLHttpRequest, ajaxOptions) {
                    // Extract sEcho from the response JSON.
                    var sEcho = parseInt(XMLHttpRequest.responseJSON.sEcho);

                    // If sEcho is a valid number and corresponding callbacks exist.
                    if (!isNaN(sEcho) && pushStack[sEcho] && pushStack[sEcho].onSuccess) {
                        // Execute the custom onSuccess callback.
                        pushStack[sEcho].onSuccess.apply(this, arguments);
                    }
                },

                // Global AJAX complete handler.
                fnComplete = function(event, XMLHttpRequest, ajaxOptions) {
                    // Extract sEcho from the response JSON.
                    var sEcho = parseInt(XMLHttpRequest.responseJSON.sEcho);

                    // If sEcho is a valid number and corresponding callbacks exist.
                    if (!isNaN(sEcho) && pushStack[sEcho]) {
                        // If a custom onComplete callback is defined, execute it.
                        if (pushStack[sEcho].onComplete) {
                            pushStack[sEcho].onComplete.apply(this, arguments);
                        }
                        // Clean up the stored callbacks for this sEcho.
                        delete pushStack[sEcho];
                    }
                };

            // Bind the global AJAX handlers to jQuery's document events.
            $(document)
                .ajaxSend(fnSend) // Fired before an AJAX request is sent.
                .ajaxSuccess(fnSuccess) // Fired when an AJAX request successfully completes.
                .ajaxComplete(fnComplete); // Fired when an AJAX request completes (success or error).

            /*
             * Adds a new set of AJAX callbacks to be triggered by a DataTables draw.
             * @param {object} argObj - An object containing trigger, onSend, onSuccess, onComplete functions.
             */
            returnVar.add = function(argObj) {
                // Define acceptable types for callback functions.
                var acceptableTypes = ["undefined", "function"];

                // Debugging and validation block.
                if (debug) {
                    var functionArgs = ["trigger", "onSend", "onSuccess", "onComplete"],
                        allArgs = functionArgs.concat(["runSendIfNoEcho"]), // All recognized arguments.
                        p; // Loop variable for property iteration.

                    // Validate that an argument object is provided.
                    if (!argObj) {
                        throw new Error("at least 1 argument must be provided");
                    }
                    // Validate that a trigger function is provided.
                    if (!argObj.trigger) {
                        throw new Error("a trigger function must be provided");
                    }

                    // Validate types of expected function arguments.
                    $.each(functionArgs, function(indx, fn) {
                        if (acceptableTypes.indexOf(typeof(argObj[fn])) == -1) {
                            throw new TypeError(fn + " must be a function");
                        }
                    });

                    // Check for any unrecognized arguments.
                    for (p in argObj) {
                        if (argObj.hasOwnProperty(p) && $.inArray(p, allArgs) == -1) {
                            throw new Error("undefined argument '" + p + "' passed to ajaxController.add method");
                        }
                    }
                }

                // Internal function to wait until previous AJAX args are processed.
                (function waitUnitArgsConsumed() {
                    // If there's an active mostRecentArgs, wait and try again.
                    if (mostRecentArgs) {
                        setTimeout(waitUnitArgsConsumed, 20); // Poll every 20ms.
                        return;
                    }
                    // Once clear, set the new arguments and trigger the action.
                    mostRecentArgs = argObj;
                    argObj.trigger();
                })();
            };

            /*
             * Cleans up the dTAjaxController by unbinding event handlers and clearing the stack.
             */
            returnVar.cleanup = function() {
                // Clear the stack holding pending AJAX callbacks.
                pushStack = null;

                // Unbind all associated AJAX event handlers from the document.
                $(document)
                    .off("ajaxSend", fnSend)
                    .off("ajaxSuccess", fnSuccess)
                    .off("ajaxComplete", fnComplete);
            };

            return returnVar; // Return the public API of the controller.

        })(); // End of dTAjaxController IIFE.


    // Register the cleanup function with QUnit to run after all tests are done.
    QUnit.done(dTAjaxController.cleanup);

    // Set a longer timeout for QUnit tests, especially for AJAX operations.
    QUnit.config.testTimeout = 30000; // 30 seconds.

    /*
     * QUnit.testStart hook: Resets form elements within the test context
     * before each test runs to ensure a clean state.
     */
    QUnit.testStart(function resetElements() {
        try {
            // Get the container for the test table.
            var context = document.getElementById("testTableHolder");

            // Reset text input fields.
            $("input[type='text']:enabled", context)
                .each(function() {
                    if (this.value !== "") {
                        this.value = ""; // Clear the value.
                        $(this).triggerHandler("keyup"); // Trigger keyup to reflect changes.
                    }
                });

            // Reset checkbox fields.
            $("input[type='checkbox']:enabled", context)
                .each(function() {
                    if (this.checked) {
                        this.checked = false; // Uncheck the checkbox.
                        $(this).triggerHandler("click"); // Trigger click to reflect changes.
                    }
                });

            // Reset select dropdowns to their default/first option.
            $("select:enabled", context)
                .each(function() {
                    $(this).children().filter(function(indx) {
                            // Find the first option or the one marked as defaultSelected.
                            return (indx == 0 || this.defaultSelected);
                        }).last() // In case multiple defaultSelected exist, take the last one.
                        .each(function() {
                            if (!this.selected) {
                                this.selected = true; // Select the option.
                                this.triggerHandler("change"); // Trigger change to reflect.
                            }
                        });
                });
        } catch (err) {
            // Log any errors during test setup.
            if (console && console.log) {
                console.log("error on executing QUnit.testStart: " + err.toString());
            }
        }
    });

    /*
     * Global AJAX error handler for QUnit tests.
     * Any AJAX error will fail the current QUnit test.
     * NOTE: This handler is not explicitly cleaned up at present,
     * so it persists across all tests.
     */
    $(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
        test("ajax has returned with an error", function() {
            ok(false, "error returned: " + thrownError); // Fail the test with the error message.
        });
    });


    /*
     * Extends QUnit.assert with a custom assertion method `isNumeric`.
     * Checks if a value (or all elements of an array) can be parsed as a number.
     */
    QUnit.assert.isNumeric = function(value, message) {
        var number, // Variable to hold parsed number.
            isNumeric; // Flag to indicate if the value(s) are numeric.

        // Check if value is an array-like object (with a length property) but not a string.
        if (isFinite(value.length) && typeof(value) != "string") {
            var i = 0;
            isNumeric = true; // Assume true until a non-numeric element is found.
            for (; i < value.length; i++) {
                number = parseFloat(value[i]); // Attempt to parse each element.
                if (isNaN(number)) {
                    isNumeric = false; // If any element is not a number, set flag to false.
                    break; // Stop checking.
                }
            }
        } else {
            // If not an array-like object, check the single value.
            number = parseFloat(value);
            isNumeric = !isNaN(number); // It's numeric if not NaN.
        }
        // Push the result to QUnit.
        QUnit.push(isNumeric, value, "numbers only", message);
        /* Arguments: result, actual, expected, message */
    };


    // Define a QUnit module for tests related to DataTables initialization.
    module("initialise and populate dataTable");


    /*
     * Test case: Verify that DataTables is applied and its columnFilter
     * input elements are correctly placed in the table header.
     */
    test("datatable applied & thead input elements placed (columnFilter)", function() {
        var $testTbl = $($.fn.dataTable.fnTables()[0]), // Get the first DataTables instance.
            $dtHead = $testTbl.children('thead'); // Get the table header.

        // Expecting 5 assertions in this test.
        expect(5);

        // Assertion 1: Check if a DataTables instance is found.
        ok($testTbl.length && $testTbl[0].tagName.toLowerCase() == 'table',
            "an instantiated datatable is expected to be found before window.onLoad");

        // Assertion 2: Check for datepicker input elements.
        equal($dtHead.find('input').filter(".hasDatepicker").length, 2,
            "2 datepicker elements are expected");

        // Assertion 3: Check for select elements in the header.
        equal($dtHead.find('select').length, 2,
            "2 select elements are expected");

        // Assertion 4: Check for a button element in the header.
        ok($dtHead.find('button').length,
            "a button element is expected");

        // Assertion 5: Check for the row count select element.
        equal(getRowCount$Select().length, 1,
            "single select element found which denotes number of records to retrieve from server");
    });


    /*
     * Async Test: Verifies the data sent to and returned from the server
     * by DataTables AJAX requests.
     */
    asyncTest("data sent to and returned from server is OK", function(assert) {
        expect(13); // Total number of assertions expected.
        stop(); // Pause QUnit until start() is called.

        // Add a new AJAX controller entry for this test.
        dTAjaxController.add({
            runSendIfNoEcho: true, // Run onSend even if sEcho is not present.
            trigger: function() {
                // Trigger a DataTables redraw to initiate the AJAX request.
                $($.fn.dataTable.fnTables()[0]).dataTable().fnDraw();
            },
            onSend: function(event, jqXHR, ajaxOptions) {
                var queryObj; // Object to hold parsed query string.

                // Assertion 1: Check if AJAX request contains data.
                ok(ajaxOptions.data && ajaxOptions.data.length,
                    "ajax request contains data");

                // Parse the AJAX data.
                queryObj = queryStringToObject(ajaxOptions.data);

                // Assertion 2: Check if sEcho has a value.
                notEqual(queryObj.sEcho, null,
                    "sEcho must have a value");

                // Assertion 3: Check if iColumns is numeric.
                assert.isNumeric(queryObj.iColumns,
                    "iColumns must be a number");

                // Assertions 4-8: Check array lengths for column-specific parameters.
                ["bRegex", "bSearchable", "bSortable", "mDataProp", "sSearch"].forEach(function(prop) {
                    equal(queryObj[prop].length, queryObj.iColumns,
                        prop + ".length == iColumns");
                });

                start(); // Resume QUnit tests.
            },
            onComplete: function(event, XMLHttpRequest, ajaxOptions) {
                var listIds, // IDs from the AJAX response.
                    tableIds, // IDs currently displayed in the table.
                    listData = XMLHttpRequest.responseJSON.aaData, // Data from the server.
                    $testTbl = $($.fn.dataTable.fnTables()[0]); // The DataTables instance.

                // Assertion 9: Check if the returned data is a non-empty array.
                ok($.isArray(listData) && listData.length,
                    "an array returned from server contains elements");

                // Extract IDs from the returned data.
                listIds = $.map(listData, function(val) {
                    return val[0];
                });

                // Assertion 10: Check if the extracted IDs are numeric.
                assert.isNumeric(listIds,
                    "elements[0..N][0] of returned array are numeric");

                // Extract IDs from the currently rendered table.
                tableIds = $.map($testTbl.children("tbody").children(), function(tr) {
                    return $(tr).children().first().text();
                });

                // Assertion 11: Check if the table IDs are numeric.
                assert.isNumeric(tableIds,
                    "first column of table contains only numeric text");

                // Assertion 12: Compare IDs from response and table for equality.
                deepEqual(tableIds, listIds,
                    "JSON translated to table");

                // Assertion 13: Check if the number of rows matches the selected count.
                equal(getRowCount$Select().val(), tableIds.length,
                    "number of rows returned corresponds to number of entries selected");

                start(); // Resume QUnit tests.
            }
        });
    });


    // Define a QUnit module for tests related to user input simulation.
    module("emmulate user input");


    /*
     * Async Test: Simulates clicking on a column header to trigger sorting
     * and verifies the sorted order.
     */
    asyncTest("sort on click", function() {
        var $testTbl = $($.fn.dataTable.fnTables()[0]), // Get the DataTables instance.
            $id = $testTbl.children('thead').children().children(":contains('Id')"), // Find the 'Id' column header.
            triggerClick = function() {
                $id.trigger("click"); // Function to simulate a click.
            },
            records = parseInt(getRowCount$Select().val(), 10), // Number of records displayed.
            ordered = $.map($(new Array(records)), function(val, i) {
                return i + 1 + ""; // Expected ascending order.
            }),
            reverseOrdered = $.map($(new Array(records)), function(val, i) {
                return 100 - i + ""; // Expected descending order (assuming data max 100).
            }),
            secondClickExpect; // Stores expected order after the second click.

        expect(2); // Expecting 2 assertions.
        stop(); // Pause QUnit.

        // First click to sort.
        dTAjaxController.add({
            trigger: triggerClick, // Trigger the click on 'Id' column.
            onSuccess: function(event, XMLHttpRequest, ajaxOptions) {
                var returned = $.map(XMLHttpRequest.responseJSON.aaData, function(val) {
                        return val[0]; // Extract IDs from the returned data.
                    }),
                    expected; // Expected sorted array.

                // Determine if the returned order is ascending or descending.
                if (returned[0] == 100) {
                    expected = reverseOrdered; // Expect descending.
                    secondClickExpect = ordered; // Next click should be ascending.
                } else {
                    expected = ordered; // Expect ascending.
                    secondClickExpect = reverseOrdered; // Next click should be descending.
                }

                // Assertion 1: Verify the sorted order after the first click.
                deepEqual(returned, expected,
                    "clicking on Id sorts table");
                start(); // Resume QUnit.
            }
        });

        // Second click to reverse sort.
        dTAjaxController.add({
            trigger: triggerClick, // Trigger another click on 'Id' column.
            onSuccess: function(event, XMLHttpRequest, ajaxOptions) {
                // Wait until `secondClickExpect` is populated by the previous `onSuccess` handler.
                (function secondClick() {
                    if (!secondClickExpect) {
                        setTimeout(secondClick, 20); // Poll every 20ms.
                        return;
                    }
                    var returned = $.map(XMLHttpRequest.responseJSON.aaData, function(val) {
                        return val[0]; // Extract IDs from the returned data.
                    });
                    // Assertion 2: Verify the reversed sorted order after the second click.
                    deepEqual(returned, secondClickExpect,
                        "clicking again on Id again alternates table sort");
                    start(); // Resume QUnit.
                })();
            }
        });
    });


    /*
     * Async Test: Simulates typing into the global search box and verifies results.
     */
    asyncTest("search", function() {
        // Find the global search input field.
        var $search = $("label:contains('Search'):first").children('input');

        expect(2); // Expecting 2 assertions.
        stop(); // Pause QUnit.

        // First search: for a specific ID.
        dTAjaxController.add({
            trigger: function() {
                $search.val("99") // Set search value to "99".
                    .trigger("keyup"); // Trigger keyup to initiate search.
            },
            onSuccess: function(event, XMLHttpRequest, ajaxOptions) {
                var returned = $.map(XMLHttpRequest.responseJSON.aaData, function(val) {
                    return val[0]; // Extract IDs from the returned data.
                });
                // Assertion 1: Verify that searching for "99" returns only record "99".
                deepEqual(returned, ["99"],
                    "searching for 99 returns 1 record");
                start(); // Resume QUnit.
            }
        });

        // Second search: for a non-existent email.
        dTAjaxController.add({
            trigger: function() {
                $search.val("user11@hotmail.com") // Set search value to an email.
                    .trigger("keyup"); // Trigger keyup to initiate search.
            },
            onSuccess: function(event, XMLHttpRequest, ajaxOptions) {
                var returned = $.map(XMLHttpRequest.responseJSON.aaData, function(val) {
                    return val[0]; // Extract IDs from the returned data.
                });
                // Assertion 2: Verify that searching for this email returns no records.
                deepEqual(returned, [],
                    "searching for an email does not return a record");
                start(); // Resume QUnit.
            }
        });
    });

})(jQuery); // End of IIFE, passing jQuery as $ alias.