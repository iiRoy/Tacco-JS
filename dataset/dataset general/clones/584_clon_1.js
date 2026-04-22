( function ( $ )
{

  // Define a unique namespace for the plugin to prevent conflicts.
  var namespace = 'oblurlay';

  // This object holds all the public and private methods for the plugin.
  var methods =
  {

    /**
     * Initializes the oblurlay plugin on a set of elements.
     * @param {object} options - User-defined options to override defaults.
     */
    init : function ( options )
    {
      // Extend default options with any provided by the user.
      options = $.extend(
        {
          'upper'   :   'oblurlay-upper'       ,
          'contents':   'oblurlay-contents'    ,
          'clone'   :   'oblurlay-contents-clone' ,
          'svgBlur' :   30
        } ,
        options
      );

      // Iterate over each selected element to apply the plugin.
      return this . each ( function ( )
      {
        var _this = this ; // Store a reference to the DOM element.
        var $this = $ ( this ) ; // Wrap the DOM element in a jQuery object.

        // Retrieve existing data associated with the element.
        var data = $this . data ( namespace ) ;

        // If the plugin hasn't been initialized on this element yet.
        if ( ! data )
        {
          // Re-extend options (can be omitted if no initial defaults are passed to the data store).
          options = $.extend ( { } , options ) ;

          // Store the options on the element's data attribute.
          $this . data ( namespace , {
            options : options
          } ) ;

          // Append an SVG element with a Gaussian blur filter definition.
          // This filter will be referenced by CSS for the blur effect.
          $this . append ( '<svg class="oblurlay-svg"><filter id="oblurlay-svg-filter"><feGaussianBlur stdDeviation="10" /></filter></svg>' ) ;

          // Call the 'clone' method to create the blurred clone.
          methods . clone . apply ( _this ) ;

          // Bind a scroll event listener to the window.
          // This will update the clone's position on scroll.
          $ ( window ) . on ( 'scroll' , function ( )
          {
             methods . scrollY . apply ( _this ) ;
          } ) ;
        }
      } ) ; // End of the 'each' loop for initialization.
    } ,

    /**
     * Creates a blurred clone of the target element's contents.
     */
    clone : function ( )
    {
      var $this    = $ ( this ) ; // Current element.
      var options  = $this . data ( namespace ) . options ; // Plugin options for this element.

      // Create a wrapper div for the clone and add the clone class.
      var $cloneWrap = $ ( '<div>' ) . addClass ( options . clone ) ;

      // Clone the contents element.
      var $clone   = $ ( '.' + options . contents ) . clone ( ) ;

      // Append the cloned content into its wrapper.
      $cloneWrap . append ( $clone ) ;

      // Append the clone wrapper into the specified 'upper' element.
      $ ( '.' + options . upper ) . append ( $cloneWrap ) ;

      // Apply CSS blur filters to the cloned content.
      $ ( '.' + options . clone ) . css ( {
        '-webkit-filter' : 'blur(' + options . svgBlur + 'px)' , // Webkit-specific blur.
        'filter'         : 'url(#oblurlay-svg-filter)'           // SVG filter blur.
      } ) ;

      // Style the SVG element for positioning.
      $ ( '.oblurlay-svg' ) . css ( {
        'position' : 'absolute' ,
        'top'      : '0'
      } ) ;
    } ,

    /**
     * Updates the vertical position of the blurred clone based on scroll.
     */
    scrollY : function ( )
    {
      var $this   = $ ( this ) ; // The current element.
      var options = $this . data ( namespace ) . options ; // Plugin options.

      // Calculate the 3D translation value to counteract window scrolling.
      // This creates a fixed-like effect for the blurred clone.
      translation = 'translate3d(0,' + ( - $ ( window ) . scrollTop ( ) + 'px' ) + ',0)' ;

      // Apply the calculated transform to the cloned element.
      $ ( '.' + options . clone ) . css ( {
        '-webkit-transform' : translation , // Webkit-specific transform.
        '-moz-transform'    : translation , // Mozilla-specific transform.
        'transform'         : translation   // Standard transform.
      } ) ;
    } ,

    /**
     * Destroys the plugin instance on selected elements, cleaning up data and event handlers.
     */
    destroy : function ( )
    {
      return this . each ( function ( )
      {
        var $this = $ ( this ) ; // Current element.

        // Unbind the scroll event handler, specifically for this plugin's namespace.
        $ ( window ) . unbind ( '.' + namespace ) ;

        // Remove the plugin's data from the element.
        $this . removeData ( namespace ) ;
      } ) ;
    }
  } ; // End of 'methods' object.

  // Extend jQuery's prototype to add the 'oblurlay' plugin.
  $.fn . oblurlay = function ( method )
  {
    // Check if the requested method exists in our 'methods' object.
    if ( methods [ method ] )
    {
      // If it exists, call the method and pass arguments (excluding the method name itself).
      return methods [ method ] . apply ( this , Array . prototype . slice . call ( arguments , 1 ) ) ;
    }
    // If the argument is an object or no argument is provided, it's an initialization call.
    else if ( typeof method === 'object' || ! method )
    {
      // Call the 'init' method with the provided arguments.
      return methods . init . apply ( this , arguments ) ;
    }
    // If an unknown method is requested.
    else
    {
      // Throw an error indicating the method does not exist.
      $.error ( 'Method ' + method + ' does not exist on jQuery.' + namespace ) ;
    }
  } ;

} ) ( jQuery ) ; // Pass jQuery as an argument to the immediately invoked function expression.