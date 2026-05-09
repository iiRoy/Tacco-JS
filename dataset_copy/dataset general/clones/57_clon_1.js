/*
 *  Copyright 2012 BrewPi/Elco Jacobs.
 *  This file is part of BrewPi.
 *
 *  BrewPi is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  BrewPi is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with BrewPi. If not, see <http://www.gnu.org/licenses/>.
 */

/* jshint jquery:true */
/* global reloadControlConstantsFromArduino, reloadControlSettingsFromArduino, reloadControlVariablesFromArduino,
          reloadControlSettings, reloadControlConstants, reloadControlVariables,
          receiveControlConstants, receiveControlSettings, receiveControlVariables,
          loadDefaultControlConstants, loadDefaultControlSettings, controllerVersion */

// Declare a global variable to store the controller's version information.
var controllerVersion;

// Execute code when the DOM is fully loaded and ready for manipulation.
$( document ).ready( function() {
    "use strict"; // Enforce strict mode for cleaner, safer code.

    // Update the controller version information asynchronously.
    updateControllerVersion();

    // Setup the Maintenance Panel dialog and tabs.
    $( '#maintenance-panel' )
        .dialog( {
            autoOpen: false, // Dialog starts closed.
            title: 'Maintenance Panel', // Title bar text for the dialog.
            height: 850, // Fixed height for the dialog.
            width: 1000 // Fixed width for the dialog.
        } )
        .tabs(); // Initialize jQuery UI tabs within the panel.

    // Make the maintenance panel visible after it's been initialized.
    $( "#maintenance-panel" ).css( "visibility", "visible" );

    // Configure the "Maintenance" button: add icon, remove existing click handlers, then add new one.
    $( "button#maintenance" ).button( { icons: { primary: "ui-icon-newwin" } } )
        .unbind( 'click' ) // Ensure no duplicate handlers.
        .click( function() {
            $( "#maintenance-panel" ).dialog( "open" ); // Open the dialog when button is clicked.
        } );

    // Configure the "Apply Interval" button.
    $( "button#apply-interval" ).button( { icons: { primary: "ui-icon-check" } } )
        .unbind( 'click' )
        .click( function() {
            // Send the selected interval value to the server.
            $.post( 'socketmessage.php', { messageType: "interval", message: String( $( "select#interval" ).val() ) } );
        } );

    // Configure the "Apply Profile Name" button.
    $( "button.apply-profile-name" ).button( { icons: { primary: "ui-icon-check" } } )
        .unbind( 'click' )
        .click( function() {
            // Post the new profile name to the backend.
            $.post( 'socketmessage.php', { messageType: "profileName", message: $( "input#profile-name" ).val() } );
        } );

    // Configure the "Apply Date/Time Format Display" button.
    $( "button.apply-datetime-format-display" ).button( { icons: { primary: "ui-icon-check" } } )
        .unbind( 'click' )
        .click( function() {
            // Send the selected date/time format to the server.
            $.post( 'socketmessage.php', { messageType: "dateTimeFormatDisplay", message: $( "#datetime-format-display" ).val() } );
        } );

    // Handle clicks for generic "send" buttons within advanced settings.
    $( "#advanced-settings" ).find( ".send-button" ).button( { icons: { primary: "ui-icon-check" } } )
        .unbind( 'click' )
        .click( function() {
            var jsonString; // Variable to hold the JSON payload.

            // Check if a select element is present as a child.
            if ( $( this ).parent().find( "select" ).length ) {
                jsonString = "{\"" + $( this ).parent().find( "select" ).attr( "name" ) +
                    "\":\"" + $( this ).parent().find( "select" ).val() + "\"}";
            }
            // Otherwise, check for an input element.
            else if ( $( this ).parent().find( "input" ).length ) {
                jsonString = "{\"" + $( this ).parent().find( "input" ).attr( "name" ) + "\":" + $( this ).parent().find( "input" ).val() + "}";
            }
            // If neither select nor input is found, do nothing.
            else {
                return;
            }

            // Send the constructed JSON message to the server.
            $.post( 'socketmessage.php', { messageType: "setParameters", message: jsonString } );

            // If the temperature format was updated, reload relevant settings.
            if ( $( this ).parent().find( "select" ).attr( "name" ) === "tempFormat" ) {
                reloadControlConstantsFromArduino(); // Reload constants.
                reloadControlSettingsFromArduino(); // Reload settings.
            }
        } );

    // Button for receiving Control Constants from script.
    $( ".cc.receive-from-script" ).button( { icons: { primary: "ui-icon-arrowthickstop-1-s" } } )
        .unbind( 'click' )
        .click( receiveControlConstants ); // Attach handler.

    // Button for updating Control Constants from Arduino.
    $( ".cc.update-from-arduino" ).button( { icons: { primary: "ui-icon-refresh" } } )
        .unbind( 'click' )
        .click( reloadControlConstantsFromArduino ); // Attach handler.

    // Button for loading default Control Constants.
    $( ".cc.load-defaults" ).button( { icons: { primary: "ui-icon-trash" } } )
        .unbind( 'click' )
        .click( loadDefaultControlConstants ); // Attach handler.

    // Button for receiving Control Settings from script.
    $( ".cs.receive-from-script" ).button( { icons: { primary: "ui-icon-arrowthickstop-1-s" } } )
        .unbind( 'click' )
        .click( receiveControlSettings ); // Attach handler.

    // Button for updating Control Settings from Arduino.
    $( ".cs.update-from-arduino" ).button( { icons: { primary: "ui-icon-refresh" } } )
        .unbind( 'click' )
        .click( reloadControlSettingsFromArduino ); // Attach handler.

    // Button for loading default Control Settings.
    $( ".cs.load-defaults" ).button( { icons: { primary: "ui-icon-trash" } } )
        .unbind( 'click' )
        .click( loadDefaultControlSettings ); // Attach handler.

    // Button for receiving Control Variables from script.
    $( ".cv.receive-from-script" ).button( { icons: { primary: "ui-icon-arrowthickstop-1-s" } } )
        .unbind( 'click' )
        .click( receiveControlVariables ); // Attach handler.

    // Button for updating Control Variables from Arduino.
    $( ".cv.update-from-arduino" ).button( { icons: { primary: "ui-icon-refresh" } } )
        .unbind( 'click' )
        .click( reloadControlVariablesFromArduino ); // Attach handler.

    // Create the "Refresh Logs" button and attach its click handler.
    $( "#refresh-logs" ).button( { icons: { primary: "ui-icon-refresh" } } )
        .unbind( 'click' )
        .click( function() {
            refreshLogs( 1, 1 ); // Refresh both stdout and stderr.
        } );

    // Setup the "Auto-Refresh Logs" button.
    $( "button#auto-refresh-logs" ).button( { icons: { primary: "ui-icon-refresh" } } )
        .unbind( 'click' )
        .click( function() {
            startRefreshLogs( 5000, 1, 1 ); // Start auto-refresh every 5 seconds.

            // Toggle button state and text.
            if ( $( this ).hasClass( 'ui-state-default' ) ) {
                $( this ).removeClass( "ui-state-default" ).addClass( "ui-state-error" );
                $( this ).find( '.ui-button-text' ).text( 'Disable auto-refresh' );
            } else {
                $( this ).removeClass( "ui-state-error" ).addClass( "ui-state-default" );
                $( this ).find( '.ui-button-text' ).text( 'Enable auto-refresh' );
            }
        } );

    // Configure the "Erase Logs" button.
    $( "#erase-logs" ).button( { icons: { primary: "ui-icon-trash" } } )
        .unbind( 'click' )
        .click( function() {
            $.post( 'socketmessage.php', { messageType: "eraseLogs", message: "" } ); // Send erase command.
            refreshLogs( 1, 1 ); // Refresh logs after erasing.
        } );

    // Configure the "Program Submit" button for Arduino reprogramming.
    $( "input#program-submit-button" ).button( { icons: { primary: "ui-icon-arrowthickstop-1-n" } } )
        .unbind( 'click' )
        .click( function() {
            // Start auto-refreshing stderr during programming.
            startRefreshLogs( 2000, 0, 1, '#reprogram-arduino' );
            $( "#program-stderr-header" ).text( "Programming... keep an eye on the output below to see the progress." );
        } );
} ); // End of document ready function.

