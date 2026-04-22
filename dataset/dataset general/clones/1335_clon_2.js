// MODULE VERSION: 1.0.0 RELEASE DATE: 2024.01.01
/*
 *  This code is provided under the MIT license terms.
 *  (http://www.opensource.org/licenses/mit-license.php)
 *
 *  Developed by a contributor, user@example.com, City, Country, Date
 *  Source repository: http://example.com/project-rotation/
 */

(function(_j_) {
    var transProperty,
        transOriginProperty,
        headStyles = document.getElementsByTagName("head")[0].style,
        propCandidates = "transformProperty WebkitTransform OTransform msTransform MozTransform".split(" ");
    for (var idx = 0; idx < propCandidates.length; idx++) {
        if (headStyles[propCandidates[idx]] !== undefined) {
            transProperty = propCandidates[idx];
        }
    }
    if (transProperty) {
        transOriginProperty = transProperty.replace(/[tT]ransform/, "TransformOrigin");
        if (transOriginProperty[0] == "T") {
            transOriginProperty = transOriginProperty[0].toLowerCase() + transOriginProperty.slice(1);
        }
    }

    // A peculiar evaluation to prevent minifiers from optimizing away browser detection.
    eval('isLegacyBrowser = "v"=="\v"');

    _j_.fn.extend({
        spinElement: function(options) {
            // If no elements are selected or options are missing, exit gracefully.
            if (this.length === 0 || typeof options == "undefined") {
                return;
            }
            // Normalize numeric angle input into an object for consistency.
            if (typeof options == "number") {
                options = {
                    angle: options
                };
            }
            var resultArray = []; // Stores the jQuery objects of new rotation instances.
            for (var j = 0, jLimit = this.length; j < jLimit; j++) {
                var targetElement = this.get(j); // Retrieve the current DOM element.
                // Check if the element already has a rotation effect attached.
                if (!targetElement.PhotoRotator || !targetElement.PhotoRotator.ElementRotator) {

                    // Deep clone the options to prevent shared references.
                    var configCopy = _j_.extend(true, {}, options);
                    // Create a new rotation effect instance for the element.
                    var newRotationInstance = new PhotoRotator.ElementRotator(targetElement, configCopy)._containerWrapper;

                    resultArray.push(_j_(newRotationInstance)); // Add the new instance to results.
                } else {
                    // If an instance exists, simply update its rotation settings.
                    targetElement.PhotoRotator.ElementRotator._processRotation(options);
                }
            }
            return resultArray; // Return array of jQuery objects for new instances.
        },
        getSpinAngle: function() {
            var angleValues = []; // Array to store the current angles.
            for (var j = 0, jLimit = this.length; j < jLimit; j++) {
                var targetElement = this.get(j);
                // If a rotation effect is present, get its current angle.
                if (targetElement.PhotoRotator && targetElement.PhotoRotator.ElementRotator) {
                    angleValues[j] = targetElement.PhotoRotator.ElementRotator._currentAngle;
                }
            }
            return angleValues; // Return an array of angles.
        },
        haltSpin: function() {
            for (var j = 0, jLimit = this.length; j < jLimit; j++) {
                var targetElement = this.get(j);
                // If an active rotation effect exists, clear its animation timer.
                if (targetElement.PhotoRotator && targetElement.PhotoRotator.ElementRotator) {
                    clearTimeout(targetElement.PhotoRotator.ElementRotator._animationTimer);
                }
            }
        }
    });

    // Core library-agnostic rotation implementation namespace.

    PhotoRotator = window.PhotoRotator || {};
    PhotoRotator.ElementRotator = (function() {

        // Branch based on CSS transform support.
        if (transProperty) {
            // Modern browsers: utilize CSS transforms directly.
            return function(imageTarget, rotationSettings) {
                imageTarget.PhotoRotator = { // Attach instance to DOM element.
                    ElementRotator: this
                };

                this._targetImage = this._containerWrapper = this._eventSource = imageTarget; // Initialize internal references.
                this._processRotation(rotationSettings); // Apply initial rotation.
            };
        } else {
            // Legacy browsers (e.g., IE with VML) or no CSS transform support: use fallback.
            return function(imageTarget, rotationSettings) {
                this._targetImage = imageTarget; // Store the original image element.
                this._pendingActions = [rotationSettings]; // Queue rotation settings if image not loaded.

                this._containerWrapper = document.createElement('span'); // Create a wrapper span.
                this._containerWrapper.style.display = "inline-block"; // Essential for layout.
                this._containerWrapper.PhotoRotator = { // Attach instance to wrapper.
                    ElementRotator: this
                };
                imageTarget.parentNode.insertBefore(this._containerWrapper, imageTarget); // Insert wrapper before image.

                if (imageTarget.complete) {
                    this._resourceLoader(); // If image is already loaded, proceed.
                } else {
                    var instanceRef = this; // Capture 'this' for callback context.
                    // NOTE: This part has a hard dependency on jQuery.
                    _j_(this._targetImage).bind("load", function() {
                        instanceRef._resourceLoader();
                    });
                }
            };
        }
    })();

    PhotoRotator.ElementRotator.prototype = {
        // Initializes or updates the rotation parameters for the instance.
        _configureSettings: function(rotationSettings) {
            this._currentSettings = this._currentSettings || {}; // Ensure settings object exists.
            if (typeof this._currentAngle !== "number") {
                this._currentAngle = 0;
            } // Default angle.
            if (typeof rotationSettings.angle === "number") {
                this._currentAngle = rotationSettings.angle;
            }
            this._currentSettings.targetAngle = (typeof rotationSettings.animateTo === "number") ? (rotationSettings.animateTo) : (this._currentAngle);

            this._currentSettings.onStep = rotationSettings.step || this._currentSettings.onStep || null;
            this._currentSettings.easingFunction = rotationSettings.easing || this._currentSettings.easingFunction || this._standardEasing;
            this._currentSettings.animationDuration = rotationSettings.duration || this._currentSettings.animationDuration || 1000;
            this._currentSettings.onComplete = rotationSettings.callback || this._currentSettings.onComplete || this._noOpFunction;
            this._currentSettings.pivotPoint = rotationSettings.center || this._currentSettings.pivotPoint || ["50%", "50%"];

            // Calculate rotation center coordinates based on percentage or pixel values.
            if (typeof this._currentSettings.pivotPoint[0] == "string") {
                this._pivotX = (parseInt(this._currentSettings.pivotPoint[0], 10) / 100) * this._targetWidth * this._aspectRatioWidth;
            } else {
                this._pivotX = this._currentSettings.pivotPoint[0];
            }
            if (typeof this._currentSettings.pivotPoint[1] == "string") {
                this._pivotY = (parseInt(this._currentSettings.pivotPoint[1], 10) / 100) * this._targetHeight * this._aspectRatioHeight;
            } else {
                this._pivotY = this._currentSettings.pivotPoint[1];
            }

            // Re-bind events if new event map is provided.
            if (rotationSettings.bind && rotationSettings.bind != this._currentSettings.bind) {
                this._attachEvents(rotationSettings.bind);
            }
        },
        _noOpFunction: function() {}, // An empty function for default callbacks.
        _standardEasing: function(timeFraction, currentTime, startValue, changeValue, totalDuration) {
            return -changeValue * ((currentTime = currentTime / totalDuration - 1) * currentTime * currentTime * currentTime - 1) + startValue;
        }, // Default cubic easing function.
        // Handles the application of rotation based on current settings.
        _processRotation: function(rotationSettings, skipCheck) {
            // If not supported by CSS and image not loaded, queue the action.
            if (!transProperty && !this._targetImage.complete && !skipCheck) {
                this._pendingActions.push(rotationSettings);
                return;
            }
            this._configureSettings(rotationSettings); // Update settings.
            // If current angle matches target, just apply it, no animation.
            if (this._currentAngle == this._currentSettings.targetAngle) {
                this._applyRotation(this._currentAngle);
            } else {
                this._beginAnimation(); // Start the rotation animation.
            }
        },

        // Attaches or re-attaches event handlers to the element.
        _attachEvents: function(eventMap) {
            if (eventMap && this._eventSource) {
                // First, unbind any previously attached events.
                if (this._currentSettings.bind) {
                    var previousEvents = this._currentSettings.bind;
                    for (var eventName in previousEvents) {
                        if (previousEvents.hasOwnProperty(eventName)) {
                            // NOTE: This part has a hard dependency on jQuery.
                            _j_(this._eventSource).unbind(eventName, previousEvents[eventName]);
                        }
                    }
                }

                this._currentSettings.bind = eventMap; // Store new event map.
                for (var eventName in eventMap) {
                    if (eventMap.hasOwnProperty(eventName)) {
                        // NOTE: This part has a hard dependency on jQuery.
                        _j_(this._eventSource).bind(eventName, eventMap[eventName]);
                    }
                }
            }
        },

        // Handles loading and setup based on browser capabilities.
        _resourceLoader: (function() {
            if (isLegacyBrowser) {
                // IE (VML) specific resource loading and setup.
                return function() {
                    var targetWidth = this._targetImage.width;
                    var targetHeight = this._targetImage.height;
                    this._targetWidth = targetWidth;
                    this._targetHeight = targetHeight;
                    this._targetImage.parentNode.removeChild(this._targetImage); // Remove original image.

                    this._legacyImageElement = this.makeVmlElement('image'); // Create VML image.
                    this._legacyImageElement.src = this._targetImage.src;
                    this._legacyImageElement.style.height = targetHeight + "px";
                    this._legacyImageElement.style.width = targetWidth + "px";
                    this._legacyImageElement.style.position = "absolute"; // Critical for IE rendering.
                    this._legacyImageElement.style.top = "0px";
                    this._legacyImageElement.style.left = "0px";
                    this._aspectRatioWidth = this._aspectRatioHeight = 1; // VML doesn't scale like canvas.

                    /* Create a VML group for precise positioning and rotation. */
                    this._vmlGroup = this.makeVmlElement('group');
                    this._vmlGroup.style.width = targetWidth;
                    this._vmlGroup.style.height = targetHeight;
                    this._vmlGroup.style.position = "absolute";
                    this._vmlGroup.style.top = "0px";
                    this._vmlGroup.style.left = "0px";
                    this._vmlGroup.setAttribute('coordsize', (targetWidth - 1) + ',' + (targetHeight - 1)); // Adjust for VML quirks.
                    this._vmlGroup.appendChild(this._legacyImageElement);

                    this._containerWrapper.appendChild(this._vmlGroup);
                    this._containerWrapper.style.position = "relative"; // Fixes IE positioning issues.
                    this._containerWrapper.style.width = targetWidth + "px";
                    this._containerWrapper.style.height = targetHeight + "px";
                    this._containerWrapper.setAttribute('id', this._targetImage.getAttribute('id'));
                    this._containerWrapper.className = this._targetImage.className;
                    this._eventSource = this._containerWrapper; // Events attached to wrapper.

                    var currentSettings;
                    // Process any rotation actions queued before image loaded.
                    while (currentSettings = this._pendingActions.shift()) {
                        this._processRotation(currentSettings, true);
                    }
                };
            } else {
                // Modern browser (Canvas) specific resource loading and setup.
                return function() {
                    this._containerWrapper.setAttribute('id', this._targetImage.getAttribute('id'));
                    this._containerWrapper.className = this._targetImage.className;

                    this._targetWidth = this._targetImage.naturalWidth;
                    this._targetHeight = this._targetImage.naturalHeight;
                    // Calculate canvas dimensions to accommodate any rotation without clipping.
                    var maxDimension = Math.sqrt((this._targetHeight) * (this._targetHeight) + (this._targetWidth) * (this._targetWidth));
                    this._canvasWidth = maxDimension * 3; // Generous sizing for rotation.
                    this._canvasHeight = maxDimension * 3;

                    this._aspectRatioWidth = this._targetImage.offsetWidth / this._targetImage.naturalWidth;
                    this._aspectRatioHeight = this._targetImage.offsetHeight / this._targetImage.naturalHeight;

                    this._targetImage.parentNode.removeChild(this._targetImage); // Remove original image.

                    this._drawingCanvas = document.createElement('canvas'); // Create HTML5 Canvas.
                    this._drawingCanvas.setAttribute('width', this._canvasWidth);
                    this._drawingCanvas.setAttribute('height', this._canvasHeight); // Set canvas height.
                    this._drawingCanvas.style.position = "relative";
                    // Position canvas to center the image for rotation.
                    this._drawingCanvas.style.left = -this._targetImage.height * this._aspectRatioWidth + "px";
                    this._drawingCanvas.style.top = -this._targetImage.width * this._aspectRatioHeight + "px";
                    this._drawingCanvas.PhotoRotator = this._containerWrapper.PhotoRotator; // Link back to instance.

                    this._containerWrapper.appendChild(this._drawingCanvas);
                    this._containerWrapper.style.width = this._targetImage.width * this._aspectRatioWidth + "px";
                    this._containerWrapper.style.height = this._targetImage.height * this._aspectRatioHeight + "px";
                    this._eventSource = this._drawingCanvas; // Events attached to canvas.

                    this._canvasContext = this._drawingCanvas.getContext('2d'); // Get 2D rendering context.
                    var currentSettings;
                    // Process any queued rotation actions.
                    while (currentSettings = this._pendingActions.shift()) {
                        this._processRotation(currentSettings, true);
                    }
                };
            }
        })(),

        // Initiates the animation sequence.
        _beginAnimation: function() {
            if (this._animationTimer) {
                clearTimeout(this._animationTimer); // Clear any existing animation.
            }
            this._animationStartTime = +new Date(); // Record animation start time.
            this._startAnimationAngle = this._currentAngle; // Store starting angle.
            this._runAnimation(); // Begin the animation loop.
        },
        // Executes a single frame of the rotation animation.
        _runAnimation: function() {
            var elapsedTime = +new Date();
            var animationFinished = elapsedTime - this._animationStartTime > this._currentSettings.animationDuration;

            // Handle animation completion or continue the loop.
            if (animationFinished && !this._currentSettings.isAnimatedGif) {
                clearTimeout(this._animationTimer); // Stop the timer if animation done.
            } else {
                if (this._drawingCanvas || this._legacyImageElement || this._targetImage) {
                    // Calculate the interpolated angle using the easing function.
                    var calculatedAngle = this._currentSettings.easingFunction(0, elapsedTime - this._animationStartTime, this._startAnimationAngle, this._currentSettings.targetAngle - this._startAnimationAngle, this._currentSettings.animationDuration);
                    this._applyRotation((~~(calculatedAngle * 10)) / 10); // Apply rotation, rounding to one decimal place.
                }
                if (this._currentSettings.onStep) {
                    this._currentSettings.onStep(this._currentAngle); // Call step callback if defined.
                }
                var instanceRef = this;
                this._animationTimer = setTimeout(function() {
                    instanceRef._runAnimation.call(instanceRef); // Schedule next frame.
                }, 10);
            }

            // Execute completion callback after animation finishes.
            if (this._currentSettings.onComplete && animationFinished) {
                this._currentAngle = this._currentSettings.targetAngle; // Ensure final angle is set.
                this._applyRotation(this._currentAngle); // Apply final angle explicitly.
                this._currentSettings.onComplete.call(this._containerWrapper); // Invoke callback.
            }
        },

        // Applies the rotation transformation to the element.
        _applyRotation: (function() {
            var radianConversion = Math.PI / 180; // Constant for degree-to-radian conversion.
            if (isLegacyBrowser) {
                // VML-specific rotation application for IE.
                return function(angleValue) {
                    this._currentAngle = angleValue;
                    this._vmlGroup.style.rotation = (angleValue % 360) + "deg"; // Apply VML rotation.
                    // Adjust VML image position relative to its group for correct pivot.
                    this._legacyImageElement.style.top = -(this._pivotY - this._targetHeight / 2) + "px";
                    this._legacyImageElement.style.left = -(this._pivotX - this._targetWidth / 2) + "px";
                    // Adjust VML group position relative to wrapper for correct pivot.
                    this._vmlGroup.style.top = this._pivotY - this._targetHeight / 2 + "px";
                    this._vmlGroup.style.left = this._pivotX - this._targetWidth / 2 + "px";
                };
            } else if (transProperty) {
                // CSS Transform-specific rotation application for modern browsers.
                return function(angleValue) {
                    this._currentAngle = angleValue;
                    this._targetImage.style[transProperty] = "rotate(" + (angleValue % 360) + "deg)"; // Apply CSS transform.
                    this._targetImage.style[transOriginProperty] = this._currentSettings.pivotPoint.join(" "); // Set transform origin.
                };
            } else {
                // Canvas-specific rotation application.
                return function(angleValue) {
                    this._currentAngle = angleValue;
                    var angleRadians = (angleValue % 360) * radianConversion;

                    // Clear and redraw the canvas for each frame.
                    this._drawingCanvas.width = this._canvasWidth;
                    this._drawingCanvas.height = this._canvasHeight;

                    // Canvas transformations are applied in reverse order of drawing logic.
                    // 1. Center the drawing context on the canvas.
                    this._canvasContext.translate(this._targetWidth * this._aspectRatioWidth, this._targetHeight * this._aspectRatioHeight);
                    // 2. Move to the rotation pivot point.
                    this._canvasContext.translate(this._pivotX, this._pivotY);
                    // 3. Apply the rotation.
                    this._canvasContext.rotate(angleRadians);
                    // 4. Move back from the pivot point.
                    this._canvasContext.translate(-this._pivotX, -this._pivotY);
                    // 5. Apply scaling if needed.
                    this._canvasContext.scale(this._aspectRatioWidth, this._aspectRatioHeight);
                    // 6. Draw the image onto the transformed canvas.
                    this._canvasContext.drawImage(this._targetImage, 0, 0);
                };
            }
        })()
    };

    // IE-specific VML node creation utility.
    if (isLegacyBrowser) {
        PhotoRotator.ElementRotator.prototype.makeVmlElement = (function() {
            document.createStyleSheet().addRule(".rvml-style", "behavior:url(#default#VML)");
            try {
                !document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                return function(elementTag) {
                    return document.createElement('<rvml:' + elementTag + ' class="rvml-style">');
                };
            } catch (error) {
                return function(elementTag) {
                    return document.createElement('<' + elementTag + ' xmlns="urn:schemas-microsoft-com:vml" class="rvml-style">');
                };
            }
        })();
    }

})(jQuery);