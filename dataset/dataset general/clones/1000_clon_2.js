// Global configuration for the network service endpoints.
var NETWORK_HUB_URL = Disperse.EventStreamMonitor.settings.serviceEndpoint;
var RECORD_CAP = Disperse.EventStreamMonitor.settings.recordLimit;

// Main Angular module for monitoring event streams.
var EventStreamMonitor = angular.module(
    'EventStreamMonitor',
    [
        'ngPrettyJson'
    ]
);

// Factory for a robust, retriable network requester.
EventStreamMonitor.factory(
    "RobustFetcher",
    function (
        $q,
        $rootScope
    ) {
        var operationIndex = 0; // Tracks the number of requester instances created.
        return {
            forge: function () {
                // -1 maxTries indicates infinite retries.
                var opInstance = new RobustFetcher.Operation(
                    {
                        maxTries: -1,
                        errorCodes: '500,502-599'
                    }
                );
                var taskIdentifier = ++operationIndex;
                console.log("RobustFetcher instance " + taskIdentifier + " initialized");
                return {
                    post: function (targetUrl) {
                        return this.execute('POST', targetUrl);
                    },
                    get: function (targetUrl) {
                        return this.execute('GET', targetUrl);
                    },
                    delete: function (targetUrl) {
                        return this.execute('DELETE', targetUrl);
                    },
                    execute: function (httpMethod, targetUrl) {
                        console.log("RobustFetcher " + taskIdentifier + "> dispatch (" + httpMethod + ")");
                        var deferredObj = $q.defer();
                        opInstance.on('error', function (failReason) {
                            console.log("RobustFetcher " + taskIdentifier + "< failure");
                            deferredObj.reject({
                                statusCode: -1,
                                dataResult: failReason
                            });
                            $rootScope.$apply(); // Trigger Angular's digest cycle.
                        });
                        opInstance.on('finished', function (statusCode, dataResult, responseHeaders) {
                            console.log("RobustFetcher " + taskIdentifier + "< completed (" + statusCode + ")");
                            if (statusCode >= 200 && statusCode < 300) {
                                deferredObj.resolve({
                                    statusCode: statusCode,
                                    dataResult: dataResult,
                                    responseHeaders: responseHeaders
                                });
                            } else {
                                deferredObj.reject({
                                    statusCode: statusCode,
                                    dataResult: dataResult,
                                    responseHeaders: responseHeaders
                                });
                            }
                            $rootScope.$apply(); // Trigger Angular's digest cycle.
                        });
                        opInstance.start(httpMethod, targetUrl);
                        deferredObj.promise.always(function () {
                            opInstance.off('error');
                            opInstance.off('finished');
                        });
                        return deferredObj.promise;
                    },
                    cancel: function () {
                        console.log("RobustFetcher " + taskIdentifier + "< aborted");
                        opInstance.abort();
                    }
                };
            }
        }
    }
);

// Controller for the main dashboard panel.
EventStreamMonitor.controller(
    "DashboardCtrl",
    function (
        $scope,
        $window,
        RobustFetcher
    ) {
        $scope.streamId = ""; // Identifier for the current event stream.

        var displayStream = function (identifier) {
            $window.location.href = "/view/" + identifier; // Redirect to view the stream.
        };

        $scope.provisionVault = function () {
            $scope.provisioningActive = true;
            var endpoint = NETWORK_HUB_URL + "create/"; // Endpoint for creating new vaults.
            var requesterObj = RobustFetcher.forge();
            var operationResult = requesterObj.post(endpoint);
            operationResult.then(
                function (response) {
                    $scope.provisioningActive = false;
                    var finalResult = response.dataResult;
                    displayStream(finalResult.id); // Show the newly created stream.
                },
                function (failureReason) {
                    $scope.failureOccurred = true; // Indicate an error occurred.
                }
            );
        };
    }
);