// Map board identifiers to display names.
boardNames = { "spark-core": "Spark Core", "photon": "Photon" };
// Map board identifiers to program file types.
programFileType = { "spark-core": "BIN" };

/**
 * Sets the currently selected board type in the UI.
 * @param {string} board - The identifier of the board (e.g., "spark-core").
 */
function setBoard( board ) {
    $( "#reprogram-arduino .boardType" ).val( board ); // Update hidden input field.
    if ( board in boardNames ) {
        $( ".boardMoniker" ).text( boardNames[ board ] ); // Update display name.
    }
    if ( board in programFileType ) {
        $( ".programFileType" ).text( programFileType[ board ] ); // Update program file type display.
    }
}

/**
 * Sets the global controller version and updates board information based on it.
 * @param {object} controllerVersion - Object containing controller version details.
 * @param {any} undefined - Placeholder for undefined, ensuring its value.
 */
function setControllerVersion( controllerVersion, undefined ) {
    window.controllerVersion = controllerVersion; // Store the version globally.
    // If board information is available, update the UI.
    if ( 'board' in controllerVersion && controllerVersion.board !== undefined ) {
        setBoard( controllerVersion.board );
    }
}

/**
 * Asynchronously fetches and updates the controller version from the server.
 */
function updateControllerVersion() {
    // Make an AJAX POST request to get the version.
    $.post( 'socketmessage.php', { messageType: "getVersion", message: "" }, function( controllerVersionJSON ) {
        setControllerVersion( controllerVersionJSON ); // Callback to process the received JSON.
    }, "json" ); // Expect JSON response.
}

