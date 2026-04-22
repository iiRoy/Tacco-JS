/*
 * This file contains the JavaScript code for the jQuery App Folders Plugin.
 * Version: 0.2
 * Project Website: www.app-folders.com/
 * Author: Stephen Saucier
 * Year: 2013
 * License: MIT License (http://www.opensource.org/licenses/mit-license.php)
 * This plugin allows for dynamic display and management of content folders,
 * mimicking a desktop folder interface within a web page, with various
 * configuration options.
 */

( function ( $ ) {


  $.fn.appFolders = function ( options ) {
    // Merge default settings with user-provided options to create the final configuration.
    var settings = $.extend( {

      opacity: 0.2,                   /* Opacity level for non-selected folder items. */
      marginTopAdjust: false,         /* Flag to enable or disable automatic margin-top adjustment for the folder area. */
      marginTopBase: '0px',           /* The default or base margin-top value when no folder is active or when reset. */
      marginTopFirst: '0px',          /* This setting appears redundant with marginTopBase, consider reviewing. */
      marginTopIncrement: '-100px',   /* The value by which margin-top changes per row when adjustment is enabled. */
      animationSpeed: 200,            /* Duration (in milliseconds) for all animated transitions within the plugin. */
      URLrewrite: false,              /* Boolean indicating if URL rewriting should be utilized. */
      URLbase: "",                    /* If URL rewriting is enabled, this is the base path for the page. */
      internalLinkSelector: '.jaf-internal a', /* A jQuery selector for links that point to content within an App Folder. */
      instaSwitch: false              /* If true, allows instant switching between folder contents without full closure animation. */

    }, options );


    // Iterate over each selected element to apply the plugin functionality.
    return this.each( function () {


      // --- START jQuery App Folders SCRIPT --- //


      // Initially hide all folder content panels.
      var appFolders = $( ".folderContent" ) . hide();


      // Attach a click event handler to all elements with the class 'folder'.
      $( ".folder" ) . click( function ( event ) {


        var openFolder        = $( this ) . attr( 'id' ); /* Get the ID of the clicked folder, which corresponds to the content class. */
        var folderContent     = $( '.folderContent.' + openFolder ); /* Select the associated content panel. */
        var folderContentShown = $( folderContent ) . css( "display" ) != "none"; /* Check if the content panel is currently visible. */
        var clickedFolder     = $( this ); /* Store a reference to the clicked folder element. */


        /*
         * The following section is commented out in the original code,
         * it would typically handle auto-scrolling to the clicked folder.
         *
         * // if ( settings.marginTopAdjust == false ) {
         * //   $( 'html, body' ) . animate( {
         * //     scrollTop: $( this ) . offset() . top
         * //   }, settings.animationSpeed );
         * // }
         */


        // Check if there is currently no active tool (i.e., no folder content is open).
        if ( $( " .jaf-container .active-tool" ) . length === 0 ) {

          var row = clickedFolder . parent( ".jaf-row" ); /* Find the parent row of the clicked folder. */
          $( row ) . after( folderContent ); /* Move the folder content panel after the clicked folder's row in the DOM. */

          $( this ) . addClass( 'active-tool', settings . animationSpeed ); /* Add 'active-tool' class to the clicked folder, with animation. */
          $( folderContent ) . slideToggle( settings . animationSpeed ); /* Slide down to show the folder content panel. */

          // Animate the opacity of all other folders to the specified 'opacity' setting.
          $( " .jaf-container" ) . find( ".folder" ) . not( clickedFolder ) . each( function () {
            if ( ! folderContentShown ) {
              $( this ) . animate( { opacity: settings . opacity }, settings . animationSpeed );
            } else {
              $( this ) . animate( { opacity: 1.00 }, settings . animationSpeed );
            }
          } );


          // --- Shift Rows (margin-top-adjust) Logic --- //
          if ( settings . marginTopAdjust === false ) {
            // If margin-top adjustment is disabled, do nothing and exit this block.
            return false;
          } else {
            // Adjust the container's margin-top for a "shifting" effect,
            // which works well with CSS `overflow: hidden`.
            var $i = $( this ) . parent() . index( '.jaf-row' ); /* Get the index of the current row. */
            var marTop = settings . marginTopBase - ( settings . marginTopIncrement * ( $i ) ); /* Calculate new margin-top. */
            $( this ) . parent() . parent() . animate( { marginTop: marTop }, settings . animationSpeed ); /* Apply animation. */
          }


          // --- URL Hash Management --- //
          // Temporarily modify the ID to prevent browser auto-scrolling,
          // then set the URL hash, and restore the ID.
          var hash = $( clickedFolder ) . attr( 'id' );
          var node = $( '#' + hash );
          if ( node . length ) {
            node . attr( 'id', '' ); /* Clear ID temporarily. */
          }
          document . location . hash = hash; /* Update the URL hash. */
          if ( node . length ) {
            node . attr( 'id', hash ); /* Restore ID. */
          }


        } else {
          // If a folder content area IS currently displayed...

          if ( folderContentShown ) {
            // If the active icon (the one whose content is shown) was clicked again.

            $( this ) . toggleClass( "active-tool" ); /* Toggle the 'active-tool' class off. */
            $( folderContent ) . slideToggle( settings . animationSpeed ); /* Slide up to hide the content panel. */

            // Restore full opacity to all other folders.
            $( " .jaf-container" ) . find( ".folder" ) . not( clickedFolder ) . each( function () {
              if ( ! folderContentShown ) {
                $( this ) . animate( { opacity: 0.20 }, settings . animationSpeed );
              } else {
                $( this ) . animate( { opacity: 1.00 }, settings . animationSpeed );
              }
            } );

            document . location . hash = ''; /* Clear the URL hash. */

            // Reset the margin-top for the entire container.
            $( this ) . parent() . parent() . animate( { marginTop: settings . marginTopBase }, settings . animationSpeed );

          } else {
            // An inactive icon was clicked while another folder's content was already open.

            if ( settings . instaSwitch !== false ) {
              // If instaSwitch is enabled, allow for quicker transitions.

              var speed = settings . animationSpeed;

              // If the clicked folder is in the same row as the currently active one,
              // set speed to 0 for an instant switch.
              if ( $( this ) . parent() . find( '.active-tool' ) . length !== 0 ) {
                speed = 0;
              }

              // Close the currently open folder content and reset active states.
              $( '.folderContent' ) . slideUp( speed );
              $( '.active-tool' ) . removeClass( 'active-tool' );
              $( ' .jaf-container .folder' ) . animate( { opacity: 1.00 }, speed );


              // Open the newly clicked icon's content.
              var row = clickedFolder . parent( ".jaf-row" );
              $( row ) . after( folderContent );

              $( this ) . addClass( 'active-tool', speed );
              $( folderContent ) . slideToggle( speed );

              // Animate opacity of other folders.
              $( " .jaf-container" ) . find( ".folder" ) . not( clickedFolder ) . each( function () {
                if ( ! folderContentShown ) {
                  $( this ) . animate( { opacity: settings . opacity }, speed );
                } else {
                  $( this ) . animate( { opacity: 1.00 }, speed );
                }
              } );

              var hash = $( clickedFolder ) . attr( 'id' );
              var node = $( '#' + hash );

              document . location . hash = hash;
              if ( node . length ) {
                node . attr( 'id', hash );
              }

              // Apply margin-top adjustment for the newly clicked folder.
              if ( settings . marginTopAdjust === false ) {
                return false; /* No adjustment needed. */
              } else {
                var $i = $( this ) . parent() . index( '.jaf-row' );
                var marTop = settings . marginTopBase - ( settings . marginTopIncrement * ( $i ) );
                $( this ) . parent() . parent() . animate( { marginTop: marTop }, settings . animationSpeed );
              }

            } else {
              // If instaSwitch is NOT enabled, simply close the current folder.

              $( '.folderContent' ) . slideUp( settings . animationSpeed );
              $( '.active-tool' ) . removeClass( 'active-tool' );
              $( '.jaf-container .folder' ) . animate( { opacity: 1.00 }, settings . animationSpeed );

              // Reset the margin-top for the container.
              $( this ) . parent() . parent() . animate( { marginTop: settings . marginTopBase }, settings . animationSpeed );

            }
          }
        }

        event . preventDefault(); /* Prevent the default action of the click event. */
        return false; /* Stop further propagation of the event. */
      } );


      // --- Close Button Handler --- //
      // Attach a click event listener to elements with the class 'jaf-close'.
      $( '.jaf-close' ) . click( function () {

        $( ".folder" ) . removeClass( "active-tool" ); /* Remove 'active-tool' class from all folders. */
        $( this ) . parent() . slideToggle( settings . animationSpeed ); /* Slide up the parent folder content. */

        // Reset the margin-top for the container upon closing.
        $( this ) . parent() . parent() . animate( { marginTop: settings . marginTopBase }, settings . animationSpeed );
      } );


      // --- Open Section by URL Hash on Load --- //
      // This section handles opening a specific folder if its ID is present in the URL hash on page load.

      var clickedFolder   = $( window . location . hash ), /* Get the element referenced by the URL hash. */
          openFolder      = $( clickedFolder ) . attr( 'id' ), /* Extract the ID of that element. */
          folderContent   = $( '.' + openFolder ), /* Select the corresponding folder content panel. */
          folderContentShown = $( folderContent ) . css( "display" ) != "none", /* Check if the content is visible. */
          row             = clickedFolder . parent( ".jaf-row" ); /* Find the parent row. */

      $( row ) . after( folderContent ); /* Position the content panel. */

      $( '#' + openFolder ) . addClass( 'active-tool' ); /* Mark the folder as active. */
      $( folderContent ) . delay( 200 ) . slideDown(); /* Delay and slide down the content. */

      // Adjust opacity of other folders.
      $( " .jaf-container" ) . find( ".folder" ) . not( clickedFolder ) . each( function () {
        if ( ! folderContentShown ) {
          $( this ) . css( 'opacity', settings . opacity );
        } else {
          $( this ) . css( 'opacity', '1.00' );
        }
      } );

      // Apply margin-top adjustment if configured and a folder is opened via hash.
      var $i = $( row ) . index( '.jaf-row' );
      if ( $i != -1 ) {
        var marTop = settings . marginTopBase - ( settings . marginTopIncrement * ( $i ) );
        $( this ) . animate( { marginTop: marTop }, settings . animationSpeed );

        // Prevent browser from scrolling to the linked item if it exists.
        $( 'body' ) . animate( { scrollTop: 0 }, 200, 'linear' );
      }


      // --- Internal Link Handler --- //
      // Re-load any links within the App Folders that refer to an opened App Folder.
      $( settings . internalLinkSelector ) . click( function ( event ) {
        var link = $( this ) . attr( 'href' ); /* Get the href attribute of the clicked link. */
        window . location . href = link; /* Navigate to the new URL. */
        window . location . reload(); /* Force a full page reload. */
        // return false; // This line was commented out in the original, often used to prevent default behavior.
      } );


    } ); // End of `this.each` function.


  }; // End of `$.fn.appFolders` plugin definition.


} ) ( jQuery ); // End of the Immediately Invoked Function Expression (IIFE).