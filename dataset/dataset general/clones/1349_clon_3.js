app.controller('AnalyticsViewHandler', function(viewModel, dataFormatter, appNavigator, OutreachCampaignService, gridManager, networkAgent) {
    // This controller manages the dashboard analytics view, displaying an overview of campaigns.
    // It fetches campaign data, processes it for charting, and configures data tables.

    // Holds the collection of active outreach initiatives for tabular display.
    viewModel.activeInitiatives = [];

    // Defines the configuration for the primary data grid that summarizes campaign information.
    viewModel.summaryGridConfig = new gridManager({
        currentPageIdx: 1, // Specifies the initial page number for the grid.
        itemsPerPage: 10,  // Determines the number of entries shown per page.
        sortCriteria: {
            initiativeName: 'ascending' // Sets the default sorting order by campaign name.
        }
    }, {
        totalRecords: 0, // Placeholder for the total count of data items before fetching.
        retrieveData: function(deferredPromise, tableSettings) {
            // This function is invoked by the grid manager to fetch and populate data.
            OutreachCampaignService.retrieveAll(function(allInitiatives) {
                // Perform a guard check for valid data retrieval.
                if (!allInitiatives || !Array.isArray(allInitiatives) || allInitiatives.length === 0) {
                    console.warn('Dashboard: No outreach initiatives were found or data is invalid.');
                    viewModel.activeInitiatives = []; // Ensure the array is empty.
                    tableSettings.setTotalRecords(0);
                    deferredPromise.resolve([]); // Resolve with an empty array if no data.
                    return; // Exit early.
                }

                viewModel.activeInitiatives = allInitiatives; // Update the view model's initiative list.

                let cumulativeSuccessPercentage = 0; // Accumulator for calculating the overall average success rate.
                const MIN_SUCCESS_PERCENTAGE = 0; // Minimum possible success rate.
                const MAX_SUCCESS_PERCENTAGE = 100; // Maximum possible success rate.

                // Iterate through each initiative to prepare data for chart visualization.
                allInitiatives.forEach(function(initiativeEntry) {
                    // Convert the creation timestamp string into a Date object for chart plotting on the X-axis.
                    initiativeEntry.x = new Date(initiativeEntry.creationTimestamp);
                    let successfulAttempts = 0;

                    // Calculate the success rate for the current initiative.
                    if (Array.isArray(initiativeEntry.outcomes) && initiativeEntry.outcomes.length > 0) {
                        successfulAttempts = initiativeEntry.outcomes.filter(outcome => outcome.status === "Success").length;
                        // Compute success percentage, rounding to the nearest whole number.
                        initiativeEntry.y = Math.round((successfulAttempts / initiativeEntry.outcomes.length) * MAX_SUCCESS_PERCENTAGE);
                    } else {
                        initiativeEntry.y = MIN_SUCCESS_PERCENTAGE; // Default to 0% if no results are available.
                    }
                    cumulativeSuccessPercentage += initiativeEntry.y; // Add to the running total for the average calculation.

                    // Assign the initiative's name to a 'name' property, which is often used by charting libraries for tooltips.
                    initiativeEntry.name = initiativeEntry.initiativeName;
                });

                // Calculate the overall average success rate across all initiatives.
                const averageRate = allInitiatives.length > 0 ? Math.round(cumulativeSuccessPercentage / allInitiatives.length) : MIN_SUCCESS_PERCENTAGE;

                // Configure the overview chart, which displays individual campaign success rates over time.
                viewModel.performanceGraphConfig = Object.freeze({ // Using Object.freeze to make the configuration immutable.
                    chartOptions: {
                        chart: {
                            type: 'area', // Sets the chart type to an area chart.
                            zoomType: "x"  // Enables zooming functionality specifically on the x-axis.
                        },
                        tooltips: { // Custom tooltip configuration.
                            formatter: function() {
                                // Provides dynamic tooltip content using modern template literals for readability.
                                return `<strong>${this.point.name}</strong><br/>
                                        Success Rate: ${this.point.y}%<br/>
                                        Initiation Date: ${dataFormatter("date")(this.point.x, "medium")}`;
                            },
                            style: {
                                padding: 12, // Increased padding for better visual spacing.
                                fontWeight: 'bolder' // Uses a bolder font weight for emphasis.
                            }
                        },
                        plotConfiguration: { // Defines specific plot options for the series.
                            series: {
                                cursor: 'pointer', // Changes the cursor to indicate clickable points.
                                point: {
                                    events: {
                                        click: function(eventDetails) {
                                            // Navigates the application to the detailed view of the clicked campaign.
                                            appNavigator.navigateTo(`/campaigns/${this.id}`);
                                            // viewModel.$apply(); // Explicit scope apply, often not needed in modern Angular, but retained for functional parity.
                                        }
                                    }
                                }
                            }
                        },
                        xAxes: { // Configuration for the x-axis.
                            type: 'datetime', // Specifies that the x-axis represents date and time values.
                            max: Date.now(), // Sets the maximum value on the x-axis to the current timestamp.
                            axisTitle: { // Defines the title for the x-axis.
                                text: 'Deployment Date' // Label indicating what the x-axis represents.
                            }
                        },
                    },
                    dataSeries: [{ // Defines the data series to be plotted.
                        name: "Outreach Initiatives",
                        data: viewModel.activeInitiatives // Uses the processed initiative data.
                    }],
                    graphTitle: { // Sets the main title for the chart.
                        text: 'Phishing Success Overview Across Campaigns' // A more descriptive chart title.
                    },
                    displaySize: { // Specifies the dimensions of the chart.
                        height: 320 // Slightly increased chart height.
                    },
                    creditsEnabled: false, // Disables the display of chart credits.
                    isLoading: false, // Indicates that data loading is complete.
                });

                // Configure the pie chart to visualize the aggregate average success rates.
                viewModel.successDistributionGraph = Object.freeze({
                    chartOptions: {
                        chart: {
                            type: 'pie' // Sets the chart type to a pie chart.
                        },
                        tooltips: {
                            formatter: function() {
                                return `${this.point.y}%`; // Displays only the percentage in the tooltip.
                            },
                            style: {
                                padding: 12,
                                fontWeight: 'bolder'
                            }
                        },
                        plotConfiguration: {
                            pie: {
                                innerSize: '65%', // Creates a slightly larger inner hole in the pie chart.
                                allowPointSelection: true, // Enables selecting individual slices.
                                cursor: 'pointer', // Changes cursor to indicate interactivity.
                                dataLabels: {
                                    enabled: false // Disables direct data labels on the pie slices.
                                },
                                showInLegend: true // Ensures the legend is displayed for pie slices.
                            }
                        },
                    },
                    dataSeries: [{
                        data: [{
                            name: "Successful Phishing Attempts",
                            color: "#e74c3c", // Red color for success (note: original code's color choice).
                            y: averageRate
                        }, {
                            name: "Unsuccessful Phishing Attempts",
                            color: "#7cb5ec", // Blue color for unsuccessful attempts.
                            y: MAX_SUCCESS_PERCENTAGE - averageRate
                        }]
                    }],
                    graphTitle: {
                        text: 'Aggregate Phishing Campaign Performance' // A more descriptive title for the pie chart.
                    },
                    displaySize: {
                        height: 320
                    },
                    creditsEnabled: false,
                    isLoading: false,
                });

                // Update the table parameters with the total count of records and resolve the deferred promise.
                // For the dashboard overview, we often limit the number of displayed items.
                const dashboardDisplayLimit = 5;
                tableSettings.setTotalRecords(Math.min(allInitiatives.length, dashboardDisplayLimit));
                deferredPromise.resolve(allInitiatives.slice(0, tableSettings.total()));
            });
        }
    });
});

