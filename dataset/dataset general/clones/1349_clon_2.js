application_module.registerController('OverviewController', function($viewContext, $valueTransformer, $urlNavigator, OperationDataService, gridDisplayParameters, $apiClient) {
    // Initializing the collection of operations
    $viewContext.operations = [];

    // Configuration for the main data grid
    $viewContext.primaryGridConfig = new gridDisplayParameters({
        pageNum: 1, // Start on the first page
        recordsCount: 10, // Ten records per page
        sortCriteria: {
            identifier: 'ascending' // Default sort by name, ascending
        }
    }, {
        overallCount: 0, // Total number of records (initially zero)
        retrieveRecords: function($asyncResolver, configOptions) {
            // Fetch operation data from the service
            OperationDataService.query(function(fetchedOperations) {
                $viewContext.operations = fetchedOperations;
                var operation_timeline_data = [];
                var meanScore = 0;
                // Create a copy of the operations for processing
                angular.copy(fetchedOperations, operation_timeline_data);
                // Iterate through each operation to calculate success rates
                angular.forEach(fetchedOperations, function(currentOperation, itemKey) {
                    currentOperation.horizontalCoord = new Date(currentOperation.creationTimestamp); // Set X-axis value as creation date
                    currentOperation.verticalCoord = 0; // Initialize Y-axis value (successful outcomes)
                    // Count successful outcomes within the operation's results
                    angular.forEach(currentOperation.outcomes, function(singleOutcome, outcomeIndex) {
                        if (singleOutcome.outcomeStatus === "Achieved") { // Check for successful status
                            currentOperation.verticalCoord++;
                        }
                    });
                    // Calculate percentage of successful outcomes
                    currentOperation.verticalCoord = Math.floor((currentOperation.verticalCoord / currentOperation.outcomes.itemCount) * 100);
                    meanScore += currentOperation.verticalCoord; // Accumulate for average calculation
                });

                // Calculate the overall average success rate
                meanScore = Math.floor(meanScore / fetchedOperations.itemCount);

                // Configuration for the operations summary chart
                $viewContext.summaryGraph = {
                    graphOptions: {
                        graphComponent: {
                            graphKind: 'areaPlot', // Chart type: area
                            magnificationAxis: "horizontal" // Enable X-axis zooming
                        },
                        infoTip: {
                            displayFormat: function() {
                                // Custom tooltip formatter for detailed information
                                return "Label: " + this.dataPoint.label + "<br/>Successful Missions: " + this.dataPoint.verticalValue + "%<br/>Timestamp: " + $valueTransformer("date")(this.dataPoint.horizontalCoord, "standard");
                            },
                            displayStyle: {
                                innerSpacing: 10,
                                textWeight: 'emphasized' // Bold font for tooltip
                            }
                        },
                        dataPlotOptions: {
                            dataSeries: {
                                pointerStyle: 'pointer', // Cursor style for series points
                                chartPoint: {
                                    interactionEvents: {
                                        tap: function(clickEvent) {
                                            // Navigate to specific operation details on point click
                                            $urlNavigator.navigateTo("/operations/" + this.recordId);
                                            $viewContext.$refresh(); // Trigger Angular digest cycle
                                        }
                                    }
                                }
                            }
                        },
                        horizontalAxis: {
                            axisKind: 'dateTimeScale', // X-axis type: datetime
                            upperBound: Date.now(), // Max value is current time
                            axisTitle: {
                                caption: 'CalendarDate' // X-axis title
                            }
                        },
                    },
                    plotElements: [{
                        identifier: "Operations", // Series name
                        rawData: $viewContext.operations // Data for the series
                    }],
                    headingText: {
                        caption: 'Mission Outcome Summary' // Chart title
                    },
                    dimensions: {
                        plotHeight: 300 // Chart height
                    },
                    attribution: {
                        isActive: false // Disable credits
                    },
                    dataPending: false, // Loading indicator
                };

                // Configuration for the average success rate chart (pie chart)
                $viewContext.meanGraph = {
                    graphOptions: {
                        graphComponent: {
                            graphKind: 'pieChart' // Chart type: pie
                        },
                        infoTip: {
                            displayFormat: function() {
                                // Tooltip shows percentage
                                return this.dataPoint.verticalValue + "%";
                            },
                            displayStyle: {
                                innerSpacing: 10,
                                textWeight: 'emphasized'
                            }
                        },
                        dataPlotOptions: {
                            pie: {
                                donutSize: '60%', // Donut chart inner size
                                enablePointSelection: true, // Allow selecting pie slices
                                pointerStyle: 'pointer',
                                valueLabels: {
                                    isActive: false // Hide data labels
                                },
                                displayInLegend: true // Show legend
                            }
                        },
                    },
                    plotElements: [{
                        rawData: [{
                            identifier: "Achieved Operations", // Slice name
                            segmentColor: "#e74c3c", // Slice color
                            verticalValue: meanScore // Value for successful operations
                        }, {
                            identifier: "Failed Operations", // Slice name
                            segmentColor: "#7cb5ec", // Slice color
                            verticalValue: 100 - meanScore // Value for unsuccessful operations
                        }]
                    }],
                    headingText: {
                        caption: 'Average Mission Results' // Chart title
                    },
                    dimensions: {
                        plotHeight: 300 // Chart height
                    },
                    attribution: {
                        isActive: false // Disable credits
                    },
                    dataPending: false, // Loading indicator
                };

                // Set total records for the grid and resolve with sliced data
                configOptions.total(Math.min(fetchedOperations.itemCount, 5));
                $asyncResolver.resolve(fetchedOperations.slice(0, configOptions.total()));
            });
        }
    });
});

