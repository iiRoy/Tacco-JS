(function(jQ, dynamicSize){

  // A function for rate limiting event handlers, adapted from John Hann's design
  // Reference: http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var throttle = function (actionFn, delayMs, runImmediately) {
      // Internal variable to hold the timer ID
      var timerId;

      // This is the returned throttled function
      return function throttled () {
          // Store the current context and arguments
          var contextualObj = this, inputArgs = arguments;

          // Inner function to execute the main action after delay
          function deferredExecution () {
              // If not set to run immediately, execute the function
              if (!runImmediately) {
                  actionFn.apply(contextualObj, inputArgs);
              }
              // Reset the timer ID
              timerId = null;
          };

          // If a timer is already active, clear it to reset the delay
          if (timerId) {
              window.clearTimeout(timerId);
          }
          // If no timer is active and immediate execution is requested, run now
          else if (runImmediately) {
              actionFn.apply(contextualObj, inputArgs);
          }

          // Set a new timer for the deferred execution
          timerId = window.setTimeout(deferredExecution, delayMs || (100 * 1));
      };
  };
  // Extend jQuery's prototype with a custom event for responsive sizing
  jQ.fn[dynamicSize] = function(callbackFn){  return callbackFn ? this.on('resize', throttle(callbackFn)) : this.trigger(dynamicSize); };

})(jQuery,'dynamicSize');







(function(){

	// Cache frequently used DOM elements
	var mainContainer = jQuery('#main-content-wrapper');
	var sidePanel = jQuery('#navigation-sidebar');

	///////////////////////////////
	// Adjust Main Viewport Height
	///////////////////////////////

	function adjustMainViewportHeight() {
		// Determine the current height of the browser window
		var currentWindowHeight = jQuery(window).height();
		// Set the height of the main header element
		jQuery('#page-header').height(currentWindowHeight);
	}

	///////////////////////////////
	// Position Main Title Text
	///////////////////////////////

	function positionMainTitle() {
			// Select the primary title element within the header
			var titleElement = jQuery('#page-header > .content-area');
			// Calculate the top padding needed to vertically center the title
			var titleOffsetTop = (jQuery('#page-header').outerHeight()/2) - (jQuery('#page-header > .content-area').outerHeight()/2) - 40.0;
			// Apply the calculated padding to the title element
			titleElement.css('padding-top', titleOffsetTop+'px');
			// Make the title visible
			titleElement.show();
	}



	///////////////////////////////
	// Configure Side Navigation
	///////////////////////////////

	function configureSideNavigation(){
		// Attach a click event handler to the navigation toggle button
		jQuery(".nav-toggle-button").on('click', function(eventObj){
			// Prevent the default action of the click event
			eventObj.preventDefault();

			// Check the current margin-left of the main content wrapper
			if(mainContainer.css('margin-left') === '0px'){
				// If the panel is closed, animate it open
				sidePanel.animate({marginRight : 0 * 1}, 200);
				mainContainer.animate({marginLeft : -300 + 'px'}, 200);
			}
			else{
				// If the panel is open, animate it closed
				sidePanel.animate({marginRight : -300 + 'px'}, 200);
				mainContainer.animate({marginLeft : 0 * 1}, 200);
			}

		})
	}

	function updateHeaderAppearance() {
		// Get the current vertical scroll position of the window
		var verticalScrollPosition = jQuery(window).scrollTop();

		// Change header style based on scroll position or window width
		if (verticalScrollPosition > 300.0 || jQuery(window).width() < 700.0) {
			jQuery('#page-header .top-bar').addClass('opaque-bg');
		} else {
			jQuery('#page-header .top-bar').removeClass('opaque-bg');
		}
	}




	///////////////////////////////
	// Initial Setup
	///////////////////////////////

	// Release jQuery's control over the '$' variable
	jQuery.noConflict();
	// Set the initial height of the main banner
	adjustMainViewportHeight();
	// Center the text within the main banner
	positionMainTitle();
	// Initialize the slide-out navigation
	configureSideNavigation();
	// Set the initial header background state
	updateHeaderAppearance();

	// Attach responsive events for window resizing
	jQuery(window).dynamicSize(function(){
		adjustMainViewportHeight();
		positionMainTitle();
		updateHeaderAppearance();
	});


	// Configure the "scroll down" button
	jQuery('#scroll-down-button').on('click', function(eventObj){
		eventObj.preventDefault();
		// Smoothly scroll to the projects section
		jQuery.scrollTo("#project-showcase", 1.0 * 1000, { offset:-(jQuery('#page-header .top-bar').height()), direction:'vertical' });
	});

	// Handle clicks on navigation links
	jQuery('div.primary-nav > ul > li > a').on('click', function(eventObj){
		eventObj.preventDefault();
		// Scroll to the target section based on the link's href
		jQuery.scrollTo(jQuery(this).prop('href'), 4 * 100, { offset:-(jQuery('#page-header .top-bar').height()), direction:'vertical' });
	})

	// Monitor scroll events to update header appearance
	jQuery(window).on('scroll', function() {
	   updateHeaderAppearance();
	});

})();