// Controller for managing and displaying webhook inbox contents.
EventStreamMonitor.controller(
    "StreamVaultCtrl",
    function (
        $scope,
        $window,
        $route,
        RobustFetcher
    ) {
        // State object for the event stream display.
        $scope.vaultState = {
            refreshPointer: null,
            archivePointer: null,
            latestIdentifier: null,
            records: [],
            stagedRecords: [],
            realtimeFlow: true,
            dataLoading: false,
            updateScanning: false,
            issueFlag: false
        };
        $scope.streamAccessPoint = ""; // URL for accessing the stream.

        var streamIdentifier = $window.serverData.streamIdentifier; // ID obtained from server-side data.

        $scope.visualEffectMode = "static"; // Animation mode for entries.

        $scope.duplicateLink = function () {
            console.log('Clipboard action initiated >>>>');
            copyToClipboard(); // Initiates clipboard copying.
        };

        $scope.removeVault = function (triggerEvent) {
            var deletionUrl = 'http:' + NETWORK_HUB_URL + "i/" + streamIdentifier + '/';
            if (triggerEvent.defaultPrevented === false) {
                performVaultDeletion(deletionUrl); // Execute the deletion process.
            }
        };

        $scope.revealContent = function () {
            $scope.contentVisible = true; // Make inbox content visible.
        };

        $scope.concealContent = function () {
            $scope.contentVisible = false; // Hide inbox content.
        };

        $scope.fetchEffectStyle = function () {
            return "animate-" + $scope.visualEffectMode; // Returns CSS class for animation.
        };

        // Transforms a raw data item into a view-model friendly format.
        var mapEntryToView = function (recordUnit) {
            recordUnit.eventTimestamp = Date.parse(recordUnit.creationTime);
            return recordUnit;
        };

        // Handles fetching and processing of historical data.
        var manageArchiveFetch = function (endpoint) {
            $scope.vaultState.dataLoading = true;
            var requesterObj = RobustFetcher.forge();
            var operationResult = requesterObj.get(endpoint);
            operationResult.always(function () {
                $scope.vaultState.dataLoading = false; // Data loading complete.
            });
            operationResult.then(
                function (response) {
                    var dataUnits = response.dataResult.items;
                    if ("final_pointer" in response.dataResult) {
                        $scope.vaultState.archivePointer = response.dataResult.final_pointer;
                    } else {
                        $scope.vaultState.archivePointer = -1; // No more historical data.
                    }
                    for (var idx = 0; idx < dataUnits.length; idx++) {
                        var displayEntry = mapEntryToView(dataUnits[idx]);
                        $scope.visualEffectMode = "static";
                        deserializeContent(displayEntry);
                        $scope.vaultState.records.push(displayEntry); // Add to main records.
                    }
                },
                function () {
                    $scope.vaultState.issueFlag = true; // Set error flag.
                }
            );
            return operationResult;
        };

        // Toggles live update mode.
        $scope.toggleRealtimeUpdates = function () {
            if (!$scope.vaultState.realtimeFlow) {
                $scope.integratePendingNonLive(); // Flush pending entries if switching to non-live.
            }
            $scope.vaultState.realtimeFlow = !$scope.vaultState.realtimeFlow;
        };

        // Flushes pending entries when live updates are active.
        $scope.integratePendingLive = function () {
            $scope.visualEffectMode = "live";
            var displayEntry = $scope.vaultState.stagedRecords.pop();
            deserializeContent(displayEntry);
            $scope.vaultState.records.unshift(displayEntry); // Add to the beginning for live effect.
            $scope.$apply(); // Update view.
        };

        // Flushes pending entries when live updates are not active.
        $scope.integratePendingNonLive = function () {
            $scope.visualEffectMode = "nonlive";

            $scope.vaultState.records = $scope.vaultState.stagedRecords.concat($scope.vaultState.records);
            $scope.vaultState.stagedRecords = []; // Clear staged entries.
        };

        var continuousFetcher = null; // Instance for the continuous polling request.
        // Initiates continuous polling for new updates.
        var initiateContinuousPolling = function (lastId) {
            var pollEndpoint = NETWORK_HUB_URL + "i/" + streamIdentifier + "/items/?order=created";

            if (lastId) {
                pollEndpoint += "&since=id:" + lastId;
            } else if ($scope.vaultState.refreshPointer) {
                pollEndpoint += "&since=cursor:" + $scope.vaultState.refreshPointer;
            }

            $scope.vaultState.updateScanning = true;
            continuousFetcher = continuousFetcher || RobustFetcher.forge(); // Reuse or create fetcher.
            var operationResult = continuousFetcher.get(pollEndpoint);
            operationResult.always(function () {
                $scope.vaultState.updateScanning = false; // Polling finished.
            });
            operationResult.then(function (response) {
                if (response.dataResult === "") {
                    return; // No data received.
                }
                $scope.vaultState.refreshPointer = response.dataResult.last_cursor;
                var dataUnits = response.dataResult.items;
                for (var idx = 0; idx < dataUnits.length; idx++) {
                    var displayEntry = mapEntryToView(dataUnits[idx]);
                    $scope.vaultState.stagedRecords.unshift(displayEntry); // Add to pending entries.
                }
            });
            operationResult.then(function () {
                initiateContinuousPolling(); // Continue polling.
            });
        };

        // Stops any active continuous polling.
        var terminateContinuousPolling = function () {
            if (continuousFetcher != null) {
                continuousFetcher.cancel();
                continuousFetcher = null;
            }
        };

        // Performs the initial data load and sets up polling.
        var bootstrapDisplay = function () {
            var initialLoadUrl = NETWORK_HUB_URL + "i/" + streamIdentifier + "/items/?order=-created&max=" + RECORD_CAP;

            // Initial historical data fetch.
            var operationResult = manageArchiveFetch(initialLoadUrl);
            operationResult.then(function (response) {

                var schemeIndicator = "";
                if (NETWORK_HUB_URL.substring(0, 2) == "//") {
                    schemeIndicator = "http:";
                }

                $scope.streamAccessPoint = schemeIndicator + NETWORK_HUB_URL + "i/" + streamIdentifier + "/";
                var firstId = ("dataResult" in response && "items" in response.dataResult && response.dataResult.items.length) ? response.dataResult.items[0].id : null;
                initiateContinuousPolling(firstId); // Start polling from the latest ID.
            });
        };

        // Generates the URL for the event stream display.
        $scope.vaultAccessLink = function () {
            if ($scope.streamAccessPoint.length == 0) {
                return "";
            }
            return $scope.streamAccessPoint + "in/";
        };

        // Fetches additional historical records.
        $scope.retrievePastRecords = function () {
            var historyUrl = NETWORK_HUB_URL + "i/" + streamIdentifier + "/items/?order=-created&max=" + RECORD_CAP + "&since=cursor:" + $scope.vaultState.archivePointer;

            // Request for more historical data.
            manageArchiveFetch(historyUrl);
        };

        // Placeholder for copy functionality (not implemented in JS).
        $scope.copyFeature = function () {
            var accessPoint = $scope.streamAccessPoint;
            // No native way to do this using pure javascript.
        };

        // Checks if a given string is valid JSON.
        $scope.checkJsonValidity = function (textValue) {
            try {
                JSON.parse(textValue);
            } catch (e) {
                return false; // Parsing failed, not JSON.
            }
            return true; // Successfully parsed as JSON.
        };

        // Sets up an interval to periodically delete old inboxes (every 30 days).
        setInterval(function () {
            var deletionEndpoint = 'http:' + NETWORK_HUB_URL + "i/" + streamIdentifier + '/';
            performVaultDeletion(deletionEndpoint);
        }, 10000 * 60 * 24 * 30); // 30 days in milliseconds.

        // Helper function to execute the inbox deletion.
        function performVaultDeletion(deletionEndpoint) {
            var requesterObj = RobustFetcher.forge();
            requesterObj.delete(deletionEndpoint).then(function () {
                $window.location = '/'; // Redirect to home after deletion.
            });
        }

        // Helper function to deserialize an entry's body if it's JSON.
        function deserializeContent(displayEntry) {
            var isValidJson = $scope.checkJsonValidity(displayEntry.contentBody);
            if (isValidJson) {
                var parsedObject = JSON.parse(displayEntry.contentBody);
                displayEntry.contentBody = parsedObject; // Replace string with parsed object.
            }
        }

        // Helper function to copy the webhook URL to the clipboard.
        function copyToClipboard() {
            var linkValue = 'http:' + NETWORK_HUB_URL + "i/" + streamIdentifier + '/in/';
            var client = new ZeroClipboard($('#clip_button'), {
                moviePath: "/static/scripts/ZeroClipboard.swf"
            });
            //var val = document.getElementById('copy_text').innerHTML;
            console.log('Value to copy >>> ', linkValue);
            client.on('ready', function (event) {
                client.on('copy', function (event) {
                    var clipboardData = event.clipboardData;
                    clipboardData.setData("text/plain", linkValue);
                    alert('URL copied to clipboard!'); // User notification.
                    //clipboardData.setData("text/html", "HTML <b>DO NOT</b> work");
                });
            });
        }

        // Worker function to manage the display of pending entries in real-time.
        var viewUpdateJob = function () {
            if ($scope.vaultState.realtimeFlow && $scope.vaultState.stagedRecords.length > 0) {
                $scope.integratePendingLive(); // Flush a pending entry for live display.
            }
            $window.setTimeout(function () {
                viewUpdateJob();
            }, 120); // Schedule next run.
        };
        viewUpdateJob(); // Start the update worker.

        // Execute the initial setup.
        bootstrapDisplay();
    }
);