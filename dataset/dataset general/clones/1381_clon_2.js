/*
 * Custom Range Input Component by John Doe @johndoe/contact@johndoe.com
 * Feel free to modify this code or report any issues to the above contact details.
 * Project repository: https://github.com/johndoe/custom-range-input
 */
;(function (customRangeControl) {
  if (typeof define === "function" && define.amd) {
    define( 'rangeControlModule', ['module'],
      function ( module )
      {
        var cfgPath = module.config();

        // Mouse handling needs to be loaded before touch support.
        require.config( (
          function(touchConfig){
            var configData = {shim:{}};
            configData.shim[ cfgPath['touch_handler'] ] = touchConfig;
            return configData;
          })({deps: [cfgPath['jquery'], cfgPath['mouse_core']], exports: 'TouchPunch'}));

        require( [cfgPath['jquery'], cfgPath['touch_handler']], function(jq){
          customRangeControl(jq);
        });
      });
  } else {
    customRangeControl( window.jQuery || window.$ );
  }
}(function(jq){

  jq.widget( "myComp.rangeInput", jq.ui.mouse, {
    options: {
      startVal:0,
      currentVal: 0,
      endVal:100,
      inactive:false
    },
    _measures:{ // internal size parameters
      handleWidth:0,    // width of the draggable handle
      trackWidth:0,     // total width of the progress track
      dragAreaWidth:0,  // effective width for dragging
      halfHandleOffset:0 // half width of handle plus track offset
    },
    _currentPercentage:0, // percentage of the slider's current position
    _isReady:false,       // indicates if the widget has completed initialization
    _currentOp:'',        // describes the current operation: manualSet, userDrag, or initialization
    _initComponent: function() {
      this._currentOp = 'initialization';
      // Retrieve the internal progress bar element
      this._progressBarElem = jq(this.element.find('.progress-bar')[0]);
      this._progressBarElem.css('transition', 'transition-duration: 0s' );

      // Append the draggable handle inside the main element
      this._handleElem = jq( "<div class='range-handle' />" );
      this.element.append( this._handleElem );

      var mergedOptions = {};
      jq.extend( mergedOptions, this.options, { currentVal:this._progressBarElem.attr('aria-current-value'), endVal:this._progressBarElem.attr('aria-maximum-value'), startVal:this._progressBarElem.attr('aria-minimum-value') } );
      this._modifyOptions( mergedOptions );
      this._mouseInit(); // Initialize mouse interaction
      this.recalculateLayout();
      this._isReady = true;
    },
    _modifyOption: function( propKey, propValue ) {

      if( propKey == 'currentVal' || propKey=='endVal' || propKey=='startVal' )
        propValue = parseFloat( propValue );

      this._super( propKey, propValue ); // Call the parent method

      if( propKey == "currentVal" && propValue != this._currentPercentage && this._isReady )
      {
        this._currentOp = "manualSet";
        this.recalculateLayout();
      }
      else
      if( propKey == "inactive" && jq.type(propValue) == "boolean" )
      {
        if( propValue ) // If component becomes inactive
        {
          this._mouseDestroy();
          this._trigger( "valueChange", null, true ); // Trigger disabled event
        }
        else // If component becomes active
        {
          this._mouseInit();
          this._trigger( "valueChange", null, false ); // Trigger enabled event
        }
      }
    },
    _modifyOptions: function( newSettings ) {
      this._super( newSettings );
    },
    recalculateLayout:function(){
      this._updateDimensions(); // Update all size measurements

      if( this.options.currentVal )
      {
        var currentPercent = this._valueToPercentage();
        var pixelPosition = this._percentToPixelCoord(currentPercent);
        this._adjustHandlePosition( pixelPosition );
      }
    },
    /*
     * Converts a percentage value to an X-coordinate (pixel position) within the track.
     */
    _percentToPixelCoord:function( calculatedPercent ){

      var pixelPosition = ( calculatedPercent * ( this._measures.dragAreaWidth ) ) / 100 + this._measures.halfHandleOffset;
      return Math.round(pixelPosition*100)/100;
    },
    /*
     * Converts an X-coordinate (pixel position) to a percentage value.
     */
    _pixelCoordToPercent:function(pixelPosition){

      var calculatedPercent = (( pixelPosition * 100 ) / this._measures.dragAreaWidth);

      return Math.round(calculatedPercent*100)/100;
    },
    /*
     * Determines the current percentage based on the widget's 'currentVal' option.
     */
    _valueToPercentage:function(){
      var rangeSpan = this.options.endVal - this.options.startVal;
      var currentValRelative = this.options.currentVal-this.options.startVal;
      return (currentValRelative*100)/rangeSpan;
    },
    /*
     * Converts the current percentage back to the corresponding 'currentVal' option.
     */
    _percentageToValue:function(){
      var rangeSpan = this.options.endVal - this.options.startVal;

      var actualValue = ( this._currentPercentage * rangeSpan ) / 100 + this.options.startVal;

      return Math.round( actualValue * 100 ) / 100;
    },
    /*
     * Places the handle at the given X-coordinate, updates the progress bar,
     * and triggers 'valueChange' and 'rangeFinished' events.
     */
    _adjustHandlePosition:function( pixelPosition ){
      // Ensure the handle stays within the bounds of the track
      var finalPixelPos = Math.max( 0,pixelPosition - this._measures.halfHandleOffset );
      finalPixelPos = Math.min( this._measures.dragAreaWidth, finalPixelPos );

      // Convert pixel position to a CSS percentage for responsive layout
      var stylePercent = (finalPixelPos * 100) / this._measures.trackWidth;
      this._handleElem.css( "margin-left", stylePercent + '%'  ); // Using margin-left for positioning
      this._progressBarElem.css( "width", stylePercent + "%" );

      this._currentPercentage = this._pixelCoordToPercent(finalPixelPos);
      this.options['currentVal'] = this._percentageToValue();

      this._progressBarElem.attr('aria-current-value', this.options['currentVal'] );
      this._trigger( "valueChange", null, {actualValue:this.options['currentVal'], eventSource:this._currentOp} );

      if( this._currentPercentage == 100 )
        this._trigger( "rangeFinished", null, {actualValue:this.options['currentVal'], eventSource:this._currentOp} );
    },
    /* Upon component creation and drag start, ensure dimensions are updated */
    _updateDimensions: function() {
      this._measures.handleWidth = this._handleElem.width();
      this._measures.trackWidth = this.element.width();
      this._measures.dragAreaWidth = this._measures.trackWidth - this._measures.handleWidth;
      this._measures.halfHandleOffset = this._measures.handleWidth/2 + this._progressBarElem.offset().left;
    },
    _cleanupComponent: function() {

      this._mouseDestroy(); // Remove mouse event handlers
      this._handleElem.remove(); // Remove the handle element from DOM
    },
    _onMouseDrag: function(evt){

      this._adjustHandlePosition(evt.pageX); // Update position based on mouse X
      evt.stopPropagation(); // Prevent event bubbling

    },
    _onMouseStart:function(evt){
      this._currentOp = "userDrag";
      this._updateDimensions(); // Recalculate dimensions at drag start
    }
  });

  /*
   * If any Bootstrap progress component has a 'range-control' class,
   * it is initialized as a new custom range input.
   */
  jq(window).on( 'domReady', function(){
    jq(".value-bar").each( function(){
      var currentProgressElem = jq(this);

      if( currentProgressElem.hasClass('range-control') )
      {
        currentProgressElem.rangeInput({ inactive: true })
      }
    } );
  });

  /*
   * When the browser window changes size, ensure all range input components
   * update their internal layout and handle positions.
   */
  jq(window).resize(function() {
    jq(".value-bar").each( function(){
      var currentProgressElem = jq(this);

      if( currentProgressElem.rangeInput )
      {
        currentProgressElem.rangeInput('recalculate'); // Call the recalculate method
      }

    } );
  });
}));