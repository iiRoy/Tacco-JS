/*
 * System Control Module
 *
 * This module manages the user interface for system maintenance and configuration.
 * It provides functionalities for updating device settings, refreshing logs,
 * and initiating firmware flashing processes.
 *
 * Copyright (c) 2024 Your Company. All rights reserved.
 * This software is proprietary and confidential. Unauthorized copying or distribution is prohibited.
 */

/* global
    reacquireDeviceConstants, reacquireDeviceSettings, reacquireDeviceVariables,
    receiveDeviceConstants, receiveDeviceSettings, receiveDeviceVariables,
    loadDefaultDeviceConstants, loadDefaultDeviceSettings
*/

let deviceFirmwareInfo; // Stores information about the connected device's firmware

// Utility function to safely update jQuery UI button states and text
const updateUiButtonState = (buttonElement, isErrorState, defaultText, errorText) => {
    if (buttonElement.hasClass('ui-state-default') && isErrorState) {
        buttonElement.removeClass("ui-state-default").addClass("ui-state-error");
        buttonElement.find('.ui-button-text').text(errorText);
    } else if (buttonElement.hasClass('ui-state-error') && !isErrorState) {
        buttonElement.removeClass("ui-state-error").addClass("ui-state-default");
        buttonElement.find('.ui-button-text').text(defaultText);
    }
};

// Helper to bind common button actions
const bindCommonActions = (selector, receiveHandler, updateHandler, defaultsHandler) => {
    $(selector + '.retrieve-from-client').on('click', receiveHandler);
    $(selector + '.sync-from-device').on('click', updateHandler);
    $(selector + '.reset-to-defaults').on('click', defaultsHandler);
};

