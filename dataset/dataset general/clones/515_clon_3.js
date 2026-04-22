(function (ngCore, undef) {
	'use strict';

	// This module facilitates enhanced form controls.
	var customControlsModule = ngCore.module('InteractiveForms', []);

	// Default configuration presets for the custom dropdown component.
	customControlsModule.value('dropdownConfigPresets', {
		displayPrompt: 'Choose an item...',
		emptyDataListMessage: 'No items are available for selection.',
		noSearchResultsMessage: 'No matches found for "$0".',
		creationPrompt: 'Add New',
		queryDebounceTime: 800, // Time in ms before a search query is executed.
		initialSearchValue: null // Default search input value
	});

	// Directive for a custom interactive dropdown, replacing standard select.
	customControlsModule.directive('interactiveDropdown', ['$parse', '$compile', '$timeout', 'dropdownConfigPresets', function (parseService, compileService, timeoutService, defaultSettings) {
		// Regular expression to parse the ng-options attribute, capturing various parts.
		var NG_SELECTION_EXPRESSION_PARSER = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/;

		return {
			restrict: 'A', // Attribute directive
			require: 'ngModel', // Requires ngModel controller for data binding
			link: function (currentScope, targetElement, elementAttributes, modelController) {
				// Ensure ng-options is present for functionality.
				if (!elementAttributes.ngOptions) {
					throw new Error('The "interactive-dropdown" directive requires the "ng-options" attribute to be specified.');
				}
				// Ensure ng-model is present for data binding.
				if (!elementAttributes.ngModel) {
					throw new Error('The "interactive-dropdown" directive requires the "ng-model" attribute for two-way data binding.');
				}

				// Attempt to parse the ng-options string.
				var optionsMatch = elementAttributes.ngOptions.match(NG_SELECTION_EXPRESSION_PARSER);

				if (!optionsMatch) {
					throw new Error("Invalid expression format for 'ng-options'. Expected something like '_value_ (as _label_)? for (_key_,)?_item_ in _collection_' but received '" + elementAttributes.ngOptions + "'.");
				}

				// Apply base styling to the host element.
				targetElement.addClass('custom-dropdown-container dropdown');

				// Deconstruct the parsed ng-options expression parts.
				var itemLabelResolver = parseService(optionsMatch[2] || optionsMatch[1]),
					collectionItemAlias = optionsMatch[4] || optionsMatch[6],
					itemValueExtractor = parseService(optionsMatch[2] ? optionsMatch[1] : collectionItemAlias),
					sourceCollectionExpression = optionsMatch[7],
					collectionAccessor = parseService(sourceCollectionExpression);

				// Retrieve and merge component configuration.
				var componentSettings = getComponentConfiguration(),
					searchQueryModel = optionsMatch[2] ? (optionsMatch[2]).replace(new RegExp('^' + collectionItemAlias + '\\.'), 'queryModel.') : 'queryModel',
					isRemoteFilteringActive = typeof componentSettings.onSearch === 'function',
					debounceTimerRef,
					previousQueryTerm = '',
					activeOptionIndex = -1,
					initialSearchStateGenerator = function () {
						return optionsMatch[2] ? {} : (componentSettings.initialSearchValue || '');
					};

				// Template for individual list items, allowing custom content.
				var itemDisplayTemplate = targetElement.html().trim() || `<span>{{${optionsMatch[2] || optionsMatch[1]}}}</span>`;

				// Hidden native select element for Angular's ngModel binding and validation.
				var hiddenSelectMarkup = `<select class="hidden-native-select" ng-options="${elementAttributes.ngOptions}" ng-model="${elementAttributes.ngModel}" ${elementAttributes.ngChange ? `ng-change="${elementAttributes.ngChange}"` : ''}></select>`;

				// Main dropdown structure template.
				var dropdownInterfaceMarkup =
					`<a class="dropdown-toggle-button" data-toggle="dropdown" href ng-class="{ 'is-disabled': viewModel.isControlDisabled }" ng-cloak>` +
						`<span>{{viewModel.displayedSelection}}</span>` +
						`<i class="arrow-indicator"></i>` +
					`</a>` +
					`<div class="dropdown-menu-content">` +
						`<div stop-propagation="click" class="search-input-wrapper">` +
							`<input class="${elementAttributes.selectClass || ''}" type="text" autocomplete="off" placeholder="${componentSettings.placeholderText || 'Search...'}" ng-model="${searchQueryModel}" />` +
							`<span class="loading-spinner" ng-show="viewModel.isSearching"></span>` +
						`</div>` +
						`<ul role="menu" class="option-list-items">` +
							`<li role="presentation" ng-repeat="${collectionItemAlias} in ${sourceCollectionExpression}${isRemoteFilteringActive ? '' : ' | filter: queryModel'}" ng-class="{ 'active': $index === viewModel.focusedOptionIdx }">` +
								`<a role="menuitem" tabindex="-1" href ng-click="viewModel.chooseItem(${collectionItemAlias})">` +
									itemDisplayTemplate +
								`</a>` +
							`</li>` +
							`<li ng-hide="(${sourceCollectionExpression}${isRemoteFilteringActive ? '' : ' | filter: queryModel'}).length" class="empty-list-message" stop-propagation="click">` +
								`<em class="text-muted">` +
									`<span ng-hide="${searchQueryModel}">{{viewModel.emptyDataListMessage}}</span>` +
									`<span class="search-feedback" ng-show="${searchQueryModel}">{{viewModel.noSearchResultsMessage | format: ${searchQueryModel}}}</span>` +
								`</em>` +
							`</li>` +
						`</ul>` +
						`<div class="action-footer">` +
							(typeof componentSettings.onAdd === "function" ?
							`<button type="button" class="btn btn-primary btn-block add-button" ng-click="viewModel.addNewEntry()">{{viewModel.creationPrompt}}</button>` : '') +
						`</div>` +
					`</div>`;

				// Clear the original element's content.
				targetElement.empty();

				// Compile and append the hidden select element.
				var hiddenSelectElement = ngCore.element(hiddenSelectMarkup);
				compileService(hiddenSelectElement)(currentScope);
				targetElement.append(hiddenSelectElement);

				// Create an isolated child scope for the dropdown interface.
				var isolatedViewModel = currentScope.$new(true);
				initializeViewModelBindings();

				// Compile and append the custom dropdown interface.
				var dropdownInterfaceElement = ngCore.element(dropdownInterfaceMarkup),
					togglerButton = dropdownInterfaceElement.eq(0).dropdown(), // Bootstrap dropdown initialization
					searchInputBox = dropdownInterfaceElement.eq(1).find(':text'),
					optionListContainer = dropdownInterfaceElement.eq(1).find('ul');

				compileService(dropdownInterfaceElement)(isolatedViewModel);
				targetElement.append(dropdownInterfaceElement);

				// When the external model changes, update the displayed text.
				modelController.$render = function () {
					// A brief delay allows the hidden select element to process the model change
					// and update its selected option before we try to read it.
					timeoutService(updateDisplayedSelectionText, 75);
				};

				// Watch for changes in the component's display prompt setting.
				isolatedViewModel.$watch(getDisplayOptionValue, updateDisplayedSelectionText);

				// Watch for changes in the disabled attribute on the host element.
				isolatedViewModel.$watch(function () { return targetElement.attr('disabled'); }, function (isDisabled) {
					isolatedViewModel.isControlDisabled = isDisabled;
				});

				// Keep the isolated view model's collection in sync with the parent scope's.
				currentScope.$watch(sourceCollectionExpression, function (updatedCollection) {
					collectionAccessor.assign(isolatedViewModel, updatedCollection);
					isolatedViewModel.focusedOptionIdx = -1; // Reset focus when collection changes
				});

				/**
				 * Event handler for the dropdown toggle button click.
				 * Initializes search state and focuses the input.
				 */
				togglerButton.on('click', function (evt) {
					if (isolatedViewModel.isControlDisabled) {
						evt.preventDefault(); // Prevent dropdown from opening if disabled
						return;
					}
					// Only reset search if not remote, to preserve remote search results.
					if (!isRemoteFilteringActive) {
						isolatedViewModel.$apply(function () {
							previousQueryTerm = '';
							isolatedViewModel.queryModel = initialSearchStateGenerator();
						});
					}
					activeOptionIndex = -1;
					searchInputBox.focus();
				});

				/**
				 * Event handler for key presses on the toggle button.
				 * Opens the dropdown if a character key is pressed.
				 */
				togglerButton.on('keypress', function (evt) {
					// Only open if not a modifier key.
					if (!(evt.altKey || evt.ctrlKey || evt.metaKey)) {
						togglerButton.click();
					}
				});

				/**
				 * Event handler for keydown events on the search input.
				 * Handles navigation (Esc, Enter, Tab, Down).
				 */
				searchInputBox.on('keydown', function (evt) {
					// Check for specific keys: Enter (13), Escape (27), Down Arrow (40), Tab (9).
					if (![13, 27, 40, 9].includes(evt.keyCode)) return;

					evt.preventDefault(); // Prevent default browser actions for these keys.
					evt.stopPropagation(); // Stop event propagation.

					switch (evt.keyCode) {
						case 27: // Escape
							togglerButton.dropdown('toggle'); // Close dropdown.
							break;
						case 13: // Enter
							confirmSelectionFromInput(); // Select highlighted item or first.
							break;
						case 40: // Down Arrow
							activateFirstOption(); // Move focus to the first list item.
							break;
						case 9: // Tab
							togglerButton.dropdown('toggle'); // Close dropdown on tab out.
							break;
					}
				});

				/**
				 * Event handler for keydown events on the option list.
				 * Handles Up/Down arrow navigation within the list.
				 */
				optionListContainer.on('keydown', function (evt) {
					// Check for Up Arrow (38) or Down Arrow (40).
					if (![38, 40].includes(evt.keyCode)) return;

					evt.preventDefault();
					evt.stopPropagation();

					var availableOptions = optionListContainer.find('li > a');

					if (!availableOptions.length) return; // No options to navigate.

					// Adjust focused index based on key.
					if (evt.keyCode === 38) { // Up
						isolatedViewModel.focusedOptionIdx--;
					} else if (evt.keyCode === 40 && isolatedViewModel.focusedOptionIdx < availableOptions.length - 1) { // Down
						isolatedViewModel.focusedOptionIdx++;
					}

					// Ensure index is within bounds and apply focus.
					if (isolatedViewModel.focusedOptionIdx >= 0) {
						isolatedViewModel.$apply(); // Update scope to reflect focusedOptionIdx
						availableOptions.eq(isolatedViewModel.focusedOptionIdx).focus();
					} else {
						isolatedViewModel.focusedOptionIdx = -1; // Clear focus from list.
						isolatedViewModel.$apply();
						searchInputBox.focus(); // Return focus to search input.
					}
				});

				/**
				 * Updates the text displayed on the dropdown button based on the current model value.
				 */
				function updateDisplayedSelectionText() {
					var itemCollection,
						localContext = {},
						displayLabel = undef,
						selectedItemKey = hiddenSelectElement.val(); // Get value from hidden select.

					if (selectedItemKey && selectedItemKey !== '?') { // '?' indicates no selection.
						itemCollection = collectionAccessor(isolatedViewModel) || [];
						localContext[collectionItemAlias] = itemCollection[selectedItemKey];
						displayLabel = itemLabelResolver(isolatedViewModel, localContext);
					}

					isolatedViewModel.displayedSelection = displayLabel || componentSettings.displayPrompt;
				}

				/**
				 * Retrieves and merges the component's configuration settings.
				 * Combines default presets with attributes from the host element.
				 * @returns {object} The merged configuration object.
				 */
				function getComponentConfiguration() {
					return ngCore.extend({}, defaultSettings, currentScope.$eval(elementAttributes.interactiveDropdown));
				}

				/**
				 * Getter for the display prompt option.
				 * @returns {string} The current display prompt.
				 */
				function getDisplayOptionValue() {
					componentSettings = getComponentConfiguration(); // Re-evaluate settings on watch.
					return componentSettings.displayPrompt;
				}

				/**
				 * Sets focus to the first available option in the list.
				 */
				function activateFirstOption() {
					var availableOptions = optionListContainer.find('li > a');
					if (availableOptions.length > 0) {
						isolatedViewModel.$apply(function() {
							isolatedViewModel.focusedOptionIdx = 0;
						});
						availableOptions.eq(0).focus();
					}
				}

				/**
				 * Selects the currently focused item (or the first if none focused)
				 * when the user presses Enter in the search input.
				 */
				function confirmSelectionFromInput() {
					var availableOptions = optionListContainer.find('li > a');
					if (availableOptions.length > 0) {
						var targetOptionElement = availableOptions.eq(isolatedViewModel.focusedOptionIdx >= 0 ? isolatedViewModel.focusedOptionIdx : 0);
						var optionScope = targetOptionElement.scope();
						var selectedItem = optionScope[collectionItemAlias];
						isolatedViewModel.$apply(function () {
							isolatedViewModel.chooseItem(selectedItem);
						});
						togglerButton.dropdown('toggle'); // Close dropdown after selection.
					}
				}

				/**
				 * Initializes and configures the isolated child scope (view model).
				 */
				function initializeViewModelBindings() {
					isolatedViewModel.creationPrompt = componentSettings.creationPrompt;
					isolatedViewModel.noSearchResultsMessage = componentSettings.noSearchResultsMessage;
					isolatedViewModel.emptyDataListMessage = componentSettings.emptyDataListMessage;
					isolatedViewModel.isSearching = false; // Flag for showing loading indicator
					isolatedViewModel.focusedOptionIdx = -1; // Index of the currently focused option

					/**
					 * Handles the selection of an item from the dropdown list.
					 * @param {*} selectedItem The item object to be selected.
					 */
					isolatedViewModel.chooseItem = function (selectedItem) {
						var localContext = {};
						localContext[collectionItemAlias] = selectedItem;
						var modelValue = itemValueExtractor(isolatedViewModel, localContext);

						// Update the displayed text on the button.
						isolatedViewModel.displayedSelection = itemLabelResolver(isolatedViewModel, localContext) || componentSettings.displayPrompt;
						modelController.$setViewValue(modelValue); // Update ngModel.

						isolatedViewModel.queryModel = initialSearchStateGenerator(); // Reset search input.
						togglerButton.focus(); // Return focus to the dropdown button.

						// Execute custom onSelect callback if provided.
						typeof componentSettings.onSelect === "function" && componentSettings.onSelect(selectedItem);
					};

					/**
					 * Handles the "Add New" action, invoking the custom onAdd callback.
					 */
					isolatedViewModel.addNewEntry = function () {
						componentSettings.onAdd(isolatedViewModel.chooseItem); // Pass selection handler to onAdd.
					};

					// Configure remote search functionality if an onSearch callback is provided.
					if (isRemoteFilteringActive) {
						searchInputBox.attr('ng-change', 'viewModel.handleSearchQuery(viewModel.queryModel)');
						/**
						 * Debounced handler for search input changes.
						 * @param {string} currentQuery The current search term.
						 */
						isolatedViewModel.handleSearchQuery = function (currentQuery) {
							if (debounceTimerRef) {
								timeoutService.cancel(debounceTimerRef); // Cancel previous debounce.
							}

							currentQuery = (currentQuery || '').trim();
							isolatedViewModel.isSearching = true; // Show loading indicator.

							debounceTimerRef = timeoutService(function () {
								debounceTimerRef = null; // Clear timer reference.

								if (currentQuery !== previousQueryTerm) {
									previousQueryTerm = currentQuery;
									componentSettings.onSearch(currentQuery).finally(function() {
										isolatedViewModel.isSearching = false; // Hide loading indicator.
									});
								} else {
									isolatedViewModel.isSearching = false; // Hide if query didn't change.
								}
							},
							// No delay if the query is empty, otherwise use configured delay.
							(currentQuery && componentSettings.queryDebounceTime) || 0);
						};
					}

					updateDisplayedSelectionText(); // Set initial display text.
				}
			}
		};
	}]);

	// Directive to prevent event propagation for specific events.
	customControlsModule.directive('stopPropagation', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attributes) {
				var eventsToStop = attributes['stopPropagation']; // Get events from attribute value.
				element.on(eventsToStop, function (eventObject) {
					eventObject.stopPropagation(); // Halt event bubbling.
				});
			}
		};
	});
})(angular);