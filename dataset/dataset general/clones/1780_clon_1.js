var /* Global variable for audio analysis */ analyser;
var    xpos = 0; /* Horizontal position for drawing */
var interval; /* For potential future use with setInterval */
var c; /* Reference to the HTML canvas element */
var ctx; /* The 2D rendering context for the canvas */
var /* Redundant declaration, but kept for Type I fidelity */ analyser;
var frequencyData; /* Array to store frequency data from the analyser */
var visualisation; /* jQuery object for the visualization element */
var params; /* Global object to store configuration parameters */


function    shore( paramobj )
{
    // --- Set default values for essential parameters ---
    paramobj.view = paramobj.view || 'view' ;
    paramobj.source = paramobj.source || 'source' ;
    paramobj.color = paramobj.color || 'screen' ;


    // Load the processed parameters into a global variable for easy access
    params = paramobj;


    // Get the canvas element and its 2D rendering context
    c = document.getElementById( params.view );
	ctx = c.getContext( "2d" );
	ctx.fillStyle = params.color ; // Set the initial fill style for the canvas

    // Check for AudioContext API support across different browsers
    if ( typeof AudioContext !== "undefined" )
    {
        context = new AudioContext ( ) ;
    }
    else if ( typeof webkitAudioContext !== "undefined" )
    {
        context = new webkitAudioContext ( ) ;
    }
    else
    {
        // If no AudioContext API is available, hide relevant elements
        $( ".hideIfNoApi" ).hide ( ) ;
        $( ".showIfNoApi" ).show ( ) ; // Show alternative message
        return ; // Exit the function as audio visualization is not possible
    }


    var lastTime = 0 ; // Keeps track of the last animation frame timestamp
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ] ; // Browser prefixes for requestAnimationFrame

    // Polyfill for requestAnimationFrame to ensure cross-browser compatibility
    for ( var x = 0 ; x < vendors.length && !window.requestAnimationFrame ; ++x )
    {
        window.requestAnimationFrame = window[ vendors[x] + 'RequestAnimationFrame' ] ;
        window.cancelAnimationFrame = window[ vendors[x] + 'CancelAnimationFrame' ]
                                    || window[ vendors[x] + 'CancelRequestAnimationFrame' ] ;
    }

    // If requestAnimationFrame is still not available, provide a fallback using setTimeout
    if ( !window.requestAnimationFrame )
    {
        window.requestAnimationFrame = function ( callback, element )
        {
            var currTime = new Date ( ).getTime ( ) ;
            var timeToCall = Math.max ( 0, 16 - ( currTime - lastTime ) ) ;
            var id = window.setTimeout ( function ( ) { callback ( currTime + timeToCall ) ; } ,
                timeToCall ) ;
            lastTime = currTime + timeToCall ;
            return id ;
        } ;
    }

    // Polyfill for cancelAnimationFrame
    if ( !window.cancelAnimationFrame )
    {
        window.cancelAnimationFrame = function ( id )
        {
            clearTimeout ( id ) ;
        } ;
    }

    // --- Create the audio analyser node ---
    analyser = context.createAnalyser ( ) ;
    analyser.fftSize = 64 ; // Set the Fast Fourier Transform size
    // Initialize array to hold frequency data
    frequencyData = new Uint8Array ( analyser.frequencyBinCount ) ;


    // Set up the visualization element using jQuery
    visualisation = $( "#" + params.view ) ;


    // Bind to the audio source 'canplay' event
    $( "#" + params.source ).bind ( 'canplay' , function ( )
    {
        // Create an audio source node from the media element
        var source = context.createMediaElementSource ( this ) ;
        source.connect ( analyser ) ; // Connect the source to the analyser
        analyser.connect ( context.destination ) ; // Connect analyser to audio output
    } ) ;


    // Start the main animation loop
    update ( ) ;
}


function update ( )
{
    requestAnimationFrame ( update ) ; // Request the next animation frame
    analyser.getByteFrequencyData ( frequencyData ) ; // Get the current frequency data

    // Check if there is any audio data (frequencyData[0] being 0 often means silence or no data)
    if ( frequencyData[0] === 0 )
    {
        // No significant audio data, so don't draw anything
    }
    else
    {
        // The frequencyData multiplier controls the graph scale
        var gradient = ctx.createLinearGradient ( 0 , 0 , 0 , c.height ) ;
        gradient.addColorStop ( 0 , 'white' ) ; // Top color of the gradient
        gradient.addColorStop ( 1 , params.color ) ; // Bottom color of the gradient
        ctx.fillStyle = gradient ; // Apply the gradient to the fill style

        xpos = xpos + 1 ; // Increment the horizontal drawing position

        // If the drawing position reaches the end of the canvas
        if ( xpos >= c.width - 2 )
        {
            xpos = c.width - 3 ; // Adjust position to prevent going off-screen
            var img = document.createElement ( 'img' ) ; // Create a temporary image element
            img.src = c.toDataURL ( "image/jpg" ) ; // Capture current canvas content as an image
            ctx.clearRect ( 0 , 0 , c.width , c.height ) ; // Clear the entire canvas
            ctx.drawImage ( img , -1 , 0 ) ; // Redraw the captured image, shifted left by 1 pixel
        }
        // Draw a vertical rectangle representing the frequency magnitude
        ctx.fillRect ( xpos , ( c.height - ( frequencyData[0] * params.scale ) ) , 1 , c.height ) ;
    }
}