// Main initialization block for the DOM
$(() => {
    "use strict";

    // Fetch initial device firmware details upon page load
    fetchDeviceFirmwareDetails();

    // Setup the primary system management dialog
    const systemManagementPanel = $('#system-management-dialog');
    if (systemManagementPanel.length) { // Ensure the element exists
        systemManagementPanel.dialog({
            autoOpen: false,
            title: 'System Management Console',
            height: 900, // Adjusted height
            width: 1100, // Adjusted width
            modal: true, // Added modal behavior for focus
            closeOnEscape: true
        }).tabs();

        // Make the panel visible after jQuery UI initialization
        systemManagementPanel.css("visibility", "visible");
    } else {
        console.warn('System management dialog element not found. Skipping initialization.');
    }


    // Configure the button to open the system management dialog
    $("button#system-control-btn").button({
        icons: { primary: "ui-icon-gear" } // Changed icon
    }).on('click', () => {
        systemManagementPanel.dialog("open");
    });

    // Event handler for setting the polling frequency
    $("button#set-polling-frequency").button({
        icons: { primary: "ui-icon-disk" }
    }).on('click', () => {
        const intervalValue = $("select#polling-frequency-selector").val();
        if (intervalValue) {
            $.ajax({
                url: 'socketmessage.php',
                type: 'POST',
                data: {
                    messageType: "pollingInterval", // Changed message type
                    message: String(intervalValue)
                }
            });
        } else {
            console.warn('No polling frequency selected.');
        }
    });

    // Event handler for updating the profile name
    $("button.update-profile-label-btn").button({
        icons: { primary: "ui-icon-check" }
    }).on('click', () => {
        const profileLabel = $("input#profile-label-input").val();
        if (profileLabel) {
            $.ajax({
                url: 'socketmessage.php',
                type: 'POST',
                data: {
                    messageType: "profileIdentifier", // Changed message type
                    message: profileLabel
                }
            });
        } else {
            console.warn('Profile label cannot be empty.');
        }
    });

    // Event handler for updating the date/time display format
    $("button.update-date-time-format-btn").button({
        icons: { primary: "ui-icon-check" }
    }).on('click', () => {
        const formatValue = $("#display-date-time-format").val();
        if (formatValue) {
            $.ajax({
                url: 'socketmessage.php',
                type: 'POST',
                data: {
                    messageType: "displayDateTimeFormat", // Changed message type
                    message: formatValue
                }
            });
        } else {
            console.warn('Date/time format cannot be empty.');
        }
    });

    // Handler for advanced configuration settings
    $("#advanced-configuration-section").find(".dispatch-config-btn").button({
        icons: { primary: "ui-icon-arrowthick-1-e" } // Changed icon
    }).on('click', function() {
        const parentContainer = $(this).parent();
        let payloadData = null;
        let configKey = null;
        let configValue = null;

        // Determine if the control is a select or input
        const selectElement = parentContainer.find("select");
        const inputElement = parentContainer.find("input");

        if (selectElement.length) {
            configKey = selectElement.attr("name");
            configValue = selectElement.val();
            // Validate value for select
            if (configValue === null || configValue === undefined || configValue === '') {
                console.warn(`Configuration for '${configKey}' is empty.`);
                return;
            }
            payloadData = JSON.stringify({ [configKey]: configValue });
        } else if (inputElement.length) {
            configKey = inputElement.attr("name");
            configValue = inputElement.val();
            // Validate value for input (allow empty strings for some cases, but generally check)
            if (configValue === null || configValue === undefined) {
                console.warn(`Configuration for '${configKey}' is invalid.`);
                return;
            }
            // Attempt to parse as number if possible, otherwise keep as string
            const parsedValue = isNaN(Number(configValue)) ? configValue : Number(configValue);
            payloadData = JSON.stringify({ [configKey]: parsedValue });
        } else {
            console.warn('No configurable element found in parent container.');
            return;
        }

        $.ajax({
            url: 'socketmessage.php',
            type: 'POST',
            data: {
                messageType: "updateDeviceParameters", // Generic message type for advanced settings
                message: payloadData
            },
            success: (response) => {
                console.log('Advanced setting updated:', response);
                // Specific action for temperature unit update
                if (configKey === "temperatureUnit") {
                    // If temperature unit is updated, reload relevant settings in new format
                    reacquireDeviceConstants();
                    reacquireDeviceSettings();
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error('Error updating advanced setting:', textStatus, errorThrown);
                alert('Failed to update setting. Please check server logs.');
            }
        });
    });

    // Bind actions for Device Constants
    bindCommonActions(".device-constants", receiveDeviceConstants, reacquireDeviceConstants, loadDefaultDeviceConstants);

    // Bind actions for Device Settings
    bindCommonActions(".device-settings", receiveDeviceSettings, reacquireDeviceSettings, loadDefaultDeviceSettings);

    // Bind actions for Device Variables
    // Note: No 'load defaults' for variables as they are dynamic
    $(".device-variables.retrieve-from-client").button({
        icons: { primary: "ui-icon-arrowthickstop-1-s" }
    }).on('click', receiveDeviceVariables);
    $(".device-variables.sync-from-device").button({
        icons: { primary: "ui-icon-refresh" }
    }).on('click', reacquireDeviceVariables);


    // Button for manual log refresh
    $("#manual-log-refresh-btn").button({
        icons: { primary: "ui-icon-refresh" }
    }).on('click', () => {
        updateLogDisplay(true, true); // Refresh both stdout and stderr
    });

    // Button to toggle automatic log refreshing
    const autoLogRefreshButton = $("button#toggle-auto-log-refresh");
    autoLogRefreshButton.button({
        icons: { primary: "ui-icon-refresh" }
    }).on('click', function() {
        const currentButton = $(this);
        const refreshIntervalMs = 7000; // Slightly increased interval
        const shouldRefreshOutput = true;
        const shouldRefreshError = true;

        if (currentButton.hasClass('ui-state-default')) {
            // Enable auto-refresh
            initiateLogAutoRefresh(refreshIntervalMs, shouldRefreshOutput, shouldRefreshError);
            updateUiButtonState(currentButton, true, 'Enable auto-refresh', 'Disable auto-refresh');
        } else {
            // Disable auto-refresh
            if (window.logRefreshTimerId) {
                window.clearInterval(window.logRefreshTimerId);
                window.logRefreshTimerId = null; // Clear the timer ID
            }
            updateUiButtonState(currentButton, false, 'Enable auto-refresh', 'Disable auto-refresh');
        }
    });

    // Button to clear system logs
    $("#clear-system-logs").button({
        icons: { primary: "ui-icon-trash" }
    }).on('click', () => {
        if (confirm('Are you sure you want to permanently erase all system logs? This action cannot be undone.')) {
            $.ajax({
                url: 'socketmessage.php',
                type: 'POST',
                data: {
                    messageType: "eraseAllLogs", // Changed message type
                    message: ""
                },
                success: () => {
                    console.log('System logs erased successfully.');
                    updateLogDisplay(true, true); // Refresh logs after erasing
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.error('Error erasing logs:', textStatus, errorThrown);
                    alert('Failed to erase logs. Check server status.');
                }
            });
        }
    });

    // Button for initiating firmware flash
    $("input#flash-firmware-btn").button({
        icons: { primary: "ui-icon-arrowthickstop-1-n" }
    }).on('click', () => {
        const firmwareFile = $("#firmware-flash-tab input[type='file']").val();
        if (!firmwareFile) {
            alert('Please select a firmware file to flash.');
            return;
        }
        // Start auto-refreshing stderr for programming progress
        initiateLogAutoRefresh(3000, false, true, '#firmware-flash-tab'); // Only stderr, slightly faster refresh
        $("#flash-status-header").text("Initiating firmware flash... Monitor the output below for progress and status.");
    });
});

// Configuration mapping for different device types
const deviceConfigurationMap = {
    "spark-core": {
        moniker: "Spark Core",
        fileType: "BIN"
    },
    "photon": {
        moniker: "Photon",
        fileType: "BIN"
    },
    "esp32": { // Added a new device type
        moniker: "ESP32 Dev Board",
        fileType: "ELF"
    }
    // Add more device types as needed
};

/**
 * Updates the UI elements based on the detected device type.
 * @param {string} deviceIdentifier The identifier string for the device (e.g., "spark-core").
 */
function configureDeviceDisplay(deviceIdentifier) {
    const deviceDetails = deviceConfigurationMap[deviceIdentifier];
    const targetElement = $("#firmware-flash-tab .device-type-input");

    if (targetElement.length) {
        targetElement.val(deviceIdentifier);
    } else {
        console.warn('Device type input element not found.');
    }

    if (deviceDetails) {
        $(".device-moniker").text(deviceDetails.moniker);
        $(".firmware-file-type").text(deviceDetails.fileType);
    } else {
        $(".device-moniker").text("Unknown Device");
        $(".firmware-file-type").text("N/A");
        console.warn(`Unknown device identifier: ${deviceIdentifier}`);
    }
}

/**
 * Applies the received device firmware details to the global state and UI.
 * @param {object} deviceInfo An object containing device firmware information.
 */
function applyDeviceFirmwareDetails(deviceInfo) {
    if (!deviceInfo || typeof deviceInfo !== 'object') {
        console.error('Invalid device information received.');
        return;
    }
    // Assign to the global variable
    window.deviceFirmwareInfo = deviceInfo;

    // Update UI if board information is available
    if (deviceInfo.board && deviceInfo.board !== null) {
        configureDeviceDisplay(deviceInfo.board);
    } else {
        console.info('No specific board identifier found in device info.');
        // Optionally, reset device display to a default state
        configureDeviceDisplay('unknown');
    }
}

/**
 * Fetches the latest device firmware version from the server.
 */
function fetchDeviceFirmwareDetails() {
    $.ajax({
        url: 'socketmessage.php',
        type: 'POST',
        data: {
            messageType: "getDeviceVersion", // Changed message type
            message: ""
        },
        dataType: "json", // Expect JSON response
        success: (firmwareData) => {
            applyDeviceFirmwareDetails(firmwareData);
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error('Failed to fetch device firmware details:', textStatus, errorThrown);
            // Optionally, display an error message in the UI
        }
    });
}

/**
 * Helper function to update a specific log stream (stdout or stderr).
 * @param {jQuery} $logDiv The jQuery object for the log div.
 * @param {string} newContent The new HTML content for the log div.
 */
const _updateLogStreamContent = ($logDiv, newContent) => {
    const domElement = $logDiv[0];
    const scrollThreshold = 50; // Pixels from bottom to consider "scrolled down"

    // Check if the user was scrolled near the bottom before update
    const wasScrolledToBottom = (domElement.scrollHeight - domElement.scrollTop - domElement.clientHeight) < scrollThreshold;

    // Check if the div was initially empty or very short
    const wasInitiallyShort = $logDiv.text().length < 50; // Arbitrary length threshold

    $logDiv.html(newContent || ""); // Update content, default to empty string if null/undefined

    // If it was scrolled to bottom or was short, scroll to new bottom
    if (wasScrolledToBottom || wasInitiallyShort) {
        domElement.scrollTop = domElement.scrollHeight;
    }
};

/**
 * Refreshes the log display by fetching new data from the server.
 * @param {boolean} fetchOutput True to refresh standard output.
 * @param {boolean} fetchError True to refresh standard error.
 */
function updateLogDisplay(fetchOutput, fetchError) {
    "use strict";
    // Construct URL based on refresh flags
    const apiUrl = `getLogs.php?stdout=${fetchOutput ? '1' : '0'}&stderr=${fetchError ? '1' : '0'}`;

    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json', // Expect JSON response
        success: (logData) => {
            if (!logData) {
                console.warn('Received empty log data from server.');
                return;
            }

            // Update error stream if requested
            if (fetchError) {
                $('div.error-stream-output').each((_index, element) => {
                    _updateLogStreamContent($(element), logData.stderr);
                });
            }

            // Update standard output stream if requested
            if (fetchOutput) {
                $('div.standard-stream-output').each((_index, element) => {
                    _updateLogStreamContent($(element), logData.stdout);
                });
            }
        },
        error: (jqXHR, textStatus, errorThrown) => {
            console.error('Failed to retrieve logs:', textStatus, errorThrown);
            // Optionally, display an error in the log area itself
            $('div.error-stream-output').html(`<p style="color: red;">Error fetching logs: ${textStatus}</p>`);
        }
    });
}