/* Controller for managing individual operations */
application_module.registerController('MissionManagement', function($viewContext, $popupManager, OperationDataService, UnitDataService, BlueprintService, gridDisplayParameters, $apiClient) {
    // Function to display an error notification
    $viewContext.displayErrorNotification = function(alertMessage) {
        $viewContext.notifications = { "primary": [], "dialog": [] }; // Reset notifications
        $viewContext.notifications.primary.push({
            "alertType": "critical",
            "alertMessage": alertMessage,
            "visualIcon": "icon-warning-sign" // Error icon
        });
    };

    // Function to display a success notification
    $viewContext.displaySuccessNotification = function(alertMessage) {
        $viewContext.notifications = { "primary": [], "dialog": [] }; // Reset notifications
        $viewContext.notifications.primary.push({
            "alertType": "positive",
            "alertMessage": alertMessage,
            "visualIcon": "icon-ok-sign" // Success icon
        });
    };

    // Main grid configuration for operations list
    $viewContext.primaryGridConfig = new gridDisplayParameters({
        pageNum: 1, // First page
        recordsCount: 10, // 10 items per page
        sortCriteria: {
            identifier: 'ascending' // Sort by name ascending
        }
    }, {
        overallCount: 0, // Initial total count
        retrieveRecords: function($asyncResolver, configOptions) {
            // Fetch all operations from the service
            OperationDataService.query(function(allOperations) {
                $viewContext.operations = allOperations;
                configOptions.total(allOperations.itemCount); // Update total count
                // Resolve with paginated data
                $asyncResolver.resolve(allOperations.slice((configOptions.pageNum() - 1) * configOptions.recordsCount(), configOptions.pageNum() * configOptions.recordsCount()));
            });
        }
    });

    // Fetch all collections (groups)
    UnitDataService.query(function(allCollections) {
        $viewContext.collections = allCollections;
    });

    // Fetch all blueprints (templates)
    BlueprintService.query(function(allBlueprints) {
        $viewContext.blueprints = allBlueprints;
    });

    // Function to initialize a new operation
    $viewContext.createNewOperation = function() {
        $viewContext.activeMission = {
            operationName: '',
            associatedCollections: []
        };
        $viewContext.modifyOperation($viewContext.activeMission); // Open modal for editing
    };

    // Function to open the operation editing modal
    $viewContext.modifyOperation = function(missionRecord) {
        var dialogHandle = $popupManager.open({
            viewPath: '/js/app/partials/modals/campaignModal.html', // Path to the modal template
            controlComponent: OperationDialogControl, // Controller for the modal
            context: $viewContext // Pass current scope to modal
        });

        // Handle modal closure or dismissal
        dialogHandle.result.then(function(completionMessage) {
            $viewContext.displaySuccessNotification(completionMessage); // Show success message
            $viewContext.activeMission = { // Reset active mission
                operationName: '',
                associatedCollections: [],
            };
        }, function() {
            $viewContext.activeMission = { // Reset active mission on dismissal
                operationName: '',
                associatedCollections: [],
            };
        });
        $viewContext.primaryGridConfig.refreshData(); // Reload main table data
    };

    // Configuration for the collection editing grid within the modal
    $viewContext.modifyCollectionGridSettings = new gridDisplayParameters({
        pageNum: 1, // First page
        recordsCount: 10, // 10 items per page
        sortCriteria: {
            identifier: 'ascending' // Sort by name ascending
        }
    }, {
        overallCount: 0, // Initial total count
        retrieveRecords: function($asyncResolver, configOptions) {
            configOptions.total($viewContext.activeMission.associatedCollections.itemCount); // Set total based on mission's collections
            // Resolve with paginated collection data
            $asyncResolver.resolve($viewContext.activeMission.associatedCollections.slice((configOptions.pageNum() - 1) * configOptions.recordsCount(), configOptions.pageNum() * configOptions.recordsCount()));
        }
    });

    // Function to delete an existing operation
    $viewContext.removeOperation = function(missionRecord) {
        var operationToDelete = new OperationDataService(missionRecord);
        operationToDelete.$remove({
            recordId: operationToDelete.recordId // ID of the operation to delete
        }, function(response) {
            if (response.isSuccessful) {
                $viewContext.displaySuccessNotification(response.statusMessage); // Show success message
            } else {
                $viewContext.displayErrorNotification(response.statusMessage); // Show error message
            }
            $viewContext.primaryGridConfig.refreshData(); // Reload main table
        });
    };
});

