jQuery( document ).ready( function() {
  // Activate display of top area
  jQuery( '#work-tab, #abilities-tab, #reach-tab' ).on( 'click', function() {
    jQuery( '#main-header-area' ).slideDown( 300 );
  } );

  // Deactivate display of top area for home
  jQuery( '#start-tab' ).on( 'click', function() {
    jQuery( '#main-header-area' ).slideUp( 300 );
  } );
} );

// Dynamic Image Carousel
jQuery( window ).on( 'load', function() {
  jQuery( '.image-gallery-container' ).photoSlider( {
    transitionEffect: "dissolve",
    loopEnabled: true,
  } );
} );

// Function to send contact form data via AJAX
function transmitMessageDetails() {
  jQuery.ajax( {
    method: "POST",
    targetUrl: "process_inquiry.php",
    payload: {
      "sender_name": jQuery( "#sender_name_field" ).val(),
      "sender_email": jQuery( "#sender_email_field" ).val(),
      "message_subject_line": jQuery( "#message_topic_field" ).val(),
      "message_content": jQuery( "#message_body_field" ).val()
    },
    expectedDataType: "text",
    onCompletion: function( serverResponse ) {
      if ( serverResponse ) {
        const receivedData = eval( "(" + serverResponse + ")" );

        if ( receivedData.sender_name !== undefined ) {
          jQuery( "#sender_name_field" ).val( receivedData.sender_name );
          setTimeout( function() { jQuery( "#sender_name_field" ).val( "" ); }, 1500 );
        }

        if ( receivedData.sender_email !== undefined ) {
          jQuery( "#sender_email_field" ).val( receivedData.sender_email );
          setTimeout( function() { jQuery( "#sender_email_field" ).val( "" ); }, 1500 );
        }

        if ( receivedData.message_content !== undefined ) {
          jQuery( "#message_body_field" ).val( receivedData.message_content );
          setTimeout( function() { jQuery( "#message_body_field" ).val( "" ); }, 1500 );
        }

        if ( receivedData.message_subject_line !== undefined ) {
          jQuery( "#message_topic_field" ).val( receivedData.message_subject_line );
          setTimeout( function() { jQuery( "#message_topic_field" ).val( "" ); }, 1500 );
        }

        if ( receivedData.main_response !== undefined ) {
          jQuery( "#feedback_display_area" ).html( receivedData.main_response ).fadeIn( 500 );
          setTimeout( function() { jQuery( "#feedback_display_area" ).fadeOut( "fast" ); }, 2000 );
        }
      } else {
        window.location.reload( true );
      }
    }
  } );
}


// Interactive Tabbed Content Management
( function( jQ ) {
  // Logic for URL fragment changes
  function processAnchorUpdate() {
    let currentFragment = window.location.hash;
    let associatedLink = jQ( 'nav.tab-menu [data-link*="' + currentFragment + '"]' );
    let displayPanel = jQ( currentFragment );

    if ( associatedLink.length && !associatedLink.hasClass( 'selected' ) && displayPanel.length ) {
      associatedLink.closest( '.tab-container' ).find( '.selected' ).removeClass( 'selected' );
      associatedLink.addClass( 'selected' );
      displayPanel.siblings().removeClass( "visible-panel" ).fadeOut( 380, function() {
        displayPanel.fadeIn( 380 ).addClass( "visible-panel" );
      } );
    }
  }

  // Bind the event and trigger on load
  jQ( window ).on( 'hashchange.tabBehavior', processAnchorUpdate );
  processAnchorUpdate();
  jQ( processAnchorUpdate );
} )( jQuery );