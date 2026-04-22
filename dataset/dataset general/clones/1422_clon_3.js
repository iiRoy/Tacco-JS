(function($){
    // Internal configuration and utilities for the inline editing module.
    const _moduleConfig = {
        defaultSettings: {
            onSaveSuccess: function(){},
            onRemovalSuccess: function(){},
            getItemIdentifier: parseDataIdAttribute, // Renamed from getId
            getValueFromElement: ($elem) => $elem.html(), // Renamed from filterElementValue
            useVisualTransitions: true, // Renamed from animate
            statusColors: { // Renamed from colors
                success: 'green',
                failure: 'red'
            },
            // New setting for timeout to revert status colors
            statusColorRevertDelay: 5000 
        },
        // CSS class names used by the module.
        classNames: {
            singleLineEditor: 'inline-text-editor', // Renamed from editableSingle
            multiLineEditor: 'inline-area-editor', // Renamed from editableMulti
            activeEditState: 'is-editing-active', // Renamed from isEditing
            inputWrapper: 'editor-input-wrapper', // Renamed from editFieldWrapper
            editorInput: 'edit-content-input', // Renamed from editField
            primaryInput: 'first-edit-instance', // Renamed from editFieldFirst
            controlPanel: 'editor-action-panel', // Renamed from editFieldSaveControllers
            cancelButton: 'action-cancel-edit', // Renamed from editFieldCancel
            removeButton: 'action-remove-item' // Renamed from editFieldRemove
        },
        dataAttributes: {
            originalContent: 'data-original-content', // New: storing initial value on element
            itemId: 'data-item-id', // New: storing item ID on element
            fieldType: 'data-field-type' // New: storing field type (single/multi)
        }
    };

    // Main entry point for activating inline editing.
    $.enableDirectEdit = function(apiEndpoints, userSettings){ // Renamed from $.inlineEdit, urls to apiEndpoints
        
        const currentEndpoints = apiEndpoints;
        const settings = jQuery.extend(true, {}, _moduleConfig.defaultSettings, userSettings); // Deep extend for nested objects

        let activeEditorsCount = 0; // Renamed from editableFields
        let interactionFromLink = false; // Renamed from linkClicked

        // Determine if the container is a simple tag (not a table cell)
        let isNonTableCellContainer = false;
        const allEditableElements = $(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`);
        if (allEditableElements.length > 0) {
            isNonTableCellContainer = allEditableElements.eq(0)[0].tagName.toLowerCase() !== 'td';
            // Dynamically set standard color if not already defined in settings
            if (!settings.statusColors.standard) {
                settings.statusColors.standard = allEditableElements.eq(0).css('color');
            }
        }

        // Helper to get element metadata (ID, type, URL)
        const getElementMetadata = ($elem) => {
            const recordId = settings.getItemIdentifier($elem);
            let fieldType, requestUrl;
            
            // Iterate over endpoint keys to find matching class
            for (const key in currentEndpoints) {
                if ($elem.hasClass(key)) {
                    fieldType = key;
                    requestUrl = currentEndpoints[key];
                    break;
                }
            }
            return { recordId, fieldType, requestUrl };
        };

        // Stores the original content of an element in a data attribute.
        const cacheOriginalContent = ($elem) => {
            if (!$elem.data(_moduleConfig.dataAttributes.originalContent)) { // Check if already cached
                $elem.data(_moduleConfig.dataAttributes.originalContent, $elem.html());
            }
        };

        // Retrieves the original content from an element's data attribute.
        const retrieveCachedContent = ($elem) => {
            return $elem.data(_moduleConfig.dataAttributes.originalContent);
        };

        // Utility to parse data-item-id attribute or fall back to class parsing (original logic)
        function parseDataIdAttribute($elem) {
            let id = $elem.data(_moduleConfig.dataAttributes.itemId);
            if (id) return id; // Prefer data attribute if available

            // Fallback to original class parsing if data attribute not present
            const classList = $elem.attr('class').split(/\s+/); // Split by any whitespace
            for (const className of classList) {
                const match = className.match(/^id([0-9]+)$/);
                if (match && match[1]) {
                    id = match[1];
                    // Cache it for future calls if found via class
                    $elem.data(_moduleConfig.dataAttributes.itemId, id); 
                    return id;
                }
            }
            return null; // No ID found
        }

        // Handles the click event to activate an editor for an element.
        const activateEditor = function($targetElement) {
            if (interactionFromLink) {
                interactionFromLink = false;
                return;
            }
            
            // Only activate if no editors are open, or if this is part of a multi-field edit session
            // and we haven't reached the max number of fields for this session.
            const currentlyActiveInputs = $(`.${_moduleConfig.classNames.editorInput}`).length;
            if (activeEditorsCount === 0 || currentlyActiveInputs < activeEditorsCount) {
                
                cacheOriginalContent($targetElement); // Store original content
                $targetElement.addClass(_moduleConfig.classNames.activeEditState)
                              .css('color', settings.statusColors.standard)
                              .stop(true, true); // Stop any current animations
                
                const currentContent = settings.getValueFromElement($targetElement);
                const isFirstEditor = currentlyActiveInputs === 0;
                const fieldType = $targetElement.hasClass(_moduleConfig.classNames.singleLineEditor) ? 'single' : 'multi';
                
                let inputElement;
                if (fieldType === 'single') {
                    inputElement = `<input type="text" value="${currentContent}" class="${_moduleConfig.classNames.editorInput}" />`;
                } else {
                    inputElement = `<textarea class="${_moduleConfig.classNames.editorInput}">${currentContent}</textarea>`;
                }

                if (isFirstEditor) {
                    activeEditorsCount = $targetElement.siblings(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`).length + 1;
                    $targetElement.html(`<div class="${_moduleConfig.classNames.inputWrapper}">${inputElement.replace(`class="${_moduleConfig.classNames.editorInput}"`, `class="${_moduleConfig.classNames.editorInput} ${_moduleConfig.classNames.primaryInput}"`)}</div>`);
                    
                    if (!isNonTableCellContainer && fieldType === 'single') { // Only auto-activate siblings for table cells
                        $targetElement.siblings(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`).each(function() {
                            activateEditor($(this)); // Recursively activate siblings
                        });
                    } else if (isNonTableCellContainer) {
                        activeEditorsCount = 1; // For simple containers, only one field at a time
                    }
                    
                    injectControlPanel(() => {
                        $(`.${_moduleConfig.classNames.primaryInput}`).focus();
                    });
                } else {
                    $targetElement.html(`<div class="${_moduleConfig.classNames.inputWrapper}">${inputElement}</div>`);
                }
            }
        };

        // Attach click handlers to activate editors.
        $(`.${_moduleConfig.classNames.singleLineEditor}`).on('click', function() { activateEditor($(this)); });
        $(`.${_moduleConfig.classNames.multiLineEditor}`).on('click', function() { activateEditor($(this)); });

        // Prevent editor activation when clicking on links within editable elements.
        $(`.${_moduleConfig.classNames.singleLineEditor} a, .${_moduleConfig.classNames.multiLineEditor} a`).on('click', function(event) {
            interactionFromLink = true;
            event.stopPropagation(); // Prevent the parent element's click handler from firing
        });

        // Injects save/cancel/remove controls into the first editor's wrapper.
        const injectControlPanel = (onPanelReady) => {
            const $targetWrapper = $(`.${_moduleConfig.classNames.inputWrapper}:last`);
            const $parentContainer = $targetWrapper.parent();
            
            let controlMarkup = `<div class="${_moduleConfig.classNames.controlPanel}">
                                    <button class="save-action-btn">Save Changes</button>`;
            
            // Check if the parent container explicitly allows removal.
            if ($parentContainer.hasClass('removable-item')) { // New class name for removable items
                controlMarkup += `, <a href="javascript:;" class="${_moduleConfig.classNames.removeButton}">Delete Item</a> or `;
            } else {
                controlMarkup += ` or `;
            }
            controlMarkup += `<a href="javascript:;" class="${_moduleConfig.classNames.cancelButton}">Cancel</a></div>`;
            
            $targetWrapper.append(controlMarkup);

            // Attach event handlers for the control buttons.
            $targetWrapper.find('.save-action-btn').on('click', submitEditedContent);
            $targetWrapper.find(`.${_moduleConfig.classNames.cancelButton}`).on('click', revertChanges);
            $targetWrapper.find(`.${_moduleConfig.classNames.removeButton}`).on('click', performDeletion);

            // Keyboard shortcuts for the primary input field.
            $(`.${_moduleConfig.classNames.primaryInput}`).on('keydown', function(event) {
                if (event.key === 'Enter' && $(this).is('input')) { // Only for single-line inputs
                    event.preventDefault(); // Prevent default form submission
                    submitEditedContent();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    revertChanges();
                }
            });
            
            // Animate panel visibility.
            if (settings.useVisualTransitions) {
                $targetWrapper.slideDown(500, onPanelReady);
            } else {
                $targetWrapper.show();
                onPanelReady();
            }
        };
        
        // Disables all editor inputs and control buttons during AJAX operations.
        const disableEditorControls = (message = 'Processing...') => {
            const $inputs = $(`.${_moduleConfig.classNames.editorInput}`);
            const $buttons = $(`.${_moduleConfig.classNames.controlPanel} button, .${_moduleConfig.classNames.controlPanel} a`);
            
            $inputs.prop('disabled', true);
            $buttons.prop('disabled', true).addClass('disabled-state');

            // Optionally update button text to indicate processing
            $buttons.filter('.save-action-btn').text(message);
        };

        // Reverts all active editors to their original content and state.
        const revertChanges = (eventObj) => {
            interactionFromLink = typeof(eventObj) !== 'undefined'; // If eventObj is defined, it's a click.
            
            $(`.${_moduleConfig.classNames.editorInput}`).each(function(){
                const $parentEditable = $(this).parents(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`);
                const originalContent = retrieveCachedContent($parentEditable);
                restoreElementContent($parentEditable, originalContent, false); // No animation for color change
            });
            activeEditorsCount = 0; // Reset active count
        };
        
        // Initiates the deletion process for the currently edited item.
        const performDeletion = () => {
            interactionFromLink = true; // Mark as link interaction
            
            if (!confirm('Are you absolutely sure you wish to permanently remove this item?')) {
                return false;
            }
            
            disableEditorControls('Deleting...');
            
            const $primaryElement = $(`.${_moduleConfig.classNames.primaryInput}`).parents(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`);
            const { recordId, requestUrl } = getElementMetadata($primaryElement);
            const deleteEndpoint = currentEndpoints.remove || requestUrl; // Use specific 'remove' endpoint if provided, else current field's URL

            if (!deleteEndpoint || !recordId) {
                console.error("Deletion failed: Missing endpoint or record ID.");
                revertChanges();
                return;
            }
            
            $.ajax({
                url: deleteEndpoint + recordId,
                type: 'POST', // Using POST for state-changing operations
                success: function(responseStatus){
                    const isSuccess = responseStatus == 1; // Assuming '1' indicates success
                    $(`.${_moduleConfig.classNames.editorInput}`).each(function(){
                        const $currentElement = $(this).parents(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`);
                        const originalValue = retrieveCachedContent($currentElement);
                        
                        if (isSuccess) {
                            if (settings.useVisualTransitions) {
                                $currentElement.slideUp(500, function(){
                                    $(this).remove();
                                });
                            } else {
                                $currentElement.remove();
                            }
                        } else {
                            restoreElementContent($currentElement, originalValue, false, settings.statusColors.failure);
                        }
                    });
                    
                    settings.onRemovalSuccess({
                        success: isSuccess,
                        itemId: recordId
                    });
                    activeEditorsCount = 0; // Reset active count
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.error("Deletion AJAX error:", textStatus, errorThrown);
                    $(`.${_moduleConfig.classNames.editorInput}`).each(function(){
                        const $currentElement = $(this).parents(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`);
                        const originalValue = retrieveCachedContent($currentElement);
                        restoreElementContent($currentElement, originalValue, false, settings.statusColors.failure);
                    });
                    settings.onRemovalSuccess({
                        success: false,
                        itemId: recordId,
                        error: errorThrown
                    });
                    activeEditorsCount = 0; // Reset active count
                }
            });
        };
        
        // Restores an element to its non-editing state, updating its content and optionally animating color.
        const restoreElementContent = ($element, contentToDisplay, animateColorChange, statusColor) => {
            const completionHandler = () => {
                $element.html(contentToDisplay)
                        .removeClass(_moduleConfig.classNames.activeEditState);
                
                if (animateColorChange) {
                    $element.css('color', statusColor);
                    // Revert to standard color after a delay
                    setTimeout(() => {
                        $element.css('color', settings.statusColors.standard);
                    }, settings.statusColorRevertDelay);
                } else if (statusColor) {
                    $element.css('color', statusColor);
                }
                $element.removeData(_moduleConfig.dataAttributes.originalContent); // Clear cached content
            };
            
            if (settings.useVisualTransitions) {
                $element.children(`.${_moduleConfig.classNames.inputWrapper}`).slideUp(500, completionHandler);
            } else {
                $element.children(`.${_moduleConfig.classNames.inputWrapper}`).hide();
                completionHandler();
            }
            if ($(`.${_moduleConfig.classNames.editorInput}`).length === 0) {
                activeEditorsCount = 0; // Ensure count is reset if all fields are restored
            }
        };
        
        // Submits the edited content via AJAX.
        const submitEditedContent = () => {
            disableEditorControls('Saving...');
            
            // Collect all changes from active editors
            const changes = [];
            $(`.${_moduleConfig.classNames.editorInput}`).each(function(){
                const $currentInput = $(this);
                const $parentEditable = $currentInput.parents(`.${_moduleConfig.classNames.singleLineEditor}, .${_moduleConfig.classNames.multiLineEditor}`);
                const { recordId, fieldType, requestUrl } = getElementMetadata($parentEditable);
                const newValue = $currentInput.val();
                
                if (recordId && fieldType && requestUrl) {
                    changes.push({ $element: $parentEditable, recordId, fieldType, requestUrl, newValue });
                } else {
                    console.warn("Skipping save for element due to missing metadata:", $parentEditable);
                    restoreElementContent($parentEditable, retrieveCachedContent($parentEditable), false, settings.statusColors.failure);
                }
            });

            // Process changes one by one or in parallel (original code implies sequential or parallel independent updates)
            // Let's keep it similar to original: each field triggers its own AJAX.
            changes.forEach(({ $element, recordId, fieldType, requestUrl, newValue }) => {
                $.ajax({
                    url: requestUrl + recordId,
                    data: { editorValue: newValue }, // Renamed 'data' to 'editorValue'
                    type: 'POST',
                    success: function(responseStatus){
                        const isSuccess = responseStatus == 1;
                        if (isSuccess) {
                            restoreElementContent($element, newValue, true, settings.statusColors.success);
                        } else {
                            restoreElementContent($element, retrieveCachedContent($element), false, settings.statusColors.failure);
                        }
                        
                        settings.onSaveSuccess({
                            success: isSuccess,
                            fieldType: fieldType,
                            itemId: recordId,
                            updatedValue: newValue
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.error("Save AJAX error:", textStatus, errorThrown);
                        restoreElementContent($element, retrieveCachedContent($element), false, settings.statusColors.failure);
                        settings.onSaveSuccess({
                            success: false,
                            fieldType: fieldType,
                            itemId: recordId,
                            updatedValue: newValue,
                            error: errorThrown
                        });
                    },
                    complete: function() {
                        // Check if all AJAX calls are complete before resetting activeEditorsCount
                        // This simple check might not be robust for truly parallel calls.
                        // A counter for pending AJAX calls would be better for perfect sync.
                        if ($(`.${_moduleConfig.classNames.editorInput}`).length === 0) {
                            activeEditorsCount = 0;
                        }
                    }
                });
            });
        };
    };
})(jQuery);