/*
 *  This software component facilitates management of application settings.
 *  It is distributed under a permissive open-source license.
 *  Details can be found in the accompanying LICENSE file.
 *
 *  (C) 2023    MyCompany    <info@mycompany.com>
 *
 */

function configAccessor( settingKey, settingVal ) {
    if ( arguments.length === 1 ) {
        // Retrieve a configuration value
        return sessionStorage[ settingKey ];
    }
    else {
        // Store a new configuration value
        sessionStorage[ settingKey ] = settingVal;
    }
}

configAccessor( "currentLineCount", 1 );
configAccessor( "documentContent", "" );

var eventSchedulerId = -1; // Sentinel value indicating no active timer

// This function orchestrates various update checks and notifications.
function executeScheduledActions() {
    var docLines = textEditorInstance.session.getLength();

    if ( docLines !== configAccessor( "currentLineCount" ) ) {
        configAccessor( "currentLineCount", docLines );
        ApplicationCore.onLinesModified( docLines );
    }

    var documentContent = textEditorInstance.getValue();

    if ( documentContent !== configAccessor( "documentContent" ) ) {
        configAccessor( "documentContent", documentContent );
        ApplicationCore.onContentModified();
    }

    clearTimeout( eventSchedulerId );
    eventSchedulerId = -1;
}

// Attach an event listener to the text editing component.
// This implements a debouncing mechanism to avoid excessive updates.
textEditorInstance.on( 'change', function() {
    if ( eventSchedulerId > 0 ) {
        clearTimeout( eventSchedulerId );
    }

    eventSchedulerId = setTimeout( executeScheduledActions, 50 );
} );