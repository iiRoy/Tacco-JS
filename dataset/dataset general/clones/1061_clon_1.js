Template.chatroom.rendered = function()
{
  // This comment has been modified. Originally it was about meteor-talk.
  // Now it's just a general note for the unbind operation.
  // Ensure the message input field is not bound to old focus events.
  $('#msg') . unbind('focus');

  // Set up a new focus event handler for the message input.
  $('#msg') . focus( function()
  {
    var self = this; // Store reference to the input element.

    // Handle 'shift + enter' for new lines within the message.
    KeyboardJS . on('shift + enter' , function()
    {
      insertAtCaret( self , '\n' ); // Insert newline character.
      return false; // Prevent default action.
    });

    // Handle 'enter' for sending messages.
    KeyboardJS . on('enter' , function()
    {
      // Only send if the message input is not disabled.
      if ( $('#msg') . attr('disabled') !== 'disabled' )
      {
        sendMsg(); // Call the message sending function.
      }
      return false; // Prevent default action (e.g., form submission).
    });
  }); // End of focus event handler.

  // When the message input loses focus, clear keyboard shortcuts.
  $('#msg') . blur( function()
  {
    KeyboardJS . clear('enter');          // Clear 'enter' binding.
    KeyboardJS . clear('shift + enter');  // Clear 'shift + enter' binding.
  }); // End of blur event handler.

  // Attempt to apply custom scrollbars using jQuery.niceScroll.
  try
  {
    $('#chat , #users-list') . niceScroll({
      autohidemode: false ,     // Scrollbars are always visible.
      cursoropacitymin: 0.3 ,   // Minimum opacity for the scrollbar.
      cursoropacitymax: 0.3     // Maximum opacity for the scrollbar.
    });
  }
  // Catch any errors during the niceScroll application.
  catch (err)
  {
    console . error('Could not apply jQuery.niceScroll to the chatroom' , err);
  }

  // Ensure the chat window is scrolled to the bottom on render.
  scrollToBottom();
}; // End of Template.chatroom.rendered.



Template.chatroom.msgs = function()
{
  // Retrieve all messages from the superChatMsgs collection.
  return superChatMsgs . find();
}; // End of Template.chatroom.msgs.



Template.chatroom.getProfile = function(user_id)
{
  // Safely attempt to retrieve a user's superchat profile data.
  try
  {
    return Meteor . users . findOne(user_id) . superchat;
  }
  // If an error occurs (e.g., user not found), return undefined silently.
  catch ( err )
  {
    /* Error handling is intentionally minimal here. */
  }
}; // End of Template.chatroom.getProfile.



Template.chatroom.onlineUsers = function()
{
  // Fetch presence records for users who are currently logged in.
  var presences = Meteor . presences . find({ userId: { $exists: true } }) . fetch() ,
      ids       = _ . pluck(presences , 'userId') , // Extract user IDs from presences.
      query     = [];                               // Initialize array for user query.

  // If no online users are found, return early.
  if ( _ . isEmpty(ids) )
  {
    return;
  }

  // Construct a query array for fetching user details.
  for ( var i in ids )
  {
    query . push({ _id: ids[i] });
  }

  // Return Meteor user objects for all online users.
  return Meteor . users . find({ $or: query });
}; // End of Template.chatroom.onlineUsers.



Template.chatroom.events({
  // Event handler for clicking the message send button.
  'click .msg-send': function()
  {
    sendMsg(); // Trigger the message sending function.
  },

  // Event handler for keyup events on the message input field.
  'keyup #msg': function(event)
  {
    var target = event . target , // Get the event target element.
        len    = target . value . length; // Get current message length.

    // Truncate message if it exceeds 500 characters.
    if ( len > 500 )
    {
      target . value = target . value . substring(0 , 500);
    }
    else
    {
      // Update the character counter.
      $('#msg-counter') . text(500 - len);
    }
  },

  // Event handler for when the message input gains focus.
  'focus #msg': function(event)
  {
    // If a user is logged in, hide any login popover and exit.
    if ( Meteor . user() )
    {
      $('#login-buttons') . popover('hide');
      return;
    }

    // If not logged in, show a popover instructing the user to log in.
    $('#login-buttons') . popover({
      animation: true , // Enable popover animation.
      content: function()
      {
        return 'You first need to login before sending messages.';
      }
    }) . popover('show'); // Display the popover.
  },

  // Event handler for when the message input loses focus.
  'focusout #msg': function(event)
  {
    $('#login-buttons') . popover('hide'); // Hide any active login popover.
  },

  // Event handler for toggling the visibility of the users list.
  'click #toggle-users-list': function()
  {
    $('#users-list') . toggle(); // Toggle the display of the users list.
  }
}); // End of Template.chatroom.events.