let logRefreshTimerId = null; // Renamed global timer ID

/**
 * Initiates automatic refreshing of log displays at a specified interval.
 * @param {number} refreshRateMs The interval in milliseconds for refreshing.
 * @param {boolean} refreshStdOutput True to refresh standard output.
 * @param {boolean} refreshStdError True to refresh standard error.
 * @param {string} [contextSelector] An optional selector to indicate the context of refresh (e.g., which tab).
 */
function initiateLogAutoRefresh(refreshRateMs, refreshStdOutput, refreshStdError, contextSelector = '') {
    "use strict";

    // Clear any existing timer to prevent multiple intervals
    if (logRefreshTimerId !== null) {
        window.clearInterval(logRefreshTimerId);
        logRefreshTimerId = null;
    }

    if (refreshRateMs <= 0) {
        console.warn('Refresh rate must be a positive number. Auto-refresh not started.');
        return;
    }

    // Perform an immediate refresh
    updateLogDisplay(refreshStdOutput, refreshStdError);

    // Set up the recurring interval
    logRefreshTimerId = window.setInterval(() => {
        console.log(`Auto-refreshing logs (context: ${contextSelector || 'global'})`);
        updateLogDisplay(refreshStdOutput, refreshStdError);
    }, refreshRateMs);

    console.log(`Auto-refresh started with interval: ${refreshRateMs}ms`);
}

