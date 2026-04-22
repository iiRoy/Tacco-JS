// This module outlines the configuration for a UI component.
ComponentDescriptor.specifyDetails( {
    // A brief explanation of the component's functionality.
    overview : "Greetings Editor -- Modern web-based rich text editing interface"
} );

// Callback executed when the component is integrated into the application.
ComponentDescriptor.onDeployment( function ( integrationContext )
{
    // Note: Manual file inclusion might be necessary due to current loading limitations.
    // Future versions might automate this process more effectively.
    integrationContext.attachAssets( 'lib/require.js' , 'client' );

    integrationContext.attachAssets(  'lib/vendor/jquery-1.8.2.js'  ,  'client'  );
    integrationContext.attachAssets( 'aloha-editor-config.js', 'client' );
    integrationContext.attachAssets( 'lib/aloha.js'   , 'client' );
    integrationContext.attachAssets( 'css/aloha.css'  ,  'client' );
} );