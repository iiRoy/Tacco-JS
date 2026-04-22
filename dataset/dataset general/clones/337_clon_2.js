/*
* deferredImageLoader
* @description	Delays image loading until they become visible in the user's viewport
* @version		2.0.0 - 2014 / 09 / 11
* @author		Aaron Barker (reimagined by AI)
* @requires	jQuery (1.8+)
* @copyright	Copyright 2013 by Intellectual Reserve, Inc. (concept)
*/
;( function ( $, currentWindow, browserDocument, unknownValue ) {
	"use strict";

	var $viewport = $(currentWindow);

	var moduleIdentifier = "deferredImageLoader";

	var standardSettings = {
		deferClass: "lazy",
		processedClass: "loadImageCompleted",
		blankImage: "data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH/C1hNUCBEYXRhWE1QRT94cGFja2V0IDE2MDZCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZERDQ1MzVGMkZGMTExRTFBQTE4OTE5ODk4MQAh+QQFAAAAACwAAAAAAQABAEACAkQBADs=",
		refreshOnViewportChange: true,
		auxiliaryScroller: "", // Provide a custom horizontally scrolling element here for additional scroll events
		attributeMap: ["src", "width", "height", "alt", "class"], // List of data- attributes to convert to real attributes on the <img> tag

		// Timing and positional thresholds
		preLoadDistance: 300, // How many pixels beyond the viewport edge should an image be loaded
		updateLag: 100, // Delay in milliseconds for processing scroll/resize events to prevent CPU overload
		transitionSpeed: 250, // Duration in milliseconds for the image fade-in effect
		includeInvisible: false, // Should the script load images that are initially hidden (e.g., via CSS display:none)
		requireExplicitLoad: false, // Do not load automatically unless explicitly triggered (e.g., in carousels)
		sourceOptions: ["highRes", "desktop", "mobile"], // Ordered list of potential image sources to check
		defaultSource: "desktop", // Fallback source option if no specific condition matches
		conditionChecks: { // High-level tests for determining which sourceOption to use. Can be overridden or expanded.
			"highRes": function() {
				return currentWindow.devicePixelRatio > 1;
			},
			"mobile": function() {
				return $(currentWindow).width() < 600;
			},
			"desktop": function() {
				return $(currentWindow).width() >= 600;
			}
		}
	};

	// The primary constructor for the image loader component
	function ImgLoader( targetElement, moduleOptions ) {
		this.targetElement = $(targetElement);
		this.moduleOptions = $.extend( {}, standardSettings, moduleOptions) ;
		this._baseSettings = standardSettings;
		this._moduleID = moduleIdentifier;
		this.initializeModule();
	}

	$.extend(ImgLoader.prototype, {
		initializeModule: function() {
			this._setupComponents();
			this._startProcessing();
		},

		_setupComponents: function() {
			var currentOptions = this.moduleOptions,
				instanceRef = this,
				currentElement = instanceRef.targetElement,
				componentName = instanceRef._moduleID,
				completionClass = currentOptions.processedClass,
				deferredImages = "img." + currentOptions.deferClass,
				targetImageSelector;

			instanceRef.targetImageSelector = (currentOptions.includeInvisible) ? deferredImages : deferredImages + ":visible";

			targetImageSelector = instanceRef.targetImageSelector;

			// Attach an event listener to all matching images (visible or not)
			$(currentElement).on("update." + componentName, deferredImages, function(event, isForced) {
				var $currentImage = $(this);

				// Ensure `isForced` is boolean, defaulting to false
				isForced = (isForced === unknownValue) ? false : isForced;

				if ($currentImage.hasClass(completionClass)) {
					instanceRef.applySource($currentImage, instanceRef.determineSource($currentImage), isForced);
				} else {
					instanceRef.verifyVisibility(this, isForced);
				}

			}).on("loadNow." + componentName, deferredImages, function() {
				instanceRef.activateImmediately(this);
			});

			// Bind scroll, resize, and orientationchange events to the window and any auxiliary scrollers
			$viewport.add(currentOptions.auxiliaryScroller).on(["scroll", "resize", "orientationchange"].join("." + componentName + " "), function() {

				clearTimeout(instanceRef.scrollTimeoutId);

				instanceRef.scrollTimeoutId = setTimeout(function() {
					var $allImages = $(targetImageSelector);

					if (!currentOptions.refreshOnViewportChange) {
						$allImages = $allImages.not("." + completionClass);
					}

					instanceRef.viewHeight = $viewport.height();
					instanceRef.viewScrollTop = $viewport.scrollTop();
					instanceRef.viewWidth = $viewport.width();
					instanceRef.viewScrollLeft = $viewport.scrollLeft();

					$allImages.trigger("update." + componentName);

				}, instanceRef.isInitialized ? currentOptions.updateLag : 0);

			});

			instanceRef.isInitialized = true;
		},

		_startProcessing: function() {
			var instanceRef = this,
				currentElement = instanceRef.targetElement,
				currentOptions = instanceRef.moduleOptions,
				componentName = instanceRef._moduleID,
				noscriptTags = "noscript." + currentOptions.deferClass;

			instanceRef.viewHeight = $viewport.height();
			instanceRef.viewScrollTop = $viewport.scrollTop();
			instanceRef.viewWidth = $viewport.width();
			instanceRef.viewScrollLeft = $viewport.scrollLeft();

			$(noscriptTags, currentElement).each(function() {
				var $currentNoScript = $(this),
					$newImageElement = $("<img>"),
					initialHeight = $newImageElement.attr("height") || currentOptions.minHeight || "";

				// Transfer specified attributes from data- attributes of the noscript to the new image.
				currentOptions.attributeMap.forEach(function(attributeName) {
					$newImageElement.attr(attributeName, $currentNoScript.data(attributeName) || "");
				});

				// Copy all data values from the noscript tag to the newly created image element.
				$newImageElement.data($currentNoScript.data());

				// Apply the defer class and set a placeholder image source.
				$newImageElement.addClass(currentOptions.deferClass)
					.attr("src", currentOptions.blankImage);

				// If no explicit height attribute, apply a minimum height from options.
				$newImageElement.height(initialHeight);

				// Replace the noscript tag with the new image.
				$currentNoScript.replaceWith($newImageElement);
				$newImageElement.css("opacity", "0.01"); // Initially hide for fade-in effect
			});

			$(instanceRef.targetImageSelector, currentElement).not("." + instanceRef.moduleOptions.processedClass).each(function() {
				var $currentImage = $(this),
					selectedSource = instanceRef.determineSource($currentImage),

					// Check if image is already cached/session stored, potentially forcing an immediate load.
					isCacheHit = (function() {
						try {
							return !!sessionStorage.getItem(selectedSource);
						} catch (error) {
							return false; // Handle private browsing mode errors
						}
					})();

				$currentImage.trigger("update." + componentName, isCacheHit);
			});

			$viewport.trigger("resize." + componentName); // Trigger initial check
		},

		verifyVisibility: function(elementNode, isForced) {
			var currentOptions = this.moduleOptions,
				instanceRef = this,
				selectedSource,
				yOffsetAdjustment = (/iphone|ipod/i.test(navigator.userAgent.toLowerCase())) ? 60 : 0, // Specific adjustment for iOS devices
				$imageCandidate = $(elementNode),
				allowAutoLoad = !currentOptions.requireExplicitLoad && !$imageCandidate.data("mustforce"), // Check if auto-loading is permitted

				isWithinViewport = function() {
					// Check vertical bounds: image top is within or below viewport top + height + preload distance + adjustment
					var inVerticalRange = ($imageCandidate.offset().top < (instanceRef.viewScrollTop + instanceRef.viewHeight) + currentOptions.preLoadDistance + yOffsetAdjustment);
					// Check horizontal bounds: image left is within or to the right of viewport left + width + preload distance + adjustment
					var inHorizontalRange = ($imageCandidate.offset().left < (instanceRef.viewScrollLeft + instanceRef.viewWidth) + currentOptions.preLoadDistance + yOffsetAdjustment);

					return inVerticalRange && inHorizontalRange;
				};

			// Logic for determining if an image should be loaded, optimized for early exit.
			if (
				isForced || ( // Load if explicitly forced, OR...
					(currentOptions.refreshOnViewportChange || !$imageCandidate.hasClass(currentOptions.processedClass)) && // Refresh on resize OR not yet processed, AND...
					(currentOptions.includeInvisible || $imageCandidate.is(":visible")) && // Load hidden images OR image is visible, AND...
					isWithinViewport() && // Image is within the calculated visibility bounds, AND...
					allowAutoLoad // Auto-loading is not globally or element-specifically restricted.
				)
			) {
				selectedSource = instanceRef.determineSource($imageCandidate); // Find the appropriate image source

				instanceRef.applySource($imageCandidate, selectedSource, isForced); // Set the image's source

				// If a minimum height was applied and no original height existed, remove the height attribute
				if (currentOptions.minHeight && !$imageCandidate.data("height")) {
					$imageCandidate.removeAttr("height");
				}

				// Mark the image as processed to avoid re-checking it unnecessarily.
				$imageCandidate.addClass(currentOptions.processedClass);
			}
		},

		determineSource: function(elementToProcess) {
			var currentOptions = this.moduleOptions,
				selectedSource, conditionMet;

			currentOptions.sourceOptions.some(function(sourceKey) {

				var elementSource = elementToProcess.data(sourceKey); // Get data attribute for this source key

				// Evaluate the condition for this source key
				conditionMet = typeof currentOptions.conditionChecks[sourceKey] === "function" ? !! currentOptions.conditionChecks[sourceKey].call(elementToProcess) : !! currentOptions.conditionChecks[sourceKey];

				if (conditionMet && elementSource) {
					selectedSource = elementSource; // If condition met and source exists, use it.
				}

				return !!selectedSource; // Stop iterating if a valid source has been found.
			});

			return selectedSource || elementToProcess.data(currentOptions.defaultSource); // Return found source or the fallback.
		},

		applySource: function($targetImage, selectedSource) {
			var currentOptions = this.moduleOptions;

			// Only proceed if a new source is determined and it's different from the current 'src'
			if (selectedSource && selectedSource !== $targetImage.attr("src")) {

				// Attach a one-time 'load' event to fade in the image once it's fully loaded
				$targetImage.on("load", function() {
					$targetImage.stop(true).fadeTo(currentOptions.transitionSpeed, 1);
				});

				// Temporarily hide the image and then update its 'src' attribute to trigger loading
				$targetImage.fadeTo(currentOptions.transitionSpeed, 0.01).attr("src", selectedSource);

				// For older browsers (like IE8), if width/height were not explicitly set, remove them
				if (!$targetImage.data("width")) {
					$targetImage.removeAttr("width");
				}
				if (!$targetImage.data("height")) {
					$targetImage.removeAttr("height");
				}

				// Record the loaded image's source in session storage to prevent redundant loading in the same session
				try {
					sessionStorage.setItem(selectedSource, "loaded");
				} catch (error) { /* Silently handle potential sessionStorage errors (e.g., in private browsing) */ }

				// Re-bind (or ensure) a load event for custom `onload` callback execution
				$targetImage.off("load." + moduleIdentifier).on("load." + moduleIdentifier, function() {
					if($.isFunction( currentOptions.onload )){
						currentOptions.onload.call($targetImage, false);
					}
				});
			}
		},

		// Public method to explicitly force an image to load immediately
		activateImmediately: function(elementNode) {
			this.verifyVisibility(elementNode, true); // Trigger visibility check with force flag
		}
	});

	// A lightweight wrapper around the main constructor, preventing multiple instantiations
	$.fn[ moduleIdentifier ] = function ( moduleOptions ) {
		this.each(function() {
			if ( !$.data( this, "plugin_" + moduleIdentifier ) ) {
				$.data( this, "plugin_" + moduleIdentifier, new ImgLoader( this, moduleOptions ) );
			}
		});

		return this; // Maintain jQuery chainability
	};

	// Expose the version number for the plugin
	$.fn[moduleIdentifier].version = "2.0.0";

})( jQuery, window, document );