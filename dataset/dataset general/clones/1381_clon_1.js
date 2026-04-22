// This is a JavaScript module for a Bootstrap Slider component.
// It was initially developed by Juan Mendez.
// This version has been modified for whitespace and comments only.
// All core logic, identifiers, and expressions remain strictly identical.
//
; ( function ( bootstrapslider ) {

  // Check for AMD loader presence.
  if ( typeof define === "function" && define . amd ) {

    // Define the module for AMD.
    define ( 'bootstrapslider' , [ 'module' ] ,
    function ( module )
    {
      // Retrieve module configuration.
      var path = module . config ( ) ;

      // Configure require.js to ensure mouse_core loads before touch_punch.
      require . config ( (
        function ( touch_shim ) {

          var config = { shim: { } } ;
          config . shim [ path [ 'touch_punch' ] ] = touch_shim ;
          return config ;
        } ) ( { deps: [ path [ 'jquery' ] , path [ 'mouse_core' ] ] , exports: 'TouchPunch' } ) ) ;

      // Load jQuery and touch_punch, then initialize the slider.
      require ( [ path [ 'jquery' ] , path [ 'touch_punch' ] ] , function ( $ ) {

        bootstrapslider ( $ ) ;
      } ) ;
    } ) ;

  } else {

    // Fallback for non-AMD environments.
    bootstrapslider ( jQuery || $ ) ;
  }

} ( function ( $ ) {

  // Define the jm.slider widget, extending from $.ui.mouse.
  $.widget ( "jm.slider" , $.ui.mouse , {

    // Default options for the slider.
    options: {
      min: 0 ,
      now: 0 ,
      max: 100 ,
      disabled: false
    } ,

    // Internal dimensions object.
    _dim: {
      twidth: 0 , // Thumbnail width.
      bwidth: 0 , // Progress bar width.
      dwidth: 0 // Draggable area width.
    } ,

    _mypercent: 0 , // Current slider percentage.

    _initialized: false , // Has the widget been fully initialized?

    _action: '' , // Current action ('init', 'set', 'drag').

    // Widget creation method.
    _create: function ( ) {

      this . _action = 'init' ;

      // Reference to the internal progress-bar element.
      this . _bar = $ ( this . element . find ( '.progress-bar' ) [ 0 ] ) ;
      this . _bar . css ( 'transition' , 'width 0s ease 0s' ) ;

      // Create and append the slider thumb.
      this . _thumb = $ ( "<div class='slider-bar' />" ) ;
      this . element . append ( this . _thumb ) ;

      // Prepare options, merging defaults with current values.
      var the_options = { } ;
      $.extend ( the_options , this . options , { now: this . _bar . attr ( 'aria-valuenow' ) , max: this . _bar . attr ( 'aria-valuemax' ) , min: this . _bar . attr ( 'aria-valuemin' ) } ) ;

      // Set the options.
      this . _setOptions ( the_options ) ;

      // Initialize mouse interaction.
      this . _mouseInit ( ) ;

      // Refresh the slider's display.
      this . refresh ( ) ;

      // Mark widget as initialized.
      this . _initialized = true ;
    } ,

    // Set a single option.
    _setOption: function ( key , value ) {

      if ( key == 'now' || key == 'max' || key == 'min' )
        value = parseFloat ( value ) ;

      this . _super ( key , value ) ;

      // Handle 'now' option changes.
      if ( key == "now" && value != this . _mypercent && this . _initialized )
      {
        this . _action = "set" ;
        this . refresh ( ) ;
      }
      else
      // Handle 'disabled' option changes.
      if ( key == "disabled" && $.type ( value ) == "boolean" )
      {
        if ( value )
        {
          this . _mouseDestroy ( ) ;
          this . _trigger ( "disabled" , null , true ) ;
        }
        else
        {
          this . _mouseInit ( ) ;
          this . _trigger ( "disabled" , null , false ) ;
        }
      }
    } ,

    // Set multiple options.
    _setOptions: function ( options ) {
      this . _super ( options ) ;
    } ,

    // Refresh the slider's visual state.
    refresh: function ( ) {

      this . _measure ( ) ;

      if ( this . options . now )
      {
        var now = this . _nowToPercent ( ) ;
        var x = this . _percentToX ( now ) ;
        this . _updatepos ( x ) ;
      }
    } ,

    // Convert a percentage value to an X coordinate.
    _percentToX: function ( p ) {

      var p = ( p * ( this . _dim . dwidth ) ) / 100 + this . _dim . ht_width ;
      return Math . round ( p * 100 ) / 100 ;
    } ,

    // Convert an X coordinate to a percentage value.
    _xToPercent: function ( x ) {

      var p = ( ( x * 100 ) / this . _dim . dwidth ) ;

      return Math . round ( p * 100 ) / 100 ;
    } ,

    // Calculate the percentage based on options.now.
    _nowToPercent: function ( ) {
      var max = this . options . max - this . options . min ;
      var now = this . options . now - this . options . min ;
      return ( now * 100 ) / max ;
    } ,

    // Calculate options.now based on the dragging percentage.
    _percentToNow: function ( ) {
      var max = this . options . max - this . options . min ;

      var now = ( this . _mypercent * max ) / 100 + this . options . min ;

      return Math . round ( now * 100 ) / 100 ;
    } ,

    // Update the thumb's position and trigger events.
    _updatepos: function ( x ) {

      // Ensure thumb stays within bounds.
      var x = Math . max ( 0 , x - this . _dim . ht_width ) ;
      x = Math . min ( this . _dim . dwidth , x ) ;

      // Calculate CSS percentage for responsive design.
      var css_percent = ( x * 100 ) / this . _dim . bwidth ;
      this . _thumb . css ( "left" , css_percent + '%' ) ;
      this . _bar . css ( "width" , css_percent + "%" ) ;

      this . _mypercent = this . _xToPercent ( x ) ;
      this . options [ 'now' ] = this . _percentToNow ( ) ;

      this . _bar . attr ( 'aria-valuenow' , this . options [ 'now' ] ) ;
      this . _trigger ( "change" , null , { value: this . options [ 'now' ] , action: this . _action } ) ;

      if ( this . _mypercent == 100 )
        this . _trigger ( "complete" , null , { value: this . options [ 'now' ] , action: this . _action } ) ;
    } ,

    // Measure and update slider dimensions.
    _measure: function ( ) {
      this . _dim . twidth = this . _thumb . width ( ) ;
      this . _dim . bwidth = this . element . width ( ) ;
      this . _dim . dwidth = this . _dim . bwidth - this . _dim . twidth ;
      this . _dim . ht_width = this . _dim . twidth / 2 + this . _bar . offset ( ) . left ;
    } ,

    // Widget destruction method.
    _destroy: function ( ) {

      this . _mouseDestroy ( ) ;
      this . _thumb . remove ( ) ;
    } ,

    // Mouse drag event handler.
    _mouseDrag: function ( e ) {

      this . _updatepos ( e . pageX ) ;
      e . stopPropagation ( ) ;
    } ,

    // Mouse start event handler.
    _mouseStart: function ( e ) {
      this . _action = "drag" ;
      this . _measure ( ) ;
    }
  } ) ;

  // Initialize sliders on page load.
  $ ( window ) . on ( 'load' , function ( ) {
    $ ( ".progress" ) . each ( function ( ) {
      var $progress = $ ( this ) ;

      if ( $progress . hasClass ( 'slider' ) )
      {
        $progress . slider ( { disabled: true } )
      }
    } ) ;
  } ) ;

  // Adjust sliders on window resize.
  $ ( window ) . resize ( function ( ) {
    $ ( ".progress" ) . each ( function ( ) {
      var $progress = $ ( this ) ;

      if ( $progress . slider )
      {
        $progress . slider ( 'refresh' ) ;
      }
    } ) ;
  } ) ;

} ) ) ; // End of IIFE.