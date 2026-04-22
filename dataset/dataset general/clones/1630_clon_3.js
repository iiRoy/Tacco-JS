;
(function (jQ) {
    const loggingActive = true;

    // Helper function to safely decode URI components
    const safeDecodeURI = (encodedSegment) => {
        try {
            return decodeURIComponent(encodedSegment);
        } catch (error) {
            if (loggingActive) {
                console.warn("URI decoding error encountered:", error, "for segment:", encodedSegment);
            }
            return encodedSegment; // Return original if decoding fails
        }
    };

    /**
     * Retrieves the jQuery object for the row count selection dropdown.
     * @returns {jQuery} The jQuery object for the select element.
     */
    const fetchPageSizeControl = function () {
        return jQ("select[name='table-data-identifier_limit']");
    };

    /**
     * Converts a URL query string into a JavaScript object.
     * Handles array-like parameters (e.g., param_0, param_1).
     * @param {string} urlQueryString The query string to parse.
     * @returns {Object} An object representing the parsed query parameters.
     */
    const deserializeUrlParams = function (urlQueryString) {
        let parsedResult = {};
        if (!urlQueryString || typeof urlQueryString !== 'string') {
            if (loggingActive) {
                console.warn("Provided query string is invalid or empty.");
            }
            return parsedResult;
        }

        const paramSegments = urlQueryString.split('&');
        for (let segmentIndex = 0; segmentIndex < paramSegments.length; segmentIndex++) {
            const currentSegment = paramSegments[segmentIndex];
            const keyValueArr = currentSegment.split('=');

            if (keyValueArr.length !== 2) {
                if (loggingActive) {
                    console.warn("Skipping malformed query segment:", currentSegment);
                }
                continue;
            }

            let parameterKey = safeDecodeURI(keyValueArr[0]);
            const parameterValue = safeDecodeURI(keyValueArr[1]);

            // Check for array-like keys (e.g., 'column_0', 'column_1')
            const arrayMatch = /^(\w+)_(\d+)$/.exec(parameterKey);
            if (arrayMatch) {
                const baseKey = arrayMatch[1];
                const arrayIndex = Number.parseInt(arrayMatch[2], 10);

                if (Number.isNaN(arrayIndex)) {
                    // Fallback if index isn't a valid number
                    parsedResult[parameterKey] = parameterValue;
                    continue;
                }

                if (!Array.isArray(parsedResult[baseKey])) {
                    parsedResult[baseKey] = [];
                }
                parsedResult[baseKey][arrayIndex] = parameterValue;
            } else {
                parsedResult[parameterKey] = parameterValue;
            }
        }
        return parsedResult;
    };

    /**
     * Manages DataTables AJAX requests by intercepting jQuery AJAX events
     * to store and retrieve success/complete callbacks based on sEcho.
     * This module ensures that callbacks are associated with the correct
     * DataTables request cycle.
     */
    const dataGridRequestManager = (function () {
        let pendingCallbacksQueue = []; // Stores callbacks indexed by sEcho
        let currentOperationDetails = null; // Holds details for the most recent 'add' call
        const moduleApi = {};

        // Private helper to get sEcho from data
        const extractEchoValue = (dataPayload) => {
            if (!dataPayload || typeof dataPayload !== 'string') return null;
            const echoMatch = /\bsEcho=(\d+)/.exec(dataPayload);
            return echoMatch ? Number.parseInt(echoMatch[1], 10) : null;
        };

        // Event handler for jQuery's ajaxSend
        const processAjaxSend = function (evt, xhrObj, requestConfig) {
            if (!currentOperationDetails) {
                return; // No pending operation to track
            }

            // Execute onSend callback if configured
            const echoVal = extractEchoValue(requestConfig.data);
            if (currentOperationDetails.onSend && (echoVal !== null || currentOperationDetails.runSendIfNoEcho)) {
                currentOperationDetails.onSend.apply(this, arguments);
            }

            if (echoVal === null) {
                return; // No sEcho, cannot track success/complete callbacks
            }

            // Store the success and complete callbacks for this sEcho cycle
            pendingCallbacksQueue[echoVal] = {
                onSuccessCallback: currentOperationDetails.onSuccess,
                onCompleteCallback: currentOperationDetails.onComplete
            };
            currentOperationDetails = null; // Clear current details as they've been pushed
        };

        // Event handler for jQuery's ajaxSuccess
        const processAjaxSuccess = function (evt, xhrObj, requestConfig) {
            const responseData = xhrObj.responseJSON;
            if (!responseData || typeof responseData.sEcho === 'undefined') {
                if (loggingActive) {
                    console.warn("AJAX Success: Response JSON or sEcho missing.", xhrObj);
                }
                return;
            }

            const echoIdentifier = Number.parseInt(responseData.sEcho, 10);
            if (!Number.isNaN(echoIdentifier) && pendingCallbacksQueue[echoIdentifier] && pendingCallbacksQueue[echoIdentifier].onSuccessCallback) {
                pendingCallbacksQueue[echoIdentifier].onSuccessCallback.apply(this, arguments);
            }
        };

        // Event handler for jQuery's ajaxComplete
        const processAjaxComplete = function (evt, xhrObj, requestConfig) {
            const responseData = xhrObj.responseJSON;
            if (!responseData || typeof responseData.sEcho === 'undefined') {
                if (loggingActive) {
                    console.warn("AJAX Complete: Response JSON or sEcho missing.", xhrObj);
                }
                return;
            }

            const echoIdentifier = Number.parseInt(responseData.sEcho, 10);
            if (!Number.isNaN(echoIdentifier) && pendingCallbacksQueue[echoIdentifier]) {
                if (pendingCallbacksQueue[echoIdentifier].onCompleteCallback) {
                    pendingCallbacksQueue[echoIdentifier].onCompleteCallback.apply(this, arguments);
                }
                // Cleanup the stored callbacks for this sEcho
                delete pendingCallbacksQueue[echoIdentifier];
            }
        };

        // Attach event handlers to the document
        jQ(document)
            .on("ajaxSend", processAjaxSend)
            .on("ajaxSuccess", processAjaxSuccess)
            .on("ajaxComplete", processAjaxComplete);

        /**
         * Adds a new set of AJAX callbacks to be managed.
         * @param {Object} operationConfig An object containing trigger, onSend, onSuccess, onComplete callbacks.
         */
        moduleApi.addOperation = function (operationConfig) {
            const expectedCallbackTypes = ["undefined", "function"];
            const requiredProps = ["trigger"];
            const optionalProps = ["onSend", "onSuccess", "onComplete", "runSendIfNoEcho"];
            const allAllowedProps = requiredProps.concat(optionalProps);

            // Basic validation in debug mode
            if (loggingActive) {
                if (!operationConfig || typeof operationConfig !== 'object') {
                    throw new Error("A configuration object must be provided for 'addOperation'.");
                }
                requiredProps.forEach(propName => {
                    if (!operationConfig[propName]) {
                        throw new Error(`The '${propName}' function is mandatory for 'addOperation'.`);
                    }
                });

                requiredProps.concat(optionalProps.filter(p => p !== 'runSendIfNoEcho')).forEach(propName => {
                    const propType = typeof (operationConfig[propName]);
                    if (propType !== 'undefined' && propType !== 'function') {
                        throw new TypeError(`Property '${propName}' must be a function or undefined.`);
                    }
                });

                for (const prop in operationConfig) {
                    if (operationConfig.hasOwnProperty(prop) && !allAllowedProps.includes(prop)) {
                        throw new Error(`Unsupported configuration property: '${prop}'.`);
                    }
                }
            }

            // Wait until any previous operation details have been consumed
            const pollForReadiness = function () {
                if (currentOperationDetails) {
                    setTimeout(pollForReadiness, 25); // Slightly different delay
                    return;
                }
                currentOperationDetails = operationConfig;
                // Execute the trigger function to initiate the AJAX request
                operationConfig.trigger();
            };
            pollForReadiness();
        };

        /**
         * Cleans up all event handlers and internal state.
         */
        moduleApi.destroy = function () {
            pendingCallbacksQueue = []; // Clear the queue
            currentOperationDetails = null;
            jQ(document)
                .off("ajaxSend", processAjaxSend)
                .off("ajaxSuccess", processAjaxSuccess)
                .off("ajaxComplete", processAjaxComplete);
            if (loggingActive) {
                console.info("DataGridRequestManager cleanup complete.");
            }
        };

        return moduleApi;
    })();

    // Integrate with QUnit test lifecycle
    QUnit.done(dataGridRequestManager.destroy);
    QUnit.config.testTimeout = 35000; // Slightly increased timeout
    QUnit.testStart(function prepareTestEnvironment() {
        try {
            const testContext = document.getElementById("testTableHolder");
            if (!testContext) {
                throw new Error("Test context element 'testTableHolder' not found.");
            }

            // Reset text input fields
            jQ("input[type='text']:enabled", testContext).each(function () {
                if (this.value !== "") {
                    this.value = "";
                    jQ(this).triggerHandler("keyup");
                }
            });

            // Reset checkboxes
            jQ("input[type='checkbox']:enabled", testContext).each(function () {
                if (this.checked) {
                    this.checked = false;
                    jQ(this).triggerHandler("click");
                }
            });

            // Reset select elements to their default or first option
            jQ("select:enabled", testContext).each(function () {
                const selectElement = jQ(this);
                let targetOption = selectElement.children().filter(function (idx) {
                    return (idx === 0 || this.defaultSelected);
                }).last();

                if (targetOption.length === 0 && selectElement.children().length > 0) {
                    targetOption = selectElement.children().first(); // Fallback to first option
                }

                if (targetOption.length > 0 && !targetOption.is(":selected")) {
                    targetOption.prop("selected", true);
                    selectElement.triggerHandler("change");
                }
            });
        } catch (error) {
            if (console && console.error) {
                console.error("Error during QUnit.testStart preparation:", error.message || error.toString());
            }
            // Re-throw to ensure test failure if setup is critical
            throw error;
        }
    });

    // Global AJAX error handler for QUnit tests
    jQ(document).on("ajaxError", function (evt, xhrObject, ajaxSettings, errorThrown) {
        QUnit.test("Global AJAX Error Check", function (assert) {
            assert.ok(false, "An unexpected AJAX error occurred: " + errorThrown);
        });
    });

    /**
     * Custom QUnit assertion to check if a value or all elements in an array are numeric.
     * @param {*} testValue The value or array to test.
     * @param {string} failureMessage The message to display if the assertion fails.
     */
    QUnit.assert.isNumericValue = function (testValue, failureMessage) {
        let isOverallNumeric = true;
        let actualValue = testValue;

        if (Array.isArray(testValue) || (typeof testValue === 'object' && testValue !== null && typeof testValue.length === 'number' && testValue.length > 0)) {
            // Treat as an array-like object
            for (let k = 0; k < testValue.length; k++) {
                const currentElement = testValue[k];
                if (typeof currentElement === 'string' && currentElement.trim() === '') {
                    // Allow empty strings in arrays if they can be coerced to 0, but for strict numeric, fail.
                    isOverallNumeric = false;
                    break;
                }
                const parsedNumber = Number.parseFloat(currentElement);
                if (Number.isNaN(parsedNumber) || !Number.isFinite(parsedNumber)) {
                    isOverallNumeric = false;
                    break;
                }
            }
        } else {
            // Single value
            const parsedNumber = Number.parseFloat(testValue);
            isOverallNumeric = !Number.isNaN(parsedNumber) && Number.isFinite(parsedNumber);
        }

        this.pushResult({
            result: isOverallNumeric,
            actual: actualValue,
            expected: "numeric value(s)",
            message: failureMessage
        });
    };

    // --- QUnit Test Modules Start ---

    QUnit.module("DataTables Initialization & Data Population");

    QUnit.test("DataTables application and header input elements verification (ColumnFilter)", function (assert) {
        const targetDataTable = jQ(jQ.fn.dataTable.fnTables()[0]);
        const dataTableHeader = targetDataTable.children('thead');

        assert.expect(5); // Explicitly state the number of assertions

        // Verify DataTables instance exists
        assert.ok(targetDataTable.length && targetDataTable[0].tagName.toLowerCase() === 'table', "An initialized DataTable is expected to be present.");

        // Verify specific input elements within the header
        assert.equal(dataTableHeader.find('input').filter(".hasDatepicker").length, 2, "Two datepicker input elements are anticipated.");
        assert.equal(dataTableHeader.find('select').length, 2, "Two select dropdown elements are anticipated.");
        assert.ok(dataTableHeader.find('button').length > 0, "At least one button element is expected within the header.");
        assert.equal(fetchPageSizeControl().length, 1, "A single select element controlling row limits should be found.");
    });

    QUnit.asyncTest("Data exchange with server is correct and well-formed", function (assert) {
        assert.expect(13); // Total assertions for this test
        QUnit.stop(); // Pause QUnit

        dataGridRequestManager.addOperation({
            runSendIfNoEcho: true, // Run onSend even if sEcho is not found in initial request
            trigger: function () {
                // Trigger the DataTable draw to initiate AJAX
                jQ(jQ.fn.dataTable.fnTables()[0]).dataTable().fnDraw();
            },
            onSend: function (evt, xhrObj, reqOptions) {
                const requestPayload = reqOptions.data;
                assert.ok(requestPayload && requestPayload.length > 0, "AJAX request payload should not be empty.");

                const parsedRequestData = deserializeUrlParams(requestPayload);
                assert.notEqual(parsedRequestData.sEcho, undefined, "sEcho parameter must be present in the request.");
                assert.isNumericValue(parsedRequestData.iColumns, "iColumns parameter must be a numeric value.");

                const expectedArrayProps = ["bRegex", "bSearchable", "bSortable", "mDataProp", "sSearch"];
                for (let propIdx = 0; propIdx < expectedArrayProps.length; propIdx++) {
                    const property = expectedArrayProps[propIdx];
                    assert.equal(parsedRequestData[property].length, parsedRequestData.iColumns, `'${property}'.length must match 'iColumns'.`);
                }
                QUnit.start(); // Resume QUnit after initial checks
            },
            onComplete: function (evt, xhrObj, reqOptions) {
                const serverResponseData = xhrObj.responseJSON.aaData;
                const activeDataTable = jQ(jQ.fn.dataTable.fnTables()[0]);

                assert.ok(Array.isArray(serverResponseData) && serverResponseData.length > 0, "Server response 'aaData' must be a non-empty array.");

                // Extract IDs from server response
                const responseIds = serverResponseData.map(function (row) {
                    return row[0];
                });
                assert.isNumericValue(responseIds, "First elements of returned array rows should be numeric (IDs).");

                // Extract IDs from the rendered table
                const renderedTableIds = activeDataTable.children("tbody").children().map(function () {
                    return jQ(this).children().first().text();
                }).get(); // .get() to convert jQuery object to a native array

                assert.isNumericValue(renderedTableIds, "First column of the rendered table should contain only numeric text.");
                assert.deepEqual(renderedTableIds, responseIds, "Translated JSON data should match the rendered table content.");
                assert.equal(fetchPageSizeControl().val(), renderedTableIds.length, "Number of returned rows must correspond to the selected page size.");

                QUnit.start(); // Resume QUnit after all checks
            }
        });
    });

    QUnit.module("Simulate User Interactions");

    QUnit.asyncTest("Column Sorting on Click", function (assert) {
        const currentTable = jQ(jQ.fn.dataTable.fnTables()[0]);
        const idColumnHeader = currentTable.children('thead').find(":contains('Id')").first();
        const getRowIdsFromTable = () => {
            return currentTable.children("tbody").children().map(function () {
                return jQ(this).children().first().text();
            }).get();
        };

        const recordsCount = Number.parseInt(fetchPageSizeControl().val(), 10);
        const ascendingOrder = Array.from({
            length: recordsCount
        }, (_, i) => String(i + 1));
        const descendingOrder = Array.from({
            length: recordsCount
        }, (_, i) => String(100 - i)); // Assuming IDs from 1 to 100, and 100 is max

        let expectedSecondClickOrder = null;

        assert.expect(2);
        QUnit.stop();

        dataGridRequestManager.addOperation({
            trigger: function () {
                idColumnHeader.trigger("click"); // First click to sort
            },
            onSuccess: function (evt, xhrObj, reqOptions) {
                const returnedIds = xhrObj.responseJSON.aaData.map(row => row[0]);
                let expectedOrder;

                if (returnedIds[0] === "100" || returnedIds[0] === 100) { // Check if it sorted descending initially
                    expectedOrder = descendingOrder;
                    expectedSecondClickOrder = ascendingOrder;
                } else { // Assume ascending
                    expectedOrder = ascendingOrder;
                    expectedSecondClickOrder = descendingOrder;
                }
                assert.deepEqual(returnedIds, expectedOrder, "Clicking 'Id' column header sorts table as expected.");
                QUnit.start();
            }
        });

        dataGridRequestManager.addOperation({
            trigger: function () {
                idColumnHeader.trigger("click"); // Second click to reverse sort
            },
            onSuccess: function (evt, xhrObj, reqOptions) {
                // Poll until expectedSecondClickOrder is set from the previous operation
                const checkAndAssert = function () {
                    if (expectedSecondClickOrder === null) {
                        setTimeout(checkAndAssert, 25);
                        return;
                    }
                    const returnedIds = xhrObj.responseJSON.aaData.map(row => row[0]);
                    assert.deepEqual(returnedIds, expectedSecondClickOrder, "Second click on 'Id' column header reverses the table sort.");
                    QUnit.start();
                };
                checkAndAssert();
            }
        });
    });

    QUnit.asyncTest("Global Search Functionality", function (assert) {
        const globalSearchInput = jQ("label:contains('Search'):first").children('input');
        assert.expect(2);
        QUnit.stop();

        dataGridRequestManager.addOperation({
            trigger: function () {
                globalSearchInput.val("99").trigger("keyup"); // Search for a specific ID
            },
            onSuccess: function (evt, xhrObj, reqOptions) {
                const retrievedIds = xhrObj.responseJSON.aaData.map(row => row[0]);
                assert.deepEqual(retrievedIds, ["99"], "Searching for '99' should return a single record with ID 99.");
                QUnit.start();
            }
        });

        dataGridRequestManager.addOperation({
            trigger: function () {
                globalSearchInput.val("nonexistent@example.com").trigger("keyup"); // Search for a non-matching string
            },
            onSuccess: function (evt, xhrObj, reqOptions) {
                const retrievedIds = xhrObj.responseJSON.aaData.map(row => row[0]);
                assert.deepEqual(retrievedIds, [], "Searching for a non-existent email should return no records.");
                QUnit.start();
            }
        });
    });

})(jQuery);