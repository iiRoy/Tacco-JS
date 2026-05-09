(function (jq) {
    // Ensure the DOM is fully loaded before initializing our application components.
    jq(document).ready(function () {
        // Initialize the main application core using the Framework.
        const SurveyApp = Framework.ApplicationCore.create();

        // --- Core Utilities and Helper Functions ---
        SurveyApp.recalibrateDisplayDimensions = function () {
            // Determine the vertical space offset based on whether a multi-line input field is currently visible.
            // This helps adjust the layout dynamically.
            const heightOffset = jq('div.briefing textarea:visible').length > 0 ? 450 : 380; // Slightly altered offsets
            console.log(`[Layout] Adjusting display height with offset: ${heightOffset}`);
            // Apply the calculated height to the main survey questions container.
            jq('div.query-section').css('height', jq(window).height() - heightOffset);
        };

        // --- Data Models ---
        // Defines the structure and behavior for a Questionnaire entity.
        SurveyApp.Questionnaire = Framework.BaseEntity.extend({
            uniqueIdentifier: '', // Unique ID for the questionnaire.
            designation: '',      // The primary title or name.
            summaryText: '',      // A brief description.
            identifierPath: '',   // A URL-friendly segment for permalinks.
            queryItems: [],       // Collection of questions/inquiries.

            // Computed property to generate a public-facing URL for the questionnaire.
            generatePermalink: Framework.computed('identifierPath', function () {
                const urlSegment = this.get('identifierPath');
                if (!urlSegment || typeof apiEndpointPrefix === 'undefined') {
                    console.warn('[Model] Cannot generate permalink: missing identifierPath or apiEndpointPrefix.');
                    return null;
                }
                // Using template literals for cleaner string construction.
                return `${apiEndpointPrefix}/${urlSegment}`;
            }),

            // Computed property to generate a URL specifically for the summary view.
            composeSummaryLink: Framework.computed('identifierPath', function () {
                const urlSegment = this.get('identifierPath');
                if (!urlSegment || typeof apiEndpointPrefix === 'undefined') {
                    console.warn('[Model] Cannot compose summary link: missing identifierPath or apiEndpointPrefix.');
                    return null;
                }
                return `${apiEndpointPrefix}/summary-view/${urlSegment}`; // Changed 'summary' to 'summary-view'
            }),

            // Computed property providing a value for sorting questionnaires, typically their designation.
            comparisonKey: Framework.computed('designation', function () {
                return this.get('designation');
            })
        });

        // --- Enumeration/Registry for Question Types ---
        // Using an object for better semantic lookup instead of an array index.
        SurveyApp.QueryKindRegistry = {
            TEXT_INPUT: 'Text',
            BOOLEAN_CHOICE: 'Boolean',
            SCALED_RATING: 'Scale'
        };
        // Adding a utility to get the string value from a numerical index (for legacy JSON compatibility)
        SurveyApp.getQueryKindByIndex = function(index) {
            const types = [this.QueryKindRegistry.TEXT_INPUT, this.QueryKindRegistry.BOOLEAN_CHOICE, this.QueryKindRegistry.SCALED_RATING];
            return types[index] || this.QueryKindRegistry.TEXT_INPUT; // Default to Text if index is invalid
        };


        // --- Application Controllers ---
        // Manages a collection of Questionnaire objects.
        SurveyApp.questionnaireCollection = Framework.CollectionManager.create({
            managedData: [], // The array holding all questionnaire instances.

            // Incorporates a new questionnaire into the sorted collection.
            incorporateEntry: function (questionnaireEntity) {
                if (!questionnaireEntity || !questionnaireEntity.get('comparisonKey')) {
                    console.error('[Collection] Attempted to add invalid questionnaire.', questionnaireEntity);
                    return;
                }
                const collectionSize = this.get('collectionSize');
                const insertIndex = this.orderedLocate(questionnaireEntity.get('comparisonKey'), 0, collectionSize);
                this.insertAt(insertIndex, questionnaireEntity);
                console.log(`[Collection] Questionnaire "${questionnaireEntity.get('designation')}" incorporated.`);
            },

            // Iterative binary search to find the correct insertion point for a new entry.
            orderedLocate: function (searchVal, lowerBound, upperBound) {
                // Input validation for bounds
                if (lowerBound < 0 || upperBound < lowerBound) {
                    console.error('[Search] Invalid bounds provided for orderedLocate.');
                    return -1; // Indicate error
                }

                let low = lowerBound;
                let high = upperBound;

                while (low < high) {
                    const middleIndex = Math.floor(low + (high - low) / 2);
                    const middleEntryComparisonKey = this.objectAt(middleIndex).get('comparisonKey');

                    if (searchVal > middleEntryComparisonKey) {
                        low = middleIndex + 1;
                    } else if (searchVal < middleEntryComparisonKey) {
                        high = middleIndex;
                    } else {
                        return middleIndex; // Exact match found
                    }
                }
                return low; // Insertion point
            },

            // Discards a specific questionnaire from the collection.
            discardEntry: function (questionnaireEntity) {
                if (!questionnaireEntity) {
                    console.warn('[Collection] Attempted to remove a null or undefined questionnaire.');
                    return;
                }
                this.removeObject(questionnaireEntity);
                console.log(`[Collection] Questionnaire "${questionnaireEntity.get('designation')}" discarded.`);
            },

            // Initiates a new questionnaire with default values and adds it to the collection.
            initiateNewQuestionnaire: function () {
                const tempId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Client-side temporary ID
                const defaultQuestionnaireData = {
                    uniqueIdentifier: tempId,
                    designation: 'Untitled Questionnaire',
                    identifierPath: '',
                    summaryText: 'A fresh questionnaire for your new survey.',
                    queryItems: []
                };
                const newQuestionnaireInstance = SurveyApp.Questionnaire.create(defaultQuestionnaireData);
                this.incorporateEntry(newQuestionnaireInstance);
                console.log('[Collection] New questionnaire initiated with temporary ID:', tempId);
                // Optionally select the newly created questionnaire
                SurveyApp.activeQuestionnaireModel.set('itemData', newQuestionnaireInstance);
            },

            // Handles the deletion of a questionnaire, including AJAX call if persisted.
            eliminateQuestionnaire: function () {
                const targetQuestionnaire = SurveyApp.activeQuestionnaireModel.get('itemData');

                if (!targetQuestionnaire) {
                    console.warn('[Action] No questionnaire selected for deletion.');
                    return;
                }

                const confirmationMessage = `'${targetQuestionnaire.get('designation')}'\n\nAre you absolutely certain you wish to permanently remove this questionnaire?`;
                if (confirm(confirmationMessage)) {
                    this.discardEntry(targetQuestionnaire);
                    SurveyApp.activeQuestionnaireModel.set('itemData', null); // Deselect after deletion

                    const questionnaireId = targetQuestionnaire.get('uniqueIdentifier');
                    if (questionnaireId && !questionnaireId.startsWith('new-')) { // Only attempt AJAX if it's a persisted entity
                        jq.ajax({
                            url: `${apiEndpointPrefix}/questionnaires/${questionnaireId}`,
                            type: 'DELETE',
                            success: function (serverReply) {
                                console.log('[AJAX] Questionnaire deletion successful for ID:', questionnaireId);
                                // No specific UI update needed here as it's already removed client-side.
                            },
                            error: SurveyApp._handleAjaxError // Reusing a common error handler
                        });
                    } else {
                        console.info('[Action] Client-side questionnaire deleted; no server interaction needed (temporary ID).');
                    }
                }
            },

            // Retrieves all questionnaires from the server via AJAX.
            retrieveAllQuestionnaires: function () {
                const instanceRef = this;
                jq.ajax({
                    url: `${apiEndpointPrefix}/questionnaires`, // Changed endpoint
                    method: 'GET', // Explicitly setting method
                    dataType: 'json', // Expect JSON response
                    success: function (receivedPayload) {
                        if (!receivedPayload || !Array.isArray(receivedPayload)) {
                            console.error('[AJAX] Received payload for questionnaires is invalid or empty.');
                            return;
                        }
                        console.log(`[AJAX] Successfully retrieved ${receivedPayload.length} questionnaires.`);
                        // Using arrow function for cleaner `this` context.
                        const processedQuestionnaires = receivedPayload.map(payloadItem => {
                            return instanceRef.constructQuestionnaireFromPayload(payloadItem);
                        });
                        // Clear existing content and then add the processed ones to avoid duplicates on reload
                        instanceRef.set('managedData', []);
                        processedQuestionnaires.forEach(q => instanceRef.incorporateEntry(q));
                    },
                    error: SurveyApp._handleAjaxError
                });
            },

            // Constructs a Questionnaire instance from a raw JSON payload, mapping question types.
            constructQuestionnaireFromPayload: function (inputJson) {
                if (!inputJson || typeof inputJson !== 'object') {
                    console.error('[Parser] Invalid JSON payload provided for questionnaire construction.', inputJson);
                    return null;
                }

                // Transform question data to a more consistent format for the Ember model.
                const transformedQueryItems = inputJson.Questions ? inputJson.Questions.map((queryItem, sequenceNum) => {
                    const queryKind = SurveyApp.getQueryKindByIndex(queryItem.Type);
                    return {
                        itemId: queryItem.Id, // Renamed ID to itemId
                        querySynopsis: queryItem.Description, // Renamed description
                        queryCategory: queryKind, // Using registry for type
                        sequenceOrder: queryItem.Index // Renamed index
                    };
                }) : [];

                const questionnaireData = {
                    uniqueIdentifier: inputJson.Id,
                    designation: inputJson.Name,
                    summaryText: inputJson.Description,
                    identifierPath: inputJson.Slug,
                    queryItems: transformedQueryItems
                };

                const newQuestionnaire = SurveyApp.Questionnaire.create(questionnaireData);
                this.incorporateEntry(newQuestionnaire); // Add to collection immediately
                console.log(`[Parser] Questionnaire "${newQuestionnaire.get('designation')}" constructed from payload.`);
                return newQuestionnaire;
            },

            // Persists the current state of a questionnaire to the backend (create or update).
            persistQuestionnaireState: function (questionnaireToSave) {
                let activeQuestionnaire = questionnaireToSave;
                if (!activeQuestionnaire) {
                    activeQuestionnaire = SurveyApp.activeQuestionnaireModel.get('itemData');
                }

                if (!activeQuestionnaire) {
                    console.warn('[Action] No questionnaire specified or selected for saving.');
                    alert('No active questionnaire to save. Please select or create one.');
                    return;
                }

                const questionnaireDesignation = activeQuestionnaire.get('designation');
                if (!questionnaireDesignation || questionnaireDesignation.trim().length === 0) {
                    alert('Questionnaire designation cannot be empty. Please provide a title before saving changes.');
                    return;
                }

                const currentId = activeQuestionnaire.get('uniqueIdentifier');
                const isNewEntity = !currentId || currentId.startsWith('new-'); // Check for temp ID or absence

                // Prepare content for AJAX request
                const payloadContent = {
                    Id: isNewEntity ? null : currentId, // Send null for new entities
                    Name: questionnaireDesignation,
                    Description: activeQuestionnaire.get('summaryText'),
                    Questions: activeQuestionnaire.get('queryItems').map(item => ({ // Transform back to server format
                        Id: item.itemId,
                        Description: item.querySynopsis,
                        Type: Object.values(SurveyApp.QueryKindRegistry).indexOf(item.queryCategory), // Map category back to index
                        Index: item.sequenceOrder
                    }))
                };

                jq.ajax({
                    url: `${apiEndpointPrefix}/questionnaires/${isNewEntity ? '' : currentId}`,
                    type: isNewEntity ? 'POST' : 'PUT',
                    data: JSON.stringify(payloadContent), // Send as JSON string
                    contentType: 'application/json', // Specify content type
                    success: function (serverReply) {
                        if (isNewEntity) {
                            activeQuestionnaire.set('uniqueIdentifier', serverReply.Id);
                            console.log(`[AJAX] New questionnaire saved, assigned ID: ${serverReply.Id}`);
                        }
                        activeQuestionnaire.set('identifierPath', serverReply.Slug);

                        // Update questions from server response
                        const updatedQueryItems = serverReply.Questions.map(queryItem => ({
                            itemId: queryItem.Id,
                            querySynopsis: queryItem.Description,
                            queryCategory: SurveyApp.getQueryKindByIndex(queryItem.Type),
                            sequenceOrder: queryItem.Index
                        }));
                        activeQuestionnaire.set('queryItems', updatedQueryItems);
                        console.log(`[AJAX] Questionnaire "${activeQuestionnaire.get('designation')}" state updated from server.`);
                    },
                    error: SurveyApp._handleAjaxError
                });
            }
        });

        // Common AJAX error handler
        SurveyApp._handleAjaxError = function (xhrObject, statusInfo, errorDetails) {
            console.error('[AJAX Error]', statusInfo, errorDetails, xhrObject);
            alert(`An unexpected network error occurred: ${xhrObject.statusText || errorDetails}`);
        };


        // Initial data load upon application startup.
        SurveyApp.questionnaireCollection.retrieveAllQuestionnaires();

        // --- Active Selection Management ---
        // Controller to hold the currently selected questionnaire.
        SurveyApp.activeQuestionnaireModel = Framework.BaseEntity.create({
            itemData: null // Holds the currently selected questionnaire object.
        });

        // --- User Interface Components (Views) ---

        // Component for deleting individual questions within a questionnaire.
        SurveyApp.InquiryRemovalComponent = Framework.View.extend({
            classNames: ['remove-inquiry-control'], // Renamed class
            attributeBindings: ['title'], // Added a title attribute for tooltip
            title: 'Click to remove this question',

            // Handles both mouse clicks and touch events for deletion.
            actionTriggered: function () {
                const confirmationMsg = 'Are you certain you wish to eliminate this inquiry? This action cannot be undone.';
                if (confirm(confirmationMsg)) {
                    const targetInquiry = this.get('itemData'); // Renamed content to itemData
                    const parentQuestionnaire = this.getPath('contentView.itemData'); // Renamed contentView.content
                    if (parentQuestionnaire && targetInquiry) {
                        parentQuestionnaire.get('queryItems').removeObject(targetInquiry);
                        SurveyApp.questionnaireCollection.persistQuestionnaireState(parentQuestionnaire);
                        console.log(`[UI] Inquiry "${targetInquiry.querySynopsis}" removed.`);
                    } else {
                        console.warn('[UI] Could not remove inquiry: parent or inquiry not found.');
                    }
                }
            },

            click: function () {
                this.actionTriggered();
            },

            // Keep touchEnd for explicit touch device support, calling the same action.
            touchEnd: function () {
                this.actionTriggered();
            }
        });

        // Generic component for in-place editing of text fields.
        SurveyApp.InlineEditorControl = Framework.View.extend({
            tagName: 'span',
            templateName: this.templateName ? this.templateName : 'inline-edit-template', // Renamed template
            isMultiLine: false, // Renamed isMultiline
            isMandatory: true, // Renamed required to isMandatory
            priorValueSnapshot: '', // Renamed previousValue
            currentInput: '', // Renamed value
            inEditMode: false, // Renamed isEditing

            // Determines if the current input value is valid based on mandatory status.
            isInputValid: Framework.computed('currentInput', 'isMandatory', function () {
                const inputVal = this.get('currentInput');
                const mandatory = this.get('isMandatory');
                return (!mandatory || (inputVal && inputVal.trim().length > 0));
            }),

            // Initiates edit mode on double click.
            doubleClick: function () {
                if (this.get('inEditMode')) return false; // Prevent re-editing

                this.set('priorValueSnapshot', this.get('currentInput'));
                this.set('inEditMode', true);
                SurveyApp.recalibrateDisplayDimensions(); // Adjust layout when an editor becomes active
                console.log('[UI] Inline editor activated.');
                return false; // Prevent default browser double-click behavior
            },

            // Handles touch events, specifically looking for a double-tap gesture.
            touchEnd: function () {
                const currentTouchTimestamp = new Date().getTime();
                const lastTouch = this._previousTouchTimestamp;

                if (lastTouch && (currentTouchTimestamp - lastTouch < 300)) { // 300ms for double-tap
                    this.doubleClick();
                    this._previousTouchTimestamp = null; // Reset for next sequence
                } else {
                    this._previousTouchTimestamp = currentTouchTimestamp;
                }

                return false; // Prevent default touch actions (like zooming)
            },

            // Exits edit mode when focus is lost, applying validation.
            focusOut: function () {
                if (!this.get('isInputValid')) {
                    this.set('currentInput', this.get('priorValueSnapshot')); // Revert to previous valid value
                    alert('Invalid input: field cannot be empty. Reverting changes.');
                } else {
                    SurveyApp.questionnaireCollection.persistQuestionnaireState(); // Save changes
                }
                this.set('inEditMode', false);
                console.log('[UI] Inline editor deactivated on focus out.');
            },

            // Handles keyboard events for committing or cancelling edits.
            keyUp: function (eventObject) {
                const isValid = this.get('isInputValid');
                const inputElement = this.$('input:first, textarea:first'); // Target either input or textarea

                if (isValid) {
                    inputElement.removeClass('input-validation-error');
                }

                if (eventObject.keyCode === 13) { // Enter key
                    if (!isValid) {
                        inputElement.addClass('input-validation-error').focus();
                        alert('Input is required before saving.');
                    } else {
                        this.set('inEditMode', false);
                        SurveyApp.questionnaireCollection.persistQuestionnaireState();
                        console.log('[UI] Inline editor changes saved via Enter key.');
                    }
                } else if (eventObject.keyCode === 27) { // Escape key
                    this.set('currentInput', this.get('priorValueSnapshot'));
                    this.set('inEditMode', false);
                    console.log('[UI] Inline editor changes cancelled via Escape key.');
                }
                // Other keys are handled by Ember's value binding.
            }
        });

        // Specialized input widgets for better control.
        SurveyApp.DropdownSelectorWidget = Framework.Select.extend({
            didInsertElement: function () {
                this.$().focus();
                console.log('[UI] Dropdown selector focused.');
            }
        });

        SurveyApp.SingleLineInputWidget = Framework.TextField.extend({
            didInsertElement: function () {
                this.$().focus();
                console.log('[UI] Single line input focused.');
            }
        });

        SurveyApp.MultiLineInputWidget = Framework.TextArea.extend({
            didInsertElement: function () {
                SurveyApp.recalibrateDisplayDimensions(); // Adjust layout for textarea
                this.$().focus();
                console.log('[UI] Multi-line input focused.');
            }
        });

        // --- Handlebars Template Helpers ---

        // Helper to integrate the InlineEditorControl into templates.
        Framework.Handlebars.registerHelper('inlineEditHelper', function (propertyPath, helperOptions) {
            helperOptions.hash.currentInputBinding = propertyPath; // Bind to currentInput
            return Framework.Handlebars.helpers.view.call(this, SurveyApp.InlineEditorControl, helperOptions);
        });

        // Helper for creating action buttons.
        Framework.Handlebars.registerHelper('actionButtonHelper', function (helperOptions) {
            const optionHash = helperOptions.hash;

            if (!optionHash.targetAction) { // Renamed target to targetAction
                optionHash.targetAction = "SurveyApp.questionnaireCollection"; // Default target
            }

            return Framework.Handlebars.helpers.view.call(this, Framework.Button, helperOptions);
        });

        // View for displaying a single questionnaire in a list, handling selection.
        SurveyApp.QuestionnaireListItem = Framework.View.extend({
            classNameBindings: ['isActiveEntry'], // Renamed isSelected to isActiveEntry

            click: function (eventItem) {
                const currentQuestionnaire = this.get('itemData'); // Renamed content
                if (!currentQuestionnaire) {
                    console.warn('[UI] Attempted to select null questionnaire item.');
                    return;
                }
                jq('.additional-info').hide(); // Renamed .more to .additional-info
                jq('li.additional-info', eventItem.currentTarget).show();
                SurveyApp.activeQuestionnaireModel.set('itemData', currentQuestionnaire);
                console.log(`[UI] Questionnaire "${currentQuestionnaire.get('designation')}" selected.`);
            },

            // Explicitly handle touch events for selection.
            touchEnd: function () {
                this.click();
            },

            // Computed property to determine if this item is the currently selected one.
            isActiveEntry: Framework.computed('SurveyApp.activeQuestionnaireModel.itemData', function () {
                const currentlySelectedEntity = SurveyApp.activeQuestionnaireModel.get('itemData');
                const itemEntry = this.get('itemData');
                return itemEntry === currentlySelectedEntity;
            })
        });

        // View for displaying and managing the detailed information of a questionnaire.
        SurveyApp.QuestionnaireDetailPanel = Framework.View.extend({
            itemDataBinding: 'SurveyApp.activeQuestionnaireModel.itemData', // Renamed contentBinding
            classNames: ['questionnaire-details-panel'], // Renamed class

            // Adds a new default inquiry to the current questionnaire.
            addInquiry: function () {
                const currentQueryItems = this.getPath('itemData.queryItems');
                if (!currentQueryItems) {
                    console.error('[UI] Cannot add inquiry: questionnaire queryItems array is null.');
                    return;
                }
                const nextSequence = currentQueryItems.get('length') + 1;
                const newInquiry = {
                    itemId: `temp-inq-${Date.now()}`, // Client-side temporary ID for new inquiry
                    querySynopsis: 'New Inquiry Text',
                    queryCategory: SurveyApp.QueryKindRegistry.TEXT_INPUT, // Default to text input
                    sequenceOrder: nextSequence
                };
                currentQueryItems.pushObject(newInquiry);
                console.log('[UI] New inquiry added to questionnaire.');
                // Automatically save after adding a new inquiry
                SurveyApp.questionnaireCollection.persistQuestionnaireState();
            },

            // Called when the element is inserted into the DOM.
            didInsertElement: function () {
                SurveyApp.recalibrateDisplayDimensions();
                console.log('[UI] Questionnaire detail panel inserted into DOM.');
            },

            // Observer to ensure question indexes are sequential and sorted whenever queryItems change.
            maintainInquiryOrder: Framework.observer('itemData.queryItems.[]', function () { // Changed observer path
                const currentQueryItems = this.get('itemData.queryItems');
                if (!currentQueryItems || currentQueryItems.get('length') === 0) {
                    return; // Nothing to sort or re-index
                }

                // Sort items by their current sequence order
                const sortedItems = currentQueryItems.sortBy('sequenceOrder');

                // Re-assign sequential indexes
                sortedItems.forEach((inquiry, idx) => {
                    if (inquiry.sequenceOrder !== (idx + 1)) { // Only update if necessary
                        Framework.set(inquiry, 'sequenceOrder', idx + 1);
                    }
                });
                console.log('[UI] Inquiry sequence order maintained and re-indexed.');
            })
        });

        // A generic view component for creating clickable links.
        Framework.ActionLinkElement = Framework.View.extend({
            classNames: ['interactive-link'], // Renamed class
            tagName: 'a',
            href: '#', // Default href
            target: '_self', // Default target
            linkText: '', // Renamed value to linkText
            attributeBindings: ['href', 'target', 'linkText:value'] // Bind linkText to value attribute for clarity
        });

        // --- Event Listeners ---
        // Adjust layout whenever the browser window is resized.
        jq(window).resize(function (eventObject) {
            console.log('[Event] Window resized, recalibrating display.');
            SurveyApp.recalibrateDisplayDimensions();
        });
    });
})(jQuery); // Using 'jQuery' as the global object for consistency.