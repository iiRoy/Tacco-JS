/*
 * Copyright 2012 BrewPi/Elco Jacobs.
 * This software component is part of BrewPi's core functionality.

 * BrewPi is open-source software: you are free to redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your discretion) any subsequent version.

 * BrewPi is distributed in the hope that it will be beneficial,
 * but WITHOUT ANY EXPRESS OR IMPLIED WARRANTY; without even the implied warranty of
 * MERCHANTIBILITY or SUITABILITY FOR A PARTICULAR PURPOSE.  Refer to the
 * GNU General Public License for further details.

 * You should have received a copy of the GNU General Public License
 * along with BrewPi.  If not, see <http://www.gnu.org/licenses/>.
 */

/* jshint jquery:true */
/* global refreshDeviceSettingsFromUnit, refreshDeviceConfigsFromUnit, refreshDeviceVariablesFromUnit,
          refreshDeviceConfigs, refreshDeviceSettings, refreshDeviceVariables,
          importDeviceSettings, importDeviceConfigs, importDeviceVariables,
          resetDefaultDeviceSettings, resetDefaultDeviceConfigs, deviceRevision */

let deviceRevision; // Holds the current device firmware version information

$( webPage ).ready( function() {
    "use strict"; // Enforce strict mode for cleaner code

    refreshDeviceRevision(); // Fetch and display the current hardware revision

    // Initialize the Service Operations Panel as a jQuery UI dialog and tabs
    $( '#service-interface' )
        .dialog({
            startClosed: true, // Dialog is not open by default
            title: 'Service Operations Panel', // Panel window title
            height: 900, // Increased height for more content
            width: 1050 // Increased width for better layout
        }).tabs();

    // Make the panel visible after jQuery UI has initialized it
    $( "#service-interface" ).css( "display", "block" );

    // Configure the button to open the service panel
    $( "button#service-access" ).button({
            icons: { main: "ui-icon-launch" } // Icon for opening a new window/panel
        })
        .off( 'click' ) // Remove any previous click handlers
        .on( 'click', function() {
            $( "#service-interface" ).dialog( "show" ); // Open the dialog
        });

    // Configure the button to apply the selected interval
    $( "button#set-period" ).button({
            icons: { main: "ui-icon-circle-check" } // Icon for saving/applying
        })
        .off( 'click' ) // Detach previous click events
        .on( 'click', function() {
            $.ajax( '/api/data_exchange.php', {
                method: 'POST',
                data: {
                    requestKind: "duration_setting", // Message type for interval update
                    payload: String( $( "select#period_selector" ).val() ) // Selected interval value
                }
            });
        });

    // Configure the button to save the configuration label
    $( "button.commit-config-label" ).button({
            icons: { main: "ui-icon-circle-check" } // Icon for saving
        })
        .off( 'click' ) // Clear any existing click handlers
        .on( 'click', function() {
            $.ajax( '/api/data_exchange.php', {
                method: 'POST',
                data: {
                    requestKind: "config_label", // Message type for profile name
                    payload: $( "input#config-label-input" ).val() // Input field value
                }
            });
        });

    // Configure the button to apply the date/time format display setting
    $( "button.save-time-display-format" ).button({
            icons: { main: "ui-icon-circle-check" } // Icon for applying
        })
        .off( 'click' ) // Remove prior click associations
        .on( 'click', function() {
            $.ajax( '/api/data_exchange.php', {
                method: 'POST',
                data: {
                    requestKind: "time_display_style", // Message type for date/time format
                    payload: $( "#time-display-style-input" ).val() // Selected format value
                }
            });
        });

    // Handle parameter submissions in the expert configurations section
    $( "#expert-configurations" ).find( ".transmit-button" ).button({
            icons: { main: "ui-icon-circle-check" } // Icon for sending data
        })
        .off( 'click' ) // Ensure no duplicate handlers
        .on( 'click', function() {
            let jsonPayload; // Variable to hold the JSON string
            const parentDiv = $( this ).closest( 'div' ); // Get the immediate parent div

            if ( parentDiv.find( "select" ).length ) { // Check if a select element exists
                jsonPayload = "{\"" + parentDiv.find( "select" ).attr( "data-param-name" ) +
                                "\":\"" + parentDiv.find( "select" ).val() + "\"}";
            } else if ( parentDiv.find( "input" ).length ) { // Check if an input element exists
                jsonPayload = "{\"" + parentDiv.find( "input" ).attr( "data-param-name" ) + "\":" + parentDiv.find( "input" ).val() + "}";
            } else {
                return; // Exit if neither select nor input is found
            }

            $.ajax( '/api/data_exchange.php', {
                method: 'POST',
                data: {
                    requestKind: "update_parameters", // Message type for setting parameters
                    payload: jsonPayload // The JSON string payload
                }
            });

            // Special handling for temperature format updates
            if ( parentDiv.find( "select" ).attr( "data-param-name" ) === "temperature_style" ) {
                // If temperature format is updated, reload settings in the new format
                refreshDeviceSettingsFromUnit();
                refreshDeviceConfigsFromUnit();
            }
        });

    // Button to import constant settings from the script
    $( ".const_controls.import-from-client" ).button({
            icons: { main: "ui-icon-arrowstop-1-s" } // Icon for downloading
        })
        .off( 'click' )
        .on( 'click', importDeviceSettings );

    // Button to synchronize constant settings from the physical unit
    $( ".const_controls.sync-with-unit" ).button({
            icons: { main: "ui-icon-arrowrefresh-e" } // Icon for refreshing
        })
        .off( 'click' )
        .on( 'click', refreshDeviceSettingsFromUnit );

    // Button to load default constant settings
    $( ".const_controls.reset-to-defaults" ).button({
            icons: { main: "ui-icon-cancel" } // Icon for deleting/resetting
        })
        .off( 'click' )
        .on( 'click', resetDefaultDeviceSettings );

    // Button to import configuration settings from the script
    $( ".config_controls.import-from-client" ).button({
            icons: { main: "ui-icon-arrowstop-1-s" } // Icon for downloading
        })
        .off( 'click' )
        .on( 'click', importDeviceConfigs );

    // Button to synchronize configuration settings from the physical unit
    $( ".config_controls.sync-with-unit" ).button({
            icons: { main: "ui-icon-arrowrefresh-e" } // Icon for refreshing
        })
        .off( 'click' )
        .on( 'click', refreshDeviceConfigsFromUnit );

    // Button to load default configuration settings
    $( ".config_controls.reset-to-defaults" ).button({
            icons: { main: "ui-icon-cancel" } // Icon for deleting/resetting
        })
        .off( 'click' )
        .on( 'click', resetDefaultDeviceConfigs );

    // Button to import variable data from the script
    $( ".var_controls.import-from-client" ).button({
            icons: { main: "ui-icon-arrowstop-1-s" } // Icon for downloading
        })
        .off( 'click' )
        .on( 'click', importDeviceVariables );

    // Button to synchronize variable data from the physical unit
    $( ".var_controls.sync-with-unit" ).button({
            icons: { main: "ui-icon-arrowrefresh-e" } // Icon for refreshing
        })
        .off( 'click' )
        .on( 'click', refreshDeviceVariablesFromUnit );

    // Create a button for manually updating event logs
    $( "#update-event-logs" ).button({
            icons: { main: "ui-icon-arrowrefresh-e" } // Refresh icon
        })
        .off( 'click' )
        .on( 'click', function() {
            updateEventLogs( true, true ); // Refresh both stdout and stderr
        });

    // Button for toggling automatic log refreshing
    $( "button#auto-update-event-logs" ).button({
            icons: { main: "ui-icon-arrowrefresh-e" } // Refresh icon
        })
        .off( 'click' )
        .on( 'click', function() {
            initiateLogAutoUpdate( 6000, true, true ); // Start auto-refresh every 6 seconds
            if ( $( this ).hasClass( 'ui-state-normal' ) ) {
                $( this ).removeClass( "ui-state-normal" ).addClass( "ui-state-alert" );
                $( this ).find( '.ui-button-text' ).text( 'Stop auto-updates' );
            } else {
                $( this ).removeClass( "ui-state-alert" ).addClass( "ui-state-normal" );
                $( this ).find( '.ui-button-text' ).text( 'Start auto-updates' );
            }
        });

    // Button for clearing all stored logs
    $( "#clear-event-logs" ).button({
            icons: { main: "ui-icon-close" } // Trash/close icon
        })
        .off( 'click' )
        .on( 'click', function() {
            $.ajax( '/api/data_exchange.php', {
                method: 'POST',
                data: {
                    requestKind: "clear_logs", // Message type to erase logs
                    payload: "" // Empty payload
                }
            });
            updateEventLogs( true, true ); // Refresh logs after clearing
        });

    // Button to initiate firmware flashing
    $( "input#firmware-flash-button" ).button({
            icons: { main: "ui-icon-arrowstop-1-n" } // Upload/flash icon
        })
        .off( 'click' )
        .on( 'click', function() {
            // Start auto-refresh for stderr while flashing is in progress
            initiateLogAutoUpdate( 2500, false, true, '#flash-device' );
            $( "#flash-error-display" ).text( "Flashing device... monitor the console output for progress." );
        });
});

