/*
 * DisplacementJS v1.0.0
 * https://my-project-url.com
 *
 * Copyright 2023, Your Name
 * Licensed under the Apache 2.0 license
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Inspired by similar libraries like effect.js
 */

;(function(jQuery, globalWin, currentDoc, undefValue) {

	var effectTag = 'displacementFX',
		maxRefreshRate = 60, // Maximum frames per second for updates
		initialConfig = {
			placementStyle: 'position',
			horizontalEffect: true,
			verticalEffect: true,
			displaceBackgrounds: true,
			displaceElements: true,
			adaptToScreen: false,
			usePointerInput: true,
			useDeviceMotion: true,
			smoothingFactor: 0.85, // Alpha for signal smoothing (1 = no smoothing)
			movementCurve: 'natural',
			pointerCurve: 'gaussian',
			inputPreference: 'pointer', // Which input source takes precedence: 'pointer' or 'deviceMotion'
			motionRangeX: 75, // (0 < range < 90) Angular range for max horizontal displacement
			motionRangeY: 75,
			autoAdjustOrigin: true, // Use a low-pass filter to dynamically adjust the neutral position
			originAlpha: 0.08 // Alpha for the low-pass filter used to adjust the neutral origin
		},

		// Defines methods for positioning visual components.
		// Can use standard CSS 'top'/'left' or CSS 'transform'.
		placementHandlers = {
			position: {
				setLeftCoord: function(targetEl, leftVal) { targetEl.css('left', leftVal); },
				setTopCoord: function(targetEl, topVal) { targetEl.css('top', topVal); }
			},
			transform: {
				setElementCoords: function(targetEl, newLeft, initialLeft, newTop, initialTop) {
					targetEl[0].style[cssTransformKey] = 'translate3d(' + (newLeft - initialLeft) + 'px, ' + (newTop - initialTop) + 'px, 0)';
				}
			}
		},

		// Approximates the cumulative distribution function of a Gaussian curve.
		// Parameter 'a' influences the standard deviation.
		normalCurveApprox = function(valX, paramA) {
			return 1 / (1 + Math.exp(-(0.068*paramA*(valX^3))-(1.6*paramA*valX)));
		},

		// Implements a basic low-pass filter for sensor data streams.
		// For more info: https://en.wikipedia.org/wiki/Low-pass_filter
		smoothSignalFilter = function(currentReading, previousReading, alphaVal) {
			if (previousReading === null) return currentReading;
			if (typeof alphaVal === "undefined") alphaVal = 0.55;
			return (alphaVal * currentReading) + ((1 - alphaVal) * previousReading);
		},

		// Internal memoization to optimize displacement calculations.
		calcMemo = [],

		// Different algorithms for calculating the displacement effect based on input.
		// Options include linear, natural (tangent-based), performance-optimized, and Gaussian.
		movementStyles = {
			straight: function(deltaAmt, maxDeltaAmt) {
				if (deltaAmt <= -maxDeltaAmt) return 1;
				if (deltaAmt >= maxDeltaAmt) return -1;
				return -deltaAmt/maxDeltaAmt;
			},
			natural: function(deltaAmt, maxDeltaAmt) {
				if (deltaAmt <= -maxDeltaAmt) return 1;
				if (deltaAmt >= maxDeltaAmt) return -1;
				if (calcMemo['n'+maxDeltaAmt] === undefValue) calcMemo['n'+maxDeltaAmt] = Math.tan(maxDeltaAmt*0.01745);
				return -Math.tan(deltaAmt*0.01745) / calcMemo['n'+maxDeltaAmt];
			},
			optimized: function(deltaAmt, maxDeltaAmt) {
				if (deltaAmt <= -maxDeltaAmt) return 1;
				if (deltaAmt >= maxDeltaAmt) return -1;
				if (calcMemo['p'+maxDeltaAmt] === undefValue) calcMemo['p'+maxDeltaAmt] = (maxDeltaAmt/90) + (4.1*Math.pow(maxDeltaAmt/90,7));
				return -((deltaAmt/90) + (4.1*Math.pow(deltaAmt/90,7))) / calcMemo['p'+maxDeltaAmt];
			},
			gaussian: function(deltaAmt, maxDeltaAmt) {
				return 1 - 2 * normalCurveApprox(deltaAmt/90, 140/maxDeltaAmt);
			}
		},

		// Utility to determine and apply appropriate CSS vendor prefixes.
		browserPrefixer = (function() {
			var vendorRegexes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
				testElementStyle = jQuery('script')[0].style,
				foundPrefix = '',
				styleProperty;

			for (styleProperty in testElementStyle) {
				if (vendorRegexes.test(styleProperty)) {
					foundPrefix = styleProperty.match(vendorRegexes)[0];
					break;
				}
			}

			if ('WebkitOpacity' in testElementStyle) { foundPrefix = 'Webkit'; }
			if ('KhtmlOpacity' in testElementStyle) { foundPrefix = 'Khtml'; }

			return function(propertyName) {
				return foundPrefix + (foundPrefix.length > 0 ? propertyName.charAt(0).toUpperCase() + propertyName.slice(1) : propertyName);
			};
		}()),

		cssTransformKey = browserPrefixer('transform'),

		canUseBgXY = jQuery('<div />', { style: 'background:#ccc' }).css('background-position-x') !== undefValue,

		setBgCoords = (canUseBgXY ?
			function(targetEl, coordX, coordY) {
				targetEl.css({
					'background-position-x': coordX,
					'background-position-y': coordY
				});
			} :
			function(targetEl, coordX, coordY) {
				targetEl.css('background-position', coordX + ' ' + coordY);
			}
		),

		fetchBgPlacement = (canUseBgXY ?
			function(targetEl) {
				return [
					targetEl.css('background-position-x'),
					targetEl.css('background-position-y')
				];
			} :
			function(targetEl) {
				return targetEl.css('background-position').split(' ');
			}
		),

		// Schedules the next animation frame, preferring `requestAnimationFrame` for performance.
		// Falls back to `setTimeout` if not available.
		frameScheduler = (
			globalWin.requestAnimationFrame       ||
			globalWin.webkitRequestAnimationFrame ||
			globalWin.mozRequestAnimationFrame    ||
			globalWin.oRequestAnimationFrame      ||
			globalWin.msRequestAnimationFrame     ||
			function(callbackFn) {
				setTimeout(callbackFn, 1000 / maxRefreshRate);
			}
		);

	function EffectHandler(domNode, userOptions) {
		this.domNode = domNode;
		this.userOptions = jQuery.extend({}, initialConfig, userOptions);

		this._initialSettings = initialConfig;
		this._moduleIdentifier = effectTag;

		this.initialize();
	}

	EffectHandler.prototype = {
		initialize: function() {
			this.userOptions.name = effectTag + '_' + Math.floor(Math.random() * 1e9);
			this.orientationData = {
				pitchAngle : 0,
				rollAngle : 0
			};

			this._locateDOMNodes();
			this._createDataRetrievers();
			this._configureValueUpdaters();
			this._checkDeviceType();
			this._identifyInputSources();
			this._analyzeViewport();
			this._manageWindowEvents();

			this.updateEffect({ initialActivation: true });

			this._beginAnimationCycle();
		},
		_locateDOMNodes: function() {
			this.$primaryNode = ( this.domNode === currentDoc.body || this.domNode === globalWin ? jQuery('body') : jQuery(this.domNode) );
			this.$viewBox = jQuery(globalWin);
		},
		_createDataRetrievers: function() {

			// Establish functions to retrieve current motion data.
			// These functions return normalized values between -1 and +1.

			var instanceRef = this,
				effectAlgo = movementStyles[instanceRef.userOptions.movementCurve],
				cursorAlgo = movementStyles[instanceRef.userOptions.pointerCurve];

			this._fetchHorizontalOffset = function() {

				if (this.isPointerActive && this.cursorX !== null && this.cursorX !== this.prevCursorX ) {
					return cursorAlgo( this.userOptions.motionRangeX * (1 - (2*this.cursorX/this.viewWidth)), this.userOptions.motionRangeX);
				}

				if (this.isSensorActive && this.pitchAngle !== null && this.rollAngle !== null) {
				// The calculation logic here processes device orientation.
				// Values typically range from -180 to 180 for roll, and -90 to 90 for pitch.

					// Accessing stored device orientation data.
					var deviceAngles = this.orientationData;

					if (this.isViewLandscape) {
						if (this.isViewRotated) {
						// Device in landscape, screen rotated (e.g., 180 degrees)
							return effectAlgo(-deviceAngles.pitchAngle, this.userOptions.motionRangeX);
						} else {
						// Device in landscape, standard orientation
							return effectAlgo(deviceAngles.pitchAngle, this.userOptions.motionRangeX);
						}
					} else {
						if (this.isViewRotated) {
						// Device in portrait, screen rotated
							return effectAlgo(-deviceAngles.rollAngle, this.userOptions.motionRangeX);
						} else {
						// Device in portrait, standard orientation
							return effectAlgo(deviceAngles.rollAngle, this.userOptions.motionRangeX);
						}
					}
				} else {
					this.isSensorActive = false; // Disable sensor if data is unavailable
				}

				return cursorAlgo( this.userOptions.motionRangeX * (1 - (2*this.prevCursorX/this.viewWidth)), this.userOptions.motionRangeX);
			};

			this._fetchVerticalOffset = function() {

				if (this.userOptions.usePointerInput && this.cursorY !== null && this.cursorY !== this.prevCursorY ) {
					return cursorAlgo( this.userOptions.motionRangeY * (1 - (2*this.cursorY/this.viewHeight)), this.userOptions.motionRangeY);
				}

				if (this.isSensorActive && this.pitchAngle !== null && this.rollAngle !== null) {

					// Accessing stored device orientation data.
					var deviceAngles = this.orientationData;

					if (this.isViewLandscape) {
						if (this.isViewRotated) {
						// Device in landscape, screen rotated
							return effectAlgo(-deviceAngles.rollAngle, this.userOptions.motionRangeY);
						} else {
						// Device in landscape, standard orientation
							return effectAlgo(deviceAngles.rollAngle, this.userOptions.motionRangeY);
						}
					} else {
						if (this.isViewRotated) {
						// Device in portrait, screen rotated
							return effectAlgo(-deviceAngles.pitchAngle, this.userOptions.motionRangeY);
						} else {
						// Device in portrait, standard orientation
							return effectAlgo(deviceAngles.pitchAngle, this.userOptions.motionRangeY);
						}
					}
				} else {
					this.isSensorActive = false; // Disable sensor if data is unavailable
				}

				return cursorAlgo( this.userOptions.motionRangeY * (1 - (2*this.prevCursorY/this.viewHeight)), this.userOptions.motionRangeY);
			};

		},
		_configureValueUpdaters: function() {

			// Establish functions to set the visual position of elements.

			var instanceRef = this,
				layoutStrategy = placementHandlers[instanceRef.userOptions.placementStyle];

			// Prioritize 'setElementCoords' for transform-based positioning,
			// otherwise use 'setLeftCoord' and 'setTopCoord' for traditional CSS.
			this._applyCoordinates = layoutStrategy.setElementCoords ||
				function(targetNode, leftCoord, originalLeftCoord, topCoord, originalTopCoord) {
					if (instanceRef.userOptions.horizontalEffect) {
						layoutStrategy.setLeftCoord(targetNode, leftCoord, originalLeftCoord);
					}
					if (instanceRef.userOptions.verticalEffect) {
						layoutStrategy.setTopCoord(targetNode, topCoord, originalTopCoord);
					}
				};

		},
		updateEffect: function(config) {
			if (!config || !config.initialActivation) {
				this._clearPreviousState();
			}
			this._scanForEffectTargets();
			this._scanForBgTargets();
			// Workaround for a WebKit rendering quirk with backgrounds.
			if (config && config.initialActivation && /WebKit/.test(navigator.userAgent)) {
				jQuery(globalWin).on('load', function() {
					var $bodyRef = jQuery('body');
						initialScrollX = $bodyRef.scrollLeft();
						initialScrollY = $bodyRef.scrollTop();

					$bodyRef.scrollLeft(initialScrollX + 1);
					$bodyRef.scrollTop(initialScrollY + 1);

					$bodyRef.scrollLeft(initialScrollX);
					$bodyRef.scrollTop(initialScrollY);
				});
			}
		},
		_analyzeViewport: function() {
			this.viewWidth = this.$viewBox.width();
			this.viewHeight = this.$viewBox.height();
			if (this.isSensorActive) {
				this.isViewRotated = (globalWin.orientation === 180);
				this.isViewLandscape = (Math.abs(globalWin.orientation) === 90);
			}
		},
		_checkDeviceType: function() {
			// Based on common mobile browser detection patterns.
			var agentString = navigator.userAgent || navigator.vendor || globalWin.opera;
			this.isHandheldDevice = (/(bb\d+|meego).+mobile|android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|playbook|plucker|pocket|psp|series(4|6)0|silk|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(agentString)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agentString.substr(0,4)));
		},
		_identifyInputSources: function() {
			this.isSensorActive = false;
			this.supportsSensorWebkit = false;
			this.supportsSensorMoz = false;
			this.isPointerActive = false;

			if (this.userOptions.useDeviceMotion && (this.isHandheldDevice || this.userOptions.inputPreference === 'deviceMotion')) {
				// Modern browsers using DeviceOrientationEvent (e.g., WebKit)
				this.supportsSensorWebkit = globalWin.DeviceOrientationEvent !== undefValue;
				// Older Mozilla implementations using MozOrientation (OrientationEvent)
				this.supportsSensorMoz = globalWin.OrientationEvent !== undefValue;
				this.isSensorActive = this.supportsSensorWebkit || this.supportsSensorMoz;
			}
			if (this.userOptions.usePointerInput && !this.isHandheldDevice) {
				this.isPointerActive = this.$viewBox.mousemove !== undefValue;
			}
		},
		_scanForEffectTargets: function() {
			var instanceRef = this;

			if (this.animatedNodes !== undefValue) {
				for (var idx = this.animatedNodes.length - 1; idx >= 0; idx--) {
					this.animatedNodes[idx].$node.data('displacement-isActive', undefValue);
				}
			}

			this.animatedNodes = [];

			if(!this.userOptions.displaceElements) return;

			this.$primaryNode.find('[data-displacement-amount],[data-displacement-x],[data-displacement-y]').each(function(index) {
				var $currentEl = jQuery(this);

				if (!$currentEl.data('displacement-isActive')) {
					$currentEl.data('displacement-isActive', this);
				} else if ($currentEl.data('displacement-isActive') !== this) {
					return; // This element has already been registered, skip.
				}

				// Store and restore original CSS positions to prevent cumulative shifts.
				if (!$currentEl.data('displacement-initialLeft')) {
					$currentEl.data('displacement-initialLeft', $currentEl.css('left'));
					$currentEl.data('displacement-initialTop', $currentEl.css('top'));
				} else {
					$currentEl.css('left', $currentEl.data('displacement-initialLeft'));
					$currentEl.css('top', $currentEl.data('displacement-initialTop'));
				}

				// Add this element's data to the collection for animation.
				instanceRef.animatedNodes.push({
					$node: $currentEl,
					startLeftPos: $currentEl.position().left,
					startTopPos: $currentEl.position().top,
					moveRangeX: ($currentEl.data('displacement-x') !== undefValue ? $currentEl.data('displacement-x') : ($currentEl.data('displacement-amount') !== undefValue ? $currentEl.data('displacement-amount') : 0)),
					moveRangeY: ($currentEl.data('displacement-y') !== undefValue ? $currentEl.data('displacement-y') : ($currentEl.data('displacement-amount') !== undefValue ? $currentEl.data('displacement-amount') : 0)),
					nodeWidth: $currentEl.outerWidth(true),
					nodeHeight: $currentEl.outerHeight(true)
				});
			});
		},
		_scanForBgTargets: function() {
			var instanceRef = this,
				$bgTargets;

			this.animatedBackgrounds = [];

			if(!this.userOptions.displaceBackgrounds) return;

			$bgTargets = this.$primaryNode.find('[data-bg-displacement-amount],[data-bg-displacement-x],[data-bg-displacement-y]');

			if (this.$primaryNode.data('bg-displacement-amount') || this.$primaryNode.data('bg-displacement-x') || this.$primaryNode.data('bg-displacement-y')) {
				$bgTargets = $bgTargets.add(this.$primaryNode);
			}

			$bgTargets.each(function() {
				var $currentBgEl = jQuery(this),
					bgInitialCoords = fetchBgPlacement($currentBgEl);

				if (!$currentBgEl.data('displacement-bgIsActive')) {
					$currentBgEl.data('displacement-bgIsActive', this);
				} else if ($currentBgEl.data('displacement-bgIsActive') !== this) {
					return; // This background element is already processed.
				}

				// Store and restore the initial background positions.
				if (!$currentBgEl.data('displacement-bgInitialX')) {
					$currentBgEl.data('displacement-bgInitialX', bgInitialCoords[0]);
					$currentBgEl.data('displacement-bgInitialY', bgInitialCoords[1]);
				} else {
					setBgCoords($currentBgEl, $currentBgEl.data('displacement-bgInitialX'), $currentBgEl.data('displacement-bgInitialY'));
				}

				instanceRef.animatedBackgrounds.push({
					$bgNode: $currentBgEl,
					initialBgValX: bgInitialCoords[0],
					initialBgValY: bgInitialCoords[1],
					initialBgPosX: (isNaN(parseInt(bgInitialCoords[0], 10)) ? 0 : parseInt(bgInitialCoords[0], 10)),
					initialBgPosY: (isNaN(parseInt(bgInitialCoords[1], 10)) ? 0 : parseInt(bgInitialCoords[1], 10)),
					nodeStartLeft: $currentBgEl.position().left,
					nodeStartTop: $currentBgEl.position().top,
					bgMoveRangeX: ($currentBgEl.data('bg-displacement-x') !== undefValue ? $currentBgEl.data('bg-displacement-x') : ($currentBgEl.data('bg-displacement-amount') !== undefValue ? $currentBgEl.data('bg-displacement-amount') : 0)),
					bgMoveRangeY: ($currentBgEl.data('bg-displacement-y') !== undefValue ? $currentBgEl.data('bg-displacement-y') : ($currentBgEl.data('bg-displacement-amount') !== undefValue ? $currentBgEl.data('bg-displacement-amount') : 0))
				});
			});
		},
		_clearPreviousState: function() {
			var nodeItem,
				initialLeftVal,
				initialTopVal,
				bgItem,
				idx;

			for (idx = this.animatedNodes.length - 1; idx >= 0; idx--) {
				nodeItem = this.animatedNodes[idx];
				initialLeftVal = nodeItem.$node.data('displacement-initialLeft');
				initialTopVal = nodeItem.$node.data('displacement-initialTop');

				this._applyCoordinates(nodeItem.$node, initialLeftVal, initialLeftVal, initialTopVal, initialTopVal);

				// Clear internal data attributes.
				nodeItem.$node.data('displacement-initialLeft', null).data('displacement-initialTop', null).data('displacement-isActive', null).data('displacement-bgIsActive', null);
			}

			for (idx = this.animatedBackgrounds.length - 1; idx >= 0; idx--) {
				bgItem = this.animatedBackgrounds[idx];

				// Clear internal data attributes for backgrounds.
				bgItem.$bgNode.data('displacement-bgInitialX', null).data('displacement-bgInitialY', null).data('displacement-bgIsActive', null);

				setBgCoords(bgItem.$bgNode, bgItem.initialBgValX, bgItem.initialBgValY);
			}
		},
		deactivateEffect: function() {
			this._clearPreviousState(); // Revert all elements and backgrounds to their initial states.

			if (this.isPointerActive) this.$viewBox.off('mousemove.' + this.userOptions.name);
			if (this.supportsSensorWebkit) globalWin.removeEventListener('deviceorientation', this._handleSensorWebkitEvent, false);
			if (this.supportsSensorMoz) globalWin.removeEventListener('MozOrientation', this._handleSensorMozEvent, false);

			jQuery(globalWin).off('load.' + this.userOptions.name).off('resize.' + this.userOptions.name).off('orientationchange.' + this.userOptions.name);
		},
		_processSensorData: function() {

			if (!this.isSensorActive) return;

			// `currentPitch` (beta) indicates device tilt forward/backward (-90 to +90 degrees).
			// `currentRoll` (gamma) indicates device tilt side-to-side (-180 to +180 degrees).

			var currentPitch = this.pitchAngle,
				currentRoll = this.rollAngle,
				pitchChange = 0,
				rollChange = 0;

			// Correct for specific Android device orientation reporting anomalies (e.g., 270 degrees).
			if (currentPitch > 90) currentPitch = currentPitch - 180;
			if (currentRoll > 180) currentRoll = currentRoll - 360;

			if (this.startPitch === undefValue && currentPitch !== null) {
				this.startPitch = currentPitch;
				// If gyroscope input is prioritized and becomes active, disable mouse input.
				if (this.isSensorActive && this.userOptions.inputPreference === 'deviceMotion') {
					this.isPointerActive = false;
					if (this.isPointerActive) this.$viewBox.off('mousemove.' + this.userOptions.name);
				}
			}

			if (this.startRoll === undefValue && currentRoll !== null) {
				this.startRoll = currentRoll;
				// If gyroscope input is prioritized and becomes active, disable mouse input.
				if (this.isSensorActive && this.userOptions.inputPreference === 'deviceMotion') {
					this.isPointerActive = false;
					if (this.isPointerActive) this.$viewBox.off('mousemove.' + this.userOptions.name);
				}
			}

			// Adjust the neutral position using a low-pass filter if enabled and initial readings are available.
			if (this.userOptions.autoAdjustOrigin && this.startRoll !== undefValue && this.startPitch !== undefValue) {
				this.startPitch = smoothSignalFilter(currentPitch, this.startPitch, this.userOptions.originAlpha);
				this.startRoll = smoothSignalFilter(currentRoll, this.startRoll, this.userOptions.originAlpha);
			}

			this.orientationData.pitchAngle = smoothSignalFilter(currentPitch - this.startPitch, this.orientationData.pitchAngle, this.userOptions.smoothingFactor);
			this.orientationData.rollAngle = smoothSignalFilter(currentRoll - this.startRoll, this.orientationData.rollAngle, this.userOptions.smoothingFactor);
		},

		_manageWindowEvents: function() {
			var instanceRef = this;

			jQuery(globalWin).on('load.' + this.userOptions.name + ' resize.' + this.userOptions.name + ' orientationchange.' + this.userOptions.name, function() {
				instanceRef._analyzeViewport();
				if (instanceRef.userOptions.adaptToScreen) {
					instanceRef.updateEffect();
				}
			});

			if (this.isPointerActive) {
				this.$viewBox.on('mousemove.' + this.userOptions.name, jQuery.proxy(this._handlePointerMove, this));
			}
			if (this.supportsSensorWebkit) {
				globalWin.addEventListener('deviceorientation', jQuery.proxy(this._handleSensorWebkitEvent, this), false);
			}
			if (this.supportsSensorMoz) {
				globalWin.addEventListener('MozOrientation', jQuery.proxy(this._handleSensorMozEvent, this), false);
			}
		},

		_handlePointerMove: function(eventObj) {
			this.cursorX = eventObj.clientX;
			this.cursorY = eventObj.clientY;
		},

		_handleSensorWebkitEvent: function(eventObj) {
			this.pitchAngle = eventObj.beta;
			this.rollAngle = eventObj.gamma;
		},

		_handleSensorMozEvent: function(eventObj) {
			this.pitchAngle = eventObj.x * -90; // Mozilla provides raw values, convert to standard degrees.
			this.rollAngle = eventObj.y * 90;
		},

		_beginAnimationCycle: function() {
			var instanceRef = this,
				animationLoop = function() {
					instanceRef._performUpdate();
					frameScheduler(animationLoop);
				};

			frameScheduler(animationLoop);
		},

		_performUpdate: function() {
			var horizontalShift = this._fetchHorizontalOffset(),
				verticalShift = this._fetchVerticalOffset(),
				nodeItem,
				bgItem,
				newLeftCoord,
				newTopCoord,
				newBgPosX,
				newBgPosY,
				idx;

			for (idx = this.animatedNodes.length - 1; idx >= 0; idx--) {
				nodeItem = this.animatedNodes[idx];

				newLeftCoord = nodeItem.startLeftPos + (horizontalShift * nodeItem.moveRangeX);
				newTopCoord = nodeItem.startTopPos + (verticalShift * nodeItem.moveRangeY);

				this._applyCoordinates(nodeItem.$node, newLeftCoord, nodeItem.startLeftPos, newTopCoord, nodeItem.startTopPos);
			}

			for (idx = this.animatedBackgrounds.length - 1; idx >= 0; idx--) {
				bgItem = this.animatedBackgrounds[idx];

				newBgPosX = bgItem.initialBgPosX + (horizontalShift * bgItem.bgMoveRangeX);
				newBgPosY = bgItem.initialBgPosY + (verticalShift * bgItem.bgMoveRangeY);

				setBgCoords(bgItem.$bgNode, newBgPosX + 'px', newBgPosY + 'px');
			}

			this.prevCursorX = this.cursorX;
			this.prevCursorY = this.cursorY;
		}
	};

	// jQuery plugin integration
	jQuery.fn[effectTag] = function(methodOrOptions) {
		var methodArgs = Array.prototype.slice.call(arguments, 1);
		return this.each(function() {
			var moduleInstance = jQuery.data(this, 'plugin_' + effectTag);
			if (!moduleInstance) {
				jQuery.data(this, 'plugin_' + effectTag, new EffectHandler(this, methodOrOptions));
			} else if (typeof methodOrOptions === 'string' && moduleInstance[methodOrOptions]) {
				moduleInstance[methodOrOptions].apply(moduleInstance, methodArgs);
			}
		});
	};

})(jQuery, globalWin, currentDoc, undefValue);