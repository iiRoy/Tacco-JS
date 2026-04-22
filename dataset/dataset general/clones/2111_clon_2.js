// This file is part of a UI construction toolkit.
// Copyright (c) 2023, Your Name (or a new entity)
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// * Redistributions of source code must retain the above copyright notice,
//   this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
// * Neither the names of the copyright holders nor the names of its
//   contributors may be used to endorse or promote products derived from this
//   software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

// --------------------------------------------------------------------------
// OPERATION INSTRUCTIONS
// --------------------------------------------------------------------------
// 1. Select a UI block or drag it into the design canvas.
// 2. 'Block' becomes 'Component'.
// 3. When a component is clicked:
//    a. Populate the modal dialog with its configuration settings.
//    b. Determine the component's kind (e.g., text, multiline, checkbox).
//    c. Execute 'layout_creator.component_kind.populateFields()' for initial setup.
//    d. Await user input...
// 4. Upon saving settings:
//    a. Invoke 'layout_creator.component_kind.applyChanges()' to persist modifications.

// TODO: Resolve UI alignment issues after adding components (due to close button).
// TODO: Implement various input field types (e.g., password, date, email).
// TODO: Replace the 'remove' action with a 'cancel' button.
// TODO: Integrate a compressed version of the script.

jQuery(function() {
    // Core object for managing UI element properties.
    var layout_creator = {
        // Reference to the currently selected UI component.
        current_item: null,

        // The HTTP method for form submission.
        transfer_mode: "PUT",

        // The URL for form submission.
        destination_url: "",

        // Character used to separate value from display text in option-based inputs.
        separator_char: '|',

        // Assign the currently active UI component.
        setActiveItem: function(node_element) {
            this.current_item = node_element;
        },

        // Fetch the currently active UI component.
        retrieveActiveItem: function() {
            return this.current_item;
        },

        // Standardize a string for use as an HTML name/ID attribute.
        normalizeIdentifier: function(input_string) {
            if (input_string === undefined || input_string.length === 0) {
                return '';
            }

            return input_string
                .trim()
                .replace(/ /g, '-')
                .replace(/\W/g, '')
                .toLowerCase();
        },

        // Clean up generated HTML markup by removing unnecessary attributes and classes.
        scrubMarkup: function(html_data) {
            return html_data
                .replace(/\t/g, '')
                .replace(/ ui-draggable| ui-item-design/gi, '')
                .replace(/<div class="remove-btn">.<\/div>/g, '')
                .replace(/ data-[a-zA-Z0-9\-]+="[^"]*"/g, '');
        },

        // Update the displayed source code representation.
        refreshCodeDisplay: function() {
            var markup_string =   "<form method=\"" + this.transfer_mode + "\" " +
                            "action=\"" + this.destination_url + "\" " +
                            "class=\"design-form-layout\">\n" +
                            jQuery("#design_canvas").html() +
                            "\n</form>";

            code_editor.updateContent(this.scrubMarkup(markup_string));

            code_editor.autoFormatRange(
                { line: 0, ch: 0 },
                { line: code_editor.lastLine() + 1, ch: 0 }
            );
        },

        // Add a new UI block to the design canvas.
        insertComponent: function(design_block) {
            design_block
                .clone()
                .removeClass('ui-block')
                .addClass('ui-item-design')
                .removeAttr('id')
                .prepend('<div class="remove-btn">&times;</div>')
                .appendTo("#design_canvas");

            jQuery("#settings_popup").modal('hide');

            this.refreshCodeDisplay();
        },

        // Load configuration settings for a given component kind.
        configureItemSettings: function(component_kind) {
            var $target_element = jQuery(this),
                $settings_dialog = jQuery("#settings_popup"),
                dialog_content_area = $settings_dialog.find('.modal-body');

            // Abort if no component kind is specified.
            if (! component_kind) {
                return false;
            }

            return jQuery.get('configurations/' + component_kind + '.html', function(payload_data) {
                if (payload_data === undefined) {
                    return false;
                }

                // Store the component kind in the settings dialog.
                $settings_dialog.data('item-kind', component_kind);

                // Load the appropriate configuration HTML.
                dialog_content_area.html(payload_data);

                // Set the selected element to the one that was clicked.
                // This avoids needing unique IDs for every element by passing references.
                layout_creator.setActiveItem($target_element);

                // Populate fields with current options and perform any necessary pre-processing.
                layout_creator[component_kind].populateFields();

                // Display the configuration dialog.
                $settings_dialog.modal('show');

                return true;
            });
        },

        // Configuration options for a form heading.
        heading: {
            // CSS class prefix for heading-related options.
            option_selector_base: '.config_heading_',

            // Retrieve current heading values.
            populateFields: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    field_legend = active_node.find('legend');

                jQuery(this.option_selector_base + 'label_text')
                    .val(field_legend.text())
                    .focus();
            },

            // Apply new heading values.
            applyChanges: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    field_legend = active_node.find('legend');

                field_legend.text(jQuery(this.option_selector_base + 'label_text').val());
            }
        },

        // Configuration options for a single-line text input.
        single_line_input: {
            // CSS class prefix for text input options.
            option_selector_base: '.config_single_line_input_',

            // Retrieve current text input values.
            populateFields: function() {
                var active_node = layout_creator.retrieveActiveItem();

                jQuery(this.option_selector_base + 'field_name').val('');
                jQuery(this.option_selector_base + 'caption_text').val(active_node.find('label').text());
                jQuery(this.option_selector_base + 'placeholder_hint').val(active_node.find('input[type=text]').attr('placeholder'));
            },

            // Apply new text input values.
            applyChanges: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    text_control = active_node.find('input[type=text]'),
                    caption_text = active_node.find('label'),
                    element_key = layout_creator.normalizeIdentifier(jQuery(this.option_selector_base + 'field_name').val());

                text_control.attr('name', element_key);

                caption_text.text(jQuery(this.option_selector_base + 'caption_text').val()).attr('for', element_key);

                text_control.attr('placeholder', jQuery(this.option_selector_base + 'placeholder_hint').val()).attr('id', element_key);
            }
        },

        // Configuration options for a multi-line text area.
        multi_line_input: {
            // CSS class prefix for textarea options.
            option_selector_base: '.config_multi_line_input_',

            // Retrieve current textarea values.
            populateFields: function() {
                var active_node = layout_creator.retrieveActiveItem();

                jQuery(this.option_selector_base + 'field_name').val('');
                jQuery(this.option_selector_base + 'caption_text').val(active_node.find('label').text());
                jQuery(this.option_selector_base + 'placeholder_hint').val(active_node.find('textarea').attr('placeholder'));
            },

            // Apply new textarea values.
            applyChanges: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    text_area_field = active_node.find('textarea'),
                    caption_text = active_node.find('label');

                text_area_field.attr('name', layout_creator.normalizeIdentifier(jQuery(this.option_selector_base + 'field_name').val()));
                caption_text.text(jQuery(this.option_selector_base + 'caption_text').val());
                text_area_field.attr('placeholder', jQuery(this.option_selector_base + 'placeholder_hint').val());
            }
        },

        // Configuration options for a basic single-choice dropdown.
        single_choice_dropdown: {
            // CSS class prefix for basic select options.
            option_selector_base: '.config_simple_selector_',

            // Retrieve current basic select options.
            populateFields: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    choice_html = '',
                    split_token = layout_creator.separator_char;

                // Iterate through each option in the select box.
                active_node.find('select > option').each(function(index_pos, current_option) {
                    // If value and display text are identical, don't include the value.
                    var keyed_entry_string = layout_creator.normalizeIdentifier(jQuery(current_option).text()) === jQuery(current_option).val() ?
                                        '' :
                                        (jQuery(current_option).val() + split_token);

                    // Append the formatted option to the list.
                    choice_html += keyed_entry_string + jQuery(current_option).text() + "\n";
                });

                jQuery(this.option_selector_base + 'field_name').val('');
                jQuery(this.option_selector_base + 'caption_text').val(active_node.find('label').text());
                jQuery(this.option_selector_base + 'input_choices_data').val(choice_html);
            },

            // Apply new basic select options.
            applyChanges: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    selection_box = active_node.find('select'),
                    caption_text = active_node.find('label'),
                    split_token = layout_creator.separator_char,

                    // Raw text from the options textarea.
                    raw_options_text = jQuery(this.option_selector_base + 'input_choices_data').val(),

                    // Split choices by line break.
                    parsed_choices = raw_options_text.replace(/\r\n/g, "\n").split("\n"),

                    // Buffer for generated option HTML.
                    choice_html = "\n";

                // Loop through each parsed choice.
                jQuery.each(parsed_choices, function(index_pos, current_entry) {
                    if (current_entry.length > 0) {
                        // If delimiter is present, split value into [value, display_text].
                        if(current_entry.indexOf(split_token) !== -1) {
                            var item_parts = current_entry.split(split_token);

                            choice_html += "<option value=\"" + item_parts[0] + "\">" + item_parts[1] + "</option>\n";
                        } else {
                            choice_html += "<option value=\"" + layout_creator.normalizeIdentifier(current_entry) + "\">" + current_entry + "</option>\n";
                        }
                    }
                });

                selection_box.attr('name', layout_creator.normalizeIdentifier(jQuery(this.option_selector_base + 'field_name').val()));
                caption_text.text(jQuery(this.option_selector_base + 'caption_text').val());
                selection_box.html(choice_html);
            }
        },

        // Configuration options for a multi-choice list box.
        multi_choice_list: {
            // CSS class prefix for multiple select options.
            option_selector_base: '.config_complex_selector_',

            // Retrieve current multiple select options.
            populateFields: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    choice_html = '',
                    split_token = layout_creator.separator_char;

                // Iterate through each option in the select box.
                active_node.find('select > option').each(function(index_pos, current_option) {
                    // If value and display text are identical, don't include the value.
                    var keyed_entry_string = layout_creator.normalizeIdentifier(jQuery(current_option).text()) === jQuery(current_option).val() ?
                                        '' :
                                        (jQuery(current_option).val() + split_token);

                    // Append the formatted option to the list.
                    choice_html += keyed_entry_string + jQuery(current_option).text() + "\n";
                });

                jQuery(this.option_selector_base + 'field_name').val('');
                jQuery(this.option_selector_base + 'caption_text').val(active_node.find('label').text());
                jQuery(this.option_selector_base + 'input_choices_data').val(choice_html);
            },

            // Apply new multiple select options.
            applyChanges: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    selection_box = active_node.find('select'),
                    caption_text = active_node.find('label'),
                    split_token = layout_creator.separator_char,

                    // Raw text from the options textarea.
                    raw_options_text = jQuery(this.option_selector_base + 'input_choices_data').val(),

                    // Split choices by line break.
                    parsed_choices = raw_options_text.replace(/\r\n/g, "\n").split("\n"),

                    // Buffer for generated option HTML.
                    choice_html = "\n";

                // Loop through each parsed choice.
                jQuery.each(parsed_choices, function(index_pos, current_entry) {
                    if (current_entry.length > 0) {
                        // If delimiter is present, split value into [value, display_text].
                        if(current_entry.indexOf(split_token) !== -1) {
                            var item_parts = current_entry.split(split_token);

                            choice_html += "<option value=\"" + item_parts[0] + "\">" + item_parts[1] + "</option>\n";
                        } else {
                            choice_html += "<option value=\"" + layout_creator.normalizeIdentifier(current_entry) + "\">" + current_entry + "</option>\n";
                        }
                    }
                });

                selection_box.attr('name', layout_creator.normalizeIdentifier(jQuery(this.option_selector_base + 'field_name').val()) + '[]');
                caption_text.text(jQuery(this.option_selector_base + 'caption_text').val());
                selection_box.html(choice_html);
            }
        },

        // Configuration options for a group of checkboxes.
        toggle_option: {
            // CSS class prefix for checkbox options.
            option_selector_base: '.config_check_box_group_',

            // Retrieve current checkbox options.
            populateFields: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    choice_html = '',
                    split_token = layout_creator.separator_char;

                // Iterate through each checkbox input.
                active_node.find('input[type=checkbox]').each(function(index_pos, current_input) {
                    // If checkbox has a meaningful value (not just "on"), include it.
                    var keyed_entry_string = jQuery(this).val().length > 0 && jQuery(this).val() !== 'on' ?
                                        jQuery(this).val() + split_token :
                                        '';

                    choice_html += keyed_entry_string + jQuery(this).closest('label').text().trim() + "\n";
                });

                jQuery(this.option_selector_base + 'field_name').val('');
                jQuery(this.option_selector_base + 'caption_text').val(active_node.find('label:first').text());
                jQuery(this.option_selector_base + 'input_choices_data').val(choice_html);
            },

            // Apply new checkbox options.
            applyChanges: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    caption_text = active_node.find('label:first'),
                    split_token = layout_creator.separator_char,

                    // Raw text from the options textarea.
                    raw_options_text = jQuery(this.option_selector_base + 'input_choices_data').val(),

                    // Split choices by line break.
                    check_box_options = raw_options_text.replace(/\r\n/g, "\n").split("\n"),

                    // The base name for the checkbox group.
                    element_key = layout_creator.normalizeIdentifier(jQuery(this.option_selector_base + 'field_name').val()),

                    // Buffer for generated checkbox HTML.
                    choice_html = "\n";

                // Loop through each parsed choice.
                jQuery.each(check_box_options, function(index_pos, current_entry) {
                    var unique_id_string = element_key + '_' + index_pos;

                    if (current_entry.length > 0) {
                        // If delimiter is present, split value into [value, display_text].
                        if( current_entry.indexOf(split_token) !== -1) {
                            var item_parts = current_entry.split(split_token);

                            choice_html += "<div class=\"checkbox-wrapper\"><label for=\"" + unique_id_string + "\">\n" +
                                            "<input type=\"checkbox\" name=\"" + element_key + "\" " +
                                            "id=\"" + unique_id_string + "\" " +
                                            "value=\"" + item_parts[0] + "\">\n" +
                                            item_parts[1] + "\n" +
                                            "</label></div>\n";
                        } else {
                            choice_html += "<div class=\"checkbox-wrapper\"><label for=\"" + unique_id_string + "\">\n" +
                                            "<input type=\"checkbox\" name=\"" + element_key + "\" " +
                                            "id=\"" + unique_id_string + "\" " +
                                            "value=\"" + layout_creator.normalizeIdentifier(current_entry) + "\">\n" +
                                            current_entry + "\n" +
                                            "</label></div>\n";
                        }
                    }
                });

                caption_text.text(jQuery(this.option_selector_base + 'caption_text').val());
                active_node.find('.control-group-elements').html(choice_html);
            }
        },

        // Configuration options for a group of radio buttons.
        exclusive_choice: {
            // CSS class prefix for radio button options.
            option_selector_base: '.config_radio_button_set_',

            // Retrieve current radio button options.
            populateFields: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    choice_html = '',
                    split_token = layout_creator.separator_char;

                // Iterate through each radio input.
                active_node.find('input[type=radio]').each(function(index_pos, current_input) {
                    // If radio button has a meaningful value (not just "on"), include it.
                    var keyed_entry_string = jQuery(this).val().length > 0 && jQuery(this).val() !== 'on' ?
                                        jQuery(this).val() + split_token :
                                        '';

                    choice_html += keyed_entry_string + jQuery(this).closest('label').text().trim() + "\n";
                });

                jQuery(this.option_selector_base + 'field_name').val('');
                jQuery(this.option_selector_base + 'caption_text').val(active_node.find('label:first').text());
                jQuery(this.option_selector_base + 'input_choices_data').val(choice_html);
            },

            // Apply new radio button options.
            applyChanges: function() {
                var active_node = layout_creator.retrieveActiveItem(),
                    caption_text = active_node.find('label:first'),
                    split_token = layout_creator.separator_char,

                    // Raw text from the options textarea.
                    raw_options_text = jQuery(this.option_selector_base + 'input_choices_data').val(),

                    // Split choices by line break.
                    radio_button_options = raw_options_text.replace(/\r\n/g, "\n").split("\n"),

                    // The base name for the radio group.
                    element_key = layout_creator.normalizeIdentifier(jQuery(this.option_selector_base + 'field_name').val()),

                    // Buffer for generated radio button HTML.
                    choice_html = "\n";

                // Loop through each parsed choice.
                jQuery.each(radio_button_options, function(index_pos, current_entry) {
                    var unique_id_string = element_key + '_' + index_pos;

                    if (current_entry.length > 0) {
                        // If delimiter is present, split value into [value, display_text].
                        if (current_entry.indexOf(split_token) !== -1) {
                            var item_parts = current_entry.split(split_token);

                            choice_html += "<div class=\"radio-wrapper\"><label for=\"" + unique_id_string + "\">\n" +
                                            "<input type=\"radio\" name=\"" + element_key + "\" " +
                                            "id=\"" + unique_id_string + "\" " +
                                            "value=\"" + item_parts[0] + "\">\n" +
                                            item_parts[1] + "\n" +
                                            "</label></div>\n";
                        } else {
                            choice_html += "<div class=\"radio-wrapper\"><label for=\"" + unique_id_string + "\">\n" +
                                            "<input type=\"radio\" name=\"" + element_key + "\" " +
                                            "id=\"" + unique_id_string + "\" " +
                                            "value=\"" + layout_creator.normalizeIdentifier(current_entry) + "\">\n" +
                                            current_entry + "\n" +
                                            "</label></div>\n";
                        }
                    }
                });

                caption_text.text(jQuery(this.option_selector_base + 'caption_text').val());
                active_node.find('.control-group-elements').html(choice_html);
            }
        }
    };
});