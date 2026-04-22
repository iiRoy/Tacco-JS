/*
 *
 * Copyright & License Information
 *
 * Copyright (c) 2013 ProSiebenSat.1 Digital GmbH.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */

( function ( factory ) {

  // Check for AMD loader (e.g., RequireJS)
  if ( typeof define === 'function' && define.amd ) {

    // AMD: Register as an anonymous module, with 'jquery' as a dependency.
    define( "JsonSchemaComponent", [ 'jquery' ], factory );

  } else {

    // No AMD loader detected. Assume jQuery is loaded globally via a <script> tag.
    // Attach the JsonSchemaComponent to the global window object.
    window.JsonSchemaComponent = factory( jQuery );

  }

}( function( $ ) {

    // Main constructor function for JsonSchemaComponent
    function JsonSchemaComponent( options ) {

        // --- Input Validation for Component Initialization ---

        if ( options == null ) {

            // If no options are provided, throw an error.
            throw new Error( "JsonSchemaComponent needs arguments, like this: 'new JsonSchemaComponent({...);'." );
        }

        if ( options.schema == null ) {

            // A schema definition is mandatory for the component to function.
            throw new Error( "JsonSchemaComponent needs a schema, like this: 'new JsonSchemaComponent({schema:{...});'." );
        }

        if ( options.textarea == null ) {

            // A target textarea element is required for output.
            throw new Error( "JsonSchemaComponent needs a textarea, like this: 'new JsonSchemaComponent({textarea:'#...');'." );
        }


        // --- Internal Variable Declarations ---

        var _this = this; // Cache 'this' for use in nested functions.

        var textarea = $( options.textarea ); // jQuery object for the target textarea.

        // Custom error formatter function, or a default passthrough.
        var validation_errors_formatter = options.validation_errors_formatter || function( errors ) { return errors; };

        // Parse initial JSON content from the textarea.
        var json = $.parseJSON( $( textarea ).val() );

        var validator; // Variable to hold the JSV validator instance.

        // Initialize JSV validator if available in the global scope.
        if ( window.JSV != null ) {

            validator = JSV.createEnvironment();

        }


        // --- Public Method: render ---
        _this.render = function() {

            // Render the template using jQuery.tmpl, passing the schema as data.
            // Uses a custom template if provided, otherwise the default one.
            return $( options.template || _this.TEMPLATE ).tmpl( options.schema );

        };


        // --- Form Rendering and Appending ---
        if ( options.existing_form == null ) {

            // If no existing form is specified, render a new one.
            var rendered = _this.render();

            // Determine the correct append function, supporting webshims polyfill.
            var append_fn = rendered.appendPolyfillTo /* webshims support */ || rendered.appendTo;

            // Append the rendered form to the specified target.
            append_fn.call( rendered, options.form );

        }

        // Regular expression for splitting tags, defaults to comma/space separation.
        split_tags_by = RegExp( options.split_tags_by || /\ *,\ */ );

        // Get the jQuery object for the form, either existing or newly rendered.
        var form = $( options.existing_form || options.form );


        // --- Public Method: setDatalist ---
        _this.setDatalist = function( field, datalist ) {

            // Determine the correct HTML setting function, supporting webshims.
            var html_fn = rendered.htmlPolyfill /* webshims support */ || rendered.html;

            // Update the content of the datalist element for a specific field.
            html_fn.call( $( '#' + field + '_datalist' ), "<select>" + datalist + "</select>" );

        };


        // --- Public Method: setValidationErrors ---
        _this.setValidationErrors = function( errors ) {

            // Apply custom formatting to the validation errors.
            errors = validation_errors_formatter( errors );

            // Toggle the "error" class on the form based on whether there are errors.
            form.toggleClass( "error", errors.length > 0 );

            if ( errors.length === 0 ) {

                // If there are no errors, clear all previous error messages.
                $.each( json, function( property ) {

                    form.find( '#' + property + '-error' ).hide();

                });

                // Trigger a 'validates' event on the form.
                form.trigger( 'validates' );

                return; // Exit early as no errors to display.
            }

            // If there were errors, show them!
            // Trigger an 'errors' event on the form, passing the errors.
            form.trigger( 'errors', errors );


            // Iterate through each validation issue and display it.
            $.each( errors, function( index, issue ) {

                // Extract the property name from the URI (last segment).
                var property = issue.uri.split( '/' ).splice( -1 )[ 0 ] /* <- "last element of array" */;

                var message = issue.message;

                // Append details if available.
                if ( issue.details ) {

                    message += " (" + issue.details + ")";

                }

                // Find the error element for the current property.
                var element = form.find( '#' + property + '-error' );

                // If the error element doesn't exist, create it.
                if ( element.length < 1 ) {

                    var input = form.find( '*[name=' + property + ']' );

                    $( input ).before( "<span id='" + property + "-error' ></span>" );

                    element = form.find( '#' + property + '-error' );

                }

                // Add class, set HTML content, and show the error message.
                $( element ).addClass( "errorStr" ).html( message ).show();

            });

        };


        // --- Public Method: setValidationReport ---
        _this.setValidationReport = function( report ) {

            /* TODO deprecate this function in favor of setValidationErrors */
            _this.setValidationErrors( report.errors );

        };


        // --- Private Helper: get_property_type ---
        function get_property_type( name ) {

            // Safely retrieve the type of a property from the schema.
            if ( options.schema != null &&
                 options.schema.properties != null &&
                 options.schema.properties[ name ] != null &&
                 options.schema.properties[ name ].type != null ) {

                return options.schema.properties[ name ].type;

            }

        }


        // --- Private Helper: form_out ---
        function form_out( name, value ) {

            /**
             * Updates an existing form's input field named <name>
             * with the provided <value> from the JSON data.
             */
            var input = form.find( '*[name=' + name + ']' );

            var type = input.attr( "type" );

            var property_type = get_property_type( name );

            if ( type === "checkbox" || type === "radio" ) {

                input.each( function( _, input ) {

                    var checked;

                    if ( property_type === "array" ) {

                        // For arrays, check if the value is present in the array.
                        checked = value.indexOf( input.value ) !== -1;

                    } else {

                        // For booleans, check if the value is true.
                        checked = value === true;

                    }

                    if ( checked ) {

                        $( input ).attr( "checked", "checked" ); // Mark as checked.

                    } else {

                        $( input ).removeAttr( "checked" ); // Uncheck.

                    }

                });

            } else {

                input.val( value ); // For other input types, simply set the value.

            }

        }


        // --- Private Helper: form_in ---
        function form_in( input_type, name, value, selected ) {

            /**
             * Updates the textarea's content (JSON) based on an input's change event,
             * respecting the schema's property types.
             */

            // If the property is not defined in the schema, ignore the change.
            if ( options.schema != null &&
                 options.schema.properties &&
                 options.schema.properties[ name ] == null ) {

                return;

            }

            var property_type = get_property_type( name );

            if ( property_type === "boolean" ) {

                json[ name ] = selected; // For booleans, use the 'selected' (checked) state.

            } else if ( property_type === "integer" ) {

                json[ name ] = parseInt( value, 10 ); // Parse as integer.

            } else if ( property_type === "number" ) {

                json[ name ] = parseFloat( value ); // Parse as float.

            } else if ( property_type === "array" && input_type == "text" ) {

                // For array properties from text inputs, split by defined delimiter.
                json[ name ] = value.split( split_tags_by );

            } else if ( property_type === "array" && input_type !== "select" ) {

                // For array properties from non-select inputs (e.g., checkboxes).
                json[ name ] = json[ name ] || []; // Initialize array if null.

                var pos = json[ name ].indexOf( value );

                var contains = pos !== -1;

                if ( selected && !contains ) {

                    json[ name ].push( value ); // Add if selected and not already present.

                } else {

                    // "delete json[name][pos]" -- Remove the item if unselected or already present.
                    json[ name ] = $.grep( json[ name ], function( _, i ) {

                        return i !== pos; // Filter out the item at 'pos'.

                    });

                }

            } else {

                json[ name ] = value; // Default: directly assign the value.

            }

            // Perform validation if a validator is available.
            if ( validator != null ) {

                _this.setValidationErrors( validator.validate( json, options.schema ).errors );

            }

            // Update the textarea with the stringified JSON, formatted for readability.
            textarea.val( JSON.stringify( json, null, 2 ) );

        }


        // --- Initial Form Population ---
        // Populate form fields with existing JSON data.
        $.each( json, form_out );


        // --- Event Listener for Form Changes ---
        form.on( 'change', function( e ) {

            var tag_name = e.target.tagName.toLowerCase();

            var target = $( e.target );

            var input_type;

            if ( tag_name === "select" ) {

                input_type = "select";

            } else {

                input_type = target.attr( "type" ) || "text";

            }

            var name = target.attr( 'name' );

            var value = target.val();

            // Check if the input is currently selected (for checkboxes/radio buttons).
            var selected = target.attr( "checked" ) === "checked";

            // Process the form input change.
            form_in( input_type, name, value, selected );

        });

    } // End of JsonSchemaComponent constructor.


    // --- JsonSchemaComponent Prototype: Default Template ---
    JsonSchemaComponent.prototype.TEMPLATE = [
        '<div>',
        '<h2>${name}</h2>',
        '{{each(name, properties) properties}}<p><label>',
        '  {{if properties.description}}',
        '    <b>${properties.description}</b>',
        '  {{else}}',
        '    <b>${name}</b>',
        '  {{/if}}',
        '  {{if properties.type === "time" || properties.type === "date"}}',
        '    <input name="${name}" list="${name}_datalist" type="${properties.type}"/>',
        '  {{else properties.type === "date-time"}}', // special handling to remove hyphen for HTML5 input type
        '    <input name="${name}" list="${name}_datalist" type="datetime"/>',
        '  {{else properties.type === "integer" || properties.type === "number"}}',
        '    <input name="${name}" list="${name}_datalist" type="number"/>',
        '  {{else properties.type === "boolean"}}',
        '    <input name="${name}" list="${name}_datalist" type="checkbox"/>',
        '  {{else !(!properties.items || properties.type !== "array")  }}', // can't use "&" inside jQuery.tmpl :(, checks if it's an array with items
        '    <select multiple=multiple name="${name}">',
        '    {{each(index, value) properties.items.enum}}',
        '      <option value="${value}">${value}</option>',
        '    {{/each}}',
        '    </select>',
        '  {{else}}', // Catches properties.type === "string" and any other unknown types.
        '    {{if properties.enum == null}}',
        '      <input name="${name}" list="${name}_datalist" type="text"/>',
        '    {{else}}',
        '      <select name="${name}">',
        '     {{each(index, value) properties.enum}}',
        '       <option value="${value}">${value}</option>',
        '     {{/each}}',
        '    </select>',
        '  {{/if}}',
        '{{/if}}',
        '{{if properties.required === true}}<em>(required)</em>{{/if}}',
        '{{if properties.required === false}}<em>(optional)</em>{{/if}}',
        '</label></p>{{/each}}',
        '{{each(name, properties) properties}}<datalist id="${name}_datalist"></datalist>{{/each}}',
        '</div>'
    ].join( '\n' ); // Join the array of template strings into a single string.


    return JsonSchemaComponent; // Return the constructor function.

})); // End of IIFE.