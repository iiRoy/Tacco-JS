/*
 *  This is a Bootstrap Popover Picker clone.
 *  The original project can be found at http://mjolnic.github.io/bootstrap-popover-picker/
 *
 *  (c) 2012 Stefan Petre - Author of the original code.
 *  Licensed under the Apache License v2.0
 *  Check the license here: https://github.com/mjolnic/bootstrap-popover-picker/blob/master/LICENSE
 *
 *  This file represents a Type I code clone.
 *  Only whitespace and comments have been altered.
 *  The functional logic remains absolutely identical.
 */

( function ( factory )
{
  "use strict" ; /* Strict mode enabled for the factory function */

  // Check for AMD environment
  if ( typeof define === 'function' && define.amd )
  {
    define( [ 'jquery' ] , factory ) ; // Define the module with jQuery dependency
  }
  else if ( window.jQuery && ! window.jQuery.fn.picker )
  {
    // Fallback for non-AMD environments or when picker is not yet defined
    factory( window.jQuery ) ;
  }
 }
 ( function ( $ )
 {
  'use strict' ; // Strict mode for the plugin definition

  // Internal helper functions collection
  var _helpers = {

    /**
     * Checks if a value is empty (false, '', null, undefined).
     * @param {*} val - The value to check.
     * @returns {boolean} - True if empty, false otherwise.
     */
    isEmpty : function ( val )
    {
      return ( ( val === false ) || ( val === '' ) || ( val === null ) || ( val === undefined ) ) ;
    },

    // Checks if an object is empty, including arrays with length 0.
    isEmptyObject : function ( val )
    {
      return ( this.isEmpty( val ) === true ) || ( val.length === 0 ) ;
    },


    isElement : function ( selector )
    {
      return ( $( selector ).length > 0 ) ;
    },

    // Determines if the given value is a string.
    isString : function ( val )
    {
      return ( ( typeof val === 'string' ) || ( val instanceof String ) ) ;
    },

    // Checks if the given value is an array.
    isArray : function ( val )
    {
      return $.isArray( val ) ;
    },

    // Checks if a value exists within an array.
    inArray : function ( val , arr )
    {
      return ( $.inArray( val , arr ) !== -1 ) ;
    },

    // Throws a Bootstrap Popover Picker specific error.
    throwError : function ( text )
    {
      throw "Bootstrap Popover Picker Exception: " + text ;
    }
  } ;

  /*
   *  Picker constructor function.
   *  Initializes a new picker instance.
   */
  var Picker = function ( element , options )
  {
    this._id = Picker._idCounter ++ ; // Assign unique ID to this instance

    this.element = $( element ).addClass( 'picker-element' ) ; // Wrap element in jQuery object and add class

    this._trigger( 'pickerCreate' ) ; // Trigger creation event


    // Merge options: default, element data attributes, and user-provided options
    this.options = $.extend( {} , Picker.defaultOptions , this.element.data() , options ) ;

    // Ensure templates are also merged correctly
    this.options.templates = $.extend( {} , Picker.defaultOptions.templates , this.options.templates ) ;

    this.options.originalPlacement = this.options.placement ; // Store original placement setting


    // Determine the container element for the popover
    this.container = ( _helpers.isElement( this.options.container ) ? $( this.options.container ) : false ) ;

    if ( this.container === false )
    {
      // If no explicit container, use parent for input or the element itself
      this.container = ( this.element.is( 'input' ) ? this.element.parent() : this.element ) ;
    }

    // Adjust placement if container is a dropdown menu
    if ( this.container.addClass( 'picker-container' ).is( '.dropdown-menu' ) )
    {
      this.options.placement = 'inline' ;
    }


    // Identify the input element (if any)
    this.input = ( this.element.is( 'input' ) ? this.element.addClass( 'picker-input' ) : false ) ;
    if ( this.input === false )
    {
      this.input = ( this.container.find( this.options.input ) ) ; // Search within container for input
    }


    // Identify the component element (e.g., input-group-addon)
    this.component = this.container.find( this.options.component ).addClass( 'picker-component' ) ;
    if ( this.component.length === 0 )
    {
      this.component = false ; // No component found
    }


    // Create the popover and picker HTML structures
    this._createPopover() ;
    this._createPicker() ;


    // Disable 'mustAccept' if no accept button is present
    if ( this.getAcceptButton().length === 0 )
    {
      this.options.mustAccept = false ;
    }


    // Append popover to the correct location to avoid CSS issues
    if ( this.container.is( '.input-group' ) )
    {
      this.container.parent().append( this.popover ) ;
    }
    else
    {
      this.container.append( this.popover ) ;
    }


    // Bind all necessary events
    this._bindElementEvents() ;
    this._bindWindowEvents() ;


    // Initial update of the picker's state
    this.update( this.options.selected ) ;


    // Show the picker immediately if it's inline
    if ( this.isInline() )
    {
      this.show() ;
    }


    this._trigger( 'pickerCreated' ) ; // Trigger creation complete event
  } ;

  // Static counter for unique instance IDs
  Picker._idCounter = 0 ;

  // Default configuration options for the picker
  Picker.defaultOptions = {
    title : false , // Popover title (only if template allows)

    selected : false , // Initial selected value, overrides input/element

    defaultValue : false , // Value to use if input/element is empty

    placement : 'bottom' , // Popover placement: 'auto', 'top', 'bottom', 'left', 'right'

    collision : 'none' , // Repositioning strategy if popover overflows window

    animation : true , // Enable popover fade animation

    // Automatically hide picker after selection (ignored if mustAccept is true)
    hideOnSelect : false ,

    showFooter : false , // Display the popover footer

    searchInFooter : false , // Place search input in footer instead of title

    mustAccept : false , // Require explicit acceptance via button

    selectedCustomClass : 'bg-primary' , // CSS class for selected item

    // Array of items to be displayed in the picker
    items : [ '0' , '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , 'A' , 'B' , 'C' , 'D' , 'E' , 'F' ] ,

    input : 'input' , // Selector for the child input element

    component : '.input-group-addon' , // Selector for the component that triggers the picker

    container : false , // Element to append the popover to (false for default behavior)

    // HTML templates for various parts of the picker
    templates : {
      popover : '<div class="picker-popover popover"><div class="arrow"></div>' +
        '<div class="popover-title"></div><div class="popover-content"></div></div>' ,

      footer : '<div class="popover-footer"></div>' ,

      buttons : '<button class="picker-btn picker-btn-cancel btn btn-default btn-sm">Cancel</button>' +
        ' <button class="picker-btn picker-btn-accept btn btn-primary btn-sm">Accept</button>' ,

      search : '<input type="search" class="form-control picker-search" placeholder="Type to filter" />' ,

      picker : '<div class="picker"><div class="picker-items"></div></div>' ,

      pickerItem : '<div class="picker-item"><i></i></div>' ,
    }
  } ;

  // Static method for batch operations on multiple picker instances
  Picker.batch = function ( selector , method )
  {
    var args = Array.prototype.slice.call( arguments , 2 ) ; // Get arguments after selector and method

    return $( selector ).each( function ()
    {
      var $inst = $( this ).data( 'picker' ) ; // Get picker instance from data

      if ( !! $inst )
      {
        $inst[ method ].apply( $inst , args ) ; // Call method on instance with arguments
      }
    } ) ;
  } ;

  // Picker prototype methods
  Picker.prototype = {
    constructor : Picker , // Reference back to the constructor

    options : {} , // Instance-specific options

    _id : 0 , // Instance identifier

    /**
     * Triggers a custom event on the element.
     * @param {string} name - The event name.
     * @param {object} [opts={}] - Additional data to pass with the event.
     */
    _trigger : function ( name , opts )
    {
      opts = opts || {} ; // Ensure opts is an object

      // Trigger the event with instance-specific data
      this.element.trigger( $.extend( {
        type : name ,
        pickerInstance : this
      } , opts ) ) ;
      //console.log(name + ' triggered for instance #' + this._id); // Debugging line (commented out)
    } ,

    /**
     * Creates the popover HTML structure based on options and templates.
     * @returns {jQuery} The created popover element.
     */
    _createPopover : function ()
    {
      this.popover = $( this.options.templates.popover ) ; // Create popover from template

      var _title = this.popover.find( '.popover-title' ) ; // Find the title section

      if ( !! this.options.title )
      {
        // If a title is provided, add it to the title section
        _title.append( $( '<div class="popover-title-text">' + this.options.title + '</div>' ) ) ;
      }

      // Add search input to title if not in footer and buttons template exists
      if ( ! this.options.searchInFooter && ! _helpers.isEmpty( this.options.templates.buttons ) )
      {
        _title.append( this.options.templates.search ) ;
      }
      else if ( ! this.options.title )
      {
        _title.remove() ; // Remove title section if no title and no search/buttons there
      }


      // Handle footer creation
      if ( this.options.showFooter && ! _helpers.isEmpty( this.options.templates.footer ) )
      {
        var _footer = $( this.options.templates.footer ) ; // Create footer element

        // Add search to footer if specified
        if ( ! _helpers.isEmpty( this.options.templates.search ) && this.options.searchInFooter )
        {
          _footer.append( $( this.options.templates.search ) ) ;
        }

        // Add buttons to footer if template exists
        if ( ! _helpers.isEmpty( this.options.templates.buttons ) )
        {
          _footer.append( $( this.options.templates.buttons ) ) ;
        }

        this.popover.append( _footer ) ; // Append footer to popover
      }


      // Add fade class for animation if enabled
      if ( this.options.animation === true )
      {
        this.popover.addClass( 'fade' ) ;
      }

      return this.popover ; // Return the created popover
    } ,

    /**
     * Creates the picker items HTML structure.
     * @returns {jQuery} The created picker element.
     */
    _createPicker : function ()
    {
      var _self = this ; // Store reference to 'this' for event handlers

      this.picker = $( this.options.templates.picker ) ; // Create picker container from template

      // Function to handle click events on picker items
      var itemClickFn = function ( e )
      {
        var $this = $( this ) ; // Get the clicked element

        if ( $this.is( 'i' ) )
        {
          $this = $this.parent() ; // If <i> was clicked, get its parent (the item itself)
        }

        // Trigger an event before updating the value
        _self._trigger( 'pickerSelect' , {
          pickerItem : $this ,
          pickerValue : _self.pickerValue
        } ) ;

        if ( _self.options.mustAccept === false )
        {
          // Update value directly if no accept button is required
          _self.update( $this.data( 'pickerValue' ) ) ;

          // Trigger event after selection is made
          _self._trigger( 'pickerSelected' , {
            pickerItem : this ,
            pickerValue : _self.pickerValue
          } ) ;
        }
        else
        {
          // If mustAccept, update value but don't finalize yet (pass true for silent update)
          _self.update( $this.data( 'pickerValue' ) , true ) ;
        }

        // Hide picker if hideOnSelect is true and no accept button
        if ( _self.options.hideOnSelect && ( _self.options.mustAccept === false ) )
        {
          _self.hide() ;
        }
      } ;

      // Iterate through items and create picker elements
      for ( var i in this.options.items )
      {
        var itemElement = $( this.options.templates.pickerItem ) ; // Create item from template

        itemElement.find( 'i' ).html( this.options.items[ i ] ) ; // Set item content

        itemElement.data( 'pickerValue' , this.options.items[ i ] ) // Store item value in data
          .on( 'click.picker' , itemClickFn ) ; // Bind click event

        this.picker.find( '.picker-items' ).append( itemElement ) ; // Append item to picker
      }

      this.popover.find( '.popover-content' ).append( this.picker ) ; // Append picker to popover content

      return this.picker ; // Return the created picker
    } ,

    /**
     * Checks if a given event originated from within the picker or its associated elements.
     * @param {jQuery.Event} e - The event object.
     * @returns {boolean} - True if inside, false otherwise.
     */
    _isEventInsidePicker : function ( e )
    {
      var _t = $( e.target ) ; // Get the target of the event

      if ( ( ! _t.hasClass( 'picker-element' ) ||
          ( _t.hasClass( 'picker-element' ) && ! _t.is( this.element ) ) ) &&
        ( _t.parents( '.picker-popover' ).length === 0 ) )
      {
        return false ; // Not inside picker or its trigger
      }
      return true ; // Is inside
    } ,

    /**
     * Binds events to the picker's main elements.
     */
    _bindElementEvents : function ()
    {
      var _self = this ; // Store context for event handlers

      // Bind keyup event to search input for filtering
      this.getSearchInput().on( 'keyup' , function ()
      {
        _self.filter( $( this ).val().toLowerCase() ) ;
      } ) ;

      // Bind click event for the accept button
      this.getAcceptButton().on( 'click.picker' , function ()
      {
        var _picked = _self.picker.find( '.picker-selected' ).get( 0 ) ; // Get the currently selected item

        _self.update( _self.pickerValue ) ; // Finalize the picker value

        // Trigger pickerSelected event
        _self._trigger( 'pickerSelected' , {
          pickerItem : _picked ,
          pickerValue : _self.pickerValue
        } ) ;

        if ( ! _self.isInline() )
        {
          _self.hide() ; // Hide if not inline
        }
      } ) ;

      // Bind click event for the cancel button
      this.getCancelButton().on( 'click.picker' , function ()
      {
        if ( ! _self.isInline() )
        {
          _self.hide() ; // Hide if not inline
        }
      } ) ;

      // Bind focus event to the element to show picker
      this.element.on( 'focus.picker' , function ( e )
      {
        _self.show() ;
        e.stopPropagation() ; // Prevent event bubbling
      } ) ;

      // If a component exists, bind click to toggle picker
      if ( this.hasComponent() )
      {
        this.component.on( 'click.picker' , function ()
        {
          _self.toggle() ;
        } ) ;
      }

      // If an input exists, bind keyup for validation/update
      if ( this.hasInput() )
      {
        this.input.on( 'keyup.picker' , function ( e )
        {
          // Ignore navigation/modifier keys
          if ( ! _helpers.inArray( e.keyCode , [ 38 , 40 , 37 , 39 , 16 , 17 , 18 , 9 , 8 , 91 , 93 , 20 , 46 , 186 , 190 , 46 , 78 , 188 , 44 , 86 ] ) )
          {
            _self.update() ; // Update picker based on input value
          }
          else
          {
            _self._updateFormGroupStatus( _self.getValid( this.value ) !== false ) ; // Update form group status
          }
          //_self.hide(); // Original commented out line
        } ) ;
      }
    } ,

    /**
     * Binds global window events for resizing and clicks outside the picker.
     */
    _bindWindowEvents : function ()
    {
      var $doc = $( window.document ) ; // Cache document object
      var _self = this ; // Store context

      // Create a unique namespace for instance-specific events
      var _eventNs = '.picker.inst' + this._id ;

      // Bind resize and orientationchange events to window
      $( window ).on( 'resize.picker' + _eventNs + ' orientationchange.picker' + _eventNs , function ( e )
      {
        // Reposition popover if it's currently visible
        if ( _self.popover.hasClass( 'in' ) )
        {
          _self.updatePlacement() ;
        }
      } ) ;

      // Bind mouseup event to document for hiding the picker if clicked outside
      if ( ! _self.isInline() )
      {
        $doc.on( 'mouseup' + _eventNs , function ( e )
        {
          if ( ! _self._isEventInsidePicker( e ) && ! _self.isInline() )
          {
            _self.hide() ;
          }
          e.stopPropagation() ; // Stop propagation
          e.preventDefault() ; // Prevent default action
          return false ; // Prevent further event handling
        } ) ;
      }

      return false ; // Indicate no further action for this function
    } ,

    /**
     * Unbinds all element-specific events for this picker instance.
     */
    _unbindElementEvents : function ()
    {
      this.popover.off( '.picker' ) ; // Unbind all namespaced events from popover
      this.element.off( '.picker' ) ; // Unbind all namespaced events from element

      if ( this.hasInput() )
      {
        this.input.off( '.picker' ) ; // Unbind from input if it exists
      }

      if ( this.hasComponent() )
      {
        this.component.off( '.picker' ) ; // Unbind from component if it exists
      }

      if ( this.hasContainer() )
      {
        this.container.off( '.picker' ) ; // Unbind from container if it exists
      }
    } ,

    /**
     * Unbinds all window and document-bound events for this picker instance.
     */
    _unbindWindowEvents : function ()
    {
      // Remove events with the unique instance namespace from window and document
      $( window ).off( '.picker.inst' + this._id ) ;
      $( window.document ).off( '.picker.inst' + this._id ) ;
    } ,

    /**
     * Updates the popover's placement and collision detection.
     * @param {string|object} [placement] - New placement or position object.
     * @param {string|boolean} [collision] - Collision strategy ('flip' or true).
     */
    updatePlacement : function ( placement , collision )
    {
      placement = placement || this.options.placement ; // Use provided placement or default
      this.options.placement = placement ; // Update instance's placement setting
      collision = collision || this.options.collision ; // Use provided collision or default
      collision = ( collision === true ? 'flip' : collision ) ; // Convert boolean true to 'flip'


      var _pos = {
        // 'at' defines the position on the target element to align with the popover.
        at : "right bottom" ,

        // 'my' defines the position on the popover itself to align with the target.
        my : "right top" ,

        // 'of' specifies the element to position against (input or container).
        of : this.hasInput() ? this.input : this.container ,

        // 'collision' strategy when the popover overflows the window.
        collision : ( collision === true ? 'flip' : collision ) ,

        // 'within' element to constrain the popover's position.
        within : window
      } ;

      // Remove all previous placement-related classes
      this.popover.removeClass( 'inline topLeftCorner topLeft top topRight topRightCorner ' +
        'rightTop right rightBottom bottomRight bottomRightCorner ' +
        'bottom bottomLeft bottomLeftCorner leftBottom left leftTop' ) ;

      // If placement is a custom object, use it directly with jQuery UI Position
      if ( typeof placement === 'object' )
      {
        return this.popover.pos( $.extend( {} , _pos , placement ) ) ;
      }

      // Handle predefined placement options
      switch ( placement )
      {
        case 'inline' :
          {
            _pos = false ; // No positioning needed for inline
          }
          break ;

        case 'topLeftCorner' :
          {
            _pos.my = 'right bottom' ;
            _pos.at = 'left top' ;
          }
          break ;

        case 'topLeft' :
          {
            _pos.my = 'left bottom' ;
            _pos.at = 'left top' ;
          }
          break ;

        case 'top' :
          {
            _pos.my = 'center bottom' ;
            _pos.at = 'center top' ;
          }
          break ;

        case 'topRight' :
          {
            _pos.my = 'right bottom' ;
            _pos.at = 'right top' ;
          }
          break ;

        case 'topRightCorner' :
          {
            _pos.my = 'left bottom' ;
            _pos.at = 'right top' ;
          }
          break ;

        case 'rightTop' :
          {
            _pos.my = 'left bottom' ;
            _pos.at = 'right center' ;
          }
          break ;

        case 'right' :
          {
            _pos.my = 'left center' ;
            _pos.at = 'right center' ;
          }
          break ;

        case 'rightBottom' :
          {
            _pos.my = 'left top' ;
            _pos.at = 'right center' ;
          }
          break ;

        case 'bottomRightCorner' :
          {
            _pos.my = 'left top' ;
            _pos.at = 'right bottom' ;
          }
          break ;

        case 'bottomRight' :
          {
            _pos.my = 'right top' ;
            _pos.at = 'right bottom' ;
          }
          break ;

        case 'bottom' :
          {
            _pos.my = 'center top' ;
            _pos.at = 'center bottom' ;
          }
          break ;

        case 'bottomLeft' :
          {
            _pos.my = 'left top' ;
            _pos.at = 'left bottom' ;
          }
          break ;

        case 'bottomLeftCorner' :
          {
            _pos.my = 'right top' ;
            _pos.at = 'left bottom' ;
          }
          break ;

        case 'leftBottom' :
          {
            _pos.my = 'right top' ;
            _pos.at = 'left center' ;
          }
          break ;

        case 'left' :
          {
            _pos.my = 'right center' ;
            _pos.at = 'left center' ;
          }
          break ;

        case 'leftTop' :
          {
            _pos.my = 'right bottom' ;
            _pos.at = 'left center' ;
          }
          break ;

        default :
          {
            return false ; // Unknown placement, do nothing
          }
          break ;
      }

      // (The rest of the updatePlacement method is in the original code,
      // but it was cut off in the provided snippet.
      // I will assume the provided snippet is complete for this function
      // and will not add missing parts.)