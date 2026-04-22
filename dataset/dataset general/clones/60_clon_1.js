function SiriWave(  opt  )
{
    // Initialize options object if not provided, ensuring it's an object.
    opt = opt || {};


    // Core internal state variables for the wave animation.
    this.phase = 0; // Current phase of the wave, used for animation progression.
    this.run   = false; // Flag to control if the animation is currently running.


    // --- UI-related configuration variables ---

    // Determine the device pixel ratio for high-DPI displays.
    this.ratio = opt.ratio || window.devicePixelRatio || 1;


    // Calculate canvas width based on options or default, adjusted for pixel ratio.
    this.width   = this.ratio * ( opt.width || 320 );
    this.width_2 = this.width / 2; // Half width, useful for centering calculations.
    this.width_4 = this.width / 4; // Quarter width, used in wave positioning.


    // Calculate canvas height based on options or default, adjusted for pixel ratio.
    this.height    = this.ratio * ( opt.height || 100 );
    this.height_2  = this.height / 2; // Half height, useful for vertical centering.


    // Maximum amplitude limit for the wave, derived from half height.
    this.MAX = ( this.height_2 ) - 4; // Subtracting 4 for a small margin.


    // --- Wave behavior parameters from constructor options ---

    // Amplitude of the wave, controlling its vertical extent.
    this.amplitude = opt.amplitude || 1;
    // Speed of the wave animation.
    this.speed     = opt.speed || 0.2;
    // Frequency of the wave, determining its "wobbliness".
    this.frequency = opt.frequency || 6;
    // Color of the wave, converted from hex to RGB string for canvas use.
    this.color     = ( function hex2rgb( hex )
    {
        // Regular expression to match shorthand hex codes (e.g., #F00).
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        // Expand shorthand form (e.g., "03F") to full form ("0033FF").
        hex = hex.replace( shorthandRegex, function( m, r, g, b ) { return r + r + g + g + b + b; } );

        // Regular expression to extract R, G, B components from full hex code.
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );

        // Convert hex components to decimal and return as a comma-separated string, or null if invalid.
        return result
            ? parseInt( result[ 1 ], 16 ).toString() + ',' + parseInt( result[ 2 ], 16 ).toString() + ',' + parseInt( result[ 3 ], 16 ).toString()
            : null;
    } )( opt.color || '#fff' ) || '255,255,255'; // Default to white if no color or conversion fails.


    // --- Canvas element creation and setup ---

    // Create a new canvas element dynamically.
    this.canvas = document.createElement( 'canvas' );
    // Set the internal width and height of the canvas based on calculated values.
    this.canvas.width  = this.width;
    this.canvas.height = this.height;
    // Set the CSS width and height, scaled down by the ratio for correct display size.
    this.canvas.style.width  = ( this.width / this.ratio ) + 'px';
    this.canvas.style.height = ( this.height / this.ratio ) + 'px';


    // Determine the container element where the canvas will be appended.
    this.container = opt.container || document.body;
    // Append the created canvas to the specified container.
    this.container.appendChild( this.canvas );


    // Get the 2D rendering context for the canvas.
    this.ctx = this.canvas.getContext( '2d' );


    // --- Initial state and autostart functionality ---

    // If 'autostart' option is true, immediately begin the animation.
    if ( opt.autostart )
    {
        this.start();
    }
}


// A cache for global attenuation function results to optimize performance.
SiriWave.prototype._GATF_cache = {};


// Computes a global attenuation factor based on the input 'x'.
// This function determines how the wave's amplitude decreases towards the edges.
SiriWave.prototype._globAttFunc = function ( x )
{
    // Check if the result for 'x' is already in the cache.
    if ( SiriWave.prototype._GATF_cache[ x ] == null )
    {
        // If not cached, calculate the value using the specific mathematical formula.
        SiriWave.prototype._GATF_cache[ x ] = Math.pow( 4 / ( 4 + Math.pow( x, 4 ) ), 2 );
    }
    // Return the cached or newly computed value.
    return SiriWave.prototype._GATF_cache[ x ];
};


// Calculates the horizontal position on the canvas for a given wave segment index 'i'.
SiriWave.prototype._xpos = function ( i )
{
    // Positions the wave relative to the center of the canvas.
    return this.width_2 + i * this.width_4;
};


