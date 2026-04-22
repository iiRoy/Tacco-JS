( function ( ) {
  // Polyfill for requestAnimationFrame across different browsers
  var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ;

  // Assign the found or polyfilled requestAnimationFrame to the global window object
  window.requestAnimationFrame = requestAnimationFrame ;
} ) ( ) ;



// This function executes once the entire page has loaded.
window.onload = function ( ) {
  // Retrieve the DOM element with the ID 'container'
  var element = document.getElementById ( 'container' ) ;

  // Initialize the drag-and-drop functionality for the element
  // It will call 'init' with the loaded file as an 'ArrayBuffer'.
  dropAndLoad ( element , init , "ArrayBuffer" ) ;
} ;



// Reusable function to handle file drops and loading.
// It takes a `dropElement` (DOM element), a `callback` function,
// and `readFormat` (e.g., "ArrayBuffer", "DataURL", "Text").
function dropAndLoad ( dropElement , callback , readFormat ) {

  // Set a default read format if none is provided.
  var readFormat = readFormat || "DataUrl" ;

  // Add an event listener for the 'dragover' event.
  // This is necessary to allow a drop.
  dropElement.addEventListener ( 'dragover' , function ( e ) {
    e.stopPropagation ( ) ; // Prevent default browser handling of the event.
    e.preventDefault ( ) ;  // Prevent default browser handling of the event.
    e.dataTransfer.dropEffect = 'copy' ; // Indicate that data will be copied.
  } , false ) ; // Use event bubbling.


  // Add an event listener for the 'drop' event.
  // This is where the file processing begins.
  dropElement.addEventListener ( 'drop' , function ( e ) {
    e.stopPropagation ( ) ; // Prevent default browser handling.
    e.preventDefault ( ) ;  // Prevent default browser handling.

    // Load the first file that was dropped.
    loadFile ( e.dataTransfer.files [ 0 ] ) ;
  } , false ) ; // Use event bubbling.


  // Inner function to actually read the dropped file.
  function loadFile ( files ) {

    var file = files ; // The file object to be read.
    var reader = new FileReader ( ) ; // Create a new FileReader instance.

    // Define the onload event handler for the FileReader.
    reader.onload = function ( e ) {
      // Call the main callback function with the result of the file read.
      callback ( e.target.result ) ;
    } ;

    // Dynamically call the appropriate read method based on `readFormat`.
    // For example, if readFormat is "ArrayBuffer", it calls reader.readAsArrayBuffer(file).
    reader [ 'readAs' + readFormat ] ( file ) ;
  }
}



// This function is called once the audio file (as an ArrayBuffer) has been loaded.
// It sets up the audio context, analyser, and visualizer.
function init ( arrayBuffer ) {

  // Update instructions on the page to indicate loading.
  document.getElementById ( 'instructions' ) . innerHTML = 'Loading ...' ;

  // Create a new AudioContext for audio processing.
  window.audioCtx = new AudioContext ( ) ;

  // Create an AnalyserNode, which provides real-time frequency and waveform data.
  window.analyser = audioCtx.createAnalyser ( ) ;

  // If there's an audio source already playing, stop it to prevent overlapping.
  if ( window.source ) {
    source.noteOff ( 0 ) ;
  }

  // Decode the raw audio data (ArrayBuffer) into an AudioBuffer.
  audioCtx.decodeAudioData ( arrayBuffer , function ( buffer ) {

    // Create an AudioBufferSourceNode, which will play the decoded audio buffer.
    window.source = audioCtx.createBufferSource ( ) ;

    // Assign the decoded audio buffer to the source node.
    source.buffer = buffer ;

    // Connect the audio source to the analyser node.
    source.connect ( analyser ) ;

    // Connect the analyser node to the audio context's destination (speakers).
    // This allows the audio to be heard while being analyzed.
    analyser.connect ( audioCtx.destination ) ;

    // Start playing the audio from the beginning (offset 0).
    source.start ( 0 ) ;

    // Initialize an instance of the simple visualization object.
    var viz = new simpleViz ( ) ;

    // Pass the visualizer's update function and the analyser to the main visualizer loop.
    new visualizer ( viz [ 'update' ] , analyser ) ;

    // Clear the loading instructions once everything is set up.
    document.getElementById ( 'instructions' ) . innerHTML = '' ;
  } ) ;
}



