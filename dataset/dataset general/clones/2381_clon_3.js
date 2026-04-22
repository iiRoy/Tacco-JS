(function($){
	'use strict';

	/**
	 * Manages adaptive layout for a primary container and its media content,
	 * ensuring it scales correctly with the viewport.
	 * @class DynamicLayoutAdjuster
	 * @param {object} initialConfigs - Configuration options for the instance.
	 */
	const DynamicLayoutAdjuster = function(initialConfigs) {
		// Enforce 'new' keyword usage for constructor
		if (!(this instanceof DynamicLayoutAdjuster)) {
			return new DynamicLayoutAdjuster(initialConfigs);
		}

		// Instance properties, initialized to null or defaults
		this.settings = $.extend(true, {}, DynamicLayoutAdjuster.defaultConfiguration, initialConfigs);
		this.viewportObserver = $(window); // Reference to the browser's viewport
		this.primaryContainer = null;      // The main wrapper element
		this.visualAssetWrapper = null;    // The media element (image/video) within the wrapper
		this.gradientOverlay = null;       // The optional visual overlay layer

		// A flag to prevent multiple resize event bindings
		this.isLayoutActive = false;
	};

	/**
	 * Prototype methods for DynamicLayoutAdjuster.
	 * @lends DynamicLayoutAdjuster.prototype
	 */
	DynamicLayoutAdjuster.prototype = {

		/**
		 * Default configuration, can be extended per instance.
		 */
		defaultConfiguration: {
			visualFilterAsset: null, // URL for a background image overlay
			animationSpeed: 0        // Duration for CSS transitions (not fully implemented here, but for future expansion)
		},

		/**
		 * Initiates the adaptive layout management for a given root element.
		 * @param {jQuery} rootContainerRef The jQuery object representing the root element to manage.
		 * @returns {boolean} True if activation was successful, false otherwise.
		 */
		activateLayout: function(rootContainerRef){
			const selfContext = this; // Capture the current instance context

			// Basic validation for the root container
			if (!rootContainerRef || rootContainerRef.length === 0) {
				console.error("Layout activation failed: No valid root container provided.");
				return false;
			}
			if (this.isLayoutActive) {
				console.info("Layout already active for this element. Updating configuration.");
				// If already active, just re-apply settings and perform adjustment
				this.updateConfiguration(rootContainerRef.data('dynamicLayoutSettings') || {});
				this.performLayoutAdjustment();
				return true;
			}

			// Configure the main container and its immediate child
			this.prepareRootContainer(rootContainerRef);

			// Perform an initial layout adjustment to set dimensions
			this.performLayoutAdjustment();

			// Bind the viewport resize event only once
			this.viewportObserver.on('resize.dynamicLayout', function(resizeEvent){
				selfContext.performLayoutAdjustment(resizeEvent);
			});

			this.isLayoutActive = true;
			return true;
		},

		/**
		 * Handles the dynamic resizing and positioning of the elements
		 * based on the current viewport dimensions.
		 * @param {Event} [resizeEvt] The resize event object (optional).
		 */
		performLayoutAdjustment: function(resizeEvt){
			// Guard clause: ensure necessary elements are available
			if (!this.primaryContainer || !this.visualAssetWrapper || this.primaryContainer.length === 0 || this.visualAssetWrapper.length === 0) {
				console.warn("Cannot perform layout adjustment: Primary container or visual asset wrapper not properly initialized.");
				return; // Exit if elements are not ready
			}

			// Retrieve current viewport dimensions
			const currentViewportWidth = this.viewportObserver.width();
			const currentViewportHeight = this.viewportObserver.height();

			// Ensure viewport dimensions are positive
			if (currentViewportWidth <= 0 || currentViewportHeight <= 0) {
				console.warn("Viewport dimensions are invalid, skipping layout adjustment.");
				return;
			}

			// Apply dimensions to the primary container
			this.primaryContainer.css({
				width: currentViewportWidth + 'px',
				height: currentViewportHeight + 'px'
			});

			// Get original media dimensions from data attributes, with fallback
			const mediaNaturalWidth = this.visualAssetWrapper.data('original-width') || this.visualAssetWrapper[0].naturalWidth || 1;
			const mediaNaturalHeight = this.visualAssetWrapper.data('original-height') || this.visualAssetWrapper[0].naturalHeight || 1;

			// Calculate aspect ratios
			const viewportAspectRatio = currentViewportWidth / currentViewportHeight;
			const mediaAspectRatio = mediaNaturalWidth / mediaNaturalHeight;

			// Variables for final media dimensions and position
			let finalMediaWidth, finalMediaHeight, leftOffset, topOffset;

			// Determine scaling strategy (cover effect)
			if (mediaAspectRatio > viewportAspectRatio) {
				// Media is wider relative to its height than the viewport
				finalMediaHeight = currentViewportHeight;
				finalMediaWidth = mediaNaturalWidth * (currentViewportHeight / mediaNaturalHeight);
				leftOffset = - (finalMediaWidth - currentViewportWidth) / 2;
				topOffset = 0;
			} else {
				// Media is taller relative to its width than the viewport
				finalMediaWidth = currentViewportWidth;
				finalMediaHeight = mediaNaturalHeight * (currentViewportWidth / mediaNaturalWidth);
				leftOffset = 0;
				topOffset = - (finalMediaHeight - currentViewportHeight) / 2;
			}

			// Apply calculated styles to the visual asset wrapper
			this.visualAssetWrapper.css({
				width: finalMediaWidth + 'px',
				height: finalMediaHeight + 'px',
				left: leftOffset + 'px',
				top: topOffset + 'px'
			});

			// If an overlay is configured, adjust its size as well
			if (this.settings.visualFilterAsset) {
				if (this.gradientOverlay && this.gradientOverlay.length) {
					this.gradientOverlay.css({
						width: currentViewportWidth + 'px',
						height: currentViewportHeight + 'px'
					});
				} else {
					// If overlay should exist but doesn't, try to create it
					this.createVisualOverlay();
					// Then adjust it if successfully created
					if (this.gradientOverlay) {
						this.gradientOverlay.css({
							width: currentViewportWidth + 'px',
							height: currentViewportHeight + 'px'
						});
					}
				}
			}
		},

		/**
		 * Configures the CSS properties of the primary container and its first child.
		 * @param {jQuery} elementToManage The root element to be managed.
		 */
		prepareRootContainer: function(elementToManage){
			this.primaryContainer = elementToManage;
			this.primaryContainer.css({
				display: "block",
				overflow: "hidden",
				margin: "0",
				padding: "0",
				position: "relative",
				boxSizing: "border-box" // Ensure consistent box model
			});

			const potentialMediaChild = this.primaryContainer.children().eq(0);
			if (potentialMediaChild.length === 0) {
				console.error("The managed root element must contain at least one child for media content.");
				return; // Early exit if no child found
			}
			this.visualAssetWrapper = potentialMediaChild;
			this.visualAssetWrapper.css({
				display: "block",
				margin: "0",
				padding: "0",
				position: "absolute",
				zIndex: -10, // Place behind other content
				objectFit: "cover" // Useful for image/video elements
			});

			// Initialize the visual overlay if configured
			if (this.settings.visualFilterAsset) {
				this.createVisualOverlay();
			}
		},

		/**
		 * Generates and appends a visual overlay (e.g., a gradient film) to the primary container.
		 */
		createVisualOverlay: function(){
			// Prevent re-creating the overlay if it already exists
			if (this.gradientOverlay && this.gradientOverlay.length) {
				console.log("Visual overlay already present, skipping creation.");
				return;
			}
			// Only create if a filter asset is specified in settings
			if (!this.settings.visualFilterAsset) {
				return;
			}

			const tempOverlayDiv = $("<div>"); // Create a new div element
			const currentViewportWidth = this.viewportObserver.width();
			const currentViewportHeight = this.viewportObserver.height();

			tempOverlayDiv.css({
				height: currentViewportHeight + 'px',
				width: currentViewportWidth + 'px',
				display: "block",
				margin: "0",
				padding: "0",
				position: "absolute",
				zIndex: -5, // Place above media but below other content
				background: `url(${this.settings.visualFilterAsset}) repeat-x left bottom` // Using template literal
			});

			this.primaryContainer.append(tempOverlayDiv);
			this.gradientOverlay = tempOverlayDiv; // Store reference to the created overlay
		},

		/**
		 * Merges new configuration settings with existing ones.
		 * @param {object} newSettings An object containing new configuration values.
		 */
		updateConfiguration: function(newSettings){
			// Deep merge new settings into the current instance settings
			this.settings = $.extend(true, {}, this.settings, newSettings);

			// If a new filter asset is provided and no overlay exists, create it
			if (this.settings.visualFilterAsset && (!this.gradientOverlay || this.gradientOverlay.length === 0)) {
				this.createVisualOverlay();
			} else if (!this.settings.visualFilterAsset && this.gradientOverlay && this.gradientOverlay.length) {
				// If filter asset is removed, remove the overlay
				this.gradientOverlay.remove();
				this.gradientOverlay = null;
			}

			// Trigger a layout adjustment to apply any visual changes from new settings
			this.performLayoutAdjustment();
		},

		/**
		 * Cleans up event listeners and removes instance data.
		 */
		destroy: function() {
			this.viewportObserver.off('resize.dynamicLayout'); // Unbind the specific event
			if (this.gradientOverlay) {
				this.gradientOverlay.remove(); // Remove the overlay element from DOM
			}
			if (this.primaryContainer) {
				this.primaryContainer.removeData('dynamicLayoutInstance'); // Remove instance data
			}
			this.isLayoutActive = false;
			console.log("DynamicLayoutAdjuster instance destroyed.");
		}
	};

	/**
	 * jQuery plugin entry point for Adaptive Fullscreen View.
	 * @param {object} userProvidedSettings - Custom settings to override defaults.
	 * @returns {jQuery} The jQuery object for chaining.
	 */
	$.fn.adaptiveFullscreenView = function(userProvidedSettings){
		// Merge user settings with plugin defaults
		const finalSettings = $.extend(true, {}, $.fn.adaptiveFullscreenView.defaultConfigs, userProvidedSettings);

		// Iterate over each matched element to apply the plugin
		return this.each(function(){
			const currentElement = $(this);
			// Attempt to retrieve an existing instance from the element's data
			let instance = currentElement.data('dynamicLayoutInstance');

			if (!instance) {
				// No instance found, create a new one
				instance = new DynamicLayoutAdjuster(finalSettings);
				currentElement.data('dynamicLayoutInstance', instance); // Store instance for future reference
				instance.activateLayout(currentElement);
			} else {
				// Instance already exists, just update its configuration
				instance.updateConfiguration(userProvidedSettings);
			}
		});
	};

	/**
	 * Default configuration options for the jQuery plugin.
	 * These can be overridden globally or per instance.
	 * @property {string|null} visualFilterAsset - URL of an image to use as a repeating background overlay.
	 * @property {number} animationDuration - Duration in milliseconds for layout transitions.
	 */
	$.fn.adaptiveFullscreenView.defaultConfigs = {
		visualFilterAsset: null, // No filter image by default
		animationDuration: 250   // A small animation duration for smoother transitions
	};

	// Expose the core class for advanced usage if needed
	window.DynamicLayoutAdjuster = DynamicLayoutAdjuster;

})(window.jQuery);