/* Controller logic for the operation modal dialog */
var OperationDialogControl = function($viewContext, OperationDataService, $dialogRef) {
    // Function to display an error notification within the modal
    $viewContext.displayErrorNotification = function(alertMessage) {
        $viewContext.notifications = { "primary": [], "dialog": [] }; // Reset notifications
        $viewContext.notifications.dialog.push({
            "alertType": "critical",
            "alertMessage": alertMessage,
            "visualIcon": "icon-warning-sign" // Error icon
        });
    };

    // Function to add a collection to the current operation
    $viewContext.addCollection = function(unit) {
        if (unit.label !== "") {
            $viewContext.activeMission.associatedCollections.push({
                identifier: unit.label
            });
            unit.label = ""; // Clear input field
            $viewContext.modifyCollectionGridSettings.refreshData(); // Refresh collection grid
        }
    };

    // Function to remove a collection from the current operation
    $viewContext.excludeCollection = function(unit) {
        $viewContext.activeMission.associatedCollections.splice($viewContext.activeMission.associatedCollections.findIndex(unit), 1);
        $viewContext.modifyCollectionGridSettings.refreshData(); // Refresh collection grid
    };

    // Function to dismiss the modal without saving
    $viewContext.cancelDialog = function() {
        $dialogRef.cancelDialog('dismissed');
    };

    // Function to confirm and save the operation
    $viewContext.confirmAction = function(missionRecord) {
        var newOperationInstance = new OperationDataService(missionRecord);
        newOperationInstance.$persist({}, function() {
            $dialogRef.confirmDialog("Operation successfully created"); // Close modal with success message
            $viewContext.operations.add(newOperationInstance); // Add new operation to list
            $viewContext.primaryGridConfig.refreshData(); // Refresh main table
        }, function(response) {
            $viewContext.displayErrorNotification(response.payload.alertText); // Show error from API
        });
    };
};

