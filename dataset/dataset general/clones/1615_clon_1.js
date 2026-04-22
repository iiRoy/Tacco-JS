var  ws = { };
var  client_id  =  0; /* This variable stores the client's unique identifier. */
var  userlist = { }; // An object to maintain the list of online users.
var  GET  =  getRequest ( ) ; // Retrieves URL query parameters.


// This block executes once the entire DOM is loaded and ready.
$(document) . ready (function ( ) {

  // First, check if the browser natively supports WebSocket or MozWebSocket.
  if ( window.WebSocket || window.MozWebSocket )
  {
    // If native support is detected, initialize a standard WebSocket connection.
    ws  =  new  WebSocket (webim.server) ;
  }
  // If native WebSockets are not available, check for Flash WebSocket compatibility.
  else  if  ( webim.flash_websocket )
  {
    // Set the path to the Flash WebSocket SWF file.
    WEB_SOCKET_SWF_LOCATION  =  "/static/flash-websocket/WebSocketMain.swf" ;

    // Asynchronously load the swfobject.js library.
    $.getScript ( "/static/flash-websocket/swfobject.js" ,  function ( ) {

      // Once swfobject.js is loaded, then load the web_socket.js library.
      $.getScript ( "/static/flash-websocket/web_socket.js" ,  function ( ) {

        // After both Flash WebSocket dependencies are loaded, initialize WebSocket via Flash.
        ws  =  new  WebSocket (webim.server) ;
      } ) ; // Inner getScript callback ends here.
    } ) ; // Outer getScript callback ends here.
  }
  // As a final fallback, if neither native nor Flash WebSockets are available,
  // use HTTP XHR long polling via the Comet class.
  else
  {
    ws  =  new  Comet (webim.server) ; // Initialize Comet for long polling.
  }

  // After the connection mechanism is established, set up event listeners.
  listenEvent ( ) ;

} ) ; // End of the document ready function.


/**
 * Sets up all necessary event listeners for the WebSocket (or Comet) connection.
 * This includes handling connection opening, incoming messages, connection closure, and errors.
 */
function  listenEvent ( ) {

  // Event handler for when the WebSocket connection is successfully opened.
  ws . onopen  =  function  ( e ) {
    // Crucial check: Ensure that 'name' and 'avatar' parameters are provided from the URL.
    if  ( GET['name']  ==  undefined  ||  GET['avatar']  ==  undefined ) {
      alert ( '必须的输入一个名称和一个图像才可以聊天' ) ; // Alert the user if required info is missing.
      ws . close ( ) ; // Close the WebSocket connection.
      return  false ; // Stop further execution.
    }

    // Log a success message to the console indicating a successful connection.
    console . log ( "connect webim server success." ) ;

    // Create a new object to hold the login message data.
    msg  =  new  Object ( ) ;
    msg . cmd  =  'login' ; // Set the command type to 'login'.
    msg . name  =  GET['name'] ; // Include the user's name.
    msg . avatar  =  GET['avatar'] ; // Include the user's avatar URL.

    // Send the login message to the server, converted to JSON format.
    ws . send ( $ . toJSON ( msg ) ) ;
  } ; // End of the ws.onopen event handler.


  // Event handler for when a message is received from the server.
  ws . onmessage  =  function  ( e ) {
    var  message  =  $ . evalJSON ( e.data ) ; // Parse the incoming JSON string data.
    var  cmd  =  message.cmd ; // Extract the command type from the message.

    // Use a series of if-else if statements to handle different command types.
    if  ( cmd  ==  'login' )
    {
      client_id  =  $ . evalJSON ( e.data ) . fd ; // Set the client's file descriptor (fd) as client_id.
      // Request the current list of online users from the server.
      ws . send ( $ . toJSON ( { cmd : 'getOnline' } ) ) ;
      // Request the chat history from the server.
      ws . send ( $ . toJSON ( { cmd : 'getHistory' } ) ) ;
      // An alert for debugging purposes, currently commented out: alert( "收到消息了:"+e.data );
    }
    else  if  ( cmd  ==  'getOnline' )
    {
      showOnlineList ( message ) ; // Call function to display the online user list.
    }
    else  if  ( cmd  ==  'getHistory' )
    {
      showHistory ( message ) ; // Call function to display the chat history.
    }
    else  if  ( cmd  ==  'newUser' )
    {
      showNewUser ( message ) ; // Call function to handle a new user joining the chat.
    }
    else  if  ( cmd  ==  'fromMsg' )
    {
      showNewMsg ( message ) ; // Call function to display an incoming chat message.
    }
    else  if  ( cmd  ==  'offline' )
    {
      var  cid  =  message.fd ; // Get the client ID of the user who went offline.
      delUser ( cid ) ; // Remove the user from the displayed online lists.
      showNewMsg ( message ) ; // Display a message indicating the user has gone offline.
    }
  } ; // End of the ws.onmessage event handler.


  // Event handler for when the WebSocket connection is closed.
  ws . onclose  =  function  ( e ) {
    // Prompt the user if they want to navigate back to the index page.
    if  ( confirm ( "聊天服务器已关闭" ) ) {
      // Another commented-out alert for debugging: alert('您已退出聊天室');
      location . href  =  'index.html' ; // Redirect the browser to 'index.html'.
    }
  } ; // End of the ws.onclose event handler.


  // Event handler for any errors that occur with the WebSocket connection.
  ws . onerror  =  function  ( e ) {
    alert ( "异常:"  +  e.data ) ; // Display an alert with the error data.
    console . log ( "onerror" ) ; // Log an error message to the console.
  } ; // End of the ws.onerror event handler.

} // End of the listenEvent function definition.


