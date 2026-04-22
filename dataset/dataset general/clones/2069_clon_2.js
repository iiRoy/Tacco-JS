/*
 *******************************************************************
 *
 *  Module   : PictureBar
 *  Version  : 1.0
 *  Author   : A. N. Other
 *  Purpose  : Manages interactive image panels with dynamic resizing
 *  License  : New BSD License
 *
 *******************************************************************
 */

var PhotoStrip = new Class({

	// Retrieves the default configuration settings for the component.
	fetchConfiguration: function() {
		return {
			onActivation: function() { return false; },       // Callback when a panel expands
			onDeactivation: function() { return false; },     // Callback when a panel collapses
			onPanelSelect: function() {},           // Callback when a panel is clicked to expand
			onPanelDeselect: function() {},         // Callback when an active panel is clicked to collapse
			activePanelWidth: 200,              // Desired width for the currently active panel
			motionCurve: Fx.Transitions.Quad.easeOut, // Animation easing function
			transitionTime: 400,                // Duration of the animation in milliseconds
			selectedPanel: null,                // Index of the initially selected panel, or its ID
			panelGap: 0                         // Space between panels (border simulation)
		};
	},

	// Initializes the PictureBar component with given elements and options.
	setupLayout: function(domElements, userProvidedOptions) {
		this.setConfiguration(this.fetchConfiguration(), userProvidedOptions);

		this.stripItems = $$(domElements); // Collects the DOM elements for the strip

		this.panelSizes = {};
		this.panelSizes.contracted = this.stripItems[0].getStyle('width').toInt(); // Default width when not active
		this.panelSizes.expanded = this.config.activePanelWidth; // Width for the selected panel
		// Calculate width for other panels when one is expanded
		this.panelSizes.collapsedOthers = Math.round(
			((this.panelSizes.contracted * this.stripItems.length) -
			(this.panelSizes.expanded + this.config.panelGap)) /
			(this.stripItems.length - 1)
		);


		// Set up the animation instance for the strip items
		this.animationInstance = new Fx.Elements(this.stripItems, {
			wait: false,
			duration: this.config.transitionTime,
			transition: this.config.motionCurve
		});

		// Iterate over each strip item to attach event listeners
		this.stripItems.forEach(function(itemElement, itemIndex) {
			// Event for when the mouse enters an item
			itemElement.addEvent('mouseenter', function(eventObject) {
				new DomEvent(eventObject).halt(); // Stop default event behavior
				this.reconfigurePanelSizes(itemIndex); // Adjust sizes for the hovered item
				if (this.config.onActivation) {
					this.config.onActivation(itemElement, itemIndex);
				}
			}.bind(this));

			// Event for when the mouse leaves an item
			itemElement.addEvent('mouseleave', function(eventObject) {
				new DomEvent(eventObject).halt(); // Stop default event behavior
				this.reconfigurePanelSizes(this.config.selectedPanel); // Revert to selected state or closed
				if (this.config.onDeactivation) {
					this.config.onDeactivation(itemElement, itemIndex);
				}
			}.bind(this));

			const selfReference = this; // Capture 'this' for inner scope

			// Event for when an item is clicked
			itemElement.addEvent('click', function(eventObject) {
				if (selfReference.config.onPanelSelect) {
					new DomEvent(eventObject).halt(); // Prevent default click action

					// Check if this panel is already the active one
					if (selfReference.config.selectedPanel === itemIndex) {
						selfReference.config.selectedPanel = null; // Deselect it
						selfReference.config.onPanelDeselect(this.href, itemIndex);
					} else {
						selfReference.config.selectedPanel = itemIndex; // Select this panel
						selfReference.config.onPanelSelect(this.href, itemIndex);
					}
				}
			});

		}.bind(this)); // Bind 'this' to the forEach callback

		// Handle initial selected panel if specified in options
		if (this.config.selectedPanel !== null) {
			if (typeof this.config.selectedPanel === 'number') {
				this.reconfigurePanelSizes(this.config.selectedPanel);
			} else {
				// If selectedPanel is an ID, find its index
				this.stripItems.forEach(function(itemElement, itemIndex) {
					if (itemElement.id === this.config.selectedPanel) {
						this.reconfigurePanelSizes(itemIndex);
					}
				}, this); // Bind 'this' for the inner forEach
			}
		}
	},

	// Adjusts the sizes of all panels based on the active one.
	reconfigurePanelSizes: function(activePanelNumber) {

		// Determine the base width for non-active panels
		let currentPanelWidth;
		if (typeof activePanelNumber === 'number') {
			currentPanelWidth = this.panelSizes.collapsedOthers;
			// Add border compensation for the last panel if it's the one before the active one
			if (activePanelNumber + 1 === this.stripItems.length) {
				currentPanelWidth += this.config.panelGap;
			}
		} else {
			currentPanelWidth = this.panelSizes.contracted; // All panels at default width
		}

		const panelWidthMapping = {}; // Object to hold target widths for animation
		this.stripItems.forEach(function(itemElement, itemIndex) {
			let designatedWidth = currentPanelWidth;
			// If it's the last item, add a small extra width (original code had +5)
			if (itemIndex === this.stripItems.length - 1) {
				designatedWidth = currentPanelWidth + 5;
			}
			panelWidthMapping[itemIndex] = { 'width': designatedWidth };
		}.bind(this));

		// Set the specific width for the active panel, if one is active
		if (typeof activePanelNumber === 'number') {
			panelWidthMapping[activePanelNumber] = { 'width': this.panelSizes.expanded };
		}

		this.animationInstance.start(panelWidthMapping); // Start the animation
	}

});

// Augment the PhotoStrip class with options and events capabilities
PhotoStrip.augment(new ComponentOptions);
PhotoStrip.augment(new ComponentEvents);


/*
 *******************************************************************
 */