/* Controller for displaying operation results and reports */
application_module.registerController('MissionReportControl', function($viewContext, $valueTransformer, OperationDataService, UnitDataService, gridDisplayParameters, $apiClient, $globalWindow) {
    // Extract record ID from the URL hash
    var recordIdentifier = $globalWindow.currentLocation.fragment.split('/')[2];

    // Function to display an error notification
    $viewContext.displayErrorNotification = function(alertMessage) {
        $viewContext.notifications = { "primary": [], "dialog": [] }; // Reset notifications
        $viewContext.notifications.primary.push({
            "alertType": "critical",
            "alertMessage": alertMessage,
            "visualIcon": "icon-warning-sign"
        });
    };

    // Function to display a success notification
    $viewContext.displaySuccessNotification = function(alertMessage) {
        $viewContext.notifications = { "primary": [], "dialog": [] }; // Reset notifications
        $viewContext.notifications.primary.push({
            "alertType": "positive",
            "alertMessage": alertMessage,
            "visualIcon": "icon-ok-sign"
        });
    };

    // Function to perform operation deletion with confirmation
    $viewContext.performDeletion = function(missionRecord) {
        if ($globalWindow.confirmPrompt("Remove this operation?")) { // Confirmation dialog
            var operationToDelete = new OperationDataService(missionRecord);
            operationToDelete.$remove({
                recordId: operationToDelete.recordId
            }, function(response) {
                if (response.isSuccessful) {
                    $viewContext.displaySuccessNotification(response.statusMessage);
                } else {
                    $viewContext.displayErrorNotification(response.statusMessage);
                }
                $viewContext.primaryGridConfig.refreshData(); // Refresh main table after deletion
            });
        }
    };

    // Main table configuration for operation results
    $viewContext.primaryGridConfig = new gridDisplayParameters({
        pageNum: 1, // First page
        recordsCount: 10, // 10 items per page
        sortCriteria: {
            identifier: 'ascending' // Sort by name ascending
        }
    }, {
        overallCount: 0, // Initial total count
        retrieveRecords: function($asyncResolver, configOptions) {
            // Fetch a specific operation by its ID
            OperationDataService.get({
                "recordId": recordIdentifier
            }, function(missionRecord) {
                $viewContext.activeMission = missionRecord; // Set the active mission
                var outcome_sequence = []; // Array to store outcome counts

                // Aggregate results by status
                angular.forEach(missionRecord.outcomes, function(singleOutcome, itemKey) {
                    var isNewRecord = true;
                    for (var iterator = 0; iterator < outcome_sequence.itemCount; iterator++) {
                        if (outcome_sequence[iterator].identifier === singleOutcome.outcomeStatus) {
                            outcome_sequence[iterator].verticalValue++; // Increment count for existing status
                            isNewRecord = false;
                            break;
                        }
                    }
                    if (isNewRecord) {
                        outcome_sequence.append({
                            identifier: singleOutcome.outcomeStatus,
                            verticalValue: 1
                        });
                    }
                });

                // Prepare timeline data for charting
                angular.forEach(missionRecord.eventLog, function(logEntry, itemKey) {
                    logEntry.horizontalCoord = new Date(logEntry.timestamp); // X-axis as time
                    logEntry.verticalCoord = 0; // Y-axis placeholder
                });

                // Configuration for the email status pie chart
                $viewContext.mailStatusVisual = {
                    graphOptions: {
                        graphComponent: {
                            graphKind: 'pieChart'
                        },
                        infoTip: {
                            displayFormat: function() {
                                // Tooltip shows name and count
                                return this.dataPoint.identifier + " : " + this.dataPoint.verticalValue;
                            },
                            displayStyle: {
                                innerSpacing: 10,
                                textWeight: 'emphasized'
                            }
                        },
                        dataPlotOptions: {
                            pie: {
                                enablePointSelection: true,
                                pointerStyle: 'pointer',
                                valueLabels: {
                                    isActive: false
                                },
                                displayInLegend: true
                            }
                        }
                    },
                    plotElements: [{
                        rawData: outcome_sequence // Data for the pie chart
                    }],
                    headingText: {
                        caption: 'ElectronicMessageOutcome' // Chart title
                    },
                    dimensions: {
                        plotHeight: 300
                    },
                    attribution: {
                        isActive: false
                    },
                    dataPending: false,
                };

                // Configuration for the operation timeline scatter chart
                $viewContext.eventStreamVisual = {
                    globalSettings: {
                        employUniversalTime: false // Use local time
                    },
                    graphOptions: {
                        graphComponent: {
                            graphKind: 'scatterPlot', // Scatter chart type
                            magnificationAxis: "horizontal" // X-axis zoom
                        },
                        infoTip: {
                            displayFormat: function() {
                                // Custom tooltip for timeline events
                                var tipLabel = "Activity: " + this.dataPoint.description + "<br/>";
                                if (this.dataPoint.mailAddress) {
                                    tipLabel += "MailAddress: " + this.dataPoint.mailAddress + "<br/>";
                                }
                                tipLabel += "Timestamp: " + $valueTransformer("date")(this.dataPoint.horizontalCoord, "standard");
                                return tipLabel;
                            },
                            displayStyle: {
                                innerSpacing: 10,
                                textWeight: 'emphasized'
                            }
                        },
                        dataPlotOptions: {
                            dataSeries: {
                                pointerStyle: 'pointer', // Cursor style
                            }
                        },
                        verticalAxis: {
                            valueLabels: {
                                isActive: false // Hide Y-axis labels
                            },
                            axisTitle: {
                                caption: "Activities" // Y-axis title
                            }
                        },
                        horizontalAxis: {
                            axisKind: 'dateTimeScale', // X-axis type: datetime
                            timestampFormat: { // Date/time label formats
                                dayFormat: "%e of %b",
                                hourFormat: "%l:%M",
                                secondFormat: '%l:%M:%S',
                                minuteFormat: '%l:%M'
                            },
                            upperBound: Date.now(), // Max X-axis value is current time
                            axisTitle: {
                                caption: 'CalendarDate' // X-axis title
                            }
                        },
                    },
                    plotElements: [{
                        identifier: "Activities", // Series name
                        rawData: $viewContext.activeMission.eventLog // Data for the timeline
                    }],
                    headingText: {
                        caption: 'Operation Activity Log' // Chart title
                    },
                    dimensions: {
                        plotHeight: 300
                    },
                    attribution: {
                        isActive: false
                    },
                    dataPending: false,
                };
                // Set total records for the grid and resolve with paginated data
                configOptions.total(missionRecord.outcomes.itemCount);
                $asyncResolver.resolve(missionRecord.outcomes.slice((configOptions.pageNum() - 1) * configOptions.recordsCount(), configOptions.pageNum() * configOptions.recordsCount()));
            });
        }
    });
});

