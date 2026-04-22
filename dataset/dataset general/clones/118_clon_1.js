/*
 * This script handles WebSocket connections for news and tweets,
 * manages UI updates, and provides animations for displaying content.
 */

$( document ).ready( function ()
{
  // Declare WebSocket variables for two separate connections.
  var socket1, socket2;

  // Event handler for the connection form submission.
  $( '#connect_form' ).submit( function ()
  {
    // Retrieve host URLs from input fields.
    var host1 = $( "#url1" ).val();
    var host2 = $( "#url2" ).val();

    // Initialize new WebSocket objects with the retrieved hosts.
    socket1 = new WebSocket( host1 );
    socket2 = new WebSocket( host2 );

    // Update UI elements based on connection status.
    $( '#connect' ).fadeOut( { duration: 'fast' } );
    $( '#disconnect' ).fadeIn();
    $( '#send_form_input' ).removeAttr( 'disabled' ); // Enable input after connecting.

    // Define the 'onopen' event handler for the first socket (news).
    socket1.onopen = function ()
    {
      // Append a message to the UI indicating the socket status.
      $( '#msg' ).append( '<p class="event">Socket News Status: ' + socket1.readyState + ' (open)</p>' );
    };

    // Define the 'onopen' event handler for the second socket (tweets).
    socket2.onopen = function ()
    {
      // Append a message to the UI indicating the socket status.
      $( '#msg' ).append( '<p class="event">Socket Tweet Status: ' + socket2.readyState + ' (open)</p>' );
    };


    // Define the 'onmessage' event handler for the first socket (news).
    socket1.onmessage = function ( msg )
    {
      // The original commented line is removed, as per Type I definition allowing comment removal.

      // Parse the incoming JSON data to extract news details.
      var news = JSON.parse( msg.data );

      // Extract specific fields from the parsed news object.
      var symbol = news.symbol;
      var title = news.title;
      var picture = news.picture;
      var info = news.info;

      // Create a new list item element for displaying news.
      var $res = $( "<li>" );

      // Append various news components to the list item.
      $res.append( "<img src='" + picture + "' width='50' height='50' />" );
      $res.append( "&nbsp;" + symbol + " : " + title + "<p/>" );
      $res.append( "Description : " + info );
      $res.append( "</li>" );

      // Add the constructed list item to the news container.
      $res.appendTo( '#news' );

      // Set an interval to trigger the news ticker animation.
      setInterval( function () { tickNews(); }, 5000 );

      // Ensure the news list is visible.
      $( '#newsList' ).show();
    };


    // Define the 'onmessage' event handler for the second socket (tweets).
    socket2.onmessage = function ( msg )
    {
      // Original comment was removed.

      // Parse the incoming JSON data to extract tweet message.
      var message = JSON.parse( msg.data );

      // Extract the tweet text.
      var txt = message.tweet;

      // Create a new list item element for displaying tweets.
      var $res = $( "<li/>" );

      // Append the tweet text to the list item.
      $res.append( txt );

      // Add the constructed list item to the tweet container.
      $res.appendTo( $( '#tweet' ) );

      // Set an interval to trigger the tweet ticker animation.
      setInterval( function ()
      {
        tickTweet();
      }, 5000 );

      // Ensure the tweet list is visible.
      $( '#tweetList' ).show();
    };

    // Define the 'onclose' event handler for the first socket (news).
    socket1.onclose = function ()
    {
      $( '#msg' ).append( '<p class="event">Socket News Status: ' + socket1.readyState + ' (Closed)</p>' );
    };

    // Define the 'onclose' event handler for the second socket (tweets).
    socket2.onclose = function ()
    {
      $( '#msg' ).append( '<p class="event">Socket Tweet Status: ' + socket2.readyState + ' (Closed)</p>' );
    };

    // Prevent default form submission behavior.
    return false;
  } );

  // Event handler for the disconnection form submission.
  $( '#disconnect_form' ).submit( function ()
  {
    // Close both WebSocket connections.
    socket1.close();
    socket2.close();

    // Append messages to the UI indicating the closed status for both sockets.
    $( '#msg' ).append( '<p class="event">Socket News Status: ' + socket1.readyState + ' (Closed)</p>' );
    $( '#msg' ).append( '<p class="event">Socket Tweet Status: ' + socket2.readyState + ' (Closed)</p>' );

    // Update UI elements after disconnection.
    $( '#disconnect' ).fadeOut( { duration: 'fast' } );
    $( '#connect' ).fadeIn();
    $( '#send_form_input' ).addAttr( 'disabled' ); // Disable input after disconnecting.

    // Prevent default form submission behavior.
    return false;
  } );

} ); // End of document.ready function.


/*
 * Function to animate the news ticker.
 * It moves the first news item to the end of the list with a slide effect.
 */
function tickNews()
{
  $( '#news li:first' ).slideUp( function ()
  {
    $( this ).appendTo( $( '#news' ) ).slideDown();
  } );
}

/*
 * Function to animate the tweet ticker.
 * It moves the first tweet item to the end of the list with a slide effect.
 */
function tickTweet()
{
  $( '#tweet li:first' ).slideUp( function ()
  {
    $( this ).appendTo( $( '#tweet' ) ).slideDown();
  } );
}

// Initialize jQuery UI tabs functionality when the document is ready.
$( function ()
{
  $( "#tabs" ).tabs();
} );