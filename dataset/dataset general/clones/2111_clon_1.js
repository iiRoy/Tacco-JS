// This is a cloned version of the original JavaScript code.
// Original copyright (c) 2013, Sha Alibhai. All rights reserved.
// This clone extensively modifies whitespace and comments, but preserves
// all identifiers, variable names, function names, operators, and expressions.
// It is logically and structurally identical to the source.

// The document ready function ensures the script runs after the DOM is fully loaded.
$(
    function()
    {
        // Define the main form_builder object, which encapsulates all
        // logic and state for managing the form elements.
        var form_builder =
        {
            // Property to hold a reference to the currently selected form element.
            el: null,

            // Default HTTP method for the generated form.
            method: "POST",

            // Default action URL for the generated form.
            action: "",

            // Delimiter used to separate value from display text in options (e.g., in selects, radios, checkboxes).
            delimeter: '=',

            // Method to set the active element being configured.
            setElement: function(el)
            {
                this.el = el; // Assign the provided element to the 'el' property.
            },

            // Method to retrieve the currently active element.
            getElement: function()
            {
                return this.el; // Return the stored element reference.
            },

            // Utility function to sanitize a string for use as an HTML 'name' attribute.
            cleanName: function(name)
            {
                // Check for undefined or empty name input.
                if (name === undefined || name.length === 0)
                {
                    return ''; // Return empty string if invalid.
                }

                // Perform a series of string manipulations for cleaning.
                return name
                    .trim()                                 // Remove leading/trailing whitespace.
                    .replace(/ /g, '_')                     // Replace all spaces with underscores.
                    .replace(/\W/g, '')                     // Remove all non-word characters (alphanumeric, underscore).
                    .toLowerCase()                          // Convert the entire string to lowercase.
                ;
            }, // End of cleanName helper function.

            // Utility function to clean up HTML content before displaying it as source.
            cleanContent: function(content)
            {
                // Remove various unwanted attributes, classes, and elements.
                return content
                    .replace(/\t/, '')                      // Remove tab characters.
                    .replace(/ ui-draggable| element/gi, '') // Remove UI-specific classes.
                    .replace(/<div class="close">.<\/div>/g, '') // Remove close buttons.
                    .replace(/ data-(.+)="(.+)"/g, '')      // Remove all data-* attributes.
                ;
            }, // End of cleanContent helper function.

            // Updates the source code display area with the current HTML structure of the form.
            updateSource: function()
            {
                // Construct the complete form HTML string.
                var content =   "<form method=\"" + this.method + "\" " +
                                "action=\"" + this.action + "\" " +
                                "class=\"form-horizontal\">\n" +
                                $("#content").html() +      // Get the inner HTML of the form content area.
                                "\n</form>";

                // Set the cleaned content into the source editor.
                source.setValue(this.cleanContent(content));

                // Trigger auto-formatting in the source editor for better readability.
                source.autoFormatRange(
                    { line: 0, ch: 0 },                     // Start from the beginning of the file.
                    { line: source.lastLine() + 1, ch: 0 }  // Format until the end of the file.
                );
            }, // End of updateSource method.

            // Adds a new component (form element) to the main content area.
            addComponent: function(component)
            {
                // Clone the component to avoid moving the original.
                component
                    .clone()                                // Create a duplicate.
                    .removeClass('component')               // Remove the 'component' class.
                    .addClass('element')                    // Add the 'element' class.
                    .removeAttr('id')                       // Remove any ID from the cloned element.
                    .prepend('<div class="close">&times;</div>') // Add a close button to the element.
                    .appendTo("#content")                   // Append the modified clone to the form content area.
                ;

                // Hide the options modal if it's open.
                $("#options_modal").modal('hide');

                // After adding, update the displayed source code.
                this.updateSource();
            }, // End of addComponent method.

            // Loads the appropriate options form into the modal based on the element type.
            loadOptions: function(type)
            {
                var $el = $(this);                          // The element that was clicked, passed as 'this'.
                var $modal = $("#options_modal");           // Reference to the options modal jQuery object.
                var content = $modal.find('.modal-body');   // The body section of the modal where options will load.

                // If no type is provided, cease operation.
                if (! type)
                {
                    return false;
                }

                // Make an AJAX GET request to fetch the options HTML for the given type.
                return $.get(
                    'options/' + type + '.html',            // URL to fetch the options template.
                    function(data)
                    {
                        // If no data is returned, exit.
                        if (data === undefined)
                        {
                            return false;
                        }

                        // Store the type of the element in the modal's data for later use.
                        $modal.data('type', type);

                        // Insert the fetched HTML data into the modal's body.
                        content.html(data);

                        // Set the currently active element in the form_builder.
                        // This allows different option handlers to access the element.
                        form_builder.setElement($el);

                        // Call the type-specific 'get' method to populate the modal fields
                        // with the current element's attributes/values.
                        form_builder[type].get();

                        // Display the options modal to the user.
                        $modal.modal('show');

                        return true; // Indicate success.
                    }
                ); // End of $.get call.
            }, // End of loadOptions method.


            // --- Specific Element Type Handlers ---

            // Handler for 'title' elements (e.g., fieldsets with legends).
            title:
            {
                // Prefix for CSS classes of option fields related to titles.
                prefix: '.options_title_',

                // Retrieves the current title settings from the element.
                get: function()
                {
                    var el = form_builder.getElement();     // Get the currently selected element.
                    var legend = el.find('legend');         // Find the legend tag within the element.

                    // Set the value of the 'name' option field and give it focus.
                    $(this.prefix + 'name')
                        .val(legend.text())                 // Populate with the legend's current text.
                        .focus()                            // Focus the input field.
                    ;
                },

                // Applies the title settings from the modal fields to the element.
                set: function()
                {
                    var el = form_builder.getElement();     // Get the currently selected element.
                    var legend = el.find('legend');         // Find the legend tag.

                    // Update the legend's text content.
                    legend.text($(this.prefix+'name').val());
                }
            }, // End of title handler.


            // Handler for 'text' input elements.
            text: {
                // Prefix for CSS classes of option fields related to text inputs.
                prefix: '.options_text_',

                // Retrieves current text input settings.
                get: function()
                {
                    var el = form_builder.getElement();     // Get the active element.

                    // Populate modal fields with current element data.
                    $(this.prefix + 'name').val('');        // Name field is often cleared for new input.
                    $(this.prefix + 'label').val(el.find('label').text()); // Get label text.
                    $(this.prefix + 'placeholder').val(el.find('input[type=text]').attr('placeholder')); // Get placeholder.
                },

                // Applies text input settings from the modal fields to the element.
                set: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var input = el.find('input[type=text]'); // Find the text input.
                    var label = el.find('label');           // Find the associated label.
                    var name = form_builder.cleanName($(this.prefix + 'name').val()); // Clean the name input.

                    // Set the 'name' attribute of the input.
                    input.attr('name', name);

                    // Update the label text and its 'for' attribute.
                    label.text($(this.prefix + 'label').val()).attr('for', name);

                    // Update the placeholder and 'id' attribute of the input.
                    input.attr('placeholder', $(this.prefix + 'placeholder').val()).attr('id', name);
                }
            }, // End of text handler.


            // Handler for 'textarea' elements.
            textarea: {
                // Prefix for CSS classes of option fields related to textareas.
                prefix: '.options_textarea_',

                // Retrieves current textarea settings.
                get: function()
                {
                    var el = form_builder.getElement();     // Get the active element.

                    // Populate modal fields with current element data.
                    $(this.prefix + 'name').val('');        // Clear name field.
                    $(this.prefix + 'label').val(el.find('label').text()); // Get label text.
                    $(this.prefix + 'placeholder').val(el.find('textarea').attr('placeholder')); // Get placeholder.
                },

                // Applies textarea settings from the modal fields to the element.
                set: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var textarea = el.find('textarea');     // Find the textarea.
                    var label = el.find('label');           // Find the associated label.

                    // Set the 'name' attribute for the textarea.
                    textarea.attr('name', form_builder.cleanName($(this.prefix + 'name').val()));
                    // Update the label's text.
                    label.text($(this.prefix + 'label').val());
                    // Set the 'placeholder' attribute for the textarea.
                    textarea.attr('placeholder', $(this.prefix + 'placeholder').val());
                }
            }, // End of textarea handler.


            // Handler for 'select_basic' elements (single-choice dropdowns).
            select_basic: {
                // Prefix for CSS classes of option fields related to basic selects.
                prefix: '.options_select_basic_',

                // Retrieves current basic select settings.
                get: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var list_options = '';                  // Buffer to build the options string.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Iterate over each <option> tag within the select element.
                    el.find('select > option').each(function(key, val)
                    {
                        // Determine if the option's value is different from its text.
                        // If so, include the value and delimiter.
                        var val_and_split = form_builder.cleanName($(val).text()) == $(val).val() ?
                                            '' :
                                            ($(val).val() + split);

                        // Append the option to the buffer.
                        list_options += val_and_split + $(val).text() + "\n";
                    });

                    // Populate modal fields.
                    $(this.prefix + 'name').val('');        // Clear name field.
                    $(this.prefix + 'label').val(el.find('label').text()); // Get label text.
                    $(this.prefix + 'options').val(list_options); // Set the collected options string.
                },

                // Applies basic select settings from the modal fields to the element.
                set: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var select = el.find('select');         // Find the select element.
                    var label = el.find('label');           // Find the associated label.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Get the raw options string from the modal's textarea.
                    var options_blob = $(this.prefix + 'options').val();

                    // Split the options string into individual lines.
                    var select_options = options_blob.replace(/\r\n/, "\n").split("\n");

                    // Buffer to build the new HTML options.
                    var list_options = "\n";

                    // Process each line (potential option).
                    $.each(select_options, function(key, val)
                    {
                        // Only process non-empty lines.
                        if (val.length > 0)
                        {
                            // If a delimiter is found, split into value and display text.
                            if(val.indexOf(split) !== -1)
                            {
                                var opt = val.split(split);
                                list_options += "<option value=\"" + opt[0] + "\">" + opt[1] + "</option>\n";
                            }
                            else
                            {
                                // Otherwise, use the cleaned value for both value and text.
                                list_options += "<option value=\"" + form_builder.cleanName(val) + "\">" + val + "</option>\n";
                            }
                        }
                    });

                    // Update the select's 'name' attribute.
                    select.attr('name', form_builder.cleanName($(this.prefix + 'name').val()));
                    // Update the label's text.
                    label.text($(this.prefix + 'label').val());
                    // Replace the existing options with the newly generated ones.
                    select.html(list_options);
                }
            }, // End of select_basic handler.


            // Handler for 'select_multiple' elements (multi-choice dropdowns).
            select_multiple:
            {
                // Prefix for CSS classes of option fields related to multiple selects.
                prefix: '.options_select_multiple_',

                // Retrieves current multiple select settings.
                get: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var list_options = '';                  // Buffer for options string.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Iterate over each <option> tag.
                    el.find('select > option').each(function(key, val)
                    {
                        // Determine if the option's value is different from its text.
                        var val_and_split = form_builder.cleanName($(val).text()) == $(val).val() ?
                                            '' :
                                            ($(val).val() + split);

                        // Append the option to the buffer.
                        list_options += val_and_split + $(val).text() + "\n";
                    });

                    // Populate modal fields.
                    $(this.prefix + 'name').val('');        // Clear name field.
                    $(this.prefix + 'label').val(el.find('label').text()); // Get label text.
                    $(this.prefix + 'options').val(list_options); // Set collected options.
                },

                // Applies multiple select settings from the modal fields to the element.
                set: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var select = el.find('select');         // Find the select element.
                    var label = el.find('label');           // Find the associated label.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Get the raw options string from the modal's textarea.
                    var options_blob = $(this.prefix + 'options').val();

                    // Split the options string into individual lines.
                    var select_options = options_blob.replace(/\r\n/, "\n").split("\n");

                    // Buffer to build the new HTML options.
                    var list_options = "\n";

                    // Process each line (potential option).
                    $.each(select_options, function(key, val)
                    {
                        // Only process non-empty lines.
                        if (val.length > 0)
                        {
                            // If a delimiter is found, split into value and display text.
                            if(val.indexOf(split) !== -1)
                            {
                                var opt = val.split(split);
                                list_options += "<option value=\"" + opt[0] + "\">" + opt[1] + "</option>\n";
                            }
                            else
                            {
                                // Otherwise, use the cleaned value for both.
                                list_options += "<option value=\"" + form_builder.cleanName(val) + "\">" + val + "</option>\n";
                            }
                        }
                    });

                    // Update the select's 'name' attribute, appending '[]' for multiple selection.
                    select.attr('name', form_builder.cleanName($(this.prefix + 'name').val()) + '[]');
                    // Update the label's text.
                    label.text($(this.prefix + 'label').val());
                    // Replace existing options with new ones.
                    select.html(list_options);
                }
            }, // End of select_multiple handler.


            // Handler for 'checkbox' elements.
            checkbox: {
                // Prefix for CSS classes of option fields related to checkboxes.
                prefix: '.options_checkbox_',

                // Retrieves current checkbox settings.
                get: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var list_options = '';                  // Buffer for options string.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Iterate over each checkbox input.
                    el.find('input[type=checkbox]').each(function(key, val)
                    {
                        // Determine if the checkbox has a specific value (not just "on").
                        var val_and_split = $(this).val().length > 0 && $(this).val() !== 'on' ?
                                            $(this).val() + split :
                                            '';

                        // Append the option to the buffer using the label text.
                        list_options += val_and_split + $(this).closest('label').text().trim() + "\n";
                    });

                    // Populate modal fields.
                    $(this.prefix + 'name').val('');        // Clear name field.
                    $(this.prefix + 'label').val(el.find('label:first').text()); // Get the first label's text.
                    $(this.prefix + 'options').val(list_options); // Set collected options.
                },

                // Applies checkbox settings from the modal fields to the element.
                set: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var label = el.find('label:first');     // Find the primary label for the group.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Get the raw options string from the modal's textarea.
                    var options_blob = $(this.prefix + 'options').val();

                    // Split the options string into individual lines.
                    var checkbox_options = options_blob.replace(/\r\n/, "\n").split("\n");

                    // Cleaned name for the checkbox group.
                    var name = form_builder.cleanName($(this.prefix + 'name').val());

                    // Buffer to build the new HTML options.
                    var list_options = "\n";

                    // Process each line (potential option).
                    $.each(checkbox_options, function(key, val)
                    {
                        var id = name + '_' + key;          // Generate a unique ID for each checkbox.

                        // Only process non-empty lines.
                        if (val.length > 0)
                        {
                            // If a delimiter is found, split into value and display text.
                            if( val.indexOf(split) !== -1)
                            {
                                var opt = val.split(split);

                                // Construct the HTML for a single checkbox.
                                list_options += "<div class=\"checkbox\"><label for=\"" + id + "\">\n" +
                                                "<input type=\"checkbox\" name=\"" + name + "\" " +
                                                "id=\"" + id + "\" " +
                                                "value=\"" + opt[0] + "\">\n" +
                                                opt[1] + "\n" +
                                                "</label></div>\n";
                            }
                            else
                            {
                                // Otherwise, use the cleaned value for both.
                                list_options += "<div class=\"checkbox\"><label for=\"" + id + "\">\n" +
                                                "<input type=\"checkbox\" name=\"" + name + "\" " +
                                                "id=\"" + id + "\" " +
                                                "value=\"" + form_builder.cleanName(val) + "\">\n" +
                                                val + "\n" +
                                                "</label></div>\n";
                            }
                        }
                    });

                    // Update the primary label's text.
                    label.text($(this.prefix + 'label').val());
                    // Replace the content of the '.controls' div with the new checkboxes.
                    el.find('.controls').html(list_options);
                }
            }, // End of checkbox handler.


            // Handler for 'radio' button elements.
            radio: {
                // Prefix for CSS classes of option fields related to radio buttons.
                prefix: '.options_radio_',

                // Retrieves current radio button settings.
                get: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var list_options = '';                  // Buffer for options string.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Iterate over each radio button input.
                    el.find('input[type=radio]').each(function(key, val)
                    {
                        // Determine if the radio button has a specific value (not just "on").
                        var val_and_split = $(this).val().length > 0 && $(this).val() !== 'on' ?
                                            $(this).val() + split :
                                            '';

                        // Append the option to the buffer using the label text.
                        list_options += val_and_split + $(this).closest('label').text().trim() + "\n";
                    });

                    // Populate modal fields.
                    $(this.prefix + 'name').val('');        // Clear name field.
                    $(this.prefix + 'label').val(el.find('label:first').text()); // Get the first label's text.
                    $(this.prefix + 'options').val(list_options); // Set collected options.
                },

                // Applies radio button settings from the modal fields to the element.
                set: function()
                {
                    var el = form_builder.getElement();     // Get the active element.
                    var label = el.find('label:first');     // Find the primary label for the group.
                    var split = form_builder.delimeter;     // The delimiter character.

                    // Get the raw options string from the modal's textarea.
                    var options_blob = $(this.prefix + 'options').val();

                    // Split the options string into individual lines.
                    var radio_options = options_blob.replace(/\r\n/, "\n").split("\n");

                    // Cleaned name for the radio button group.
                    var name = form_builder.cleanName($(this.prefix + 'name').val());

                    // Buffer to build the new HTML options.
                    var list_options = "\n";

                    // Process each line (potential option).
                    $.each(radio_options, function(key, val)
                    {
                        var id = name+'_'+key;              // Generate a unique ID for each radio button.

                        // Only process non-empty lines.
                        if (val.length > 0)
                        {
                            // If a delimiter is found, split into value and display text.
                            if (val.indexOf(split) !== -1)
                            {
                                var opt = val.split(split);

                                // Construct the HTML for a single radio button.
                                list_options += "<div class=\"radio\"><label for=\"" + id + "\">\n" +
                                                "<input type=\"radio\" name=\"" + name + "\" " +
                                                "id=\"" + id + "\" " +
                                                "value=\"" + opt[0] + "\">\n" +
                                                opt[1] + "\n" +
                                                "</label></div>\n";
                            }
                            else
                            {
                                // Otherwise, use the cleaned value for both.
                                list_options += "<div class=\"radio\"><label for=\"" + id + "\">\n" +
                                                "<input type=\"radio\" name=\"" + name + "\" " +
                                                "id=\"" + id + "\" " +
                                                "value=\"" + form_builder.cleanName(val) + "\">\n" +
                                                val + "\n" +
                                                "</label></div>\n";
                            }
                        }
                    });

                    // Update the primary label's text.
                    label.text($(this.prefix + 'label').val());
                    // Replace the content of the '.controls' div with the new radio buttons.
                    el.find('.controls').html(list_options);
                }
            } // End of radio handler.
        }; // End of form_builder object definition.


        // --- Event Bindings ---

        // Make elements with the 'component' class draggable.
        $(".component")
            .draggable(
                {
                    helper: "clone",                        // When dragging, use a clone of the element.
                    revert: "invalid"                       // If dropped outside a valid droppable area, animate back.
                }
            )
        ;

        // Make the '#content' area droppable and sortable.
        $("#content")
            .droppable(
                {
                    hoverClass: "active",                   // Add this class when a draggable is hovering over.
                    accept: ".component",                   // Only accept elements with the 'component' class.
                    drop: function(event, ui)
                    {
                        // When a component is dropped, add it to the form.
                        form_builder.addComponent(ui.draggable);
                    }
                }
            )
            .sortable()                                     // Enable sorting of elements already in the content area.
        ;

        // Event delegation for clicking on an existing form element.
        // This opens the options modal for that element.
        $("#content").on(
            'click',                                        // Event type.
            '.element',                                     // Selector for delegated elements.
            function()
            {
                // Get the 'type' data attribute from the clicked element.
                var type = $(this).data('type');
                // Call loadOptions, passing the element as 'this' context.
                form_builder.loadOptions.call(this, type);
            }
        );

        // Event delegation for clicking the 'close' button on an element.
        // This removes the element from the form.
        $("#content").on(
            'click',                                        // Event type.
            '.element .close',                              // Selector for delegated close buttons.
            function()
            {
                // Remove the closest parent with the class 'element'.
                $(this).closest('.element').remove();
                // Update the source code display after removal.
                form_builder.updateSource();
            }
        );

        // Event handler for the 'Save changes' button within the options modal.
        $("#options_modal").find('.modal-footer .btn-primary').on(
            'click',                                        // Event type.
            function()
            {
                var $modal = $(this).closest('.modal');     // Get a reference to the modal.
                var type = $modal.data('type');             // Retrieve the element type from modal's data.

                // Call the type-specific 'set' method to apply changes to the element.
                form_builder[type].set();

                // Hide the options modal.
                $modal.modal('hide');

                // Update the source code display to reflect the changes.
                form_builder.updateSource();
            }
        );

        // Event handler for the 'Cancel' button within the options modal.
        // This simply dismisses the modal without saving any changes.
        $("#options_modal").find('.modal-footer .btn-default').on(
            'click',                                        // Event type.
            function()
            {
                $(this).closest('.modal').modal('hide');    // Hide the modal.
            }
        );

        // Perform an initial update of the source code display when the page loads.
        form_builder.updateSource();

    }
); // End of the jQuery document ready function.