// Core utilities for the application's user interface

const dashboardUtil = {};

// Utility function to display transient messages to the user
dashboardUtil.postNotification = (alertText, cssClass) => {
    if (!alertText || !cssClass) {
        console.warn('postNotification: Missing alertText or cssClass.');
        return;
    }
    const notificationSpan = $("#app-notification span");
    const notificationContainer = $("#app-notification");

    notificationSpan.text(alertText);
    notificationContainer.removeClass().addClass(cssClass).fadeIn('fast'); // Use fadeIn for smoother appearance

    // Optionally hide after a delay
    setTimeout(() => {
        notificationContainer.fadeOut('slow', () => {
            notificationSpan.empty(); // Clear text after fading out
        });
    }, 5000); // Hide after 5 seconds
};

// Specialized notification for errors
dashboardUtil.showError = (errorMessage) => {
    dashboardUtil.postNotification(errorMessage, "error-alert");
};

// Specialized notification for successful operations
dashboardUtil.showSuccess = (successMessage) => {
    dashboardUtil.postNotification(successMessage, "success-alert");
};

// Specialized notification for general information
dashboardUtil.showInfo = (infoMessage) => {
    dashboardUtil.postNotification(infoMessage, "info-alert");
};

// Formats a Date object into an RFC 1123 compliant string
dashboardUtil.getRFC1123Timestamp = (targetDate) => {
    if (!(targetDate instanceof Date)) {
        console.error("Invalid date object provided to getRFC1123Timestamp.");
        return "";
    }

    let rfcString = $.datepicker.formatDate("D, d M yy", targetDate);
    const pad = (num) => String(num).padStart(2, '0');

    rfcString += ` ${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}:${pad(targetDate.getSeconds())}`;

    const timezoneOffsetMinutes = targetDate.getTimezoneOffset();
    const offsetSign = timezoneOffsetMinutes < 0 ? "+" : "-";
    const absoluteOffsetMinutes = Math.abs(timezoneOffsetMinutes);
    const offsetHours = Math.floor(absoluteOffsetMinutes / 60);
    const offsetRemainingMinutes = absoluteOffsetMinutes % 60;

    const offsetString = `${offsetSign}${pad(offsetHours)}${pad(offsetRemainingMinutes)}`;
    return `${rfcString} ${offsetString}`;
};

