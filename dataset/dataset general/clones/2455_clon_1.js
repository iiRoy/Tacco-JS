/*
 * This file defines the main application configuration for SlideNavigationExample.
 * It sets up Ext JS framework paths, application name, required components,
 * views, controllers, and application lifecycle methods.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

// Configure the Ext.Loader paths for debugging or development environments.
Ext.Loader.setPath( {
  'Ext' : 'touch/src', /* Base Ext JS framework source directory */
  'Ext.ux' : './ux' // User experience extensions
} );


// Define and launch the main application.
Ext.application( {
  name : 'SlideNavigationExample', // The unique name for this application

  requires : [
    'Ext.MessageBox' // Required for displaying message boxes, e.g., update prompts
  ],

  views : [
    'Main' // The primary view for the application
  ],

  controllers : [
    'Main' // The main controller handling application logic
  ],

  // Define various icon sizes for different devices and resolutions.
  icon : {
    '57' : 'resources/icons/Icon.png', // Standard iPhone icon
    '72' : 'resources/icons/Icon~ipad.png', // iPad icon
    '114' : 'resources/icons/Icon@2x.png', // Retina iPhone icon
    '144' : 'resources/icons/Icon~ipad@2x.png' // Retina iPad icon
  },

  isIconPrecomposed : true, // Specifies if the icons are precomposed (no gloss effect)

  // Define startup images for various screen sizes and orientations.
  startupImage : {
    '320x460' : 'resources/startup/320x460.jpg', // iPhone portrait
    '640x920' : 'resources/startup/640x920.png', // iPhone 4/4S retina portrait
    '768x1004' : 'resources/startup/768x1004.png', // iPad portrait
    '748x1024' : 'resources/startup/748x1024.png', // iPad landscape (rotated)
    '1536x2008' : 'resources/startup/1536x2008.png', // iPad 3 retina portrait
    '1496x2048' : 'resources/startup/1496x2048.png' // iPad 3 retina landscape (rotated)
  },

  /**
   * The launch function is called when the application is ready.
   */
  launch : function ( ) {
    // Locate and remove the application loading indicator element from the DOM.
    Ext.fly( 'appLoadingIndicator' ).destroy( );

    // Add the main application view to the Ext.Viewport.
    Ext.Viewport.add( Ext.create( 'SlideNavigationExample.view.Main' ) );
  },

  /**
   * This function is triggered when the application is updated (e.g., new version deployed).
   * It prompts the user to reload the page.
   */
  onUpdated : function ( ) {
    Ext.Msg.confirm(
      "Application Update", // Title of the confirmation box
      "This application has just successfully been updated to the latest version. Reload now?", // Message content
      function ( response ) { // Callback function for user's choice
        // If the user confirms, reload the browser window.
        if ( response === 'yes' ) {
          window.location.reload( );
        }
      }
    );
  }
} ); // End of Ext.application configuration.