// A centralized NotificationManager utility, typically a service, but implemented here as a constructor
// for demonstration of Type III changes (new fragments, rewritten code).
const NotificationManager = function(scopeReference) {
    // Defines the default structure for storing flash messages.
    const defaultFlashState = { main: [], modal: [] };

    /**
     * Resets all current alerts in the scope.
     * Uses a deep copy to ensure a fresh state.
     */
    this.resetAlerts = () => {
        scopeReference.notifications = JSON.parse(JSON.stringify(defaultFlashState));
    };

    /**
     * Displays an alert message in the main section of the view.
     * @param {string} type - The type of alert (e.g., "danger", "success").
     * @param {string} message - The message content for the alert.
     * @param {string} icon - The FontAwesome icon class to display.
     */
    this.showAlert = (type, message, icon) => {
        this.resetAlerts(); // Clears any existing alerts before adding a new one.
        scopeReference.notifications.main.push({
            type: type,
            message: message,
            icon: icon
        });
    };

    /**
     * Displays an alert message specifically within a modal context.
     * @param {string} type - The type of alert.
     * @param {string} message - The message content.
     * @param {string} icon - The FontAwesome icon class.
     */
    this.showModalAlert = (type, message, icon) => {
        this.resetAlerts();
        scopeReference.notifications.modal.push({
            type: type,
            message: message,
            icon: icon
        });
    };
};


