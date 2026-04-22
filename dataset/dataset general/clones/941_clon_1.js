/*
 * This JavaScript code works in conjunction with CSS
 * to provide a workaround for some browser limitations,
 * specifically regarding 'object-fit: contain' and 'vh' units
 * which might not be fully supported or behave as expected
 * in all environments. It aims to achieve a similar visual effect.
 */


// Begin by defining a new Modernizr test.
// This test will determine if an image's height can be reliably
// scaled using a percentage-based value in the current browser.
Modernizr.addTest('img-pct-height',
	function( )
	{

		// Retrieve references to the HTML and body elements.
		var body = document.getElementsByTagName('html')[0] ,
			html = document.getElementsByTagName('html')[0] ,

			// Store the current height styles to restore them later.
			oldHtmlHeight = html.style.height ,
			oldBodyHeight = body.style.height ;

		// Temporarily set HTML and body heights to 100%
		// to create a consistent testing environment.
		html.style.height = '100%' ;
		body.style.height = '100%' ;


		// Create a new image element for the test.
		var img = document.createElement('img') ;

		// Assign a 1x1 transparent GIF as the source.
		// This minimizes network requests and ensures a minimal image.
		img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ; // A 1-pixel transparent GIF image.

		// Set the image's height to 100% to test scaling.
		img.style.height = '100%' ;

		// Append the image to the document body to render it.
		body.appendChild(img) ;

		// Get the computed height of the image and compare it
		// to the inner height of the window.
		// If they are equal, it indicates successful percentage-based scaling.
		var result = parseInt(window.getComputedStyle(img).height) === parseInt(window.innerHeight) ;

		// Clean up: remove the test image from the DOM.
		body.removeChild(img) ;

		// Restore original body and html heights.
		html.style.height = oldHtmlHeight;
		body.style.height = oldBodyHeight;

		// Return the test result (true if scaling works, false otherwise).
		return result ;

	}
) ;


// This is an Immediately Invoked Function Expression (IIFE).
// It creates a private scope for the following code.
( function( )
{

	// Defines a function to fit the height of '.photo' elements.
	var fitHeight = function( )
	{

		// Select all elements with the class 'photo'.
		var els = document.querySelectorAll('.photo') ;

		// Iterate over each selected '.photo' element.
		for ( var i = 0 , len = els.length ; i < len ; i++ )
		{

			// Get the first image element within the current '.photo' container.
			var img = els[i].getElementsByTagName('img')[0] ;

			// Calculate the aspect ratio of the image
			// using custom 'data-width' and 'data-height' attributes.
			var imgRatio = parseInt(img.getAttribute('data-width')) / parseInt(img.getAttribute('data-height')) ;

			// Calculate a constraining ratio based on the window's dimensions.
			// The '.9' factor suggests a desire for some padding or margin.
			var constrainingRatio = window.innerWidth / (window.innerHeight * .9) ;

			// Compare the image's aspect ratio with the constraining ratio.
			// If the image is "taller" (has a smaller ratio) than the available space,
			// add the 'tall' class for specific styling.
			if ( imgRatio < constrainingRatio )
			{
				els[i].classList.add('tall') ;
			}
			// Otherwise, ensure the 'tall' class is removed.
			else
			{
				els[i].classList.remove('tall') ;
			}
		}
	} ; // End of fitHeight function definition.

	// Call fitHeight once immediately after the script loads
	// to set initial sizing.
	fitHeight( ) ;

	// Add event listeners to re-run fitHeight whenever the window is resized
	// or the device orientation changes.
	window.addEventListener( 'resize' , fitHeight , false ) ;
	window.addEventListener( 'orientationchange' , fitHeight , false ) ;

} ) ( ) ; // The IIFE is invoked here.