/**
 * Refreshes the log displays (stdout and stderr) from the server.
 * @param {number} refreshStdOut - 1 to refresh stdout, 0 otherwise.
 * @param {number} refreshStdErr - 1 to refresh stderr, 0 otherwise.
 */
function refreshLogs( refreshStdOut, refreshStdErr ) {
    "use strict";
    /* global stderr */ // This comment indicates 'stderr' is a global, but it's not actually used here as a global variable.

    // Make an AJAX GET request to fetch log data.
    $.get( 'getLogs.php?stdout=' + refreshStdOut.toString() + '&stderr=' + refreshStdErr.toString(),
        function( response ) {
            // Process stderr logs if requested.
            if ( refreshStdErr ) {
                $( 'div.stderr' ).each( function() {
                    var div = $( this )[ 0 ]; // Get the raw DOM element.
                    var scrolledDown = false;

                    // Check if the div was scrolled near the bottom.
                    if ( ( div.scrollTop - div.scrollHeight ) < 40 && ( div.scrollTop - div.scrollHeight ) > -40 ) {
                        scrolledDown = true;
                    }
                    var wasEmpty = false;
                    if ( $( this ).text().length < 40 ) { // Arbitrary small length check for "empty".
                        wasEmpty = true;
                    }

                    // Update the content.
                    if ( response.stderr ) {
                        $( this ).html( response.stderr );
                    } else {
                        $( this ).html( "" );
                    }

                    // Scroll to bottom if it was previously scrolled down or was empty.
                    if ( scrolledDown || wasEmpty ) {
                        div.scrollTop = div.scrollHeight;
                    }
                } );
            }
            // Process stdout logs if requested.
            if ( refreshStdOut ) {
                $( 'div.stdout' ).each( function() {
                    var div = $( this )[ 0 ]; // Get the raw DOM element for stdout.
                    var scrolledDown = false;

                    // Check scroll position.
                    if ( ( div.scrollTop - div.scrollHeight ) < 40 && ( div.scrollTop - div.scrollHeight ) > -40 ) {
                        scrolledDown = true;
                    }
                    var wasEmpty = false;
                    if ( $( this ).text().length < 40 ) {
                        wasEmpty = true;
                    }

                    // Update the content.
                    if ( response.stdout ) {
                        $( this ).html( response.stdout );
                    } else {
                        $( this ).html( "" );
                    }

                    // Scroll to bottom if needed.
                    if ( scrolledDown || wasEmpty ) {
                        div.scrollTop = div.scrollHeight;
                    }
                } );
            }
        }
    );
}

// Variable to hold the interval ID for auto-refreshing logs.
var refreshLogsInterval;

/**
 * Starts an interval to periodically refresh logs.
 * @param {number} refreshTime - The interval in milliseconds between refreshes.
 * @param {number} refreshStdOut - 1 to refresh stdout, 0 otherwise.
 * @param {number} refreshStdErr - 1 to refresh stderr, 0 otherwise.
 */
function startRefreshLogs( refreshTime, refreshStdOut, refreshStdErr ) {
    "use strict";
    // Clear any existing log refresh timers to prevent duplicates.
    if ( typeof( window.refreshLogsInterval ) !== 'undefined' ) {
        window.clearInterval( window.refreshLogsInterval );
    }

    // Immediately refresh logs once.
    refreshLogs( refreshStdOut, refreshStdErr );

    // Set up the recurring interval for refreshing logs.
    refreshLogsInterval = window.setInterval( function() { refreshLogs( refreshStdOut, refreshStdErr ); }, refreshTime );
}

// Event handler for when a tab is activated within the maintenance panel.
$( "#maintenance-panel" ).on( "tabsactivate", function( event, ui ) {
    "use strict";
    // If there's an active auto-refresh interval, clear it.
    if ( typeof( window.refreshLogsInterval ) !== 'undefined' ) {
        window.clearInterval( window.autoRefreshLogsInterval ); // Note: This might be a typo, should probably be `refreshLogsInterval`.
    }
    // Reset the "Auto-Refresh Logs" button to its default state.
    $( 'button#auto-refresh-logs' ).removeClass( "ui-state-error" ).addClass( "ui-state-default" )
        .find( '.ui-button-text' ).text( 'Enable auto-refresh' );
} );

// --- Functions related to Arduino programming status ---

/**
 * Displays an alert message when a programming error occurs.
 * @param {string} string - The error message to display.
 */
function programmingError( string ) {
    "use strict";
    window.alert( "Error while programming: " + string );
}

/**
 * Updates the programming status header to indicate success.
 */
function programmingDone() {
    "use strict";
    $( "#program-stderr-header" ).text( "Programming done!" );
}

/**
 * Updates the programming status header to indicate failure.
 */
function programmingFailed() {
    "use strict";
    $( "#program-stderr-header" ).text( "Something went wrong! Please check the log for details!" );
}