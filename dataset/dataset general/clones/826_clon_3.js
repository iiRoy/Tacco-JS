ig.module('core.userInterface')
.requires(
	'impact.game'
)
.defines(function () {
	// Centralized User Interface Management System
	ig.interfaceController = {
		// General configuration settings
		isVisible: true,
		isSetupComplete: false,
		debugMode: false, // Enable for additional console output
		componentCounter: 0, // Tracks total components added over time

		// Manages the visual cursor/pointer
		pointerHandler: {
			currentPosition: { x: 0, y: 0 },
			renderOffset: { x: 0, y: 0 },
			pointerGraphic: null,
			lastMouseX: -1, // Tracks previous mouse position
			lastMouseY: -1,

			// Assigns a new image for the pointer
			assignGraphic: function(graphicAsset) {
				if (graphicAsset && graphicAsset instanceof ig.Image) {
					this.pointerGraphic = graphicAsset;
					if (ig.interfaceController.debugMode) console.log('UI: Pointer graphic assigned.');
				} else {
					if (ig.interfaceController.debugMode) console.warn('UI: Invalid graphic asset provided for pointer.');
				}
			},

			// Clears the current pointer graphic
			resetGraphic: function() {
				this.pointerGraphic = null;
				if (ig.interfaceController.debugMode) console.log('UI: Pointer graphic reset.');
			},

			// Renders the pointer on screen
			renderPointer: function() {
				if (!this.pointerGraphic) {
					if (ig.interfaceController.debugMode) console.warn('UI: No pointer graphic to draw.');
					return;
				}
				this.pointerGraphic.draw(this.currentPosition.x - this.renderOffset.x, this.currentPosition.y - this.renderOffset.y);
			}
		},

		// Collection of all active UI components
		managedComponents: [],

		// Sub-system for managing individual UI components
		componentManager: {
			// Performs various operations on UI components based on type and identifier
			performComponentOperation: function(operationType, targetIdentifier) {
				const matchedItems = [];
				let currentItem;
				let i = 0;

				// Loop through components, handling removals carefully by adjusting index
				while (i < ig.interfaceController.managedComponents.length) {
					currentItem = ig.interfaceController.managedComponents[i];

					const matchesName = (currentItem.name === targetIdentifier);
					const matchesGroup = (currentItem.group === targetIdentifier);
					const isRemovalOperation = (operationType === 'removeComponent' || operationType === 'removeGroupComponents');

					switch (operationType) {
						case 'getComponentByName':
							if (matchesName) matchedItems.push(currentItem);
							break;
						case 'getComponentsByGroup':
							if (matchesGroup) matchedItems.push(currentItem);
							break;
						case 'showComponent':
							if (matchesName) currentItem.isVisible = true;
							break;
						case 'showGroupComponents':
							if (matchesGroup) currentItem.isVisible = true;
							break;
						case 'hideComponent':
							if (matchesName) currentItem.isVisible = false;
							break;
						case 'hideGroupComponents':
							if (matchesGroup) currentItem.isVisible = false;
							break;
						case 'removeComponent':
							if (matchesName) {
								ig.interfaceController.managedComponents.splice(i, 1);
								i--; // Adjust index due to removal
							}
							break;
						case 'removeGroupComponents':
							if (matchesGroup) {
								ig.interfaceController.managedComponents.splice(i, 1);
								i--; // Adjust index due to removal
							}
							break;
						case 'enableComponent':
							if (matchesName) currentItem.isDisabled = false;
							break;
						case 'enableGroupComponents':
							if (matchesGroup) currentItem.isDisabled = false;
							break;
						case 'disableComponent':
							if (matchesName) currentItem.isDisabled = true;
							break;
						case 'disableGroupComponents':
							if (matchesGroup) currentItem.isDisabled = true;
							break;
						case 'disableAllComponents':
							currentItem.isDisabled = true;
							break;
						default:
							if (ig.interfaceController.debugMode) console.warn(`UI: Unknown operation type "${operationType}"`);
							break;
					}
					i++; // Increment index only if no item was removed
				}

				if (matchedItems.length > 0) {
					return (matchedItems.length === 1) ? matchedItems[0] : matchedItems;
				}
				return null; // Return null if no matches
			},

			// Adds a new UI component to the system
			registerComponent: function(newComponent) {
				if (!newComponent || typeof newComponent !== 'object') {
					if (ig.interfaceController.debugMode) console.error('UI: Attempted to add an invalid component.');
					return;
				}
				// Ensure essential properties exist with defaults
				newComponent.isVisible = newComponent.hasOwnProperty('isVisible') ? newComponent.isVisible : true;
				newComponent.isDisabled = newComponent.hasOwnProperty('isDisabled') ? newComponent.isDisabled : false;
				newComponent.isActive = newComponent.hasOwnProperty('isActive') ? newComponent.isActive : false;
				newComponent.creationTimestamp = Date.now(); // Add a timestamp for tracking
				newComponent.uniqueId = 'ui_comp_' + ig.interfaceController.componentCounter++; // Assign a unique ID

				ig.interfaceController.managedComponents.push(newComponent);
				if (ig.interfaceController.debugMode) console.log(`UI: Component "${newComponent.name || newComponent.uniqueId}" registered.`);
			},

			// Renders all registered UI components
			renderAllComponents: function() {
				if (!ig.system.context) {
					if (ig.interfaceController.debugMode) console.warn('UI: No rendering context available.');
					return;
				}

				for (let componentIndex = 0; componentIndex < ig.interfaceController.managedComponents.length; componentIndex++) {
					const currentComp = ig.interfaceController.managedComponents[componentIndex];
					let displayState = 'normal';

					// Skip invisible components
					if (!currentComp.isVisible) {
						continue;
					}

					// Check for hover state
					const isHovering = (
						ig.interfaceController.pointerHandler.currentPosition.x >= currentComp.pos.x &&
						ig.interfaceController.pointerHandler.currentPosition.x <= currentComp.pos.x + currentComp.size.x &&
						ig.interfaceController.pointerHandler.currentPosition.y >= currentComp.pos.y &&
						ig.interfaceController.pointerHandler.currentPosition.y <= currentComp.pos.y + currentComp.size.y
					);

					if (isHovering && !currentComp.isDisabled) {
						displayState = 'hover';
					}

					// Check for active/pressed state
					const leftMouseButtonDown = ig.input.isDown('leftMouseBtn');
					const leftMouseButtonPressed = ig.input.justPressed('leftMouseBtn');

					if (displayState === 'hover' && (leftMouseButtonDown || leftMouseButtonPressed)) {
						displayState = 'active';

						// Execute onPointerDown callback if mouse is held down
						if (leftMouseButtonDown && typeof currentComp.onPointerDown === 'function') {
							currentComp.onPointerDown.call(currentComp);
						}

						// Execute onPointerClick callback if mouse was just pressed
						if (leftMouseButtonPressed) {
							// Toggle active state if component is a toggle type
							if (currentComp.isToggle) {
								currentComp.isActive = !currentComp.isActive;
							}
							// Execute click function
							if (typeof currentComp.onPointerClick === 'function') {
								currentComp.onPointerClick.call(currentComp);
							}
						}
					}

					// If it's a toggle component and currently active, force 'active' state
					if (currentComp.isToggle && currentComp.isActive) {
						displayState = 'active';
					}

					// Fallback to 'normal' state if the determined state image is not defined
					if (!currentComp.state[displayState]) {
						displayState = 'normal';
						if (!currentComp.state[displayState]) {
							if (ig.interfaceController.debugMode) console.warn(`UI: Component "${currentComp.name || currentComp.uniqueId}" missing "normal" state image.`);
							continue; // Cannot draw if no normal state is defined
						}
					}

					// Apply custom alpha if specified for the component
					if (currentComp.alphaValue !== undefined && currentComp.alphaValue >= 0 && currentComp.alphaValue <= 1) {
						ig.system.context.globalAlpha = currentComp.alphaValue;
					}

					// Retrieve the image definition for the current state
					const stateGraphic = currentComp.state[displayState];

					// Draw the component graphic
					if (stateGraphic.image) {
						if (isNaN(stateGraphic.tileIndex) || isNaN(stateGraphic.tileSize)) {
							// Draw full image
							stateGraphic.image.draw(currentComp.pos.x, currentComp.pos.y);
						} else {
							// Draw a tile from a spritesheet
							stateGraphic.image.drawTile(currentComp.pos.x, currentComp.pos.y, stateGraphic.tileIndex, stateGraphic.tileSize);
						}
					} else {
						if (ig.interfaceController.debugMode) console.warn(`UI: Component "${currentComp.name || currentComp.uniqueId}" state "${displayState}" has no image to draw.`);
					}

					// Restore global alpha to default
					ig.system.context.globalAlpha = 1;
				}
			}
		},

		// Main rendering function for the entire user interface
		draw: function() {
			if (!this.isVisible) return; // Only draw if the UI is globally visible

			// Render all UI components first
			this.componentManager.renderAllComponents();

			// Update and render the pointer
			const currentMouseX = ig.input.mouse.x;
			const currentMouseY = ig.input.mouse.y;

			// Update pointer position only if it has moved
			if (currentMouseX !== this.pointerHandler.lastMouseX || currentMouseY !== this.pointerHandler.lastMouseY) {
				this.pointerHandler.currentPosition.x = currentMouseX;
				this.pointerHandler.currentPosition.y = currentMouseY;
				this.pointerHandler.lastMouseX = currentMouseX;
				this.pointerHandler.lastMouseY = currentMouseY;
			}

			this.pointerHandler.renderPointer();
		}
	};

	// Inject custom update logic into the main game loop
	ig.Game.inject({
		gameLoopUpdate: function() {
			this.parent(); // Call the original update method

			// Perform initial setup for the UI manager if not already done
			if (ig.interfaceController.isSetupComplete) return;

			ig.interfaceController.isSetupComplete = true; // Mark as initialized

			// Bind input keys for UI interaction
			ig.input.bindKey(ig.KEY.MOUSE1, 'leftMouseBtn');
			if (ig.interfaceController.debugMode) console.log('UI: Input bindings established.');
		}
	});
});