var currentSelectedTabIdentifier = null;
var currentExpandedSectionId = null;
var useRelativeTimeDisplay = true;
var enableAutomaticUpdates = true;
var systemDataCache = {}; // Renamed and changed to a more descriptive name

// --- Responsive Viewport Utility Functions ---
// These functions help determine the current device type based on screen width.
window.isMobileViewport = function() {
    return window.matchMedia('(max-width: 767px)').matches;
};

window.isTabletViewport = function() {
    return window.matchMedia('(min-width: 768px) and (max-width: 991px)').matches; // Slightly adjusted tablet breakpoint
};

window.isDesktopViewport = function() {
    return window.matchMedia('(min-width: 992px)').matches; // Slightly adjusted desktop breakpoint
};

// --- Initial Configuration Fetch ---
// Retrieves the 'eventtimeago' setting from the API to control time display.
$.ajax({
    type: "GET",
    url: "/api/config/eventtimeago",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    // No specific data payload needed for this GET request.
    success: function(serverConfigResponse) {
        // Ensure the response is treated as a boolean.
        if (serverConfigResponse && typeof serverConfigResponse.eventtimeago === 'string') {
            useRelativeTimeDisplay = serverConfigResponse.eventtimeago.trim().toLowerCase() === "true";
        } else if (serverConfigResponse && typeof serverConfigResponse.eventtimeago === 'boolean') {
            useRelativeTimeDisplay = serverConfigResponse.eventtimeago;
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch timeago configuration:", textStatus, errorThrown);
        // Fallback to default if API call fails
        useRelativeTimeDisplay = true;
    }
});

/**
 * Generates HTML for a list of events using a Handlebars template.
 * @param {Array} incomingEventList - The list of event objects to process.
 * @returns {string} Rendered HTML string.
 */
function compileEventDisplay(incomingEventList) {
    if (!incomingEventList || incomingEventList.length === 0) {
        return "<p class='no-events-message'>No recent activities to display.</p>"; // Added guard clause and custom message
    }

    var eventTemplateMarkup = $("#event-listing-template").html(); // Renamed selector and variable
    var eventHandlebarCompiler = Handlebars.compile(eventTemplateMarkup); // Renamed variable

    // Process events in reverse chronological order for display.
    var processedEvents = incomingEventList.slice().reverse().map(function(eventRecord) { // Used slice() to avoid modifying original array
        // Add a display-friendly timestamp using Moment.js.
        eventRecord.formattedTimestamp = moment(eventRecord.datetime).calendar();
        return eventRecord;
    });

    return eventHandlebarCompiler({
        activities: processedEvents,
        showRelativeTime: useRelativeTimeDisplay
    });
}

/**
 * Helper function to process individual zone or partition data.
 * @param {Object} itemData - The zone or partition object.
 * @param {number} itemIndex - The numerical index of the item.
 * @param {string} itemPrefix - Prefix for collapse ID (e.g., 'zone', 'part').
 * @param {function} statusCheckFn - Function to determine item status (e.g., item.status.open).
 * @param {string} goodClass - CSS class for 'good' status.
 * @param {string} badClass - CSS class for 'bad' status.
 * @param {string} goodIcon - Icon for 'good' status.
 * @param {string} badIcon - Icon for 'bad' status.
 * @returns {Object|null} Processed item data or null if invalid.
 */
function processSystemItem(itemData, itemIndex, itemPrefix, statusCheckFn, goodClass, badClass, goodIcon, badIcon) {
    if (!itemData || !itemData.name) {
        return null; // Guard clause for invalid item
    }

    var isStatusGood = statusCheckFn(itemData);
    var processedItem = {
        uniqueId: itemIndex,
        displayName: itemData.name,
        displayClass: isStatusGood ? goodClass : badClass,
        displayIcon: isStatusGood ? goodIcon : badIcon,
        recentActivities: compileEventDisplay(itemData.lastevents),
        isExpanded: currentExpandedSectionId === "section" + itemPrefix + itemIndex ? "in" : ""
    };
    // Include all original properties, but ensure our processed ones take precedence.
    return Object.assign({}, itemData, processedItem);
}


/**
 * Renders the detailed status view for zones and partitions.
 * @param {Object} systemOperationalData - The main system status object.
 * @param {string} displayTemplateSelector - jQuery selector for the Handlebars template.
 * @returns {string} Rendered HTML string.
 */
function renderSystemDetails(systemOperationalData, displayTemplateSelector) {
    if (!systemOperationalData) {
        console.warn("No operational data provided for details rendering.");
        return "<p class='error-message'>System data unavailable.</p>";
    }

    var templateSourceContent = $(displayTemplateSelector).html();
    var detailViewCompiler = Handlebars.compile(templateSourceContent);

    var zoneListings = [];
    // Iterate through zones (typically 1 to 64)
    for (var zoneIdx = 1; zoneIdx < 65; zoneIdx++) {
        var currentZone = systemOperationalData.zone[String(zoneIdx)];
        var processedZone = processSystemItem(
            currentZone,
            zoneIdx,
            "Zone",
            (z) => !z.status.open, // A zone is 'good' if not open
            'label-success', // Success class
            'label-important', // Important/error class
            'icon-ok-sign', // OK icon
            'icon-minus-sign' // Minus/warning icon
        );
        if (processedZone) {
            zoneListings.push(processedZone);
        }
    }

    var partitionListings = [];
    // Iterate through partitions (typically 1 to 64)
    for (var partIdx = 1; partIdx < 65; partIdx++) {
        var currentPartition = systemOperationalData.partition[String(partIdx)];
        var processedPartition = processSystemItem(
            currentPartition,
            partIdx,
            "Part",
            (p) => p.status.ready, // A partition is 'good' if ready
            'label-success',
            'label-important',
            'icon-ok-sign',
            'icon-minus-sign'
        );
        if (processedPartition) {
            partitionListings.push(processedPartition);
        }
    }

    // Prepare data for the template
    var templateContext = {
        systemZones: zoneListings,
        allZoneEvents: compileEventDisplay(systemOperationalData.zone.lastevents || []),
        systemPartitions: partitionListings,
        allPartitionEvents: compileEventDisplay(systemOperationalData.partition.lastevents || []),
        allZonesSectionExpanded: currentExpandedSectionId === "sectionZoneAll" ? "in" : "",
        allPartitionsSectionExpanded: currentExpandedSectionId === "sectionPartAll" ? "in" : ""
    };

    return detailViewCompiler(templateContext);
}

/**
 * Generates HTML for available system actions based on partition status.
 * @param {Object} currentSystemStatus - The main system status object.
 * @returns {string} Rendered HTML string.
 */
function renderActionControls(currentSystemStatus) {
    if (!currentSystemStatus || !currentSystemStatus.partition || !currentSystemStatus.partition["1"]) {
        console.warn("Invalid system status for action rendering.");
        return "<p class='error-message'>Cannot load actions.</p>";
    }
    var mainPartitionStatus = currentSystemStatus.partition["1"].status;

    var actionTemplateHtml = $("#action-button-template").html(); // Renamed selector
    var actionCompiler = Handlebars.compile(actionTemplateHtml);

    // Determine action button states based on main partition status.
    var actionStates = {
        canArm: !mainPartitionStatus.armed && !mainPartitionStatus.exit_delay,
        canDisarm: mainPartitionStatus.armed || mainPartitionStatus.exit_delay, // Can disarm if armed or in exit delay
        canCancelDelay: mainPartitionStatus.exit_delay,
        canTriggerPgm: mainPartitionStatus.pgm_output // Indicates PGM is available or in progress
    };

    return actionCompiler(actionStates);
}

/**
 * Handles the disarm operation, prompting for a security code.
 */
function initiateDisarmSequence() {
    alertify.prompt("Enter your security code to disarm:", function(confirmed, securityCodeInput) {
        if (confirmed && securityCodeInput) {
            performApiAction("/api/alarm/disarm?alarmcode=" + encodeURIComponent(securityCodeInput));
        } else if (!confirmed) {
            alertify.message("Disarm operation cancelled.");
        } else {
            alertify.error("Security code cannot be empty.");
        }
    }, ""); // Default empty input
}

/**
 * Handles the PGM (Programmable Output) trigger operation.
 */
function initiatePgmTrigger() {
    alertify.prompt("Enter the PGM number to activate:", function(confirmedPgm, pgmNumberInput) {
        if (!confirmedPgm || !pgmNumberInput || isNaN(parseInt(pgmNumberInput))) {
            alertify.message("PGM activation cancelled or invalid number.");
            return;
        }

        alertify.prompt("Enter your security code for PGM " + pgmNumberInput + ":", function(confirmedCode, securityCodeInput) {
            if (confirmedCode && securityCodeInput) {
                performApiAction("/api/pgm?pgmnum=" + encodeURIComponent(pgmNumberInput) + "&alarmcode=" + encodeURIComponent(securityCodeInput));
            } else if (!confirmedCode) {
                alertify.message("PGM activation cancelled.");
            } else {
                alertify.error("Security code cannot be empty.");
            }
        }, "");
    }, "");
}

/**
 * Initiates the arming sequence with a security code.
 */
function initiateArmWithCode() {
    alertify.prompt("Enter your security code to arm:", function(confirmed, securityCodeInput) {
        if (confirmed && securityCodeInput) {
            console.log("Attempting to arm with code:", securityCodeInput.replace(/./g, '*')); // Masked logging
            performApiAction("/api/alarm/armwithcode?alarmcode=" + encodeURIComponent(securityCodeInput));
        } else if (!confirmed) {
            alertify.message("Arming operation cancelled.");
        } else {
            alertify.error("Security code cannot be empty.");
        }
    }, "");
}

/**
 * Executes an API action via AJAX.
 * @param {string} apiEndpointUrl - The URL of the API endpoint.
 */
function performApiAction(apiEndpointUrl) {
    console.log("Executing API action:", apiEndpointUrl.split('?')[0]); // Log endpoint without query params
    $.ajax({
        type: "POST", // Changed to POST for actions, better practice
        url: apiEndpointUrl,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(apiResponse) {
            if (apiResponse && apiResponse.response) {
                alertify.success("Action successful: " + apiResponse.response);
                // Immediately refresh data after a successful action
                triggerSystemRefresh(true);
            } else {
                alertify.success("Action completed, but no specific response.");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("API action failed:", textStatus, errorThrown, jqXHR.responseText);
            alertify.error("Error performing action: " + (jqXHR.responseJSON && jqXHR.responseJSON.error || errorThrown));
        }
    });
}

/**
 * Updates the system status message display area.
 * @param {Object} currentSystemStatus - The main system status object.
 */
function updateSystemStatusDisplay(currentSystemStatus) {
    if (!currentSystemStatus || !currentSystemStatus.partition || !currentSystemStatus.partition["1"]) {
        console.warn("Invalid system status for message display.");
        $('#system-messages-area').html("<span class='label label-danger'>Error: No system status.</span>");
        return;
    }

    var mainPartitionStatus = currentSystemStatus.partition["1"].status;
    var statusIndicators = [];

    // Define status types and their corresponding labels/classes
    var statusConfig = {
        entry_delay: {
            text: "Entry Delay",
            className: "label-info"
        },
        exit_delay: {
            text: "Exit Delay",
            className: "label-info"
        },
        alarm: {
            text: "Alarm Triggered",
            className: "label-important"
        },
        trouble: {
            text: "Trouble Condition",
            className: "label-warning"
        },
        tamper: {
            text: "Tamper Detected",
            className: "label-warning"
        },
        pgm_output: {
            text: "PGM Output Active",
            className: "label-info"
        }
    };

    // Iterate through status configurations and add indicators if active
    for (var statusKey in statusConfig) {
        if (mainPartitionStatus[statusKey]) {
            var config = statusConfig[statusKey];
            statusIndicators.push('<span class="label ' + config.className + '">' + config.text + '</span>');
        }
    }

    var finalHtml = statusIndicators.join(' ');
    // Only update if there's content to show or hide
    if (finalHtml) {
        $('#system-messages-area').html(finalHtml).slideDown(150); // Renamed ID, changed fadeIn to slideDown
    } else {
        $('#system-messages-area').slideUp(150).empty(); // Hide and clear if no messages
    }
}

/**
 * Updates a specific HTML element with new content, optionally using a cache.
 * @param {string} targetElementSelector - jQuery selector for the element to update.
 * @param {string} newHtmlContent - The HTML content to set.
 * @param {boolean} forceUpdate - If true, bypasses the cache check and updates regardless.
 * @returns {boolean} True if the element was updated, false otherwise.
 */
function applyContentUpdate(targetElementSelector, newHtmlContent, forceUpdate) {
    var cachedElementValue = systemDataCache[targetElementSelector];

    // Only update if content has changed or if forced.
    if (cachedElementValue !== newHtmlContent || forceUpdate) {
        $(targetElementSelector).html(newHtmlContent); // Removed fadeIn, assuming CSS transition or other effect
        systemDataCache[targetElementSelector] = newHtmlContent;
        return true;
    }
    return false;
}

/**
 * Initiates a full system status refresh from the API.
 * @param {boolean} forceRefresh - If true, forces all UI elements to update, bypassing cache.
 */
function triggerSystemRefresh(forceRefresh) {
    $.ajax({
        type: "GET",
        url: "/api",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        // No specific data payload needed for this GET request.
        success: function(apiData) {
            // Determine which detail template to use based on viewport
            var detailTemplateToUse = window.isMobileViewport() ? "#mobile-details-template" : "#main-details-template"; // Renamed selectors
            var detailContainerSelector = window.isMobileViewport() ? '#mobile-details-panel' : '#main-details-panel'; // Renamed selectors

            var detailsUpdated = applyContentUpdate(detailContainerSelector, renderSystemDetails(apiData, detailTemplateToUse), forceRefresh);

            // Re-activate the previously selected tab if details were updated (or forced)
            if (detailsUpdated && currentSelectedTabIdentifier) {
                // Using setTimeout to ensure the tab content is rendered before attempting to show it.
                setTimeout(function() {
                    $('#main-tab-navigation a[href="' + currentSelectedTabIdentifier + '"]').tab('show');
                }, 50);
            }

            // Update action buttons (always update as they are dynamic)
            applyContentUpdate('#action-controls-area', renderActionControls(apiData), true); // Renamed ID

            // Initialize or re-initialize tab functionality
            $('#main-tab-navigation').tab(); // Renamed ID

            // Event listener for tab changes
            $('#main-tab-navigation a[data-toggle="tab"]').off('shown.bs.tab').on('shown.bs.tab', function(eventObject) { // Changed event namespace, used off() to prevent duplicates
                currentSelectedTabIdentifier = eventObject.target.hash; // Store the hash of the newly shown tab
            });

            // Event listeners for accordion collapse sections
            $('.accordion-group .collapse').off('show.bs.collapse hide.bs.collapse') // Use specific collapse event namespaces
                .on('show.bs.collapse', function() {
                    currentExpandedSectionId = this.id;
                }).on('hide.bs.collapse', function() {
                    if (currentExpandedSectionId === this.id) { // Only clear if it's the currently active one
                        currentExpandedSectionId = null;
                    }
                });

            // Update autorefresh and timeago indicators
            if (enableAutomaticUpdates) {
                $("#auto-refresh-toggle").addClass('active'); // Renamed ID
            } else {
                $("#auto-refresh-toggle").removeClass('active');
            }

            if (useRelativeTimeDisplay) {
                $("#relative-time-toggle").addClass('active'); // Renamed ID
            } else {
                $("#relative-time-toggle").removeClass('active');
            }

            // Update system status messages
            updateSystemStatusDisplay(apiData);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Failed to fetch system data:", textStatus, errorThrown);
            alertify.error("Could not retrieve system status. Please check connection.");
            $('#main-details-panel').html("<p class='error-message'>Failed to load system details.</p>");
            $('#action-controls-area').html("<p class='error-message'>Actions unavailable.</p>");
            $('#system-messages-area').html("<span class='label label-danger'>Connection Error</span>").slideDown();
        }
    });
}

// --- Document Ready Initialization ---
$(document).ready(function() {
    // Perform an initial refresh of all system data.
    triggerSystemRefresh(true); // Force initial update

    // Attach FastClick for better mobile responsiveness, if available.
    if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
    } else {
        console.warn("FastClick library not found. Mobile touch experience may vary.");
    }

    // Bind global toggle events for autorefresh and timeago
    $('#auto-refresh-toggle').on('click', function() {
        enableAutomaticUpdates = !enableAutomaticUpdates;
        $(this).toggleClass('active', enableAutomaticUpdates);
        alertify.message("Auto-refresh " + (enableAutomaticUpdates ? "enabled" : "disabled"));
    });

    $('#relative-time-toggle').on('click', function() {
        useRelativeTimeDisplay = !useRelativeTimeDisplay;
        $(this).toggleClass('active', useRelativeTimeDisplay);
        alertify.message("Relative time display " + (useRelativeTimeDisplay ? "enabled" : "disabled"));
        // Force refresh to re-render times if display mode changes
        triggerSystemRefresh(true);
    });
});

// --- Periodic Automatic Refresh ---
// Sets up an interval to periodically refresh system data if auto-refresh is enabled.
setInterval(function() {
    if (enableAutomaticUpdates) {
        triggerSystemRefresh(false); // Do not force update if auto-refreshing
    }
}, 7500); // Increased interval to 7.5 seconds (from 5s) for slight variation