app.controller('CampaignManagementController', function(model, dialogService, CampaignDataService, AudienceGroupService, EmailTemplateService, tableHandler, httpClient) {
    // This controller handles the CRUD operations and listing for campaign entities.

    // Initialize the NotificationManager for displaying alerts within this controller's scope.
    const notifier = new NotificationManager(model);
    model.notifications = { main: [], modal: [] }; // Ensure the notifications object exists on the scope.

    // Expose simplified alert functions to the view model.
    model.displayErrorMessage = (msg) => notifier.showAlert("danger", msg, "fa-exclamation-circle");
    model.displaySuccessMessage = (msg) => notifier.showAlert("success", msg, "fa-check-circle");

    // Constants for table pagination and sorting defaults.
    const DEFAULT_PAGE_SIZE = 10;
    const DEFAULT_SORT_FIELD = 'name';
    const DEFAULT_SORT_DIRECTION = 'asc';

    // Configuration for the primary data table that lists all campaigns.
    model.campaignOverviewTable = new tableHandler({
        page: 1,
        count: DEFAULT_PAGE_SIZE,
        sorting: {
            [DEFAULT_SORT_FIELD]: DEFAULT_SORT_DIRECTION // Uses computed property name for flexibility.
        }
    }, {
        total: 0,
        getData: function(defer, params) {
            CampaignDataService.query(function(campaignList) {
                // Basic validation for the fetched list.
                if (!campaignList || !Array.isArray(campaignList)) {
                    console.warn('CampaignManagementController: Fetched campaign list is invalid.');
                    model.allCampaigns = [];
                    params.total(0);
                    defer.resolve([]);
                    return;
                }
                model.allCampaigns = campaignList; // Store the complete list of campaigns.
                params.total(campaignList.length); // Update the total count for pagination.
                // Slice the array to get only the data for the current page.
                const pagedData = campaignList.slice((params.page() - 1) * params.count(), params.page() * params.count());
                defer.resolve(pagedData); // Resolve the promise with the paged data.
            });
        }
    });

    // Fetches all available audience groups from the service.
    AudienceGroupService.fetchGroups(function(groupsData) {
        model.availableGroups = groupsData || []; // Initialize as empty array if no data.
    });

    // Fetches all available email templates from the service.
    EmailTemplateService.getTemplates(function(templatesData) {
        model.availableTemplates = templatesData || []; // Initialize as empty array if no data.
    });

    /**
     * Prepares a new campaign object for creation and opens the editor modal.
     */
    model.initializeNewCampaign = function() {
        model.currentCampaign = {
            name: '',
            groups: [],
            templateId: null, // Adding a default template ID for new campaigns.
            isActive: true // Adding a new default property for active status.
        };
        model.openCampaignEditor(model.currentCampaign);
    };

    /**
     * Opens a modal dialog for editing an existing campaign or creating a new one.
     * @param {object} campaignToEdit - The campaign object to be edited or an empty object for new.
     */
    model.openCampaignEditor = function(campaignToEdit) {
        // Ensure `currentCampaign` is always a valid object before opening the modal.
        model.currentCampaign = campaignToEdit || { name: 'New Campaign', groups: [], isActive: true };

        const editorDialog = dialogService.open({
            templateUrl: '/js/app/partials/modals/campaign_editor_modal.html', // Renamed template path.
            controller: 'CampaignEditorDialogController', // Reference the modal controller by its registered name.
            scope: model, // Pass the current controller's scope to the modal controller.
            backdrop: 'static' // Prevents closing the modal by clicking outside it.
        });

        // Handle the result or dismissal of the modal dialog.
        editorDialog.result.then(function(dialogMessage) {
            model.displaySuccessMessage(dialogMessage); // Show success message from the modal.
            model.currentCampaign = { name: '', groups: [], isActive: true }; // Reset campaign object.
            model.campaignOverviewTable.reload(); // Refresh the main campaign list after changes.
        }, function(dismissReason) {
            console.log('Campaign editor dismissed, reason:', dismissReason);
            model.currentCampaign = { name: '', groups: [], isActive: true }; // Reset campaign object on dismissal.
            // No table reload needed if the dialog was simply dismissed without saving.
        });
    };

    // Table for managing groups associated with a specific campaign within the editor modal.
    model.campaignGroupConfigTable = new tableHandler({
        page: 1,
        count: DEFAULT_PAGE_SIZE,
        sorting: {
            [DEFAULT_SORT_FIELD]: DEFAULT_SORT_DIRECTION
        }
    }, {
        total: 0,
        getData: function(defer, params) {
            // Safely access campaign groups, providing an empty array if `currentCampaign` or `groups` is undefined.
            const groupsInCampaign = model.currentCampaign?.groups || [];
            params.total(groupsInCampaign.length);
            const pagedGroups = groupsInCampaign.slice((params.page() - 1) * params.count(), params.page() * params.count());
            defer.resolve(pagedGroups);
        }
    });

    /**
     * Handles the deletion of an existing campaign record.
     * @param {object} campaignItem - The campaign object to be deleted.
     */
    model.removeCampaignEntry = function(campaignItem) {
        // Introduce an explicit, more detailed confirmation step before deletion.
        const confirmationText = `Are you absolutely sure you want to permanently delete the campaign "${campaignItem.name}" (ID: ${campaignItem.id})? This action cannot be undone.`;
        if (!confirm(confirmationText)) {
            return; // Abort the deletion if the user cancels.
        }

        const campaignToDelete = new CampaignDataService(campaignItem);
        campaignToDelete.$removeRecord({ // Renamed service method for clarity.
            id: campaignToDelete.id
        }, function(response) {
            if (response?.success) { // Use optional chaining for safer access.
                model.displaySuccessMessage(response.message);
            } else {
                model.displayErrorMessage(response?.message || "Failed to delete campaign due to an unknown issue.");
            }
            model.campaignOverviewTable.reload(); // Refresh the main list after deletion.
        }, function(errorResponse) {
            console.error("Error deleting campaign:", errorResponse);
            model.displayErrorMessage(`Error during deletion: ${errorResponse.statusText || 'Network or server error'}`);
        });
    };
});

