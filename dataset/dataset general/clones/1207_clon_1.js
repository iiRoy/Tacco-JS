$(   document  ).ready( function( $ ) {

  // This block ensures that all existing textile fields on the page
  // are properly initialized with the Textile Editor.
  // It iterates through all textarea elements whose 'name' attribute
  // contains 'field_id_', which is a common pattern for such fields.
  $( "textarea[name*=\'field_id_\']" )
    .each( function( ) {

      // Retrieve the 'name' attribute of the current textarea,
      // which will also serve as its ID if one isn't already present.
      var canvas = $(this).attr("name");

      // Check if the textarea already has an 'id' attribute.
      // If not, assign the 'name' attribute value as its 'id'.
      if ( ! $(this).attr('id') ) {
        $(this)
          .attr('id', canvas);
      }

      // Verify if the editor options are defined for this specific field.
      // This ensures we only apply the editor if configuration exists.
      if ( typeof(EE.teh_options.fields) !== "undefined" && typeof(EE.teh_options.fields[canvas]) !== "undefined" ) {

        // Get the specific field ID from the global options.
        var id = EE.teh_options.fields[canvas];

        // If a markItUp editor instance already exists for this field (indicating a default editor),
        // remove it before applying the Textile Editor. This prevents conflicts.
        if ( $( "#markItUpField_id_" + id ).length ) {
          $( "#" + canvas ).markItUpRemove( );
        }

        // Initialize the Textile Editor on the textarea using the defined options.
        $("#"+canvas).TextileEditor(EE.teh_options);
        // Also, enable the file browser functionality for this editor instance.
        teh_filebrowser( canvas );
      }
    } );


  // This section handles the dynamic toggling of the TEH toolbar
  // and default formatting buttons based on the user's selection
  // in the formatting menu (e.g., changing from 'textile' to 'html').
  // It targets all select elements whose 'name' attribute contains 'field_ft_'.
  $( "select[name*=\'field_ft_\']" )
    .each( function() {

      // Extract the numeric ID from the 'name' attribute (e.g., from 'field_ft_123' get '123').
      var id = $(this).attr("name").substring(9);
      // Construct the 'canvas' ID for the associated textarea.
      var canvas = "field_id_" + id;
      // Identify the toolbar element associated with this field.
      var toolbar = $( "#textile-toolbar-" + canvas );
      // Determine if the field was initially configured to display default formatting buttons.
      var eebuttons = ( typeof(EE.publish.markitup.fields) !== "undefined" && typeof(EE.publish.markitup.fields[canvas]) !== "undefined" ) ? true : false;

      // Attach a change event handler to the select element.
      $(this).change( function( ) {
        // Re-locate the toolbar as its presence might have changed.
        toolbar = $( "#textile-toolbar-" + canvas );

        // If the selected formatting option is 'textile'.
        if ( $(this).val() == "textile" ) {
          // If default EE buttons were present and still are, remove them.
          if ( eebuttons && $( "#markItUpField_id_" + id ).length ) {
            $( "#" + canvas ).markItUpRemove();
          }
          // If the textile toolbar is not present, initialize the Textile Editor.
          if ( toolbar.length == 0 ) {
            $( "#" + canvas ).TextileEditor( EE.teh_options );
            teh_filebrowser( canvas );
          }
        }
        // If the selected formatting option is not 'textile' (e.g., 'html').
        else {
          // If the textile toolbar is present, remove it.
          if ( toolbar.length > 0 ) {
            toolbar.remove();
          }
          // If default EE buttons were configured and are currently absent,
          // re-initialize the default markItUp editor.
          if ( eebuttons && ! $( "#markItUpField_id_" + id ).length ) {
            $( "#" + canvas ).markItUp( mySettings );
          }
        }
      } );
    } );

  // This part of the script manages the "write mode" functionality.
  // It intercepts clicks on elements with the 'write_mode_trigger' class
  // to toggle between the Textile Editor and default HTML buttons
  // for the write mode textarea.
  // ExpressionEngine typically adds formatting buttons to write mode
  // regardless of field settings, so we ensure our editor behaves similarly.
  $( ".write_mode_trigger" )
    .click( function( ) {
      // Check if the parent publish field contains a textile toolbar.
      if ( $(this).parents(".publish_field").find(".textile-toolbar").length ) {
        // If a textile toolbar is not already present for the write mode textarea.
        if ( ! $( "#textile-toolbar-write_mode_textarea" ).length ) {
          // Remove any existing markItUp editor.
          $( "#write_mode_textarea" ).markItUpRemove( );
          // Initialize the Textile Editor for the write mode textarea.
          $( "#write_mode_textarea" ).TextileEditor( EE.teh_options );
          // Enable file browsing for this editor.
          teh_filebrowser( "write_mode_textarea" );
        }
        // Focus on the write mode textarea after initialization.
        $( "#write_mode_textarea" ).focus( );
      }
      // If the parent publish field does NOT contain a textile toolbar.
      else {
        // If the textile toolbar IS present for write mode, remove it.
        if ( $( "#textile-toolbar-write_mode_textarea" ).length ) {
          $( "#textile-toolbar-write_mode_textarea" ).remove( );
        }
        // If the default markItUp editor is not present, initialize it.
        if ( ! $( "#markItUpWrite_mode_textarea" ).length ) {
          $( "#write_mode_textarea" ).markItUp( myWritemodeSettings );
        }
      }
      // Prevent the default action of the click event.
      return false;
    } );

} );