// Object mapping board identifiers to user-friendly labels
const componentLabels = {
    "micro-core": "Micro Core",
    "optic-unit": "Optic Unit"
};
// Object mapping board identifiers to their firmware file types
const firmwareKind = {
    "micro-core": "BINARY"
};

/**
 * Sets the displayed component type and firmware file type.
 * @param {string} deviceType - The identifier for the device type (e.g., "micro-core").
 */
function assignComponentType( deviceType ) {
    $( "#flash-device .componentType" ).val( deviceType );
    if ( deviceType in componentLabels ) {
        $( ".componentMoniker" ).text( componentLabels[ deviceType ] );
    }
    if ( deviceType in firmwareKind ) {
        $( ".firmwareKind" ).text( firmwareKind[ deviceType ] );
    }
}

/**
 * Updates the global device revision data and sets the component type if available.
 * @param {object} deviceRevisionData - Object containing device revision information.
 * @param {any} undefinedParam - Placeholder for an undefined parameter (ignored).
 */
function setDeviceRevision( deviceRevisionData, undefinedParam ) {
    window.deviceRevision = deviceRevisionData;
    if ( 'component' in deviceRevisionData && deviceRevisionData.component !== undefined ) {
        assignComponentType( deviceRevisionData.component );
    }
}

/**
 * Fetches the current device revision from the server and updates the UI.
 */