// Populates the status legend in the admin view
dashboardUtil.populateStatusLegend = (canManage) => {
    // Helper to construct a single status row for the legend
    const buildStatusRowElement = (statusInfo) => {
        const tableRow = $("<tr />");

        $("<td />", {"class": "icon-cell"}).append(
            $("<img />", {
                src: statusInfo.image,
                alt: statusInfo.name,
                title: statusInfo.description // Add title for better UX
            })
        ).appendTo(tableRow);

        $("<td />", {"class": "description-cell", text: statusInfo.description}).appendTo(tableRow);

        if (canManage) {
            const editActionLink = $("<a />", {text: "Edit", href: statusInfo.url, "class": "edit-status-link"});
            const deleteActionLink = $("<a />", {text: "Delete", href: statusInfo.url, "class": "delete-status-btn"});

            $("<td />", {"class": "status-level-cell", text: statusInfo.level}).appendTo(tableRow);
            $("<td />", {html: editActionLink}).appendTo(tableRow);
            $("<td />", {html: deleteActionLink}).appendTo(tableRow);

            editActionLink.on('click', function(eventObj) { // Using .on() instead of .click()
                eventObj.preventDefault();
                const currentLink = $(eventObj.target);
                const parentRow = currentLink.closest("tr"); // More robust selection
                const iconImage = parentRow.find(".icon-cell img");

                // Extract image value more cleanly
                const imageFilename = iconImage.attr("src").split('/').pop();
                const statusIconKey = imageFilename.slice(0, -4); // Remove .png

                $("#status-name-field").val(iconImage.attr("alt"));
                $("#status-description-field").val(parentRow.find(".description-cell").text());
                $("#status-level-select").val(parentRow.find(".status-level-cell").text());

                // Ensure only the correct radio button is checked
                $("input[name='status-image-option']").prop("checked", false);
                $(`input[value='${statusIconKey}']`).prop("checked", true);

                $("#manage-status-modal").dialog({
                    height: 550, // Slightly adjusted height
                    width: 480,
                    resizable: false,
                    autoOpen: true,
                    modal: true,
                    title: "Edit Status Entry", // Add a modal title
                    buttons: [
                        {
                            text: 'Save Changes',
                            click: function() {
                                const modalInstance = $(this);
                                $.ajax({
                                    type: "PUT", // Use PUT for updates
                                    url: currentLink.attr("href"),
                                    data: {
                                        'status[name]': $("#status-name-field").val(),
                                        'status[description]': $("#status-description-field").val(),
                                        'status[image]': $("input[name='status-image-option']:checked").val(),
                                        'status[level]': $("#status-level-select").val()
                                    },
                                    dataType: 'json',
                                    context: parentRow,
                                    success: function(responsePayload) {
                                        modalInstance.dialog('close');
                                        this.find(".description-cell").text(responsePayload.description);
                                        this.find(".status-level-cell").text(responsePayload.level);
                                        this.find(".icon-cell img").attr({
                                            "alt": responsePayload.name,
                                            "src": responsePayload.image
                                        });
                                        dashboardUtil.showSuccess("Status updated successfully!");
                                    },
                                    error: function(jqXHR, textStatus, errorThrown) {
                                        modalInstance.dialog('close');
                                        dashboardUtil.showError(`Failed to save status: ${textStatus}`);
                                        console.error("AJAX Error:", textStatus, errorThrown, jqXHR.responseText);
                                    }
                                });
                            }
                        },
                        {
                            text: 'Cancel',
                            click: function() {
                                $(this).dialog('close');
                            }
                        }
                    ]
                });
            });
        }
        $("#legend-table-body").append(tableRow);
    };

    // Handler for adding a new status
    $("#add-new-status-button").on('click', () => {
        $("#status-name-field").val("");
        $("#status-description-field").val("");
        $("#status-level-select").val(""); // Clear selected level
        $("input[name='status-image-option']").prop("checked", false); // Uncheck all image options
        $("#manage-status-modal").dialog('open');
    });

    // Fetch existing statuses
    $.ajax({
        type: "GET",
        url: "/api/v1/statuses.json",
        dataType: 'json',
        success: (response) => {
            if (response && Array.isArray(response.statuses)) {
                response.statuses.forEach(statusData => buildStatusRowElement(statusData));
            } else {
                console.warn("API response for statuses was not as expected:", response);
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            dashboardUtil.showError("Failed to fetch status list.");
            console.error("AJAX Error fetching statuses:", textStatus, errorThrown, jqXHR.responseText);
        }
    });

    // Fetch available status levels for dropdown
    $.ajax({
        type: "GET",
        url: "/api/v1/levels.json",
        dataType: "json",
        context: $("#status-level-select"), // Set context to the select element
        success: function(response) {
            if (response && Array.isArray(response.levels)) {
                response.levels.forEach(levelName => {
                    $("<option />", {
                        value: levelName,
                        text: levelName
                    }).appendTo($(this));
                });
            } else {
                console.warn("API response for levels was not as expected:", response);
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            dashboardUtil.showError("Failed to fetch status levels.");
            console.error("AJAX Error fetching levels:", textStatus, errorThrown, jqXHR.responseText);
        }
    });

    // Initialize the modal for adding/editing statuses
    $("#manage-status-modal").dialog({
        height: 550,
        width: 480,
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "Create New Status",
        buttons: [
            {
                text: 'Create Status',
                click: function() {
                    const modalInstance = $(this);
                    $.ajax({
                        type: "POST",
                        url: "/api/v1/statuses.json",
                        data: {
                            'status[name]': $("#status-name-field").val(),
                            'status[description]': $("#status-description-field").val(),
                            'status[image]': $("input[name='status-image-option']:checked").val(),
                            'status[level]': $("#status-level-select").val()
                        },
                        dataType: 'json',
                        context: $("#legend-table-body"),
                        success: function(responsePayload) {
                            modalInstance.dialog('close');
                            buildStatusRowElement(responsePayload); // Add the new status to the table
                            dashboardUtil.showSuccess("New status created successfully!");
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            modalInstance.dialog('close');
                            dashboardUtil.showError("Could not create new status. Please check inputs.");
                            console.error("AJAX Error creating status:", textStatus, errorThrown, jqXHR.responseText);
                        }
                    });
                }
            },
            {
                text: 'Cancel',
                click: function() {
                    $(this).dialog('close');
                }
            }
        ]
    });

    // Event delegation for delete buttons (more efficient than .live())
    $(document).on('click', '.delete-status-btn', function(eventObj) {
        eventObj.preventDefault();
        const deleteLink = $(eventObj.target);
        const rowToDelete = deleteLink.closest('tr');

        $("#confirm-delete-modal").dialog({
            resizable: false,
            modal: true,
            title: "Confirm Deletion",
            buttons: [
                {
                    text: 'Delete Status',
                    click: function() {
                        const confirmModal = $(this);
                        $.ajax({
                            type: "DELETE",
                            url: deleteLink.attr("href"),
                            dataType: 'json',
                            success: () => {
                                rowToDelete.remove(); // Remove the row from the table
                                confirmModal.dialog('close');
                                dashboardUtil.showSuccess("Status deleted.");
                            },
                            error: (jqXHR, textStatus, errorThrown) => {
                                confirmModal.dialog('close');
                                dashboardUtil.showError("Unable to delete status.");
                                console.error("AJAX Error deleting status:", textStatus, errorThrown, jqXHR.responseText);
                            }
                        });
                    }
                },
                {
                    text: 'Cancel',
                    click: function() {
                        $(this).dialog('close');
                    }
                }
            ]
        });
    });
};

// Initializes the main dashboard view with service statuses
dashboardUtil.initializeServiceOverview = () => {
    const now = new Date();
    const oneDayInMs = 86400000;
    let dateCursor = new Date(now.getTime() - oneDayInMs); // Start from yesterday

    const tableHeaderRow = $("#service-list-header tr");
    tableHeaderRow.empty(); // Clear existing headers if any

    // Add empty header for service names
    $("<th />").appendTo(tableHeaderRow);

    // Populate date headers for the last 5 days
    for (let i = 0; i < 5; i++) {
        const displayDate = new Date(dateCursor); // Clone date to avoid mutation issues
        $("<th />", {
            "class": "date-column",
            text: `${displayDate.getMonth() + 1}/${displayDate.getDate()}/${displayDate.getFullYear()}`
        }).appendTo(tableHeaderRow);
        dateCursor.setTime(dateCursor.getTime() - oneDayInMs); // Move to previous day
    }

    // Helper function to create a service row in the main table
    const constructServiceTableRow = (serviceData, shouldFetchStatuses) => {
        if (!serviceData || !serviceData.id) {
            console.warn("Skipping service row creation due to invalid data:", serviceData);
            return;
        }
        const infoIconPath = "/images/status/question-white.png";
        const defaultIconPath = "/images/status/tick-circle.png";
        let displayIconPath = defaultIconPath;

        const serviceRowElement = $(`<tr id="service-row-${serviceData.id}" />`); // Unique ID for the row

        $('<td />').append(
            $('<a />', {
                href: `services/${serviceData.id}`,
                text: serviceData.name,
                title: serviceData.description // Add description as title for service name
            })
        ).appendTo(serviceRowElement);

        if (shouldFetchStatuses) {
            displayIconPath = infoIconPath;
        }

        // Current status column
        $('<td />', {"class": "status-cell highlight-status"}).append(
            $('<a />', {
                href: `services/${serviceData.id}`,
                html: $("<img />", {
                    src: displayIconPath,
                    alt: "Unknown Status",
                    "class": "current-status-icon"
                })
            })
        ).appendTo(serviceRowElement);

        // Historical status columns (initially unknown)
        for (let i = 0; i < 5; i++) {
            $("<td />", {"class": "status-cell history-status"}).append(
                $("<img />", {
                    src: displayIconPath,
                    alt: "Unknown Status"
                })
            ).appendTo(serviceRowElement);
        }

        $("#service-list-body").append(serviceRowElement); // Append to tbody

        if (shouldFetchStatuses) {
            // Fetch current status for the service
            $.ajax({
                type: "GET",
                url: `/api/v1/services/${serviceData.id}/events/current.json`,
                dataType: 'json',
                success: (eventPayload) => {
                    if (eventPayload && eventPayload.status) {
                        const targetRow = $(`#service-row-${serviceData.id}`);
                        targetRow.find(".highlight-status .current-status-icon")
                            .attr("src", eventPayload.status.image)
                            .attr("alt", eventPayload.status.name);

                        if (eventPayload.informational) {
                            targetRow.find(".highlight-status a").append(
                                $("<img />", {
                                    src: "/images/small-information.png",
                                    "class": "information-badge",
                                    title: "Informational event"
                                })
                            );
                        }
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.warn(`Failed to fetch current status for service ${serviceData.id}.`, textStatus);
                    // Optionally set to a default 'ok' or 'unknown' status icon
                    $(`#service-row-${serviceData.id} .highlight-status .current-status-icon`).attr("src", defaultIconPath);
                }
            });

            // Fetch historical statuses for the service
            const currentDayStart = new Date();
            currentDayStart.setHours(0, 0, 0, 0);

            const periodEndDate = new Date(currentDayStart.getTime());
            const periodStartDate = new Date(periodEndDate.getTime() - oneDayInMs * 5); // 5 full days before end date

            const requestUrl = `/api/v1/services/${serviceData.id}/events.json` +
                               `?start=${dashboardUtil.getRFC1123Timestamp(periodStartDate)}` +
                               `&end=${dashboardUtil.getRFC1123Timestamp(periodEndDate)}`;

            $.ajax({
                type: "GET",
                url: requestUrl,
                dataType: 'json',
                success: (results) => {
                    const dailyStatusMap = {};
                    const dateRange = [];

                    // Adjust end date to be the actual last day to display (yesterday)
                    let displayDateTracker = new Date(periodEndDate.getTime() - oneDayInMs);
                    displayDateTracker.setHours(0, 0, 0, 0); // Normalize to start of day

                    for (let i = 0; i < 5; i++) {
                        dateRange.unshift(new Date(displayDateTracker)); // Add to front for reverse order
                        dailyStatusMap[displayDateTracker.toDateString()] = false; // Initialize to no issues
                        displayDateTracker.setTime(displayDateTracker.getTime() - oneDayInMs);
                    }

                    if (results && Array.isArray(results.events)) {
                        results.events.forEach(singleEvent => {
                            const eventTimestampDate = new Date(singleEvent.timestamp);
                            eventTimestampDate.setHours(0, 0, 0, 0); // Normalize event date

                            // Mark the day if there was an informational event or a non-NORMAL status
                            if (dailyStatusMap.hasOwnProperty(eventTimestampDate.toDateString())) {
                                if (singleEvent.informational || (singleEvent.status && singleEvent.status.level !== "NORMAL")) {
                                    dailyStatusMap[eventTimestampDate.toDateString()] = true;
                                }
                            }
                        });
                    }

                    // Update historical status cells
                    for (let i = 0; i < dateRange.length; i++) {
                        const currentDay = dateRange[i];
                        const tableCell = $(`#service-row-${serviceData.id} .history-status`).eq(i); // Use .eq(index) for specific cell

                        const detailUrl = `services/${serviceData.id}/${currentDay.getFullYear()}/` +
                                          `${currentDay.getMonth() + 1}/${currentDay.getDate()}`;

                        if (dailyStatusMap[currentDay.toDateString()]) {
                            tableCell.html($("<a />", {href: detailUrl}).append(
                                $("<img />", {src: "/images/status/information.png", alt: "Issue Reported"}))
                            );
                        } else {
                            tableCell.html($("<a />", {href: detailUrl}).append(
                                $("<img />", {src: defaultIconPath, alt: "All Clear"}))
                            );
                        }
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.warn(`Failed to fetch historical statuses for service ${serviceData.id}.`, textStatus);
                }
            });
        }
    };

    // Initial fetch of all services
    $.ajax({
        type: "GET",
        url: "/api/v1/services.json",
        dataType: 'json',
        success: (response) => {
            if (response && Array.isArray(response.services)) {
                $("#service-list-body").empty(); // Clear existing rows before appending
                response.services.forEach(service => constructServiceTableRow(service, true));
            } else {
                console.warn("API response for services was not as expected:", response);
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            dashboardUtil.showError("Could not load services list.");
            console.error("AJAX Error fetching services:", textStatus, errorThrown, jqXHR.responseText);
        }
    });

    // Toggle disabled state for status submit button based on checkbox
    $("#enable-status-updates").on('change', function() {
        $("#submit-service-event .status-field").prop('disabled', !$(this).is(":checked"));
    });

    // Toggle disabled state for message submit button based on checkbox
    $("#enable-message-updates").on('change', function() {
        $("#submit-service-event .message-field").prop('disabled', !$(this).is(":checked"));
    });

    // Open "Add Service" modal
    $("#add-service-button").on('click', () => {
        $("#add-service-modal").dialog('open');
    });

    // Initialize the "Add Service" modal dialog
    $("#add-service-modal").dialog({
        height: 350, // Adjusted height
        width: 480,
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "Create New Service",
        buttons: [
            {
                text: 'Create Service',
                click: function() {
                    const modalInstance = $(this);
                    const serviceName = $("#service-name-input").val().trim();
                    const serviceDescription = $("#service-description-input").val().trim();

                    if (!serviceName || !serviceDescription) {
                        dashboardUtil.showError("Service Name and Description are required.");
                        return; // Prevent AJAX call if validation fails
                    }

                    $.ajax({
                        type: "POST",
                        url: "/api/v1/services.json",
                        data: {
                            'service[name]': serviceName,
                            'service[description]': serviceDescription
                        },
                        dataType: 'json',
                        context: $("#service-list-body"),
                        success: (responsePayload) => {
                            modalInstance.dialog('close');
                            constructServiceTableRow(responsePayload, false); // Add new row without fetching statuses yet
                            dashboardUtil.showSuccess(`Service '${responsePayload.name}' created.`);
                        },
                        error: (jqXHR, textStatus, errorThrown) => {
                            modalInstance.dialog('close');
                            dashboardUtil.showError("Could not create service. Check inputs and try again.");
                            console.error("AJAX Error creating service:", textStatus, errorThrown, jqXHR.responseText);
                        }
                    });
                }
            },
            {
                text: 'Cancel',
                click: function() {
                    $(this).dialog('close');
                }
            }
        ]
    });
};

// Populates the details page for a specific service
dashboardUtil.renderServicePage = (serviceIdentifier, isUserAdmin, fromDate, toDate) => {
    const oneMinuteInMs = 60 * 1000;

    // Helper function to generate an event row for the service details table
    const generateEventRow = (eventData) => {
        const eventDate = new Date(eventData.timestamp);
        const padZero = (num) => String(num).padStart(2, '0');

        let displayHour = eventDate.getHours();
        const amPmPeriod = displayHour >= 12 ? "PM" : "AM";
        displayHour = displayHour % 12 || 12; // Convert to 12-hour format

        const formattedTime = `${$.datepicker.formatDate("MM d,", eventDate)} ${displayHour}:${padZero(eventDate.getMinutes())}${amPmPeriod}`;

        const tableRow = $('<tr />');

        $('<td />', {text: formattedTime}).appendTo(tableRow);

        let rowImageSrc = eventData.status ? eventData.status.image : "/images/status/unknown.png"; // Default unknown image
        if (eventData.informational) {
            rowImageSrc = "/images/status/information.png";
        }

        $('<td />', {"class": "event-status-cell"}).append(
            $("<img />", {
                src: rowImageSrc,
                alt: eventData.status ? eventData.status.name : "Unknown",
                title: eventData.description // Use description as title for event status
            })
        ).appendTo(tableRow);

        $('<td />', {text: eventData.message}).appendTo(tableRow);

        if (isUserAdmin) {
            const editEventLink = $("<a />", {text: "Edit", href: `/admin/events/${eventData.id}`, "class": "edit-event-link"});
            const deleteEventLink = $("<a />", {text: "Delete", href: `/admin/events/${eventData.id}`, "class": "delete-event-button"});

            $('<td />', {html: editEventLink}).appendTo(tableRow);
            $('<td />', {html: deleteEventLink}).appendTo(tableRow);
        }

        $("#service-event-history-body").append(tableRow);
    };

    // ... (rest of fillService logic would go here, similarly refactored)
    // This section was cut short in the original prompt, so I'll leave it incomplete
    // to match the provided snippet length, but apply the Type III changes to the existing part.
    // If the full original function was provided, I would continue the refactoring.
};