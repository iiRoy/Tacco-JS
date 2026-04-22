(function(jq, win) {
	"use strict";

	// Check for the essential DOM manipulation library
	if(!win.jQuery) {
		// Log a warning if jQuery is missing.
		// A more robust application might throw an error or use a fallback.
		if (win.console) { win.console.warn('ModalMaster requires jQuery to operate.'); }
		return;
	}

	// Internal collection of currently active modal instances.
	let activeInstances = [];

	// Cleans up the list of active modals, removing any that are no longer attached to the DOM.
	const purgeStaleInstances = function(instanceToRemove) {
		activeInstances = jq.grep(activeInstances, function(modalObj) {
			// Keep the instance if it's not the one being explicitly removed,
			// and if its associated DOM element is still within the document body.
			return modalObj !== instanceToRemove && modalObj.$modalContainer.closest('body').length > 0;
		});
		return activeInstances;
	};

	// Converts camelCase keys with a specific prefix into kebab-case CSS properties.
	// Example: { iframeMinHeight: 44, someOther: 0 }, 'iframe' => { 'min-height': 44 }
	const kebabCaseCssConverter = function(sourceObject, keyPrefix) {
		const styleProperties = {};
		const prefixPattern = new RegExp('^' + keyPrefix + '([A-Z])(.*)');

		for (const objKey in sourceObject) {
			const keyMatch = objKey.match(prefixPattern);
			if (keyMatch) {
				// Convert CamelCase to kebab-case (e.g., 'MinHeight' to 'min-height')
				const cssPropName = (keyMatch[1] + keyMatch[2].replace(/([A-Z])/g, '-$1')).toLowerCase();
				styleProperties[cssPropName] = sourceObject[objKey];
			}
		}
		return styleProperties;
	};

	// Maps global event types to corresponding internal handler methods.
	const globalEventMethodMap = {
		'keyup': 'handleGlobalKeyUp',
		'resize': 'handleGlobalResize'
	};

	// Centralized handler for global window events.
	const processGlobalEvent = function(eventPayload) {
		// Iterate through active modals in reverse order (most recent first).
		// This ensures the topmost modal gets the first chance to handle the event.
		jq.each(ModalMaster.getAllActive().reverse(), function() {
			if (!eventPayload.isDefaultPrevented()) {
				// Invoke the modal's specific handler for the event type.
				if (false === this[globalEventMethodMap[eventPayload.type]](eventPayload)) {
					eventPayload.preventDefault();
					eventPayload.stopPropagation();
					// If a handler returns false, stop further processing for this event.
					return false;
				}
			}
		});
	};

	// Manages the binding/unbinding of global event listeners on the window object.
	const manageWindowListeners = function(shouldInstall) {
		if (shouldInstall !== ModalMaster._globalListenersActive) {
			ModalMaster._globalListenersActive = shouldInstall;
			const eventTypes = jq.map(globalEventMethodMap, function(_, eventName) {
				return eventName + '.' + ModalMaster.prototype.modulePrefix;
			}).join(' ');
			jq(win)[shouldInstall ? 'on' : 'off'](eventTypes, processGlobalEvent);
		}
	};

	/**
	 * ModalMaster - A lightweight jQuery-powered modal window utility.
	 *
	 * @param {jQuery|HTMLElement|string} contentSource - The content to display in the modal.
	 * @param {object} [options] - Configuration options for this modal instance.
	 * @constructor
	 */
	function ModalMaster(contentSource, options) {
		// Ensure constructor is called with 'new' for proper instance creation.
		if (!(this instanceof ModalMaster)) {
			// If not called with 'new', create and return an instance, then open it.
			const modalInstance = new ModalMaster(contentSource, options);
			modalInstance.show();
			return modalInstance;
		}

		// Assign a unique ID to this modal instance.
		this.instanceId = ModalMaster.instanceCounter++;
		// Initialize the modal with provided content and configuration.
		this.initializeModal(contentSource, options);
		// Apply chained callbacks, allowing extensions to inject their logic.
		this.applyChainedHooks(ModalMaster._hookRegistry);
	}

	ModalMaster.prototype = {
		constructor: ModalMaster,
		// --- Default Configuration Properties ---
		modulePrefix: 'modal-master',         // Base class prefix and event namespace.
		triggerDataAttribute: 'data-modal-source', // Attribute on trigger elements holding content selector/URL.
		themeClass: null,                     // Extra class for custom styling.
		ignoreBaseStyles: false,              // If true, omits default CSS, requiring full custom styling.
		baseMarkup: null,                     // Custom HTML for the modal's background, wrapper, and close button.
		activationEvent: 'click',             // Event that triggers modal opening.
		deactivationEvent: 'click',           // Event that triggers modal closing.
		eventDelegateFilter: null,            // Selector to filter activation events (e.g., 'a').
		appendTarget: 'body',                 // DOM element where the modal structure is appended.
		fadeInDuration: 280,                  // Animation speed for showing the modal.
		fadeOutDuration: 220,                 // Animation speed for hiding the modal.
		dismissOnInteraction: 'background',   // How to close: 'background', 'anywhere', or false.
		dismissOnEscapeKey: true,             // Close modal when ESC key is pressed.
		dismissSymbol: '&#x2715;',             // HTML for the close button icon (X mark).
		preloaderContent: '',                 // Content displayed while main content loads.
		altDismissSelectors: null,            // Additional selectors for elements that can close the modal.
		onBeforeShow: jq.noop,                // Callback before modal opens; can return false to prevent opening.
		onContentReady: jq.noop,              // Callback when content is loaded, before it's displayed.
		onBeforeDismiss: jq.noop,             // Callback before modal closes; can return false to prevent closing.
		onAfterShow: jq.noop,                 // Callback after modal has fully opened.
		onAfterContentSet: jq.noop,           // Callback after content is set and displayed.
		onAfterDismiss: jq.noop,              // Callback after modal has fully closed.
		handleGlobalKeyUp: jq.noop,           // Event handler for keyup events.
		handleGlobalResize: jq.noop,          // Event handler for window resize events.
		contentTypeHint: null,                // Explicitly define content type (e.g., 'image', 'iframe').
		contentProcessors: ['jquery', 'image', 'html', 'ajax', 'iframe', 'text'], // Ordered list of content filters.

		// --- Core Methods ---

		/**
		 * Initializes a modal instance by merging configuration and creating its DOM structure.
		 * @param {jQuery|HTMLElement|string} triggerOrContent - The element that triggered the modal or the content itself.
		 * @param {object} [instanceOptions] - Configuration specific to this instance.
		 * @returns {this}
		 */
		initializeModal: function(triggerOrContent, instanceOptions) {
			// Allow flexible argument passing: (config) or (content, config)
			if (typeof triggerOrContent === 'object' && !(triggerOrContent instanceof jq) && !instanceOptions) {
				instanceOptions = triggerOrContent;
				triggerOrContent = undefined;
			}

			const currentInstance = jq.extend(this, instanceOptions, { sourceTrigger: triggerOrContent });
			const baseCssClass = !currentInstance.ignoreBaseStyles ? currentInstance.modulePrefix : currentInstance.modulePrefix + '-reset';
			const closeBtnSelector = '.' + currentInstance.modulePrefix + '-close' + (currentInstance.altDismissSelectors ? ',' + currentInstance.altDismissSelectors : '');

			// Construct the initial modal DOM skeleton.
			const modalHtmlSkeleton = currentInstance.baseMarkup || `
				<div class="${baseCssClass}-wrapper ${baseCssClass}">
					<div class="${baseCssClass}-dialog">
						<span class="${baseCssClass}-close-button ${currentInstance.modulePrefix}-close">
							${currentInstance.dismissSymbol}
						</span>
						<div class="${currentInstance.modulePrefix}-body">
							${currentInstance.preloaderContent}
						</div>
					</div>
				</div>`;

			currentInstance.$modalContainer = jq(modalHtmlSkeleton).clone().addClass(currentInstance.themeClass || '');

			// Attach event handler for closing the modal based on configuration.
			currentInstance.$modalContainer.on(currentInstance.deactivationEvent + '.' + currentInstance.modulePrefix, function(evt) {
				const clickedElement = jq(evt.target);
				const shouldClose = (currentInstance.dismissOnInteraction === 'background' && clickedElement.is('.' + currentInstance.modulePrefix + '-wrapper')) ||
									(currentInstance.dismissOnInteraction === 'anywhere') ||
									(clickedElement.closest(closeBtnSelector).length > 0);

				if (shouldClose) {
					evt.preventDefault();
					currentInstance.dismiss();
				}
			});

			return this;
		},

		/**
		 * Determines and retrieves the content to be displayed in the modal.
		 * It uses a series of content processors to identify and prepare the content.
		 * @returns {jQuery.Promise|boolean} A promise resolving to the content, or false if no content filter applies.
		 */
		retrieveContent: function(){
			const currentInstance = this;
			const registeredProcessors = this.constructor.contentProcessors;

			// Helper to read data attributes from the triggering element.
			const getTriggerAttr = function(attrName){
				return currentInstance.$sourceTrigger && currentInstance.$sourceTrigger.attr(attrName);
			};

			// Determine the raw data for content (e.g., selector, URL, or explicit content).
			let rawContentData = currentInstance.sourceTrigger || getTriggerAttr(currentInstance.triggerDataAttribute) || '';

			// First, check for an explicit content type hint (e.g., {contentTypeHint: 'image'}).
			let selectedProcessor = registeredProcessors[currentInstance.contentTypeHint];

			// If no explicit hint, check if rawContentData itself is a known type (e.g., data-modal-source="image").
			if (!selectedProcessor && rawContentData in registeredProcessors) {
				selectedProcessor = registeredProcessors[rawContentData];
				rawContentData = currentInstance.sourceTrigger && getTriggerAttr(currentInstance.triggerDataAttribute); // Re-evaluate data if type was the data itself.
			}

			// If still no processor, check for content directly specified in config (e.g., {image: 'photo.jpg'}).
			if (!selectedProcessor) {
				for(const processorKey in registeredProcessors) {
					if(currentInstance[processorKey]) {
						selectedProcessor = registeredProcessors[processorKey];
						rawContentData = currentInstance[processorKey];
						break; // Found a match, stop iterating.
					}
				}
			}

			// If no explicit processor found, iterate through all registered processors to find a match.
			if (!selectedProcessor) {
				const initialContentCandidate = rawContentData;
				rawContentData = null; // Reset to null, will be set if a filter matches.
				jq.each(currentInstance.contentProcessors, function() {
					selectedProcessor = registeredProcessors[this];
					if(selectedProcessor && selectedProcessor.test) {
						rawContentData = selectedProcessor.test(initialContentCandidate);
					}
					// Fallback: if test failed, but regex matches and data is still null.
					if(!rawContentData && selectedProcessor && selectedProcessor.regex && initialContentCandidate.match && initialContentCandidate.match(selectedProcessor.regex)) {
						rawContentData = initialContentCandidate;
					}
					return !rawContentData; // Break loop if content data is found.
				});

				if(!rawContentData) {
					if(win.console) { win.console.error('ModalMaster: No content processor found for "' + (initialContentCandidate || '(no content specified)') + '"'); }
					return false;
				}
			}

			// Process the content using the identified filter.
			return selectedProcessor.process.call(currentInstance, rawContentData);
		},

		/**
		 * Inserts the loaded content into the modal's DOM structure.
		 * @param {jQuery} contentElement - The jQuery object representing the content.
		 * @returns {this}
		 */
		placeContent: function(contentElement){
			const currentInstance = this;

			// Add a specific class for iframe content for styling.
			if(contentElement.is('iframe') || jq('iframe', contentElement).length > 0){
				currentInstance.$modalContainer.addClass(currentInstance.modulePrefix + '-iframe');
			}

			// Remove the loading state class.
			currentInstance.$modalContainer.removeClass(currentInstance.modulePrefix + '-wrapper-loading');

			// Replace existing inner content. This ensures the structure within the dialog is maintained.
			const innerBodySelector = '.' + currentInstance.modulePrefix + '-body';
			const currentInner = currentInstance.$modalContainer.find(innerBodySelector);

			// Remove any extra inner body elements if somehow duplicated, keeping only the first.
			currentInner.slice(1).remove();

			// Replace the first (or only) inner body with the new content.
			// If the content is already a child, don't re-append it, just update class.
			if (jq.contains(currentInstance.$modalContainer[0], contentElement[0])) {
				// Content is already inside, just ensure it has the correct class.
				contentElement.addClass(currentInstance.modulePrefix + '-body-inner');
			} else {
				currentInner.replaceWith(contentElement);
			}

			currentInstance.$displayedContent = contentElement.addClass(currentInstance.modulePrefix + '-body-inner');

			return currentInstance;
		},

		/**
		 * Displays the modal window.
		 * @param {Event} [triggerEvent] - The event that triggered the modal.
		 * @returns {jQuery.Promise} A promise that resolves when the modal is fully open.
		 */
		show: function(triggerEvent){
			const currentInstance = this;
			const deferredOpen = jq.Deferred();

			// Pre-append the container (hidden) to ensure it's in the DOM for content processing.
			currentInstance.$modalContainer.hide().appendTo(currentInstance.appendTarget);

			// Check if opening is prevented by a callback or default event behavior.
			if ((!triggerEvent || !triggerEvent.isDefaultPrevented()) && currentInstance.onBeforeShow(triggerEvent) !== false) {
				if(triggerEvent){
					triggerEvent.preventDefault();
				}

				const contentPromise = currentInstance.retrieveContent();

				// If content retrieval failed, detach container and reject promise.
				if (!contentPromise) {
					currentInstance.$modalContainer.detach();
					return deferredOpen.reject().promise();
				}

				// Add this instance to the global list of active modals.
				activeInstances.push(currentInstance);
				// Ensure global event listeners are active.
				manageWindowListeners(true);

				// Start the fade-in animation for the modal container.
				currentInstance.$modalContainer.fadeIn(currentInstance.fadeInDuration);

				// Execute the content-ready callback.
				currentInstance.onContentReady(triggerEvent);

				// Wait for content to load, then place it and complete the open sequence.
				jq.when(contentPromise)
					.always(function(loadedContent){
						currentInstance.placeContent(loadedContent);
						currentInstance.onAfterContentSet(triggerEvent);
					})
					.then(currentInstance.$modalContainer.promise()) // Wait for fade-in to complete.
					.done(function(){
						currentInstance.onAfterShow(triggerEvent);
						deferredOpen.resolve();
					})
					.fail(function() {
						// If content loading fails, dismiss the modal and reject the promise.
						currentInstance.dismiss();
						deferredOpen.reject();
					});
			} else {
				// If opening was prevented, detach the container and reject the promise.
				currentInstance.$modalContainer.detach();
				deferredOpen.reject();
			}
			return deferredOpen.promise();
		},

		/**
		 * Hides and removes the modal window from the DOM.
		 * @param {Event} [triggerEvent] - The event that triggered the dismissal.
		 * @returns {jQuery.Promise} A promise that resolves when the modal is fully closed.
		 */
		dismiss: function(triggerEvent){
			const currentInstance = this;
			const deferredDismiss = jq.Deferred();

			// Check if dismissal is prevented by a callback.
			if(currentInstance.onBeforeDismiss(triggerEvent) === false) {
				return deferredDismiss.reject().promise();
			}

			// Remove this instance from the active modals list.
			const remainingActive = purgeStaleInstances(currentInstance);

			// If no modals are active, disable global event listeners.
			if (remainingActive.length === 0) {
				manageWindowListeners(false);
			}

			// Fade out the modal container, then detach it from the DOM.
			currentInstance.$modalContainer.fadeOut(currentInstance.fadeOutDuration, function(){
				currentInstance.$modalContainer.detach();
				currentInstance.onAfterDismiss(triggerEvent);
				deferredDismiss.resolve();
			});

			return deferredDismiss.promise();
		},

		/**
		 * Utility to chain callback functions, allowing extensions to augment base behavior.
		 * The provided `hookMap` contains callback names as keys and a function(superCallback, event)
		 * as values. The `superCallback` is the original callback from the prototype chain.
		 * @param {object} hookMap - Object mapping callback names to new hook functions.
		 */
		applyChainedHooks: function(hookMap) {
			for (const hookName in hookMap) {
				// Wrap the existing callback with the new hook, passing the original as 'super'.
				this[hookName] = jq.proxy(hookMap[hookName], this, jq.proxy(this[hookName], this));
			}
		}
	};

	// --- Static Properties and Methods for ModalMaster ---
	jq.extend(ModalMaster, {
		instanceCounter: 0,                   // Counter for unique modal instance IDs.
		autoInitSelector: '[data-modal-master]', // Selector for elements that should automatically bind a modal.
		configPresets: ModalMaster.prototype, // Alias to prototype for easy access to default options.

		// Collection of content processing functions.
		contentProcessors: {
			jquery: {
				regex: /^[#.]\w/,         // Matches ID or class selectors.
				test: function(element) { return element instanceof jq && element; }, // Checks if it's a jQuery object.
				process: function(element) { return jq(element).clone(true); } // Clones the element.
			},
			image: {
				regex: /\.(png|jpg|jpeg|gif|tiff|bmp)(\?\S*)?$/i, // Matches common image file extensions.
				process: function(imageUrl) {
					const instanceRef = this;
					const imageLoadDeferred = jq.Deferred();
					const imgElement = new Image();
					const $imgElement = jq(`<img src="${imageUrl}" alt="Modal Image" class="${instanceRef.modulePrefix}-image" />`);

					imgElement.onload = function() {
						// Store natural dimensions for IE8 compatibility/responsive calculations.
						$imgElement.get(0).naturalWidth = imgElement.width;
						$imgElement.get(0).naturalHeight = imgElement.height;
						imageLoadDeferred.resolve($imgElement);
					};
					imgElement.onerror = function() {
						imageLoadDeferred.reject($imgElement);
					};
					imgElement.src = imageUrl;
					return imageLoadDeferred.promise();
				}
			},
			html: {
				regex: /^\s*<[\w!][^<]*>/, // Matches strings that look like HTML tags.
				process: function(htmlString) { return jq(htmlString); }
			},
			ajax: {
				regex: /./,            // Default fallback: assume any non-matching string is an AJAX URL.
				process: function(url) {
					const ajaxDeferred = jq.Deferred();
					const $container = jq('<div></div>'); // Use a temporary container for loading.

					// Use jQuery's load method which can handle URL fragments (e.g., 'page.html #target').
					$container.load(url, function(response, status){
						if (status === "error") {
							if (win.console) { win.console.error('ModalMaster AJAX content load failed for URL: ' + url + '. Status: ' + status); }
							ajaxDeferred.reject($container);
						} else {
							ajaxDeferred.resolve($container.contents()); // Resolve with the loaded content.
						}
					});
					return ajaxDeferred.promise();
				}
			},
			iframe: {
				process: function(iframeUrl) {
					const iframeDeferred = new jq.Deferred();
					const instanceRef = this;
					const $iframe = jq('<iframe/>')
						.hide()
						.attr('src', iframeUrl)
						.css(kebabCaseCssConverter(instanceRef, 'iframe')) // Apply iframe-specific CSS from config.
						.on('load', function() { iframeDeferred.resolve($iframe.show()); })
						// Important: IFRAMEs lose state if moved in the DOM, so append it directly.
						.appendTo(instanceRef.$modalContainer.find('.' + instanceRef.modulePrefix + '-dialog'));
					return iframeDeferred.promise();
				}
			},
			text: {
				process: function(plainText) { return jq('<div>', {text: plainText}); }
			}
		},

		// List of property names that should be treated as functions when read from data attributes.
		callbackPropertyNames: ['onBeforeShow', 'onAfterShow', 'onContentReady', 'onAfterContentSet', 'onBeforeDismiss', 'onAfterDismiss'],

		// --- Class-level Utility Methods ---

		/**
		 * Reads configuration options from an HTML element's data attributes.
		 * Attributes like `data-modal-master-duration="500"` are converted to `duration: 500`.
		 * @param {HTMLElement} element - The DOM element to read attributes from.
		 * @param {string} dataNamespace - The namespace for data attributes (e.g., 'modal-master').
		 * @returns {object} An object containing the parsed configuration.
		 */
		parseElementSettings: function(element, dataNamespace) {
			const configObject = {};
			if (!element || !element.attributes) {
				return configObject;
			}

			const dataAttributeRegex = new RegExp('^data-' + dataNamespace + '-(.*)');
			for (let i = 0; i < element.attributes.length; i++) {
				const attribute = element.attributes[i];
				const match = attribute.name.match(dataAttributeRegex);
				if (match) {
					const configKey = jq.camelCase(match[1]); // Convert data-attr-name to camelCase.
					let configValue = attribute.value;

					if (jq.inArray(configKey, ModalMaster.callbackPropertyNames) >= 0) {
						// For known callback properties, try to evaluate as a function.
						try {
							configValue = new Function(configValue); // jshint ignore:line
						} catch (e) {
							if (win.console) { win.console.error('ModalMaster: Failed to parse function for "' + configKey + '": ' + e.message); }
							configValue = jq.noop; // Fallback to no-op if function parsing fails.
						}
					} else {
						// For other properties, attempt to parse as JSON (e.g., boolean, number, object).
						try { configValue = JSON.parse(configValue); }
						catch(e) { /* Not JSON, keep as string. */ }
					}
					configObject[configKey] = configValue;
				}
			}
			return configObject;
		},

		/**
		 * Creates a new "sub-class" of ModalMaster, supporting inheritance for extensions.
		 * This method replicates a common inheritance pattern, similar to CoffeeScript's `extends`.
		 * @param {function} childConstructor - The constructor function for the new derived class.
		 * @param {object} [defaultOptions] - Default options specific to this derived class.
		 * @returns {function} The `childConstructor` with its prototype chain set up.
		 */
		createDerivedModule: function(childConstructor, defaultOptions) {
			const ParentPrototype = this.prototype;
			// Set up a temporary constructor for prototype chaining.
			const TempConstructor = function() {};
			TempConstructor.prototype = ParentPrototype;
			childConstructor.prototype = new TempConstructor();
			childConstructor.prototype.constructor = childConstructor; // Correct constructor reference.
			childConstructor.__super__ = ParentPrototype; // Reference to the parent prototype.

			// Copy static methods and properties from parent to child.
			jq.extend(childConstructor, this, defaultOptions);
			childConstructor.configPresets = childConstructor.prototype; // Alias for convenience.
			return childConstructor;
		},

		/**
		 * Binds the modal activation logic to a set of elements.
		 * @param {jQuery} $triggerElements - The jQuery object containing elements to bind to.
		 * @param {jQuery|HTMLElement|string} [$contentToDisplay] - Optional static content to show.
		 * @param {object} [bindingOptions] - Configuration options for this binding.
		 * @returns {jQuery} The original `$triggerElements` for chaining.
		 */
		bindActivation: function($triggerElements, $contentToDisplay, bindingOptions) {
			const ModalClassRef = this;

			// Handle flexible arguments: ($elems, config) or ($elems, content, config)
			if (typeof $contentToDisplay === 'object' && !($contentToDisplay instanceof jq) && !bindingOptions) {
				bindingOptions = $contentToDisplay;
				$contentToDisplay = undefined;
			}
			bindingOptions = jq.extend({}, bindingOptions); // Create a shallow copy.

			// Determine the namespace for events and data attributes, prioritizing bindingOptions.
			const effectiveNamespace = bindingOptions.modulePrefix || ModalClassRef.configPresets.modulePrefix;

			// Temporarily merge defaults and element-specific configs for event binding.
			const tempConfig = jq.extend({}, ModalClassRef.configPresets, ModalClassRef.parseElementSettings($triggerElements[0], effectiveNamespace), bindingOptions);

			$triggerElements.on(tempConfig.activationEvent + '.' + effectiveNamespace, tempConfig.eventDelegateFilter, function(eventObj) {
				// On activation, re-evaluate config based on the specific element clicked.
				const runtimeConfig = jq.extend(
					{ $sourceTrigger: $triggerElements, $currentTarget: jq(this) },
					ModalClassRef.parseElementSettings($triggerElements[0], effectiveNamespace),
					ModalClassRef.parseElementSettings(this, effectiveNamespace),
					bindingOptions
				);
				new ModalClassRef($contentToDisplay, runtimeConfig).show(eventObj);
			});
			return $triggerElements;
		},

		/**
		 * Gets the currently topmost (most recently opened) active modal instance.
		 * @returns {ModalMaster|null} The topmost modal instance, or null if none are active.
		 */
		getTopmostActive: function() {
			const allActive = this.getAllActive();
			return allActive[allActive.length - 1] || null;
		},

		/**
		 * Retrieves all currently active modal instances.
		 * @returns {ModalMaster[]} An array of active ModalMaster instances.
		 */
		getAllActive: function() {
			const ModalClassRef = this;
			purgeStaleInstances(); // Clean up any modals that might have been removed externally.
			return jq.grep(activeInstances, function(instance) { return instance instanceof ModalClassRef; });
		},

		/**
		 * Dismisses the topmost active modal window.
		 * @returns {jQuery.Promise|undefined} A promise if a modal was dismissed, otherwise undefined.
		 */
		dismissTopmost: function() {
			const topModal = this.getTopmostActive();
			if(topModal) { return topModal.dismiss(); }
		},

		/**
		 * Internal method to automatically bind modals on DOM ready based on `autoInitSelector`.
		 * This is typically invoked once when the library loads.
		 */
		initializeOnDomReady: function() {
			const ModalClassRef = this;
			if(ModalClassRef.autoInitSelector){
				// Bind a delegated event listener to the document for dynamically added elements.
				ModalClassRef.bindActivation(jq(document), {eventDelegateFilter: ModalClassRef.autoInitSelector});

				// For elements that have a filter specified in their data attribute,
				// bind them directly as the document-level delegation won't apply the filter correctly.
				jq(ModalClassRef.autoInitSelector).filter('[data-modal-master-filter]').each(function(){
					ModalClassRef.bindActivation(jq(this));
				});
			}
		},

		/**
		 * Registry for callback chain hooks.
		 * These hooks allow extensions to insert logic before/after core callbacks.
		 */
		_hookRegistry: {
			handleGlobalKeyUp: function(superCallback, eventPayload){
				// If ESC key is pressed and dismissOnEscapeKey is true...
				if(eventPayload.keyCode === 27) {
					if (this.dismissOnEscapeKey) {
						// Simulate a click on the first close button found within the modal.
						this.$modalContainer.find('.' + this.modulePrefix + '-close:first').trigger('click');
					}
					return false; // Prevent default ESC behavior.
				} else {
					return superCallback(eventPayload); // Call the original (or next in chain) callback.
				}
			},
			handleGlobalResize: function(superCallback, eventPayload){
				// Example: If content has natural dimensions, re-adjust its size.
				if (this.$displayedContent && this.$displayedContent.get(0) && this.$displayedContent.get(0).naturalWidth) {
					const naturalW = this.$displayedContent.get(0).naturalWidth;
					const naturalH = this.$displayedContent.get(0).naturalHeight;
					// Reset CSS to allow container to resize, then apply new dimensions.
					this.$displayedContent.css({ 'width': '', 'height': '' });
					// Call super or do more complex resizing here.
				}
				return superCallback(eventPayload);
			}
		}
	});

	// Attach ModalMaster to jQuery namespace.
	jq.ModalMaster = ModalMaster;

	// Automatically initialize modals when the DOM is ready.
	jq(win.document).ready(function(){
		ModalMaster.initializeOnDomReady();
	});

})(jQuery, window);