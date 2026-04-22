/*
 * Module: Keyboard Layout Editor
 * Description: This script defines an Angular.js application for editing keyboard layouts.
 * It manages key properties, layout serialization, undo/redo history, and UI interactions.
 * Author: KeyCraft Development Team
 * Date: 2023-10-27
 */
(function () {
	"use strict"; // Enforce strict mode for cleaner code.

	/**
	 * Formats an array of objects into a human-readable, line-separated string representation.
	 * This function assumes an external serialization service `$keySerializationUtil` is available.
	 * @param {Array<Object>} elementCollection - The collection of elements to format.
	 * @returns {string} A string representing the formatted elements, each on a new line.
	 */
	function formatDataForDisplay(elementCollection) {
		if (!elementCollection || elementCollection.length === 0) {
			return "// No elements to display.\n";
		}
		let resultSegments = [];
		elementCollection.forEach(function(item) {
			resultSegments.push($keySerializationUtil.toJsonL(item));
		});
		return resultSegments.join(",\n") + "\n";
	}

	/**
	 * Parses a string representation of data back into an array of objects.
	 * This function assumes an external deserialization service `$keySerializationUtil` is available.
	 * It wraps the input JSON string in array brackets for proper parsing if not already present.
	 * @param {string} jsonText - The JSON string to parse.
	 * @returns {Array<Object>} An array of parsed objects.
	 */
	function parseDisplayData(jsonText) {
		// Ensure the input is treated as an array of objects for `$keySerializationUtil.fromJsonL`
		return $keySerializationUtil.fromJsonL('[' + jsonText + ']');
	}

	// The primary Angular module for our key layout editor application.
	// It depends on ngSanitize for safe HTML binding and ui.utils for additional utilities.
	var keyCraftModule = angular.module('keyCraftModule', ["ngSanitize", "ui.utils"]);

	/**
	 * Utility function to debounce another function.
	 * @param {Function} func - The function to debounce.
	 * @param {number} delay - The delay in milliseconds.
	 * @returns {Function} The debounced function.
	 */
	function _debounce(func, delay) {
		let timeoutId;
		return function(...args) {
			const context = this;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.apply(context, args), delay);
		};
	}

	// The main application controller responsible for managing the editor's state and logic.
	keyCraftModule.controller('layoutEditorController',
		['$scope', '$http', '$location', '$timeout', '$sce', '$sanitize',
		function(scopeRef, httpSvc, locationSvc, timeoutSvc, sceSvc, sanitizeSvc) {

		// Internal state variables for the controller.
		let ctrl_changeCounter = 0; // Tracks number of modifications for more granular dirty state.
		let ctrl_serializationUpdateHandler = null; // Holds the debounced serialization update function.

		// Application metadata and UI state.
		scopeRef.appRevision = "1.0.0-alpha"; // Current version of the editor.
		scopeRef.activeViewIndex = 0; // Controls which tab is currently visible: 0=Properties, 1=Kbd Properties, 2=Raw Data.

		// Data structures for key management.
		scopeRef.currentlySelectedElements = []; // Array to store references to currently selected key objects.
		scopeRef.combinedElementProperties = {}; // Aggregated properties of selected keys, or the last selected key.
		scopeRef.layoutMetadata = {}; // Metadata for the entire keyboard layout.

		// The core data model representing the keyboard layout.
		scopeRef.keyConfigurationModel = { elements: [], metadata: {} };

		/**
		 * Getter/setter for the array of key elements.
		 * @param {Array<Object>} [newElements] - Optional new array of key elements to set.
		 * @returns {Array<Object>} The current array of key elements.
		 */
		scopeRef.getKeyElements = function(newElements) {
			if (newElements) {
				scopeRef.keyConfigurationModel.elements = newElements;
				ctrl_changeCounter++; // Increment change counter on model update.
			}
			return scopeRef.keyConfigurationModel.elements;
		};

		// Helper functions for selection management.
		scopeRef.clearSelection = function() {
			scopeRef.currentlySelectedElements = [];
			scopeRef.combinedElementProperties = {};
		};

		scopeRef.selectAllWindows = function(triggerEvent) {
			if (triggerEvent) { triggerEvent.preventDefault(); }
			// Ensure keys are sorted for consistent behavior, though not strictly required for "select all".
			$keySerializationUtil.sortKeys(scopeRef.getKeyElements());
			scopeRef.clearSelection();
			scopeRef.getKeyElements().forEach(function(element) {
				scopeRef.currentlySelectedElements.push(element);
			});
			if (scopeRef.getKeyElements().length > 0) {
				// Set combinedElementProperties to a deep copy of the last key.
				scopeRef.combinedElementProperties = angular.copy(scopeRef.getKeyElements()[scopeRef.getKeyElements().length - 1]);
			}
		};

		/**
		 * Persists the current layout configuration to the backend.
		 * @param {string} layoutData - The serialized layout data to save.
		 */
		function persistLayoutConfiguration(layoutData) {
			$keySerializationUtil.saveLayout(httpSvc, layoutData,
				function(filename) { // Success callback
					scopeRef.hasUnsavedChanges = false;
					scopeRef.isConfigurationSaved = filename;
					locationSvc.path("/layouts/" + filename);
					locationSvc.hash(""); // Clear hash after saving.
					scopeRef.lastSaveFailureMessage = "";
					// Clear any temporary local storage backup
					localStorage.removeItem('keyCraft_temp_backup');
				},
				function(responseData, httpStatus) { // Error callback
					scopeRef.isConfigurationSaved = false;
					scopeRef.lastSaveFailureMessage = `HTTP ${httpStatus} - ${responseData.toString()}`;
				}
			);
		}

		/**
		 * Initiates the save operation for the current layout.
		 * @param {Event} [triggerEvent] - The DOM event that triggered the save.
		 */
		scopeRef.initiateSaveOperation = function(triggerEvent) {
			if (triggerEvent) {
				triggerEvent.preventDefault();
			}
			if (scopeRef.hasUnsavedChanges) {
				// Serialize the entire keyboard configuration model before saving.
				const dataToSave = $keySerializationUtil.serialize(scopeRef.keyConfigurationModel);
				persistLayoutConfiguration(dataToSave);
			}
		};

		/**
		 * Checks if saving is currently possible (i.e., if there are unsaved changes).
		 * @returns {boolean} True if there are unsaved changes, false otherwise.
		 */
		scopeRef.isSavePossible = function() {
			return scopeRef.hasUnsavedChanges;
		};

		/**
		 * Handles the selection or deselection of a single key element.
		 * Supports shift-click for range selection and ctrl/alt-click for toggling.
		 * @param {Object} targetKey - The key object being clicked.
		 * @param {Event} domEvent - The DOM event associated with the click.
		 */
		function handleElementSelection(targetKey, domEvent) {
			if (!targetKey) { return; }

			// Check for shift-click to extend selection.
			if (domEvent.shiftKey && scopeRef.currentlySelectedElements.length > 0) {
				const allKeys = scopeRef.getKeyElements();
				const lastSelectedKey = scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1];
				const cursorIndex = allKeys.indexOf(targetKey);
				const anchorIndex = allKeys.indexOf(lastSelectedKey);

				// Remove the last selected key temporarily if it was part of a previous range selection.
				// This simplifies the logic for updating the range.
				scopeRef.currentlySelectedElements.pop();

				// If the anchor key is not found, treat it as a fresh selection.
				if (anchorIndex === -1) {
					scopeRef.clearSelection();
					scopeRef.currentlySelectedElements.push(targetKey);
				} else {
					// Select everything between anchor and cursor.
					const startIndex = Math.min(anchorIndex, cursorIndex);
					const endIndex = Math.max(anchorIndex, cursorIndex);
					for (let i = startIndex; i <= endIndex; ++i) {
						// Only add if not already selected to avoid duplicates.
						if (scopeRef.currentlySelectedElements.indexOf(allKeys[i]) === -1) {
							scopeRef.currentlySelectedElements.push(allKeys[i]);
						}
					}
				}
				// Exit early, as the selection has been handled.
				// The combinedElementProperties will be updated at the end.
			} else {
				// If neither CTRL nor ALT is held down, clear all prior selections.
				if (!domEvent.ctrlKey && !domEvent.altKey) {
					scopeRef.clearSelection();
				}

				const existingIndex = scopeRef.currentlySelectedElements.indexOf(targetKey);
				if (existingIndex >= 0) { // Key is already selected, so deselect it.
					scopeRef.currentlySelectedElements.splice(existingIndex, 1);
					if (scopeRef.currentlySelectedElements.length < 1) {
						scopeRef.combinedElementProperties = {};
					} else {
						// Update combined properties to the new last selected key.
						scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
					}
				} else { // Key is not selected, so select it.
					scopeRef.currentlySelectedElements.push(targetKey);
					scopeRef.combinedElementProperties = angular.copy(targetKey);
				}
			}

			// After any selection change, update combinedElementProperties.
			if (scopeRef.currentlySelectedElements.length > 0) {
				scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
			} else {
				scopeRef.combinedElementProperties = {};
			}
		}

		// Data for raw and pretty-printed configuration views.
		scopeRef.prettyPrintedConfig = "";
		scopeRef.rawConfigRepresentation = "";
		scopeRef.deserializeException = ""; // Stores any error encountered during deserialization.

		// Asynchronous data loading: layout presets, color palettes, and special key definitions.
		scopeRef.availableLayoutPresets = {};
		scopeRef.exampleConfigurations = {};
		httpSvc.get('layouts.json').success(function(data) {
			scopeRef.availableLayoutPresets = data.presets;
			scopeRef.exampleConfigurations = data.samples;
		});

		scopeRef.currentColorScheme = {}; // The currently active color palette.

		scopeRef.definedColorThemes = []; // Array of all available color palettes.
		httpSvc.get('colors.json').success(function(data) {
			scopeRef.definedColorThemes = data;
			scopeRef.definedColorThemes.forEach(function(paletteEntry) {
				paletteEntry.colors.forEach(function(colorDef) {
					// Convert RGB values to CSS hex representation using an external color utility service.
					colorDef.css = $colorUtilService.sRGB8(colorDef.r, colorDef.g, colorDef.b).hex();
				});
			});
			// Automatically load the first palette if available.
			if (scopeRef.definedColorThemes.length > 0) {
				scopeRef.activateColorScheme(scopeRef.definedColorThemes[0]);
			}
		});

		scopeRef.knownSpecialKeyCodes = {}; // Definitions for special keys (e.g., modifier keys).
		httpSvc.get('keys.json').success(function(data) {
			scopeRef.knownSpecialKeyCodes = data;
		});

		// Keyboard layout rendering and sizing utilities.
		scopeRef.calculatedLayoutHeight = 0; // Cached height of the keyboard for performance.

		/**
		 * Computes the overall height of the keyboard layout based on key positions.
		 * Updates `scopeRef.calculatedLayoutHeight`.
		 */
		scopeRef.computeLayoutOverallHeight = function() {
			let maxBottomCoordinate = 0;
			scopeRef.getKeyElements().forEach(function(element) {
				if (element && element.bbox && typeof element.bbox.y2 === 'number') {
					maxBottomCoordinate = Math.max(maxBottomCoordinate, element.bbox.y2);
				}
			});
			scopeRef.calculatedLayoutHeight = maxBottomCoordinate + 8; // Add some padding.
		};

		scopeRef.getKeyRotationStyling = $renderKeyService.getKeyRotationStyles; // Delegates to an external service.

		/**
		 * Generates and assigns the HTML markup for a given key element.
		 * @param {Object} keyElement - The key object to render.
		 */
		function generateKeyVisualMarkup(keyElement) {
			// Utilize an external rendering service and Angular's `$sce` for trusted HTML.
			keyElement.html = sceSvc.trustAsHtml($renderKeyService.html(keyElement, sanitizeSvc));
		}

		/**
		 * Deserializes layout data and renders the key elements.
		 * @param {Array<Object>} inputData - The raw data to deserialize and render.
		 */
		scopeRef.processAndRenderConfiguration = function(inputData) {
			if (!inputData) {
				// Handle null or undefined input gracefully.
				scopeRef.keyConfigurationModel = { elements: [], metadata: {} };
				return;
			}
			try {
				scopeRef.keyConfigurationModel = $keySerializationUtil.deserialize(inputData);
				// Ensure metadata exists, even if deserialized data doesn't provide it.
				if (!scopeRef.keyConfigurationModel.metadata) {
					scopeRef.keyConfigurationModel.metadata = {};
				}
				scopeRef.getKeyElements().forEach(function(element) {
					generateKeyVisualMarkup(element);
				});
				// Deep copy metadata to a separate scope variable for editing.
				scopeRef.layoutMetadata = angular.copy(scopeRef.keyConfigurationModel.metadata);
				scopeRef.deserializeException = ""; // Clear any previous errors.
				scopeRef.computeLayoutOverallHeight(); // Recalculate layout height.
			} catch (e) {
				console.error("Deserialization failed:", e);
				scopeRef.deserializeException = `Error parsing layout data: ${e.message}`;
				// Optionally reset to a default empty state or show an error message prominently.
				scopeRef.keyConfigurationModel = { elements: [], metadata: {} };
				scopeRef.layoutMetadata = {};
				scopeRef.getKeyElements().forEach(function(element) {
					generateKeyVisualMarkup(element);
				});
			}
		};

		/**
		 * Refreshes the serialized string representations of the keyboard configuration.
		 * This function is debounced to prevent excessive updates during rapid changes.
		 */
		function refreshSerializationOutputs() {
			scopeRef.deserializeException = ""; // Clear any previous deserialization errors.
			scopeRef.rawConfigRepresentation = $keySerializationUtil.serialize(scopeRef.keyConfigurationModel);
			scopeRef.prettyPrintedConfig = formatDataForDisplay(scopeRef.rawConfigRepresentation);
		}

		// Initialize the debounced serialization updater.
		ctrl_serializationUpdateHandler = _debounce(refreshSerializationOutputs, 500); // Debounce by 500ms.

		// Initial load logic: check URL hash, path, or provide a default layout.
		scopeRef.processAndRenderConfiguration([]); // Start with an empty configuration.

		const currentHash = locationSvc.hash();
		if (currentHash) {
			if (currentHash[0] === '@') { // Handle URLON format.
				// URLON.parse typically handles encoded URIs, so encodeURI might be redundant.
				scopeRef.processAndRenderConfiguration(URLON.parse(currentHash.substring(1)));
			} else { // Handle JSONL/RISON format directly.
				scopeRef.processAndRenderConfiguration($keySerializationUtil.fromJsonL(currentHash));
			}
			ctrl_serializationUpdateHandler(); // Update serialization immediately after load.
		} else if (locationSvc.path() && locationSvc.path() !== '/') { // Handle path-based layout loading.
			httpSvc.get($keySerializationUtil.base_href + locationSvc.path()).success(function(data) {
				scopeRef.processAndRenderConfiguration(data);
				ctrl_serializationUpdateHandler();
			}).error(function() {
				scopeRef.loadError = true;
				console.error("Failed to load layout from path:", locationSvc.path());
			});
		} else {
			// Default content: a simple numpad layout.
			scopeRef.processAndRenderConfiguration([
				["Num Lock", "/", "*", "-"],
				["7\nHome", "8\n↑", "9\nPgUp", { h: 2 }, "+"],
				["4\n←", "5", "6\n→"],
				["1\nEnd", "2\n↓", "3\nPgDn", { h: 2 }, "Enter"],
				[{ w: 2 }, "0\nIns", ".\nDel"]
			]);
			ctrl_serializationUpdateHandler();
		}

		// Undo/redo mechanism and unsaved changes tracking.
		let operationHistoryStack = []; // Stores past states for undo.
		let revertHistoryStack = []; // Stores undone states for redo.
		let allowTransactionMerging = false; // Flag to coalesce consecutive identical operations.

		// Flags for UI state.
		scopeRef.canReverseOperation = function() { return operationHistoryStack.length > 0; };
		scopeRef.canReapplyOperation = function() { return revertHistoryStack.length > 0; };
		scopeRef.hasUnsavedChanges = false;
		scopeRef.isConfigurationSaved = false;
		scopeRef.lastSaveFailureMessage = "";
		scopeRef.loadError = false; // Flag for general loading errors.

		/**
		 * Prompts the user before leaving if there are unsaved changes.
		 * Also attempts to save a temporary backup to localStorage.
		 * @param {Event} browserEvent - The `beforeunload` event.
		 * @returns {string|undefined} A confirmation message or undefined.
		 */
		window.onbeforeunload = function(browserEvent) {
			if (scopeRef.hasUnsavedChanges) {
				// Attempt to save a temporary backup to localStorage.
				try {
					const backupData = $keySerializationUtil.serialize(scopeRef.keyConfigurationModel);
					localStorage.setItem('keyCraft_temp_backup', backupData);
					console.log("Temporary backup saved to localStorage.");
				} catch (e) {
					console.warn("Failed to save temporary backup to localStorage:", e);
				}
				const confirmationMessage = 'You have made changes to the layout that are not saved. Do you wish to leave without saving?';
				browserEvent.returnValue = confirmationMessage; // Standard for most browsers.
				return confirmationMessage; // For some older browsers.
			}
			return undefined;
		};

		/**
		 * Executes a function within a transactional context, managing undo/redo history.
		 * @param {string} operationType - A string identifier for the type of operation (e.g., "update", "move").
		 * @param {Function} actionFunction - The function containing the actual changes.
		 */
		function executeTransactionalChange(operationType, actionFunction) {
			let currentTransaction = operationHistoryStack.length > 0 ? operationHistoryStack[operationHistoryStack.length - 1] : null;

			// Decide if we should merge with the last transaction or start a new one.
			const shouldStartNewTransaction = (
				currentTransaction === null ||
				!allowTransactionMerging ||
				currentTransaction.type !== operationType ||
				currentTransaction.isClosed // Ensure previous transaction is not still "open"
			);

			if (shouldStartNewTransaction) {
				currentTransaction = {
					type: operationType,
					originalState: angular.copy(scopeRef.keyConfigurationModel), // Deep copy initial state.
					isClosed: false,
					initialDirtyState: scopeRef.hasUnsavedChanges
				};
				operationHistoryStack.push(currentTransaction);
				// Limit undo stack size to prevent excessive memory usage.
				if (operationHistoryStack.length > 64) { // Increased from 32 for more history.
					operationHistoryStack.shift();
				}
				revertHistoryStack = []; // Clear redo stack on new transaction.
			}

			allowTransactionMerging = true; // Allow subsequent operations of same type to merge.
			try {
				actionFunction(); // Execute the actual change.
			} finally {
				// Clean up URL parameters after modification.
				if (locationSvc.hash()) {
					locationSvc.hash("");
				}
				if (locationSvc.path() && locationSvc.path() !== '/') { // Only clear if it's a layout path, not root.
					locationSvc.path("");
				}
				currentTransaction.modifiedState = angular.copy(scopeRef.keyConfigurationModel); // Deep copy final state.
				currentTransaction.isClosed = true; // Mark transaction as closed.

				// Trigger serialization update, unless it's a raw data edit (which updates itself).
				if (operationType !== 'rawdata_edit') {
					ctrl_serializationUpdateHandler();
				}
				scopeRef.hasUnsavedChanges = true;
				scopeRef.isConfigurationSaved = false;
				scopeRef.lastSaveFailureMessage = "";
				scopeRef.loadError = false;
				ctrl_changeCounter++; // Increment global change counter.
			}
		}

		/**
		 * Reverts the last operation.
		 */
		scopeRef.reverseLastAction = function() {
			if (scopeRef.canReverseOperation()) {
				let undoneOperation = operationHistoryStack.pop();
				scopeRef.keyConfigurationModel = angular.copy(undoneOperation.originalState);
				ctrl_serializationUpdateHandler(); // Refresh display.
				scopeRef.getKeyElements().forEach(function(keyItem) {
					generateKeyVisualMarkup(keyItem); // Re-render keys.
				});
				revertHistoryStack.push(undoneOperation); // Add to redo stack.
				scopeRef.hasUnsavedChanges = undoneOperation.initialDirtyState;
				scopeRef.clearSelection(); // Clear selection for consistency.
				scopeRef.layoutMetadata = angular.copy(scopeRef.keyConfigurationModel.metadata);
				scopeRef.computeLayoutOverallHeight();
			}
		};

		/**
		 * Reapplies the last undone operation.
		 */
		scopeRef.reapplyLastAction = function() {
			if (scopeRef.canReapplyOperation()) {
				let redoneOperation = revertHistoryStack.pop();
				scopeRef.keyConfigurationModel = angular.copy(redoneOperation.modifiedState);
				ctrl_serializationUpdateHandler(); // Refresh display.
				scopeRef.getKeyElements().forEach(function(keyItem) {
					generateKeyVisualMarkup(keyItem); // Re-render keys.
				});
				operationHistoryStack.push(redoneOperation); // Add back to undo stack.
				scopeRef.hasUnsavedChanges = true; // Redo is a modification, so mark as dirty.
				scopeRef.clearSelection();
				scopeRef.layoutMetadata = angular.copy(scopeRef.keyConfigurationModel.metadata);
				scopeRef.computeLayoutOverallHeight();
			}
		};

		/**
		 * Ensures a given property value for a key element stays within valid bounds.
		 * @param {Object} elementObject - The key element being validated.
		 * @param {string} propertyName - The name of the property to validate.
		 * @param {*} inputValue - The value to be validated.
		 * @returns {*} The validated and potentially clamped value.
		 */
		function ensurePropertyValidity(elementObject, propertyName, inputValue) {
			const validators = {
				_default: () => inputValue, // Default validator, returns value as is.
				x_coord: () => Math.max(0, Math.min(48, inputValue)), // Max X increased to 48.
				y_coord: () => Math.max(0, Math.min(48, inputValue)), // Max Y increased to 48.
				offset_x: () => {
					// Ensure offset_x (x2) is within reasonable bounds relative to base width.
					const baseWidth = elementObject.width || 1;
					return Math.max(-Math.abs(baseWidth - (elementObject.width2 || baseWidth)), Math.min(Math.abs(baseWidth - (elementObject.width2 || baseWidth)), inputValue));
				},
				offset_y: () => {
					// Ensure offset_y (y2) is within reasonable bounds relative to base height.
					const baseHeight = elementObject.height || 1;
					return Math.max(-Math.abs(baseHeight - (elementObject.height2 || baseHeight)), Math.min(Math.abs(baseHeight - (elementObject.height2 || baseHeight)), inputValue));
				},
				primary_width: () => Math.max(0.25, Math.min(18, inputValue)), // Min width decreased, max width increased.
				primary_height: () => Math.max(0.25, Math.min(18, inputValue)), // Min height decreased, max height increased.
				secondary_width: () => Math.max(0.25, Math.min(18, inputValue)),
				secondary_height: () => Math.max(0.25, Math.min(18, inputValue)),
				primary_font_size: () => Math.max(0.5, Math.min(12, inputValue)), // Font size range adjusted.
				secondary_font_size: () => Math.max(0.5, Math.min(12, inputValue)),
				rotation_angle_deg: () => {
					let angle = parseFloat(inputValue);
					if (isNaN(angle)) return 0; // Default to 0 if invalid.
					angle = angle % 360; // Normalize to -359 to 359 range first.
					if (angle > 180) angle -= 360;
					if (angle < -180) angle += 360;
					return angle;
				},
				rotation_center_x: () => Math.max(-10, Math.min(48, inputValue)), // Rotation center range adjusted.
				rotation_center_y: () => Math.max(-10, Math.min(48, inputValue)),
			};
			return (validators[propertyName] || validators._default)();
		}

		/**
		 * Applies a validated property change to a key element.
		 * @param {Object} elementObject - The key element to modify.
		 * @param {string} propertyName - The name of the property to change.
		 * @param {*} newValue - The new value for the property.
		 */
		function applyPropertyChange(elementObject, propertyName, newValue) {
			const updaters = {
				_default: () => { elementObject[propertyName] = newValue; },
				primary_width: () => {
					elementObject.width = newValue;
					// If not stepped or primary width is greater, update secondary width too.
					if (!elementObject.is_stepped || elementObject.width > (elementObject.width2 || elementObject.width)) {
						elementObject.width2 = newValue;
					}
				},
				primary_height: () => {
					elementObject.height = newValue;
					// If not stepped or primary height is greater, update secondary height too.
					if (!elementObject.is_stepped || elementObject.height > (elementObject.height2 || elementObject.height)) {
						elementObject.height2 = newValue;
					}
				},
				center_text_horizontally: () => {
					elementObject.align = newValue ? (elementObject.align | 1) : (elementObject.align & (~1));
				},
				center_text_vertically: () => {
					elementObject.align = newValue ? (elementObject.align | 2) : (elementObject.align & (~2));
				},
				center_legend_text: () => {
					elementObject.align = newValue ? (elementObject.align | 4) : (elementObject.align & (~4));
				},
				primary_font_size: () => {
					elementObject.fontheight = newValue;
					elementObject.fontheight2 = newValue; // Apply to both primary and secondary font sizes.
				},
				is_stepped: () => {
					elementObject[propertyName] = newValue;
					// When stepping is enabled, adjust widths if they are identical.
					if (newValue && elementObject.width === (elementObject.width2 || elementObject.width)) {
						if (elementObject.width > 1) {
							elementObject.width = Math.max(0.5, elementObject.width - 0.5); // Reduce primary width slightly.
						} else {
							elementObject.width2 = elementObject.width + 0.5; // Or increase secondary width.
						}
					}
				},
				rotation_angle_deg: () => {
					elementObject.rotation_angle = newValue;
					// Ensure rotation center is maintained from combined properties.
					elementObject.rotation_x = scopeRef.combinedElementProperties.rotation_x || 0;
					elementObject.rotation_y = scopeRef.combinedElementProperties.rotation_y || 0;
				},
			};
			return (updaters[propertyName] || updaters._default)();
		}

		/**
		 * Updates a property across all currently selected key elements.
		 * @param {string} propKey - The name of the property to update.
		 */
		scopeRef.updateMultipleElementProperties = function(propKey) {
			// If no value or no elements selected, do nothing.
			if (scopeRef.combinedElementProperties[propKey] == null || scopeRef.currentlySelectedElements.length <= 0) {
				return;
			}

			// Validate the value before applying.
			const validatedValue = ensurePropertyValidity(scopeRef.combinedElementProperties, propKey, scopeRef.combinedElementProperties[propKey]);
			if (validatedValue !== scopeRef.combinedElementProperties[propKey]) {
				// If validation changed the value, update the combined property and re-trigger.
				scopeRef.combinedElementProperties[propKey] = validatedValue;
				// This recursive call might lead to infinite loop if validation keeps changing it.
				// Better to just apply the validated value directly.
				// console.warn(`Property ${propKey} was validated and adjusted from ${scopeRef.combinedElementProperties[propKey]} to ${validatedValue}.`);
			}

			executeTransactionalChange("multi_element_update", function() {
				scopeRef.currentlySelectedElements.forEach(function(selectedItem) {
					applyPropertyChange(selectedItem, propKey, scopeRef.combinedElementProperties[propKey]);
					generateKeyVisualMarkup(selectedItem); // Re-render each updated key.
				});
				// Update combined properties from the last selected key after changes.
				if (scopeRef.currentlySelectedElements.length > 0) {
					scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
				}
			});
		};

		/**
		 * Validates a property on the combined element properties and applies corrections.
		 * @param {string} propKey - The name of the property to validate.
		 */
		scopeRef.validateMultipleElementProperties = function(propKey) {
			// Ensure property exists, initialize if null.
			if (scopeRef.combinedElementProperties[propKey] == null) {
				scopeRef.combinedElementProperties[propKey] = ""; // Default to empty string for UI input.
			}
			const validatedValue = ensurePropertyValidity(scopeRef.combinedElementProperties, propKey, scopeRef.combinedElementProperties[propKey]);
			if (validatedValue !== scopeRef.combinedElementProperties[propKey]) {
				scopeRef.combinedElementProperties[propKey] = validatedValue;
				scopeRef.updateMultipleElementProperties(propKey); // Apply the corrected value.
			}
		};

		/**
		 * Updates a specific metadata property of the layout.
		 * @param {string} metaPropKey - The key of the metadata property to update.
		 */
		scopeRef.updateLayoutMetadata = function(metaPropKey) {
			executeTransactionalChange("metadata_edit", function() {
				scopeRef.keyConfigurationModel.metadata[metaPropKey] = scopeRef.layoutMetadata[metaPropKey];
			});
		};

		// Placeholder for future metadata validation.
		scopeRef.validateLayoutMetadata = function(metaPropKey) {
			// Currently, no specific validation rules for metadata properties.
			// Could add checks for string length, valid URLs, etc. here.
			if (typeof scopeRef.layoutMetadata[metaPropKey] === 'string' && scopeRef.layoutMetadata[metaPropKey].trim() === '') {
				// Optionally, delete empty metadata properties.
				// delete scopeRef.keyConfigurationModel.metadata[metaPropKey];
			}
		};

		ctrl_serializationUpdateHandler(); // Initial call to update serialization outputs.

		/**
		 * Swaps the foreground (legend) and background (keycap) colors of selected keys.
		 */
		scopeRef.toggleKeycapColors = function() {
			if (scopeRef.currentlySelectedElements.length < 1) { return; }
			executeTransactionalChange("color_swap", function() {
				scopeRef.currentlySelectedElements.forEach(function(selectedItem) {
					const temporaryColor = selectedItem.color_background; // Assuming 'color' maps to background.
					selectedItem.color_background = selectedItem.color_legend; // Assuming 'text' maps to legend.
					selectedItem.color_legend = temporaryColor;
					generateKeyVisualMarkup(selectedItem);
				});
				// Update combined properties from the last selected key.
				scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
			});
		};

		/**
		 * Applies a selected color swatch to the background or legend of keys.
		 * @param {Object} selectedColor - The color object from the palette.
		 * @param {Event} clickEvent - The DOM event, used to check for Ctrl/Alt keys.
		 */
		scopeRef.applyColorSwatchSelection = function(selectedColor, clickEvent) {
			clickEvent.preventDefault();
			if (scopeRef.currentlySelectedElements.length < 1) {
				return;
			}
			executeTransactionalChange("color_application", function() {
				scopeRef.currentlySelectedElements.forEach(function(selectedItem) {
					if (clickEvent.ctrlKey || clickEvent.altKey) {
						selectedItem.color_legend = selectedColor.css; // Apply to legend if Ctrl/Alt.
					} else {
						selectedItem.color_background = selectedColor.css; // Apply to background otherwise.
					}
					generateKeyVisualMarkup(selectedItem);
				});
				scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
			});
		};

		/**
		 * Shifts the position of all selected key elements.
		 * @param {number} deltaX - Horizontal movement amount.
		 * @param {number} deltaY - Vertical movement amount.
		 * @param {Event} eventRef - The DOM event, used to prevent default behavior.
		 */
		scopeRef.shiftSelectedElements = function(deltaX, deltaY, eventRef) {
			eventRef.preventDefault();
			if (scopeRef.currentlySelectedElements.length < 1) { return; }

			// Guard clause: Prevent moving elements off-canvas to the top/left.
			if (deltaX < 0 || deltaY < 0) {
				let canMove = true;
				for (const keyItem of scopeRef.currentlySelectedElements) {
					// Check if any part of the key (including its offset bbox) would go negative.
					const currentX = keyItem.x || 0;
					const currentY = keyItem.y || 0;
					const currentX2 = keyItem.x2 || 0;
					const currentY2 = keyItem.y2 || 0;

					if ((currentX + deltaX < 0) ||
						(currentY + deltaY < 0) ||
						(currentX + currentX2 + deltaX < 0) ||
						(currentY + currentY2 + deltaY < 0)) {
						canMove = false;
						break;
					}
				}
				if (!canMove) {
					console.warn("Attempted to move keys off-canvas to the top/left. Operation blocked.");
					return;
				}
			}

			executeTransactionalChange("element_move", function() {
				scopeRef.currentlySelectedElements.forEach(function(selectedItem) {
					selectedItem.x = Math.max(0, (selectedItem.x || 0) + deltaX);
					selectedItem.y = Math.max(0, (selectedItem.y || 0) + deltaY);
					generateKeyVisualMarkup(selectedItem);
				});
				scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
			});
			if (deltaY !== 0) { scopeRef.computeLayoutOverallHeight(); }
		};

		/**
		 * Resizes all selected key elements.
		 * @param {number} deltaWidth - Horizontal resize amount.
		 * @param {number} deltaHeight - Vertical resize amount.
		 * @param {Event} eventRef - The DOM event.
		 */
		scopeRef.resizeSelectedElements = function(deltaWidth, deltaHeight, eventRef) {
			eventRef.preventDefault();
			if (scopeRef.currentlySelectedElements.length < 1) { return; }
			executeTransactionalChange("element_resize", function() {
				scopeRef.currentlySelectedElements.forEach(function(selectedItem) {
					// Ensure minimum size of 0.25 units.
					applyPropertyChange(selectedItem, 'primary_width', Math.max(0.25, (selectedItem.width || 1) + deltaWidth));
					applyPropertyChange(selectedItem, 'primary_height', Math.max(0.25, (selectedItem.height || 1) + deltaHeight));
					generateKeyVisualMarkup(selectedItem);
				});
				scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
			});
			if (deltaHeight !== 0) { scopeRef.computeLayoutOverallHeight(); }
		};

		/**
		 * Rotates all selected key elements by a specified angle.
		 * @param {number} angleDelta - The change in rotation angle (degrees).
		 * @param {Event} eventRef - The DOM event.
		 */
		scopeRef.rotateSelectedElements = function(angleDelta, eventRef) {
			eventRef.preventDefault();
			if (scopeRef.currentlySelectedElements.length < 1) { return; }
			executeTransactionalChange("element_rotate", function() {
				scopeRef.currentlySelectedElements.forEach(function(selectedItem) {
					let currentAngle = selectedItem.rotation_angle || 0;
					let newAngle = (currentAngle + angleDelta + 720) % 360; // Add 720 to handle negative angles correctly.
					if (newAngle > 180) { newAngle -= 360; } // Normalize to -180 to 180.
					applyPropertyChange(selectedItem, 'rotation_angle_deg', newAngle);
					generateKeyVisualMarkup(selectedItem);
				});
				scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
			});
			// Rotation can affect overall height if keys extend further, so recalculate.
			scopeRef.computeLayoutOverallHeight();
		};

		/**
		 * Adjusts the rotation center of selected key elements.
		 * @param {number} deltaX - Change in X coordinate for rotation center.
		 * @param {number} deltaY - Change in Y coordinate for rotation center.
		 * @param {Event} eventRef - The DOM event.
		 */
		scopeRef.adjustRotationCenter = function(deltaX, deltaY, eventRef) {
			eventRef.preventDefault();
			if (scopeRef.currentlySelectedElements.length < 1) { return; }
			executeTransactionalChange("rotation_center_adjust", function() {
				scopeRef.currentlySelectedElements.forEach(function(selectedItem) {
					const currentRotationX = selectedItem.rotation_x || 0;
					const currentRotationY = selectedItem.rotation_y || 0;

					const newRotationX = ensurePropertyValidity(selectedItem, 'rotation_center_x', currentRotationX + deltaX);
					const newRotationY = ensurePropertyValidity(selectedItem, 'rotation_center_y', currentRotationY + deltaY);

					// Directly update properties as `applyPropertyChange` doesn't have specific logic for these.
					selectedItem.rotation_x = newRotationX;
					selectedItem.rotation_y = newRotationY;
					generateKeyVisualMarkup(selectedItem);
				});
				scopeRef.combinedElementProperties = angular.copy(scopeRef.currentlySelectedElements[scopeRef.currentlySelectedElements.length - 1]);
			});
			scopeRef.computeLayoutOverallHeight();
		};

		/**
		 * Activates a given color palette for use in the editor.
		 * @param {Object} paletteObject - The palette to load.
		 */
		scopeRef.activateColorScheme = function(paletteObject) {
			scopeRef.currentColorScheme = paletteObject;
		};

		/**
		 * Resolves the friendly name of a color given its CSS value from the current palette.
		 * @param {string} cssColorValue - The CSS color string (e.g., "#RRGGBB").
		 * @returns {string} The friendly name of the color, or an empty string if not found.
		 */
		scopeRef.resolveColorIdentifier = function(cssColorValue) {
			if (cssColorValue && scopeRef.currentColorScheme && scopeRef.currentColorScheme.colors) {
				// Use a for...of loop for modern iteration.
				for (const colorEntry of scopeRef.currentColorScheme.colors) {
					if (colorEntry.css === cssColorValue) {
						return colorEntry.name;
					}
				}
			}
			return ""; // Return empty if color or palette not found.
		};

		/**
		 * Loads a predefined layout preset into the editor.
		 * @param {Array<Object>} presetData - The data for the preset layout.
		 */
		scopeRef.applyPresetConfiguration = function(presetData) {
			if (!presetData) {
				console.warn("Attempted to load an empty or invalid preset.");
				return;
			}
			executeTransactionalChange("preset_load", function() {
				scopeRef.processAndRenderConfiguration(presetData);
			});
			scopeRef.hasUnsavedChanges = false; // Presets are considered "clean" when loaded.
			localStorage.removeItem('keyCraft_temp_backup'); // Clear any temporary backup.
		};

		// Check for a temporary backup in localStorage on startup.
		// This should be done after initial load logic.
		const tempBackup = localStorage.getItem('keyCraft_temp_backup');
		if (tempBackup) {
			// Ask user if they want to restore, or just restore if no other layout was loaded.
			// For this clone, let's just restore if no hash or path was used.
			if (!currentHash && (!locationSvc.path() || locationSvc.path() === '/')) {
				if (confirm("Unsaved changes from a previous session were found. Do you want to restore them?")) {
					try {
						scopeRef.processAndRenderConfiguration($keySerializationUtil.deserialize(tempBackup));
						scopeRef.hasUnsavedChanges = true; // Restored from backup means it's dirty.
						ctrl_serializationUpdateHandler();
						console.log("Restored layout from temporary localStorage backup.");
					} catch (e) {
						console.error("Failed to restore from temporary localStorage backup:", e);
						localStorage.removeItem('keyCraft_temp_backup'); // Clear corrupted backup.
					}
				} else {
					localStorage.removeItem('keyCraft_temp_backup'); // User declined restore.
				}
			} else {
				// If a specific layout was requested via URL, clear the backup without asking.
				localStorage.removeItem('keyCraft_temp_backup');
			}
		}

		// Watch for changes in raw config representation to update the model.
		// This handles manual edits in the raw data tab.
		scopeRef.$watch('rawConfigRepresentation', function(newValue, oldValue) {
			if (newValue !== oldValue && scopeRef.activeViewIndex === 2) { // Only update if raw data tab is active.
				try {
					const parsedData = $keySerializationUtil.deserialize(newValue);
					// This should not trigger a new transaction but rather update the current one if active.
					// Or trigger a special "rawdata_edit" transaction.
					executeTransactionalChange("rawdata_edit", function() {
						scopeRef.keyConfigurationModel = parsedData;
						// Ensure metadata exists on the new model.
						if (!scopeRef.keyConfigurationModel.metadata) {
							scopeRef.keyConfigurationModel.metadata = {};
						}
						scopeRef.getKeyElements().forEach(generateKeyVisualMarkup);
						scopeRef.layoutMetadata = angular.copy(scopeRef.keyConfigurationModel.metadata);
						scopeRef.deserializeException = "";
						scopeRef.computeLayoutOverallHeight();
					});
				} catch (e) {
					scopeRef.deserializeException = `Error parsing raw data: ${e.message}`;
					// Do not modify keyConfigurationModel if parsing fails, let the user correct.
				}
			}
		}, true); // Deep watch for raw config representation.

		// Watch for changes in metadata to update serialization.
		scopeRef.$watch('layoutMetadata', function(newValue, oldValue) {
			if (newValue !== oldValue && ctrl_changeCounter > 0) { // Only update if there are actual changes.
				// This watch is purely for internal model consistency, not for user-initiated meta-edits.
				// User-initiated edits go through `updateLayoutMetadata`.
				scopeRef.keyConfigurationModel.metadata = angular.copy(newValue);
				ctrl_serializationUpdateHandler();
			}
		}, true); // Deep watch metadata object.
	}]);
})();