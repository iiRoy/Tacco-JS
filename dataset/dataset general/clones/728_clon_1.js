/*
 * This module exports a function that configures a bot action.
 * It defines the 'giveop' command, allowing privileged users to grant operator status.
 */
module .exports =  function ( self ) {
	// The function returns an object defining the action's properties.
	return {
		/*
		 * The name of this particular action.
		 * Used for identification within the bot's action registry.
		 */
		"actionName" : "giveop",

		// User-friendly help text displayed when someone asks for help with this command.
		"helpText": "Just say 'giveop' followed by the password to be made op",

		// A simpler string trigger, often used for basic command matching.
		"simpleTrigger": "giveop",

		/*
		 * The primary trigger for this action. It's a regular expression.
		 * This regex matches "giveop" optionally followed by any non-whitespace characters.
		 * The 'i' flag makes the match case-insensitive.
		 */
		"trigger" : /giveop ?(\S)*/i ,

		/*
		 * The core logic executed when the 'trigger' regex matches a message.
		 * Parameters:
		 *   - from: The user who sent the message.
		 *   - msg: The full message content.
		 *   - matches: An array of matches from the 'trigger' regex.
		 *   - self: A reference to the bot instance itself.
		 */
		"doAction": function ( from , msg , matches , self ) {
			// Check if the message contains the configured password.
			if ( msg .indexOf ( self .opts .password ) > -1 ) {
				// If the password is present, grant operator status to the sender.
				self .grantOp ( from ) ;
				// Respond with a random administrative quote.
				return self .randomAdminQuote ( to ) ;
			} else {
				// If the password is not found, deny the request with a playful message.
				return "uh uh uh! You didn't say the magic word!" ;
			}
		} , // End of doAction function definition.

		/*
		 * Defines how the bot should respond to messages, based on their type.
		 * E.g., if a PM is received, respond publicly. If a public message, respond publicly.
		 */
		"responseMethods" : { "pm" : "public" , "public" : "public" }

	} ; // End of the action object.
}; // End of module.exports function.