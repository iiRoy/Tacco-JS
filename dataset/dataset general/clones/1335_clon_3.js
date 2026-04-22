/*
 * Revamped Image Rotation Utility
 * Version: 1.0
 * Last Modified: 2024-03-20
 *
 * This software is distributed under the MIT License.
 * For details, please refer to: http://opensource.org/licenses/mit-license.php
 *
 * Developed by CodeForge, a derivative work inspired by Wilq32's original.
 * Contact: codeforge@example.com
 */
(function(jq) {
  // Determine browser's CSS transform property for modern browsers
  let transformKey, transformOriginKey;
  const styleProbe = document.head.style;
  const potentialTransforms = ["transform", "WebkitTransform", "OTransform", "msTransform", "MozTransform"];

  for (let idx = 0; idx < potentialTransforms.length; idx++) {
    if (styleProbe[potentialTransforms[idx]] !== undefined) {
      transformKey = potentialTransforms[idx];
      break;
    }
  }

  // If a transform property is found, derive its origin counterpart
  if (transformKey) {
    transformOriginKey = transformKey.replace(/[tT]ransform/, "TransformOrigin");
    if (transformOriginKey.charAt(0) === "T") {
      transformOriginKey = "t" + transformOriginKey.substring(1); // Ensure camelCase for style property access
    }
  }

  // Explicitly check for Internet Explorer (legacy support)
  // This helps prevent minifiers from removing the check
  // window.isLegacyIE will be true for IE versions < 11
  let isLegacyIE = false;
  try {
    isLegacyIE = (window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1) && (document.documentMode < 11 || document.documentMode === undefined);
  } catch (e) {
    // Fallback for environments where document.documentMode is not available
    // (e.g., some edge cases or older browser emulations)
    isLegacyIE = false;
  }
  
  // Extend jQuery prototype with rotation functionalities
  jq.fn.extend({
    // Method to apply rotation to selected elements
    spinElement: function(rotationOptions) {
      if (!this.length || typeof rotationOptions === "undefined") {
        return this; // Return jQuery object for chaining
      }
      
      // Normalize rotationOptions to an object if a number is passed (representing angle)
      const normalizedOpts = typeof rotationOptions === "number" ? { degrees: rotationOptions } : rotationOptions;
      const processedElements = [];

      this.each(function() {
        const currentElement = this;
        let rotatorInstance = currentElement.photoSpin?.rotatorEffect;

        if (!rotatorInstance) {
          // If no rotator instance exists, create a new one
          const clonedOptions = jq.extend(true, {}, normalizedOpts); // Deep clone to prevent side effects
          const newRotator = new PhotoSpin.ImageRotator(currentElement, clonedOptions);
          rotatorInstance = newRotator._elementRoot;
          processedElements.push(jq(rotatorInstance));
        } else {
          // If an instance exists, update its rotation
          rotatorInstance._handleRotationUpdate(normalizedOpts);
        }
      });
      return jq(processedElements); // Return a jQuery wrapped set of affected elements
    },

    // Method to retrieve current rotation angle for elements
    retrieveRotationAngle: function() {
      const angleResults = [];
      this.each(function() {
        const currentElement = this;
        const rotator = currentElement.photoSpin?.rotatorEffect;
        if (rotator) {
          angleResults.push(rotator._currentDegrees);
        } else {
          angleResults.push(0); // Default to 0 if no rotator is found
        }
      });
      return angleResults;
    },

    // Method to stop ongoing rotation animations
    haltRotation: function() {
      this.each(function() {
        const currentElement = this;
        const rotator = currentElement.photoSpin?.rotatorEffect;
        if (rotator) {
          clearTimeout(rotator._animationTimer); // Clear any pending animation
        }
      });
      return this; // Allow chaining
    }
  });

  // Core rotation logic library
  // This object holds the main functionality for image rotation.
  window.PhotoSpin = window.PhotoSpin || {};

  PhotoSpin.ImageRotator = (function() {
    if (transformKey) {
      // Modern browser path (CSS Transforms)
      return function(targetImage, userOptions) {
        // Attach this rotator instance to the target element
        targetImage.photoSpin = {
          rotatorEffect: this
        };

        this._originalImage = this._elementRoot = this._eventTarget = targetImage;
        this._handleRotationUpdate(userOptions);
      };
    } else {
      // Legacy browser path (VML for IE, Canvas for others)
      return function(targetImage, userOptions) {
        this._originalImage = targetImage;
        this._pendingRotations = [userOptions]; // Queue for rotations until image loads

        // Create a wrapper element for the image
        this._elementRoot = document.createElement('div');
        this._elementRoot.style.display = "inline-block"; // Keep inline flow
        this._elementRoot.photoSpin = {
          rotatorEffect: this
        };
        
        // Insert the wrapper before the image
        targetImage.parentNode.insertBefore(this._elementRoot, targetImage);

        // Check if image is already loaded
        if (targetImage.complete) {
          this._loadAndPrepare();
        } else {
          const selfRef = this;
          // Use jQuery to bind the load event, ensuring cross-browser compatibility
          jq(this._originalImage).on("load", function() { selfRef._loadAndPrepare(); });
        }
      };
    }
  })();

  // Prototype methods for ImageRotator
  PhotoSpin.ImageRotator.prototype = {
    // Initializes or updates rotation parameters
    _configureOptions: function(incomingOptions) {
      // Ensure _currentParameters exists
      this._currentParameters = this._currentParameters || {};

      // Initialize current angle if not set
      if (typeof this._currentDegrees !== "number") {
        this._currentDegrees = 0;
      }

      // Update angle if provided in incomingOptions
      if (typeof incomingOptions.degrees === "number") {
        this._currentDegrees = incomingOptions.degrees;
      }

      // Set target animation angle
      this._currentParameters.targetAngle = (typeof incomingOptions.animateTo === "number") ? (incomingOptions.animateTo) : (this._currentDegrees);

      // Animation steps, easing, duration, and callback
      this._currentParameters.stepFunction = incomingOptions.step || this._currentParameters.stepFunction || null;
      this._currentParameters.easingFunction = incomingOptions.easing || this._currentParameters.easingFunction || this._easeOutCubic;
      this._currentParameters.animationDuration = incomingOptions.duration || this._currentParameters.animationDuration || 1000;
      this._currentParameters.completionCallback = incomingOptions.callback || this._currentParameters.completionCallback || this._noop;
      
      // Rotation center (default to 50% 50%)
      this._currentParameters.pivotPoint = incomingOptions.center || this._currentParameters.pivotPoint || ["50%", "50%"];

      // Calculate rotation center coordinates based on image dimensions
      this._pivotX = (typeof this._currentParameters.pivotPoint[0] === "string") ?
        (parseInt(this._currentParameters.pivotPoint[0], 10) / 100) * this._imageWidth * this._scaleX :
        this._currentParameters.pivotPoint[0];

      this._pivotY = (typeof this._currentParameters.pivotPoint[1] === "string") ?
        (parseInt(this._currentParameters.pivotPoint[1], 10) / 100) * this._imageHeight * this._scaleY :
        this._currentParameters.pivotPoint[1];

      // Bind new events if provided and different
      if (incomingOptions.bind && incomingOptions.bind !== this._currentParameters.bind) {
        this._attachHandlers(incomingOptions.bind);
      }
    },

    // A do-nothing function for default callbacks
    _noop: function() {},

    // Default easing function (easeOutCubic)
    _easeOutCubic: function(t, currentVal, startVal, changeVal, duration) {
      return -changeVal * ((t = currentVal / duration - 1) * t * t * t - 1) + startVal;
    },

    // Main entry point for handling rotation requests
    _handleRotationUpdate: function(rotationOpts, skipCompletenessCheck = false) {
      // For legacy browsers, if image isn't loaded, queue the rotation
      if (!transformKey && !this._originalImage.complete && !skipCompletenessCheck) {
        this._pendingRotations.push(rotationOpts);
        return;
      }
      this._configureOptions(rotationOpts);

      // If current angle is already target angle, just apply it directly
      if (this._currentDegrees === this._currentParameters.targetAngle) {
        this._applyTransform(this._currentDegrees);
      } else {
        this._beginAnimation(); // Otherwise, start the animation
      }
    },

    // Attaches or re-attaches event handlers
    _attachHandlers: function(eventMap) {
      if (!eventMap || !this._eventTarget) {
        return; // No events to bind or no target
      }

      // Unbind previously bound events if any
      if (this._currentParameters.bind) {
        for (const eventType in this._currentParameters.bind) {
          if (Object.prototype.hasOwnProperty.call(this._currentParameters.bind, eventType)) {
            jq(this._eventTarget).off(eventType, this._currentParameters.bind[eventType]);
          }
        }
      }

      // Bind new events
      this._currentParameters.bind = eventMap;
      for (const eventType in eventMap) {
        if (Object.prototype.hasOwnProperty.call(eventMap, eventType)) {
          jq(this._eventTarget).on(eventType, eventMap[eventType]);
        }
      }
    },

    // Handles resource loading and setup for non-CSS transform browsers
    _loadAndPrepare: (function() {
      if (isLegacyIE) {
        // IE-specific VML setup
        return function() {
          const imgWidth = this._originalImage.width;
          const imgHeight = this._originalImage.height;
          this._imageWidth = imgWidth;
          this._imageHeight = imgHeight;
          
          // Remove original image from DOM, it will be replaced by VML
          this._originalImage.parentNode.removeChild(this._originalImage);

          this._vmlImage = this._createVMLNode('image');
          this._vmlImage.src = this._originalImage.src;
          this._vmlImage.style.cssText = `height:${imgHeight}px; width:${imgWidth}px; position:absolute; top:0px; left:0px;`;
          this._scaleX = this._scaleY = 1; // VML doesn't scale aspect directly like canvas

          // VML group container for rotation
          this._vmlContainer = this._createVMLNode('group');
          this._vmlContainer.style.cssText = `width:${imgWidth}px; height:${imgHeight}px; position:absolute; top:0px; left:0px;`;
          // Minor adjustment for VML precision issues
          this._vmlContainer.setAttribute('coordsize', `${imgWidth - 1},${imgHeight - 1}`);
          this._vmlContainer.appendChild(this._vmlImage);

          this._elementRoot.appendChild(this._vmlContainer);
          this._elementRoot.style.cssText = `position:relative; width:${imgWidth}px; height:${imgHeight}px;`;
          this._elementRoot.setAttribute('id', this._originalImage.id);
          this._elementRoot.className = this._originalImage.className;
          this._eventTarget = this._elementRoot;

          // Process any queued rotations
          let nextOpts;
          while ((nextOpts = this._pendingRotations.shift()) !== undefined) {
            this._handleRotationUpdate(nextOpts, true);
          }
        };
      } else {
        // Canvas setup for other non-CSS transform browsers
        return function() {
          this._elementRoot.setAttribute('id', this._originalImage.id);
          this._elementRoot.className = this._originalImage.className;

          this._imageWidth = this._originalImage.naturalWidth;
          this._imageHeight = this._originalImage.naturalHeight;
          
          // Calculate max dimension for canvas to accommodate rotation without clipping
          const maxDimension = Math.sqrt(Math.pow(this._imageHeight, 2) + Math.pow(this._imageWidth, 2));
          this._canvasWidth = maxDimension * 3; // Ample padding
          this._canvasHeight = maxDimension * 3;

          this._scaleX = this._originalImage.offsetWidth / this._originalImage.naturalWidth;
          this._scaleY = this._originalImage.offsetHeight / this._originalImage.naturalHeight;

          this._originalImage.parentNode.removeChild(this._originalImage);

          this._canvasElement = document.createElement('canvas');
          this._canvasElement.setAttribute('width', this._canvasWidth);
          this._canvasElement.setAttribute('height', this._canvasHeight); // Set height too
          this._canvasElement.style.cssText = `position:relative; left:-${this._imageHeight * this._scaleX}px; top:-${this._imageWidth * this._scaleY}px;`;
          this._canvasElement.photoSpin = this._elementRoot.photoSpin; // Link instance to canvas

          this._elementRoot.appendChild(this._canvasElement);
          this._elementRoot.style.cssText = `width:${this._originalImage.width * this._scaleX}px; height:${this._originalImage.height * this._scaleY}px;`;
          this._eventTarget = this._canvasElement;

          this._canvasContext = this._canvasElement.getContext('2d');
          
          // Process any queued rotations
          let nextOpts;
          while ((nextOpts = this._pendingRotations.shift()) !== undefined) {
            this._handleRotationUpdate(nextOpts, true);
          }
        };
      }
    })(),

    // Initiates the animation sequence
    _beginAnimation: function() {
      if (this._animationTimer) {
        clearTimeout(this._animationTimer); // Clear any existing animation
      }
      this._animationStartTime = Date.now();
      this._animationStartAngle = this._currentDegrees;
      this._performAnimation();
    },

    // Recursive function for animation
    _performAnimation: function() {
      const currentTime = Date.now();
      const animationElapsed = currentTime - this._animationStartTime;
      const animationComplete = animationElapsed > this._currentParameters.animationDuration;

      // If animation is complete and not an animated GIF (which might require continuous redraw)
      if (animationComplete && !this._currentParameters.animatedGif) {
        clearTimeout(this._animationTimer); // Stop the animation timer
      } else {
        // If there's a rendering surface (canvas, VML, or modern image)
        if (this._canvasElement || this._vmlImage || this._originalImage) {
          const interpolatedAngle = this._currentParameters.easingFunction(
            0,
            animationElapsed,
            this._animationStartAngle,
            this._currentParameters.targetAngle - this._animationStartAngle,
            this._currentParameters.animationDuration
          );
          // Apply rotation, rounding to one decimal place for smoother animation
          this._applyTransform(Math.round(interpolatedAngle * 10) / 10);
        }

        // Execute step callback if provided
        if (this._currentParameters.stepFunction) {
          this._currentParameters.stepFunction(this._currentDegrees);
        }

        // Schedule next frame
        const self = this;
        this._animationTimer = setTimeout(function() {
          self._performAnimation.call(self);
        }, 10); // Aim for ~100 FPS
      }

      // Execute completion callback if animation is truly finished
      if (this._currentParameters.completionCallback && animationComplete) {
        this._currentDegrees = this._currentParameters.targetAngle; // Ensure final angle is exact
        this._applyTransform(this._currentDegrees); // Apply final exact angle
        this._currentParameters.completionCallback.call(this._elementRoot);
      }
    },

    // Applies the actual rotation transform
    _applyTransform: (function() {
      const degreesToRadians = Math.PI / 180;

      if (isLegacyIE) {
        // VML rotation for IE
        return function(angleVal) {
          this._currentDegrees = angleVal;
          this._vmlContainer.style.rotation = `${angleVal % 360}deg`;
          
          // Adjust VML image position within its container based on rotation center
          this._vmlImage.style.top = `${-(this._pivotY - this._imageHeight / 2)}px`;
          this._vmlImage.style.left = `${-(this._pivotX - this._imageWidth / 2)}px`;
          
          // Adjust VML container position to align with rotation center
          this._vmlContainer.style.top = `${this._pivotY - this._imageHeight / 2}px`;
          this._vmlContainer.style.left = `${this._pivotX - this._imageWidth / 2}px`;
        };
      } else if (transformKey) {
        // Modern CSS transform rotation
        return function(angleVal) {
          this._currentDegrees = angleVal;
          this._originalImage.style[transformKey] = `rotate(${angleVal % 360}deg)`;
          this._originalImage.style[transformOriginKey] = this._currentParameters.pivotPoint.join(" ");
        };
      } else {
        // Canvas rotation for other browsers
        return function(angleVal) {
          this._currentDegrees = angleVal;
          const radianAngle = (angleVal % 360) * degreesToRadians;

          // Clear the canvas for redrawing
          this._canvasElement.width = this._canvasWidth;
          this._canvasElement.height = this._canvasHeight;

          const ctx = this._canvasContext;
          
          // Canvas transformations are applied in reverse order of how you read them
          // 1. Center the image on the canvas
          ctx.translate(this._imageWidth * this._scaleX, this._imageHeight * this._scaleY);
          // 2. Move to the rotation pivot point
          ctx.translate(this._pivotX, this._pivotY);
          // 3. Apply the rotation
          ctx.rotate(radianAngle);
          // 4. Move back from the pivot point
          ctx.translate(-this._pivotX, -this._pivotY);
          // 5. Apply scaling if aspect ratios differ
          ctx.scale(this._scaleX, this._scaleY);
          // 6. Draw the original image (untransformed)
          ctx.drawImage(this._originalImage, 0, 0);
        };
      }
    })()
  };

  // VML node creation utility for IE
  if (isLegacyIE) {
    PhotoSpin.ImageRotator.prototype._createVMLNode = (function() {
      // Add VML behavior rule to stylesheet
      document.createStyleSheet().addRule(".vml-element", "behavior:url(#default#VML)");
      try {
        // Attempt to add VML namespace if not already present
        if (!document.namespaces.vmlNs) {
          document.namespaces.add("vmlNs", "urn:schemas-microsoft-com:vml");
        }
        return function(tag) {
          return document.createElement(`<vmlNs:${tag} class="vml-element">`);
        };
      } catch (e) {
        // Fallback for older IE versions or security restrictions
        return function(tag) {
          return document.createElement(`<${tag} xmlns="urn:schemas-microsoft-com:vml" class="vml-element">`);
        };
      }
    })();
  }

})(jQuery);