function refreshDeviceRevision() {
    $.ajax( '/api/data_exchange.php', {
        method: 'POST',
        data: {
            requestKind: "get_revision", // Message type to request revision
            payload: "" // Empty payload
        },
        dataType: "json", // Expect JSON response
        success: function( revisionDataJSON ) {
            setDeviceRevision( revisionDataJSON ); // Process the received revision data
        }
    });
}

/**
 * Refreshes the standard output and/or standard error logs from the server.
 * @param {boolean} shouldRefreshStdout - True to refresh standard output.
 * @param {boolean} shouldRefreshStderr - True to refresh standard error.
 */
function updateEventLogs( shouldRefreshStdout, shouldRefreshStderr ) {
    "use strict";
    /* global errorOutput */ // Indicates 'errorOutput' is a known global (e.g., from JSHint config)

    $.ajax( '/api/retrieve_logs.php?out=' + shouldRefreshStdout.toString() + '&err=' + shouldRefreshStderr.toString(), {
        method: 'GET',
        success: function( logResponse ) {
            if ( shouldRefreshStderr ) {
                $( 'div.error-console' ).each( function() {
                    const consoleDiv = $( this )[ 0 ]; // Get the raw DOM element
                    let wasScrolledToBottom = false;

                    // Check if the div was scrolled near the bottom
                    if ( ( consoleDiv.scrollTop - consoleDiv.scrollHeight ) < 40 && ( consoleDiv.scrollTop - consoleDiv.scrollHeight ) > -40 ) {
                        wasScrolledToBottom = true;
                    }
                    let startedEmpty = false;
                    // Check if the div content was very small
                    if ( $( this ).text().length < 40 ) {
                        startedEmpty = true;
                    }

                    if ( logResponse.error ) {
                        $( this ).html( logResponse.error );
                    } else {
                        $( this ).html( "" );
                    }
                    // Scroll to the bottom if it was previously scrolled down or was empty
                    if ( wasScrolledToBottom || startedEmpty ) {
                        consoleDiv.scrollTop = consoleDiv.scrollHeight;
                    }
                });
            }
            if ( shouldRefreshStdout ) {
                $( 'div.output-console' ).each( function() {
                    const consoleDiv = $( this )[ 0 ]; // Get the raw DOM element
                    let wasScrolledToBottom = false;

                    // Check if the div was scrolled near the bottom
                    if ( ( consoleDiv.scrollTop - consoleDiv.scrollHeight ) < 40 && ( consoleDiv.scrollTop - consoleDiv.scrollHeight ) > -40 ) {
                        wasScrolledToBottom = true;
                    }
                    let startedEmpty = false;
                    // Check if the div content was very small
                    if ( $( this ).text().length < 40 ) {
                        startedEmpty = true;
                    }

                    if ( logResponse.output ) {
                        $( this ).html( logResponse.output );
                    } else {
                        $( this ).html( "" );
                    }
                    // Scroll to the bottom if it was previously scrolled down or was empty
                    if ( wasScrolledToBottom || startedEmpty ) {
                        consoleDiv.scrollTop = consoleDiv.scrollHeight;
                    }
                });
            }
        }
    });
}