// The visualizer object constructor.
// It orchestrates calling a `visualization` function repeatedly
// with new audio data from an `analyser`.
function visualizer ( visualization , analyser ) {

  var self = this ; // Store a reference to 'this' for use in nested functions.

  this.visualization = visualization ; // The function to call for each frame update.

  var last = Date.now ( ) ; // Timestamp of the last frame.


  // The main animation loop for the visualizer.
  var loop = function ( ) {
    var dt = Date.now ( ) - last ; // Calculate the time elapsed since the last frame.

    // Create a new Uint8Array to hold the byte frequency data.
    var byteFreq = new Uint8Array ( analyser.frequencyBinCount ) ;

    // Populate the array with frequency data from the analyser.
    analyser.getByteFrequencyData ( byteFreq ) ;

    last = Date.now ( ) ; // Update the timestamp for the current frame.

    // Call the provided visualization function with the frequency data and delta time.
    self.visualization ( byteFreq , dt ) ;

    // Request the next animation frame, perpetuating the loop.
    requestAnimationFrame ( loop ) ;
  } ;

  // Start the animation loop for the first time.
  requestAnimationFrame ( loop ) ;
}



// A simple visualization implementation.
// Its `update` function demonstrates how to use the byte frequency data
// from an AudioContext AnalyserNode to draw a bar graph.
function simpleViz ( canvas ) {

  var self = this ; // Store a reference to 'this' for use in nested functions.

  // Get the main canvas element for drawing the visualization.
  this.canvas = document.getElementById ( 'canvas' ) ;
  // Get the 2D rendering context for the main canvas.
  this.ctx = this.canvas.getContext ( "2d" ) ;

  // Get a separate canvas context for creating a copy or shadow effect.
  this.copyCtx = document.getElementById ( 'canvas-copy' ) . getContext ( "2d" ) ;

  this.ctx.fillStyle = '#fff' ; // Set the fill color for the bars to white.

  this.barWidth = 10 ; // Define the width of each bar in the visualization.
  this.barGap = 4 ;   // Define the space between each bar.

  // Calculate the total number of bars that can fit on the canvas.
  this.bars = Math.floor ( this.canvas.width / ( this.barWidth + this.barGap ) ) ;


  // This function is invoked for each animation frame, receiving
  // the byte frequency data from the analyser.
  this.update = function ( byteFreq ) {

    // Clear the entire main canvas before drawing the new frame.
    self.ctx.clearRect ( 0 , 0 , self.canvas.width , self.canvas.height ) ;

    // Determine the step size to sample the byteFreq array.
    // This allows distributing the frequency data across the available bars.
    var step = Math.floor ( byteFreq.length / self.bars ) ;

    // Loop through each bar position to draw it on the canvas.
    for ( var i = 0 ; i < self.bars ; i ++ ) {

      // Get the height for the current bar from the frequency data.
      var barHeight = byteFreq [ i * step ] ;

      // Draw a filled rectangle for the current bar.
      self.ctx.fillRect (
        i * ( self.barWidth + self.barGap ) , // X position: current bar's start.
        self.canvas.height - barHeight ,      // Y position: bottom-aligned bar.
        self.barWidth ,                       // Width of the bar.
        barHeight                             // Height of the bar.
      ) ;

      // Clear the copy canvas.
      self.copyCtx.clearRect ( 0 , 0 , self.canvas.width , self.canvas.height ) ;

      // Draw the content of the main canvas onto the copy canvas.
      // This could be used for effects like blur, glow, or reflections.
      self.copyCtx.drawImage ( self.canvas , 0 , 0 ) ;
    }
  } ;
}