/*
 * This file contains JavaScript code, specifically a Backbone.js application
 * for managing passwords. It is wrapped in a jQuery document ready function.
 *
 * This version includes extensive changes in whitespace and comments to
 * create a Type I clone, while preserving the exact logic and structure.
 */
$(function()
{
    // Define the Backbone Model for a single password entry.
    var Password = Backbone.Model.extend(
        {
            /*
             * Constructor for the Password model.
             * Initializes the masked password state.
             */
            initialize: function()
            {
                this.hidePassword();
            }
            ,

            // Method to reveal the actual password.
            showPassword: function()
            {
                /*
                 * Sets the 'maskedPassword' attribute to the actual 'password' value.
                 * This makes the password visible in the UI.
                 */
                this.set({"maskedPassword": this.get('password')});
            }
            ,

            // Method to conceal the password with asterisks.
            hidePassword: function()
            {
                // Sets the 'maskedPassword' attribute to a generic placeholder.
                this.set({"maskedPassword": '********'});
            }
            ,

            // Custom remove method to handle model destruction with options.
            remove: function(options)
            {
                var mergedOptions = {wait: true}; // Default option: wait for server response.
                $.extend(mergedOptions, options); // Merge provided options.
                this.destroy(mergedOptions);      // Call Backbone's destroy method.
            }
            ,

            /*
             * Validation logic for password attributes.
             * Ensures title and password fields are not empty and URL is valid if provided.
             */
            validate: function(attrs)
            {
                // Check for empty title or password.
                if (attrs.title.length == 0 || attrs.password.length == 0) {
                    return "Please enter a title and a password";
                }

                // If a URL is provided, validate its format.
                if (attrs.url)
                {
                    // Regular expression for basic URL validation.
                    var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
                    if (!re.test(attrs.url))
                    {
                        return "Please enter a valid URL";
                    }
                }
            }
        });

    // This section defines the view component for a single password entry.
    var PasswordView = Backbone.View.extend({
        tagName: 'tr', // Each password entry will be rendered as a table row.
        
        events: {
            "mouseover .password": "showPassword",     // On mouseover, show password.
            "mouseout .password": "hidePassword",      // On mouseout, hide password.
            "click a.edit"       : "editPassword",     // On edit link click, edit password.
            "click a.destroy"    : "remove"            // On destroy link click, remove password.
        },

        /*
         * Handles the edit action for a password.
         * Prevents default link behavior and calls the parent app's edit method.
         */
        editPassword: function(event)
        {
            event.preventDefault();               // Stop default action of the link.
            event.stopImmediatePropagation();     // Prevent other handlers from firing.
            
            // Delegate the editing task to the main application view,
            // passing the current model instance.
            this.options.app.editPassword(this.model);
        },

        /*
         * Handles the removal of a password entry.
         * Confirms deletion with the user before proceeding.
         */
        remove: function(event)
        {
            event.stopImmediatePropagation(); // Ensure this is the only handler for the event.
            event.preventDefault();           // Prevent the default link behavior.
            
            // Confirm deletion with the user.
            if (confirm("Are you sure you want to delete this entry?"))
            {
                // Call the model's remove method, providing an error callback.
                this.model.remove(
                    {
                        error: function(model, response)
                        {
                            if (response.status == 403)
                            {
                                alert("You don't have permission to delete that data");
                            }
                            else
                            {
                                alert("Unable to delete that data");
                            }
                        }
                    }
                );
            }
        }
        ,

        /*
         * Renders the password view using a template.
         * Utilizes ICanHaz.js (ich) for templating.
         */
        render: function ()
        {
            // Populate the element with the compiled template using the model's JSON data.
            $(this.el).html(ich.passwordRowTpl(this.model.toJSON()));
            return this; // Enable chaining.
        }
        ,

        /*
         * Event handler to show the password.
         * Calls the model's showPassword method.
         */
        showPassword: function(event)
        {
            event.stopImmediatePropagation();
            this.model.showPassword();
        }
        ,

        /*
         * Event handler to hide the password.
         * Calls the model's hidePassword method.
         */
        hidePassword: function(event)
        {
            event.stopImmediatePropagation();
            this.model.hidePassword();
        }
    });

    // This defines the Backbone Collection for multiple Password models.
    var PasswordCollection = Backbone.Collection.extend({
        model: Password,                          // Specifies the model type for this collection.
        url: '/api/1.0/passwords/',               // API endpoint for fetching and saving passwords.

        /*
         * Comparator function to maintain the collection's order.
         * Sorts passwords alphabetically by their title.
         */
        comparator: function(obj1, obj2)
        {
            return obj1.get('title').localeCompare(obj2.get('title'));
        }
    });

    /**
     * The PasswordListView is responsible for rendering and managing
     * a list of individual password entries within the application.
     * It extends Backbone.View and manages a collection of Password models.
     * Events handled by this view are specifically for its child DOM nodes.
     */
    var PasswordListView = Backbone.View.extend({
        tagName: 'tbody', // This view will render as a <tbody> element.

        /**
         * Constructor for the PasswordListView.
         * It takes options, particularly a reference to the main application view.
         *
         * @param {object} options - Configuration options, including 'app' reference.
         */
        initialize: function(options)
        {
            // Create a new instance of the PasswordCollection.
            this.passwords = new PasswordCollection();

            // Bind all events from the collection to this view's render method.
            this.passwords.bind('all', this.render, this);
            this.passwords.fetch(); // Fetch existing password data from the server.
        },

        /*
         * Adds a single password model to the list view.
         * Creates a new PasswordView for the model and appends it.
         */
        addOne: function(password)
        {
            // Create a new PasswordView instance for the given password model.
            // Pass a reference to the main application ('app') for inter-view communication.
            var passwordViewInstance = new PasswordView({model: password, app: this.options.app});
            
            // Render the individual password view and append its element to this list view's element.
            this.$el.append(passwordViewInstance.render().el);
            
            return this; // Allow method chaining.
        },

        /*
         * Adds a new password to the collection and persists it to the server.
         *
         * @param {object} password - The password data to be added.
         * @param {object} options  - Additional options for the create operation.
         */
        addNew: function(password, options)
        {
            var mergedOptions = {wait: true}; // Default option: wait for server response.
            $.extend(mergedOptions, options); // Merge provided options.
            
            // Create a new model in the collection and save it to the server.
            this.passwords.create(password, mergedOptions);
            
            return this; // Allow method chaining.
        },

        /*
         * Updates an existing password model in the collection.
         *
         * @param {object} passwordData - The updated data for the password.
         * @param {object} options      - Options for the save operation.
         */
        updatePassword: function(passwordData, options)
        {
            var mergedOptions = {wait: true}; // Default option: wait for server response.
            $.extend(mergedOptions, options); // Merge provided options.
            
            // Retrieve the password model from the collection using its ID.
            var password = this.passwords.get(passwordData.id);
            
            // Proceed only if the password model exists.
            if (_.isObject(password))
            {
                // Iterate through the provided passwordData to update the model attributes.
                for (var key in passwordData)
                {
                    // Skip updating the 'id' attribute as it should not change.
                    if (key != 'id')
                    {
                        password.set(key, passwordData[key]);
                    }
                }

                // Persist the changes to the server.
                password.save({}, mergedOptions);
                this.passwords.sort(); // Re-sort the collection after update.
            }
        },

        /*
         * Renders the entire list of passwords.
         * Clears the current content and re-adds each password view.
         */
        render: function()
        {
            this.$el.html(''); // Clear the current HTML content of this view's element.
            
            // Iterate over each model in the 'passwords' collection and add it to the view.
            this.passwords.each(this.addOne, this);
            
            return this; // Allow method chaining.
        }
    });

    /**
     * The PasswordPanelView serves as the main application view.
     * It binds events to elements within its 'el' (which is '#passwordPanel').
     * This view orchestrates interactions at the application level, including
     * modal handling and overall layout, distinct from the PasswordListView's
     * role of managing the password list itself.
     */
    var PasswordPanelView = Backbone.View.extend({
        el: '#passwordPanel', // The main DOM element for this view.
        events: {
            "click #passwordForm :submit": "handleModal",       // Handle form submission in the modal.
            "keydown #passwordForm": "handleModalOnEnter",      // Submit form on Enter key press.
            "hidden #passwordModal": "prepareForm"              // Reset form when modal is hidden.
        },

        /*
         * Initializes the PasswordPanelView.
         * Creates an instance of PasswordListView, passing itself as the 'app' reference.
         */
        initialize: function()
        {
            this.passwordList = new PasswordListView({app: this});
        },

        /*
         * Displays an error message to the user based on the server response.
         *
         * @param {Backbone.Model} model    - The model involved in the error.
         * @param {object}         response - The server response object.
         */
        displayError: function(model, response)
        {
            var that = this; // Capture 'this' for potential use in nested functions (though not used here).
            
            if (response.status == 403)
            {
                alert("You don't have permission to edit that data");
            }
            else
            {
                alert("Unable to create or edit that data. Please make sure you entered valid data.");
            }
        },

        /*
         * Renders the main application view.
         * Appends the rendered password list to the table within its element.
         */
        render: function()
        {
            this.$el.find('table').append(this.passwordList.render().el);
        },

        /**
         * Facilitates the editing of an existing password.
         * Populates the modal form with the password's data and displays the modal.
         *
         * @param {Password} password - A Password Model instance to be edited.
         */
        editPassword: function(password)
        {
            this.prepareForm(password.toJSON()); // Populate form with existing password data.
            
            // Store the password ID in the modal's data attribute for later retrieval.
            $('#passwordModal').data('passwordId', password.get('id'));
            $('#passwordModal').modal('show');   // Display the modal.
        },

        /**
         * Prepares and resets the password form within the modal.
         * Populates fields with provided data or sets them to defaults.
         *
         * @param {object} [passwordData] - An optional object containing data to pre-fill the form.
         *                                  If not provided, fields will be set to empty defaults.
         */
        prepareForm: function(passwordData)
        {
            passwordData = passwordData || {}; // Ensure passwordData is an object, even if null/undefined.
            
            // Define default values for form fields.
            var data = {
                'title':    '',
                'username': '',
                'password': '',
                'url':      '',
                'notes':    ''
            };

            $.extend(data, passwordData); // Merge provided passwordData into the defaults.

            var form = $('#passwordForm'); // Get a reference to the password form.
            
            // Set values for the form input fields.
            $(form).find('#id_title').val(data.title);
            $(form).find('#id_username').val(data.username);
            $(form).find('#id_password').val(data.password);
            $(form).find('#id_url').val(data.url);
            $(form).find('#id_notes').val(data.notes);

            // Create an array of IDs from the shares data for easier lookup.
            var shares = _.map(data.shares, function(elem)
            {
                return elem.id;
            });

            var value;
            // Iterate over each checkbox in the form to set its checked state.
            $(form).find(':checkbox').each(function()
            {
                value = $(this).attr('value');
                // Check if the checkbox's value is present in the 'shares' array.
                for (var i in shares)
                {
                    if (value == shares[i])
                    {
                        $(this).prop('checked', true); // If found, check the checkbox.
                        return;                        // Move to the next checkbox.
                    }
                }

                // If the value is not in 'shares', uncheck the checkbox.
                $(this).prop('checked', false);
            });

            // Clear any previously stored password ID from the modal's data.
            // This is important when the form is prepared for a new password or after a cancel.
            $('#passwordModal').data('passwordId', '');
        },

        /*
         * Handles the submission of the password modal form.
         * Prevents default form submission and collects data to create/update a password.
         *
         * @param {Event} event - The event object from the form submission.
         */
        handleModal: function(event)
        {
            event.preventDefault();           // Prevent the browser's default form submission.
            event.stopImmediatePropagation(); // Stop other handlers from firing.
            
            var form = $('#passwordForm');    // Get a reference to the form.

            // Collect all form data into a passwordData object.
            var passwordData = {
                title:    $(form).find('#id_title').val(),
                username: $(form).find('#id_username').val(),
                password: $(form).find('#id_password').val(),
                url:      $(form).find('#id_url').val(),
                notes:    $(form).find('#id_notes').val(),
                shares:   $(form).find(':checked').map(function() {
                    return $(this).attr('value');
                }).get()
            };

            // Check if a password ID is stored in the modal's data.
            if ($('#passwordModal').data('passwordId'))
            {
                // If an ID exists, it's an update operation.
                passwordData.id = $('#passwordModal').data('passwordId');
                this.passwordList.updatePassword(passwordData, { error: this.displayError });
            }
            else
            {
                // Otherwise, it's a new password creation.
                this.passwordList.addNew(passwordData, { error: this.displayError });
            }

            // Hide the password modal after processing.
            $('#passwordModal').modal('hide');

            return this; // Enable chaining.
        },

        /*
         * Handles keydown events on the modal form, specifically for the ENTER key.
         * If ENTER is pressed, it triggers the form submission (handleModal).
         *
         * @param {Event} event - The keydown event object.
         */
        handleModalOnEnter: function(event)
        {
            // Check if the pressed key is the ENTER key (keyCode 13).
            if (event.keyCode == 13)
            {
                return this.handleModal(event); // Call the modal handler.
            }
        }
    });

    // Instantiate the main application view.
    var app = new PasswordPanelView();
    app.render(); // Render the initial application view.

    /*
     * Setup jQuery's AJAX global settings to include a CSRF token header
     * for all outgoing AJAX requests. This is common for security in web applications.
     */
    var csrfToken = $('input[name=csrfmiddlewaretoken]').val(); // Get the CSRF token from a hidden input.
    $(document).ajaxSend(function(e, xhr, settings)
    {
        // Set the 'X-CSRFToken' header with the retrieved CSRF token.
        xhr.setRequestHeader('X-CSRFToken', csrfToken);
    });
});
// End of the document ready function.