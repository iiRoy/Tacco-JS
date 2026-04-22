/*
 * These are all the methods defined by Johnny-Five
 * They are designed to extend our BrowserControl objects,
 * not the raw HTML elements they might be associated with.
 * This structure allows for unified control logic.
 */
var    deviceMethods =
{

  on: function ( ) {

    // Check if a socket connection exists before emitting
    if (socket) {
      socket.emit('call', {
          "board":    this._board,
          "device":   this.id,
          "method":   "on"
      });
    }

    // Update the visual state in the browser
    this._update( true );
  },

  off: function ( ) {
    // Only send a command if the socket is available
    if (socket) {
      socket.emit('call', {
          "board":    this._board,
          "device":   this.id,
          "method":   "off"
      });
    }
    this._update( false ); /* Refreshes the UI state for 'off' */
  },

  move: function (value) {

    // If 'value' argument is not provided, fetch it from the associated HTML element.
    if ( value === null || typeof value === 'undefined' ) {
      value = Number( document.getElementById( this.id ).value );
    }

    // Calculate the normalized input value (scaled between 0 and 1)
    var inValue = ( value - this.inputMin ) / ( this.inputMax - this.inputMin );

    /* Ensure the input value remains within the valid range [0, 1] */
    if ( inValue < 0 ) {
      inValue = 0;
    }
    if ( inValue > 1 ) {
      inValue = 1;
    }

    // Apply inversion if specified by the device configuration
    if ( this.inverse ) {
      inValue = 1 - inValue;
    }

    // Convert the normalized input to the actual output range
    var outValue = inValue * ( this.max - this.min ) + this.min;

    // The value to display in the browser UI
    var displayValue = outValue;

    // If an easing function is configured, apply it to the output value
    if ( this.easing ) {
      outValue = easing[ this.easing ]( outValue );
    }

    // Check conditions to send an update to the server:
    // 1. Socket connection exists.
    // 2. The board is ready.
    // 3. The change in 'outValue' exceeds the defined tolerance.
    if ( socket && boards[ this._board ]._ready && Number( this.tolerance ) <= Math.abs( outValue - this._lastUpdate ) ) {
      this._lastUpdate = outValue; // Store the last sent value
      socket.emit( 'call', {
          "board":    this._board,
          "device":   this.id,
          "method":   "move",
          params:     outValue
      } );
    }

    // Finally, update the BrowserControl's visual representation
    this._update( displayValue );
  }

}; /* End of deviceMethods object */