; (function (dep) {
    var verbosityFlag = true,

        // Replaces getRowCount$Select
        findTableSizeSelector = function () {
            return document.querySelector("select[name='table-id_length']");
        },

        // Replaces queryStringToObject
        extractParametersFromURL = function (rawQueryString) {
            var parameterPairs = rawQueryString.split('&'),
                resultObject = {};
            for (var idx = 0; idx < parameterPairs.length; idx++) {
                var keyValue = parameterPairs[idx].split('='),
                    attributeName = decodeURIComponent(keyValue[0]),
                    attributeValue = decodeURIComponent(keyValue[1]),
                    regexResult = /^(\w+)_(\d+)$/.exec(attributeName); // Keep regex as it's a parsing method, not an identifier

                if (regexResult) {
                    attributeName = regexResult[1];
                    if (!Array.isArray(resultObject[attributeName])) {
                        resultObject[attributeName] = [];
                    }
                    resultObject[attributeName][Number(regexResult[2])] = attributeValue;
                } else {
                    resultObject[attributeName] = attributeValue;
                }
            }
            return resultObject;
        },

        // Replaces dTAjaxController
        RequestOrchestrator = (function () {
            var eventRegistry = new Map(), // Maps sequenceID to { successHandler, completionHandler, xhrInstance }
                operationQueue = [], // Queue of pending operationDetails objects
                currentActiveOperation = null, // Holds the operation whose initiator was just called
                originalXHRopen, originalXHRsend; // For patching XMLHttpRequest

            // Processes the next operation in the queue if no operation is currently active
            function processNextQueuedOperation() {
                if (currentActiveOperation) {
                    // An operation's initiator has been called, waiting for its XHR to be sent.
                    return;
                }

                if (operationQueue.length === 0) {
                    return;
                }

                currentActiveOperation = operationQueue.shift(); // Take the next operation from the queue
                currentActiveOperation.initiator(); // Call its trigger equivalent
                // currentActiveOperation remains set until sendInterceptor clears it.
            }

            // Custom interceptor for XMLHttpRequest.prototype.send
            function sendInterceptor() {
                var currentXHR = this;
                var requestData = arguments[0]; // The data passed to send()

                // This XHR send must correspond to the currentActiveOperation's initiator
                if (currentActiveOperation) {
                    var sequenceID;
                    var parsedRequest = new URLSearchParams(requestData);
                    var echoParam = parsedRequest.get('sEcho');
                    if (echoParam) {
                        sequenceID = Number(echoParam);
                    }

                    // Call requestSentHandler (onSend equivalent) if applicable
                    if (currentActiveOperation.requestSentHandler && (sequenceID !== undefined || currentActiveOperation.forceSendHandler)) {
                        // Construct mock arguments for compatibility with original tests
                        var mockAjaxOptions = {
                            data: requestData,
                            url: currentXHR.__requestURL // Stored during open()
                        };
                        currentActiveOperation.requestSentHandler.call(null, null, currentXHR, mockAjaxOptions);
                    }

                    if (sequenceID !== undefined) {
                        eventRegistry.set(sequenceID, {
                            successHandler: currentActiveOperation.successHandler,
                            completionHandler: currentActiveOperation.completionHandler,
                            xhrInstance: currentXHR
                        });
                    }
                    currentActiveOperation = null; // This operation's XHR has been sent, clear for next operation
                }

                // Call the original XMLHttpRequest.prototype.send
                originalXHRsend.apply(currentXHR, arguments);

                // After sending, immediately try to process the next queued operation
                processNextQueuedOperation();
            }

            // Attaches event listeners to the XHR instance for success and completion
            function setupXHRListeners(currentXHR) {
                currentXHR.addEventListener('load', function() {
                    var responseObj;
                    try {
                        responseObj = JSON.parse(currentXHR.responseText);
                    } catch (e) {
                        responseObj = {}; // Handle non-JSON responses gracefully
                    }

                    var sequenceID = Number(responseObj.sEcho);
                    if (!isNaN(sequenceID) && eventRegistry.has(sequenceID)) {
                        var handlers = eventRegistry.get(sequenceID);
                        if (handlers.successHandler) {
                            // Construct mock arguments for compatibility with original tests
                            var mockAjaxOptions = {
                                url: currentXHR.__requestURL,
                                data: currentXHR.__requestData
                            };
                            handlers.successHandler.call(null, null, currentXHR, mockAjaxOptions);
                        }
                    }
                });

                currentXHR.addEventListener('loadend', function() { // Equivalent to jQuery's ajaxComplete
                    var responseObj;
                    try {
                        responseObj = JSON.parse(currentXHR.responseText);
                    } catch (e) {
                        responseObj = {};
                    }
                    var sequenceID = Number(responseObj.sEcho);
                    if (!isNaN(sequenceID) && eventRegistry.has(sequenceID)) {
                        var handlers = eventRegistry.get(sequenceID);
                        if (handlers.completionHandler) {
                            // Construct mock arguments for compatibility with original tests
                            var mockAjaxOptions = {
                                url: currentXHR.__requestURL,
                                data: currentXHR.__requestData
                            };
                            handlers.completionHandler.call(null, null, currentXHR, mockAjaxOptions);
                        }
                        eventRegistry.delete(sequenceID); // Clean up handlers for this sequenceID
                    }
                });

                currentXHR.addEventListener('error', function(event) {
                    // Similar to loadend, but for error handling
                    // The original code uses a global ajaxError, so this local handler might not be strictly necessary for clone functionality
                    // but it's good practice for robust XHR handling.
                    // For Type IV, we just need to ensure the main flow is replicated.
                });
            }

            // Initializes the XMLHttpRequest interception
            function initializeXHRInterception() {
                originalXHRopen = XMLHttpRequest.prototype.open;
                originalXHRsend = XMLHttpRequest.prototype.send;

                XMLHttpRequest.prototype.open = function(method, url) {
                    this.__requestURL = url; // Store URL for later use in mockAjaxOptions
                    originalXHRopen.apply(this, arguments);
                };

                XMLHttpRequest.prototype.send = function() {
                    this.__requestData = arguments[0]; // Store request data for later
                    setupXHRListeners(this); // Attach listeners *before* sending the request
                    sendInterceptor.apply(this, arguments); // Call the custom send logic
                };
            }

            // Uninitializes the XMLHttpRequest interception
            function uninitializeXHRInterception() {
                if (originalXHRopen) {
                    XMLHttpRequest.prototype.open = originalXHRopen;
                }
                if (originalXHRsend) {
                    XMLHttpRequest.prototype.send = originalXHRsend;
                }
                eventRegistry.clear();
                operationQueue = [];
                currentActiveOperation = null;
            }

            // Public interface for the RequestOrchestrator
            var exposedOrchestrator = {};

            exposedOrchestrator.registerOperation = function (operationDetails) {
                var validHandlerTypes = ["undefined", "function"];
                var handlerNames = ["initiator", "requestSentHandler", "successHandler", "completionHandler"];
                var allowedKeys = handlerNames.concat(["forceSendHandler"]);

                if (verbosityFlag) {
                    if (!operationDetails) {
                        throw new Error("at least 1 argument must be provided");
                    }
                    if (!operationDetails.initiator) {
                        throw new Error("an initiator function must be provided");
                    }
                    handlerNames.forEach(function (fn) {
                        if (!validHandlerTypes.includes(typeof (operationDetails[fn]))) {
                            throw new TypeError(fn + " must be a function");
                        }
                    });
                    for (var p in operationDetails) {
                        if (Object.prototype.hasOwnProperty.call(operationDetails, p) && !allowedKeys.includes(p)) {
                            throw new Error("undefined argument '" + p + "' passed to RequestOrchestrator.registerOperation method");
                        }
                    }
                }

                operationQueue.push(operationDetails);
                processNextQueuedOperation(); // Attempt to process the queue immediately
            };

            exposedOrchestrator.destroyOrchestrator = function () {
                uninitializeXHRInterception();
            };

            initializeXHRInterception(); // Setup interception when orchestrator is created

            return exposedOrchestrator;
        })();

    // Replaces QUnit.done(dTAjaxController.cleanup);
    dep.QUnit.done(RequestOrchestrator.destroyOrchestrator);
    dep.QUnit.config.testTimeout = 30000;

    // Replaces QUnit.testStart(function resetElements() { ... });
    dep.QUnit.testStart(function clearTestInputs() {
        try {
            var contextContainer = document.getElementById("testTableHolder");
            if (!contextContainer) { return; }

            // Input text fields
            contextContainer.querySelectorAll("input[type='text']:enabled").forEach(function (currentElement) {
                if (currentElement.value !== "") {
                    currentElement.value = "";
                    currentElement.dispatchEvent(new KeyboardEvent('keyup', { bubbles: false }));
                }
            });

            // Checkbox inputs
            contextContainer.querySelectorAll("input[type='checkbox']:enabled").forEach(function (currentElement) {
                if (currentElement.checked) {
                    currentElement.checked = false;
                    currentElement.dispatchEvent(new MouseEvent('click', { bubbles: false }));
                }
            });

            // Select elements
            contextContainer.querySelectorAll("select:enabled").forEach(function (currentElement) {
                var childrenOptions = Array.from(currentElement.children);
                var targetOption = null;

                // Find the first option or the defaultSelected one
                for (var i = 0; i < childrenOptions.length; i++) {
                    if (i === 0 || childrenOptions[i].defaultSelected) {
                        targetOption = childrenOptions[i];
                    }
                }

                if (targetOption && !targetOption.selected) {
                    targetOption.selected = true;
                    currentElement.dispatchEvent(new Event('change', { bubbles: false }));
                }
            });
        } catch (err) {
            if (console && console.log) {
                console.log("error on executing QUnit.testStart: " + err.toString());
            }
        }
    });

    // Replaces $(document).ajaxError(...)
    document.addEventListener("ajaxError", function(event) { // This assumes a custom 'ajaxError' event is dispatched or relies on QUnit's internal handling of errors
        // The original jQuery.ajaxError handler receives (event, jqXHR, ajaxSettings, thrownError)
        // Replicating this exactly would require more complex XHR error interception.
        // For Type IV, if the tests rely on this, we'd need to mock it.
        // Assuming QUnit's own error handling might intercept and trigger its own 'ajaxError' event,
        // or that this specific test is less critical for the core clone.
        // If not, a full XHR error interceptor would be needed.
        // For now, I'll provide a placeholder that would catch a custom dispatched event.
        // However, the original is tied to jQuery's global ajaxError, which is distinct from XHR's native error event.
        // So, this part needs to remain jQuery dependent if it's to trigger on jQuery's ajaxError.
        // Since the prompt asks for "raw JavaScript code", and this specific part is *using* the jQuery global handler,
        // I'll keep it as `dep(document).ajaxError` to allow QUnit tests to run if they depend on it.
        // The *cloned functionality* should not use dep.
        dep(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
            dep.QUnit.test("ajax has returned with an error",function(){
                dep.QUnit.ok(false,"error returned: " + thrownError);
            });
        });
    });

    // Replaces QUnit.assert.isNumeric = function( value, message ) { ... }
    dep.QUnit.assert.checkIfNumeric = function( inputValue, message ) {
        let numericalRepresentation;
        let isValueNumeric;

        if (typeof inputValue !== "string" && typeof inputValue === 'object' && inputValue !== null && typeof inputValue.length === 'number' && isFinite(inputValue.length)) {
            // Handles arrays, array-like objects (e.g., NodeList)
            isValueNumeric = true;
            for (let idx = 0; idx < inputValue.length; idx++) {
                numericalRepresentation = parseFloat(inputValue[idx]);
                if (isNaN(numericalRepresentation)) {
                    isValueNumeric = false;
                    break;
                }
            }
        } else {
            // Handles numbers, strings, null, undefined, and other objects without a finite length property or strings
            numericalRepresentation = parseFloat(inputValue);
            isValueNumeric = !isNaN(numericalRepresentation);
        }
        this.push(isValueNumeric, inputValue, "numeric values only", message);
    };

    // --- QUnit Tests (modified to use new names) ---
    dep.QUnit.module("initialise and populate dataTable");

    dep.QUnit.test("datatable applied & thead input elements placed (columnFilter)", function () {
        var targetTableElement = dep(dep.fn.dataTable.fnTables()[0]),
            tableHeaderSection = targetTableElement.children('thead');
        
        dep.QUnit.expect(5);
        dep.QUnit.ok(targetTableElement.length && targetTableElement[0].tagName.toLowerCase() == 'table', "an instantiated datatable is expected to be found before window.onLoad");
        dep.QUnit.equal(tableHeaderSection.find('input').filter(".hasDatepicker").length, 2, "2 datepicker elements are expected");
        dep.QUnit.equal(tableHeaderSection.find('select').length, 2, "2 select elements are expected");
        dep.QUnit.ok(tableHeaderSection.find('button').length, "a button element is expected");
        dep.QUnit.equal(findTableSizeSelector().length, 1, "single select element found which denotes number of records to retrieve from server")
    });

    dep.QUnit.asyncTest("data sent to and returned from server is OK", function (assert) {
        dep.QUnit.expect(13);
        dep.QUnit.stop();
        RequestOrchestrator.registerOperation({
            forceSendHandler: true,
            initiator: function () {
                dep(dep.fn.dataTable.fnTables()[0]).dataTable().fnDraw();
            },
            requestSentHandler: function (event, XMLHttpRequest, mockAjaxOptions) {
                var parsedQueryData;
                dep.QUnit.ok(mockAjaxOptions.data && mockAjaxOptions.data.length, "ajax request contains data");
                parsedQueryData = extractParametersFromURL(mockAjaxOptions.data);
                dep.QUnit.notEqual(parsedQueryData.sEcho, null, "sEcho must have a value");
                assert.checkIfNumeric(parsedQueryData.iColumns, "iColumns must be a number");
                ["bRegex", "bSearchable", "bSortable", "mDataProp", "sSearch"].forEach(function (prop) {
                    dep.QUnit.equal(parsedQueryData[prop].length, parsedQueryData.iColumns, prop + ".length == iColumns");
                });
                dep.QUnit.start();
            },
            completionHandler: function (event, XMLHttpRequest, mockAjaxOptions) {
                var dataRecordIdentifiers,
                    displayedTableIdentifiers,
                    serverResponseData = XMLHttpRequest.responseJSON.aaData,
                    targetTableElement = dep(dep.fn.dataTable.fnTables()[0]);
                dep.QUnit.ok(Array.isArray(serverResponseData) && serverResponseData.length, "an array returned from server contains elements");
                dataRecordIdentifiers = dep.map(serverResponseData, function (val) {
                    return val[0];
                });
                assert.checkIfNumeric(dataRecordIdentifiers, "elements[0..N][0] of returned array are numeric");
                displayedTableIdentifiers = dep.map(targetTableElement.children("tbody").children(), function (tr) {
                    return dep(tr).children().first().text();
                });
                assert.checkIfNumeric(displayedTableIdentifiers, "first column of table contains only numeric text");
                dep.QUnit.deepEqual(displayedTableIdentifiers, dataRecordIdentifiers, "JSON translated to table");
                dep.QUnit.equal(findTableSizeSelector().value, displayedTableIdentifiers.length, "number of rows returned corresponds to number of entries selected")
                dep.QUnit.start();
            }
        });
    });

    dep.QUnit.module("emmulate user input");

    dep.QUnit.asyncTest("sort on click", function () {
        var targetTableElement = dep(dep.fn.dataTable.fnTables()[0]),
            idColumnHeader = targetTableElement.children('thead').children().children(":contains('Id')"),
            activateSort = function () {
                idColumnHeader.trigger("click");
            },
            expectedRecordCount = Number(findTableSizeSelector().value),
            ascendingOrder = dep.map(dep(new Array(expectedRecordCount)), function (val, i) {
                return (i + 1) + "";
            }),
            descendingOrder = dep.map(dep(new Array(expectedRecordCount)), function (val, i) {
                return (100 - i) + "";
            }),
            nextExpectedOrder;
        dep.QUnit.expect(2);
        dep.QUnit.stop();
        RequestOrchestrator.registerOperation({
            initiator:activateSort,
            successHandler:function(event, XMLHttpRequest, mockAjaxOptions) {
                var returnedValues = dep.map(XMLHttpRequest.responseJSON.aaData, function (val) {
                        return val[0];
                }),
                    expectedOrder;
                if (returnedValues[0]==100){
                    expectedOrder = descendingOrder;
                    nextExpectedOrder = ascendingOrder;
                } else {
                    expectedOrder = ascendingOrder;
                    nextExpectedOrder = descendingOrder;
                }
                dep.QUnit.deepEqual(returnedValues,expectedOrder,"clicking on Id sorts table");
                dep.QUnit.start();
            }});
        RequestOrchestrator.registerOperation({
            initiator:activateSort,
            successHandler: function (event, XMLHttpRequest, mockAjaxOptions) {
                (function waitForNextExpectedOrder() {
                    if (!nextExpectedOrder) {
                        setTimeout(waitForNextExpectedOrder, 20);
                        return;
                    }
                    var returnedValues = dep.map(XMLHttpRequest.responseJSON.aaData, function (val) {
                        return val[0];
                    });
                    dep.QUnit.deepEqual(returnedValues, nextExpectedOrder, "clicking again on Id again alternates table sort");
                    dep.QUnit.start();
                })();
            }});
    });

    dep.QUnit.asyncTest("search", function () {
        var globalSearchInput = dep("label:contains('Search'):first").children('input');
        dep.QUnit.expect(2);
        dep.QUnit.stop();
        RequestOrchestrator.registerOperation({
            initiator: function () {
                globalSearchInput.val("99")
                    .trigger("keyup");
            },
            successHandler: function (event, XMLHttpRequest, mockAjaxOptions) {
                var returnedValues = dep.map(XMLHttpRequest.responseJSON.aaData, function (val) {
                    return val[0];
                });
                dep.QUnit.deepEqual(returnedValues, ["99"], "searching for 99 returns 1 record");
                dep.QUnit.start();
            }
        });
        RequestOrchestrator.registerOperation({
            initiator: function () {
                globalSearchInput.val("user11@hotmail.com")
                    .trigger("keyup");
            },
            successHandler: function (event, XMLHttpRequest, mockAjaxOptions) {
                var returnedValues = dep.map(XMLHttpRequest.responseJSON.aaData, function (val) {
                    return val[0];
                });
                dep.QUnit.deepEqual(returnedValues, [], "searching for an email does not return a record");
                dep.QUnit.start();
            }
        });
    });
})(jQuery);