/*
 * Dynamic Viewport Movement Controller v1.1.0
 * Based on an original concept by Felix Pflaum
 * Licensed under the MIT License
 *
 * This utility manages interactive parallax effects based on user input (mouse or device orientation).
 * It dynamically adjusts element and background positions to create a sense of depth.
 */

;(function(jQ, currentWindow, currentDocument, undf) {

  // Core configuration and constants for the module
  var libraryHandle = 'viewportMotion',
    frameRateCap = 25, // Target maximum frames per second for smooth animation
    moduleSettings = {
      positioningMethod: 'absolutePositioning', // 'absolutePositioning' or 'cssTransforms'
      enableHorizontalMovement: true,
      enableVerticalMovement: true,
      processBackgrounds: true,
      processElements: true,
      isResponsive: false, // Not fully implemented in this version, kept for compatibility
      useMouseInput: true,
      useDeviceSensors: true,
      sensorSmoothingFactor: 0.8, // Alpha for Low Pass Filter on sensor readings (1 = no filter)
      motionCalculationStrategy: 'naturalCurve', // 'linear', 'naturalCurve', 'performanceOptimized', 'gaussianInfluence'
      mouseInputStrategy: 'gaussianInfluence',
      inputSourcePriority: 'mouseInput', // 'mouseInput' or 'sensorInput'
      maxDeviationAngleX: 75, // (0 < angle < 90) max angle for parallax in X-axis
      maxDeviationAngleY: 75, // (0 < angle < 90) max angle for parallax in Y-axis
      smoothBasePositionAdjustment: true, // Use LPF to adjust the "zero" position for sensors
      basePositionSmoothing: 0.08, // Alpha for LPF used for base position adjustment
      debugMode: false // Enable verbose console logging
    },

    // Strategies for applying element positions
    // Uses CSS 'left'/'top' or 'transform' properties
    placementStrategies = {
      absolutePositioning: {
        setX: function($elem, val) {
          $elem.css('left', val);
        },
        setY: function($elem, val) {
          $elem.css('top', val);
        }
      },
      cssTransforms: {
        applyTransform: function($elem, newX, originalX, newY, originalY, transformPropKey) {
          $elem[0].style[transformPropKey] = 'translate3d(' + (newX - originalX) + 'px, ' + (newY - originalY) + 'px, 0)';
        }
      }
    },

    // A simplified approximation of a Gaussian cumulative distribution function
    // Parameter 'alphaParam' influences the standard deviation.
    gaussianCDFApproximation = function(x, alphaParam) {
      return 1 / (1 + Math.exp(-(0.065 * alphaParam * (x * x * x)) - (1.6 * alphaParam * x)));
    },

    // Basic Low Pass Filter implementation for signal smoothing
    // `currentMeasurement` is the latest reading, `previousMeasurement` is the smoothed previous reading.
    // `filterCoefficient` (alpha) determines the degree of smoothing (0=max smoothing, 1=no smoothing).
    signalSmoother = function(currentMeasurement, previousMeasurement, filterCoefficient) {
      // If no previous measurement, treat current as the first smoothed value
      if (previousMeasurement === null || previousMeasurement === undf) return currentMeasurement;
      // Default alpha if not provided
      if (typeof filterCoefficient === "undefined") filterCoefficient = 0.6;
      return (filterCoefficient * currentMeasurement) + ((1 - filterCoefficient) * previousMeasurement);
    },

    // Algorithms for calculating parallax effect intensity
    // Input `deviation` is current angle/position, `maxAllowedDeviation` is the configured maximum.
    movementAlgorithms = {
      linear: function(deviation, maxAllowedDeviation) {
        if (deviation <= -maxAllowedDeviation) return 1;
        if (deviation >= maxAllowedDeviation) return -1;
        return -deviation / maxAllowedDeviation;
      },
      naturalCurve: function(deviation, maxAllowedDeviation) {
        if (deviation <= -maxAllowedDeviation) return 1;
        if (deviation >= maxAllowedDeviation) return -1;
        // Cache could be added here for performance, but removed for Type III structural change focus
        var tangentFactor = Math.tan(maxAllowedDeviation * (Math.PI / 180)); // Convert degrees to radians
        return -Math.tan(deviation * (Math.PI / 180)) / tangentFactor;
      },
      performanceOptimized: function(deviation, maxAllowedDeviation) {
        if (deviation <= -maxAllowedDeviation) return 1;
        if (deviation >= maxAllowedDeviation) return -1;
        // Simplified polynomial approximation
        var factor = (maxAllowedDeviation / 90) + (3.8 * Math.pow(maxAllowedDeviation / 90, 7));
        return -((deviation / 90) + (3.8 * Math.pow(deviation / 90, 7))) / factor;
      },
      gaussianInfluence: function(deviation, maxAllowedDeviation) {
        // Uses the simplified Gaussian CDF approximation
        return 1 - 2 * gaussianCDFApproximation(deviation / 90, 140 / maxAllowedDeviation);
      }
    },

    // Function to determine the correct vendor-prefixed CSS property name
    cssVendorPrefixGenerator = (function() {
      var prefixes = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
        testStyle = jQ('script')[0].style, // Use a script element's style for testing
        activePrefix = '',
        propName;

      for (propName in testStyle) {
        if (prefixes.test(propName)) {
          activePrefix = propName.match(prefixes)[0];
          break;
        }
      }

      // Special cases for Webkit/Khtml opacity, though not directly used for transform
      if ('WebkitOpacity' in testStyle) {
        activePrefix = 'Webkit';
      }
      if ('KhtmlOpacity' in testStyle) {
        activePrefix = 'Khtml';
      }

      return function(propertyToPrefix) {
        return activePrefix + (activePrefix.length > 0 ? propertyToPrefix.charAt(0).toUpperCase() + propertyToPrefix.slice(1) : propertyToPrefix);
      };
    })(),

    transformPropertyKey = cssVendorPrefixGenerator('transform'),

    // Check if browser supports individual background-position-x/y properties
    hasIndividualBackgroundPositionAxes = (jQ('<div />', {
      style: 'background:#fff'
    }).css('background-position-x') !== undf),

    // Helper to apply background position consistently
    applyBackgroundPlacement = (hasIndividualBackgroundPositionAxes ?
      function($elem, xPos, yPos) {
        $elem.css({
          'background-position-x': xPos,
          'background-position-y': yPos
        });
      } :
      function($elem, xPos, yPos) {
        $elem.css('background-position', xPos + ' ' + yPos);
      }
    ),

    // Helper to retrieve background position consistently
    retrieveBackgroundPlacement = (hasIndividualBackgroundPositionAxes ?
      function($elem) {
        return [
          $elem.css('background-position-x'),
          $elem.css('background-position-y')
        ];
      } :
      function($elem) {
        return $elem.css('background-position').split(' ');
      }
    ),

    // Request animation frame polyfill for smoother rendering
    animationScheduler = (
      currentWindow.requestAnimationFrame ||
      currentWindow.webkitRequestAnimationFrame ||
      currentWindow.mozRequestAnimationFrame ||
      currentWindow.oRequestAnimationFrame ||
      currentWindow.msRequestAnimationFrame ||
      function(callbackFn) {
        currentWindow.setTimeout(callbackFn, 1000 / frameRateCap);
      }
    );


  // Main ParallaxEffectManager constructor
  function ParallaxEffectManager(domElement, customOptions) {
    this.domElement = domElement;
    this.options = jQ.extend({}, moduleSettings, customOptions);

    this._baseConfiguration = moduleSettings;
    this._moduleIdentifier = libraryHandle;

    this.initialize();
  }

  // Prototype methods for ParallaxEffectManager
  ParallaxEffectManager.prototype = {

    // Initializes the parallax instance
    initialize: function() {
      // Assign a unique name for this instance
      this.options.instanceName = libraryHandle + '_' + Math.floor(Math.random() * 1e9);

      // Current device tilt angles
      this.deviceTilt = {
        pitch : 0, // Beta
        roll : 0   // Gamma
      };

      // Store previous mouse position for delta calculation
      this.lastMouseX = null;
      this.lastMouseY = null;

      // Setup DOM references, input handlers, and initial state
      this._setupDomReferences();
      this._configureValueRetrievers();
      this._configureValueAppliers();
      this._determineInputMethod();
      this._assessViewportDimensions();
      this._bindWindowEvents(); // Simplified, removed the load event special handling

      // Initial refresh to find elements and apply base settings
      this.recalibrateEffects({
        initialLoad: true
      });

      // Begin the animation loop
      this._startAnimationLoop();

      if (this.options.debugMode) {
        console.log(`[${this.options.instanceName}] Initialized with options:`, this.options);
      }
    },

    // Establishes jQuery references for the main element and viewport
    _setupDomReferences: function() {
      // If the target element is body or window, use 'body' for consistency
      this.$hostElement = (this.domElement === currentDocument.body || this.domElement === currentWindow ? jQ('body') : jQ(this.domElement));
      this.$boundaryElement = jQ(currentWindow);
    },

    // Configures methods for retrieving motion data (mouse, sensor)
    _configureValueRetrievers: function() {
      var instanceRef = this,
        motionAdapter = movementAlgorithms[instanceRef.options.motionCalculationStrategy],
        mouseMotionAdapter = movementAlgorithms[instanceRef.options.mouseInputStrategy];

      // Calculates normalized horizontal movement (-1 to 1)
      this._calculateHorizontalShift = function() {
        var currentXShift = 0;
        var useMouse = false;
        var useSensor = false;

        // Prioritize mouse if enabled and moved
        if (instanceRef.options.useMouseInput && instanceRef.currentMouseX !== null && instanceRef.currentMouseX !== instanceRef.lastMouseX) {
          currentXShift = mouseMotionAdapter(instanceRef.options.maxDeviationAngleX * (1 - (2 * instanceRef.currentMouseX / instanceRef.viewportWidth)), instanceRef.options.maxDeviationAngleX);
          useMouse = true;
        }

        // Use sensor if enabled and mouse wasn't prioritized or moved
        if (instanceRef.options.useDeviceSensors && instanceRef.deviceTilt.pitch !== null && instanceRef.deviceTilt.roll !== null && (instanceRef.options.inputSourcePriority === 'sensorInput' || !useMouse)) {
          var tiltData = instanceRef.deviceTilt;
          if (instanceRef.viewportIsLandscape) {
            currentXShift = instanceRef.viewportIsFlipped ? motionAdapter(-tiltData.pitch, instanceRef.options.maxDeviationAngleX) : motionAdapter(tiltData.pitch, instanceRef.options.maxDeviationAngleX);
          } else {
            currentXShift = instanceRef.viewportIsFlipped ? motionAdapter(-tiltData.roll, instanceRef.options.maxDeviationAngleX) : motionAdapter(tiltData.roll, instanceRef.options.maxDeviationAngleX);
          }
          useSensor = true;
        }

        // Fallback to previous mouse position if nothing else triggered
        if (!useMouse && !useSensor) {
          currentXShift = mouseMotionAdapter(instanceRef.options.maxDeviationAngleX * (1 - (2 * instanceRef.lastMouseX / instanceRef.viewportWidth)), instanceRef.options.maxDeviationAngleX);
        }

        return currentXShift;
      };

      // Calculates normalized vertical movement (-1 to 1)
      this._calculateVerticalShift = function() {
        var currentYShift = 0;
        var useMouse = false;
        var useSensor = false;

        // Prioritize mouse if enabled and moved
        if (instanceRef.options.useMouseInput && instanceRef.currentMouseY !== null && instanceRef.currentMouseY !== instanceRef.lastMouseY) {
          currentYShift = mouseMotionAdapter(instanceRef.options.maxDeviationAngleY * (1 - (2 * instanceRef.currentMouseY / instanceRef.viewportHeight)), instanceRef.options.maxDeviationAngleY);
          useMouse = true;
        }

        // Use sensor if enabled and mouse wasn't prioritized or moved
        if (instanceRef.options.useDeviceSensors && instanceRef.deviceTilt.pitch !== null && instanceRef.deviceTilt.roll !== null && (instanceRef.options.inputSourcePriority === 'sensorInput' || !useMouse)) {
          var tiltData = instanceRef.deviceTilt;
          if (instanceRef.viewportIsLandscape) {
            currentYShift = instanceRef.viewportIsFlipped ? motionAdapter(-tiltData.roll, instanceRef.options.maxDeviationAngleY) : motionAdapter(tiltData.roll, instanceRef.options.maxDeviationAngleY);
          } else {
            currentYShift = instanceRef.viewportIsFlipped ? motionAdapter(-tiltData.pitch, instanceRef.options.maxDeviationAngleY) : motionAdapter(tiltData.pitch, instanceRef.options.maxDeviationAngleY);
          }
          useSensor = true;
        }

        // Fallback to previous mouse position if nothing else triggered
        if (!useMouse && !useSensor) {
          currentYShift = mouseMotionAdapter(instanceRef.options.maxDeviationAngleY * (1 - (2 * instanceRef.lastMouseY / instanceRef.viewportHeight)), instanceRef.options.maxDeviationAngleY);
        }

        return currentYShift;
      };
    },

    // Configures methods for applying element positions
    _configureValueAppliers: function() {
      var instanceRef = this,
        positionAdapter = placementStrategies[instanceRef.options.positioningMethod];

      // Sets position for a given element based on chosen strategy
      this._applyElementPosition = positionAdapter.applyTransform ||
        function($elem, leftVal, originalLeftVal, topVal, originalTopVal) {
          // Guard clauses to only apply if enabled
          if (instanceRef.options.enableHorizontalMovement) {
            positionAdapter.setX($elem, leftVal);
          }
          if (instanceRef.options.enableVerticalMovement) {
            positionAdapter.setY($elem, topVal);
          }
        };
    },

    // Recalibrates all parallax elements and backgrounds
    recalibrateEffects: function(opts) {
      opts = opts || {};
      if (!opts.initialLoad) {
        this._restoreOriginalStates(); // Reset previous elements
      }
      this._identifyParallaxElements();
      this._identifyParallaxBackgrounds();

      if (this.options.debugMode) {
        console.log(`[${this.options.instanceName}] Effects recalibrated. Elements: ${this.parallaxElements.length}, Backgrounds: ${this.parallaxBackgrounds.length}`);
      }
    },

    // Detects viewport dimensions and orientation
    _assessViewportDimensions: function() {
      this.viewportWidth = this.$boundaryElement.width();
      this.viewportHeight = this.$boundaryElement.height();
      if (this.options.useDeviceSensors) {
        this.viewportIsFlipped = (currentWindow.orientation === 180 || currentWindow.orientation === -180);
        this.viewportIsLandscape = (Math.abs(currentWindow.orientation) === 90);
      }
    },

    // Determines which input methods are available and enabled
    _determineInputMethod: function() {
      this.isUsingSensors = false;
      this.isUsingMouse = false;

      // Check for device orientation support (generic, not specific to Webkit/Moz)
      if (this.options.useDeviceSensors && (currentWindow.DeviceOrientationEvent !== undf || currentWindow.OrientationEvent !== undf)) {
        this.isUsingSensors = true;
        // If sensors have priority, disable mouse input temporarily
        if (this.options.inputSourcePriority === 'sensorInput') {
          this.options.useMouseInput = false;
        }
      }

      // Check for mousemove support
      if (this.options.useMouseInput && this.$boundaryElement.mousemove !== undf) {
        this.isUsingMouse = true;
      }

      if (this.options.debugMode) {
        console.log(`[${this.options.instanceName}] Input methods detected: Sensors=${this.isUsingSensors}, Mouse=${this.isUsingMouse}`);
      }
    },

    // Finds and registers elements marked for parallax
    _identifyParallaxElements: function() {
      var instanceRef = this;

      // Clean up old element data if they were tracked before
      if (this.parallaxElements !== undf) {
        for (var idx = this.parallaxElements.length - 1; idx >= 0; idx--) {
          this.parallaxElements[idx].$element.data('parallaxify-element-active', undf);
        }
      }

      this.parallaxElements = [];

      if (!this.options.processElements) return;

      // Data attributes changed to 'data-shift-x', 'data-shift-y', 'data-shift-magnitude'
      this.$hostElement.find('[data-shift-magnitude],[data-shift-x],[data-shift-y]').each(function() {
        var $currentItem = jQ(this);

        // Ensure element is not already processed by another instance or this instance
        if ($currentItem.data('parallaxify-element-active') && $currentItem.data('parallaxify-element-active') !== this) {
          return;
        }
        $currentItem.data('parallaxify-element-active', this);

        // Store original CSS positions to restore later
        var originalLeft = $currentItem.data('parallaxify-original-left');
        var originalTop = $currentItem.data('parallaxify-original-top');

        if (!originalLeft) {
          $currentItem.data('parallaxify-original-left', $currentItem.css('left'));
          $currentItem.data('parallaxify-original-top', $currentItem.css('top'));
        } else {
          // Restore to original before re-calculating (important for refresh)
          $currentItem.css('left', originalLeft);
          $currentItem.css('top', originalTop);
        }

        // Add to collection
        instanceRef.parallaxElements.push({
          $element: $currentItem,
          basePositionLeft: $currentItem.position().left,
          basePositionTop: $currentItem.position().top,
          shiftMagnitudeX: ($currentItem.data('shift-x') !== undf ? $currentItem.data('shift-x') : ($currentItem.data('shift-magnitude') !== undf ? $currentItem.data('shift-magnitude') : 0)),
          shiftMagnitudeY: ($currentItem.data('shift-y') !== undf ? $currentItem.data('shift-y') : ($currentItem.data('shift-magnitude') !== undf ? $currentItem.data('shift-magnitude') : 0)),
          elementWidth: $currentItem.outerWidth(true),
          elementHeight: $currentItem.outerHeight(true)
        });
      });
    },

    // Finds and registers elements with parallax backgrounds
    _identifyParallaxBackgrounds: function() {
      var instanceRef = this;
      var $bgElementsToProcess;

      this.parallaxBackgrounds = [];

      if (!this.options.processBackgrounds) return;

      // Data attributes changed to 'data-bg-shift-x', 'data-bg-shift-y', 'data-bg-shift-magnitude'
      $bgElementsToProcess = this.$hostElement.find('[data-bg-shift-magnitude],[data-bg-shift-x],[data-bg-shift-y]');

      // Include the host element itself if it has background parallax data
      if (this.$hostElement.data('bg-shift-magnitude') || this.$hostElement.data('bg-shift-x') || this.$hostElement.data('bg-shift-y')) {
        $bgElementsToProcess = $bgElementsToProcess.add(this.$hostElement);
      }

      $bgElementsToProcess.each(function() {
        var $currentItem = jQ(this),
          currentBgPos = retrieveBackgroundPlacement($currentItem);

        // Ensure element is not already processed
        if ($currentItem.data('parallaxify-background-active') && $currentItem.data('parallaxify-background-active') !== this) {
          return;
        }
        $currentItem.data('parallaxify-background-active', this);

        // Store original background positions
        var originalBgLeft = $currentItem.data('parallaxify-background-original-left');
        var originalBgTop = $currentItem.data('parallaxify-background-original-top');

        if (!originalBgLeft) {
          $currentItem.data('parallaxify-background-original-left', currentBgPos[0]);
          $currentItem.data('parallaxify-background-original-top', currentBgPos[1]);
        } else {
          // Restore to original before re-calculating
          applyBackgroundPlacement($currentItem, originalBgLeft, originalBgTop);
        }

        instanceRef.parallaxBackgrounds.push({
          $element: $currentItem,
          originalValueLeft: currentBgPos[0],
          originalValueTop: currentBgPos[1],
          parsedBasePositionLeft: (isNaN(parseInt(currentBgPos[0], 10)) ? 0 : parseInt(currentBgPos[0], 10)),
          parsedBasePositionTop: (isNaN(parseInt(currentBgPos[1], 10)) ? 0 : parseInt(currentBgPos[1], 10)),
          elementOffsetLeft: $currentItem.position().left,
          elementOffsetTop: $currentItem.position().top,
          shiftMagnitudeX: ($currentItem.data('bg-shift-x') !== undf ? $currentItem.data('bg-shift-x') : ($currentItem.data('bg-shift-magnitude') !== undf ? $currentItem.data('bg-shift-magnitude') : 0)),
          shiftMagnitudeY: ($currentItem.data('bg-shift-y') !== undf ? $currentItem.data('bg-shift-y') : ($currentItem.data('bg-shift-magnitude') !== undf ? $currentItem.data('bg-shift-magnitude') : 0))
        });
      });
    },

    // Resets elements and backgrounds to their initial states
    _restoreOriginalStates: function() {
      var parallaxItem,
        originalPosX,
        originalPosY,
        bgObject,
        idx;

      // Reset elements
      if (this.parallaxElements && this.parallaxElements.length > 0) {
        for (idx = this.parallaxElements.length - 1; idx >= 0; idx--) {
          parallaxItem = this.parallaxElements[idx];
          originalPosX = parallaxItem.$element.data('parallaxify-original-left');
          originalPosY = parallaxItem.$element.data('parallaxify-original-top');

          this._applyElementPosition(parallaxItem.$element, originalPosX, originalPosX, originalPosY, originalPosY);

          parallaxItem.$element
            .removeData('parallaxify-original-left')
            .removeData('parallaxify-original-top')
            .removeData('parallaxify-element-active');
        }
      }

      // Reset backgrounds
      if (this.parallaxBackgrounds && this.parallaxBackgrounds.length > 0) {
        for (idx = this.parallaxBackgrounds.length - 1; idx >= 0; idx--) {
          bgObject = this.parallaxBackgrounds[idx];

          bgObject.$element
            .removeData('parallaxify-background-original-left')
            .removeData('parallaxify-background-original-top')
            .removeData('parallaxify-background-active');

          applyBackgroundPlacement(bgObject.$element, bgObject.originalValueLeft, bgObject.originalValueTop);
        }
      }
    },

    // Terminates the instance, unbinding events and resetting states
    terminateInstance: function() {
      this._restoreOriginalStates();

      // Unbind mouse event if active
      if (this.isUsingMouse) this.$boundaryElement.off('mousemove.' + this.options.instanceName);

      // Remove sensor event listeners
      if (this.isUsingSensors) {
        currentWindow.removeEventListener('deviceorientation', this._sensorHandler, false);
        currentWindow.removeEventListener('MozOrientation', this._sensorHandler, false); // For older Firefox
      }

      // Unbind window events
      jQ(currentWindow).off('resize.' + this.options.instanceName).off('orientationchange.' + this.options.instanceName);

      if (this.options.debugMode) {
        console.log(`[${this.options.instanceName}] Instance terminated.`);
      }
    },

    // Handles incoming device orientation data
    _handleDeviceOrientation: function(event) {
      // Guard: if sensors are not in use or the instance is terminated
      if (!this.isUsingSensors) return;

      var currentPitch = event.beta,
        currentRoll = event.gamma;

      // Counteract Android bugs where values might be >90 or >180 on device flip
      if (currentPitch > 90) currentPitch -= 180;
      if (currentRoll > 180) currentRoll -= 360;

      // Initialize base position for smoothing if not set
      if (this.initialPitch === undf && currentPitch !== null) {
        this.initialPitch = currentPitch;
        // If sensor priority is high, confirm mouse input is disabled
        if (this.options.inputSourcePriority === 'sensorInput' && this.isUsingMouse) {
          this.isUsingMouse = false;
          this.$boundaryElement.off('mousemove.' + this.options.instanceName);
          if (this.options.debugMode) console.log(`[${this.options.instanceName}] Mouse input disabled due to sensor priority.`);
        }
      }

      if (this.initialRoll === undf && currentRoll !== null) {
        this.initialRoll = currentRoll;
        if (this.options.inputSourcePriority === 'sensorInput' && this.isUsingMouse) {
          this.isUsingMouse = false;
          this.$boundaryElement.off('mousemove.' + this.options.instanceName);
        }
      }

      // Adjust the base position using a low pass filter
      if (this.options.smoothBasePositionAdjustment && this.initialRoll !== undf && this.initialPitch !== undf) {
        this.initialPitch = signalSmoother(currentPitch, this.initialPitch, this.options.basePositionSmoothing);
        this.initialRoll = signalSmoother(currentRoll, this.initialRoll, this.options.basePositionSmoothing);
      }

      // Apply low pass filter to current sensor readings
      this.deviceTilt.pitch = signalSmoomer(currentPitch - this.initialPitch, this.deviceTilt.pitch, this.options.sensorSmoothingFactor);
      this.deviceTilt.roll = signalSmoomer(currentRoll - this.initialRoll, this.deviceTilt.roll, this.options.sensorSmoothingFactor);

      // Clamp values to prevent extreme shifts
      this.deviceTilt.pitch = Math.max(-this.options.maxDeviationAngleY, Math.min(this.options.maxDeviationAngleY, this.deviceTilt.pitch));
      this.deviceTilt.roll = Math.max(-this.options.maxDeviationAngleX, Math.min(this.options.maxDeviationAngleX, this.deviceTilt.roll));
    },

    // Binds necessary window events (resize, orientationchange, mousemove, deviceorientation)
    _bindWindowEvents: function() {
      var instanceRef = this;

      // Debounced resize handler for performance
      var resizeTimeout;
      jQ(currentWindow).on('resize.' + this.options.instanceName + ' orientationchange.' + this.options.instanceName, function() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
          instanceRef._assessViewportDimensions();
          instanceRef.recalibrateEffects(); // Re-scan for elements after resize
          if (instanceRef.options.debugMode) console.log(`[${instanceRef.options.instanceName}] Viewport resized/orientation changed.`);
        }, 150); // Debounce for 150ms
      });

      // Mouse move handler
      if (this.isUsingMouse) {
        this.$boundaryElement.on('mousemove.' + this.options.instanceName, function(evt) {
          instanceRef.currentMouseX = evt.clientX;
          instanceRef.currentMouseY = evt.clientY;
        });
        if (this.options.debugMode) console.log(`[${this.options.instanceName}] Mousemove event bound.`);
      }

      // Device orientation handler
      if (this.isUsingSensors) {
        // Store a bound version of the handler to remove it later
        this._sensorHandler = this._handleDeviceOrientation.bind(this);
        currentWindow.addEventListener('deviceorientation', this._sensorHandler, false);
        currentWindow.addEventListener('MozOrientation', this._sensorHandler, false); // Fallback for older Firefox
        if (this.options.debugMode) console.log(`[${this.options.instanceName}] Device orientation events bound.`);
      }
    },

    // The main animation loop
    _startAnimationLoop: function() {
      var instanceRef = this,
        previousTimestamp = performance.now();

      function animationTick(currentTimestamp) {
        // Request next frame immediately to maintain consistent loop
        instanceRef.animationFrameId = animationScheduler(animationTick);

        // Optional: Cap FPS, though rAF usually handles this well
        var elapsed = currentTimestamp - previousTimestamp;
        if (elapsed < (1000 / frameRateCap)) {
          return;
        }
        previousTimestamp = currentTimestamp;

        instanceRef._updateParallaxEffects();

        // Update last mouse position after calculations
        instanceRef.lastMouseX = instanceRef.currentMouseX;
        instanceRef.lastMouseY = instanceRef.currentMouseY;
      }

      this.animationFrameId = animationScheduler(animationTick);
    },

    // Applies parallax shifts to all registered elements and backgrounds
    _updateParallaxEffects: function() {
      var horizontalMotion = this._calculateHorizontalShift(),
        verticalMotion = this._calculateVerticalShift(),
        idx,
        parallaxItem,
        bgObject,
        newLeft,
        newTop,
        newBgPosX,
        newBgPosY;

      // Process elements
      if (this.options.processElements && this.parallaxElements.length > 0) {
        for (idx = 0; idx < this.parallaxElements.length; idx++) {
          parallaxItem = this.parallaxElements[idx];

          newLeft = parallaxItem.basePositionLeft + (horizontalMotion * parallaxItem.shiftMagnitudeX);
          newTop = parallaxItem.basePositionTop + (verticalMotion * parallaxItem.shiftMagnitudeY);

          this._applyElementPosition(
            parallaxItem.$element,
            newLeft,
            parallaxItem.basePositionLeft,
            newTop,
            parallaxItem.basePositionTop,
            transformPropertyKey // Pass the transform key if using transform strategy
          );
        }
      }

      // Process backgrounds
      if (this.options.processBackgrounds && this.parallaxBackgrounds.length > 0) {
        for (idx = 0; idx < this.parallaxBackgrounds.length; idx++) {
          bgObject = this.parallaxBackgrounds[idx];

          newBgPosX = bgObject.parsedBasePositionLeft + (horizontalMotion * bgObject.shiftMagnitudeX);
          newBgPosY = bgObject.parsedBasePositionTop + (verticalMotion * bgObject.shiftMagnitudeY);

          applyBackgroundPlacement(bgObject.$element, newBgPosX + 'px', newBgPosY + 'px');
        }
      }
    }
  };

  // jQuery plugin interface
  jQ.fn[libraryHandle] = function(methodOrOptions) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function() {
      var instance = jQ.data(this, 'plugin_' + libraryHandle);

      // If no instance, create one
      if (!instance) {
        jQ.data(this, 'plugin_' + libraryHandle, new ParallaxEffectManager(this, methodOrOptions));
      }
      // If method is called on an existing instance
      else if (typeof methodOrOptions === 'string' && typeof instance[methodOrOptions] === 'function') {
        instance[methodOrOptions].apply(instance, args);
      }
      // If options are passed to an existing instance, re-initialize
      else if (typeof methodOrOptions === 'object') {
        instance.terminateInstance(); // Clean up old instance
        jQ.data(this, 'plugin_' + libraryHandle, new ParallaxEffectManager(this, methodOrOptions));
      }
    });
  };

})(jQuery, window, document);