// This function serves as the controller for the campaign editor modal.
// It is defined globally and registered with the 'app' module by its string name.
app.controller('CampaignEditorDialogController', function(dialogModel, CampaignDataService, dialogInstance) {
    // Initialize notification manager for modal-specific alerts.
    const notifier = new NotificationManager(dialogModel);
    dialogModel.notifications = { main: [], modal: [] }; // Ensure notifications object exists.

    dialogModel.reportDialogError = (msg) => notifier.showModalAlert("danger", msg, "fa-exclamation-circle");

    // Ensure the campaign object and its groups array are properly initialized on the dialog model.
    dialogModel.currentCampaign = dialogModel.currentCampaign || { name: '', groups: [], isActive: true };
    dialogModel.currentCampaign.groups = dialogModel.currentCampaign.groups || [];

    /**
     * Adds a selected audience group to the current campaign's list of associated groups.
     * @param {object} targetGroup - The group object to add.
     */
    dialogModel.appendGroupToCampaign = function(targetGroup) {
        // Basic validation for the group name.
        if (!targetGroup || typeof targetGroup.name !== 'string' || targetGroup.name.trim() === "") {
            dialogModel.reportDialogError("Group name cannot be empty or invalid.");
            return;
        }

        // Check for duplicate groups to prevent adding the same group multiple times.
        const isDuplicate = dialogModel.currentCampaign.groups.some(g => g.name === targetGroup.name);
        if (isDuplicate) {
            dialogModel.reportDialogError(`Group '${targetGroup.name}' has already been added to this campaign.`);
            return;
        }

        dialogModel.currentCampaign.groups.push({
            name: targetGroup.name,
            id: targetGroup.id || Math.random().toString(36).substring(2, 9) // Assign a unique ID if not present.
        });
        targetGroup.name = ""; // Clear the input field after adding.
        dialogModel.campaignGroupConfigTable.reload(); // Refresh the groups table within the modal.
    };

    /**
     * Removes a specific group from the current campaign's list of associated groups.
     * @param {object} groupToRemove - The group object to remove.
     */
    dialogModel.detachGroupFromCampaign = function(groupToRemove) {
        // Find the index of the group using its unique ID for robustness.
        const index = dialogModel.currentCampaign.groups.findIndex(g => g.id === groupToRemove.id);
        if (index !== -1) {
            dialogModel.currentCampaign.groups.splice(index, 1); // Remove the group from the array.
            dialogModel.campaignGroupConfigTable.reload(); // Refresh the groups table.
        } else {
            console.warn("Attempted to remove a group that was not found in the campaign's list.");
        }
    };

    /**
     * Dismisses the modal dialog without saving any changes.
     */
    dialogModel.dismissDialog = function() {
        dialogInstance.dismiss('editor_cancelled_by_user'); // Provide a descriptive reason for dismissal.
    };

    /**
     * Saves the campaign data via the service and closes the modal.
     * @param {object} campaignPayload - The campaign data object to be saved.
     */
    dialogModel.confirmAndSaveCampaign = function(campaignPayload) {
        // Perform client-side validation before attempting to save.
        if (!campaignPayload.name || campaignPayload.name.trim() === '') {
            dialogModel.reportDialogError("Campaign name is a mandatory field.");
            return;
        }
        if (!Array.isArray(campaignPayload.groups) || campaignPayload.groups.length === 0) {
            dialogModel.reportDialogError("At least one audience group must be assigned to the campaign.");
            return;
        }

        const campaignToPersist = new CampaignDataService(campaignPayload);
        campaignToPersist.$persist({}, function(response) { // Renamed service method for persistence operations.
            dialogInstance.closeWithResult("Campaign successfully updated or added!"); // Custom close method with a result message.
            // Note: The parent controller is responsible for reloading its main table and resetting its campaign state.
        }, function(errorResponse) {
            // Display error message received from the server.
            console.error("Error saving campaign:", errorResponse);
            dialogModel.reportDialogError(errorResponse.data?.message || "An unexpected error occurred while attempting to save the campaign.");
        });
    };
});

