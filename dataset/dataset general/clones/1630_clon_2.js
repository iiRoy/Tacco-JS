; (function (jq) {
    // Controls detailed logging for development or debugging purposes.
    var verboseLogging = true,
        // Retrieves the jQuery object for the dropdown that controls the number of rows displayed.
        retrieveRowCounterElement = function () {
            return jq("select[name='table-id_length']");
        },
        // Transforms a standard URL query string into a JavaScript object.
        parseQueryString = function (queryText) {
            var segments = queryText.split('&'),
                outputMap = {};

            for (var idx = 0; idx < segments.length; idx++) {
                var itemPair = segments[idx].split('='),
                    attributeName = decodeURIComponent(itemPair[0]),
                    dataValue = decodeURIComponent(itemPair[1]),
                    patternResult = /^(\w+)_(\d+)$/.exec(attributeName);

                if (patternResult) {
                    attributeName = patternResult[1];
                    if (!jq.isArray(outputMap[attributeName])) {
                        outputMap[attributeName] = [];
                    }
                    outputMap[attributeName][parseInt(patternResult[2])] = dataValue;
                } else {
                    outputMap[attributeName] = dataValue;
                }
            }
            return outputMap;
        },
        // This module manages AJAX requests related to DataTables, coordinating callbacks.
        tableRequestCoordinator = (function () {
            var pendingOperations = [],
                latestOptions,
                coordinatorResult = {};

            // Handler executed when an AJAX request is about to be sent.
            var requestStartCallback = function (evt, xmlHttpRequest, callParameters) {
                    if (!latestOptions) { return; }

                    var echoPattern = /\bsEcho=(\d+)/.exec(callParameters.data),
                        requestSequence;

                    if (latestOptions.sendCallback && (echoPattern || latestOptions.runSendIfNoEcho)) {
                        latestOptions.sendCallback.apply(this, arguments);
                    }

                    if (!echoPattern) { return; }

                    requestSequence = parseInt(echoPattern[1]);
                    pendingOperations[requestSequence] = {
                        successCallback: latestOptions.successCallback,
                        completeCallback: latestOptions.completeCallback
                    }
                    latestOptions = null;
                },
                // Handler invoked upon a successful AJAX response.
                requestSuccessCallback = function (evt, xmlHttpReq, callParameters) {
                    var echoIdentifier = parseInt(xmlHttpReq.responseJSON.sEcho);

                    if (!isNaN(echoIdentifier) && pendingOperations[echoIdentifier] && pendingOperations[echoIdentifier].successCallback) {
                        pendingOperations[echoIdentifier].successCallback.apply(this, arguments);
                    }
                },
                // Handler called when an AJAX request completes, regardless of success or failure.
                requestCompleteCallback = function (evt, xmlHttpReq, callParameters) {
                    var echoIdentifier = parseInt(xmlHttpReq.responseJSON.sEcho);

                    if (!isNaN(echoIdentifier) && pendingOperations[echoIdentifier]) {
                        if (pendingOperations[echoIdentifier].completeCallback) {
                            pendingOperations[echoIdentifier].completeCallback.apply(this, arguments);
                        }
                        delete pendingOperations[echoIdentifier];
                    }
                };

            // Bind global AJAX events to the document.
            jq(document)
                .ajaxSend(requestStartCallback)
                .ajaxSuccess(requestSuccessCallback)
                .ajaxComplete(requestCompleteCallback);

            // Adds a new AJAX request configuration to the processing queue.
            coordinatorResult.queueRequest = function (operationDetails) {
                var validTypes = ["undefined", "function"];

                if (verboseLogging) {
                    var callbackNames = ["trigger", "sendCallback", "successCallback", "completeCallback"],
                        allValidKeys = callbackNames.concat(["runSendIfNoEcho"]),
                        propKey;

                    if (!operationDetails) {
                        throw new Error("A configuration object must be supplied.");
                    }
                    if (!operationDetails.trigger) {
                        throw new Error("A trigger function must be specified in the configuration.");
                    }

                    jq.each(callbackNames, function (indexVal, funcName) {
                        if (validTypes.indexOf(typeof (operationDetails[funcName])) === -1) {
                            throw new TypeError(funcName + " must be either a function or undefined.");
                        }
                    });

                    for (propKey in operationDetails) {
                        if (operationDetails.hasOwnProperty(propKey) && jq.inArray(propKey, allValidKeys) === -1) {
                            throw new Error("Unknown argument '" + propKey + "' passed to tableRequestCoordinator.queueRequest method.");
                        }
                    }
                }

                // Pauses execution until the previous request configuration has been fully processed.
                (function waitForConfigConsumption() {
                    if (latestOptions) {
                        setTimeout(waitForConfigConsumption, 20);
                        return;
                    }
                    latestOptions = operationDetails;
                    operationDetails.trigger();
                })();
            }

            // Removes all previously attached global AJAX event handlers.
            coordinatorResult.deregisterHandlers = function () {
                pendingOperations = null;
                jq(document)
                    .off("ajaxSend", requestStartCallback)
                    .off("ajaxSuccess", requestSuccessCallback)
                    .off("ajaxComplete", requestCompleteCallback);
            }

            return coordinatorResult;
        })();

    // QUnit hook: Ensure AJAX handlers are cleaned up once all tests are done.
    QUnit.done(tableRequestCoordinator.deregisterHandlers);
    QUnit.config.testTimeout = 30000;
    // QUnit hook: Resets various input elements before each test run to ensure a clean state.
    QUnit.testStart(function clearFormInputs() {
        try {
            var scopeElement = document.getElementById("testTableHolder");

            // Clear text inputs within the test scope.
            jq("input[type='text']:enabled", scopeElement)
                .each(function () {
                    if (this.value !== "") {
                        this.value = "";
                        jq(this).triggerHandler("keyup");
                    }
                });
            // Uncheck checkboxes within the test scope.
            jq("input[type='checkbox']:enabled", scopeElement)
                .each(function () {
                    if (this.checked) {
                        this.checked = false;
                        jq(this).triggerHandler("click");
                    }
                });
            // Reset select elements to their default or first option.
            jq("select:enabled", scopeElement)
                .each(function () {
                    jq(this).children().filter(function (indexVal) {
                        return (indexVal === 0 || this.defaultSelected);
                    }).last()
                        .each(function () {
                            if (!this.selected) {
                                this.selected = true;
                                this.triggerHandler("change");
                            }
                        });
                });
        } catch (errorObject) {
            if (console && console.log) {
                console.log("Error occurred during QUnit.testStart execution: " + errorObject.toString());
            }
        }
    });

    // Global AJAX error handler for QUnit tests, reporting any AJAX failures as test errors.
    jq(document).ajaxError(function(evt, xmlHttpRequest, requestSettings, errorThrown)
    {
        test("AJAX request encountered an error", function(){
            ok(false, "Error reported: " + errorThrown);
        });
    });// This error handler is not explicitly deregistered.

    // Custom QUnit assertion: Checks if a given value or all values in an array are numeric.
    QUnit.assert.isNumeric = function( inputVal, statusMsg ) {
        var parsedNum, isNumberFlag;
        if (isFinite(inputVal.length) && typeof (inputVal) !== "string") {
            var loopCount = 0;
            isNumberFlag = true;
            for(;loopCount < inputVal.length; loopCount++){
                parsedNum = parseFloat(inputVal[loopCount]);
                if (isNaN(parsedNum)) {
                    isNumberFlag = false;
                    break;
                }
            }
        } else {
            parsedNum = parseFloat(inputVal);
            isNumberFlag = !isNaN(parsedNum);
        }
        QUnit.push(isNumberFlag, inputVal, "numeric values only", statusMsg);
    };

    module("Initialize and populate data grid");

    test("Data grid applied and header input elements rendered (column filter)", function () {
        var targetTable = jq(jq.fn.dataTable.fnTables()[0]),
            tableHeader = targetTable.children('thead');

        expect(5);
        ok(targetTable.length && targetTable[0].tagName.toLowerCase() === 'table', "An initialized data grid is expected before window.onLoad.");
        equal(tableHeader.find('input').filter(".hasDatepicker").length, 2, "Two datepicker elements are anticipated.");
        equal(tableHeader.find('select').length, 2, "Two select elements are anticipated.");
        ok(tableHeader.find('button').length, "A button element is expected.");
        equal(retrieveRowCounterElement().length, 1, "A single select element is found to control number of records retrieved from server.");
    });

    asyncTest("Data sent to and received from server is correct", function (assertionUtil) {
        expect(13);
        stop();
        tableRequestCoordinator.queueRequest({
            runSendIfNoEcho: true,
            trigger: function () {
                jq(jq.fn.dataTable.fnTables()[0]).dataTable().fnDraw();
            },
            sendCallback: function (evt, xmlHttpRequest, callParameters) {
                var parsedQueryData;
                ok(callParameters.data && callParameters.data.length, "AJAX request includes data.");
                parsedQueryData = parseQueryString(callParameters.data);
                notEqual(parsedQueryData.sEcho, null, "sEcho must contain a value.");
                assertionUtil.isNumeric(parsedQueryData.iColumns, "iColumns must be a numerical value.");
                ["bRegex", "bSearchable", "bSortable", "mDataProp", "sSearch"].forEach(function (propertyKey) {
                    equal(parsedQueryData[propertyKey].length, parsedQueryData.iColumns, propertyKey + ".length == iColumns.");
                });
                start();
            },
            completeCallback: function (evt, xmlHttpRequest, callParameters) {
                var dataItemIDs,
                    renderedIdentifiers,
                    fetchedRecords = xmlHttpRequest.responseJSON.aaData,
                    targetTable = jq(jq.fn.dataTable.fnTables()[0]);
                ok(jq.isArray(fetchedRecords) && fetchedRecords.length, "An array containing elements is returned from the server.");
                dataItemIDs = jq.map(fetchedRecords, function (valueItem) {
                    return valueItem[0];
                });
                assertionUtil.isNumeric(dataItemIDs, "elements[0..N][0] of returned array are numerical.");
                renderedIdentifiers = jq.map(targetTable.children("tbody").children(), function (tableRow) {
                    return jq(tableRow).children().first().text();
                });
                assertionUtil.isNumeric(renderedIdentifiers, "The first column of the table contains only numerical text.");
                deepEqual(renderedIdentifiers, dataItemIDs, "JSON data successfully translated to table.");
                equal(retrieveRowCounterElement().val(), renderedIdentifiers.length, "Number of rows returned matches number of entries selected.");
                start();
            }
        });
    });

    module("Simulate user interaction");

    asyncTest("Sort on column header click", function () {
        var targetTable = jq(jq.fn.dataTable.fnTables()[0]),
            identifierHeader = targetTable.children('thead').children().children(":contains('Id')"),
            activateClickEvent = function () {
                identifierHeader.trigger("click");
            },
            numRecords = parseInt(retrieveRowCounterElement().val(), 10),
            ascendingOrder = jq.map(jq(new Array(numRecords)), function (valueItem, index) {
                return index + 1 + "";
            }),
            descendingOrder = jq.map(jq(new Array(numRecords)), function (valueItem, index) {
                return 100 - index + "";
            }),
            expectedAfterSecondClick;

        expect(2);
        stop();
        tableRequestCoordinator.queueRequest({
            trigger: activateClickEvent,
            successCallback: function(evt, xmlHttpRequest, callParameters) {
                var retrievedData = jq.map(xmlHttpRequest.responseJSON.aaData, function (valueItem) {
                        return valueItem[0];
                }),
                    anticipatedResult;
                if (retrievedData[0] === 100){
                    anticipatedResult = descendingOrder;
                    expectedAfterSecondClick = ascendingOrder;
                } else {
                    anticipatedResult = ascendingOrder;
                    expectedAfterSecondClick = descendingOrder;
                }
                deepEqual(retrievedData, anticipatedResult, "Clicking on 'Id' column sorts the table.");
                start();
            }});
        tableRequestCoordinator.queueRequest({
            trigger: activateClickEvent,
            successCallback: function (evt, xmlHttpRequest, callParameters) {
                (function checkSecondClickExpectation() {
                    if (!expectedAfterSecondClick) {
                        setTimeout(checkSecondClickExpectation, 20);
                        return;
                    }
                    var retrievedData = jq.map(xmlHttpRequest.responseJSON.aaData, function (valueItem) {
                        return valueItem[0];
                    });
                    deepEqual(retrievedData, expectedAfterSecondClick, "Clicking 'Id' again reverses the table sort order.");
                    start();
                })();
            }});
    });

    asyncTest("Search functionality", function () {
        var filterBox = jq("label:contains('Search'):first").children('input');
        expect(2);
        stop();
        tableRequestCoordinator.queueRequest({
            trigger: function () {
                filterBox.val("99")
                    .trigger("keyup");
            },
            successCallback: function (evt, xmlHttpRequest, callParameters) {
                var retrievedData = jq.map(xmlHttpRequest.responseJSON.aaData, function (valueItem) {
                    return valueItem[0];
                });
                deepEqual(retrievedData, ["99"], "Searching for '99' returns a single record.");
                start();
            }
        });
        tableRequestCoordinator.queueRequest({
            trigger: function () {
                filterBox.val("user11@hotmail.com")
                    .trigger("keyup");
            },
            successCallback: function (evt, xmlHttpRequest, callParameters) {
                var retrievedData = jq.map(xmlHttpRequest.responseJSON.aaData, function (valueItem) {
                    return valueItem[0];
                });
                deepEqual(retrievedData, [], "Searching for an email address does not return any records.");
                start();
            }
        });
    });
})(jQuery);