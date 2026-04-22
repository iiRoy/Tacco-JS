/*
 * This file demonstrates various functionalities of the Namespace utility.
 * It showcases namespace creation, property definition, asynchronous loading,
 * and event handling.
 */

// Initialize an empty top-level namespace.
Namespace ( 'com.sandbox' ) ;


// Create or extend the 'com.sandbox' namespace with new properties.
// This block defines a 'Console' utility object.
Namespace
(
	'com.sandbox',
	{
		// The Console object provides logging capabilities.
		Console :
		{
			// The 'log' method appends messages to a specific HTML element.
			log : function ( message )
			{
				var element = document . getElementById ( 'console' ) ; // Retrieve the console element.
				element . innerHTML = element . innerHTML + message + '<br />' ; // Append message and a line break.
			} // End of log function definition.
		} // End of Console object.
	} // End of properties object for 'com.sandbox'.
) ;


// Call the 'log' method of the 'Console' object using its fully qualified name (FQN).
com . sandbox . Console . log ( 'hello world' ) ;


// Import all properties from 'com.sandbox' directly into the global scope.
// This makes 'Console' accessible without the 'com.sandbox' prefix.
Namespace . use ( 'com.sandbox.*' ) ;

// Now, 'Console.log' can be called directly.
Console . log ( 'unpacked hello world' ) ;


/*
 * Asynchronously include the 'com/sandbox/SayHiClass.js' file.
 * A callback function is executed once the file has been successfully loaded.
 */
Namespace . include
(
	'com.sandbox.SayHiClass',
	function ( )
	{
		// Instantiate the 'SayHiClass' after it has been loaded.
		new com . sandbox . SayHiClass ( ) ;
	}
) ;


/*
 * This 'use' call automatically includes 'com/sandbox/MyNameIsClass.js'
 * and then imports 'MyNameIsClass' into the global scope.
 * The operation is asynchronous due to the provided callback.
 */
Namespace . use
(
	'com.sandbox.MyNameIsClass',
	function ( )
	{
		// Create a new instance of 'MyNameIsClass', which is now globally available.
		new MyNameIsClass ( 'peter' ) ;
	}
) ;


/*
 * Demonstrate chaining 'from' and 'use' methods.
 * First, it includes the file 'com/sandbox/classes.js'.
 * Then, it imports all properties from 'com.sandbox.classes' into the current scope.
 * The 'use' identifier can be relative (e.g., '.*') or absolute.
 */
Namespace
	. from ( 'com.sandbox.classes' )
	. use
	(
		'com.sandbox.classes.*',
		function ( )
		{
			// Instantiate classes that were loaded and imported from 'com.sandbox.classes'.
			new MyClass1 ( ) ;
			new MyClass2 ( ) ;
		}
	) ;


// Register an event listener for the 'includeError' event.
// This function will be triggered if any 'include' operation fails to load a file.
Namespace
	. addEventListener
	(
		'includeError',
		function ( event )
		{
			// Log the error message to our custom console.
			Console . log ( 'an error occured loading ' + event . identifier ) ;
		}
	) ;

// Attempt to include a non-existent file to trigger the 'includeError' event listener.
Namespace . include ( 'com.sandbox.toto' ) ; // This call is expected to fail.