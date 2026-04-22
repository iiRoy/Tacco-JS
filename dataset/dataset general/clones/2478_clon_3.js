/*

	Tag Input System for Web Forms

	This script provides an interactive tagging interface for input fields,
	allowing users to add and manage tags. It integrates features like
	autosizing, unique tag enforcement, and optional autocomplete.

	Licensed under the MIT license.

*/

(function($) {

	// Centralized storage for instance-specific data, indexed by element ID.
	// Using Maps for better encapsulation and lookup efficiency.
	const instanceDelimiters = new Map();
	const instanceCallbacks = new Map();

	/**
	 * Dynamically adjusts the width of an input element based on its content.
	 * @param {object} sizingOptions - Configuration object for autosizing.
	 */
	$.fn.adjustInputWidth = function(sizingOptions) {
	    const minimumWidth = $(this).data('min_sz_wdth'); // Renamed minWidth
	    const maximumWidth = $(this).data('max_sz_wdth'); // Renamed maxWidth
	    const targetInput = $(this); // Renamed input
	    const measureElementId = targetInput.data('meas_elem_id'); // Renamed tester_id
	    const measurementDiv = $(`#${measureElementId}`); // Renamed testSubject

	    let currentInputVal = targetInput.val(); // Renamed val
	    if (currentInputVal === (currentInputVal = targetInput.val())) { // Original idiom preserved, variable renamed
			return;
		}

	    // Prepare content for measurement: escape HTML and replace spaces.
	    const safeHtmlContent = currentInputVal
	                                .replace(/&/g, '&amp;')
	                                .replace(/\s/g,' ')
	                                .replace(/</g, '&lt;')
	                                .replace(/>/g, '&gt;');
	    measurementDiv.html(safeHtmlContent); // Renamed escaped

	    // Calculate new width considering comfort zone and boundaries.
	    const contentWidth = measurementDiv.width(); // Renamed testerWidth
	    const calculatedWidth = (contentWidth + sizingOptions.comfortZone) >= minimumWidth ? contentWidth + sizingOptions.comfortZone : minimumWidth; // Renamed newWidth
	    const actualWidth = targetInput.width(); // Renamed currentWidth

	    // Determine if a width change is necessary and valid.
	    const shouldResize = (calculatedWidth < actualWidth && calculatedWidth >= minimumWidth)
	                             || (calculatedWidth > minimumWidth && calculatedWidth < maximumWidth); // Renamed isValidWidthChange

	    // Apply width change with animation (optional, but original implies direct change).
	    if (shouldResize) {
	        targetInput.width(calculatedWidth);
	    }
  };

  /**
   * Initializes the autosizing mechanism for an input field.
   * Creates a hidden measurement element if it doesn't exist.
   * @param {object} initOptions - Configuration for initial autosize setup.
   */
  $.fn.initializeAutosize = function(initOptions) {
    const targetInput = $(this); // Renamed input
    const initialWidth = targetInput.width();

    const minimumWidth = initOptions.minInputWidth || initialWidth; // Renamed minWidth
    const maximumWidth = initOptions.maxInputWidth || (targetInput.closest('.tag-container').width() - initOptions.inputPadding); // Renamed maxWidth
    const measureElementId = `${targetInput.attr('id')}_sizer_div`; // Renamed testerId

    let measurementElement = $(`#${measureElementId}`);
    if (!measurementElement.length) { // Simplified check
      measurementElement = $('<div>', { // Renamed testSubject, created directly with ID
        id: measureElementId,
        css: {
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: targetInput.css('fontSize'),
            fontFamily: targetInput.css('fontFamily'),
            fontWeight: targetInput.css('fontWeight'),
            letterSpacing: targetInput.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }
      }).appendTo('body');
    }

    // Store sizing parameters on the input element's data.
    targetInput.data('min_sz_wdth', minimumWidth);
    targetInput.data('max_sz_wdth', maximumWidth);
    targetInput.data('meas_elem_id', measureElementId);
    targetInput.css('width', minimumWidth); // Set initial width
  };

	/**
	 * Adds a new tag entry to the input field.
	 * @param {string} tagContent - The text content of the tag to add.
	 * @param {object} configOptions - Configuration for adding the tag (focus, callback, unique).
	 */
	$.fn.appendTagEntry = function(tagContent, configOptions) {
			const options = jQuery.extend({shouldFocus:false, triggerCallback:true}, configOptions); // Renamed options, focus, callback
			this.each(function() {
				const elementId = $(this).attr('id'); // Renamed id
				if (!elementId) {
					console.warn('Cannot add tag: target element has no ID.');
					return;
				}

				let currentTags = $(this).val().split(instanceDelimiters.get(elementId)); // Renamed tagslist, delimiter
				if (currentTags[0] === '') {
					currentTags = []; // Initialize as empty array if no tags
				}

				const trimmedTagContent = jQuery.trim(tagContent); // Renamed value

				let tagAlreadyExists = false; // Renamed skipTag
				if (options.unique) {
					tagAlreadyExists = $(this).checkTagExistence(trimmedTagContent); // Renamed tagExist
					if(tagAlreadyExists) {
					    // Mark the temporary input as invalid for styling purposes
    				    $(`#${elementId}_entry_field`).addClass('tag-invalid'); // Renamed _tag, not_valid
    				}
				}

				if (trimmedTagContent !== '' && !tagAlreadyExists) {
                    // Create the tag visual element
                    $('<span>', { class: 'tag-item' }).append( // Renamed tag
                        $('<span>', { text: trimmedTagContent }).append('&nbsp;&nbsp;'),
                        $('<a>', {
                            href  : '#',
                            title : 'Remove this tag',
                            text  : 'x',
							role  : 'button'
                        }).on('click', function (e) { // Using on for event binding
							e.preventDefault(); // Prevent default link behavior
                            return $(`#${elementId}`).deleteTagEntry(encodeURIComponent(trimmedTagContent)); // Renamed removeTag, escape
                        })
                    ).insertBefore(`#${elementId}_add_area`); // Renamed _addTag

					currentTags.push(trimmedTagContent);

					$(`#${elementId}_entry_field`).val(''); // Clear the temporary input
					if (options.shouldFocus) {
						$(`#${elementId}_entry_field`).focus();
					} else {
						$(`#${elementId}_entry_field`).blur();
					}

					$.fn.initTaggingSystem.syncHiddenInputField(this, currentTags); // Renamed updateTagsField

					const handlers = instanceCallbacks.get(elementId); // Renamed tags_callbacks
					if (options.triggerCallback && handlers) {
						if (handlers.onTagAdded) { // Renamed onAddTag
							handlers.onTagAdded.call(this, trimmedTagContent);
						}
						if (handlers.onTagsChanged) { // Renamed onChange
							handlers.onTagsChanged.call(this, $(this), currentTags[currentTags.length - 1]); // Renamed tagslist[i-1]
						}
					}
				}

			});

			return this; // Return jQuery object for chaining
		};

	/**
	 * Removes a specified tag from the input field.
	 * @param {string} tagValueToRemove - The value of the tag to remove.
	 */
	$.fn.deleteTagEntry = function(tagValueToRemove) {
			const decodedTagValue = decodeURIComponent(tagValueToRemove); // Renamed value, unescape
			this.each(function() {
				const elementId = $(this).attr('id'); // Renamed id
				if (!elementId) {
					console.warn('Cannot remove tag: target element has no ID.');
					return;
				}

				const existingTagsArray = $(this).val().split(instanceDelimiters.get(elementId)); // Renamed old, delimiter

				// Remove all visual tags first
				$(`#${elementId}_tag_wrapper .tag-item`).remove(); // Renamed _tagsinput, tag

				// Filter out the tag to be removed
				const newTagList = existingTagsArray.filter(tag => tag !== decodedTagValue); // Rewritten loop with filter

				$.fn.initTaggingSystem.processTagString(this, newTagList.join(instanceDelimiters.get(elementId))); // Renamed importTags, str

				const handlers = instanceCallbacks.get(elementId);
				if (handlers && handlers.onTagRemoved) { // Renamed onRemoveTag
					handlers.onTagRemoved.call(this, decodedTagValue);
				}
				if (handlers && handlers.onTagsChanged) { // Renamed onChange
					handlers.onTagsChanged.call(this, $(this), decodedTagValue); // Pass the removed tag
				}
			});

			return this; // Return jQuery object for chaining
		};

	/**
	 * Checks if a given tag already exists in the list.
	 * @param {string} valToCheck - The tag value to check for existence.
	 * @returns {boolean} True if the tag exists, false otherwise.
	 */
	$.fn.checkTagExistence = function(valToCheck) { // Renamed tagExist
		const elementId = $(this).attr('id'); // Renamed id
		if (!elementId) return false;
		const currentTags = $(this).val().split(instanceDelimiters.get(elementId)); // Renamed tagslist, delimiter
		return currentTags.includes(valToCheck); // Using Array.prototype.includes
	};

	/**
	 * Clears all existing tags and imports new ones from a provided string.
	 * @param {string} tagString - A delimited string of tags to import.
	 */
	$.fn.loadTagsFromString = function(tagString) { // Renamed importTags (plugin method)
        const elementId = $(this).attr('id');
		if (!elementId) {
			console.warn('Cannot load tags: target element has no ID.');
			return this;
		}
		$(`#${elementId}_tag_wrapper .tag-item`).remove(); // Clear visual tags
		$.fn.initTaggingSystem.processTagString(this, tagString); // Renamed importTags (static method)
		return this;
	};

	/**
	 * Initializes the tagging system for the selected input element(s).
	 * @param {object} userOptions - User-defined configuration options.
	 */
	$.fn.initTaggingSystem = function(userOptions) { // Renamed tagsInput
    const pluginSettings = jQuery.extend({ // Renamed settings
      interactiveMode:true, // Renamed interactive
      defaultEntryText:'add a tag', // Renamed defaultText
      minTagLength:0, // Renamed minChars
      containerWidth:'300px', // Renamed width
      containerHeight:'100px', // Renamed height
      autocompleteConfig: {selectFirst: false }, // Renamed autocomplete
      hideOriginalInput:true, // Renamed hide
      tagSeparator: ',', // Renamed delimiter
      enforceUniqueTags:true, // Renamed unique
      enableBackspaceRemoval:true, // Renamed removeWithBackspace
      placeholderTextColor:'#666666', // Renamed placeholderColor
      autoResizeInput: true, // Renamed autosize
      comfortZone: 20,
      inputPadding: 12 // 6*2
    }, userOptions);

		this.each(function() {
			const originalInput = $(this);
			if (pluginSettings.hideOriginalInput) {
				originalInput.hide();
			}

			let elementId = originalInput.attr('id'); // Renamed id
			// Ensure the input has an ID, generate one if missing or already used for this plugin
			if (!elementId || instanceDelimiters.has(elementId)) { // Checking if ID is already managed
				elementId = `tag_input_${Date.now()}`; // Renamed tags + new Date().getTime()
				originalInput.attr('id', elementId);
			}

			// Store instance-specific data for easy access.
			const instanceData = jQuery.extend({ // Renamed data
				parentIdentifier: elementId, // Renamed pid
				originalInputSelector: `#${elementId}`, // Renamed real_input
				containerElementSelector: `#${elementId}_tag_wrapper`, // Renamed holder
				inputAreaSelector: `#${elementId}_add_area`, // Renamed input_wrapper
				tempInputSelector: `#${elementId}_entry_field` // Renamed fake_input
			}, pluginSettings);

			instanceDelimiters.set(elementId, instanceData.tagSeparator); // Store delimiter in Map

			// Store callback functions if provided.
			if (pluginSettings.onAddTag || pluginSettings.onRemoveTag || pluginSettings.onChange) {
				instanceCallbacks.set(elementId, { // Using object for callbacks
					onTagAdded: pluginSettings.onAddTag, // Renamed onAddTag
					onTagRemoved: pluginSettings.onRemoveTag, // Renamed onRemoveTag
					onTagsChanged: pluginSettings.onChange // Renamed onChange
				});
			}

			// Construct the HTML markup for the tagging widget using template literals.
			let widgetHtml = `<div id="${elementId}_tag_wrapper" class="tag-container"><div id="${elementId}_add_area">`; // Renamed markup, _tagsinput, tagsinput, _addTag

			if (pluginSettings.interactiveMode) {
				widgetHtml += `<input id="${elementId}_entry_field" value="" data-default-text="${pluginSettings.defaultEntryText}" />`; // Renamed _tag, data-default
			}

			widgetHtml += `</div><div class="tag-clear"></div></div>`; // Renamed tags_clear

			$(widgetHtml).insertAfter(originalInput);

			// Apply styling to the container.
			$(instanceData.containerElementSelector).css({
				'width': pluginSettings.containerWidth,
				'min-height': pluginSettings.containerHeight,
				'height': pluginSettings.containerHeight
			});

			// If the original input already has a value, import those tags.
			if (originalInput.val() !== '') {
				$.fn.initTaggingSystem.processTagString(originalInput, originalInput.val());
			}

			// Set up interactive behavior if enabled.
			if (pluginSettings.interactiveMode) {
				const tempInput = $(instanceData.tempInputSelector); // Cache for frequent use
				tempInput.val(tempInput.attr('data-default-text'));
				tempInput.css('color', pluginSettings.placeholderTextColor);
		        tempInput.initializeAutosize(pluginSettings); // Renamed resetAutosize

				$(instanceData.containerElementSelector).on('click', function(event) { // Use 'on' for event delegation
					tempInput.focus();
				});

				tempInput.on('focus', function(event) {
					if (tempInput.val() === tempInput.attr('data-default-text')) {
						tempInput.val('');
					}
					tempInput.css('color','#000000');
				});

				if (pluginSettings.autocompleteConfig.source !== undefined) { // Renamed autocomplete_url
					const autoSuggestConfig = {}; // Renamed autocomplete_options
					for (const optionKey in pluginSettings.autocompleteConfig) { // Renamed attrname
						autoSuggestConfig[optionKey] = pluginSettings.autocompleteConfig[optionKey];
					}

					if (jQuery.Autocompleter !== undefined) { // Old jQuery UI Autocomplete
						tempInput.autocomplete(pluginSettings.autocompleteConfig.source, pluginSettings.autocompleteConfig);
						tempInput.on('result', function(event, data, formatted) {
							if (data) {
								originalInput.appendTagEntry(data[0] + "",{shouldFocus:true,enforceUniqueTags:pluginSettings.enforceUniqueTags});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) { // New jQuery UI Autocomplete
						tempInput.autocomplete(autoSuggestConfig);
						tempInput.on('autocompleteselect', function(event, ui) {
							originalInput.appendTagEntry(ui.item.value,{shouldFocus:true,enforceUniqueTags:pluginSettings.enforceUniqueTags});
							return false; // Prevent value from being placed in the input field
						});
					}


				} else {
						// If autocomplete is not used, allow tag creation on blur.
						tempInput.on('blur', function(event) {
							const defaultPlaceholder = tempInput.attr('data-default-text'); // Renamed d
							const currentEntry = tempInput.val();
							if (currentEntry !== '' && currentEntry !== defaultPlaceholder) {
								if( (pluginSettings.minTagLength <= currentEntry.length) && (!pluginSettings.maxChars || (pluginSettings.maxChars >= currentEntry.length)) )
									originalInput.appendTagEntry(currentEntry,{shouldFocus:true,enforceUniqueTags:pluginSettings.enforceUniqueTags});
							} else {
								tempInput.val(defaultPlaceholder);
								tempInput.css('color',pluginSettings.placeholderTextColor);
							}
							return false;
						});

				}
				// Handle key presses for adding tags (delimiter keys) and autosizing.
				tempInput.on('keypress', function(event) {
					if (isInputDelimiter(event, instanceData.tagSeparator)) { // Renamed _checkDelimiter, event.data.delimiter
					    event.preventDefault(); // Stop default behavior of delimiter key
						const currentEntry = tempInput.val();
						if( (pluginSettings.minTagLength <= currentEntry.length) && (!pluginSettings.maxChars || (pluginSettings.maxChars >= currentEntry.length)) )
							originalInput.appendTagEntry(currentEntry,{shouldFocus:true,enforceUniqueTags:pluginSettings.enforceUniqueTags});
					  	tempInput.initializeAutosize(pluginSettings);
						return false;
					} else if (pluginSettings.autoResizeInput) {
			            tempInput.adjustInputWidth(pluginSettings);
          			}
				});
				// Delete last tag on backspace if enabled and input is empty.
				pluginSettings.enableBackspaceRemoval && tempInput.on('keydown', function(event)
				{
					if(event.keyCode === 8 && $(this).val() === '') // KeyCode 8 is Backspace
					{
						 event.preventDefault();
						 const lastTagElement = $(this).closest('.tag-container').find('.tag-item:last'); // Renamed tagsinput, tag
						 if (lastTagElement.length) {
							 const lastTagText = lastTagElement.find('span:first').text().trim(); // Get text content of the tag
							 originalInput.deleteTagEntry(encodeURIComponent(lastTagText)); // Renamed removeTag, escape
							 $(this).trigger('focus');
						 }
					}
				});
				tempInput.blur(); // Initial blur to set placeholder

				// Remove the 'tag-invalid' class when user types in the fake input.
				if(pluginSettings.enforceUniqueTags) {
				    tempInput.on('keydown', function(event){
				        if(event.keyCode === 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
				            $(this).removeClass('tag-invalid'); // Renamed not_valid
				        }
				    });
				}
			} // End of interactiveMode checks
		});

		return this; // Allow chaining
	};

	/**
	 * Static helper: Updates the hidden input field with the current list of tags.
	 * @param {HTMLElement} targetObj - The original hidden input element.
	 * @param {Array<string>} currentTagsList - An array of current tags.
	 */
	$.fn.initTaggingSystem.syncHiddenInputField = function(targetObj, currentTagsList) { // Renamed updateTagsField
		const elementId = $(targetObj).attr('id');
		$(targetObj).val(currentTagsList.join(instanceDelimiters.get(elementId)));
	};

	/**
	 * Static helper: Imports tags from a delimited string into the tagging system.
	 * @param {HTMLElement} targetObj - The original hidden input element.
	 * @param {string} tagStringValue - A string containing delimited tags.
	 */
	$.fn.initTaggingSystem.processTagString = function(targetObj, tagStringValue) { // Renamed importTags
		$(targetObj).val(''); // Clear the original input first
		const elementId = $(targetObj).attr('id');
		const tagsArray = tagStringValue.split(instanceDelimiters.get(elementId)); // Renamed tags
		for (let i = 0; i < tagsArray.length; i++) { // Using let for block scope
			// Only add non-empty tags
			if (jQuery.trim(tagsArray[i]) !== '') {
				$(targetObj).appendTagEntry(tagsArray[i],{shouldFocus:false,triggerCallback:false});
			}
		}

		// Trigger change callback after importing all tags
		const handlers = instanceCallbacks.get(elementId);
		if(handlers && handlers.onTagsChanged) {
			// Pass the last tag added, or an empty string if no tags were added.
			const lastTag = tagsArray.length > 0 ? tagsArray[tagsArray.length - 1] : '';
			handlers.onTagsChanged.call(targetObj, $(targetObj), lastTag);
		}
	};

    /**
     * Helper function to check if a keypress event corresponds to a configured delimiter.
     * @param {KeyboardEvent} event - The keypress event object.
     * @param {string|Array<string>} configuredDelimiters - The delimiter(s) configured for the instance.
     * @returns {boolean} True if the key pressed is a delimiter, false otherwise.
     */
    const isInputDelimiter = function(event, configuredDelimiters) { // Renamed _checkDelimiter
        let isMatch = false; // Renamed flag

        // Check for Enter key (keyCode 13)
        if(event.which === 13) {
            isMatch = true;
        }

        // If configuredDelimiters is a string, treat it as a single character.
        // If it's an array, iterate through it.
        const delimitersArray = Array.isArray(configuredDelimiters) ? configuredDelimiters : [configuredDelimiters];

        for (const delimiterChar of delimitersArray) {
            if (event.which === delimiterChar.charCodeAt(0)) {
                isMatch = true;
                break; // Found a match, no need to check further
            }
        }

        return isMatch;
    };

})(jQuery);