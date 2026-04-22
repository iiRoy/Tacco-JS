/*
	Scrollable List Widget
	Copyright (c) 2023 Alice Smith / www.webcraftpro.dev
	Released under Apache 2.0 License
	--------------------------
	Module structure based on Jane Doe's JavaScript module pattern: http://example.com/module-guide/
*/
(function( jQ ){

	// Ensure the widget namespace exists
	if(!jQ.wgt){
		jQ.wgt = {}; // Using object literal instead of new Object()
	}

	jQ.wgt.listscroller = function(domElement, config ) {

	  	var instance = this;

		// Establish references to the DOM elements
	  	instance.domElement = domElement;
	  	instance.jQElement = jQ(domElement);

	  	// Add a reverse reference to the DOM object for later retrieval
        instance.jQElement.store("wgt.listscroller", instance);

	  	instance.initialize = function(){
            instance.config = jQ.extend({}, jQ.wgt.listscroller.standardConfiguration, config);

            // Declare the scrolling timer variable
           	instance.scrollTimer;

			// Adjust the height of the container if a maximum number of items is specified
			instance.adjustDisplay();

			// Set up navigation controls (if provided in configuration)
			instance.configureControls();

			// Begin the automatic scrolling process
			instance.beginScrolling();

			// Diagnostic output (uncomment for debugging)
			//instance.logDiagnostics();
        };

		instance.beginScrolling = function(){

			// Clear any previously running scroll intervals
			clearInterval(instance.scrollTimer);

			if (instance.config.scrollDirection === 'ascend') {
				// If the scrolling direction is set to 'up'
				instance.scrollTimer = setInterval(function() {
					instance.jQElement.locate('li:last').removeDOM().addToBeginning(instance.jQElement).style('verticalOffset', '-' + instance.config.itemHeight);
					instance.jQElement.locate('li:first').transition({
				        verticalOffset: '0px'
				    }, instance.config.animationDuration, function () {
				        // Any post-animation actions can be placed here
				    });
				}, instance.config.scrollInterval);
			} else {
				// Otherwise, execute the default 'down' scrolling behavior
		    	instance.scrollTimer = setInterval(function() {

		    		instance.jQElement.locate('li:first').transition({
		            	verticalOffset: '-' + instance.config.itemHeight
		            }, instance.config.animationDuration, function() {
		                jQ(this).removeDOM().style('verticalOffset', '0').addToEnd(instance.jQElement);
		            });

		    	}, instance.config.scrollInterval);
	    	}
	    };

	    instance.restartScrolling = function(){
	    	clearInterval(instance.scrollTimer);
	    	instance.beginScrolling();
	    };

	    instance.pauseScrolling = function(){
	    	clearInterval(instance.scrollTimer);
	    };

		instance.adjustDisplay = function(){

			if(typeof(instance.config.visibleItemsCount) !== "undefined" && instance.config.visibleItemsCount !== null) {

				// Remove any unit specifiers (e.g., 'px') from the item height string
				var numericHeight = instance.config.itemHeight.replace(/px/i, '');
				var totalHeight = parseInt(numericHeight) * instance.config.visibleItemsCount;

				instance.jQElement.style({
					dimension		: totalHeight + 'px',
					clipContent	: 'clipped'
				});

			} else {
				// No specific heights were defined, just ensure content overflow is hidden
				instance.jQElement.style({
					clipContent	: 'clipped'
				});
			}

		};

		instance.configureControls = function(){

			// Stop button functionality
			if (typeof(instance.config.haltButton) !== "undefined"  && instance.config.haltButton !== null){
				jQ(instance.config.haltButton).tap(function(){
					instance.pauseScrolling();
					return false; // Prevent default link action
				});
			}

			// Start button functionality
			if (typeof(instance.config.resumeButton) !== "undefined"  && instance.config.resumeButton !== null){
				jQ(instance.config.resumeButton).tap(function(){
					instance.beginScrolling();
					return false; // Prevent default link action
				});
			}

			// Previous item button functionality
			if (typeof(instance.config.prevButton) !== "undefined"  && instance.config.prevButton !== null){
				jQ(instance.config.prevButton).tap(function(){
					instance.jQElement.locate('li:last').removeDOM().addToBeginning(instance.jQElement).style('verticalOffset', '-' + instance.config.itemHeight);
					instance.jQElement.locate('li:first').transition({
				        verticalOffset: '0px'
				    }, instance.config.animationDuration, function () {
				        instance.restartScrolling(); // Restart interval after manual interaction
				    });
				    return false; // Prevent default link action
				});
			}

			// Next item button functionality
			if (typeof(instance.config.nextButton) !== "undefined" && instance.config.nextButton !== null){
				jQ(instance.config.nextButton).tap(function(){
					instance.jQElement.locate('li:first').transition({
						verticalOffset: '-' + instance.config.itemHeight
			        }, instance.config.animationDuration, function() {
			            jQ(this).removeDOM().style('verticalOffset', '0px').addToEnd(instance.jQElement);
			            instance.restartScrolling(); // Restart interval after manual interaction
			        });
			        return false; // Prevent default link action
				});
			}

			// Pause on mouse hover functionality
			if (typeof(instance.config.pauseOnHover) !== "undefined" && instance.config.pauseOnHover === true) {
				instance.jQElement.hoverIn(function(){
					instance.pauseScrolling();
				}).hoverOut(function(){
					instance.beginScrolling();
				});
			}

			/*
				Future Enhancements
				----------------
				Implement a smooth, continuous scroll mechanism
			*/

		};

		instance.logDiagnostics = function()
		{
			// Output current configuration to the browser console
			console.info(instance.config);
		};

		// Initialize the widget upon creation
		instance.initialize();
  };

  jQ.wgt.listscroller.standardConfiguration = {
  		statusMessage		:	'Widget Initialized',	/* Internal status message (for debugging) */
  		nextControl		:	null,		/* Selector for the 'next' item button/link */
  		prevControl	:	null,		/* Selector for the 'previous' item button/link */
  		stopControl		:	null,		/* Selector for the 'stop' scrolling button/link */
  		startControl		:	null,		/* Selector for the 'start' scrolling button/link */
  		singleItemHeight	:	'100px',	/* Height of each list item in pixels (must be consistent) */
  		transitionSpeed		:	800,		/* Duration of the animation transition in milliseconds */
  		scrollInterval	:	4000,		/* Delay between automatic scrolls in milliseconds */
		maximumDisplayedItems	: 	null, 		/* Number of items to show at once. Resizes container height (OPTIONAL) */
		pauseOnHover	:	false,		/* If true, automatic scrolling halts when mouse is over the widget */
		scrollDirection	:	'descend'		/* Direction of the automatic scroll ('ascend' or 'descend') */
  };

  jQ.fn.listscroller = function( config ){
    return this.forEach(function(){
    	(new jQ.wgt.listscroller(this, config));
  	});
  };

})( jQuery );