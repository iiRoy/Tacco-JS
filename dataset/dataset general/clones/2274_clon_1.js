// This is a sample JavaScript file for audio visualization.
// Original author: Boris Smus
// Date: 2013
// This code is provided under the Apache License, Version 2.0.
// For full license details, please refer to:
// http://www.apache.org/licenses/LICENSE-2.0
// All rights reserved.
//---------------------------------------------------------------------


// --- Global Configuration Variables ---
var WIDTH=640; // Canvas width in pixels
var HEIGHT=360; // Canvas height in pixels

// Parameters that can be adjusted for different visual effects.
var SMOOTHING = 0.8; // Smoothing constant for frequency data
var FFT_SIZE = 2048; // Fast Fourier Transform size (power of 2)

function VisualizerSample ( ) {
    // Constructor for the audio visualizer.
    // Initializes the Web Audio API AnalyserNode and other properties.
    this.analyser = context.createAnalyser(); // Create an AnalyserNode.

    this.analyser.connect( context.destination ); // Connect analyser to the audio output.
    this.analyser.minDecibels = -140; // Minimum decibel value for frequency data.
    this.analyser.maxDecibels = 0; // Maximum decibel value for frequency data.

    // Load the audio file.
    loadSounds( this , {
        buffer: 'chrono.mp3' // The audio file to be loaded.
        // Uncomment the line below to use a different sound file if needed.
        // buffer: 'sound.wav'
    } );

    // Initialize arrays to hold frequency and time domain data.
    this.freqs = new Uint8Array( this.analyser.frequencyBinCount );
    this.times = new Uint8Array( this.analyser.frequencyBinCount );

    this.isPlaying = true; // Flag to track playback state.
    this.startTime = 0; // Timestamp when playback started or resumed.
    this.startOffset = 0; // Offset in the buffer for seeking/pausing.
}

// Prototype method to control audio playback (play/pause).
VisualizerSample.prototype.togglePlayback = function ( )
{
    if ( this.isPlaying )
    {
        // If currently playing, stop the audio.
        this.source.noteOff( 0 );
        // Calculate and save the current playback position.
        this.startOffset += context.currentTime - this.startTime;
        console.log( 'paused at' , this.startOffset );
        // The play head position is stored in startOffset.
    }
    else
    {
        // If not playing, start or resume playback.
        this.startTime = context.currentTime; // Record the current time.
        console.log( 'started at' , this.startOffset );

        this.source = context.createBufferSource( ); // Create a new buffer source.

        // Connect the audio source to the analyser node.
        this.source.connect( this.analyser );
        this.source.buffer = this.buffer; // Assign the loaded audio buffer.
        this.source.loop = true; // Set the audio to loop continuously.

        // Start playing from the saved offset, ensuring it wraps around if necessary.
        this.source.start( 0 , this.startOffset % this.buffer.duration );

        // Begin the visualization loop by requesting an animation frame.
        requestAnimFrame( this.draw.bind( this ) );
    }
    // Invert the playback state.
    this.isPlaying = !this.isPlaying;
}; // End of togglePlayback function.


VisualizerSample.prototype.draw = function ( ) {
    // Set analyser parameters for the current draw cycle.
    this.analyser.smoothingTimeConstant = SMOOTHING;
    this.analyser.fftSize = FFT_SIZE;

    // Retrieve the latest frequency and time domain data from the analyser.
    this.analyser.getByteFrequencyData( this.freqs ); // Fills this.freqs with frequency data.
    this.analyser.getByteTimeDomainData( this.times ); // Fills this.times with waveform data.

    // Calculate a 'width' variable, though it seems unused in the original code's drawing logic.
    var width = Math.floor( 1 / this.freqs.length , 10 );

    // Get the canvas element and its 2D rendering context.
    var canvas = document.querySelector( 'canvas' );
    var drawContext = canvas.getContext( '2d' );

    // Ensure canvas dimensions match the global WIDTH and HEIGHT.
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // --- Start drawing the frequency domain chart (spectrum analyzer). ---
    for ( var i = 0; i < this.analyser.frequencyBinCount; i++ )
    {
        var value = this.freqs[ i ]; // Get frequency amplitude.
        var percent = value / 256; // Normalize to a percentage (0-1).
        var height = HEIGHT * percent; // Calculate bar height based on canvas height.
        var offset = HEIGHT - height - 1; // Calculate Y-offset for bottom-aligned bars.
        var barWidth = WIDTH / this.analyser.frequencyBinCount; // Width of each bar.
        var hue = i / this.analyser.frequencyBinCount * 360; // Calculate hue for color.

        drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)'; // Set fill color.
        // Draw the frequency bar.
        drawContext.fillRect( i * barWidth , offset , barWidth , height );
    }

    // --- Start drawing the time domain chart (waveform). ---
    for ( var i = 0; i < this.analyser.frequencyBinCount; i++ )
    {
        var value = this.times[ i ]; // Get waveform amplitude.
        var percent = value / 256; // Normalize to a percentage (0-1).
        var height = HEIGHT * percent; // Calculate bar height (here, it's more like a point's Y-position).
        var offset = HEIGHT - height - 1; // Calculate Y-offset.
        var barWidth = WIDTH / this.analyser.frequencyBinCount; // This variable is reused but not directly used for width (it's 1px).

        drawContext.fillStyle = 'white'; // Set fill color to white for the waveform.
        // Draw a small rectangle for each point in the waveform.
        drawContext.fillRect( i * barWidth , offset , 1 , 2 );
    }

    // If audio is still playing, request the next animation frame to continue drawing.
    if ( this.isPlaying ) {
        requestAnimFrame( this.draw.bind( this ) );
    }
}; // End of draw method.

// Method to get the amplitude value for a specific frequency.
VisualizerSample.prototype.getFrequencyValue = function( freq )
{
    var nyquist = context.sampleRate / 2; // Calculate the Nyquist frequency.
    // Determine the index in the frequency array corresponding to the given frequency.
    var index = Math.round( freq / nyquist * this.freqs.length );
    return this.freqs[ index ]; // Return the frequency amplitude at that index.
}; // End of getFrequencyValue.