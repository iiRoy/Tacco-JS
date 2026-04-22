/*
 * Dropp - A jQuery Plugin for Custom Select Menus
 * Project URL: http://github.com/matrushka/Dropp
 *
 * This plugin requires jQuery version 1.3 or higher to function correctly.
 *
 * Dropp aims to replace standard HTML <select> elements with highly
 * customizable and styleable alternatives, enhancing user experience and design flexibility.
 *
 * Developed by Baris Gumustas in 2010.
 * All rights reserved.
 */
( function ( $ ) {

  // Global variables to manage keyboard input caching for dropdowns.
  window.dropp_key_cache        = {};
  window.dropp_key_cache.cache  = '';
  window.dropp_key_cache.timeout= null;


  /**
   * Hides all currently visible dropdown lists and removes their active class.
   * This is typically called when a dropdown loses focus or another UI element is clicked.
   */
  function clearDropDowns () {

    var visible_list, visible_list_data;

    visible_list = $( '.dropp ul:visible' );

    if ( visible_list.length > 0 ) {

      visible_list.hide();

      // Retrieve the settings associated with the dropdown to get the active class name.
      visible_list_data = visible_list.closest( '.dropp' ).data( 'dropp' );

      if ( typeof visible_list_data !== 'undefined' ) {

        visible_list.removeClass( visible_list_data.settings.class_active_dropdown );

      }

    }

  }


  // Prevent click events within a dropdown from propagating up to the document.
  $( '.dropp' ).live( 'click', function ( event ) {

    event.stopPropagation();

  } );


  // Handles hover states for list items within dropdowns.
  $( '.dropp ul li a' ).live( 'mouseover', function () {

    // Remove 'hover' class from all links in the current list.
    $( this ).closest( 'ul' ).find( 'a' ).removeClass( 'hover' );

    // Add 'hover' class to the currently moused-over link.
    $( this ).addClass( 'hover' );

  } );


  // Global keypress handler for document-wide interactions.
  $( document ).bind( 'keypress', function ( event ) {

    // If the escape key (keyCode 27) is pressed, prevent default action and hide all dropdowns.
    if ( event.keyCode === 27 ) {
      event.preventDefault();
      clearDropDowns();
    }

  } );


  // Global click handler to close any open dropdowns when clicking outside.
  $( document ).click( function () {

    clearDropDowns();

  } );


  /**
   * The main Dropp plugin function.
   * Initializes custom dropdown behavior for selected <select> elements.
   * @param {Object} user_settings - Optional settings to override defaults.
   */
  $.fn.dropp = function ( user_settings ) {

    // Default configuration options for the plugin.
    var settings = {
      'phrase_on_multiple'         : false, // Text to display when multiple options are selected (e.g., "Multiple options selected").
      'class_dropdown_wrapper'     : 'dropdown_wrapper', // CSS class for the wrapper div around the custom dropdown.
      'class_dropdown_list'        : 'dropdown_list',    // CSS class for the ul element representing the dropdown list.
      'class_visible_dropdown'     : 'dropdown',         // CSS class for the clickable visible part of the dropdown.
      'class_option_selected'      : 'selected',         // CSS class for a selected option in the list.
      'class_active_dropdown'      : 'active',           // CSS class for the active state of the visible dropdown.
      'substract_list_border_width': true,               // Adjust list width for borders.
      'keyboard_support'           : true                // Enable keyboard navigation for dropdowns.
    };

    // Merge user-provided settings with the default settings.
    if ( user_settings ) {
      $.extend( settings, user_settings );
    }

    // Iterate over each selected element to apply the dropp functionality.
    return this.each( function () {

      // Declare local variables for the current dropdown instance.
      var select, dropdown, list, values, list_width, widest_element, wrapper, select_class, list_of_contents;

      // Initialize variables.
      list_of_contents = [];
      widest_element   = null;


      select = $( this ); // The original <select> element.

      // Store settings data on the select element for later retrieval, especially for global event handlers.
      select.data( 'dropp', {
        settings : settings
      } );

      // Hide the original select element.
      select.hide();

      // Wrap the select element in a div to serve as the main container for the custom dropdown.
      select.wrap( '<div></div>' );

      select_class = select.attr( 'class' ); // Get original classes from the select.

      if ( typeof ( select_class ) === 'undefined' ) {
        select_class = null;
      }

      // Apply wrapper classes to the parent div.
      select.parent().attr( 'class', select_class ).addClass( settings.class_dropdown_wrapper ).addClass( 'dropp' );


      // Create the visible dropdown element (the clickable button/link).
      dropdown = $( '<a href="#"/>' ).addClass( settings.class_visible_dropdown ).appendTo( select.parent() );

      // Create the unordered list that will serve as the dropdown menu.
      list = $( '<ul/>' ).addClass( settings.class_dropdown_list ).addClass( 'dropp_dropdown_list' ).hide().appendTo( select.parent() );

      // Find the closest wrapper element for this dropdown instance.
      wrapper = list.closest( '.' + settings.class_dropdown_wrapper );


      // Set initial CSS properties for the dropdown list.
      list.css( 'position', 'absolute' ).css( 'z-index', '9999' );


      // Iterate over each <option> in the original <select> element.
      select.find( 'option' ).each( function () {

        var item, list, list_item, link;

        item = $( this ); // The current <option> element.

        // Store the text content for keyboard search functionality.
        list_of_contents.push( item.text().toLowerCase() );

        // Find the corresponding custom list for the current select.
        list = item.closest( '.' + settings.class_dropdown_wrapper ).find( 'ul.dropp_dropdown_list' );

        // Create a list item (<li>) and append it to the custom dropdown list.
        list_item = $( '<li/>' ).appendTo( list );

        // Create an anchor tag (<a>) for the list item, displaying the option's text.
        link = $( '<a href="#"/>' ).text( item.text() );


        // Store a reference to the original option element within the link's data.
        link.data( 'option', item );

        // Append the link to the list item.
        list_item.append( link );

        // Store a reference to the replacement link within the original option's data.
        item.data( 'replacement', link );


        // Handle initial selection for multiple select boxes.
        if ( typeof select.attr( 'multiple' ) !== undefined && ( select.attr( 'multiple' ) === true || select.attr( 'multiple' ) === 'multiple' ) ) {

          if ( typeof item.attr( 'selected' ) !== undefined && ( item.attr( 'selected' ) === true || item.attr( 'selected' ) === 'selected' ) ) {

            link.addClass( settings.class_option_selected );

          }

        }


        // Custom 'select' event listener for each dropdown item.
        link.bind( 'select', function ( event, trigger_drowndown ) {

          event.preventDefault(); // Prevent default link behavior.

          var link, item, select, dropdown, values;

          link     = $( this );
          item     = link.data( 'option' );
          select   = wrapper.find( 'select' );
          dropdown = wrapper.find( '.' + settings.class_visible_dropdown );


          // Handle single-select dropdowns.
          if ( typeof select.attr( 'multiple' ) === 'undefined' || select.attr( 'multiple' ) === false ) {

            select.find( 'option:selected' ).removeAttr( 'selected' ); // Deselect all other options.
            dropdown.text( $( this ).text() );                       // Update the visible dropdown text.
            item.attr( 'selected', 'selected' );                     // Select the current option.
            list.hide();                                             // Hide the dropdown list.
            dropdown.removeClass( settings.class_active_dropdown );  // Remove active class from dropdown.

          } else { // Handle multi-select dropdowns.

            // Toggle selected state for the option.
            if ( typeof item.attr( 'selected' ) === 'undefined' || item.attr( 'selected' ) === false ) {
              item.attr( 'selected', 'selected' );
              link.addClass( settings.class_option_selected );
            } else {
              item.removeAttr( 'selected' );
              link.removeClass( settings.class_option_selected );
            }

            values = [];
            // Collect text of all selected options.
            select.find( 'option:selected' ).each( function () {
              values.push( $( this ).text() );
            } );

            // Update the visible dropdown text based on selected options.
            if ( values.length === 0 ) {
              if ( typeof select.attr( 'placeholder' ) !== 'undefined' ) {
                dropdown.text( select.attr( 'placeholder' ) );
              } else {
                dropdown.html( '&nbsp;' );
              }
            } else {
              if ( values.length > 1 && settings.phrase_on_multiple ) {
                dropdown.text( settings.phrase_on_multiple );
              } else {
                dropdown.text( values.join( ', ' ) );
              }
            }

          }

          // Trigger the 'change' event on the original select element if specified.
          if ( trigger_drowndown ) {
            select.trigger( 'change' );
          }

        } );

        // Click event handler for each list item.
        link.click( function () {
          $( this ).trigger( 'select', [ true ] ); // Trigger the custom 'select' event.
          return false; // Prevent default link navigation.
        } );

      } ); // End of option iteration.


      // Enable keyboard navigation if supported by settings.
      if ( settings.keyboard_support ) {

        dropdown.bind( 'keypress', function ( event ) {

          var is_scrollable, character, found_index, cursor_pattern, found_item, option_index;

          event.preventDefault(); // Prevent default keypress actions.
          clearTimeout( window.dropp_key_cache.timeout ); // Reset keyboard cache timeout.

          // Handle different key codes for navigation.
          switch ( event.keyCode ) {

            case 38: // Up arrow key.
              // Find the previous list item and apply hover state.
              found_item = list.find( 'a.hover' ).closest( 'li' ).prev( 'li' );
              if ( found_item.length > 0 ) {
                list.find( 'a.hover' ).removeClass( 'hover' );
                found_item.find( 'a' ).addClass( 'hover' );
                // Scroll the list to make the item visible.
                found_item.closest( 'ul' ).get( 0 ).scrollTop = found_item.closest( 'li' ).get( 0 ).offsetTop;
              }
              break;

            case 40: // Down arrow key.
              // Find the next list item and apply hover state.
              found_item = list.find( 'a.hover' ).closest( 'li' ).next( 'li' );
              // If no item is hovered, start from the first item.
              if ( found_item.length === 0 && list.find( 'a.hover' ).length === 0 ) {
                found_item = list.find( 'li:eq(0)' );
              }
              if ( found_item.length > 0 ) {
                list.find( 'a.hover' ).removeClass( 'hover' );
                found_item.find( 'a' ).addClass( 'hover' );
                // Scroll the list to make the item visible.
                found_item.closest( 'ul' ).get( 0 ).scrollTop = found_item.closest( 'li' ).get( 0 ).offsetTop;
              }
              break;

            case 13: // Enter key.
              // Trigger the 'select' event on the hovered item.
              list.find( 'a.hover' ).trigger( 'select' );
              break;

            default: // Any other character key.
              character = String.fromCharCode( event.which );
              window.dropp_key_cache.cache += character; // Append character to cache.

              found_index = null;
              // Search for an option matching the current cached input.
              for ( option_index = 0; option_index < list_of_contents.length; option_index += 1 ) {
                cursor_pattern = new RegExp( window.dropp_key_cache.cache.toLowerCase() );
                if ( cursor_pattern.test( list_of_contents[ option_index ] ) ) {
                  found_index = option_index;
                  break;
                }
              }

              if ( found_index !== null ) {
                found_item  = list.find( 'li:eq(' + found_index.toString() + ') a' );
                is_scrollable = list.get( 0 ).scrollHeight > list.height();
                if ( is_scrollable ) {
                  found_item.closest( 'ul' ).get( 0 ).scrollTop = found_item.closest( 'li' ).get( 0 ).offsetTop;
                }

                list.find( 'li a.hover' ).removeClass( 'hover' );
                found_item.addClass( 'hover' );
              }
              break;

          } // End of switch statement.

          // Set a timeout to clear the keyboard cache after a short delay.
          window.dropp_key_cache.timeout = setTimeout( function () {
            window.dropp_key_cache.cache = '';
          }, 400 );

          return false; // Prevent default keypress action.

        } );

      } // End of keyboard support block.


      // Initialize the visible dropdown text after all options have been processed.
      if ( select.find( 'option:selected' ).length === 0 ) {

        if ( typeof select.attr( 'placeholder' ) !== 'undefined' ) {
          dropdown.text( select.attr( 'placeholder' ) ); // Use placeholder if available.
        } else {
          dropdown.html( '&nbsp;' ); // Default empty state.
        }

      } else {

        if ( typeof select.attr( 'multiple' ) !== undefined && ( select.attr( 'multiple' ) === true || select.attr( 'multiple' ) === 'multiple' ) ) {

          values = [];
          select.find( 'option:selected' ).each( function () {
            values.push( $( this ).text() );
          } );
          dropdown.html( values.join( ', ' ) ); // Join multiple selected values.

        } else {

          dropdown.text( $( this ).find( 'option:selected' ).text() ); // Display single selected option text.

        }

      }


      // Click event handler for the visible dropdown element.
      dropdown.click( function () {

        var list_data;

        if ( list.is( ':visible' ) ) { // If the list is currently visible, hide it.

          list.hide();
          dropdown.removeClass( settings.class_active_dropdown );
          $( 'ul.dropp_dropdown_list' ).hide(); // Ensure all other dropdowns are hidden.

        } else { // If the list is hidden, show it.

          $( 'ul.dropp_dropdown_list' ).hide(); // Hide all other dropdowns first.
          list.show();
          dropdown.addClass( settings.class_active_dropdown ); // Add active class to the visible dropdown.


          // Manage and adjust the dropdown list width.
          list_data = select.data( 'dropp' ); // Retrieve cached data for this dropdown.

          // Check if the dropdown's outer width has changed since last cache.
          if ( list_data.cached_width !== dropdown.outerWidth() ) {

            list_width = dropdown.outerWidth();

            // Subtract border width from calculated list width if setting is true.
            if ( settings.substract_list_border_width ) {
              list_width -= ( parseInt( list.css( 'borderLeftWidth' ), 10 ) + parseInt( list.css( 'borderRightWidth' ), 10 ) );
            }

            list.css( 'min-width', list_width ); // Apply minimum width.

            // Special handling for IE6 due to min-width issues.
            if ( $.browser.msie && $.browser.version === '6.0' ) {

              // Find the widest option within the list.
              list.find( 'a' ).each( function () {
                if ( widest_element === null || widest_element.width() < $( this ).width() ) {
                  widest_element = $( this );
                }
              } );

              // If the widest option is wider than the calculated list width, use its width.
              if ( widest_element.width() > list_width ) {
                list.width( widest_element.width() );
              } else {
                list.width( list_width );
              }

            }

            // Update the cached width in the dropdown's data.
            list_data.cached_width = dropdown.outerWidth();
            list.data( 'dropp', list_data );

          } // End of width management.

        } // End of list visibility toggle.

        return false; // Prevent default link behavior.

      } ); // End of dropdown click event.

    } ); // End of this.each loop.

  }; // End of $.fn.dropp.

} ( jQuery ) ); // End of IIFE.