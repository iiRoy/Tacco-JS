(function( globalObj, noValue ) {
	// Obtain a reference to the primary document object
	var htmlDoc = globalObj.document,
		// Retrieve the root element of the HTML document
		rootElement = htmlDoc.documentElement,
		// Define various advertisement display configurations based on screen dimensions
		configProfiles = [
			{
				profileName: 'alpha', // Designates the smallest screen profile
				totalSlots: 3,        // Number of ad slots available for this profile
				sizeRange: [1,480],   // Screen width range (minimum to maximum pixels)
				hiddenItems: []       // Any elements to be hidden in this configuration
			},
			{
				profileName: 'mid',   // Represents a medium-sized screen profile
				totalSlots: 3,
				sizeRange: [481,640],
				hiddenItems: ['CONTENT_SECTION'] // Specific content sections to conceal
			},
			{
				profileName: 'omega', // Denotes the largest screen profile
				totalSlots: 5,
				sizeRange: [641,960],
				hiddenItems: ['CONTENT_SECTION'] // Specific content sections to conceal
			}
		],
		// Fetch a comma-separated list of ad slot identifiers from a meta tag
		adSlotIDs = htmlDoc.getElementById( 'oas-positions' ).getAttribute( 'content' ).split( ',' ),
		// Variable to store the name of the currently active display profile
		activeProfileName = '',
		// Index of the last element in the configProfiles array
		profileCountIdx = configProfiles.length - 1,
		// Defines the upper screen dimension boundary for the default context (e.g., 960px)
		maxScreenThreshold = configProfiles[profileCountIdx].sizeRange[1],

		// Determine the relevant screen dimension for ad context selection.
		// If the viewport width exceeds the max threshold, use the threshold; otherwise, use the smaller of available width/height.
		viewportDimension = rootElement.clientWidth > maxScreenThreshold ? maxScreenThreshold : Math.min(globalObj.screen.availWidth, globalObj.screen.availHeight);

	// Iterate through the predefined configuration profiles in reverse order
	// to find the first profile that matches the current viewport dimension.
	for ( var idx = profileCountIdx; idx >= 0; idx-- ) {

		// Check if the current viewport dimension falls within the current profile's defined size range.
		if ( viewportDimension >= configProfiles[idx].sizeRange[0] && viewportDimension < configProfiles[idx].sizeRange[1] ) {
			// A matching profile has been found.
			var currentSlotCount = configProfiles[idx].totalSlots,
				// Calculate the starting index for slicing the adSlotIDs array.
				// If it's the first profile (idx 0), the offset is 0; otherwise, it's the total slots of the previous profile.
				startOffset = ( idx === 0 ? 0 : configProfiles[idx-1].totalSlots ),
				// Determine the ending index for slicing the adSlotIDs array.
				endOffset = currentSlotCount + startOffset;

			// Assign the subset of ad slots relevant to this profile to the ad manager.
			adManager.activeSlots = adSlotIDs.slice( startOffset, endOffset );
			// Set the name of the currently active profile.
			activeProfileName = configProfiles[idx].profileName;
			break; // Exit the loop as a matching profile has been identified.
		} else {
            // If no specific profile matches, this block handles the 'universal' or default context.
			// This scenario typically means all available ad positions are considered active.
			var startOffset = configProfiles[profileCountIdx].totalSlots, // Start after specific profile slots
				endOffset = adSlotIDs.length; // Include all remaining ad slots.

			// Assign the comprehensive list of ad slots to the ad manager.
			adManager.activeSlots = adSlotIDs.slice( startOffset, endOffset );
			activeProfileName = 'universal'; // Designate a generic name for the default context.
		}
	}

	// Initialize and configure properties of the global ad manager object.
	adManager.slotList = adManager.activeSlots; // The final list of ad positions to be utilized.
	adManager.requestParams = 'ad_profile=' + activeProfileName; // Constructs the query string parameter for the ad request.
	adManager.adServiceURL = 'http://adserver.example.com/ads/'; // Base URL for the ad serving system.
	adManager.linkTarget = '_top'; // Specifies where the ad links should open.
	adManager.randomNumGen = '01234567890'; // A seed string for generating unique identifiers.
	adManager.subRandomNum = '9876543210'; // A derived random number part, initially set.
	adManager.fullRandomVal = Math.random() + ''; // A full random value for further uniqueness.
	adManager.subRandomNum = adManager.randomNumGen.substring(2, 11); // Extracts a specific substring for a unique ID.
	adManager.managerVersion = 12; // The current version of this ad manager script.

	// Conditional logic for handling ad display based on development mode status.
	if ( adManager.isDevMode ) {
		// If in development mode, override the ad rendering function to prevent actual ad loading.
		globalObj.AD_RENDER_FUNC = function( slotId ) {
			console.info( 'Simulating ad display for slot: ' + slotId ); // Log a message indicating simulation.
			return false; // Return false to halt any further ad loading attempts.
		};
	} else {
		// In a production environment, dynamically write the ad script into the document.
		htmlDoc.writeln( '<script src="' + adManager.adServiceURL + 'adstream_v2.ads/' + adManager.pageIdentifier + '/1' + adManager.subRandomNum + '@' + adManager.slotList + '?' + adManager.requestParams + '"> <\/script>' );
	}

	/*
		The following code block presents a conceptual outline for implementing asynchronously loaded,
		responsive advertisements. It is important to note that this approach is fundamentally
		incompatible with traditional ad systems that rely on `document.write`.
	*/
	adManager.configureDynamicAds = function( elementsToScan ) {
		var dynamicSlotNames = [];
		// Iterate through provided elements to identify those designated for dynamic ad reflow.
		for ( var itemIdx = 0, itemLimit = elementsToScan.length; itemIdx < itemLimit; ++itemIdx ) {
			// Check if an element has the 'data-dynamic-ad' attribute.
			if ( elementsToScan[itemIdx].getAttribute('data-dynamic-ad') ) {
				// If present, add its value (the ad slot name) to our list.
				dynamicSlotNames.push( elementsToScan[itemIdx].getAttribute('data-dynamic-ad') );
			}
		}
		// Convert the array of dynamic slot names into a single comma-separated string.
		dynamicSlotNames = dynamicSlotNames.join(',');

		// This section is a placeholder for logic that would handle throttled, asynchronous ad loading.
		// Ideally, it would integrate `matchMedia` to make loading decisions based on current screen characteristics.
	};

	// A custom-built, cross-browser utility for registering event handlers.
	globalObj.registerEventHandler = (function () {
		var eventBinder; // This variable will store the appropriate event binding function.

		return function ( targetElement, eventName, callbackFunction ) {
			if ( !eventBinder ) {
				// Determine the correct event binding method based on browser support.
				if ( targetElement.addEventListener ) {
					// For modern browsers supporting W3C standard event listeners.
					eventBinder = function ( el, ev, fn ) {
						el.addEventListener( ev, fn, false );
					};
				} else if ( targetElement.attachEvent ) {
					// For older Internet Explorer versions using proprietary methods.
					eventBinder = function ( el, ev, fn ) {
						el.attachEvent( 'on' + ev, fn );
					};
				} else {
					// A fallback for very old or non-standard compliant browsers.
					eventBinder = function ( el, ev, fn ) {
						el['on' + ev] = fn;
					};
				}
			}
			// Execute the determined event binding method with the provided arguments.
			eventBinder( targetElement, eventName, callbackFunction );
		};
	}());

	// A utility function to debounce or throttle the execution of a given operation.
	// This is particularly useful for events that fire frequently, like 'resize'.
	var throttleExecution = function ( operation, delayTime, runImmediately ) {
		var timerId; // Stores the identifier for the pending timeout.

		return function debouncedFn () {
		    var contextObject = this, argumentsArray = arguments;

		    // An inner function that will execute the main operation after a delay.
		    function executeDelayed () {
		        if ( !runImmediately ) {
		            operation.apply( contextObject, argumentsArray ); // Execute the operation if not running immediately.
                }
		        timerId = null; // Clear the timer ID once the operation has run.
		    }

		    // If there's an existing timer, clear it to reset the debounce period.
		    if ( timerId ) {
		        clearTimeout( timerId );
            }
		    // If `runImmediately` is true and no timer is currently active, execute the operation now.
		    else if ( runImmediately ) {
		        operation.apply( contextObject, argumentsArray );
            }

		    // Set a new timer to execute the operation after the specified `delayTime`.
		    timerId = setTimeout( executeDelayed, delayTime || 250 ); // Defaults to 250ms if `delayTime` is not provided.
		};
	};

	/*
		All general debugging and console logging statements should be placed in this area.
	*/

})( this );