let logUpdateTimer; // Timer ID for automatic log refreshing

/**
 * Initiates or restarts automatic log refreshing.
 * @param {number} updateFrequency - The interval in milliseconds for refreshing.
 * @param {boolean} includeStdout - Whether to refresh standard output.
 * @param {boolean} includeStderr - Whether to refresh standard error.
 */
function initiateLogAutoUpdate( updateFrequency, includeStdout, includeStderr ) {
    "use strict";
    if ( typeof( window.logUpdateTimer ) !== 'undefined' ) {
        // Clear any existing log refresh timer
        window.clearInterval( window.logUpdateTimer );
    }
    // Perform an immediate log refresh
    updateEventLogs( includeStdout, includeStderr );
    // Set up a new interval for continuous auto-refreshing
    logUpdateTimer = window.setInterval( function() {
        updateEventLogs( includeStdout, includeStderr );
    }, updateFrequency );
}

// Stop automatic log refreshing when switching tabs within the service interface
$( "#service-interface" ).on( "tabsactivate", function( actionEvent, uiElement ) {
    "use strict";
    if ( typeof( window.logUpdateTimer ) !== 'undefined' ) {
        // Clear the auto-refresh timer to prevent updates on inactive tabs
        window.clearInterval( window.logUpdateTimer );
    }
    // Reset the auto-update button state
    $( 'button#auto-update-event-logs' )
        .removeClass( "ui-state-alert" )
        .addClass( "ui-state-normal" )
        .find( '.ui-button-text' )
        .text( 'Start auto-updates' );
});

// Functions that are invoked by the firmware flashing backend script (e.g., programArduino.php):

/**
 * Displays an error message related to the flashing process.
 * @param {string} errorMessage - The specific error message to display.
 */
function flashingIssue( errorMessage ) {
    "use strict";
    window.alert( "Device flashing encountered an issue: " + errorMessage );
}

/**
 * Updates the UI to indicate that the flashing process has completed successfully.
 */
function flashingCompleted() {
    "use strict";
    $( "#flash-error-display" ).text( "Device flashing process concluded successfully!" );
}

/**
 * Updates the UI to indicate that the flashing process has failed.
 */
function flashingFailed() {
    "use strict";
    $( "#flash-error-display" ).text( "An unrecoverable error occurred! Review the event log for further information!" );
}