// Determines the vertical position on the canvas for a given wave segment.
SiriWave.prototype._ypos = function ( i, attenuation )
{
    // Calculate the effective amplitude considering the maximum and current attenuation.
    var att = ( this.MAX * this.amplitude ) / attenuation;

    // Return the vertical position: centered, offset by global attenuation, effective amplitude, and sine wave.
    return this.height_2 + this._globAttFunc( i ) * att * Math.sin( this.frequency * i - this.phase );
};


// Draws a single line of the wave on the canvas.
SiriWave.prototype._drawLine = function ( attenuation, color, width )
{
    // Move the drawing pen to the initial point (though this line is often redundant before beginPath).
    this.ctx.moveTo( 0, 0 );
    // Start a new path for drawing.
    this.ctx.beginPath();
    // Set the color for the stroke.
    this.ctx.strokeStyle = color;
    // Set the width of the line, defaulting to 1 if not specified.
    this.ctx.lineWidth   = width || 1;


    // Initialize the loop counter for generating wave points.
    var i = -2;
    // Iterate to draw segments of the wave.
    while ( ( i += 0.01 ) <= 2 )
    {
        // Add a line segment to the path, calculating its x and y coordinates.
        this.ctx.lineTo( this._xpos( i ), this._ypos( i, attenuation ) );
    }

    // Render the defined path onto the canvas.
    this.ctx.stroke();
};


// Clears the entire canvas using a 'destination-out' composite operation.
SiriWave.prototype._clear = function ()
{
    // Set composite operation to 'destination-out' to erase content.
    this.ctx.globalCompositeOperation = 'destination-out';
    // Fill the entire canvas rectangle, effectively clearing it.
    this.ctx.fillRect( 0, 0, this.width, this.height );
    // Reset composite operation back to 'source-over' for normal drawing.
    this.ctx.globalCompositeOperation = 'source-over';
};


// The main drawing loop for the SiriWave animation.
SiriWave.prototype._draw = function ()
{
    // If the animation is not set to run, exit immediately.
    if ( this.run === false )
    {
        return;
    }

    // Update the wave phase for animation, ensuring it loops within 0 to 2*PI.
    this.phase = ( this.phase + Math.PI * this.speed ) % ( 2 * Math.PI );


    // Clear the previous frame's drawing from the canvas.
    this._clear();

    // Draw multiple layers of the wave with varying attenuation, transparency, and line width.
    // Each call creates a slightly different visual effect, contributing to the overall wave.
    this._drawLine( -2, 'rgba(' + this.color + ',0.1)' ); // Faint background wave.
    this._drawLine( -6, 'rgba(' + this.color + ',0.2)' ); // Slightly stronger background wave.
    this._drawLine(  4, 'rgba(' + this.color + ',0.4)' ); // Mid-ground wave.
    this._drawLine(  2, 'rgba(' + this.color + ',0.6)' ); // Foreground wave.
    this._drawLine(  1, 'rgba(' + this.color + ',1)', 1.5 ); // Strongest, thickest foreground wave.


    // Request the next animation frame, binding 'this' context to maintain scope.
    requestAnimationFrame( this._draw.bind( this ) );
};


// =========================================================================
//                           Public API Methods
// =========================================================================


// Initiates the SiriWave animation.
SiriWave.prototype.start = function ()
{
    // Reset the wave phase to its initial state.
    this.phase = 0;
    // Set the run flag to true to allow the animation loop to proceed.
    this.run   = true;
    // Begin the drawing process.
    this._draw();
};


// Halts the SiriWave animation.
SiriWave.prototype.stop = function ()
{
    // Reset the wave phase to its initial state.
    this.phase = 0;
    // Set the run flag to false to stop the animation loop.
    this.run   = false;
};


// Sets the animation speed of the wave.
// 'v' represents the new speed value.
SiriWave.prototype.setSpeed = function ( v )
{
    this.speed = v;
};


// Sets the amplitude (or "noise" level) of the wave.
// 'v' represents the new amplitude value. It is clamped between 0 and 1.
SiriWave.prototype.setNoise = SiriWave.prototype.setAmplitude = function ( v )
{
    // Ensure the amplitude value is within the valid range [0, 1].
    this.amplitude = Math.max( Math.min( v, 1 ), 0 );
};