app.controller('InitiativeOutcomeController', function(viewData, formatter, CampaignRetrievalService, AudienceGroupService, resultGridManager, dataFetcher, browserWindow) {
    // This controller displays detailed results and analytics for a specific campaign.

    // Initialize the NotificationManager for displaying alerts.
    const notifier = new NotificationManager(viewData);
    viewData.notifications = { main: [], modal: [] };

    viewData.displayErrorAlert = (msg) => notifier.showAlert("danger", msg, "fa-exclamation-circle");
    viewData.displaySuccessAlert = (msg) => notifier.showAlert("success", msg, "fa-check-circle");

    // Extract the campaign identifier from the URL hash.
    const urlHashParts = browserWindow.location.hash.split('/');
    const CAMPAIGN_ID_INDEX = 2;
    const campaignIdentifier = urlHashParts.at(CAMPAIGN_ID_INDEX); // Using .at() for modern JS, equivalent to [2].

    // Implement a guard clause: If the campaign ID is missing, display an error and halt execution.
    if (!campaignIdentifier) {
        viewData.displayErrorAlert("Campaign ID could not be determined from the URL. Cannot load results.");
        console.error("Missing campaign ID in URL hash:", browserWindow.location.hash);
        return;
    }

    /**
     * Initiates the deletion process for the current campaign from the results view.
     * @param {object} campaignRecord - The campaign object to be deleted.
     */
    viewData.initiateDeletion = function(campaignRecord) {
        const confirmationMessage = `Are you absolutely certain you wish to permanently delete the campaign "${campaignRecord.name}" (ID: ${campaignRecord.id})? This action is irreversible and all associated data will be lost.`;
        if (!browserWindow.confirm(confirmationMessage)) {
            return; // User cancelled the deletion.
        }

        const campaignForRemoval = new CampaignRetrievalService(campaignRecord);
        campaignForRemoval.$removeById({ // Renamed service method for removing by ID.
            id: campaignForRemoval.id
        }, function(serverResponse) {
            if (serverResponse?.success) {
                viewData.displaySuccessAlert(serverResponse.message);
                // After successful deletion, a redirection to the dashboard or campaign list would be logical.
                // For now, mirroring original behavior of reloading (which would likely lead to an error here).
                // appNavigator.navigateTo('/dashboard'); // Example of a more appropriate action.
            } else {
                viewData.displayErrorAlert(serverResponse?.message || "Failed to delete campaign due to an unknown reason.");
            }
            viewData.outcomeTableSettings.reload(); // This reload might fail as the campaign is gone.
        }, function(errorDetails) {
            console.error("Error during campaign deletion:", errorDetails);
            viewData.displayErrorAlert(`Network or server error during deletion: ${errorDetails.statusText || 'Unknown error'}`);
        });
    };

    // Configuration for the data table that displays detailed outcomes of the campaign.
    viewData.outcomeTableSettings = new resultGridManager({
        page: 1,
        count: 10,
        sorting: {
            resultTimestamp: 'descending' // Assuming a 'resultTimestamp' field for sorting results.
        }
    }, {
        total: 0,
        getData: function(deferredResolver, parameters) {
            // Fetch comprehensive details for the specific campaign using its identifier.
            CampaignRetrievalService.fetchDetails({ // Renamed service method for fetching details.
                "id": campaignIdentifier
            }, function(detailedCampaign) {
                viewData.currentCampaignDetails = detailedCampaign; // Store the fetched campaign data on the view model.

                // Using a Map for clearer and more efficient aggregation of outcome statuses.
                const outcomeStatusCounts = new Map();

                // Aggregate results by status if outcomes exist and are an array.
                if (Array.isArray(detailedCampaign.outcomes)) {
                    detailedCampaign.outcomes.forEach(function(singleOutcome) {
                        const currentCount = outcomeStatusCounts.get(singleOutcome.status) || 0;
                        outcomeStatusCounts.set(singleOutcome.status, currentCount + 1);
                    });
                }

                // Convert the Map data into an array format suitable for chart series.
                const statusBreakdownChartData = Array.from(outcomeStatusCounts, ([status, count]) => ({
                    name: status,
                    y: count
                }));

                // Process timeline events for the scatter chart.
                if (Array.isArray(detailedCampaign.eventLog)) { // Renamed from 'timeline' to 'eventLog' for clarity.
                    detailedCampaign.eventLog.forEach(function(eventRecord) {
                        eventRecord.x = new Date(eventRecord.timestamp); // Renamed from 'time' to 'timestamp'.
                        eventRecord.y = 0; // Y-coordinate is typically 0 for a flat timeline scatter plot.
                        eventRecord.description = eventRecord.message; // Added for consistent tooltip.
                    });
                } else {
                    detailedCampaign.eventLog = []; // Ensure it's an empty array if undefined.
                }

                // Configuration for the email status pie chart.
                viewData.emailStatusChartConfig = Object.freeze({
                    chartOptions: {
                        chart: {
                            type: 'pie'
                        },
                        tooltips: {
                            formatter: function() {
                                return `<strong>${this.point.name}</strong> : ${this.point.y} events`;
                            },
                            style: {
                                padding: 12,
                                fontWeight: 'bolder'
                            }
                        },
                        plotConfiguration: {
                            pie: {
                                allowPointSelection: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: false
                                },
                                showInLegend: true
                            }
                        }
                    },
                    dataSeries: [{
                        data: statusBreakdownChartData
                    }],
                    graphTitle: {
                        text: 'Email Delivery and Interaction Status'
                    },
                    displaySize: {
                        height: 320
                    },
                    creditsEnabled: false,
                    isLoading: false,
                });

                // Configuration for the campaign timeline scatter chart.
                viewData.eventTimelineChartConfig = Object.freeze({
                    chartOptions: {
                        global: {
                            useUTC: false // Configures charts to use local time for display.
                        },
                        chart: {
                            type: 'scatter', // Scatter plot for individual events.
                            zoomType: "x"
                        },
                        tooltips: {
                            formatter: function() {
                                // Enhanced tooltip with conditional display of recipient email.
                                let tooltipLabel = `Event: <strong>${this.point.description}</strong><br/>`;
                                if (this.point.recipientEmail) { // Renamed from 'email' to 'recipientEmail'.
                                    tooltipLabel += `Recipient: ${this.point.recipientEmail}<br/>`;
                                }
                                tooltipLabel += `Timestamp: ${formatter("date")(this.point.x, "medium")}`;
                                return tooltipLabel;
                            },
                            style: {
                                padding: 12,
                                fontWeight: 'bolder'
                            }
                        },
                        plotConfiguration: {
                            series: {
                                cursor: 'pointer',
                            }
                        },
                        yAxes: {
                            labels: {
                                enabled: false // No labels on the Y-axis for a simple timeline.
                            },
                            axisTitle: {
                                text: "Event Occurrences"
                            }
                        },
                        xAxes: {
                            type: 'datetime',
                            dateTimeLabelFormats: {
                                day: "%e of %b",
                                hour: "%l:%M",
                                second: '%l:%M:%S',
                                minute: '%l:%M'
                            },
                            max: Date.now(), // Max X-axis value is the current time.
                            axisTitle: {
                                text: 'Time Progression'
                            }
                        },
                    },
                    dataSeries: [{
                        name: "Campaign Events",
                        data: viewData.currentCampaignDetails.eventLog // Uses the processed event log data.
                    }],
                    graphTitle: {
                        text: 'Campaign Event Timeline'
                    },
                    displaySize: {
                        height: 320
                    },
                    creditsEnabled: false,
                    isLoading: false,
                });

                // Update table parameters with the total count of results and resolve the promise.
                const totalResults = detailedCampaign.outcomes?.length || 0;
                parameters.total(totalResults);
                const pagedResults = detailedCampaign.outcomes.slice((parameters.page() - 1) * parameters.count(), parameters.page() * parameters.count());
                deferredResolver.resolve(pagedResults);
            }, function(errorResponse) {
                console.error("Failed to fetch campaign details:", errorResponse);
                viewData.displayErrorAlert(`Could not load campaign details. Error: ${errorResponse.statusText || 'Unknown'}`);
                parameters.total(0);
                deferredResolver.resolve([]); // Resolve with empty data on error.
            });
        }
    });
});