// Global event listener for keydown events on the entire document.
document . onkeydown  =  function  ( e ) {
  var  ev  =  document.all  ?  window.event  :  e ; // Normalize the event object for cross-browser compatibility.

  // Check if the pressed key's keyCode is 13 (which corresponds to the Enter key).
  if  ( ev.keyCode  ==  13 ) {
    // If Enter is pressed, send the content of the message input field as a 'text' type message.
    sendMsg ( $ ( '#msg_content' ) . val ( ) ,  'text' ) ;
    return  false ; // Prevent the default action of the Enter key (e.g., form submission).
  }
  else {
    return  true ; // For any other key, allow the default browser behavior.
  }
} ; // End of document.onkeydown event handler.


/**
 * Sets the value of the user selection dropdown to the specified user ID.
 * This effectively selects a user for private messaging.
 * @param  {number}  userid  The ID of the user to be selected.
 */
function  selectUser ( userid ) {
  $ ( '#userlist' ) . val ( userid ) ; // Update the value of the dropdown list.
}


/**
 * Displays the list of currently online users in the chat interface.
 * It populates both the visual list of avatars and the recipient dropdown.
 * @param  {object}  dataObj  An object containing the 'list' array of online user data.
 */
function  showOnlineList ( dataObj ) {
  var  li  =  '' ; // String accumulator for generating list items (avatars).
  var  option  =  "<option value='0' id='user_all' >所有人</option>" ; // Default option for sending to 'Everyone'.

  // Iterate over each user object within the 'list' array.
  for  ( var  i  =  0 ;  i  <  dataObj.list.length ;  i++ ) {
    // Append HTML for a new list item (<li>) with user's avatar and a selection link.
    li  =  li  +  "<li id='inroom_"  +  dataObj.list[i].fd  +  "'>"  +
           "<a href=\"javascript:selectUser('"
           +  dataObj.list[i].fd  +  "')\">"  +  "<img src='"  +  dataObj.list[i].avatar
           +  "' width='50' height='50'></a></li>" ;

    // Store the user's name in the global 'userlist' object, indexed by their file descriptor (fd).
    userlist[dataObj.list[i].fd]  =  dataObj.list[i].name ;

    // If the current online user is not the client itself, add them to the recipient dropdown.
    if  ( dataObj.list[i].fd  !=  client_id ) {
      option  =  option  +  "<option value='"  +  dataObj.list[i].fd  +  "' id='user_"  +  dataObj.list[i].fd  +  "'>"
               +  dataObj.list[i].name  +  "</option>" ;
    }
  }
  // Update the HTML content of the left-hand user list panel.
  $ ( '#left-userlist' ) . html ( li ) ;
  // Update the HTML content of the message recipient dropdown.
  $ ( '#userlist' ) . html ( option ) ;
}


/**
 * Processes and displays a list of historical chat messages.
 * Each message is prepared and then passed to `showNewMsg` for display.
 * @param  {object}  dataObj  An object containing the 'history' array of past messages.
 */