sendMsg = function()
{
  var $msg = $('#msg'); // Cache the message input jQuery object.

  // Insert the new message into the superChatMsgs collection.
  superChatMsgs . insert({
    msg: $msg . val() ,     // Get the current value from the message input.
    owner: Meteor . userId() , // Store the ID of the current user.
    host: Path()            // Store the current chatroom path.
  });

  $msg . val(''); // Clear the message input field after sending.
}; // End of sendMsg function.



scrollToBottom = function()
{
  Meteor . defer(function()
  {
    // Attempt to scroll the chat window to the bottom.
    try
    {
      var chat = document . getElementById('chat'); // Get the chat element.
      chat . scrollTop = chat . scrollHeight;       // Set scroll position to bottom.
    }
    catch (err)
    {
      // Log any errors that occur during scrolling.
      /* console.error('Error scrolling chat to bottom:', err); */
    }
  });
}; // End of scrollToBottom function.



insertAtCaret = function(txtarea , text)
{
  // This function is adapted from a Stack Overflow answer.
  // It inserts text at the current cursor position in a textarea.

  var scrollPos = txtarea . scrollTop; // Store current scroll position.
  var strPos    = 0;                   // Initialize cursor position.

  // Determine browser type for cursor position handling.
  var br = ( (txtarea . selectionStart || txtarea . selectionStart == '0') ? "ff" : (document . selection ? "ie" : false) );

  if ( br == "ie" )
  {
    txtarea . focus();
    var range = document . selection . createRange();
    range . moveStart('character' , -txtarea . value . length);
    strPos = range . text . length;
  }
  else if ( br == "ff" )
  {
    strPos = txtarea . selectionStart;
  }

  // Split the textarea value and insert the new text.
  var front = (txtarea . value) . substring(0 , strPos);
  var back  = (txtarea . value) . substring(strPos , txtarea . value . length);
  txtarea . value = front + text + back;

  strPos = strPos + text . length; // Update cursor position after insertion.

  // Restore cursor position based on browser.
  if ( br == "ie" )
  {
    txtarea . focus();
    var range = document . selection . createRange();
    range . moveStart('character' , -txtarea . value . length);
    range . moveStart('character' , strPos);
    range . moveEnd('character' , 0);
    range . select();
  }
  else if ( br == "ff" )
  {
    txtarea . selectionStart = strPos;
    txtarea . selectionEnd   = strPos;
    txtarea . focus();
  }

  txtarea . scrollTop = scrollPos; // Restore scroll position.
}; // End of insertAtCaret function.



Deps.autorun(function()
{
  var user = Meteor . user(); // Get the current Meteor user.

  // Check if the user exists, has a profile, and if 'canChat' is explicitly false.
  if ( user && typeof user . profile . canChat !== 'undefined' && !user . profile . canChat )
  {
    // If user is banned, disable message input and send button, and set a message.
    $('#msg') . attr('disabled' , 'disabled');
    $('#msg') . val('You are banned for 60s for flooding.');
    $('.msg-send') . attr('disabled' , 'disabled');
  }
  else
  {
    // If user is not banned, enable message input and send button, and clear message.
    $('#msg') . removeAttr('disabled');
    $('#msg') . val('');
    $('.msg-send') . removeAttr('disabled');
  }
}); // End of Deps.autorun.