// Ensure the application code runs only after the DOM is fully loaded.
jQuery(function($) {

    // Blueprint for a single credential entry.
    var CredentialEntry = Backbone.Model.extend({
        // Define default values for a new credential.
        defaults: {
            entryLabel: '',
            secretValue: '',
            username: '',
            accessUrl: '',
            notes: '',
            obscuredSecret: '********' // Initial masked state
        },

        // Custom initializer method.
        initialize: function() {
            // Ensure the secret is hidden on creation.
            this.concealSecret();
        },

        // Makes the actual secret value visible.
        revealSecret: function() {
            const actualSecret = this.get('secretValue');
            this.set({ "obscuredSecret": actualSecret });
        },

        // Hides the secret value.
        concealSecret: function() {
            this.set({ "obscuredSecret": '********' });
        },

        // Handles the deletion of this model instance.
        deleteEntry: function(opts) {
            // Options for server interaction.
            const deletionOptions = Object.assign({ wait: true }, opts);
            this.destroy(deletionOptions);
        },

        // Validates the attributes before saving the model.
        validate: function(incomingAttrs) {
            // Guard clause for missing attributes
            if (!incomingAttrs) {
                return "No attributes provided for validation.";
            }

            // Check for essential fields.
            if (!incomingAttrs.entryLabel || incomingAttrs.entryLabel.trim().length === 0) {
                return "A title for the entry is required.";
            }
            if (!incomingAttrs.secretValue || incomingAttrs.secretValue.trim().length === 0) {
                return "The secret value (password) cannot be empty.";
            }
            // Minimum length for secret value.
            if (incomingAttrs.secretValue.length < 6) {
                return "Secret value must be at least 6 characters long.";
            }

            // Validate URL format if provided.
            if (incomingAttrs.accessUrl && incomingAttrs.accessUrl.trim().length > 0) {
                // A more robust URL regex, allowing optional protocol and common TLDs.
                const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i;
                if (!urlPattern.test(incomingAttrs.accessUrl.trim())) {
                    return "Please provide a valid URL format (e.g., http://example.com).";
                }
            }
            // No issues found.
            return;
        }
    });

    // View for rendering a single credential entry as a table row.
    var CredentialRowView = Backbone.View.extend({
        elementTag: 'tr', // Specifies the HTML element for this view.

        // Event handlers for user interactions within this row.
        events: {
            "mouseenter .secret-field": "handleSecretReveal", // Mouse enters the secret display area.
            "mouseleave .secret-field": "handleSecretConceal", // Mouse leaves the secret display area.
            "click .edit-action": "triggerEditWorkflow", // Click on the edit button.
            "click .delete-action": "triggerDeleteWorkflow" // Click on the delete button.
        },

        // Template function for rendering the row.
        // Assuming 'ich' is a global template engine like ICanHaz.js.
        rowTemplate: ich.credentialRowTpl,

        // Initiates the editing process for this credential.
        triggerEditWorkflow: function(evnt) {
            evnt.preventDefault(); // Prevent default link behavior.
            evnt.stopImmediatePropagation(); // Stop further event propagation.
            // Delegate the edit request to the main application controller.
            this.options.mainAppController.requestEntryEdit(this.model);
        },

        // Prompts for confirmation and then deletes the credential.
        triggerDeleteWorkflow: function(evnt) {
            evnt.stopImmediatePropagation();
            evnt.preventDefault();

            // Helper for deletion confirmation.
            const confirmDeletion = (message) => window.confirm(message);

            if (confirmDeletion("Are you absolutely sure you want to remove this credential entry?")) {
                const currentModel = this.model; // Store reference to model.
                currentModel.deleteEntry({
                    error: function(mdl, xhrResponse) {
                        if (xhrResponse.status === 403) {
                            alert("Permission denied: You cannot delete this record.");
                        } else {
                            alert("Deletion failed: An unexpected error occurred.");
                        }
                    }
                });
            }
        },

        // Renders the credential row using its template.
        renderRow: function() {
            // Populate the element with HTML from the template, using model data.
            this.$el.html(this.rowTemplate(this.model.toJSON()));
            return this; // Enable method chaining.
        },

        // Event handler to show the secret.
        handleSecretReveal: function(evnt) {
            evnt.stopImmediatePropagation();
            this.model.revealSecret();
        },

        // Event handler to hide the secret.
        handleSecretConceal: function(evnt) {
            evnt.stopImmediatePropagation();
            this.model.concealSecret();
        }
    });

    // Manages a collection of credential entries.
    var CredentialRegistry = Backbone.Collection.extend({
        entryModel: CredentialEntry, // Specifies the model for this collection.
        apiEndpoint: '/api/v1/credentials/', // API endpoint for CRUD operations.

        // Sorts entries alphabetically by their label.
        comparator: function(entryA, entryB) {
            const labelA = entryA.get('entryLabel') || '';
            const labelB = entryB.get('entryLabel') || '';
            return labelA.localeCompare(labelB);
        }
    });

    /**
     * Manages the display and interaction for the list of credentials.
     * Renders individual CredentialRowView instances.
     */
    var CredentialListDisplay = Backbone.View.extend({
        containerTag: 'tbody', // The HTML element this view will manage.

        /**
         * Initializes the list view.
         * @param {object} options - Configuration options, including a reference to the parent app.
         */
        initializeList: function(options) {
            // Ensure parent application reference is provided.
            if (!options || !options.parentApp) {
                console.error("CredentialListDisplay requires 'parentApp' option.");
                return; // Early exit if critical option is missing.
            }

            this.credentialItems = new CredentialRegistry(); // Instantiate the collection.

            // Re-render the entire list whenever the collection changes.
            this.credentialItems.on('all', this.refreshDisplay, this);
            // Fetch initial data from the server.
            this.credentialItems.fetch();
        },

        // Adds a single credential model to the view's display.
        addEntryToView: function(credentialModel) {
            const rowView = new CredentialRowView({
                model: credentialModel,
                mainAppController: this.options.parentApp // Pass app reference to child view.
            });
            this.$el.append(rowView.renderRow().el);
        },

        // Creates a new credential entry on the server.
        createEntryOnServer: function(newCredentialData, opts) {
            const creationOptions = Object.assign({ wait: true }, opts);
            this.credentialItems.create(newCredentialData, creationOptions);
        },

        // Updates an existing credential entry on the server.
        updateEntryOnServer: function(updatedCredentialPayload, opts) {
            const updateOptions = Object.assign({ wait: true }, opts);
            const targetCredential = this.credentialItems.get(updatedCredentialPayload.id);

            // Only proceed if the credential exists.
            if (targetCredential instanceof CredentialEntry) {
                // Safely update attributes, excluding the ID.
                const attributesToSet = _.omit(updatedCredentialPayload, 'id');
                targetCredential.set(attributesToSet);

                // Persist changes to the server.
                targetCredential.save({}, updateOptions);
                this.credentialItems.sort(); // Re-sort after update.
            } else {
                console.warn("Attempted to update non-existent credential:", updatedCredentialPayload.id);
            }
        },

        // Clears the current display and re-renders all entries.
        refreshDisplay: function() {
            this.$el.empty(); // Clear existing content.
            this.credentialItems.forEach(this.addEntryToView, this); // Add each item.
            return this;
        }
    });

    /**
     * The main application view, managing the overall layout, form interactions,
     * and coordinating between the list display and modal dialogs.
     */
    var MainApplicationView = Backbone.View.extend({
        mainElementSelector: '#credentialPanel', // Root element for this view.
        // Constants for modal and form selectors.
        MODAL_ID: '#entryModal',
        FORM_ID: '#entryForm',

        // Event delegation for application-level interactions.
        events: {
            "click #entryForm .submit-button": "handleFormSubmission", // Form submission via button.
            "keydown #entryForm": "handleKeyboardInput", // Keyboard input on the form.
            "hidden #entryModal": "resetFormState" // Modal hidden event (Bootstrap).
        },

        // Helper to get the form element.
        _getFormElement: function() {
            return $(this.FORM_ID);
        },

        // Initializes the main application view.
        initAppView: function() {
            this.credentialListManager = new CredentialListDisplay({ parentApp: this });
        },

        // Displays an error message to the user.
        showErrorMessage: function(errorModel, xhrResponse) {
            if (xhrResponse && xhrResponse.status === 403) {
                alert("Authorization error: You lack permission for this action.");
            } else {
                alert("Data operation failed. Please check your input and try again.");
            }
        },

        // Renders the main application structure.
        renderApplication: function() {
            // Append the rendered list manager to the table within the main element.
            this.$el.find('table').append(this.credentialListManager.refreshDisplay().el);
        },

        /**
         * Prepares the modal form for editing an existing credential.
         * @param {CredentialEntry} credentialToEdit - The model instance to edit.
         */
        requestEntryEdit: function(credentialToEdit) {
            // Ensure a valid credential model is provided.
            if (!(credentialToEdit instanceof CredentialEntry)) {
                console.error("Invalid credential model provided for editing.");
                return;
            }
            this.initializeFormFields(credentialToEdit.toJSON());
            // Store the credential's ID on the modal for later retrieval.
            $(this.MODAL_ID).data('credentialIdentifier', credentialToEdit.get('id'));
            $(this.MODAL_ID).modal('show');
        },

        /**
         * Sets up the credential entry form with default or provided values.
         * @param {object} initialData - Optional data to pre-fill the form.
         */
        initializeFormFields: function(initialData) {
            const dataToLoad = Object.assign(
                {
                    entryLabel: '',
                    username: '',
                    secretValue: '',
                    accessUrl: '',
                    notes: '',
                    shares: [] // Default for shared users.
                },
                initialData || {}
            );

            const entryForm = this._getFormElement();
            entryForm.find('#input_title').val(dataToLoad.entryLabel);
            entryForm.find('#input_username').val(dataToLoad.username);
            entryForm.find('#input_secret').val(dataToLoad.secretValue);
            entryForm.find('#input_url').val(dataToLoad.accessUrl);
            entryForm.find('#input_notes').val(dataToLoad.notes);

            // Extract IDs of shared users for easier checking.
            const sharedUserIds = (dataToLoad.shares || []).map(elem => elem.id);

            // Iterate checkboxes and set checked state based on shared users.
            entryForm.find('.share-checkbox').each(function() {
                const checkboxValue = $(this).val();
                $(this).prop('checked', sharedUserIds.includes(parseInt(checkboxValue)));
            });

            // Clear any lingering ID from a previous edit session.
            $(this.MODAL_ID).data('credentialIdentifier', null);
        },

        // Handles the submission of the credential form.
        handleFormSubmission: function(evnt) {
            evnt.preventDefault();
            evnt.stopImmediatePropagation();

            const submissionForm = this._getFormElement();
            // Collect all form data.
            const submittedEntryData = {
                entryLabel: submissionForm.find('#input_title').val(),
                username: submissionForm.find('#input_username').val(),
                secretValue: submissionForm.find('#input_secret').val(),
                accessUrl: submissionForm.find('#input_url').val(),
                notes: submissionForm.find('#input_notes').val(),
                shares: submissionForm.find('.share-checkbox:checked').map(function() {
                    return parseInt($(this).val()); // Convert to integer IDs.
                }).get()
            };

            const currentEntryId = $(this.MODAL_ID).data('credentialIdentifier');

            if (currentEntryId) {
                // If an ID exists, it's an update operation.
                submittedEntryData.id = currentEntryId;
                this.credentialListManager.updateEntryOnServer(submittedEntryData, { error: this.showErrorMessage });
            } else {
                // Otherwise, it's a new entry creation.
                this.credentialListManager.createEntryOnServer(submittedEntryData, { error: this.showErrorMessage });
            }

            // Close the modal dialog.
            $(this.MODAL_ID).modal('hide');
        },

        // Handles keyboard events on the form, specifically 'Enter' key for submission.
        handleKeyboardInput: function(evnt) {
            // If 'Enter' key is pressed, trigger form submission.
            if (evnt.key === 'Enter') {
                this.handleFormSubmission(evnt);
            }
        }
    });

    // Initialize the main application instance.
    var mainAppInstance = new MainApplicationView();
    mainAppInstance.renderApplication();

    // Set up global AJAX configuration for CSRF token.
    const securityToken = $('input[name=csrfmiddlewaretoken]').val();
    if (securityToken) {
        $(document).ajaxSend(function(e, xhr, settings) {
            // Only attach token to non-cross-domain requests.
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader('X-CSRFToken', securityToken);
            }
        });
    } else {
        console.warn("CSRF token not found. AJAX requests might fail.");
    }
});