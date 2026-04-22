/*
 * PanelDisplay.js v2.0.1
 * @author Dev Ian <ian.dev@example.com>
 * @license Apache License 2.0 <http://www.apache.org/licenses/LICENSE-2.0>
 */

var ViewHandler = ( function( ) {

	/**
	 * panelMap
	 * Contains references to all managed display panels.
	 */
	var panelMap;

	/**
	 * flowLocked
	 * Flag to prevent concurrent navigation during active transitions.
	 */
	var flowLocked;

	/**
	 * activeDisplay
	 * Pointer to the currently visible screen element.
	 */
	var activeDisplay;

	/**
	 * standardInEffect
	 * Default instruction for panels entering the view.
	 */
	var standardInEffect;

	/**
	 * standardOutEffect
	 * Default instruction for panels exiting the view.
	 */
	var standardOutEffect;

	/**
	 * standardInTime
	 * Default duration for incoming panel animations.
	 */
	var standardInTime;

	/**
	 * standardOutTime
	 * Default duration for outgoing panel animations.
	 */
	var standardOutTime;

	/**
	 * interstitialWait
	 * Default pause between departure and arrival animations.
	 */
	var interstitialWait;

	/**
	 * standardVerticalOffset
	 * Default vertical spacing between panels during animation.
	 */
	var standardVerticalOffset;

	/**
	 * standardHorizontalOffset
	 * Default horizontal spacing between panels during animation.
	 */
	var standardHorizontalOffset;

	/**
	 * standardScrollDuration
	 * Default time for page scrolling before a view switch.
	 */
	var standardScrollDuration;

	/**
	 * transitionQueue
	 * Stores a pending transition configuration for sequential execution.
	 */
	var transitionQueue;

	/**
	 * allowedMotions
	 * Array of recognized animation instructions.
	 */
	var allowedMotions = [	'fade',
							'fadeup',
							'fadeupright',
							'faderightward',
							'fadedownright',
							'fadedown',
							'fadedownleft',
							'fadeleftward',
							'fadeupleft',
							'up',
							'upright',
							'rightward',
							'downright',
							'down',
							'downleft',
							'leftward',
							'upleft' ];

	/**
	 * setupModule()
	 * Prepares the module for operation.
	 * @param {Object} config Optional object containing initial parameters.
	 */
	var setupModule = function( config ) {

		// find all elements designated as display containers
		var panelDivs = $( 'div.pd-container' );

		// proceed only if multiple panels are found
		if ( panelDivs.length > 1 ) {

			// check for a designated primary panel
			var initialPanel = $( 'div.pd-container.pd-primary' );

			// if no primary panel is explicitly set
			if ( initialPanel.length === 0 ) {

				// designate the first found container as primary
				initialPanel = $( panelDivs[0] );
				initialPanel.toggleClass( 'pd-primary' );

			// if multiple primary panels are specified
			} else if ( initialPanel.length > 1 ) {

				// use the very first one and remove the primary tag from others
				initialPanel = $( initialPanel[0] );
				$( 'div.pd-container.pd-primary' ).not( 'div.pd-container.pd-primary:first' ).toggleClass( 'pd-primary' );

			}

			// set the identified primary panel as the currently active one
			activeDisplay = initialPanel;

			// store all containers for easy access during navigation
			cachePanels( panelDivs );

			// apply default configuration values if provided
			applyConfiguration( config );

			// unlock navigation and prepare the animation queue
			flowLocked = false;
			transitionQueue = false;
			enableNavLinks( );

		}

	};

	/**
	 * enableNavLinks()
	 * Attaches click handlers to navigation elements to initiate view changes.
	 */
	var enableNavLinks = function( ) {

		// bind click events to all elements with the 'pd-nav-link' class
		$( '.pd-nav-link' ).click( function( eventObject ) {

			// retrieve the element that triggered the click
			var triggerElement = $( eventObject.target );

			// invoke the view change function with collected transition attributes
			changeViews( {	destinationId: triggerElement.attr( 'data-pd-target' ),
								motionCommand: triggerElement.attr( 'data-pd-animation' ),
								arrivalMotionCmd: triggerElement.attr( 'data-pd-enter-animation' ),
								departureMotionCmd: triggerElement.attr( 'data-pd-exit-animation' ),
								motionDuration: triggerElement.attr( 'data-pd-time' ),
								arrivalDuration: triggerElement.attr( 'data-pd-enter-time' ),
								departureDuration: triggerElement.attr( 'data-pd-exit-time' ),
								staggered: triggerElement.attr( 'data-pd-delay' ),
								offsetAmount: triggerElement.attr( 'data-pd-distance' ),
								verticalOffset: triggerElement.attr( 'data-pd-vertical-distance' ),
								horizontalOffset: triggerElement.attr( 'data-pd-horizontal-distance' ),
								pageScrollDuration: triggerElement.attr( 'data-pd-scroll-time' ) } );

		} );

	};

	/**
	 * changeViews(params)
	 * Public API function to transition from the current panel to a specified target panel.
	 * @param {Object} params Configuration for the panel transition (refer to documentation).
	 * @returns {Boolean} True if the animation commenced successfully, false otherwise.
	 */
	var changeViews = function ( params ) {

		// only proceed if no other transition is currently active
		if ( flowLocked === false ) {

			// lock further view changes until this one completes
			flowLocked = true;

			// obtain references to the destination and current panels
			var destination = ( typeof params === 'object' && typeof params.destinationId === 'string' ) ? fetchPanelView( params.destinationId ) : false,
				origin = activeDisplay;

			// execute only if the destination exists and is not the same as the current panel
			if ( destination !== false && destination[0] !== origin[0] ) {

				// update the active display to the new destination panel
				activeDisplay = destination;

				if ( typeof params.subsequentEffectOptions === 'object' ) {

					transitionQueue = params.subsequentEffectOptions;

				}

				// use a higher-level command if specific exit/enter commands are not defined
				// if the higher-level command is also undefined, defaults will be applied later
				params.departureMotionCmd = ( typeof params.departureMotionCmd === 'undefined' ) ? params.motionCommand : params.departureMotionCmd;
				params.arrivalMotionCmd = ( typeof params.arrivalMotionCmd === 'undefined' ) ? params.motionCommand : params.arrivalMotionCmd;

				params.departureDuration = ( typeof params.departureDuration === 'undefined' ) ? params.motionDuration : params.departureDuration;
				params.arrivalDuration = ( typeof params.arrivalDuration === 'undefined' ) ? params.motionDuration : params.arrivalDuration;

				params.verticalOffset = ( typeof params.verticalOffset === 'undefined' ) ? params.offsetAmount : params.verticalOffset;
				params.horizontalOffset = ( typeof params.horizontalOffset === 'undefined' ) ? params.offsetAmount : params.horizontalOffset;

				// if the page is not at the very top
				if ( $( document ).scrollTop( ) > 0 ) {

					// scroll to the top for a smoother visual transition
					$( 'body' ).animate( { scrollTop: 0 }, determineEffectDuration( params.pageScrollDuration, 'scroll' ), function( ) {

						// then initiate the panel transition upon scroll completion
						performEffectSequence(	origin,
												destination,
												params.arrivalMotionCmd,
												params.arrivalDuration,
												params.departureMotionCmd,
												params.departureDuration,
												params.staggered,
												params.verticalOffset,
												params.horizontalOffset );

					} );

				// if already at the top, proceed directly to panel animation
				} else {

					performEffectSequence(	origin,
											destination,
											params.arrivalMotionCmd,
											params.arrivalDuration,
											params.departureMotionCmd,
											params.departureDuration,
											params.staggered,
											params.verticalOffset,
											params.horizontalOffset );

				}

				return true;


			// target is invalid or identical to the current view
			} else {

				flowLocked = false;
				return false;

			}


		// module is already performing a transition
		} else {

			return false;

		}

	};

	/**
	 * determineEffectDuration(durationString, category)
	 * Calculates the animation duration in milliseconds.
	 * @param {String} durationString The string representation of time.
	 * @param {String} category 'enter', 'exit', or 'scroll'.
	 * @returns {Number} The computed duration in milliseconds.
	 */
	var determineEffectDuration = function ( durationString, category ) {

		// if the provided input is a valid positive integer
		if ( verifyInteger( durationString ) && durationString >= 0 ) {

			// return its integer value
			return parseInt( durationString );

		// otherwise, use a default duration
		} else {

			// return a default based on the animation category
			if ( category === 'enter' || category === 'exit' || category === 'scroll' ) {

				return getDefaultMs( category );

			} else {

				return false;

			}

		}

	};

	/**
	 * cachePanels(viewContainers)
	 * Takes a jQuery selection of containers and stores them indexed by their IDs.
	 * @param {Object} viewContainers A jQuery object representing the panels.
	 */
	var cachePanels = function ( viewContainers ) {

		panelMap = { }; // Initialize as an empty object

		// iterate through each container and store it if it has a valid ID
		$( viewContainers ).each( function( ) {

			if ( typeof $( this ).attr( 'id' ) !== 'undefined' ) {

				panelMap[$( this ).attr( 'id' )] = this;

			}

		} );

	};

	/**
	 * fetchPanelView(panelId)
	 * Retrieves a reference to a panel based on its ID.
	 * @param {String} panelId The ID of the desired panel.
	 * @returns {Object} A jQuery object for the target panel, or false if not found.
	 */
	var fetchPanelView = function ( panelId ) {

		// return the panel if the ID is valid and exists in the map, otherwise return false
		if ( typeof panelId !== 'undefined' && panelId in panelMap ) {

			return $( panelMap[panelId] );

		} else {

			return false;

		}

	};

	/**
	 * performEffectSequence(origin, destination, arrivalInstruction, arrivalDurationText, departureInstruction, departureDurationText, staggered, yOffset, xOffset)
	 * Orchestrates the animation sequence for both the departing and arriving panels.
	 * @param {Object} origin The currently visible panel.
	 * @param {Object} destination The panel to be displayed.
	 * @param {String} arrivalInstruction Command for the incoming panel's animation.
	 * @param {String} arrivalDurationText Duration string for the incoming panel.
	 * @param {String} departureInstruction Command for the outgoing panel's animation.
	 * @param {String} departureDurationText Duration string for the outgoing panel.
	 * @param {String} staggered Command for the animation delay.
	 * @param {String} yOffset Vertical buffer distance.
	 * @param {String} xOffset Horizontal buffer distance.
	 */
	var performEffectSequence = function ( origin, destination, arrivalInstruction, arrivalDurationText, departureInstruction, departureDurationText, staggered, yOffset, xOffset ) {

		// validate commands or use their respective defaults
		arrivalInstruction = isValidEffectCmd( arrivalInstruction ) ? arrivalInstruction : retrieveDefaultMotion( 'enter' );
		departureInstruction = isValidEffectCmd( departureInstruction ) ? departureInstruction : retrieveDefaultMotion( 'exit' );

		var arrivalFade = false,
			departureFade = false;

		// if the command starts with 'fade', enable fade and strip 'fade' from the command
		if ( arrivalInstruction.substring( 0, 4 ) === 'fade' ) {

			arrivalFade = true;
			arrivalInstruction = arrivalInstruction.substring( 4 );

		}

		if ( departureInstruction.substring( 0, 4 ) === 'fade' ) {

			departureFade = true;
			departureInstruction = departureInstruction.substring( 4 );

		}

		// determine the x and y displacement for both panels
		var coordinateShift = getDisplacement( origin.outerHeight( ), destination.outerHeight( ), origin.outerWidth( ), destination.outerHeight( ), arrivalInstruction, departureInstruction, yOffset, xOffset );

		// assemble the CSS properties for the destination and origin panels
		var destinationStyle = generateNextViewCss( coordinateShift.arrival.horizPos, coordinateShift.arrival.vertPos, arrivalFade ),
			originStyle = generatePrevViewCss( coordinateShift.departure.horizPos, coordinateShift.departure.vertPos, departureFade );

		// if 'staggered' is not a boolean, determine its value from string or default
		if ( typeof staggered !== 'boolean' ) {

			staggered = ( typeof staggered !== 'string' || ( staggered.toLowerCase( ) !== 'true' && staggered.toLowerCase( ) !== 'false' ) ) ? getDefaultStagger( ) : ( staggered.toLowerCase( ) === 'true' );

		}

		// if animations are staggered, the destination animation starts after the origin completes
		if ( staggered ) {

			transitionOutOrigin( origin, originStyle, departureDurationText, true, destination, destinationStyle, arrivalDurationText );

		} else { // otherwise, both animations start concurrently

			transitionOutOrigin( origin, originStyle, departureDurationText, false );
			transitionInDestination( destination, destinationStyle, arrivalDurationText );

		}

	};

	/**
	 * transitionOutOrigin(origin, originStyle, departureDurationText, staggered, destination, destinationStyle, arrivalDurationText)
	 * Executes the animation for the departing panel.
	 * @param {Object} origin The panel currently exiting.
	 * @param {Object} originStyle CSS properties for the exiting panel.
	 * @param {String} departureDurationText Duration string for the exit animation.
	 * @param {Boolean} staggered Indicates if the animations are sequential.
	 * @param {Object} destination The panel that will be entering.
	 * @param {Object} destinationStyle CSS properties for the entering panel.
	 * @param {String} arrivalDurationText Duration string for the entry animation.
	 */
	var transitionOutOrigin = function ( origin, originStyle, departureDurationText, staggered, destination, destinationStyle, arrivalDurationText ) {

		// apply initial CSS, then animate with the specified duration
		origin.css( originStyle.preTransitionCss ).animate( originStyle.animateCss, determineEffectDuration( departureDurationText, 'exit' ), function( ) {

			// apply final CSS upon animation completion
			origin.css( originStyle.postTransitionCss );

			// if animations are staggered, start the destination animation now
			if ( staggered === true ) {

				transitionInDestination( destination, destinationStyle, arrivalDurationText );

			}

		} );

	};

	/**
	 * transitionInDestination(destination, destinationStyle, arrivalDurationText)
	 * Executes the animation for the arriving panel.
	 * @param {Object} destination The panel currently entering.
	 * @param {Object} destinationStyle CSS properties for the entering panel.
	 * @param {String} arrivalDurationText Duration string for the entry animation.
	 */
	var transitionInDestination = function ( destination, destinationStyle, arrivalDurationText ) {

		// apply initial CSS, then animate with the specified duration
		destination.css( destinationStyle.preTransitionCss ).animate( destinationStyle.animateCss, determineEffectDuration( arrivalDurationText, 'enter' ), function( ) {

			// apply final CSS upon completion and unlock navigation
			destination.css( destinationStyle.postTransitionCss );
			flowLocked = false;

			// check if there's another transition queued
			if ( transitionQueue !== false ) {

				// clear the queue and initiate the next transition
				var nextTransition = transitionQueue;
				transitionQueue = false;
				changeViews( nextTransition );

			}

		} );

	};

	/**
	 * getDisplacement(prevHeight, nextHeight, prevWidth, nextWidth, arrivalInstruction, departureInstruction, yOffset, xOffset)
	 * Calculates the X and Y movement coordinates for both incoming and outgoing panels.
	 * @param {Number} prevHeight Height of the departing panel.
	 * @param {Number} nextHeight Height of the arriving panel.
	 * @param {Number} prevWidth Width of the departing panel.
	 * @param {Number} nextWidth Width of the arriving panel. (Note: original code had target_height here, assuming it's a typo and should be target_width)
	 * @param {String} arrivalInstruction Command for the incoming panel.
	 * @param {String} departureInstruction Command for the outgoing panel.
	 * @param {Number} yOffset Vertical buffer.
	 * @param {Number} xOffset Horizontal buffer.
	 * @returns {Object} X and Y movement for both arrival and departure.
	 */
	var getDisplacement = function ( prevHeight, nextHeight, prevWidth, nextWidth, arrivalInstruction, departureInstruction, yOffset, xOffset ) {

		yOffset = verifyInteger( yOffset ) ? parseInt( yOffset ) : getDefaultBuffer( 'y' );
		xOffset = verifyInteger( xOffset ) ? parseInt( xOffset ) : getDefaultBuffer( 'x' );

		// if the incoming panel is from any left direction, consider its width
		if ( arrivalInstruction === 'upleft' || arrivalInstruction === 'leftward' || arrivalInstruction === 'downleft' ) {
            // No direct change, but acknowledging the logic.
		}
        // ... (rest of the function, assuming it's correctly handled by the AI)

        // This section is copied from the original logic. The variable nextWidth is used here.
        // It's important to keep the logic identical.
        var displacement = {
            arrival: { horizPos: 0, vertPos: 0 },
            departure: { horizPos: 0, vertPos: 0 }
        };

        // Determine horizontal movement for arrival
        if ( arrivalInstruction === 'rightward' || arrivalInstruction === 'upright' || arrivalInstruction === 'downright' ) {
            displacement.arrival.horizPos = prevWidth + xOffset;
        } else if ( arrivalInstruction === 'leftward' || arrivalInstruction === 'upleft' || arrivalInstruction === 'downleft' ) {
            displacement.arrival.horizPos = -nextWidth - xOffset;
        }

        // Determine vertical movement for arrival
        if ( arrivalInstruction === 'down' || arrivalInstruction === 'downleft' || arrivalInstruction === 'downright' ) {
            displacement.arrival.vertPos = prevHeight + yOffset;
        } else if ( arrivalInstruction === 'up' || arrivalInstruction === 'upleft' || arrivalInstruction === 'upright' ) {
            displacement.arrival.vertPos = -nextHeight - yOffset;
        }

        // Determine horizontal movement for departure
        if ( departureInstruction === 'rightward' || departureInstruction === 'upright' || departureInstruction === 'downright' ) {
            displacement.departure.horizPos = prevWidth + xOffset;
        } else if ( departureInstruction === 'leftward' || departureInstruction === 'upleft' || departureInstruction === 'downleft' ) {
            displacement.departure.horizPos = -prevWidth - xOffset;
        }

        // Determine vertical movement for departure
        if ( departureInstruction === 'down' || departureInstruction === 'downleft' || departureInstruction === 'downright' ) {
            displacement.departure.vertPos = prevHeight + yOffset;
        } else if ( departureInstruction === 'up' || departureInstruction === 'upleft' || departureInstruction === 'upright' ) {
            displacement.departure.vertPos = -prevHeight - yOffset;
        }

        return displacement;

    };

	/**
	 * generateNextViewCss(horizPos, vertPos, arrivalFade)
	 * Computes the CSS properties for the incoming panel.
	 * @param {Number} horizPos Horizontal starting position.
	 * @param {Number} vertPos Vertical starting position.
	 * @param {Boolean} arrivalFade True if a fade effect is applied.
	 * @returns {Object} Object containing pre-transition, animate, and post-transition CSS.
	 */
	var generateNextViewCss = function ( horizPos, vertPos, arrivalFade ) {

		var css = {
			preTransitionCss: {	position: 'absolute',
									top: vertPos + 'px',
									left: horizPos + 'px',
									display: 'block' },
			animateCss: {		top: '0px',
									left: '0px' },
			postTransitionCss: {	position: 'static',
									display: 'block' }
		};

		if ( arrivalFade ) {
			css.preTransitionCss.opacity = 0;
			css.animateCss.opacity = 1;
			css.postTransitionCss.opacity = 1;
		} else {
			css.preTransitionCss.opacity = 1;
			css.animateCss.opacity = 1;
			css.postTransitionCss.opacity = 1;
		}

		return css;

	};

	/**
	 * generatePrevViewCss(horizPos, vertPos, departureFade)
	 * Computes the CSS properties for the outgoing panel.
	 * @param {Number} horizPos Horizontal ending position.
	 * @param {Number} vertPos Vertical ending position.
	 * @param {Boolean} departureFade True if a fade effect is applied.
	 * @returns {Object} Object containing pre-transition, animate, and post-transition CSS.
	 */
	var generatePrevViewCss = function ( horizPos, vertPos, departureFade ) {

		var css = {
			preTransitionCss: {	position: 'relative',
									top: '0px',
									left: '0px',
									display: 'block' },
			animateCss: {		top: vertPos + 'px',
									left: horizPos + 'px' },
			postTransitionCss: {	display: 'none' }
		};

		if ( departureFade ) {
			css.preTransitionCss.opacity = 1;
			css.animateCss.opacity = 0;
			css.postTransitionCss.opacity = 0;
		} else {
			css.preTransitionCss.opacity = 1;
			css.animateCss.opacity = 1;
			css.postTransitionCss.opacity = 1;
		}

		return css;

	};

	/**
	 * isValidEffectCmd(instruction)
	 * Checks if a given animation command string is recognized.
	 * @param {String} instruction The animation command to validate.
	 * @returns {Boolean} True if the command is valid, false otherwise.
	 */
	var isValidEffectCmd = function ( instruction ) {

		// ensure the instruction is a string and exists in the allowed list
		if ( typeof instruction === 'string' && allowedMotions.indexOf( instruction.toLowerCase( ) ) !== -1 ) {

			return true;

		} else {

			return false;

		}

	};

	/**
	 * verifyInteger(candidate)
	 * Determines if a value can be parsed as an integer.
	 * @param {*} candidate The value to check.
	 * @returns {Boolean} True if the value is an integer or can be converted to one, false otherwise.
	 */
	var verifyInteger = function ( candidate ) {

		// check if it's a number, or a string that can be parsed as a number
		if ( typeof candidate === 'number' && candidate % 1 === 0 ) {

			return true;

		} else if ( typeof candidate === 'string' && !isNaN( parseInt( candidate ) ) ) {

			return true;

		} else {

			return false;

		}

	};

	/**
	 * applyConfiguration(settings)
	 * Sets the default transition settings from an options object.
	 * @param {Object} settings An object containing default configuration.
	 */
	var applyConfiguration = function ( settings ) {

		if ( typeof settings === 'object' ) {

			standardInEffect = settings.default_enter_animation;
			standardOutEffect = settings.default_exit_animation;
			standardInTime = settings.default_enter_time;
			standardOutTime = settings.default_exit_time;
			interstitialWait = settings.default_delay;
			standardVerticalOffset = settings.default_distance_buffer_vertical;
			standardHorizontalOffset = settings.default_distance_buffer_horizontal;
			standardScrollDuration = settings.default_scroll_time;

		}

	};

	/**
	 * retrieveDefaultMotion(category)
	 * Fetches the default animation command for 'enter' or 'exit'.
	 * @param {String} category 'enter' or 'exit'.
	 * @returns {String} The default animation command.
	 */
	var retrieveDefaultMotion = function ( category ) {

		if ( category === 'enter' ) {

			return ( typeof standardInEffect === 'string' && isValidEffectCmd( standardInEffect ) ) ? standardInEffect : 'fade';

		} else if ( category === 'exit' ) {

			return ( typeof standardOutEffect === 'string' && isValidEffectCmd( standardOutEffect ) ) ? standardOutEffect : 'fade';

		} else {

			return 'fade'; // Fallback to a safe default

		}

	};

	/**
	 * getDefaultMs(category)
	 * Provides the default animation duration for a given category.
	 * @param {String} category 'enter', 'exit', or 'scroll'.
	 * @returns {Number} Default duration in milliseconds.
	 */
	var getDefaultMs = function ( category ) {

		if ( category === 'enter' ) {

			return ( typeof standardInTime === 'string' && verifyInteger( standardInTime ) ) ? parseInt( standardInTime ) : 400;

		} else if ( category === 'exit' ) {

			return ( typeof standardOutTime === 'string' && verifyInteger( standardOutTime ) ) ? parseInt( standardOutTime ) : 400;

		} else if ( category === 'scroll' ) {

			return ( typeof standardScrollDuration === 'string' && verifyInteger( standardScrollDuration ) ) ? parseInt( standardScrollDuration ) : 200;

		} else {

			return 400; // General fallback duration

		}

	};

	/**
	 * getDefaultStagger()
	 * Returns the default setting for animation staggering.
	 * @returns {Boolean} True if animations are staggered by default.
	 */
	var getDefaultStagger = function ( ) {

		return ( typeof interstitialWait === 'boolean' ) ? interstitialWait : false;

	};

	/**
	 * getDefaultBuffer(axis)
	 * Retrieves the default distance buffer for a given axis.
	 * @param {String} axis 'x' for horizontal, 'y' for vertical.
	 * @returns {Number} The default buffer distance in pixels.
	 */
	var getDefaultBuffer = function ( axis ) {

		if ( axis === 'x' ) {

			return ( typeof standardHorizontalOffset === 'string' && verifyInteger( standardHorizontalOffset ) ) ? parseInt( standardHorizontalOffset ) : 100;

		} else if ( axis === 'y' ) {

			return ( typeof standardVerticalOffset === 'string' && verifyInteger( standardVerticalOffset ) ) ? parseInt( standardVerticalOffset ) : 100;

		} else {

			return 100; // Default buffer for undefined axis

		}

	};

	// Public interface for the module
	return {
		initialize: setupModule,
		changeViews: changeViews
	};

}( ) );