app.controller('AudienceGroupController', function(vm, dialogHandler, TargetGroupService, tableConfigurator) {
    // This controller manages the listing and configuration of audience groups.

    // Initialize the NotificationManager for displaying alerts.
    const notifier = new NotificationManager(vm);
    vm.notifications = { main: [], modal: [] };

    vm.showAlertDanger = (msg) => notifier.showAlert("danger", msg, "fa-exclamation-circle");
    vm.showAlertSuccess = (msg) => notifier.showAlert("success", msg, "fa-check-circle");

    // Constants for group table pagination and sorting.
    const DEFAULT_GROUP_PAGE_SIZE = 15; // A different default page size for group lists.
    const GROUP_SORT_FIELD = 'groupName'; // Assuming a 'groupName' field for sorting groups.

    // Main table configuration for displaying all defined audience groups.
    vm.primaryGroupTable = new tableConfigurator({
        page: 1,
        count: DEFAULT_GROUP_PAGE_SIZE,
        sorting: {
            [GROUP_SORT_FIELD]: 'ascending' // Dynamic sort field.
        }
    }, {
        total: 0,
        getData: function(deferral, params) {
            TargetGroupService.getAllGroups(function(allGroups) { // Renamed service method for fetching all groups.
                if (!allGroups || !Array.isArray(allGroups)) {
                    console.warn('AudienceGroupController: Fetched group list is invalid.');
                    vm.groupList = [];
                    params.total(0);
                    deferral.resolve([]);
                    return;
                }
                vm.groupList = allGroups; // Store the complete list of groups.
                params.total(allGroups.length);
                const pagedGroups = allGroups.slice((params.page() - 1) * params.count(), params.page() * params.count());
                deferral.resolve(pagedGroups);
            });
        }
    });

    // Table specifically for managing members (targets) within a particular group during editing.
    // This table's data source is dynamic, dependent on `vm.group` being populated.
    vm.memberListTable = new tableConfigurator({
        page: 1,
        count: DEFAULT_GROUP_PAGE_SIZE,
        sorting: {
            targetIdentifier: 'ascending' // Assuming a 'targetIdentifier' field for sorting group members.
        }
    }, {
        total: 0,
        getData: function(deferral, params) {
            // Safely access the members array from `vm.group`, defaulting to an empty array.
            const currentGroupMembers = vm.group?.members || []; // Renamed 'targets' to 'members'.
            params.total(currentGroupMembers.length);
            const pagedMembers = currentGroupMembers.slice((params.page() - 1) * params.count(), params.page() * params.count());
            deferral.resolve(pagedMembers);
        }
    });
});