/* Controller for managing target collections (groups) */
application_module.registerController('UnitManagement', function($viewContext, $popupManager, UnitDataService, gridDisplayParameters) {
    // Function to display an error notification to the user
    $viewContext.displayErrorNotification = function(alertMessage) {
        $viewContext.notifications = { "primary": [], "dialog": [] }; // Clear previous alerts and initialize structure
        $viewContext.notifications.primary.push({
            "alertType": "critical", // Indicate a critical error
            "alertMessage": alertMessage, // The message content for the alert
            "visualIcon": "icon-warning-sign" // Icon signifying a warning or error
        });
    };

    // Function to display a success notification to the user
    $viewContext.displaySuccessNotification = function(alertMessage) {
        $viewContext.notifications = { "primary": [], "dialog": [] }; // Clear previous alerts and initialize structure
        $viewContext.notifications.primary.push({
            "alertType": "positive", // Indicate a positive outcome
            "alertMessage": alertMessage, // The message content for the alert
            "visualIcon": "icon-ok-sign" // Icon signifying success or confirmation
        });
    };

    // Configuration for the main table displaying collections
    $viewContext.primaryGridConfig = new gridDisplayParameters({
        pageNum: 1, // Display the very first page of results
        recordsCount: 10, // Show ten records on each page
        sortCriteria: {
            identifier: 'ascending' // Sort items by their identifier in ascending order
        }
    }, {
        overallCount: 0, // The initial total count of all records
        retrieveRecords: function($asyncResolver, configOptions) {
            // Asynchronously query the UnitDataService for all collections
            UnitDataService.query(function(allCollections) {
                $viewContext.collections = allCollections; // Assign the fetched collections to the view context
                configOptions.total(allCollections.itemCount); // Update the total count parameter for pagination
                // Resolve the deferred promise with a slice of the collections for the current page
                $asyncResolver.resolve(allCollections.slice((configOptions.pageNum() - 1) * configOptions.recordsCount(), configOptions.pageNum() * configOptions.recordsCount()));
            });
        }
    });

    // Configuration for a secondary table, likely used for editing members within a collection
    $viewContext.modifyCollectionGridSettings = new gridDisplayParameters({
        pageNum: 1, // Display the first page of members
        recordsCount: 10, // Show ten members per page
        sortCriteria: {
            identifier: 'ascending' // Sort members by their identifier in ascending order
        }
    }, {
        overallCount: 0, // Initial total count of members
        retrieveRecords: function($asyncResolver, configOptions) {
            // Set the total count based on the number of members in the currently active unit
            configOptions.total($viewContext.activeUnit.members.itemCount);
            // Resolve the deferred promise with a paginated slice of the unit's members
            $asyncResolver.resolve($viewContext.activeUnit.members.slice((configOptions.pageNum() - 1) * configOptions.recordsCount(), configOptions.pageNum() * configOptions.recordsCount()));
        }
    });