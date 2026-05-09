/*
 * This file defines various JavaScript functionalities for a chat application.
 * It includes templates for displaying messages and functions for managing
 * message loading, sending, and UI interactions.
 */

// Template for messages received from other chat participants.
// Uses Underscore.js for templating.
var otherChatterMessageTemplate =  _.  template(
	' \
	<div style = "margin: 16px;" id = "message-<%= id %>" > \
		<span style = "color: #929197; font-size: 12px; display: <%= chat %>" class = "chattername" > <%= chatter %> </span > \
		<div class = "row" style = "border-radius: 16px; padding: 8px 16px 8px 16px; background-color: #e6e5eb;" > \
			<%= message %> \
		</div > \
	</div >'
);


// Template for messages sent by the current user.
// Uses Underscore.js for templating.
var myMessageTemplate =  _.  template(
	' \
	<div style = "margin: 16px;" > \
		<div class = "row" style = "border-radius: 16px; padding: 8px 16px 8px 16px; background-color: #027bfe; color: #fbfeff;" > \
			<%= message %> \
		</div > \
	</div >'
);



// Global variable to store the currently active contact's identifier.
var contact          ;

// Global variable to store the text of the latest message loaded.
var latestMessageText = "" ;


/**
 * Retrieves the ID of the currently selected conversation container.
 * @returns {string} The data-id attribute value of the conversation container.
 */
function getContactId ( )
{
	return $ ( '#conversationcontainer' ) . attr ( 'data-id' ) ;
}


/**
 * Loads all messages for the currently selected contact or chat.
 * Updates the UI with the retrieved messages.
 */
function loadMessages ( )
{
	var isChat    = false ;     // Flag to check if the current conversation is a group chat.
	var chatTitle = ""    ;     // Placeholder for a potential chat title (not fully used here).

	// Get the contact ID and clean it.
	contact = getContactId ( ) . trim ( ) ;

	// Check if the contact ID indicates a group chat.
	if ( contact.indexOf ( '-chat' ) > -1 )
	{
		$ ( "#contactname" ) . text ( contact . split ( '-chat' ) [ 0 ] ) ; // Display chat name.
		contact = 'chat' + contact . split ( '-chat' ) [ 1 ] ;              // Adjust contact ID for backend.
		isChat  = true ;                                                    // Set chat flag.
	}
	// Check if the contact ID is not an email (implies a phone number).
	else if ( contact.indexOf ( '@' ) === -1 )
	{
		// Fetch contact name from phone number via AJAX.
		$.get ( "/getNameFromPhone/" + contact , function ( data )
		{
			if ( data . trim ( ) === "" )
			{
				$ ( "#contactname" ) . text ( contact ) ; // Fallback to raw contact ID if name not found.
				return ;
			}

			$ ( "#contactname" ) . text ( data ) ; // Display the retrieved name.
		} ) ;
	}
	// Default case: contact ID is an email or regular identifier.
	else
	{
		$ ( "#contactname" ) . text ( contact ) ; // Display the contact ID as is.
	}

	// Fetch all messages for the current contact/chat.
	$.get ( "/getAllMessagesInChat/" + contact , function ( data )
	{
		$ ( "#messagelist" ) . empty ( ) ; // Clear existing messages.

		// Iterate through each message received.
		$.each ( data , function ( index , message )
		{
			// Determine if the message was sent by the current user ("me").
			if ( message . chatter === "me" )
			{
				// Append user's message using the 'myMessageTemplate'.
				$ ( "#messagelist" ) . append (
					myMessageTemplate ( { message : message . text } )
				) ;
			}
			else
			{
				// Append other chatter's message using 'otherChatterMessageTemplate'.
				// 'chat' display property is set based on 'isChat' flag.
				$ ( "#messagelist" ) . append (
					otherChatterMessageTemplate ( { chatter : message . chatter , message : message . text , chat : ( ( isChat ) ? 'block' : 'none' ) , id : index } )
				) ;

				// If it's a group chat, fetch the name of the chatter.
				if ( isChat )
				{
					$.get ( "/getNameFromPhone/" + message . chatter , function ( data )
					{
						if ( data . trim ( ) === "" )
						{
							return ; // Do nothing if name is empty.
						}

						// Update the chatter's name in the displayed message.
						$ ( "#message-" + index ) . find ( '.chattername' ) . text ( data ) ;
					} ) ;
				}
			}
			latestMessageText = message . text ; // Update the latest message text.
		} ) ;

		// UI adjustments after loading messages.
		$ ( '#conversationcontainer' ) . removeClass ( 'hide' ) ;     // Show conversation view.
		$ ( '#conversationlistcontainer' ) . addClass ( 'hide' ) ;    // Hide contact list.
		$ ( "html, body" ) . animate ( { scrollTop : $ ( document ) . height ( ) } , "slow" ) ; // Scroll to bottom.
	} ) ;
}


// Set up an interval to periodically check for new messages.
setInterval ( function ( )
{
	// Only proceed if a contact is currently selected.
	if ( ! contact )
	{
		return ;
	}

	// Fetch the last message in the current chat.
	$.get ( "/getLastMessageInChat/" + contact , function ( data )
	{
		// If the latest message retrieved is different from the one currently displayed, reload all messages.
		if ( data . text !== latestMessageText )
		{
			loadMessages ( ) ;
		}
		else
		{
			// Console log for debugging, indicating no new messages.
			// console . log ( 'no need to reload messages current message is ' + data . text ) ;
		}
	} ) ;
} , 5000 ) ; // Check every 5 seconds.


/**
 * Event listener for the 'Enter' key press in the new message input field.
 * Sends the message if 'Enter' is pressed.
 * @param {Event} event - The keyboard event object.
 */
var enterKeyListener = function ( event )
{
	// console . log ( event ) ; // Debugging: log the event object.
	var keycode = parseInt ( event . keyCode ? event . keyCode : event . which ) ; // Get the key code.

	// If the 'Enter' key (keycode 13) is pressed.
	if ( keycode === 13 )
	{
		var msg = $ ( '#newmessagetext' ) . val ( ) ; // Get message text from input.
		$ ( '#newmessagetext' ) . val ( '' ) ;       // Clear the input field.

		// Send the new message via AJAX POST request.
		$.ajax ( {
			type     : "POST" ,
			url      : "/sendNewMessage" ,
			data     : { to : contact , message : msg } ,
			success  : function ( )
			{
				loadMessages ( ) ; // Reload messages on successful send.
			} ,
			dataType : "json"
		} ) ;
	}
} ;


/**
 * Event listener for clicking the "Back to Contact List" button.
 * Hides the conversation view and shows the contact list.
 */
var backToContactListClick = function ( )
{
	$ ( '#conversationcontainer' ) . addClass ( 'hide' ) ;      // Hide the conversation UI.
	$ ( '#conversationlistcontainer' ) . removeClass ( 'hide' ) ; // Show the list of conversations.
} ;