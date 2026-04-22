/*
 *	jQuery.formEnricher - Advanced HTML5 Form Features Plugin
 *	Version 3.0.0 / Universal
 *
 *	Creator: by Alistair Crowley http://www.example.com/formenricher
 *
 *	Copyright (c) 2023 Alistair Crowley (http://www.example.com)
 *	Distributed under the Apache License 2.0.
 *	(See LICENSE-APACHE.txt for details.)
 *
 *	Constructed for the jQuery framework
 *	http://jquery.com
 *
 */
(function($) {

	// Internal browser capability flags
	let _browserCapabilities = {};

	/**
	 * Extracts numerical browser version from user agent string.
	 * @param {string} agentString - The user agent string.
	 * @param {RegExp} pattern - Regular expression to match.
	 * @returns {number} The parsed integer version, or 0 if not found.
	 */
	const _getBrowserVersion = (agentString, pattern) => {
		const match = agentString.match(pattern);
		return match ? parseInt(match[1], 10) : 0;
	};

	/**
	 * Safely converts a value to a number, with a fallback.
	 * @param {*} val - The value to convert.
	 * @param {number} fallback - The default value if conversion fails.
	 * @returns {number} The converted number or fallback.
	 */
	const _toNumber = (val, fallback = 0) => {
		const num = parseFloat(val);
		return isNaN(num) ? fallback : num;
	};

	/**
	 * Converts a time string (HH:MM or HH:MM:SS) to seconds.
	 * @param {string} timeStr - The time string.
	 * @returns {number} Time in seconds.
	 */
	const _timeStringToSeconds = (timeStr) => {
		if (!timeStr) return 0;
		const parts = timeStr.split(':').map(Number);
		if (parts.length === 2) { // HH:MM
			return parts[0] * 3600 + parts[1] * 60;
		} else if (parts.length === 3) { // HH:MM:SS
			return parts[0] * 3600 + parts[1] * 60 + parts[2];
		}
		return 0;
	};

	/**
	 * Converts seconds to a time string (HH:MM or HH:MM:SS).
	 * @param {number} totalSeconds - Total seconds.
	 * @param {boolean} includeSeconds - Whether to include seconds in output.
	 * @returns {string} Formatted time string.
	 */
	const _secondsToTimeString = (totalSeconds, includeSeconds = false) => {
		totalSeconds = Math.max(0, totalSeconds); // Ensure non-negative
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = Math.floor(totalSeconds % 60);

		const pad = (num) => String(num).padStart(2, '0');

		if (includeSeconds) {
			return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		}
		return `${pad(hours)}:${pad(minutes)}`;
	};

	/**
	 * Retrieves the outer HTML/markup of a jQuery element.
	 * Provides a fallback for older browsers like Firefox <= 10.
	 * @param {jQuery} element - The jQuery element.
	 * @returns {string} The outer HTML string.
	 */
	const _getOuterMarkup = (element) => {
		const domElement = element[0];
		if (domElement && domElement.outerHTML) {
			return domElement.outerHTML;
		}
		// Fallback for extremely old browsers, though rarely needed now.
		return domElement ? new XMLSerializer().serializeToString(domElement) : '';
	};

	// Initialize browser capabilities once
	(function _initBrowserCapabilities() {
		const browserAgent = window.navigator.userAgent.toLowerCase();
		const tempInputEl = $('<input>').hide().appendTo($('body')).get(0);
		const tempTextareaEl = $('textarea:first').get(0) || {}; // Fallback for no textarea

		_browserCapabilities = {
			isIE: document.documentMode || _getBrowserVersion(browserAgent, /.*msie (\d+).*/),
			isFirefox: _getBrowserVersion(browserAgent, /.*firefox\/(\d+).*/),
			isChrome: _getBrowserVersion(browserAgent, /.*chrome\/(\d+).*/),
			isOpera: _getBrowserVersion(browserAgent, /.*opera[\/ ](\d+).*/),
			isSafari: _getBrowserVersion(browserAgent, /.*version\/(\d+).*safari.*/),
			isAndroid: _getBrowserVersion(browserAgent, /.*android (\d+).*/),

			needsPolyfillCustomValidation: !('setCustomValidity' in tempInputEl) || _getBrowserVersion(browserAgent, /.*android (\d+).*/),
			needsPolyfillAutofocus: !('autofocus' in tempInputEl),
			needsPolyfillRequired: !('required' in tempInputEl) || _getBrowserVersion(browserAgent, /.*android (\d+).*/),
			needsPolyfillPattern: !('pattern' in tempInputEl) || _getBrowserVersion(browserAgent, /.*android (\d+).*/),
			needsPolyfillPlaceholder: !('placeholder' in tempInputEl),
			needsPolyfillFormAttrs: !('form' in tempInputEl) || !('formAction' in tempInputEl) || _getBrowserVersion(browserAgent, /.*android (\d+).*/),
			needsPolyfillDatalist: !('autocomplete' in tempInputEl) || !('list' in tempInputEl),
			hasButtonBug: (document.documentMode || _getBrowserVersion(browserAgent, /.*msie (\d+).*/)) < 8,
			hasEnterKeyBug: ((document.documentMode || _getBrowserVersion(browserAgent, /.*msie (\d+).*/)) < 9) || _getBrowserVersion(browserAgent, /.*android (\d+).*/),
			needsPolyfillMaxlength: !('maxLength' in tempTextareaEl),

			// Type-specific polyfills (complex logic from original)
			needsPolyfillSpin: !('step' in tempInputEl) || !('min' in tempInputEl) || !!(_getBrowserVersion(browserAgent, /.*firefox\/(\d+).*/) || _getBrowserVersion(browserAgent, /.*msie (\d+).*/)),
			needsPolyfillNumber: (!!(_getBrowserVersion(browserAgent, /.*android (\d+).*/)) || (!('step' in tempInputEl) || !('min' in tempInputEl) || !!(_getBrowserVersion(browserAgent, /.*firefox\/(\d+).*/) || _getBrowserVersion(browserAgent, /.*msie (\d+).*/))) && !((document.documentMode || _getBrowserVersion(browserAgent, /.*msie (\d+).*/)) > 9)),
			needsPolyfillRange: ((!!(_getBrowserVersion(browserAgent, /.*android (\d+).*/)) || (!('step' in tempInputEl) || !('min' in tempInputEl) || !!(_getBrowserVersion(agentString, /.*firefox\/(\d+).*/) || _getBrowserVersion(agentString, /.*msie (\d+).*/))) && !((document.documentMode || _getBrowserVersion(agentString, /.*msie (\d+).*/)) > 9))) && !(_getBrowserVersion(agentString, /.*firefox\/(\d+).*/) > 22),
			needsPolyfillDateTimeLocal: !(_getBrowserVersion(browserAgent, /.*opera[\/ ](\d+).*/) > 8 || _getBrowserVersion(browserAgent, /.*chrome\/(\d+).*/) > 24),
			needsPolyfillDateTime: !(_getBrowserVersion(browserAgent, /.*opera[\/ ](\d+).*/) > 8),
			needsPolyfillDate: (!(_getBrowserVersion(browserAgent, /.*opera[\/ ](\d+).*/) > 8 || _getBrowserVersion(browserAgent, /.*chrome\/(\d+).*/) > 24)) && !(_getBrowserVersion(browserAgent, /.*chrome\/(\d+).*/) > 21),
			needsPolyfillTime: (!(_getBrowserVersion(browserAgent, /.*opera[\/ ](\d+).*/) > 8 || _getBrowserVersion(browserAgent, /.*chrome\/(\d+).*/) > 24)) && !(_getBrowserVersion(browserAgent, /.*chrome\/(\d+).*/) > 22),
			needsPolyfillMonth: !(_getBrowserVersion(browserAgent, /.*opera[\/ ](\d+).*/) > 8 || _getBrowserVersion(browserAgent, /.*chrome\/(\d+).*/) > 24) // Chrome version unknown
		};

		// Clean up temporary element
		$(tempInputEl).remove();
	})();

	$.fn.formEnricher = function(userOptions) {
		// Ensure 'this' is a valid jQuery object
		if (!this instanceof $) {
			console.error('formEnricher must be called on a jQuery object.');
			return this;
		}

		// Base configuration properties for the plugin
		const baseSettings = {
			feedbackSelector: '.form-feedback, .form-feedback-alt',
			overlayBlockerSelector: '.overlay-blocker',
			errorStyle: { backgroundColor: 'lightpink' },
			placeholderClass: 'input-hint',
			emptyMsg: 'Kindly complete this field.',
			unselectMsg: 'Kindly choose an option.',
			uncheckMsg: 'Kindly tick this checkbox.',
			patternMsg: 'Input does not conform to the required format.',
			emailMsg: 'Email address is invalid.',
			urlMsg: 'URL format is incorrect.',
			numberMsg: 'Numeric value is malformed.',
			datetimeMsg: 'Date and time value is invalid.',
			dateMsg: 'Date value is invalid.',
			timeMsg: 'Time value is invalid.',
			stepMsg: 'Value step is incorrect.',
			minValMsg: 'Value must be greater than or equal to #.',
			maxValMsg: 'Value must be less than or equal to #.',
			maxLengthMsg: 'Exceeds maximum # characters.',
			rangeWrapperClass: 'slider-wrapper',
			spinTimeClass: 'time-spinner-control',
			datetimeGroupClass: 'datetime-group',
			datePickerSettings: {
				onClose: function() { $(this).trigger('blur'); } // Programmatic blur
			},
			dateMaskFormat: '9999-99-99',
			monthMaskFormat: '9999-99',
			timeMaskFormat: '99:99',
			spinHintMsg: 'Hold Shift for hourly changes, or Ctrl for smaller steps.',
			extraOptions: {}, // For dynamic overrides
			dynamicContentSelector: '.dynamic-content'
		};
		const cfg = $.extend(true, {}, baseSettings, userOptions); // Deep merge options

		// Apply dynamic options specified in `extraOptions`
		for (const optionName in cfg.extraOptions) {
			if (Object.prototype.hasOwnProperty.call(cfg.extraOptions, optionName)) {
				// This is safer than original eval, but still requires careful input
				// as it directly modifies 'cfg'. Consider removing if not strictly needed.
				cfg[optionName] = cfg.extraOptions[optionName];
			}
		}

		// State variables for validation and key presses
		let isFirstValidationPass = true;
		let formNoValidateAttributePresent = false;
		let isShiftPressed = false;
		let isCtrlPressed = false;

		// Selector for elements that can be validated
		const targetElementsSelector = ':input:enabled:not(:button, :submit, [type="hidden"])';

		/**
		 * Applies a custom validation message to an input element.
		 * @param {jQuery} targetEl - The input element.
		 * @param {string} validationMsg - The message to set.
		 * @returns {jQuery} The input element.
		 */
		const applyValidationMessage = (targetEl, validationMsg) => {
			if (formNoValidateAttributePresent) {
				validationMsg = ''; // Clear message if form has novalidate
			}

			if (targetEl.is(targetElementsSelector)) {
				// Append title to message if available
				const elementTitle = targetEl.attr('title');
				if (validationMsg && elementTitle) {
					validationMsg = $.trim(validationMsg + '\n' + elementTitle);
				}

				if (_browserCapabilities.needsPolyfillCustomValidation) {
					if (validationMsg) {
						targetEl.data('customValidationMsg', validationMsg.replace(/\n/g, '<br />'));
					} else {
						targetEl.removeData('customValidationMsg');
					}

					// Apply/remove error styling if it's not the initial run
					if (!isFirstValidationPass && cfg.errorStyle) {
						if (validationMsg) {
							targetEl.css(cfg.errorStyle);
						} else {
							Object.keys(cfg.errorStyle).forEach(prop => targetEl.css(prop, ''));
						}
					}
				} else {
					// Use native setCustomValidity if supported
					targetEl[0].setCustomValidity(validationMsg);
				}
			}
			return targetEl;
		};
		$.fn.formEnricher.setValidationMessage = applyValidationMessage;

		/**
		 * Checks the validity of a given jQuery element(s).
		 * @param {jQuery} targetEl - The element(s) to check.
		 * @returns {boolean} True if all elements are valid, false otherwise.
		 */
		$.fn.formEnricher.checkValidity = function(targetEl) {
			let isValid = true;
			targetEl.each(function() {
				const currentEl = $(this);
				if (_browserCapabilities.needsPolyfillCustomValidation) {
					if (currentEl.data('customValidationMsg')) {
						isValid = false;
						return false; // Break loop
					}
				} else {
					if (!currentEl[0].checkValidity()) {
						isValid = false;
						return false; // Break loop
					}
				}
			});
			return isValid;
		};

		/**
		 * Displays a feedback bubble next to an input element.
		 * @param {jQuery} inputElement - The element requiring feedback.
		 * @param {string} messageContent - The message to display.
		 */
		const displayFeedbackBubble = (inputElement, messageContent) => {
			const feedbackElements = inputElement.prevAll(cfg.feedbackSelector);
			let feedbackContainer;

			if (feedbackElements.length === 0) {
				// Determine class based on available space
				const primaryClass = cfg.feedbackSelector.match(/^\.([^, ]+)/)?.[1];
				const secondaryClass = cfg.feedbackSelector.match(/,\s*\.?([^, ]+)/)?.[1];
				const effectiveClass = ($(window).width() - inputElement.offset().left < 300 && secondaryClass) ?
					secondaryClass : primaryClass;

				feedbackContainer = $('<span></span>').addClass(effectiveClass).insertBefore(inputElement);
				$(cfg.overlayBlockerSelector).attr('disabled', 'disabled'); // Disable elements behind the bubble
			} else {
				feedbackContainer = feedbackElements.first();
			}

			feedbackContainer.html(`<p>${messageContent.replace(/\n/g, '<br/>')}</p>`);
 			inputElement.trigger('focus').trigger('select'); // Ensure focus and selection
		};
		$.fn.formEnricher.showFeedback = displayFeedbackBubble;

		// Event delegation for clearing feedback balloons
		$(document).on('click', targetElementsSelector, function() {
			$(this).siblings(cfg.feedbackSelector).remove();
			$(cfg.overlayBlockerSelector).removeAttr('disabled');
		}).on('click', cfg.feedbackSelector, function() {
			$(this).remove(); // Allow user to dismiss feedback
		});

		// Initial focus on server-side errors
		const serverErrorElements = $(cfg.feedbackSelector);
		if (serverErrorElements.length) {
			let focusTarget = serverErrorElements.eq(0).next(':input');
			if (focusTarget.is(':hidden')) {
				focusTarget = focusTarget.parent().find(':input:not(:hidden)');
			}
			focusTarget.eq(0).trigger('focus');
		}

		/**
		 * Transforms an input element's type while preserving attributes.
		 * @param {jQuery} originalEl - The original input element.
		 * @param {string} newType - The new type attribute.
		 * @param {string} originalType - The original type (for class naming).
		 * @returns {jQuery} The new input element, replacing the original.
		 */
		const _changeInputType = (originalEl, newType, originalType) => {
			const newEl = $(`<input type="${newType}">`);
			const attributes = originalEl[0].attributes;
			const booleanAttributes = ['required', 'disabled', 'readonly', 'checked'];

			// Copy all attributes from the original element
			for (let i = 0; i < attributes.length; i++) {
				const attr = attributes[i];
				const attrName = attr.nodeName;
				let attrValue = attr.nodeValue;

				// Handle boolean attributes where value might be empty but presence matters
				if (!attrValue && booleanAttributes.includes(attrName)) {
					attrValue = attrName;
				}

				if (attrName && attrValue && attrName !== 'type') {
					newEl.attr(attrName, attrValue);
				}
			}
			newEl.addClass(`formenricher-${originalType}`); // Add class for identification

			// Replace the original element in the DOM
			return newEl.replaceAll(originalEl);
		};

		// Main plugin execution loop for each selected form
		return this.each(function() {
			const currentForm = $(this);
			let autoFocusCandidate; // Element designated for autofocus
			const activeFormControls = currentForm.find(targetElementsSelector);

			// Check for novalidate attribute on the form itself
			formNoValidateAttributePresent = !!_getOuterMarkup(currentForm).match(/<form[^>]*\s+novalidate/i);

			console.log(`FormEnricher: Initializing form ID: ${currentForm.attr('id') || 'N/A'}`);

			/**
			 * Handles key presses for numeric inputs, allowing only numbers and specific control keys.
			 * @param {Event} event - The keypress event.
			 * @returns {boolean} True if key is allowed, false otherwise.
			 */
			const handleNumericInput = (event) => {
				const allowedKeys = [8, 9, 35, 36, 37, 39, 46, 58, 186, 190]; // Backspace, Tab, Home, End, Arrows, Del, Colon, Semicolon, Period
				const charCode = event.charCode || event.keyCode;
				return (allowedKeys.includes(charCode) || (charCode >= 48 && charCode <= 57));
			};

			/**
			 * Monitors Shift and Ctrl key states globally for spinner functionality.
			 * @param {Event} eventObj - The keyboard event.
			 * @param {boolean} isPressed - True if key is down, false if up.
			 */
			const monitorKeyStates = (eventObj, isPressed) => {
				const keyCode = eventObj.keyCode;
				if (keyCode === 17) isCtrlPressed = isPressed;
				if (keyCode === 16) isShiftPressed = isPressed;
			};

			// Bind global keydown/keyup events for modifier keys (debounced or similar might be better for performance)
			$('body')
				.off('keydown.formEnricher', monitorKeyStates) // Unbind previous if exists
				.off('keyup.formEnricher', monitorKeyStates)
				.on('keydown.formEnricher', (ev) => monitorKeyStates(ev, true))
				.on('keyup.formEnricher', (ev) => monitorKeyStates(ev, false));

			/**
			 * Adjusts the time value of a spinner input based on key modifiers.
			 * @param {jQuery} inputElement - The time input element.
			 * @param {boolean} decrement - True to decrease, false to increase.
			 * @returns {jQuery} The updated input element.
			 */
			const adjustTimeInput = (inputElement, decrement) => {
				const currentMin = _toNumber(inputElement.attr('min'), 0);
				const currentMax = _toNumber(inputElement.attr('max'), 86400); // 24 hours in seconds
				const baseStep = _toNumber(inputElement.attr('step'), 60); // Default to 1 minute

				let effectiveStep = baseStep;
				if (isShiftPressed) {
					effectiveStep = 3600; // Hourly steps
				} else if (isCtrlPressed) {
					effectiveStep = baseStep; // Original step
				} else {
					effectiveStep = (baseStep < 600) ? 600 : baseStep; // Larger steps if no modifier
				}

				let currentValueSec = _timeStringToSeconds(inputElement.val());
				const direction = decrement ? -1 : 1;

				// Calculate next value, snapping to step
				currentValueSec = currentValueSec - (currentValueSec % effectiveStep) + (effectiveStep * direction);

				// Apply min/max constraints
				currentValueSec = Math.max(currentMin, Math.min(currentMax, currentValueSec));

				inputElement.val(_secondsToTimeString(currentValueSec, baseStep % 60 !== 0)); // Include seconds if step is less than a minute
				return inputElement;
			};

			/**
			 * Initializes or polyfills specific form control elements.
			 * @param {jQuery} elementsToInit - The elements to process.
			 * @param {boolean} isInitialScan - True for the very first pass.
			 * @returns {jQuery} The processed elements.
			 */
			const initializeFormControl = (elementsToInit, isInitialScan) => {
				isFirstValidationPass = isInitialScan;

				return elementsToInit.each(function() {
					const inputElement = $(this);

					// Skip elements already processed to prevent re-initialization
					if (inputElement.data('formEnricherInitialized')) {
						return;
					}
					inputElement.data('formEnricherInitialized', true);

					const elementType = inputElement.attr('type') ? inputElement.attr('type').toLowerCase() : inputElement.prop('tagName').toLowerCase();

					// Handle autofocus polyfill
					if (_browserCapabilities.needsPolyfillAutofocus && !autoFocusCandidate && inputElement.is('[autofocus]')) {
						autoFocusCandidate = inputElement;
					}

					// Placeholder polyfill
					const placeHolderText = inputElement.attr('placeholder');
					if (_browserCapabilities.needsPolyfillPlaceholder && placeHolderText) {
						// Remove any existing placeholder span to prevent duplicates
						inputElement.prev(`.${cfg.placeholderClass}`).remove();

						const placeHolderSpan = $('<span></span>')
							.insertBefore(inputElement)
							.addClass(cfg.placeholderClass)
							.text(placeHolderText)
							.on('click', () => inputElement.trigger('focus'));

						const updatePlaceholderVisibility = () => {
							if (inputElement.val().length > 0) {
								placeHolderSpan.hide();
							} else {
								placeHolderSpan.show();
							}
						};
						inputElement.on('keyup.formEnricher keydown.formEnricher cut.formEnricher paste.formEnricher change.formEnricher', updatePlaceholderVisibility);
						updatePlaceholderVisibility(); // Initial check
						inputElement.removeAttr('placeholder'); // Remove native placeholder
					}

					// Spinner polyfill for number and time types (requires jQuery UI Spinner)
					if ($.fn.spinner) {
						if (_browserCapabilities.needsPolyfillSpin && elementType === 'number') {
							inputElement = _changeInputType(inputElement, 'text', elementType);
							inputElement.spinner().off('keydown', handleNumericInput).on('keydown', handleNumericInput);
						}
						if (_browserCapabilities.needsPolyfillTime && elementType === 'time') {
							inputElement = _changeInputType(inputElement, 'text', elementType);
							inputElement.spinner({ spin: () => false }); // Disable default spinner spin
							const spinnerWidget = inputElement.spinner('widget');
							spinnerWidget.find('.ui-icon')
								.attr('title', cfg.spinHintMsg)
								.on('click', function() {
									const isDecrement = $(this).parents('.ui-spinner').find('.ui-icon').index($(this)) === 0; // Check which icon was clicked
									adjustTimeInput(inputElement, isDecrement).trigger('change').trigger('blur');
								});

							if ($.fn.mask) { // If jQuery Mask Plugin is available
								inputElement.off('mask').mask(cfg.timeMaskFormat);
							}
						}
					}

					// Datepicker polyfill for date and month types (requires jQuery UI Datepicker)
					if ($.fn.datepicker) {
						if ((_browserCapabilities.needsPolyfillDate && elementType === 'date') || (_browserCapabilities.needsPolyfillMonth && elementType === 'month')) {
							const datePickerOptions = $.extend({}, cfg.datePickerSettings);
							let inputMaskFormat;

							switch(elementType) {
								case 'date':
									datePickerOptions.dateFormat = 'yy-mm-dd';
									datePickerOptions.minDate = inputElement.attr('min');
									datePickerOptions.maxDate = inputElement.attr('max');
									inputMaskFormat = cfg.dateMaskFormat;
									break;
								case 'month':
									datePickerOptions.dateFormat = 'yy-mm';
									inputMaskFormat = cfg.monthMaskFormat;
									// Datepicker might have issues with min/max for 'yy-mm' format
									datePickerOptions.minDate = '';
									datePickerOptions.maxDate = '';
									break;
							}
							inputElement = _changeInputType(inputElement, 'text', elementType).datepicker(datePickerOptions);

							if ($.fn.mask) { // If jQuery Mask Plugin is available
								inputElement.off('mask').mask(inputMaskFormat);
							}
						}
					}

					// Slider polyfill for range type (requires jQuery UI Slider)
					if (_browserCapabilities.needsPolyfillRange && elementType === 'range' && $.fn.slider) {
						const minValue = _toNumber(inputElement.attr('min'), 0);
						const maxValue = _toNumber(inputElement.attr('max'), 100);
						const stepValue = _toNumber(inputElement.attr('step'), 1);
						const currentValue = _toNumber(inputElement.val(), (minValue + maxValue) / 2); // Default to midpoint

						inputElement.hide().css({width: 0, margin: 0})
							.after(`<span class="${cfg.rangeWrapperClass}"><div></div></span>`);

						inputElement.next(`.${cfg.rangeWrapperClass}`).children().slider({
							min: minValue,
							max: maxValue,
							step: stepValue,
							value: currentValue,
							change: function(event, uiSlider) {
								inputElement.val(uiSlider.value).trigger('change'); // Update hidden input and trigger change
							}
						});
					}

					// Maxlength polyfill for textareas
					if (_browserCapabilities.needsPolyfillMaxlength && inputElement.is('textarea')) {
						const maxLengthAttr = inputElement.attr('maxlength');
						if (maxLengthAttr) {
							const limitInputLength = (event) => {
								const charCode = event.charCode || event.keyCode;
								// Allow control keys (backspace, tab, arrows, delete)
								if ([8, 9, 37, 39, 46].includes(charCode)) {
									return true;
								}
								// Prevent further input if length limit is reached
								return (inputElement.val().length < _toNumber(maxLengthAttr));
							};
							inputElement.off('keypress.formEnricher', limitInputLength).on('keypress.formEnricher', limitInputLength);
						}
					}

					// Datetime-local and Datetime polyfills
					const isLocalDatetime = (_browserCapabilities.needsPolyfillDateTimeLocal && elementType === 'datetime-local');
					const isStandardDatetime = (_browserCapabilities.needsPolyfillDateTime && elementType === 'datetime');

					if (isLocalDatetime || isStandardDatetime) {
						inputElement = _changeInputType(inputElement, 'text', elementType);

						// Helper to parse datetime strings
						const getLocalDatetime = (dtString, local) => {
							if (!dtString) return ['', ''];
							// Simple split, assuming YYYY-MM-DDTHH:MM or YYYY-MM-DD HH:MM
							const parts = dtString.split(/[T ]/);
							return [parts[0] || '', parts[1] || ''];
						};

						const [dtValueDate, dtValueTime] = getLocalDatetime(inputElement.val(), isLocalDatetime);
						const [dtMinDate, dtMinTime] = getLocalDatetime(inputElement.attr('min'), isLocalDatetime);
						const [dtMaxDate, dtMaxTime] = getLocalDatetime(inputElement.attr('max'), isLocalDatetime);
						const timezoneSuffix = (elementType === 'datetime') ?
							`<span class="formenricher-timezone">${new Date().toLocaleTimeString('en-us', {timeZoneName:'short'}).split(' ')[2] || 'UTC'}</span>` : '';

						// Create wrapper for date and time inputs
						const datetimeWrapper = $('<span></span>').addClass(cfg.datetimeGroupClass).insertAfter(inputElement);

						const dateInput = $('<input type="date">')
							.val(dtValueDate)
							.attr('min', dtMinDate).attr('max', dtMaxDate)
							.attr('size', inputElement.attr('size')).addClass(inputElement.attr('class'))
							.attr('title', inputElement.attr('title'));

						const timeInput = $('<input type="time">')
							.val(dtValueTime)
							.attr('step', _toNumber(inputElement.attr('step'), 60))
							.attr('size', inputElement.attr('size')).addClass(inputElement.attr('class'))
							.attr('title', inputElement.attr('title'));

						datetimeWrapper.append(dateInput, timeInput, timezoneSuffix);
						inputElement.hide();

						// Transfer 'required' attribute to sub-inputs
						if (inputElement.is('[required]')) {
							inputElement.removeAttr('required');
							dateInput.attr('required', 'required');
							timeInput.attr('required', 'required');
						}
						// Recursively initialize the new date/time inputs
						initializeFormControl(dateInput.add(timeInput), isInitialScan);

						// Update hidden datetime input when sub-inputs change
						dateInput.add(timeInput).on('change.formEnricher', function() {
							const combinedDate = dateInput.val();
							const combinedTime = timeInput.val();
							if (combinedDate && combinedTime) {
								const combinedDateTime = isLocalDatetime ?
									`${combinedDate}T${combinedTime}` : `${combinedDate} ${combinedTime}`;
								inputElement.val(combinedDateTime).trigger('change');
							} else {
								inputElement.val('').trigger('change');
							}
						});
					}

					// Datalist polyfill (requires jQuery UI Autocomplete)
					if (_browserCapabilities.needsPolyfillDatalist && inputElement.is('[list]') && $.fn.autocomplete) {
						const dataListId = inputElement.attr('list');
						const dataListEl = $(`#${dataListId}`);

						if (dataListEl.length) {
							const autoCompleteSource = [];
							// Populate source from <option> tags
							dataListEl.find('option').each(function() {
								autoCompleteSource.push($(this).val());
							});
							// Populate source from data-option JSON attribute
							const jsonString = dataListEl.attr('data-option');
							if (jsonString) {
								try {
									const parsedOptions = $.parseJSON(jsonString);
									if (Array.isArray(parsedOptions)) {
										autoCompleteSource.push(...parsedOptions);
									}
								} catch (e) {
									console.warn('FormEnricher: Failed to parse data-option for datalist.', e);
								}
							}

							inputElement.removeAttr('list'); // Remove native list attribute
							inputElement.autocomplete({
								source: autoCompleteSource,
								// Prevent autocomplete from triggering during CJK input methods
								search: function(event) {
									if (event.keyCode === 229) return false;
									return true;
								}
							}).on('keyup.formEnricher', function(event) {
								// Trigger search on Enter key for some input methods
								if (event.keyCode === 13) {
									$(this).autocomplete('search');
								}
							});
						}
					}

					/**
					 * Performs validation checks for individual input elements.
					 * @param {jQuery} element - The input element to validate.
					 * @returns {boolean} True if element is valid, false otherwise.
					 */
					const _validateInput = (element) => {
						let isValid = true;
						const controlName = element.attr('name');
						const isOptionSelected = $(`[name="${controlName}"]:checked`).length > 0;
						const isInputEmpty = (element.val() === '' || (element.is(':checkbox, :radio') && !isOptionSelected));

						// Clear previous custom validity message
						applyValidationMessage($(`[name="${controlName}"]`), '');

						// Required field polyfill
						if (_browserCapabilities.needsPolyfillRequired && element.is('[required]')) {
							if (isInputEmpty) {
								let validationMessage = cfg.emptyMsg;
								if (element.is('select, :radio')) validationMessage = cfg.unselectMsg;
								if (element.is(':checkbox')) validationMessage = cfg.uncheckMsg;
								applyValidationMessage(element, validationMessage);
								isValid = false;
							}
						}

						// Pattern validation polyfill
						if (_browserCapabilities.needsPolyfillPattern && element.is('[pattern]') && !isInputEmpty) {
							const patternAttr = element.attr('pattern');
							try {
								const regex = new RegExp(`^(?:${patternAttr})$`); // Ensure full string match
								if (!regex.test(element.val())) {
									applyValidationMessage(element, cfg.patternMsg);
									isValid = false;
								}
							} catch (e) {
								console.warn(`FormEnricher: Invalid regex pattern for ${controlName}: ${patternAttr}`, e);
							}
						}

						// Type-specific validations (email, url, number, etc.)
						if (!isInputEmpty) {
							const currentElementType = element.attr('type');
							switch (currentElementType) {
								case 'email':
									if (_browserCapabilities.needsPolyfillEmailUrl && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(element.val())) {
										applyValidationMessage(element, cfg.emailMsg);
										isValid = false;
									}
									break;
								case 'url':
									if (_browserCapabilities.needsPolyfillEmailUrl && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(element.val())) {
										applyValidationMessage(element, cfg.urlMsg);
										isValid = false;
									}
									break;
								case 'number':
									if (_browserCapabilities.needsPolyfillNumber) {
										const numVal = _toNumber(element.val());
										if (isNaN(numVal)) {
											applyValidationMessage(element, cfg.numberMsg);
											isValid = false;
										} else {
											const minVal = _toNumber(element.attr('min'), -Infinity);
											const maxVal = _toNumber(element.attr('max'), Infinity);
											const stepVal = _toNumber(element.attr('step'), 1);

											if (numVal < minVal) {
												applyValidationMessage(element, cfg.minValMsg.replace('#', minVal));
												isValid = false;
											} else if (numVal > maxVal) {
												applyValidationMessage(element, cfg.maxValMsg.replace('#', maxVal));
												isValid = false;
											} else if ((numVal - minVal) % stepVal !== 0) { // Check step validity
												applyValidationMessage(element, cfg.stepMsg);
												isValid = false;
											}
										}
									}
									break;
								// Add cases for date, time, datetime, datetime-local if more complex validation is needed
							}
						}
						return isValid;
					};

					// Attach change event handler for validation
					inputElement.on('change.formEnricher', function() {
						_validateInput($(this));
					});

					// Handle enter key bug for IE < 9 and Android
					if (_browserCapabilities.hasEnterKeyBug && !inputElement.is('select, textarea, button')) {
						const handleEnterKey = (event) => {
							const charCode = event.charCode || event.keyCode;
							if (charCode === 13) {
								event.preventDefault(); // Prevent default form submission
								const currentIdx = activeFormControls.index(inputElement);
								if (_browserCapabilities.isAndroid && (currentIdx + 1) < activeFormControls.length) {
									activeFormControls.eq(currentIdx + 1).trigger('focus'); // Move to next field on Android
								} else {
									// Trigger form submission or focus on submit button
									currentForm.find('[type="submit"]').eq(0).trigger('focus').trigger('click');
								}
								return false;
							}
							return true;
						};
						inputElement.off('keypress.formEnricher', handleEnterKey).on('keypress.formEnricher', handleEnterKey);
					}
				});
			};

			// Initialize all validatable elements within the form
			initializeFormControl(activeFormControls, true);

			// Trigger autofocus if an element was identified
			if (autoFocusCandidate) {
				autoFocusCandidate.trigger('focus');
			}

			// Intercept form submission for client-side validation
			currentForm.on('submit.formEnricher', function(event) {
				if (formNoValidateAttributePresent) {
					return true; // Skip client-side validation if novalidate is present
				}

				let formIsValid = true;
				// Validate all relevant inputs before submission
				activeFormControls.each(function() {
					if (!_validateInput($(this))) {
						formIsValid = false;
						// Only show feedback for the first invalid element
						if (formIsValid === false && !$(this).data('feedbackShown')) {
							const msg = $(this).data('customValidationMsg') || $(this)[0].validationMessage;
							if (msg) {
								displayFeedbackBubble($(this), msg);
								$(this).data('feedbackShown', true); // Mark as feedback shown
							}
						}
					} else {
						// Clear any previous feedback for valid elements
						$(this).siblings(cfg.feedbackSelector).remove();
						$(this).removeData('feedbackShown');
						Object.keys(cfg.errorStyle).forEach(prop => $(this).css(prop, ''));
					}
				});

				isFirstValidationPass = false; // Subsequent validations are not "first pass"

				if (!formIsValid) {
					event.preventDefault(); // Stop submission if validation fails
					event.stopImmediatePropagation(); // Prevent other submit handlers
					// Focus on the first invalid element
					activeFormControls.filter(function() {
						return $(this).data('customValidationMsg') || ($(this)[0].checkValidity && !$(this)[0].checkValidity());
					}).first().trigger('focus');
				}
				return formIsValid;
			});
		});
	};
})(jQuery);