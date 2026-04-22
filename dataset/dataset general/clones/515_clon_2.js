(function (framework, voidValue) {

	'use strict'; // Enforce strict JavaScript parsing rules for better code quality.

	// Consider moving this string utility to a core polyfill library if widely needed.
	if (!String.prototype.stripWhitespace) {
		String.prototype.stripWhitespace = function () {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}

	var appContainer = framework.module('ApplicationCore', []);

	appContainer.value('selectionSettings', {
		viewText: 'Choose Item...',
		noItemsMessage: 'No entries are available to display',
		noMatchMessage: 'No results align with "$0"',
		insertActionText: 'Add New',
		lookupPause: 1200
	});

	appContainer.directive('advancedPicker', ['expressionParser', 'templateCompiler', 'delayService', 'selectionSettings', function (expressionParser, templateCompiler, delayService, defaultOptions) {
		// Regular expression to dissect the ng-options attribute structure.
		var CHOICE_PARSE_REGEX = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/;

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (ctx, elementNode, attributes, modelCtrl) {

				// Validate presence of the required 'ng-options' equivalent attribute.
				if (!attributes.optionSource) {
					throw new Error('Expected option-source attribute for advancedPicker directive.');
				}

				var parsingResult = attributes.optionSource.match(CHOICE_PARSE_REGEX);

				// Ensure the option expression conforms to the expected pattern.
				if (!parsingResult) {
					throw new Error("Expected expression in the form of " +
						"'_selection_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
						" but received '" + attributes.optionSource + "'.");
				}

				elementNode.addClass('drop-down advanced-select');

				// Deconstruct the option expression components for later use.
				var labelExtractor = expressionParser(parsingResult[2] || parsingResult[1]),
					itemKeyName = parsingResult[4] || parsingResult[6],
					valueExtractor = expressionParser(parsingResult[2] ? parsingResult[1] : itemKeyName),
					sourceData = parsingResult[7],
					dataExtractor = expressionParser(sourceData);

				var widgetOpts = retrieveWidgetOptions(), // Current configuration for the widget.
					queryModel = parsingResult[2] ? (parsingResult[2]).replace(new RegExp('^' + itemKeyName + '\\.'), 'query.') : 'query',
					asyncSearch = typeof widgetOpts.onSearch === 'function', // Indicates if search is handled asynchronously.
					delayHandle, // Identifier for any pending timeout operations.
					prevQuery = '', // Stores the last executed search query.
					activeSelectionIdx = -1, // Index of the currently focused item in the list.
					getInitialQueryObject = function () { // Provides the initial state for the search model.
						return parsingResult[2] ? {} : '';
					};

				// The template for individual items within the dropdown list.
				var entryFormat = elementNode.html().stripWhitespace() || '{{' + (parsingResult[2] || parsingResult[1]) + '}}',

					// Hidden <select> element to maintain ngModel compatibility.
					hiddenSelectMarkup = '<select class="hidden-control" ng-options="' + attributes.optionSource + '" ng-model="' + attributes.ngModel + '" ' + (attributes.ngChange ? 'ng-change="' + attributes.ngChange + '"' : '') + '></select>',

					// The main dropdown menu structure.
					overlayMenuMarkup =
					'<a class="dropdown-trigger" data-toggle="dropdown" href ng-class="{ deactivated: deactivated }">' +
						'<span>{{viewText}}</span>' +
						'<b></b>' +
					'</a>' +
					'<div class="dropdown-panel">' +
						'<div stop-propagation="click" class="advanced-select-search-area">' +
							'<input class="' + attributes.selectClass + '" type="text" autocomplete="off" ng-model="' + queryModel + '" />' +
						'</div>' +
						'<ul role="menu">' +
							'<li role="presentation" ng-repeat="' + itemKeyName + ' in ' + sourceData + (asyncSearch ? '' : ' | filter: query') + '">' +
								'<a role="menuitem" tabindex="-1" href ng-click="pick(' + itemKeyName + ')">' +
									entryFormat +
								'</a>' +
							'</li>' +
							'<li ng-hide="(' + sourceData + (asyncSearch ? '' : ' | filter: query') + ').length" class="no-result-message" stop-propagation="click">' +
								'<em class="muted-text">' +
									'<span ng-hide="' + queryModel + '">{{noItemsMessage}}</span>' +
									'<span class="word-break" ng-show="' + queryModel + '">{{noMatchMessage | format:' + queryModel + '}}</span>' +
								'</em>' +
							'</li>' +
						'</ul>' +
						'<div class="advanced-select-action-area">' +
							(typeof widgetOpts.onAdd === "function" ?
							'<button type="button" class="btn btn-primary btn-block add-button" ng-click="addItem()">{{insertActionText}}</button>' : '') +
						'</div>' +
					'</div>';

				// Clear original element content before appending new structures.
				elementNode.empty();

				// Create and compile the hidden <select> element.
				var hiddenSelectNode = framework.element(hiddenSelectMarkup);
				templateCompiler(hiddenSelectNode)(ctx);
				elementNode.append(hiddenSelectNode);

				// Create references to key parts of the dropdown UI.
				var overlayMenuNode = framework.element(overlayMenuMarkup),
					toggleButtonNode = overlayMenuNode.eq(0).dropdown(),
					queryInputNode = overlayMenuNode.eq(1).find(':text'),
					itemListContainer = overlayMenuNode.eq(1).find('ul');

				// Create an isolated child scope for the input and dropdown elements.
				var nestedContext = ctx.$new(true);
				configureNestedContext(); // Initialize child scope properties and methods.

				// Compile the dropdown template against the child scope.
				templateCompiler(overlayMenuNode)(nestedContext);
				elementNode.append(overlayMenuNode);

				// Update display text when the model changes externally.
				modelCtrl.$render = function () {
					// Use a small delay to ensure the internal <select> element has processed model changes.
					delayService(updateViewText, 50);
				};

				// Monitor changes in the default display text option.
				nestedContext.$watch(retrieveViewText, updateViewText);

				// Watch for changes in the disabled state of the host element.
				nestedContext.$watch(function () { return elementNode.attr('deactivated'); }, function (val) {
					nestedContext.deactivated = val;
				});

				// Observe original data source changes and propagate to the isolated child scope.
				ctx.$watch(sourceData, function (val) {
					// nestedContext[sourceData] = val; // Direct assignment (alternative)
					dataExtractor.assign(nestedContext, val);
				});


				// Click handler for the dropdown toggle button.
				toggleButtonNode.on('click', function (evt) {
					if (nestedContext.deactivated) {
						return; // Do nothing if the control is disabled.
					}
					// Reset search query if not an asynchronous search.
					if (!asyncSearch) {
						nestedContext.$apply(function () {
							prevQuery = '';
							nestedContext.query = getInitialQueryObject();
						});
					}
					activeSelectionIdx = -1; // Reset focused item.
					queryInputNode.focus(); // Direct focus to the search input.
				});

				// Keypress handler on the anchor element to open the dropdown.
				toggleButtonNode.on('keypress', function (evt) {
					// Only open if Alt or Ctrl keys are not pressed.
					if (!(evt.altKey || evt.ctrlKey)) {
						toggleButtonNode.click();
					}
				});

				// Keydown handler for the search input field.
				queryInputNode.on('keydown', function (evt) {
					// Handle only Esc, Enter, Down Arrow, or Tab keys.
					if (!/(13|27|40|^9$)/.test(evt.keyCode)) return;
					evt.preventDefault(); // Prevent default browser actions.
					evt.stopPropagation(); // Stop event bubbling.

					switch (evt.keyCode) {
						case 27: // Escape key
							toggleButtonNode.dropdown('switch'); // Close dropdown.
							break;
						case 13: // Enter key
							selectFirstMatch(); // Select the top item.
							break;
						case 40: // Down Arrow key
							highlightFirstItem(); // Focus the first item in the list.
							break;
						case 9: // Tab key
							toggleButtonNode.dropdown('switch'); // Close dropdown.
							break;
					}
				});

				// Keydown handler for the dropdown menu list (for navigation).
				itemListContainer.on('keydown', function (evt) {
					// Handle only Up or Down Arrow keys.
					if (!/(38|40)/.test(evt.keyCode)) return;
					evt.preventDefault(); // Prevent default browser actions.
					evt.stopPropagation(); // Stop event bubbling.

					var availableOptions = itemListContainer.find('li > a');

					if (!availableOptions.length) return; // No items to navigate.
					if (evt.keyCode == 38) activeSelectionIdx--; // Up arrow: move selection up.
					if (evt.keyCode == 40 && activeSelectionIdx < availableOptions.length - 1) activeSelectionIdx++; // Down arrow: move selection down.
					//if (!~activeSelectionIdx) activeSelectionIdx = 0; // Uncomment to loop focus

					if (activeSelectionIdx >= 0) {
						availableOptions.eq(activeSelectionIdx)
							.focus(); // Focus the new item.
					} else {
						activeSelectionIdx = -1; // Reset if focus goes above the list.
						queryInputNode.focus(); // Return focus to search input.
					}
				});

				// Updates the text displayed on the dropdown toggle button.
				function updateViewText() {
					var dataCollection,
						localVars = {},
						displayValue = voidValue,
						selectionKey = hiddenSelectNode.val(); // Get selected value from the hidden select.

					if (selectionKey && selectionKey !== '?') {
						dataCollection = dataExtractor(nestedContext) || []; // Retrieve the data source.
						localVars[itemKeyName] = dataCollection[selectionKey]; // Set local variable for item.
						displayValue = labelExtractor(nestedContext, localVars); // Extract display text using the item.
					}

					nestedContext.viewText = displayValue || widgetOpts.viewText; // Set display text, using default if none found.
				}

				// Retrieves and merges current widget options.
				function retrieveWidgetOptions() {
					return framework.augment({}, defaultOptions, ctx.$evaluate(attributes.advancedPicker));
				}

				// Getter for the current display text option.
				function retrieveViewText() {
					widgetOpts = retrieveWidgetOptions();
					return widgetOpts.viewText;
				}

				// Focuses the first available item in the dropdown list.
				function highlightFirstItem() {
					var availableOptions = itemListContainer.find('li > a');
					if (availableOptions.length > 0) {
						activeSelectionIdx = 0; // Set focus to the first item.
						availableOptions.eq(0).focus();
					}
				}

				// Selects the first element in the list when Enter is pressed in the search input.
				function selectFirstMatch() {
					var potentialChoices = itemListContainer.find('li > a');
					if (potentialChoices.length > 0) {
						var loopElementScope = potentialChoices.eq(0).scope(); // Get scope of the first item.
						var selectedEntry = loopElementScope[itemKeyName]; // Extract the item itself.
						nestedContext.$apply(function () {
							nestedContext.pick(selectedEntry); // Trigger selection through the child scope.
						});
						toggleButtonNode.dropdown('switch'); // Close the dropdown.
					}
				}

				// Configures properties and methods on the isolated child scope.
				function configureNestedContext() {
					nestedContext.insertActionText = widgetOpts.insertActionText;
					nestedContext.noMatchMessage = widgetOpts.noMatchMessage;
					nestedContext.noItemsMessage = widgetOpts.noItemsMessage;

					// Method to handle item selection.
					nestedContext.pick = function (entryItem) {
						var localData = {};
						localData[itemKeyName] = entryItem; // Prepare local data for extraction.
						var chosenValue = valueExtractor(nestedContext, localData); // Get the actual value to set.

						nestedContext.viewText = labelExtractor(nestedContext, localData) || widgetOpts.viewText; // Update display text.
						modelCtrl.$setViewValue(chosenValue); // Update the ngModel.

						nestedContext.query = getInitialQueryObject(); // Reset search query.
						toggleButtonNode.focus(); // Return focus to the toggle button.

						// Execute custom onSelect callback if provided.
						typeof widgetOpts.onSelect === "function" && widgetOpts.onSelect(entryItem);
					};

					// Method to trigger the 'add new item' functionality.
					nestedContext.addItem = function () {
						widgetOpts.onAdd(nestedContext.pick); // Call custom onAdd callback, passing the pick function.
					};

					// Setup for asynchronous search functionality.
					if (asyncSearch) {
						queryInputNode.attr('on-change', 'performSearch(' + queryModel + ')'); // Bind ng-change.
						nestedContext.performSearch = function (queryTerm) {
							if (delayHandle) {
								delayHandle = delayService.cancel(delayHandle); // Cancel previous search timeout.
							}

							queryTerm = (queryTerm || '').stripWhitespace(); // Clean up the query term.

							// Set a new timeout for the search.
							delayHandle = delayService(function () {
								delayHandle = delayService.cancel(delayHandle); // Clear handle after execution.

								if (queryTerm != prevQuery) {
									widgetOpts.onSearch((prevQuery = queryTerm)); // Execute search callback.
								}
							},
							// No delay if the search term is empty.
							(queryTerm && widgetOpts.lookupPause) || 0);
						};
					}

					updateViewText(); // Initial setup of display text.
				}
			}
		};
	}]);

	appContainer.directive('blockEventPropagation', function () {
		return {
			restrict: 'A',
			link: function (ctx, targetElement, attributes, controlInstance) {
				var eventNames = attributes['blockEventPropagation']; // Get event names from attribute.
				targetElement.bind(eventNames, function (evt) {
					evt.stopPropagation(); // Stop event from bubbling up the DOM.
				});
			}
		};
	});
})(angular);