function  showHistory ( dataObj ) {
  var  msg ; // A temporary variable to hold each message object.
  console . dir ( dataObj ) ; // Log the entire data object to the console for inspection.

  // Loop through each historical message entry.
  for  ( var  i  =  0 ;  i  <  dataObj.history.length ;  i++ ) {
    msg  =  dataObj.history[i]['msg'] ; // Extract the core message content.
    if  ( ! msg )  continue ; // If the message content is empty or null, skip to the next entry.

    // Augment the message object with additional data from the history entry.
    msg['time']  =  dataObj.history[i]['time'] ;
    msg['user']  =  dataObj.history[i]['user'] ;

    // If a specific message type is defined in history, apply it.
    if  ( dataObj.history[i]['type'] )
    {
      msg['type']  =  dataObj.history[i]['type'] ;
    }

    msg['channal']  =  3 ; // Assign channel 3 to indicate a historical message.
    showNewMsg ( msg ) ; // Call `showNewMsg` to render this historical message.
  }
}


/**
 * Handles the arrival of a new user by adding them to the online user lists.
 * Ensures the user is not added if already present.
 * @param  {object}  dataObj  An object containing the new user's details (fd, name, avatar).
 */
function  showNewUser ( dataObj ) {
  // Check if the user is not already listed in the global 'userlist' object.
  if  ( ! userlist[dataObj.fd] ) {
    userlist[dataObj.fd]  =  dataObj.name ; // Add the new user's name to the 'userlist'.

    // If the new user is not the current client, add an option for them in the recipient dropdown.
    if  ( dataObj.fd  !=  client_id ) {
      $ ( '#userlist' ) . append ( "<option value='"  +  dataObj.fd  +  "' id='user_"  +  dataObj.fd  +  "'>"  +  dataObj.name  +  "</option>" ) ;
    }

    // Append a new list item (<li>) with the new user's avatar to the left-hand online user panel.
    $ ( '#left-userlist' ) . append (
      "<li id='inroom_"  +  dataObj.fd  +  "'>"  +
      '<a href="javascript: selectUser(\''  +  dataObj.fd  +  '\')">'  +  "<img src='"  +  dataObj.avatar
      +  "' width='50' height='50'></a></li>" ) ;
  }
}


/**
 * Displays a new message in the chat window, formatting it based on its content type, sender, and channel.
 * Manages system messages, public messages, private messages, and historical entries.
 * @param  {object}  dataObj  The message data object to be displayed.
 */
function  showNewMsg ( dataObj ) {

  var  content ; // This variable will hold the processed message content (text or image HTML).

  // Determine the type of message content and process accordingly.
  if  ( ! dataObj.type  ||  dataObj.type  ==  'text' ) {
    content  =  xssFilter ( dataObj.data ) ; // Filter text messages for potential XSS.
  }
  else  if  ( dataObj.type  ==  'image' ) {
    var  image  =  eval ( '('  +  dataObj.data  +  ')' ) ; // Parse image data (expected to be a JSON string).
    // Construct HTML for displaying the image, including a thumbnail and a link to the full image.
    content  =  '<br /><a href="'  +  image.url  +  '" target="_blank"><img src="'  +  image.thumb  +  '" /></a>' ;
  }

  var  fromId  =  dataObj.from ; // Get the ID of the message sender.
  var  channal  =  dataObj.channal ; // Get the communication channel (0: public, 1: private, 3: history).

  content  =  parseXss ( content ) ; // Apply custom parsing (e.g., converting #digits to emojis).
  var  said  =  '' ; // String to store the "said" prefix (e.g., "User X said:").
  var  time_str ; // String to store the formatted timestamp.

  // Determine the timestamp to display for the message.
  if  ( dataObj.time ) {
    time_str  =  GetDateT ( dataObj.time ) ; // Use the provided timestamp if available.
  }
  else {
    time_str  =  GetDateT ( ) ; // Otherwise, use the current time.
  }

  // Update the timestamp in the message template.
  $ ( "#msg-template .msg-time" ) . html ( time_str ) ;

  // Handle system messages (messages from ID 0).
  if  ( fromId  ==  0 ) {
    $ ( "#msg-template .userpic" ) . html ( "" ) ; // Clear the user picture area for system messages.
    $ ( "#msg-template .content" ) . html (
      "<span style='color: green'>【系统消息】</span>"  +  content ) ; // Display system message with green color.
  }
  // Handle messages from regular users.
  else {
    var  html  =  '' ; // Initialize an empty string to build the message HTML.
    var  to  =  dataObj.to ; // Get the recipient ID for private messages.

    // Handle historical messages specifically.
    if  ( channal  ==  3 )
    {
      said  =  '对大家说:' ; // Indicate it's a historical public message.
      html  +=  '<span style="color: green">【历史记录】</span><span style="color: orange">'  +  dataObj.user.name  +  said ;
      html  +=  '</span>' ;
    }
    // Handle live chat messages (public or private).
    else {
      // If the message was sent by the current client.
      if  ( client_id  ==  fromId ) {
        if  ( channal  ==  0 ) { // Public message from self.
          said  =  '我对大家说:' ;
        }
        else  if  ( channal  ==  1 ) { // Private message from self.
          said  =  "我悄悄的对"  +  userlist[to]  +  "说:" ;
        }
        html  +=  '<span style="color: orange">'  +  said  +  ' </span> ' ;
      }
      // If the message was sent by another user.
      else {
        if  ( channal  ==  0 ) { // Public message from another user.
          said  =  '对大家说:' ;
        }
        else  if  ( channal  ==  1 ) { // Private message from another user.
          said  =  "悄悄的对我说:" ;
        }

        html  +=  '<span style="color: orange"><a href="javascript:selectUser('
                 +  fromId  +  ')">'  +  userlist[fromId]  +  said ;
        html  +=  '</a></span> ' ;
      }
    }
    html  +=  content  +  '</span>' ; // Append the actual message content.
    $ ( "#msg-template .content" ) . html ( html ) ; // Update the content area of the message template.
  }

  // Append the fully constructed message from the template to the chat messages display area.
  $ ( "#chat-messages" ) . append ( $ ( "#msg-template" ) . html ( ) ) ;
  // Scroll the chat messages container to the very bottom to show the latest message.
  $ ( '#chat-messages' ) [0] . scrollTop  =  1000000 ;
}


