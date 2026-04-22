/*=================================================================================================
 * @module: DialogBox
 * @kind: JavaScript Utility
 * @developer: (c) Creative Coder - @creativecoder
 * @preview: http://www.example.com/dialogs
 * @revision: 2.0
 * @prerequisites jQuery 1.9.1 or higher
 *=================================================================================================*/
( function ( jQ ) {
 // Module-level variables for managing multiple dialogs
 var _active_dialogs_list = [],
  _active_dialogs_count = 0,
  _dialog_instance_counter = null,
  _current_dialog_id_string = null;

 function DialogBox( configuration_parameters ) {
  var _this_instance = this;
  
  ////////////////////////////////////////////////////
  // INTERNAL REFERENCES AND CLASS NAMES
  ////////////////////////////////////////////////////
  var _document_obj = jQ( document )
   , _window_obj = window
   , _jquery_window = jQ( _window_obj )
   , _viewport_height = get_viewport_height()
   , _viewport_width = get_viewport_width()
   , _dialog_id_prefix = '__dlg'
   , _close_button_class = 'dlg-btn-dismiss'
   , _generic_close_class = 'dlg-close'
   , _dialog_button_class = 'dlg-action-btn'
   , _overlay_pane_class = 'dlg-backdrop'
   , _dialog_wrapper_class = 'dlg-frame'
   , _dialog_content_class = 'dlg-body'
   , _action_panel_class = 'dlg-footer-actions'
   , _dialog_title_class = 'dlg-header-title'
   , _instance_identifier
   , _z_layer_index = 9000
  ;

  ////////////////////////////////////////////////////
  // DEFAULT CONFIGURATIONS
  ////////////////////////////////////////////////////
  var default_options = {
   is_modal : false
   , header_text : false
   , body_content : ''
   , vertical_offset : -1
   , show_close_btn : true // Display X button
   , close_btn_tip : 'Close dialog'
   , dialog_width : 600
   , custom_close_class : ''
   , escape_to_close : true
   , element_to_focus : null // DOM element to focus on show
   , content_load_type : false // [iframe, ajax, #elementId selector]
   , source_url : false // URL for iframe/ajax content
   , action_buttons : []
   , animation_duration : 200
   , frame_height : '300px'
   , frame_width : '100%'
   , max_content_height : false
   , vertical_align : true
   , is_responsive : false
   , overlay_background : false
   , overlay_alpha : false
  };
  // Merge user parameters with defaults
  var current_settings = jQ.extend( default_options, configuration_parameters );
  
  // Method to initialize the dialog instance
  _this_instance.initialize_dialog = function () {
   _dialog_instance_counter = ( _dialog_instance_counter || 0 ) + 1;
   _instance_identifier = _dialog_id_prefix + _dialog_instance_counter + '__';
   _z_layer_index += _dialog_instance_counter;
  };
  
  // Method to update the dialog's content
  _this_instance.set_dialog_content = function ( content_data ) {
   current_settings.body_content = content_data;
   return _this_instance;
  };

  // Method to display the dialog window
  _this_instance.display_dialog = function () {
   // Generate dialog structure only if it doesn't exist for this ID
   if ( jQ( '.' + _dialog_wrapper_class + '.' + _instance_identifier ).length <= 0 ) {
    var dialog_markup, header_element, content_wrapper, background_overlay, button_panel;
    
    background_overlay = jQ( '<div>' ).addClass( _overlay_pane_class ).addClass( _instance_identifier ).css( 'z-index', _z_layer_index );
    if ( current_settings.overlay_background ) { background_overlay.css( 'background', current_settings.overlay_background ); }
    if ( current_settings.overlay_alpha ) { background_overlay.css( 'opacity', current_settings.overlay_alpha ).css( 'filter', 'alpha(opacity=' + current_settings.overlay_alpha * 100 + ')' ); }
    content_wrapper = jQ( '<div>' ).addClass( _dialog_content_class );
    
    if ( current_settings.header_text ) {
     header_element = jQ( '<div>' ).addClass( _dialog_title_class ).text( current_settings.header_text );
    }
    
    if ( current_settings.body_content ) {
     content_wrapper.append( current_settings.body_content );
    }
    
    if ( current_settings.action_buttons.length ) {
     button_panel = jQ( '<div>' ).addClass( _action_panel_class );
     jQ.each( current_settings.action_buttons, function ( button_index, button_details ) {
      var style_class_name = button_details.classname,
       click_handler_function = button_details.clickEvent;
      if ( jQ.isFunction( style_class_name ) ) { click_handler_function = style_class_name; style_class_name = ''; }
     
      var action_button_element = jQ( '<button>' )
       .addClass( _dialog_button_class ).addClass( button_details.classname )
       .text( button_details.label );
      if ( button_details.clickEvent ) { action_button_element.on( 'click', button_details.clickEvent ); } 
      button_panel.append( action_button_element );
     } );
    }
    // Apply maximum height to the content container
    if ( current_settings.max_content_height ) {
     content_wrapper.css( 'max-height', current_settings.max_content_height );
    }
    
    var dialog_block_element = jQ( '<div>' ).addClass( 'dlg-block' );
    
    if ( current_settings.show_close_btn !== false ) {
     var dismiss_button = jQ( '<span>' ).addClass( 'dlg-btn-dismiss' ).html( '&times;' );
     if ( current_settings.close_btn_tip ) { dismiss_button.attr( 'title', current_settings.close_btn_tip ); }
     dialog_block_element.append( dismiss_button );
    }
    
    dialog_block_element.append( header_element ).append( content_wrapper ).append( button_panel );
    var dialog_container_element = jQ( '<div>' ).addClass( 'dlg-container' ).width( current_settings.dialog_width ).append( dialog_block_element );
    
    dialog_container_element.css( 'margin', '0 auto' );
    if ( current_settings.vertical_offset >= 0 ) {
     dialog_container_element.css( 'margin-top', current_settings.vertical_offset );
    }
    if ( current_settings.is_responsive === true ) {
     dialog_container_element.css( 'max-width', '100%' );
    }
     
    dialog_markup = jQ( '<div>' ).addClass( _dialog_wrapper_class ).addClass( _instance_identifier ).css( 'z-index', _z_layer_index + 1 ).append( dialog_container_element );
    jQ( 'body' ).append( background_overlay );
    jQ( 'body' ).append( dialog_markup );
   }

   // If external content is specified, display dialog first then load data
   if ( current_settings.content_load_type || current_settings.source_url ) {
    render_dialog_content();
   }
   
   // Make dialog and overlay visible
   jQ( '.' + _overlay_pane_class + '.' + _instance_identifier ).show();
   jQ( '.' + _dialog_wrapper_class + '.' + _instance_identifier ).show();
   
   attach_event_handlers();
   reposition_dialog();
   
   // Update count and list of active dialogs
   _active_dialogs_count++;
   _active_dialogs_list.push( _instance_identifier );
   _current_dialog_id_string = _instance_identifier;

   // Prevent body scrolling
   if ( jQ( 'body' ).not( '.no-scroll' ) ) { jQ( 'body' ).addClass( 'no-scroll' ); }
   
   return _this_instance;
  };
  
  // Method to add a custom action button to the dialog
  _this_instance.add_action_button = function ( button_text, style_class_name, click_handler_function ) {
   var button_object = { label: button_text };
   if ( jQ.isFunction( style_class_name ) ) {
    click_handler_function = style_class_name;
    style_class_name = '';
   }   
   button_object.classname = style_class_name;
   
   if ( jQ.isFunction( click_handler_function ) ) {
    button_object.clickEvent = click_handler_function;
   } else {
    button_object.clickEvent = _this_instance.hide_alias; // Default to closing dialog
   }
   current_settings.action_buttons.push( button_object );
   return button_object;
  };
  
  // Pre-defined OK Button
  _this_instance.add_confirm_button = function ( click_handler_function ) {
   _this_instance.add_action_button( 'OK', click_handler_function );
  };
  // Pre-defined Cancel Button
  _this_instance.add_cancel_button = function () {
   _this_instance.add_action_button( 'Cancel', _this_instance.hide_alias );
  };
  // Pre-defined Close Button
  _this_instance.add_dismiss_button = function () {
   _this_instance.add_action_button( 'Close', _this_instance.hide_alias );
  };
  
  // Method to close and remove the dialog
  _this_instance.hide_dialog = function ( event_obj ) {
   // Determine which dialog to close; current active one by default
   var target_dialog_id = _current_dialog_id_string ? _current_dialog_id_string : _instance_identifier;
   
   detach_event_handlers( target_dialog_id );
   
   var dialog_element_wrapper = jQ( '.' + _dialog_wrapper_class + '.' + target_dialog_id ),
    background_overlay = jQ( '.' + _overlay_pane_class + '.' + target_dialog_id );
   
   dialog_element_wrapper.fadeTo( current_settings.animation_duration, 0, function () {
    jQ( this ).remove();
   } );
   background_overlay.fadeTo( current_settings.animation_duration, 0, function () {
    jQ( this ).remove();
   } );
   
   _active_dialogs_count--;
   _active_dialogs_list.pop();
   _current_dialog_id_string = _active_dialogs_list[ _active_dialogs_list.length - 1 ];
   if ( _active_dialogs_count === 0 ) { jQ( 'body' ).removeClass( 'no-scroll' ); }

   return false;
  };
  
  // Aliases for display and hide methods
  _this_instance.show_alias = _this_instance.display_dialog;
  _this_instance.hide_alias = _this_instance.hide_dialog;
  
  // Initialize this dialog instance
  _this_instance.initialize_dialog();
  
  return this;
  
  ////////////////////////////////////////////////////
  // HELPER FUNCTIONS
  ////////////////////////////////////////////////////
  // Get current viewport height
  function get_viewport_height() {
   return _window_obj.innerHeight || _jquery_window.height();
  }
  
  // Get current viewport width
  function get_viewport_width() {
   return _window_obj.innerWidth || _jquery_window.width();
  }
  
  // Attach event listeners for the dialog
  function attach_event_handlers() {
   var dialog_element_wrapper = '.' + _dialog_wrapper_class + '.' + _instance_identifier,
    background_overlay = '.' + _overlay_pane_class + '.' + _instance_identifier;
          
   jQ( dialog_element_wrapper ).on( 'click', '.' + _generic_close_class, _this_instance.hide_alias );
   if ( current_settings.custom_close_class ) {
    var clean_close_class = current_settings.custom_close_class.replace( '.', '' );
    jQ( dialog_element_wrapper ).on( 'click', '.' + clean_close_class, _this_instance.hide_alias );
   }
   
   if ( current_settings.show_close_btn === true ) {
    jQ( dialog_element_wrapper ).on( 'click', '.' + _close_button_class, _this_instance.hide_alias );
   }
   
   if ( current_settings.is_modal !== true ) {
    jQ( 'body' ).on( 'click', background_overlay + ', ' + dialog_element_wrapper, _this_instance.hide_alias );
    jQ( 'body' ).on( 'click', dialog_element_wrapper + ' .dlg-block', function ( event_obj ) {
     event_obj.stopPropagation(); // Prevent clicks inside dialog from closing it
    } );
   }
   
   if ( current_settings.escape_to_close !== false ) {
    enable_escape_key_close();
   }
   // Re-position on window resize
   _jquery_window.on( 'resize', reposition_dialog );
  }
  
  // Detach event listeners for a specific dialog
  function detach_event_handlers( target_dialog_id ) {
   var dialog_element_wrapper = '.' + _dialog_wrapper_class + '.' + target_dialog_id,
    background_overlay = '.' + _overlay_pane_class + '.' + target_dialog_id;
    
   // Remove click handlers for overlay and wrapper
   jQ( background_overlay + ', ' + dialog_element_wrapper ).off( 'click' );
   
   // Remove click handlers for close buttons
   jQ( dialog_element_wrapper + '.' + _generic_close_class ).off( 'click' );
   if ( current_settings.custom_close_class ) {
    var clean_close_class = current_settings.custom_close_class.replace( '.', '' );
    jQ( dialog_element_wrapper + '.' + clean_close_class ).off( 'click' );
   }
   // Remove escape key listener
   _document_obj.off( 'keydown.' + target_dialog_id );
  }
  
  // Enable closing the dialog with the Escape key
  function enable_escape_key_close() {
   _document_obj.on( 'keydown.' + _instance_identifier, function ( event_obj ) {
    if ( event_obj.which === 27 ) { // Key code for Escape
     event_obj.stopImmediatePropagation();
     _this_instance.hide_alias( _current_dialog_id_string );
     return false;
    }
   } );
  }
  
  // Update the content within the DOM wrapper
  function update_element_content( new_content_data ) {
   var content_dom_container = '.' + _dialog_wrapper_class + '.' + _instance_identifier + ' .' + _dialog_content_class;
   _this_instance.set_dialog_content( new_content_data );
   jQ( content_dom_container ).append( new_content_data );
   set_initial_focus();
   reposition_dialog();
  }
  
  // Render content based on specified type (AJAX, Iframe, or DOM element)
  function render_dialog_content() {
   if ( current_settings.content_load_type === 'ajax' && current_settings.source_url ) {
    // Load URL content via AJAX
    jQ.get( current_settings.source_url, function ( retrieved_data ) {
     var content_div = jQ( '<div class="dlg-ajax-wrapper"></div>' ).append( retrieved_data );
     update_element_content( content_div );
     return false;
    } );
    
   } else if ( current_settings.content_load_type === 'iframe' && current_settings.source_url ) {
    var iframe_element = jQ( '<iframe class="dlg-iframe"></iframe>' );
    iframe_element.attr( 'src', current_settings.source_url );
    
    iframe_element.css( {
     'border': 0,
     'width' : current_settings.frame_width,
     'height': current_settings.frame_height
    } );
    
    update_element_content( iframe_element );
    // Dynamic height adjustment functionality - to be implemented
    
   } else if ( current_settings.content_load_type.indexOf( '#' ) === 0 ) { // If content is from a DOM element ID
    var content_from_dom = jQ( current_settings.content_load_type ).html();
    update_element_content( content_from_dom );
   }
  }
  
  // Set initial focus to an element within the dialog
  function set_initial_focus() {
   var dialog_dom_element = '.' + _dialog_wrapper_class + ' ' + '.' + _dialog_content_class;
   if ( current_settings.element_to_focus === true ) {
    jQ( dialog_dom_element ).find( 'input,textarea' ).first().focus();
   }
  }
  
  // Re-center the dialog vertically
  function reposition_dialog() {
   // Skip re-centering if vertical_offset is explicitly set or vertical_align is disabled
   if ( ( current_settings.vertical_offset !== '' && current_settings.vertical_offset >= 0 ) || current_settings.vertical_align === false ) {
    return false;
   }
   // Perform vertical centering
   var dialog_block_container = '.' + _dialog_wrapper_class + '.' + _instance_identifier + ' .dlg-block',
    dialog_width_pixels = jQ( dialog_block_container ).outerWidth(),
    dialog_height_pixels = jQ( dialog_block_container ).outerHeight();

   var new_top_position = ( ( _viewport_height - dialog_height_pixels ) / 2 ) - 20;
   new_top_position = new_top_position > 0 ? new_top_position : 0;
   jQ( '.' + _dialog_wrapper_class + '.' + _instance_identifier + ' .dlg-container' ).css( 'margin-top', new_top_position ); 
  }
 };
 // Expose DialogBox constructor to the global window object
 window.DialogBox = DialogBox;
} ( jQuery ) );