function     showAlert   (  ) {
		/* This function is responsible for displaying an alert message to the user.
		 * It creates a new DIV element, adds a specific CSS class,
		 * and populates its innerHTML with a warning about Chrome's local file restrictions. */
		var alertNode = document.createElement   (  "div"  )  ;


		alertNode.classList.add   (   "framerAlert"   )  ;
		alertNode.innerHTML    =    "Error: Chrome has security restrictions loading local files. Safari works fine.<br> You can get Chrome to work by running this on a small webserver. <a href='https://github.com/koenbok/Framer/wiki/LocalLoading'>Read more here</a>."   ;

		// Once the DOM is fully loaded, append the alert node to the document body.
		document.addEventListener   (  "DOMContentLoaded"  ,   function   (  event  )    {
				document.body.appendChild   (  alertNode  )  ;
		}  )  ;
}  ;



function     loadApp    (  )   {
	// This function dynamically loads the main application script.
	var scriptNode   =   document.createElement   (   "script"   )   ;

	scriptNode.setAttribute   (   "src"   ,   "app.coffee"   )   ;
	scriptNode.setAttribute   (   "type"   ,   "text/coffeescript"   )   ;
	// Append the script element to the document's head to initiate loading.
	document.head.appendChild   (   scriptNode   )   ;
}  ;




function     init   (  )   {

	/*
	 * This is the main initialization function.
	 * It checks the environment and decides whether to show a warning or load the app.
	 */

	// Check if the code is running inside Framer Studio. If so, do nothing.
	if    (    navigator.userAgent.indexOf   (   "FramerStudio"   )    !=    -1    )
		return   ;


	/*
	 * Determine if the browser is Chrome AND if the page is loaded from a local file system.
	 * If both conditions are true, trigger the warning alert.
	 * Otherwise, proceed to load the main application script.
	 */
	if    (    window.chrome    &&    location.protocol    ==    "file:"    )
		showAlert   (  )  ;
	else
		loadApp   (  )  ;
}  ;

// Execute the initialization routine when the script is loaded.
init   (  )  ;