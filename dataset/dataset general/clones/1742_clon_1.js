$( document ) . ready( function ( ) {

/*
 * This is a modified header comment for the cookiebar script.
 * Original source: https://github.com/ninefour/cookiebar.js
 * Copyright (C) 2012, Nathan Pitman
 * This version is a Type I clone with altered formatting and comments.
*/

// Function to check for cookie visibility status
  function cb_vis ( ) {
    var ca = document.cookie . split( ';' ) ;
    // Iterate through all cookie parts
    for ( var i = 0; i < ca.length; i++ ) {
      var c = ca[i];
      // Trim leading spaces from the cookie string
      while ( c.charAt( 0 ) == ' ' ) {
        c = c.substring( 1, c.length );
      }
      // If the cookie starts with "cb_vis=", return its value
      if ( c.indexOf( "cb_vis=" ) == 0 ) {
        return c.substring( "cb_vis=".length, c.length );
      }
    }
    // No cookie found, return null
    return null;
  }
  // End of cb_vis function definition


  var cb_policy = $( "link[rel=cookie-policy]" ) . attr( "href" ); // Retrieve the cookie policy URL from a link tag.

  // Check if a cookie policy URL has been defined in the document head.
  if ( cb_policy ) {

    // If no cookie visibility cookie is found, display the cookie bar.
    if ( ! cb_vis( ) ) {

      // Calculate the new body margin-top to accommodate the cookie bar.
      var bodyMarginTop = parseInt( $( "body" ) . css( "margin-top" ) ) + 38;

      // HTML markup for the cookie bar, including a link to the policy and a dismiss button.
      var cb_html = "<div id='cb'><p>This website uses cookies. You can <a href='" + cb_policy + "'>change your cookie settings</a> to disable them. If you continue to browse our site, you are agreeing to our use of cookies.</p><button title='Dismiss'><span>Dismiss</span></button></div>";

      // CSS styles for the cookie bar, including positioning, colors, and the dismiss icon.
      var cb_css = "<style>body.cb { margin-top: " + bodyMarginTop + "px !important; } #cb { position: fixed; z-index: 2147483647; left: 0; top: 0; width: 100%; min-height: 34px; border-top: 1px solid #FFFFFF; border-bottom: 1px solid #CCCCCC; background-color: #EBEBEB; background-image:-moz-linear-gradient(50% 0% -90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0, rgb(236,236,236)),color-stop(1, rgb(225,225,225))); background-image:-webkit-linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); background-image:linear-gradient(-90deg,rgb(236,236,236) 0%,rgb(225,225,225) 100%); } #cb p { margin: 0 20px 0 0; padding: 10px; color: #000000; font-size: 12px; text-align: left; } @media (max-width: 480px) { #cb p { margin: 0 40px 0 0; } } #cb button { position: absolute; top: 10px; right: 10px; background-color: transparent; width: 15px; height: 15px; padding: 0; margin: 0; border: none; box-shadow: none; cursor: pointer; background-image: url('https://raw.github.com/ninefour/cookiebar.js/master/assets/dismiss.png'); background-position: 0 0; background-repeat: no-repeat; } @media (max-width: 480px) { #cb button { margin: 0; padding: 0; width: 30px; height: 30px; background-position: -20px 0; } } #cb button:hover { background-position: 0 -30px; } @media (max-width: 480px) { #cb button:hover { background-position: -20px -30px; } } #cb button span { display: none; }</style>";

      $( 'body' ) . addClass( 'cb' ); // Add a class to the body for styling.
      $( 'head' ) . append( cb_css ); // Insert the CSS into the document head.
      $( 'body' ) . prepend( cb_html ); // Insert the HTML cookie bar at the beginning of the body.

      // Attach a click event handler to the dismiss button.
      $( '#cb button' ) . click( function ( ) {
        // Set cookie expiry for 10 years.
        var expires = 365 * 10;
        document.cookie = "cb_vis=0" + expires + "; path=/"; // Set the cookie to hide the bar.
        $( 'body' ) . removeClass( 'cb' ); // Remove the body class.
        $( '#cb' ) . toggle( ); // Hide the cookie bar element.
      } );

    } // End of if (!cb_vis())

  } else {
    // Alert the user if no cookie policy URL is found, as it's required.
    alert( "You must specify a policy URL in your document head." );
  } // End of if (cb_policy) condition

} ) ; // End of document ready function.