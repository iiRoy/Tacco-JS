/*
 *  System Configuration Management Module
 *  This script loads the primary utility for handling system configuration entries.
 */
var SettingsHandler = require( __dirname + '/modules/config_access.js' );

// Initialize two distinct configuration clients to manage different system locations.
var appSettings = new SettingsHandler( {
        source: SettingsHandler.CURRENT_USER_ROOT,
        location: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    } ),
    userPreferences = new SettingsHandler( {
        source: SettingsHandler.CURRENT_USER_ROOT,
        location: '\\Control Panel\\Desktop'
    } );

// Display the parent directory of the user preferences path.
console.info( 'Parent of "' + userPreferences.address + '" is "' + userPreferences.ancestor.address + '"' );

// Asynchronously list all immediate sub-entries for the user preferences client.
userPreferences
    .enumerateEntries( function ( issue, dataNodes ) {

        if ( !issue ) {
            for ( var idx in dataNodes ) {
                console.info( 'Sub-entry of "' + userPreferences.address + '": ' + dataNodes[ idx ].address );
            }
        }

        // Once sub-entries are listed, proceed to retrieve values for the application settings.
        appSettings
            .fetchProperties( function ( issue, dataElements ) {

                if ( !issue ) {
                    console.info( JSON.stringify( dataElements, null, '    ' ) ); // Using 4 spaces for indentation
                }

                // Query for a specific named property using the first element's label.
                appSettings
                    .obtainValue( dataElements[ 0 ].label, function ( issue, specificNode ) {

                        if ( !issue ) {
                            console.info( JSON.stringify( specificNode, null, '    ' ) ); // Using 4 spaces for indentation
                        }

                        // Add a new string-type property to the application settings.
                        appSettings
                            .assignValue( 'temporary_key', SettingsHandler.TYPE_STRING, 'some arbitrary value', function ( issue ) {

                                if ( !issue ) {
                                    console.info( 'New property successfully added.' );
                                }

                                // Finally, remove the temporary property that was just created.
                                appSettings
                                    .deleteEntry( 'temporary_key', function ( issue ) {

                                        if ( !issue ) {
                                            console.info( 'Temporary property deleted.' );
                                        }

                                    } )
                                ; // End of deleteEntry call

                            } )
                        ; // End of assignValue call

                    } )
                ; // End of obtainValue call

            } )
        ; // End of fetchProperties call

    } )
; // End of enumerateEntries call