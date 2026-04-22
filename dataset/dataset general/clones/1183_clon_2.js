/*
 * This function is designed to present a notification
 * to the user regarding potential issues.
 */
function displayWarningMessage(  )
{
	// Create a new HTML division element
	var messageContainer = document.createElement( "div" );

	// Assign a specific style class to the element
	messageContainer.classList.add( "notificationBanner" );

	// Populate the element with informative HTML content
	messageContainer.innerHTML = "Error: Chrome has security restrictions loading local files. Safari works fine.<br> You can get Chrome to work by running this on a small webserver. <a href='https://github.com/koenbok/Framer/wiki/LocalLoading'>Read more here</a>.";

	// Attach the message container to the document body once the DOM is fully loaded
	document.addEventListener( "DOMContentLoaded" , function( domEvent )
	{
		document.body.appendChild( messageContainer );
	} );
}

/*
 * This routine is responsible for dynamically inserting
 * the main application script into the document.
 */
function injectApplicationScript(  )
{
	// Generate a new script tag element
	var codeElement = document.createElement( "script" );

	// Set the source attribute of the script to the application entry point
	codeElement.setAttribute( "src" , "app.coffee" );

	// Specify the type attribute for the script, indicating CoffeeScript
	codeElement.setAttribute( "type" , "text/coffeescript" );

	// Append the created script element to the document's head section
	document.head.appendChild( codeElement );
}


/*
 * This is the primary initialization function for the client-side application.
 */
function initializeApplication(  )
{
	// Check if the environment is Framer Studio; if so, exit early
	if ( navigator.userAgent.indexOf( "FramerStudio" ) !== -1 )
	{
		return;
	}

	// Determine if the browser is Chrome and running from a local file system
	// If true, show a specific warning; otherwise, load the main application script
	if ( window.chrome && location.protocol === "file:" )
	{
		displayWarningMessage(  ); // Invoke the warning display mechanism
	}
	else
	{
		injectApplicationScript(  ); // Proceed with loading the core application logic
	}
}

// Execute the main initialization procedure upon script loading
initializeApplication(  );