/**
 * Filters a string to prevent Cross-Site Scripting (XSS) attacks.
 * It escapes common HTML special characters.
 * @param   {string}  val  The input string to be filtered.
 * @returns {string}       The XSS-safe string.
 */
function  xssFilter ( val ) {
  val  =  val . replace ( /&/g ,  '&amp;' ) . replace ( /</g ,  '&lt;' ) . replace ( />/g ,  '&gt;' ) . replace ( /\x22/g ,  '&quot;' ) . replace ( /\x27/g ,  '&#39;' ) ;
  return  val ;
}


/**
 * Parses custom tags within a string, primarily converting '#digits' into image tags for face emojis.
 * It also unescapes the '&amp;' entity back to '&'.
 * @param   {string}  val  The input string to be parsed.
 * @returns {string}       The parsed string with emojis rendered.
 */
function  parseXss ( val ) {
  val  =  val . replace ( /#(\d*)/g ,  '<img src="/static/img/face/$1.gif" />' ) ; // Converts #1, #2, etc. to emoji images.
  val  =  val . replace ( '&amp;' ,  '&' ) ; // Converts escaped ampersand back to '&'.
  return  val ;
}


/**
 * Formats a given Unix timestamp (or the current time if none provided) into a "HH:MM:SS" string.
 * This is used for displaying message timestamps.
 * @param   {number}  [time_stamp]  An optional Unix timestamp in seconds.
 * @returns {string}                The formatted time string.
 */
function  GetDateT ( time_stamp ) {
  var  d ; // Declare a Date object.
  d  =  new  Date ( ) ; // Initialize 'd' with the current date and time.

  // If a timestamp is provided, set the Date object's time to it (converting seconds to milliseconds).
  if  ( time_stamp ) {
    d . setTime ( time_stamp  *  1000 ) ;
  }

  var  h ,  i ,  s ; // Variables to hold hours, minutes, and seconds.
  h  =  d . getHours ( ) ; // Get the hour component.
  i  =  d . getMinutes ( ) ; // Get the minute component.
  s  =  d . getSeconds ( ) ; // Get the second component.

  // Pad single-digit hours, minutes, and seconds with a leading zero for consistent formatting.
  h  =  ( h  <  10 )  ?  '0'  +  h  :  h ;
  i  =  ( i  <  10 )  ?  '0'  +  i  :  i ;
  s  =  ( s  <  10 )  ?  '0'  +  s  :  s ;

  return  h  +  ":"  +  i  +  ":"  +  s ; // Return the concatenated time string.
}


/**
 * Parses the URL's query string parameters and returns them as an object.
 * For example, "?name=John&age=30" becomes { name: "John", age: "30" }.
 * @returns {object} An object containing the key-value pairs of the URL parameters.
 */
function  getRequest ( ) {
  var  url  =  location.search ; // Retrieves the query string portion of the URL (e.g., "?key=value").
  var  theRequest  =  new  Object ( ) ; // Initialize an empty object to store the parsed parameters.

  // Check if the URL contains a query string (i.e., if it has a '?').
  if  ( url . indexOf ( "?" )  !=  -1 ) {
    var  str  =  url . substr ( 1 ) ; // Remove the leading '?' character from the query string.

    strs  =  str . split ( "&" ) ; // Split the remaining string by '&' to get individual parameter pairs.
    for  ( var  i  =  0 ;  i  <  strs.length ;  i++ ) {
      var  decodeParam  =  decodeURIComponent ( strs[i] ) ; // Decode URI-encoded components (e.g., spaces).
      var  param  =  decodeParam . split ( "=" ) ; // Split each parameter pair by '=' to get key and value.
      theRequest[param[0]]  =  param[1] ; // Assign the key-value pair to the 'theRequest' object.
    }
  }

  return  theRequest ; // Return the object containing all parsed URL parameters.
}


// This function is a duplicate definition of `selectUser` from earlier in the script.
// It sets the selected value of the userlist dropdown.
function  selectUser ( userid ) {
  $ ( '#userlist' ) . val ( userid ) ;
}


/**
 * Removes a user from the displayed online lists and from the internal 'userlist' object.
 * This is typically triggered when a user disconnects or goes offline.
 * @param  {number}  userid  The ID of the user to be removed.
 */
function  delUser ( userid ) {
  $ ( '#user_'  +  userid ) . remove ( ) ; // Remove the user's <option> element from the recipient dropdown.
  $ ( '#inroom_'  +  userid ) . remove ( ) ; // Remove the user's <li> element from the left-hand online list.
  delete  ( userlist[userid] ) ; // Delete the user's entry from the global 'userlist' object.
}


/**
 * Sends a chat message to the server, either publicly or privately, based on the selected recipient.
 * It also displays the message in the local chat window immediately.
 * @param  {string}  content  The raw text content of the message to be sent.
 * @param  {string}  type     The type of the message (e.g., 'text').
 * @returns {boolean}         Returns `false` if the message content is empty, otherwise `undefined`.
 */
function  sendMsg ( content ,  type ) {
  var  msg  =  { } ; // Initialize an empty object to construct the message data.

  // If the content is a string, replace standard spaces with non-breaking spaces for display consistency.
  if  ( typeof  content  ==  "string" ) {
    content  =  content . replace ( " " ,  "&nbsp;" ) ;
  }

  // If the message content is empty after processing, prevent sending the message.
  if  ( ! content ) {
    return  false ;
  }

  // Determine if the message should be sent publicly (to everyone) or privately.
  if  ( $ ( '#userlist' ) . val ( )  ==  0 ) { // If '0' is selected, it means 'Everyone'.
    msg . cmd  =  'message' ; // Set the command to 'message'.
    msg . from  =  client_id ; // Set the sender's ID.
    msg . channal  =  0 ; // Set channel 0 for public messages.
    msg . data  =  content ; // Attach the message content.
    msg . type  =  type ; // Attach the message type.
    ws . send ( $ . toJSON ( msg ) ) ; // Send the message to the server in JSON format.
  }
  else { // Otherwise, a specific user is selected for a private message.
    msg . cmd  =  'message' ; // Set the command to 'message'.
    msg . from  =  client_id ; // Set the sender's ID.
    msg . to  =  $ ( '#userlist' ) . val ( ) ; // Set the recipient's ID.
    msg . channal  =  1 ; // Set channel 1 for private messages.
    msg . data  =  content ; // Attach the message content.
    msg . type  =  type ; // Attach the message type.
    ws . send ( $ . toJSON ( msg ) ) ; // Send the private message to the server.
  }
  showNewMsg ( msg ) ; // Immediately display the sent message in the local chat interface.
  $ ( '#msg_content' ) . val ( '' ) ; // Clear the message input field after sending.
}


// This `document.ready` block initializes the face emoji selection panel.
$(document) . ready (function ( ) {
  var  a  =  '' ; // An empty string to build the HTML for face emoji links.
  // Loop to generate links for 19 different face emojis.
  for  ( var  i  =  1 ;  i  <  20 ;  i++ ) {
    a  =  a  +  '<a class="face" href="#" onclick="selectFace('  +  i  +  ');return false;"><img src="/static/img/face/'  +  i  +  '.gif" /></a>' ;
  }
  $ ( "#show_face" ) . html ( a ) ; // Insert the generated face emoji links into the '#show_face' element.
} ) ;


/*
 * Self-executing anonymous function that extends jQuery's prototype with a new method.
 * This function adds `insertAtCaret` to all jQuery objects.
 */
(function  ( $ ) {
  $ . fn . extend ( {
    /**
     * Inserts text at the current caret (cursor) position within a textarea or input field.
     * Supports both modern browsers and older IE versions.
     * @param  {string}  myValue  The string to insert.
     */
    insertAtCaret :  function  ( myValue ) {
      var  $t  =  $ ( this ) [0] ; // Get the raw DOM element from the jQuery object.

      // Handle Internet Explorer's legacy text selection model.
      if  ( document.selection ) {
        this . focus ( ) ; // Ensure the element is focused.
        sel  =  document.selection . createRange ( ) ; // Get the currently selected text range.
        sel . text  =  myValue ; // Replace the selection with `myValue`.
        this . focus ( ) ; // Re-focus the element after insertion.
      }
      // Handle modern browsers using `selectionStart` and `selectionEnd`.
      else  if  ( $t.selectionStart  ||  $t.selectionStart  ==  '0' ) {

        var  startPos  =  $t.selectionStart ; // Get the starting index of the selection.
        var  endPos  =  $t.selectionEnd ; // Get the ending index of the selection.
        var  scrollTop  =  $t.scrollTop ; // Store the current scroll position.

        // Reconstruct the value by inserting `myValue` at the caret/selection.
        $t.value  =  $t.value . substring ( 0 ,  startPos )  +  myValue  +  $t.value . substring ( endPos ,  $t.value.length ) ;
        this . focus ( ) ; // Re-focus the element.
        $t.selectionStart  =  startPos  +  myValue.length ; // Set the new caret position after the inserted text.
        $t.selectionEnd  =  startPos  +  myValue.length ; // Ensure the selection end is also at the new caret position.
        $t.scrollTop  =  scrollTop ; // Restore the scroll position.
      }
      // Fallback for browsers that don't support the above methods (simply append text).
      else {

        this . value  +=  myValue ; // Append `myValue` to the end of the element's current value.
        this . focus ( ) ; // Focus the element.
      }
    } // End of `insertAtCaret` method definition.
  } ) ; // End of `$.fn.extend`.
} ) ( jQuery ) ; // Immediately invoke the function, passing `jQuery` as `$`.


/**
 * Inserts a selected face emoji code into the message input field.
 * This function is typically called when a user clicks on an emoji in the face selection panel.
 * @param  {number}  id  The unique ID of the selected face emoji.
 */
function  selectFace ( id ) {
  // The 'img' variable is declared but its value is not used in this function.
  var  img  =  '<img src="/static/img/face/'  +  id  +  '.gif" />' ;
  $ ( "#msg_content" ) . insertAtCaret ( "#"  +  id ) ; // Insert the emoji code (e.g., "#1") into the message input.
  closeChatFace ( ) ; // Close the face selection panel after an emoji has been chosen.
}


/**
 * Makes the chat face selection panel visible by applying specific CSS classes.
 * This usually involves changing its display property or adding a 'hover' state.
 */
function  showChatFace ( ) {
  $ ( "#chat_face" ) . attr ( "class" ,  "chat_face chat_face_hover" ) ; // Add 'chat_face_hover' to the chat face button.
  $ ( "#show_face" ) . attr ( "class" ,  "show_face show_face_hovers" ) ; // Add 'show_face_hovers' to the face panel.
}


/**
 * Hides the chat face selection panel by removing the CSS classes that make it visible.
 * This reverts the panel and button to their default (hidden/inactive) states.
 */
function  closeChatFace ( ) {
  $ ( "#chat_face" ) . attr ( "class" ,  "chat_face" ) ; // Remove 'chat_face_hover' from the button.
  $ ( "#show_face" ) . attr ( "class" ,  "show_face" ) ; // Remove 'show_face_hovers' from the panel.
}


/**
 * Toggles the visibility state of the chat face selection panel.
 * If it's visible, it hides it; if hidden, it shows it.
 * This is achieved by toggling specific CSS classes.
 */
function  toggleFace ( ) {
  $ ( "#chat_face" ) . toggleClass ( "chat_face_hover" ) ; // Toggle 'chat_face_hover' class on the button.
  $ ( "#show_face" ) . toggleClass ( "show_face_hovers" ) ; // Toggle 'show_face_hovers' class on the panel.
}