// Handler to stop auto-refreshing logs when switching tabs
$("#system-management-dialog").on("tabsactivate", (_event, ui) => {
    "use strict";
    // Check if the activated tab is NOT the logs tab, or if it's the logs tab but auto-refresh was not explicitly enabled there.
    // For simplicity, we just stop auto-refresh on any tab switch.
    if (logRefreshTimerId !== null) {
        window.clearInterval(logRefreshTimerId);
        logRefreshTimerId = null; // Ensure the timer ID is reset

        // Update the auto-refresh button state
        const autoRefreshButton = $('button#toggle-auto-log-refresh');
        if (autoRefreshButton.length) {
            updateUiButtonState(autoRefreshButton, false, 'Enable auto-refresh', 'Disable auto-refresh');
        }
    }
    console.log('Auto-refresh for logs stopped due to tab switch.');
});


// Functions called from the firmware flashing backend (e.g., programArduino.php)

/**
 * Displays an error message related to the firmware flashing process.
 * @param {string} errorMessage The error message to display.
 */
function handleFlashError(errorMessage) {
    "use strict";
    window.alert(`Firmware Flash Error: ${errorMessage}`);
    $("#flash-status-header").text("Firmware flash failed!");
    // Ensure auto-refresh is stopped on error
    if (logRefreshTimerId !== null) {
        window.clearInterval(logRefreshTimerId);
        logRefreshTimerId = null;
    }
}

/**
 * Notifies the user that the firmware flashing process has completed successfully.
 */
function notifyFlashSuccess() {
    "use strict";
    $("#flash-status-header").text("Firmware flash completed successfully!");
    // Stop auto-refresh once done
    if (logRefreshTimerId !== null) {
        window.clearInterval(logRefreshTimerId);
        logRefreshTimerId = null;
    }
    // Optionally, refresh device details
    fetchDeviceFirmwareDetails();
}

/**
 * Alerts the user that the firmware flashing process encountered an issue.
 */
function alertFlashFailure() {
    "use strict";
    $("#flash-status-header").text("Firmware flash encountered an issue! Please review the logs for details.");
    // Stop auto-refresh on failure
    if (logRefreshTimerId !== null) {
        window.clearInterval(logRefreshTimerId);
        logRefreshTimerId = null;
    }
}