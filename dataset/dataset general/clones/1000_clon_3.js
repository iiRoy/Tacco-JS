const SERVICE_BASE_URL = Fanout.WebhookInboxViewer.config.apiEndpoint;
const ITEM_LIMIT_PER_FETCH = Fanout.WebhookInboxViewer.config.maxResults;

var NotificationStreamApp = angular.module('NotificationStreamApp', ['ngPrettyJson']);

NotificationStreamApp.factory("RequestRetryService", function($q, $rootScope) {
    let clientInstanceCounter = 0;
    const DEFAULT_RETRY_ERRORS = '500,502-599';

    return {
        spawnClient: function() {
            const requestOptions = {
                maxTries: -1,
                errorCodes: DEFAULT_RETRY_ERRORS
            };

            if (typeof Pollymer === 'undefined' || !Pollymer.Request) {
                console.error("Pollymer.Request library not found. RequestRetryService cannot function.");
                return null;
            }
            var activeRequest = new Pollymer.Request(requestOptions);
            const currentClientId = ++clientInstanceCounter;
            console.info(`RequestRetryService Instance ${currentClientId} initialized.`);

            return {
                performPost: function(targetUrl) {
                    return this.executeRequest('POST', targetUrl);
                },
                performGet: function(targetUrl) {
                    return this.executeRequest('GET', targetUrl);
                },
                performDelete: function(targetUrl) {
                    return this.executeRequest('DELETE', targetUrl);
                },
                executeRequest: function(httpMethod, resourceUrl) {
                    console.log(`Client ${currentClientId} > Executing ${httpMethod} request to ${resourceUrl}`);
                    var requestDeferred = $q.defer();

                    activeRequest.on('error', function(failureReason) {
                        console.warn(`Client ${currentClientId} < Request failed:`, failureReason);
                        requestDeferred.reject({
                            statusCode: -1,
                            details: failureReason
                        });
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply();
                        }
                    });

                    activeRequest.on('finished', function(responseCode, responsePayload, responseHeaders) {
                        console.log(`Client ${currentClientId} < Request completed with status ${responseCode}`);
                        if (responseCode >= 200 && responseCode < 300) {
                            requestDeferred.resolve({
                                statusCode: responseCode,
                                payload: responsePayload,
                                headers: responseHeaders
                            });
                        } else {
                            requestDeferred.reject({
                                statusCode: responseCode,
                                payload: responsePayload,
                                headers: responseHeaders
                            });
                        }
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply();
                        }
                    });

                    activeRequest.start(httpMethod, resourceUrl);

                    requestDeferred.promise.finally(function() {
                        activeRequest.off('error');
                        activeRequest.off('finished');
                        console.debug(`Client ${currentClientId} - Listeners removed.`);
                    });

                    return requestDeferred.promise;
                },
                cancelOperation: function() {
                    if (activeRequest) {
                        activeRequest.abort();
                        console.info(`Client ${currentClientId} < Operation aborted.`);
                    } else {
                        console.warn(`Client ${currentClientId} - No active request to abort.`);
                    }
                }
            };
        }
    };
});

NotificationStreamApp.controller("DashboardController", function($scope, $window, RequestRetryService) {
    var vm = $scope;
    vm.currentStreamIdentifier = "";
    vm.isCreatingStream = false;
    vm.displayErrorMessage = false;

    var navigateToStreamView = function(streamId) {
        if (!streamId || typeof streamId !== 'string') {
            console.error("Invalid stream ID provided for navigation.");
            return;
        }
        $window.location.href = "/view/" + streamId;
    };

    vm.provisionNewStream = function() {
        vm.isCreatingStream = true;
        vm.displayErrorMessage = false;

        const creationUrl = SERVICE_BASE_URL + "create/";
        console.log("Attempting to create new stream at:", creationUrl);

        const httpClient = RequestRetryService.spawnClient();
        if (!httpClient) {
            vm.isCreatingStream = false;
            vm.displayErrorMessage = true;
            console.error("Failed to spawn HTTP client for stream creation.");
            return;
        }

        const creationPromise = httpClient.performPost(creationUrl);

        creationPromise.then(function(response) {
            vm.isCreatingStream = false;
            if (response && response.payload && response.payload.id) {
                navigateToStreamView(response.payload.id);
            } else {
                vm.displayErrorMessage = true;
                console.error("Stream creation successful, but response ID is missing:", response);
            }
        }).catch(function(errorDetails) {
            vm.isCreatingStream = false;
            vm.displayErrorMessage = true;
            console.error("Error during stream creation:", errorDetails);
        });
    };
});

