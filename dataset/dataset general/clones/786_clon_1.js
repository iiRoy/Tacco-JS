/*
 * Self-executing anonymous function to encapsulate the srcsetfill logic.
 * 'w' refers to the window object, passed as an argument to ensure it's
 * available within the closure without relying on global scope directly.
 */
( function ( w )
{


	/**
	 * Assigns the srcsetfill function to the window object. This makes it
	 * globally accessible and callable, for example, from event listeners.
	 * This function's primary purpose is to dynamically update image 'src'
	 * attributes based on their 'srcset' attribute values, adapting to the
	 * current viewport width.
	 */
	w.srcsetfill = function ()
	{
		/*
		 * Retrieve all image elements present in the document.
		 * 'srcsets' will be used as a temporary object to store parsed
		 * srcset definitions for a single image.
		 * 'winWidth' captures the current width of the browser viewport.
		 * 'infinityThreshold' defines an additional pixel buffer for
		 * determining when to load an "infinity" (largest available) image.
		 */
		var images              = document.getElementsByTagName( 'img' ),
			srcsets             = {},
			winWidth            = w.document.documentElement.clientWidth,
			infinityThreshold   = 200;


		/**
		 * Helper function responsible for parsing a list of srcset strings
		 * and populating the 'srcsets' object with the image URLs mapped
		 * to their corresponding widths.
		 *
		 * @param {Array<string>} sets - An array of individual srcset definitions,
		 *                               e.g., ["image-small.jpg 300w", "image-large.jpg 600w"].
		 */
		var buildSet = function ( sets )
		{
			/* Loop through each srcset definition in the provided array. */
			for ( var si = 0; si < sets.length; si++ )
			{
				/*
				 * Clean up any leading whitespace from the srcset string
				 * and then split it into two parts: the URL and the width descriptor.
				 * Example: " image.jpg 100w" becomes ["image.jpg", "100w"].
				 */
				var set = sets[ si ].replace( /^[\s]/, '' ).split( ' ' );

				/*
				 * Parse the width part of the srcset definition into an integer.
				 * The '10' specifies base-10 for parsing.
				 */
				var setw = parseInt( set[ 1 ], 10 );

				/*
				 * If no width descriptor is provided (e.g., "image.jpg"),
				 * it's treated as an "infinity" size, meaning it's the largest
				 * available image.
				 */
				if ( ! set[ 1 ] )
				{
					setw = 'infinity';
				}

				/*
				 * Store the image URL in the 'srcsets' object, using its
				 * determined width (or 'infinity') as the key.
				 */
				srcsets[ setw ] = set[ 0 ];
			}
		};


		/**
		 * Finds and returns the largest numeric width defined within the
		 * current 'srcsets' object. This is crucial for correctly handling
		 * images designated with 'infinity' widths.
		 *
		 * @param {Object} set - The 'srcsets' object containing all parsed
		 *                       image URLs and their widths.
		 * @returns {number} The largest numerical width found, or 0 if none.
		 */
		var getLargestSize = function ( set )
		{
			var largest = 0;

			/* Iterate over each property (which represents a size) in the 'srcsets' object. */
			for ( var size in srcsets )
			{
				/*
				 * Ensure the property belongs to 'srcsets' itself (not from its prototype chain)
				 * and check if the parsed integer value of the current 'size' is greater
				 * than the 'largest' size found so far. If so, update 'largest'.
				 */
				largest = ( srcsets.hasOwnProperty( size ) && parseInt( size, 10 ) > largest )
					? size
					: largest;
			}

			/* Return the largest size as an integer. */
			return parseInt( largest, 10 );
		};


		/*
		 * Main loop: Iterate through every image element found in the document.
		 * This loop orchestrates the srcset processing for each image.
		 */
		for ( var i = 0; i < images.length; i++ )
		{
			/*
			 * Check if the current image element has a 'srcset' attribute.
			 * If it doesn't, this image is skipped as there's no srcset to process.
			 */
			if ( images[ i ].getAttribute( 'srcset' ) )
			{
				/*
				 * Retrieve the value of the 'srcset' attribute and split it
				 * by commas to get an array of individual srcset definitions.
				 */
				var sets = images[ i ].getAttribute( 'srcset' ).split( ',' );

				/*
				 * Call the helper function to parse these definitions and
				 * populate the 'srcsets' object for the current image.
				 */
				buildSet( sets );

				/*
				 * Determine the largest numerical size available in the parsed srcset.
				 * This is used later to decide when to pick the 'infinity' image.
				 */
				var largestSize = getLargestSize( srcsets );

				/* Initialize a variable to hold the final image source URL. */
				var imgsrc = '';

				/*
				 * Loop through the populated 'srcsets' object to find the
				 * most appropriate image URL based on the current window width.
				 */
				for ( var size in srcsets )
				{
					/* Ensure the property is directly on the 'srcsets' object. */
					if ( srcsets.hasOwnProperty( size ) )
					{
						/*
						 * If the current window width is greater than or equal to
						 * the image's defined 'size' and this 'size' is not 'infinity',
						 * then this image is a candidate. We select the largest such candidate.
						 */
						if ( winWidth >= size && size !== 'infinity' )
						{
							imgsrc = srcsets[ size ];
						}
						/*
						 * If the 'size' is 'infinity' and the window width
						 * exceeds the largest defined size plus an additional threshold,
						 * then the 'infinity' image is selected.
						 */
						else if ( size === 'infinity' && winWidth > ( largestSize + infinityThreshold ) )
						{
							imgsrc = srcsets[ size ];
						}
					} /* End of hasOwnProperty check */
				} /* End of loop through srcsets for current image */

				/*
				 * Once the most suitable 'imgsrc' is determined, update the
				 * 'src' attribute of the current image element.
				 */
				images[ i ].src = imgsrc;
			} /* End of check for 'srcset' attribute */
		} /* End of main loop over all image elements */
	}; /* End of w.srcsetfill function definition */


	/*
	 * This section is responsible for attaching event listeners to ensure
	 * the `srcsetfill` function is executed at appropriate times:
	 * - On window resize, to adapt to viewport changes.
	 * - On DOMContentLoaded, to apply srcsets as soon as the DOM is ready.
	 * - On window load (as a fallback), to catch any images added later
	 *   or in cases where DOMContentLoaded might not fire as expected.
	 */
	if ( w.addEventListener )
	{
		/*
		 * Attach an event listener for the 'resize' event.
		 * 'false' indicates event bubbling.
		 */
		w.addEventListener( "resize", w.srcsetfill, false );

		/*
		 * Attach an event listener for 'DOMContentLoaded'. This fires
		 * when the initial HTML document has been completely loaded and
		 * parsed, without waiting for stylesheets, images, and subframes to finish loading.
		 */
		w.addEventListener( "DOMContentLoaded", function ()
		{
			/* Execute the srcsetfill function immediately. */
			w.srcsetfill();
			/*
			 * After DOMContentLoaded, the 'load' event listener is no longer
			 * strictly necessary for initial page load, so it's removed to
			 * prevent redundant execution or potential issues.
			 */
			w.removeEventListener( "load", w.srcsetfill, false );
		}, false );

		/*
		 * As a fallback, attach an event listener for the 'load' event.
		 * This ensures srcsetfill runs even if DOMContentLoaded is missed
		 * or if resources are dynamically added.
		 */
		w.addEventListener( "load", w.srcsetfill, false );
	}
	else if ( w.attachEvent )
	{
		/*
		 * For older versions of Internet Explorer (IE < 9) that do not
		 * support addEventListener, 'attachEvent' is used as an alternative.
		 * Note: 'attachEvent' only supports 'onload' and has different event model.
		 */
		w.attachEvent( "onload", w.srcsetfill );
	}

} )( this ); /* Execute the IIFE, passing 'this' which refers to the window object in a browser environment. */