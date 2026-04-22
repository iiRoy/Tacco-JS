( function ( module_creator ) {
    // Check for AMD loader presence
    if ( typeof module_define === 'function' && module_define.async_module_definition ) {
        // Asynchronous Module Definition. Register this as an un-named module.
        module_define( "SchemaUI", [ 'jquery' ], module_creator );
    }
    else {
        // AMD or RequireJS is not active. Assume SchemaUI is loaded via standard <script> tags.
        window.SchemaUI = module_creator( jQuery );
    }
}( function( $ ) {


function SchemaUI( settings_obj ) {

  if ( settings_obj == null ) {
    throw new Error( "SchemaUI requires configuration parameters, for example: 'new SchemaUI({...);'." );
  }

  if ( settings_obj.schema == null ) {
    throw new Error( "SchemaUI must be initialized with a schema definition, e.g.: 'new SchemaUI({schema:{...});'." );
  }

  if ( settings_obj.text_entry_field == null ) {
    throw new Error( "SchemaUI needs a target text input element, like this: 'new SchemaUI({text_entry_field:'#...');'." );
  }

  var instance_ptr = this;
  var input_area = $( settings_obj.text_entry_field );
  var issue_format_handler = settings_obj.issue_format_handler || function( problem_items ) {
    return problem_items;
  };
  var parsed_content = $.parseJSON( $( input_area ).val() );

  var data_verifier;
  // Check if JSON Schema Validator library is available globally
  if ( window.DataSchemaVerifier != null ) {
    data_verifier = DataSchemaVerifier.createEnvironment();
  }

  instance_ptr.compose_view = function() {
    // Generate the user interface based on the provided schema or default layout
    return $( settings_obj.widget_layout || instance_ptr.WIDGET_LAYOUT ).tmpl( settings_obj.schema );
  };

  // If no existing form is specified, create and append a new one
  if ( settings_obj.existing_form_element == null ) {
    var generated_output = instance_ptr.compose_view();
    // Determine the correct method for appending elements, considering webshims support
    var insertion_routine = generated_output.polyfill_insertion_target /* webshims support for append */ || generated_output.standard_insertion_target;
    insertion_routine.call( generated_output, settings_obj.target_form_container );
  }

  // Define the regular expression for splitting tag-like inputs
  var tag_separator_pattern = RegExp( settings_obj.tag_separator_pattern || /\ *,\ */ );

  var data_entry_form = $( settings_obj.existing_form_element || settings_obj.target_form_container );

  instance_ptr.populate_options_list = function( element_name, option_data ) {
    var markup_setter = generated_output.polyfill_markup_setter /* webshims support for html */ || generated_output.standard_markup_setter;
    // Update the content of the specific datalist element
    markup_setter.call( $( '#' + element_name + '_option_list' ), "<select>" + option_data + "</select>" );
  };

  instance_ptr.display_validation_issues = function( problem_items ) {

    problem_items = issue_format_handler( problem_items );

    // Toggle 'error' class on the form based on whether there are any issues
    data_entry_form.toggleClass( "error", problem_items.length > 0 );

    if ( problem_items.length === 0 ) {
      // No validation problems found, clear any previous error messages
      $.for_each( parsed_content, function( item_attribute ) {
        data_entry_form.find( '#' + item_attribute + '-error' ).hide();
      });
      // Trigger a custom event indicating successful validation
      data_entry_form.trigger( 'validated' );
      return;
    }

    // Validation problems were found, proceed to display them!
    data_entry_form.trigger( 'problems_detected', problem_items );

    $.for_each( problem_items, function( loop_idx, single_issue ) {
      // Extract the field key from the URI of the validation issue
      var field_key   = single_issue.resource_path.split( '/' )
                        .splice( -1 )[0]; // Get the last segment of the path
      var error_description    = single_issue.message;
      if ( single_issue.extra_info ) {
        error_description += " (" + single_issue.extra_info + ")";
      }
      var error_display_element    = data_entry_form.find( '#' + field_key + '-error' );

      if ( error_display_element.length < 1 ) {
        // If the error display element doesn't exist, create it before the input
        var form_input_element = data_entry_form.find( '*[name=' + field_key + ']' );
        $( form_input_element ).before( "<span id='" + field_key + "-error' ></span>" );
        error_display_element = data_entry_form.find( '#' + field_key + '-error' );
      }

      // Add error styling, set message, and make the element visible
      $( error_display_element ).addClass( "error_string" ).html( error_description ).show();
    });
  };

  instance_ptr.present_validation_summary = function( summary_report ) {
     // TODO: This function is marked for future removal
     instance_ptr.display_validation_issues( summary_report.problem_items );
  };

  // Helper function to determine the data type of a schema property
  function retrieve_attribute_kind( field_identifier ) {
   if ( settings_obj.schema != null &&
       settings_obj.schema.field_properties != null &&
       settings_obj.schema.field_properties[ field_identifier ] != null &&
       settings_obj.schema.field_properties[ field_identifier ].data_kind != null ) {
      return settings_obj.schema.field_properties[ field_identifier ].data_kind;
    }
  }

  function update_form_display( field_identifier, current_value ) {
    /**
     * Modifies the input field in the existing form identified by `field_identifier`
     * to reflect the `current_value`.
     */
    var form_input_element = data_entry_form.find( '*[name=' + field_identifier + ']' );
    var field_type = form_input_element.attr( "type" );
    var attribute_kind = retrieve_attribute_kind( field_identifier );

    if ( field_type === "checkbox" || field_type === "radio" ) {
      form_input_element.for_each( function( _, current_input ) {

        var is_selected;

        if ( attribute_kind === "array" ) {
          // For array types (e.g., multiple checkboxes), check if value is in the array
          is_selected = current_value.indexOf( current_input.value ) !== -1;
        } else {
          // For single boolean types, check if value is true
          is_selected = current_value === true;
        }

        if ( is_selected ) {
          $( current_input ).attr( "checked", "checked" );
        } else {
          $( current_input ).removeAttr( "checked" );
        }
      });
    } else {
      // For other input types, simply set the value
      form_input_element.val( current_value );
    }
  }

  function handle_form_update( source_type, field_identifier, current_value, is_checked ) {
    /**
     * Updates the internal JSON data structure based on a form input's change event,
     * adhering to the defined schema.
     */

    if ( settings_obj.schema != null &&
       settings_obj.schema.field_properties &&
       settings_obj.schema.field_properties[ field_identifier ] == null ) {
      // If the field is not defined in the schema, ignore the change
      return;
    }

    var attribute_kind = retrieve_attribute_kind( field_identifier );

    if ( attribute_kind === "boolean" ) {
      parsed_content[ field_identifier ] = is_checked;
    } else if ( attribute_kind === "integer" ) {
      parsed_content[ field_identifier ] = parseInt( current_value, 10 );
    } else if ( attribute_kind === "number" ) {
      parsed_content[ field_identifier ] = parseFloat( current_value );
    } else if ( attribute_kind === "array" && source_type == "text" ) {
      // For array of strings from a text input (e.g., tags)
      parsed_content[ field_identifier ] = current_value.split( tag_separator_pattern );
    } else if ( attribute_kind === "array" && source_type !== "select" ) {
      // For array of items (e.g., checkboxes)
      parsed_content[ field_identifier ] = parsed_content[ field_identifier ] || [];
      var item_index = parsed_content[ field_identifier ].indexOf( current_value );
      var has_item = item_index !== -1;
      if ( is_checked && !has_item ) {
        parsed_content[ field_identifier ].push( current_value );
      } else {
        // If not checked or already exists, remove the item from the array
        parsed_content[ field_identifier ] = $.grep( parsed_content[ field_identifier ], function( _, i ) {
          return i !== item_index;
        });
      }
    } else {
      // Default case for string or other types
      parsed_content[ field_identifier ] = current_value;
    }

    // If a validator is available, re-validate the data and display errors
    if ( data_verifier != null ) {
      instance_ptr.display_validation_issues( data_verifier.validate( parsed_content, settings_obj.schema ).problem_items );
    }

    // Update the content of the text input area with the stringified JSON
    input_area.val( JSON.stringify( parsed_content, null, 2 ) );
  }

  // Initialize the form by populating fields with existing JSON data
  $.for_each( parsed_content, update_form_display );

  // Attach a change event handler to the form
  data_entry_form.on( 'change', function( event_obj ) {
    var element_tag = event_obj.target.tagName.toLowerCase();
    var event_target_element = $( event_obj.target );
    var source_type;
    if ( element_tag === "select" ) {
      source_type = "select";
    } else {
      source_type = event_target_element.attr( "type" ) || "text";
    }
    var field_identifier = event_target_element.attr( 'name' );
    var current_value = event_target_element.val();
    var is_checked = event_target_element.attr( "checked" ) === "checked";

    handle_form_update( source_type, field_identifier, current_value, is_checked );
  });
}

// Define the default HTML template for the widget
SchemaUI.prototype.WIDGET_LAYOUT = [
  '<div>',
  '<h2>${prop_name}</h2>',
  '{{each(prop_name, prop_details) field_properties}}<p><label>',
  '  {{if prop_details.prop_description}}',
  '    <b>${prop_details.prop_description}</b>',
  '  {{else}}',
  '    <b>${prop_name}</b>',
  '  {{/if}}',
  '  {{if prop_details.data_kind === "time" || prop_details.data_kind === "date"}}',
  '    <input name="${prop_name}" list="${prop_name}_option_list" type="${prop_details.data_kind}"/>',
  '  {{else prop_details.data_kind === "date-time"}}', // Special handling to remove the hyphen for HTML type
  '    <input name="${prop_name}" list="${prop_name}_option_list" type="datetime"/>',
  '  {{else prop_details.data_kind === "integer" || prop_details.data_kind === "number"}}',
  '    <input name="${prop_name}" list="${prop_name}_option_list" type="number"/>',
  '  {{else prop_details.data_kind === "boolean"}}',
  '    <input name="${prop_name}" list="${prop_name}_option_list" type="checkbox"/>',
  '  {{else !( !prop_details.array_items || prop_details.data_kind !== "array" ) }}', // Can't use "&" directly in jQuery.tmpl due to parsing issues
  '    <select multiple="multiple" name="${prop_name}">',
  '    {{each(loop_idx, option_value) prop_details.array_items.enum_options}}',
  '      <option value="${option_value}">${option_value}</option>',
  '    {{/each}}',
  '    </select>',
  '  {{else}}', // Catches string types and any other undefined cases
  '    {{if prop_details.enum_options == null}}',
  '      <input name="${prop_name}" list="${prop_name}_option_list" type="text"/>',
  '    {{else}}',
  '      <select name="${prop_name}">',
  '     {{each(loop_idx, option_value) prop_details.enum_options}}',
  '       <option value="${option_value}">${option_value}</option>',
  '     {{/each}}',
  '    </select>',
  '  {{/if}}',
  '{{/if}}',
  '{{if prop_details.required === true}}<em>(mandatory)</em>{{/if}}',
  '{{if prop_details.required === false}}<em>(optional)</em>{{/if}}',
  '</label></p>{{/each}}',
  '{{each(prop_name, prop_details) field_properties}}<datalist id="${prop_name}_option_list"></datalist>{{/each}}',
  '</div>'
].join( '\n' );

// Expose the main component constructor
return SchemaUI;


}));