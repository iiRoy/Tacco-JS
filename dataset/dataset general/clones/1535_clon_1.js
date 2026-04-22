/*
 *  This file contains the core logic for the MultiSelect plugin.
 *  It's a free software product, distributed under the WTFPL license.
 *  For more details, please refer to the original license text.
 *  (Original license: http://sam.zoy.org/wtfpl/COPYING)
 */


! function ( $ ) {


  "use strict" ; // Enforce strict mode for cleaner code execution.


  /*
   *  MULTISELECT CLASS DEFINITION
   *  ====================================
   *  This section defines the main MultiSelect class.
   */

  var MultiSelect = function ( element , options ) {

    // Store the configuration options for this instance.
    this . options = options ;
    // Reference to the original select element.
    this . $element = $ ( element ) ;

    // Initialize the main container for the multi-select interface.
    this . $container = $ ( '<div/>' , { 'class' : "ms-container" } ) ;

    // Initialize containers for selectable and selected items.
    this . $selectableContainer = $ ( '<div/>' , { 'class' : 'ms-selectable' } ) ;
    this . $selectionContainer = $ ( '<div/>' , { 'class' : 'ms-selection' } ) ;

    // Initialize unordered lists for items.
    this . $selectableUl = $ ( '<ul/>' , { 'class' : "ms-list" , 'tabindex' : '-1' } ) ;
    this . $selectionUl = $ ( '<ul/>' , { 'class' : "ms-list" , 'tabindex' : '-1' } ) ;

    // Initial scroll position.
    this . scrollTo = 0 ;

    // Selector for active list elements (visible, not optgroup labels/containers, not disabled).
    this . elemsSelector = 'li:visible:not(.ms-optgroup-label,.ms-optgroup-container,.' + options . disabledClass + ')' ;

  } ; // End of MultiSelect constructor.


  // Define prototype methods for the MultiSelect class.
  MultiSelect . prototype = {

    constructor : MultiSelect , // Explicitly set the constructor.

    /**
     *  Initializes the multi-select component.
     */
    init : function ( ) {

      var that = this , // Cache 'this' for use in inner functions.
          ms = this . $element ; // Reference to the original select element.

      // Check if the multi-select container already exists.
      if ( ms . next ( '.ms-container' ) . length === 0 ) {

        // Hide the original select element.
        ms . css ( { position : 'absolute' , left : '-9999px' } ) ;

        // Assign an ID to the original select if it doesn't have one.
        ms . attr ( 'id' , ms . attr ( 'id' ) ? ms . attr ( 'id' ) : Math . ceil ( Math . random ( ) * 1000 ) + 'multiselect' ) ;
        // Set the ID for the new container.
        this . $container . attr ( 'id' , 'ms-' + ms . attr ( 'id' ) ) ;
        // Add custom CSS class if provided in options.
        this . $container . addClass ( that . options . cssClass ) ;

        // Generate list items from existing options.
        ms . find ( 'option' ) . each ( function ( ) {
          that . generateLisFromOption ( this ) ;
        } ) ;

        // Initially hide optgroup labels in the selection list.
        this . $selectionUl . find ( '.ms-optgroup-label' ) . hide ( ) ;


        // Append custom headers/footers if provided in options.
        if ( that . options . selectableHeader ) {
          that . $selectableContainer . append ( that . options . selectableHeader ) ;
        }
        that . $selectableContainer . append ( that . $selectableUl ) ;
        if ( that . options . selectableFooter ) {
          that . $selectableContainer . append ( that . options . selectableFooter ) ;
        }


        if ( that . options . selectionHeader ) {
          that . $selectionContainer . append ( that . options . selectionHeader ) ;
        }
        that . $selectionContainer . append ( that . $selectionUl ) ;
        if ( that . options . selectionFooter ) {
          that . $selectionContainer . append ( that . options . selectionFooter ) ;
        }

        // Assemble the complete multi-select container.
        that . $container . append ( that . $selectableContainer ) ;
        that . $container . append ( that . $selectionContainer ) ;
        // Insert the new container after the original select element.
        ms . after ( that . $container ) ;


        // Activate mouse and keyboard interaction for both lists.
        that . activeMouse ( that . $selectableUl ) ;
        that . activeKeyboard ( that . $selectableUl ) ;

        // Determine the action for item selection (click or dblclick).
        var action = that . options . dblClick ? 'dblclick' : 'click' ;

        // Attach event handlers for selecting and deselecting items.
        that . $selectableUl . on ( action , '.ms-elem-selectable' , function ( ) {
          that . select ( $ ( this ) . data ( 'ms-value' ) ) ;
        } ) ;
        that . $selectionUl . on ( action , '.ms-elem-selection' , function ( ) {
          that . deselect ( $ ( this ) . data ( 'ms-value' ) ) ;
        } ) ;

        that . activeMouse ( that . $selectionUl ) ;
        that . activeKeyboard ( that . $selectionUl ) ;

        // Focus handler for the original select element.
        ms . on ( 'focus' , function ( ) {
          that . $selectableUl . focus ( ) ;
        } ) ;

      } // End of initial setup if container doesn't exist.

      // Get initially selected values and apply them.
      var selectedValues = ms . find ( 'option:selected' ) . map ( function ( ) { return $ ( this ) . val ( ) ; } ) . get ( ) ;
      that . select ( selectedValues , 'init' ) ;

      // Call the afterInit callback if it's a function.
      if ( typeof that . options . afterInit === 'function' ) {
        that . options . afterInit . call ( this , this . $container ) ;
      }

    } , // End of init function.


    /**
     *  Generates list items (`<li>`) from an `<option>` element.
     *  @param {HTMLOptionElement} option - The HTML option element.
     *  @param {number} [index] - The position to insert the element.
     *  @param {string} [$container] - The container to insert into, if nested.
     */
    'generateLisFromOption' : function ( option , index , $container ) {

      var that = this ,
          ms = that . $element ,
          attributes = "" ,
          $option = $ ( option ) ;

      // Collect custom attributes from the option element.
      for ( var cpt = 0 ; cpt < option . attributes . length ; cpt ++ ) {
        var attr = option . attributes [ cpt ] ;

        // Exclude 'value' and 'disabled' as they are handled separately.
        if ( attr . name !== 'value' && attr . name !== 'disabled' ) {
          attributes += attr . name + '="' + attr . value + '" ' ;
        }
      }

      // Create selectable and selected list items.
      var selectableLi = $ ( '<li ' + attributes + '><span>' + that . escapeHTML ( $option . text ( ) ) + '</span></li>' ) ,
          selectedLi = selectableLi . clone ( ) ,
          value = $option . val ( ) ,
          elementId = that . sanitize ( value ) ;

      // Configure the selectable list item.
      selectableLi
        . data ( 'ms-value' , value )
        . addClass ( 'ms-elem-selectable' )
        . attr ( 'id' , elementId + '-selectable' ) ;

      // Configure the selected list item.
      selectedLi
        . data ( 'ms-value' , value )
        . addClass ( 'ms-elem-selection' )
        . attr ( 'id' , elementId + '-selection' )
        . hide ( ) ; // Initially hide selected items.

      // Apply disabled class if the option or select is disabled.
      if ( $option . prop ( 'disabled' ) || ms . prop ( 'disabled' ) ) {
        selectedLi . addClass ( that . options . disabledClass ) ;
        selectableLi . addClass ( that . options . disabledClass ) ;
      }

      // Handle optgroup structure.
      var $optgroup = $option . parent ( 'optgroup' ) ;

      if ( $optgroup . length > 0 ) {

        var optgroupLabel = $optgroup . attr ( 'label' ) ,
            optgroupId = that . sanitize ( optgroupLabel ) ,
            $selectableOptgroup = that . $selectableUl . find ( '#optgroup-selectable-' + optgroupId ) ,
            $selectionOptgroup = that . $selectionUl . find ( '#optgroup-selection-' + optgroupId ) ;

        // If optgroup containers don't exist, create them.
        if ( $selectableOptgroup . length === 0 ) {

          var optgroupContainerTpl = '<li class="ms-optgroup-container"></li>' ,
              optgroupTpl = '<ul class="ms-optgroup"><li class="ms-optgroup-label"><span>' + optgroupLabel + '</span></li></ul>' ;

          $selectableOptgroup = $ ( optgroupContainerTpl ) ;
          $selectionOptgroup = $ ( optgroupContainerTpl ) ;

          $selectableOptgroup . attr ( 'id' , 'optgroup-selectable-' + optgroupId ) ;
          $selectionOptgroup . attr ( 'id' , 'optgroup-selection-' + optgroupId ) ;

          $selectableOptgroup . append ( $ ( optgroupTpl ) ) ;
          $selectionOptgroup . append ( $ ( optgroupTpl ) ) ;

          // If selectable optgroup is enabled, attach click handlers.
          if ( that . options . selectableOptgroup ) {

            $selectableOptgroup . find ( '.ms-optgroup-label' ) . on ( 'click' , function ( ) {
              var values = $optgroup . children ( ':not(:selected, :disabled)' ) . map ( function ( ) { return $ ( this ) . val ( ) } ) . get ( ) ;
              that . select ( values ) ;
            } ) ;

            $selectionOptgroup . find ( '.ms-optgroup-label' ) . on ( 'click' , function ( ) {
              var values = $optgroup . children ( ':selected:not(:disabled)' ) . map ( function ( ) { return $ ( this ) . val ( ) } ) . get ( ) ;
              that . deselect ( values ) ;
            } ) ;

          }

          // Append the new optgroup containers to their respective UIs.
          that . $selectableUl . append ( $selectableOptgroup ) ;
          that . $selectionUl . append ( $selectionOptgroup ) ;

        }

        // Determine insertion index for nested items.
        index = index == undefined ? $selectableOptgroup . find ( 'ul' ) . children ( ) . length : index + 1 ;
        // Insert the list items into the optgroup.
        selectableLi . insertAt ( index , $selectableOptgroup . children ( ) ) ;
        selectedLi . insertAt ( index , $selectionOptgroup . children ( ) ) ;

      } else {

        // If no optgroup, insert directly into the main list.
        index = index == undefined ? that . $selectableUl . children ( ) . length : index ;

        selectableLi . insertAt ( index , that . $selectableUl ) ;
        selectedLi . insertAt ( index , that . $selectionUl ) ;

      }

    } , // End of generateLisFromOption function.


    /**
     *  Adds new options to the multi-select.
     *  @param {object|Array<object>} options - Single option object or array of option objects.
     */
    'addOption' : function ( options ) {

      var that = this ;

      // Normalize single option object into an array.
      if ( options . value !== undefined && options . value !== null ) {
        options = [ options ] ;
      }

      // Iterate over each option to add.
      $ . each ( options , function ( index , option ) {

        // Only add if value is defined and option doesn't already exist.
        if ( option . value !== undefined && option . value !== null &&
             that . $element . find ( "option[value='" + option . value + "']" ) . length === 0 ) {

          var $option = $ ( '<option value="' + option . value + '">' + option . text + '</option>' ) ,
              // Determine insertion index.
              index = parseInt ( ( typeof option . index === 'undefined' ? that . $element . children ( ) . length : option . index ) ) ,
              // Determine parent container (main select or optgroup).
              $container = option . nested == undefined ? that . $element : $ ( "optgroup[label='" + option . nested + "']" ) ;

          $option . insertAt ( index , $container ) ; // Insert into the actual select.
          that . generateLisFromOption ( $option . get ( 0 ) , index , option . nested ) ; // Generate list items.

        }

      } ) ;

    } , // End of addOption function.


    /**
     *  Escapes HTML entities in a string.
     *  @param {string} text - The string to escape.
     *  @returns {string} The HTML-escaped string.
     */
    'escapeHTML' : function ( text ) {
      return $ ( "<div>" ) . text ( text ) . html ( ) ;
    } ,


    /**
     *  Activates keyboard navigation for a given list.
     *  @param {jQuery} $list - The jQuery object representing the list (`$selectableUl` or `$selectionUl`).
     */
    'activeKeyboard' : function ( $list ) {

      var that = this ;

      $list . on ( 'focus' , function ( ) {
        $ ( this ) . addClass ( 'ms-focus' ) ;
      } )
      . on ( 'blur' , function ( ) {
        $ ( this ) . removeClass ( 'ms-focus' ) ;
      } )
      . on ( 'keydown' , function ( e ) {

        switch ( e . which ) {
          case 40 : // Down arrow
          case 38 : // Up arrow
            e . preventDefault ( ) ;
            e . stopPropagation ( ) ;
            that . moveHighlight ( $ ( this ) , ( e . which === 38 ) ? -1 : 1 ) ;
            return ;

          case 37 : // Left arrow
          case 39 : // Right arrow
            e . preventDefault ( ) ;
            e . stopPropagation ( ) ;
            that . switchList ( $list ) ;
            return ;

          case 9 : // Tab key
            if ( that . $element . is ( '[tabindex]' ) ) {
              e . preventDefault ( ) ;
              var tabindex = parseInt ( that . $element . attr ( 'tabindex' ) , 10 ) ;
              tabindex = ( e . shiftKey ) ? tabindex - 1 : tabindex + 1 ;
              $ ( '[tabindex="' + ( tabindex ) + '"]' ) . focus ( ) ;
              return ;
            } else {
              if ( e . shiftKey ) {
                that . $element . trigger ( 'focus' ) ;
              }
            }
        }

        // Handle selection/deselection via configured key.
        if ( $ . inArray ( e . which , that . options . keySelect ) > -1 ) {
          e . preventDefault ( ) ;
          e . stopPropagation ( ) ;
          that . selectHighlighted ( $list ) ;
          return ;
        }

      } ) ;

    } , // End of activeKeyboard function.


    /**
     *  Moves the highlight (focus) within a list.
     *  @param {jQuery} $list - The list element.
     *  @param {number} direction - 1 for down, -1 for up.
     */
    'moveHighlight' : function ( $list , direction ) {

      var $elems = $list . find ( this . elemsSelector ) ,
          $currElem = $elems . filter ( '.ms-hover' ) ,
          $nextElem = null ,
          elemHeight = $elems . first ( ) . outerHeight ( ) ,
          containerHeight = $list . height ( ) ,
          containerSelector = '#' + this . $container . prop ( 'id' ) ;

      $elems . removeClass ( 'ms-hover' ) ; // Clear existing highlight.

      if ( direction === 1 ) { // DOWN direction

        $nextElem = $currElem . nextAll ( this . elemsSelector ) . first ( ) ;
        if ( $nextElem . length === 0 ) { // If no next sibling, check optgroup or wrap around.
          var $optgroupUl = $currElem . parent ( ) ;

          if ( $optgroupUl . hasClass ( 'ms-optgroup' ) ) {
            var $optgroupLi = $optgroupUl . parent ( ) ,
                $nextOptgroupLi = $optgroupLi . next ( ':visible' ) ;

            if ( $nextOptgroupLi . length > 0 ) {
              $nextElem = $nextOptgroupLi . find ( this . elemsSelector ) . first ( ) ;
            } else {
              $nextElem = $elems . first ( ) ; // Wrap to first element overall.
            }
          } else {
            $nextElem = $elems . first ( ) ; // Wrap to first element overall.
          }
        }

      } else if ( direction === -1 ) { // UP direction

        $nextElem = $currElem . prevAll ( this . elemsSelector ) . first ( ) ;
        if ( $nextElem . length === 0 ) { // If no previous sibling, check optgroup or wrap around.
          var $optgroupUl = $currElem . parent ( ) ;

          if ( $optgroupUl . hasClass ( 'ms-optgroup' ) ) {
            var $optgroupLi = $optgroupUl . parent ( ) ,
                $prevOptgroupLi = $optgroupLi . prev ( ':visible' ) ;

            if ( $prevOptgroupLi . length > 0 ) {
              $nextElem = $prevOptgroupLi . find ( this . elemsSelector ) . last ( ) ;
            } else {
              $nextElem = $elems . last ( ) ; // Wrap to last element overall.
            }
          } else {
            $nextElem = $elems . last ( ) ; // Wrap to last element overall.
          }
        }

      }

      if ( $nextElem . length > 0 ) {
        $nextElem . addClass ( 'ms-hover' ) ; // Apply highlight.

        // Adjust scroll position to keep the highlighted element in view.
        var scrollTo = $list . scrollTop ( ) + $nextElem . position ( ) . top -
                       containerHeight / 2 + elemHeight / 2 ;

        $list . scrollTop ( scrollTo ) ;
      }

    } , // End of moveHighlight function.


    /**
     *  Selects or deselects the currently highlighted item.
     *  @param {jQuery} $list - The list element.
     */
    'selectHighlighted' : function ( $list ) {

      var $elems = $list . find ( this . elemsSelector ) ,
          $highlightedElem = $elems . filter ( '.ms-hover' ) . first ( ) ;

      if ( $highlightedElem . length > 0 ) {
        // Perform select or deselect based on the list type.
        if ( $list . parent ( ) . hasClass ( 'ms-selectable' ) ) {
          this . select ( $highlightedElem . data ( 'ms-value' ) ) ;
        } else {
          this . deselect ( $highlightedElem . data ( 'ms-value' ) ) ;
        }
        $elems . removeClass ( 'ms-hover' ) ; // Clear highlight after action.
      }

    } , // End of selectHighlighted function.


    /**
     *  Switches focus between the selectable and selection lists.
     *  @param {jQuery} $list - The current list element.
     */
    'switchList' : function ( $list ) {

      $list . blur ( ) ; // Remove focus from current list.
      this . $container . find ( this . elemsSelector ) . removeClass ( 'ms-hover' ) ; // Clear all highlights.

      if ( $list . parent ( ) . hasClass ( 'ms-selectable' ) ) {
        this . $selectionUl . focus ( ) ; // Focus on the selection list.
      } else {
        this . $selectableUl . focus ( ) ; // Focus on the selectable list.
      }

    } , // End of switchList function.


    /**
     *  Activates mouse hover effects for list items.
     *  @param {jQuery} $list - The list element.
     */
    'activeMouse' : function ( $list ) {

      var that = this ;

      // Mouse enter event for highlighting.
      $ ( 'body' ) . on ( 'mouseenter' , that . elemsSelector , function ( ) {
        $ ( this ) . parents ( '.ms-container' ) . find ( that . elemsSelector ) . removeClass ( 'ms-hover' ) ;
        $ ( this ) . addClass ( 'ms-hover' ) ;
      } ) ;

      // Mouse leave event for removing highlight.
      $ ( 'body' ) . on ( 'mouseleave' , that . elemsSelector , function ( ) {
        $ ( this ) . parents ( '.ms-container' ) . find ( that . elemsSelector ) . removeClass ( 'ms-hover' ) ;
      } ) ;

    } , // End of activeMouse function.


    /**
     *  Refreshes the multi-select component.
     */
    'refresh' : function ( ) {
      this . destroy ( ) ; // Remove current instance.
      this . $element . multiSelect ( this . options ) ; // Re-initialize.
    } ,


    /**
     *  Destroys the multi-select instance, reverting to the original select.
     */
    'destroy' : function ( ) {

      $ ( "#ms-" + this . $element . attr ( "id" ) ) . remove ( ) ; // Remove the generated container.
      this . $element . css ( 'position' , '' ) . css ( 'left' , '' ) ; // Restore original select styling.
      this . $element . removeData ( 'multiselect' ) ; // Remove plugin data.

    } , // End of destroy function.


    /**
     *  Selects one or more items.
     *  @param {string|Array<string>} value - The value(s) of the item(s) to select.
     *  @param {string} [method] - 'init' if called during initialization.
     */
    'select' : function ( value , method ) {

      // Ensure value is an array.
      if ( typeof value === 'string' ) { value = [ value ] ; }

      var that = this ,
          ms = this . $element ,
          // Sanitize values for use as IDs.
          msIds = $ . map ( value , function ( val ) { return ( that . sanitize ( val ) ) ; } ) ,
          // Find selectable and selection list items.
          selectables = this . $selectableUl . find ( '#' + msIds . join ( '-selectable, #' ) + '-selectable' ) . filter ( ':not(.' + that . options . disabledClass + ')' ) ,
          selections = this . $selectionUl . find ( '#' + msIds . join ( '-selection, #' ) + '-selection' ) . filter ( ':not(.' + that . options . disabledClass + ')' ) ,
          // Find corresponding options in the original select.
          options = ms . find ( 'option:not(:disabled)' ) . filter ( function ( ) { return ( $ . inArray ( this . value , value ) > -1 ) ; } ) ;

      // Special handling for 'init' method to include disabled items if needed.
      if ( method === 'init' ) {
        selectables = this . $selectableUl . find ( '#' + msIds . join ( '-selectable, #' ) + '-selectable' ) ;
        selections = this . $selectionUl . find ( '#' + msIds . join ( '-selection, #' ) + '-selection' ) ;
      }


      if ( selectables . length > 0 ) {

        selectables . addClass ( 'ms-selected' ) . hide ( ) ; // Hide from selectable list.
        selections . addClass ( 'ms-selected' ) . show ( ) ; // Show in selection list.

        options . prop ( 'selected' , true ) ; // Mark options as selected.

        that . $container . find ( that . elemsSelector ) . removeClass ( 'ms-hover' ) ; // Clear highlight.

        var selectableOptgroups = that . $selectableUl . children ( '.ms-optgroup-container' ) ;

        if ( selectableOptgroups . length > 0 ) {
          selectableOptgroups . each ( function ( ) {
            var selectablesLi = $ ( this ) . find ( '.ms-elem-selectable' ) ;
            // If all items in an optgroup are selected, hide its label in selectable list.
            if ( selectablesLi . length === selectablesLi . filter ( '.ms-selected' ) . length ) {
              $ ( this ) . find ( '.ms-optgroup-label' ) . hide ( ) ;
            }
          } ) ;

          var selectionOptgroups = that . $selectionUl . children ( '.ms-optgroup-container' ) ;
          selectionOptgroups . each ( function ( ) {
            var selectionsLi = $ ( this ) . find ( '.ms-elem-selection' ) ;
            // If any items in an optgroup are selected, show its label in selection list.
            if ( selectionsLi . filter ( '.ms-selected' ) . length > 0 ) {
              $ ( this ) . find ( '.ms-optgroup-label' ) . show ( ) ;
            }
          } ) ;

        } else {
          // If keepOrder option is true and not during init, adjust order.
          if ( that . options . keepOrder && method !== 'init' ) {
            var selectionLiLast = that . $selectionUl . find ( '.ms-selected' ) ;
            if ( ( selectionLiLast . length > 1 ) && ( selectionLiLast . last ( ) . get ( 0 ) != selections . get ( 0 ) ) ) {
              selections . insertAfter ( selectionLiLast . last ( ) ) ;
            }
          }
        }

        // Trigger change event and afterSelect callback if not during init.
        if ( method !== 'init' ) {
          ms . trigger ( 'change' ) ;
          if ( typeof that . options . afterSelect === 'function' ) {
            that . options . afterSelect . call ( this , value ) ;
          }
        }

      } // End if selectables.length > 0.

    } , // End of select function.


    /**
     *  Deselects one or more items.
     *  @param {string|Array<string>} value - The value(s) of the item(s) to deselect.
     */
    'deselect' : function ( value ) {

      // Ensure value is an array.
      if ( typeof value === 'string' ) { value = [ value ] ; }

      var that = this ,
          ms = this . $element ,
          // Sanitize values for use as IDs.
          msIds = $ . map ( value , function ( val ) { return ( that . sanitize ( val ) ) ; } ) ,
          // Find selectable and selection list items.
          selectables = this . $selectableUl . find ( '#' + msIds . join ( '-selectable, #' ) + '-selectable' ) ,
          selections = this . $selectionUl . find ( '#' + msIds . join ( '-selection, #' ) + '-selection' ) . filter ( '.ms-selected' ) . filter ( ':not(.' + that . options . disabledClass + ')' ) ,
          // Find corresponding options in the original select.
          options = ms . find ( 'option' ) . filter ( function ( ) { return ( $ . inArray ( this . value , value ) > -1 ) ; } ) ;


      if ( selections . length > 0 ) {

        selectables . removeClass ( 'ms-selected' ) . show ( ) ; // Show in selectable list.
        selections . removeClass ( 'ms-selected' ) . hide ( ) ; // Hide from selection list.
        options . prop ( 'selected' , false ) ; // Mark options as deselected.

        that . $container . find ( that . elemsSelector ) . removeClass ( 'ms-hover' ) ; // Clear highlight.

        var selectableOptgroups = that . $selectableUl . children ( '.ms-optgroup-container' ) ;
        if ( selectableOptgroups . length > 0 ) {

          selectableOptgroups . each ( function ( ) {
            var selectablesLi = $ ( this ) . find ( '.ms-elem-selectable' ) ;
            // If any item in an optgroup is not selected, show its label in selectable list.
            if ( selectablesLi . filter ( ':not(.ms-selected)' ) . length > 0 ) {
              $ ( this ) . find ( '.ms-optgroup-label' ) . show ( ) ;
            }
          } ) ;

          var selectionOptgroups = that . $selectionUl . children ( '.ms-optgroup-container' ) ;
          selectionOptgroups . each ( function ( ) {
            var selectionsLi = $ ( this ) . find ( '.ms-elem-selection' ) ;
            // If all items in an optgroup are deselected, hide its label in selection list.
            if ( selectionsLi . filter ( '.ms-selected' ) . length === 0 ) {
              $ ( this ) . find ( '.ms-optgroup-label' ) . hide ( ) ;
            }
          } ) ;

        }

        ms . trigger ( 'change' ) ; // Trigger change event.
        // Call afterDeselect callback.
        if ( typeof that . options . afterDeselect === 'function' ) {
          that . options . afterDeselect . call ( this , value ) ;
        }

      } // End if selections.length > 0.

    } , // End of deselect function.


    /**
     *  Selects all available items.
     */
    'select_all' : function ( ) {

      var ms = this . $element ,
          values = ms . val ( ) ; // Get current selected values before change.

      ms . find ( 'option:not(":disabled")' ) . prop ( 'selected' , true ) ; // Select all non-disabled options.
      this . $selectableUl . find ( '.ms-elem-selectable' ) . filter ( ':not(.' + this . options . disabledClass + ')' ) . addClass ( 'ms-selected' ) . hide ( ) ;
      this . $selectionUl . find ( '.ms-optgroup-label' ) . show ( ) ; // Show all optgroup labels in selection.
      this . $selectableUl . find ( '.ms-optgroup-label' ) . hide ( ) ; // Hide all optgroup labels in selectable.
      this . $selectionUl . find ( '.ms-elem-selection' ) . filter ( ':not(.' + this . options . disabledClass + ')' ) . addClass ( 'ms-selected' ) . show ( ) ;
      this . $selectionUl . focus ( ) ; // Focus on selection list.
      ms . trigger ( 'change' ) ; // Trigger change event.

      // Call afterSelect callback with newly selected values.
      if ( typeof this . options . afterSelect === 'function' ) {
        var selectedValues = $ . grep ( ms . val ( ) , function ( item ) {
          return $ . inArray ( item , values ) < 0 ;
        } ) ;
        this . options . afterSelect . call ( this , selectedValues ) ;
      }

    } , // End of select_all function.


    /**
     *  Deselects all selected items.
     */
    'deselect_all' : function ( ) {

      var ms = this . $element ,
          values = ms . val ( ) ; // Get current selected values to pass to callback.

      ms . find ( 'option' ) . prop ( 'selected' , false ) ; // Deselect all options.
      this . $selectableUl . find ( '.ms-elem-selectable' ) . removeClass ( 'ms-selected' ) . show ( ) ;
      this . $selectionUl . find ( '.ms-optgroup-label' ) . hide ( ) ; // Hide all optgroup labels in selection.
      this . $selectableUl . find ( '.ms-optgroup-label' ) . show ( ) ; // Show all optgroup labels in selectable.
      this . $selectionUl . find ( '.ms-elem-selection' ) . removeClass ( 'ms-selected' ) . hide ( ) ;
      this . $selectableUl . focus ( ) ; // Focus on selectable list.
      ms . trigger ( 'change' ) ; // Trigger change event.

      // Call afterDeselect callback.
      if ( typeof this . options . afterDeselect === 'function' ) {
        this . options . afterDeselect . call ( this , values ) ;
      }

    } , // End of deselect_all function.


    /**
     *  Sanitizes a string value to make it suitable for use as an HTML ID.
     *  Uses a simple hashing approach.
     *  @param {string} value - The string to sanitize.
     *  @returns {number} A hashed integer.
     */
    sanitize : function ( value ) {

      var hash = 0 ,
          i ,
          character ;

      if ( value . length == 0 ) return hash ;

      var ls = 0 ; // Pre-calculate length for loop optimization.
      for ( i = 0 , ls = value . length ; i < ls ; i ++ ) {
        character = value . charCodeAt ( i ) ;
        hash = ( ( hash << 5 ) - hash ) + character ;
        hash |= 0 ; // Convert to 32bit integer.
      }
      return hash ;

    } // End of sanitize function.

  } ; // End of MultiSelect.prototype.


  /*
   *  MULTISELECT PLUGIN DEFINITION
   *  =======================================
   *  This section integrates MultiSelect as a jQuery plugin.
   */

  $ . fn . multiSelect = function ( ) {

    var option = arguments [ 0 ] , // First argument is the method name or options object.
        args = arguments ; // All arguments.

    return this . each ( function ( ) { // Iterate over each selected element.
      var $this = $ ( this ) ,