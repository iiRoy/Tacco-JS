/* This is a Type I clone of some JavaScript application logic.
 * The original code's functionality is preserved entirely.
 * Only whitespace and comments have been altered.
 */

var filters = ''; // Initialize the filters string. It's empty at first.

var socket = io.connect(); /* Establish a connection to the Socket.IO server. */


// Event handler for incoming 'message' events from the server.
socket.on('message', function(json)
{
  /* Parse the incoming JSON string into a JavaScript object. */
  data = JSON.parse(json);

  /* Regular expression to find URLs in the text.
   * It matches http, https, and ftp protocols.
   */
  var replacePattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

  // Replace URLs with anchor tags for clickable links, opening in a new tab.
  var replacedText = (data.text) . replace(replacePattern, '<a href="$1" target="_blank">$1</a>');

  // Iterate over each filter string.
  filters.forEach( function (str)
  {
    // Create a new regular expression for the current filter string.
    var search = new RegExp(str, "gim");

    // Highlight the filter string in the text with a danger label.
    replacedText = replacedText . replace(search, '<span class="label label-danger">' + str + '</span>');
  });

  /* Construct a new list item, populate it with user and text,
   * then prepend it to the unordered list with class 'unstyled'.
   * Finally, apply a fade-in animation.
   */
  $ ( "<li></li>" )
    . html( "[" + data.user.screen_name + "] " + replacedText )
    . prependTo( "ul.unstyled" )
    . css( { opacity: 0 } )
    . slideDown("slow")
    . animate( { opacity: 1 }, "slow" ) ;
} ) ;


// Event handler for the 'connect' event.
socket.on("connect", function()
{
  // Emit 'getfilter' to request current filters from the server.
  socket.emit('getfilter', function()
  {
    // Callback function, currently empty.
  });

  console.log("connected"); // Log connection status.
});


// Event handler for the 'disconnect' event.
socket.on("disconnect", function()
{
  console.log("disconnected"); /* Log disconnection status to the console. */
});


/* Event handler for 'pushfilter' event.
 * This event is triggered when the server sends updated filters.
 */
socket.on('pushfilter', function(f)
{
  filters = f; // Update the global filters array.

  $ ( '#tracker' ) . empty ( ) ; // Clear the existing filter display.

  // For each new filter string, create and prepend a new alert div.
  filters.forEach( function(str)
  {
    $ ( '<div class="alert alert-info" id="' + str + '"><a class="close" data-dismiss="alert" id="' + str + '" href="#">&times;</a><p>' + str + '</p></div></div>' )
      . prependTo("#tracker") ;
  } ) ;
} ) ;


/* This function handles adding a new track (filter) to the system. */
function addTrack ( )
{
  socket . emit ( 'data', '+', $( "#data" ) . val ( ) ) ; // Emit 'data' event with add action.
  $( "#data" ) . val ( '' ) ; // Clear the input field.

  socket.disconnect(); // Disconnect and then immediately reconnect to apply changes.
  socket.socket.reconnect();
}


// Event delegation for clicks on 'a' elements within the '#tracker' div.
$ ( "#tracker" ) . delegate ( 'a', 'click', function ( )
{
  socket . emit ( 'data', '-', $ ( this ) . attr ( 'id' ) ) ; // Emit 'data' event with remove action.
  socket.disconnect(); // Disconnect and reconnect to update filters.
  socket.socket.reconnect();
} ) ;


// Function to send a tweet (or similar 'data' with '*' action).
function tweetThat ( )
{
  socket . emit ( 'data', '*', $ ( '#tweet' ) . val ( ) ) ; // Emit 'data' event with tweet action.
  $ ( '#tweet' ) . val ( '' ) ; // Clear the tweet input field.
}


// jQuery's document ready function ensures code runs after DOM is fully loaded.
$ ( document ) . ready ( function ( )
{
  var left = 140; // Initial character limit for the tweet.

  $ ( '#text_counter' ) . text ( 'Characters left: ' + left ) ; // Display initial character count.

  // Event handler for keyup events on the '#tweet' input field.
  $ ( '#tweet' ) . keyup ( function ( )
  {
    left = 140 - $ ( this ) . val ( ) . length ; // Calculate remaining characters.

    if ( left < 0 )
    {
      $ ( '#text_counter' ) . addClass ( "overlimit" ) ; // Add 'overlimit' class if character count is negative.
    }

    if ( left >= 0 )
    {
      $ ( '#text_counter' ) . removeClass ( "overlimit" ) ; // Remove 'overlimit' class if count is non-negative.
    }

    $ ( '#text_counter' ) . text ( 'Characters left: ' + left ) ; // Update displayed character count.
  } ) ;
} ) ;