NotificationStreamApp.controller("StreamLogViewController", function($scope, $window, $route, RequestRetryService) {
    var vm = $scope;
    const streamIdentifier = $window.serverData ? $window.serverData.webhookId : null;

    vm.logFeed = {
        updatesCursor: null,
        historyCursor: null,
        latestEntryId: null,
        allEntries: [],
        pendingUpdates: [],
        isLiveUpdating: true,
        isFetchingData: false,
        isPollingForUpdates: false,
        hasError: false
    };

    vm.feedAccessUrl = "";
    vm.displayTransitionStyle = "static";

    if (!streamIdentifier) {
        vm.logFeed.hasError = true;
        console.error("Stream identifier not found in serverData. Cannot display log feed.");
        return;
    }

    const streamApiPath = `${SERVICE_BASE_URL}i/${streamIdentifier}/`;

    vm.triggerUrlCopy = function() {
        console.log('Clipboard copy initiated.');
        copyClipboardUtil();
    };

    vm.initiateStreamDeletion = function(event) {
        if (event && event.defaultPrevented === true) {
            console.log("Stream deletion prevented by default action.");
            return;
        }
        if (!confirm("Are you sure you want to delete this event stream? This action cannot be undone.")) {
            console.log("Stream deletion cancelled by user.");
            return;
        }
        const deletionApiUrl = streamApiPath;
        performStreamDeletion(deletionApiUrl);
    };

    vm.revealPayloadContent = function() {
        vm.show_inbox_text = true;
    };

    vm.concealPayloadContent = function() {
        vm.show_inbox_text = false;
    };

    vm.determineAnimationClass = function() {
        return "animate-" + vm.displayTransitionStyle;
    };

    var transformRawEntry = function(rawItem) {
        if (rawItem && rawItem.created) {
            rawItem.dateTime = Date.parse(rawItem.created);
        } else {
            console.warn("Raw item missing 'created' field:", rawItem);
        }
        return rawItem;
    };

    var retrieveHistoricalEntries = function(fetchUrl) {
        vm.logFeed.isFetchingData = true;
        const historyClient = RequestRetryService.spawnClient();
        if (!historyClient) {
            vm.logFeed.isFetchingData = false;
            vm.logFeed.hasError = true;
            console.error("Failed to spawn HTTP client for historical fetch.");
            return $q.reject({
                statusCode: 0,
                details: "Client initialization failed."
            });
        }

        const fetchPromise = historyClient.performGet(fetchUrl);

        fetchPromise.finally(function() {
            vm.logFeed.isFetchingData = false;
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        });

        fetchPromise.then(function(response) {
            const fetchedItems = response.payload.items;
            if ("last_cursor" in response.payload) {
                vm.logFeed.historyCursor = response.payload.last_cursor;
            } else {
                vm.logFeed.historyCursor = -1;
            }

            if (Array.isArray(fetchedItems)) {
                for (let i = 0; i < fetchedItems.length; i++) {
                    const entry = transformRawEntry(fetchedItems[i]);
                    vm.displayTransitionStyle = "static";
                    parseEntryBodyAsJson(entry);
                    vm.logFeed.allEntries.push(entry);
                }
            } else {
                console.warn("Historical fetch response items is not an array:", response.payload);
            }
        }).catch(function(error) {
            vm.logFeed.hasError = true;
            console.error("Error fetching historical entries:", error);
        });
        return fetchPromise;
    };

    vm.toggleLiveUpdateMode = function() {
        if (!vm.logFeed.isLiveUpdating) {
            vm.integrateBatchEntries();
        }
        vm.logFeed.isLiveUpdating = !vm.logFeed.isLiveUpdating;
        console.log(`Live update mode set to: ${vm.logFeed.isLiveUpdating}`);
    };

    vm.processLiveQueueEntry = function() {
        if (vm.logFeed.pendingUpdates.length > 0) {
            vm.displayTransitionStyle = "live";
            const entryToDisplay = vm.logFeed.pendingUpdates.pop();
            if (entryToDisplay) {
                parseEntryBodyAsJson(entryToDisplay);
                vm.logFeed.allEntries.unshift(entryToDisplay);
            }
        }
    };

    vm.integrateBatchEntries = function() {
        if (vm.logFeed.pendingUpdates.length > 0) {
            vm.displayTransitionStyle = "batch";
            vm.logFeed.allEntries = vm.logFeed.pendingUpdates.concat(vm.logFeed.allEntries);
            vm.logFeed.pendingUpdates = [];
            console.log(`Integrated ${vm.logFeed.pendingUpdates.length} pending entries.`);
        }
    };

    let activeLongPollingClient = null;

    var startContinuousPolling = function(startId = null) {
        let pollingUrl = `${streamApiPath}items/?order=created`;

        if (startId) {
            pollingUrl += `&since=id:${startId}`;
        } else if (vm.logFeed.updatesCursor) {
            pollingUrl += `&since=cursor:${vm.logFeed.updatesCursor}`;
        } else if (vm.logFeed.latestEntryId) {
            pollingUrl += `&since=id:${vm.logFeed.latestEntryId}`;
        }

        vm.logFeed.isPollingForUpdates = true;
        activeLongPollingClient = activeLongPollingClient || RequestRetryService.spawnClient();

        if (!activeLongPollingClient) {
            vm.logFeed.isPollingForUpdates = false;
            console.error("Failed to spawn HTTP client for long polling.");
            return;
        }

        const longPollPromise = activeLongPollingClient.performGet(pollingUrl);

        longPollPromise.finally(function() {
            vm.logFeed.isPollingForUpdates = false;
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        });

        longPollPromise.then(function(response) {
            if (!response || !response.payload || Object.keys(response.payload).length === 0) {
                console.debug("Long poll returned empty payload. Retrying.");
                return;
            }

            vm.logFeed.updatesCursor = response.payload.last_cursor || vm.logFeed.updatesCursor;
            const newItems = response.payload.items;

            if (Array.isArray(newItems) && newItems.length > 0) {
                for (let i = 0; i < newItems.length; i++) {
                    const entry = transformRawEntry(newItems[i]);
                    vm.logFeed.pendingUpdates.unshift(entry);
                    if (!vm.logFeed.latestEntryId || entry.id > vm.logFeed.latestEntryId) {
                        vm.logFeed.latestEntryId = entry.id;
                    }
                }
                console.log(`Received ${newItems.length} new entries via long polling.`);
            }
        }).catch(function(error) {
            console.error("Long polling error:", error);
            vm.logFeed.hasError = true;
        }).finally(function() {
            startContinuousPolling();
        });
    };

    var haltContinuousPolling = function() {
        if (activeLongPollingClient) {
            activeLongPollingClient.cancelOperation();
            activeLongPollingClient = null;
            console.log("Continuous polling operation halted.");
        }
    };

    var bootstrapStreamView = function() {
        const initialFetchUrl = `${streamApiPath}items/?order=-created&max=${ITEM_LIMIT_PER_FETCH}`;

        const initialLoadPromise = retrieveHistoricalEntries(initialFetchUrl);

        initialLoadPromise.then(function(response) {
            let protocolPrefix = "";
            if (SERVICE_BASE_URL.startsWith("//")) {
                protocolPrefix = $window.location.protocol;
            }

            vm.feedAccessUrl = `${protocolPrefix}${streamApiPath}`;

            let newestIdFromInitialLoad = null;
            if (response && response.payload && Array.isArray(response.payload.items) && response.payload.items.length > 0) {
                newestIdFromInitialLoad = response.payload.items[0].id;
                vm.logFeed.latestEntryId = newestIdFromInitialLoad;
            }
            startContinuousPolling(newestIdFromInitialLoad);
        }).catch(function(error) {
            console.error("Initial stream view bootstrap failed:", error);
            vm.logFeed.hasError = true;
        });
    };

    vm.getStreamIngestUrl = function() {
        if (vm.feedAccessUrl.length === 0) {
            return "Loading...";
        }
        return vm.feedAccessUrl + "in/";
    };

    vm.fetchMoreHistory = function() {
        if (vm.logFeed.historyCursor !== null && vm.logFeed.historyCursor !== -1 && !vm.logFeed.isFetchingData) {
            const moreHistoryUrl = `${streamApiPath}items/?order=-created&max=${ITEM_LIMIT_PER_FETCH}&since=cursor:${vm.logFeed.historyCursor}`;
            console.log("Fetching more history from:", moreHistoryUrl);
            retrieveHistoricalEntries(moreHistoryUrl);
        } else if (vm.logFeed.historyCursor === -1) {
            console.log("No more historical entries available.");
        }
    };

    vm.copyIngestUrlToClipboard = function() {
        console.log("Attempting to copy ingest URL via UI action.");
        vm.triggerUrlCopy();
    };

    vm.isValidJsonString = function(inputString) {
        if (typeof inputString !== 'string' || inputString.trim() === '') {
            return false;
        }
        try {
            JSON.parse(inputString);
        } catch (e) {
            return false;
        }
        return true;
    };

    const autoDeleteIntervalMs = 1000 * 60 * 60 * 24 * 30;
    const autoDeleteTimer = $window.setTimeout(function() {
        console.warn("Auto-deletion timer triggered. Initiating stream deletion.");
        const deleteUrl = streamApiPath;
        performStreamDeletion(deleteUrl, true);
    }, autoDeleteIntervalMs);
    console.log(`Auto-deletion scheduled for stream ${streamIdentifier} in ${autoDeleteIntervalMs / (1000 * 60 * 60 * 24)} days.`);


    function performStreamDeletion(url, isAutomated = false) {
        const deleteClient = RequestRetryService.spawnClient();
        if (!deleteClient) {
            console.error("Failed to spawn HTTP client for stream deletion.");
            vm.logFeed.hasError = true;
            return;
        }

        deleteClient.performDelete(url).then(function() {
            console.log(`Stream ${streamIdentifier} successfully deleted${isAutomated ? ' (automated)' : ''}. Redirecting.`);
            $window.location = '/';
        }).catch(function(error) {
            console.error(`Failed to delete stream ${streamIdentifier}${isAutomated ? ' (automated)' : ''}:`, error);
            vm.logFeed.hasError = true;
        });
    }

    function parseEntryBodyAsJson(entry) {
        if (entry && typeof entry.body === 'string') {
            if (vm.isValidJsonString(entry.body)) {
                try {
                    entry.body = JSON.parse(entry.body);
                } catch (e) {
                    console.warn("Failed to parse JSON body for entry (should have been caught by isValidJsonString):", e, entry.body);
                }
            }
        }
    }

    function copyClipboardUtil() {
        const textToCopy = vm.getStreamIngestUrl();
        if (!textToCopy || textToCopy === "Loading...") {
            console.warn("Cannot copy: Ingest URL is not yet available.");
            return;
        }

        if (typeof ZeroClipboard === 'undefined') {
            console.error("ZeroClipboard library not found. Manual copy required.");
            alert("Please manually copy the URL: " + textToCopy);
            return;
        }

        const clipButton = document.getElementById('clip_button');
        if (!clipButton) {
            console.error("Clipboard button element with ID 'clip_button' not found.");
            alert("Please manually copy the URL: " + textToCopy);
            return;
        }

        var client = new ZeroClipboard(clipButton, {
            moviePath: "/static/scripts/ZeroClipboard.swf"
        });

        client.on('ready', function(event) {
            console.log('ZeroClipboard ready. Attaching copy handler.');
            client.on('copy', function(event) {
                const clipboardData = event.clipboardData;
                clipboardData.setData("text/plain", textToCopy);
                vm.copySuccessMessage = "URL copied to clipboard!";
                $window.setTimeout(() => {
                    vm.copySuccessMessage = "";
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                }, 3000);
                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
            });
        });

        client.on('error', function(event) {
            console.error('ZeroClipboard error:', event.message);
            alert("Failed to copy URL automatically. Please copy manually: " + textToCopy);
            ZeroClipboard.destroy();
        });
    }

    var uiUpdateScheduler = function() {
        if (vm.logFeed.isLiveUpdating && vm.logFeed.pendingUpdates.length > 0) {
            vm.processLiveQueueEntry();
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        }
        $window.setTimeout(function() {
            uiUpdateScheduler();
        }, 150);
    };

    uiUpdateScheduler();

    bootstrapStreamView();

    vm.$on('$destroy', function() {
        console.log("StreamLogViewController scope destroyed. Halting continuous polling.");
        haltContinuousPolling();
        $window.clearTimeout(autoDeleteTimer);
    });
});