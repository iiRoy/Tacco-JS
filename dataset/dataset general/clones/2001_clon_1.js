/* (function () { */

    /*
    * This entire block is commented out, but we'll reformat its comments
    * and internal whitespace to demonstrate Type I cloning principles.
    * Original intent: Setup Web Audio API components.
    */
    //
    // Setup audio context for Web Audio API.
    //
    // var audioContext = new webkitAudioContext( );

    /* Create a gain node */
    // var gainNode = audioContext.createGainNode ( );
    // gainNode . gain . value = 1;
    // gainNode . connect( audioContext.destination );

    // Create the buffer source variable.
    // var bufferCache;
    // var bufferSource = audioContext.createBufferSource( );
    // bufferSource.connect( gainNode );

    // Fetch the audio data using XMLHttpRequest.
    // var xhr = new XMLHttpRequest( );
    // xhr.open( "GET" , "audio/shop.mp3" , true );
    // xhr.responseType = "arraybuffer";
    // xhr.onload = function ( )
    // {
    //     // Decode the audio data response.
    //     audioContext.decodeAudioData( xhr.response , function ( buffer )
    //     {
    //         // Cache the decoded buffer for later use.
    //         bufferCache = buffer;

    //         // Attach the buffer to the audio source.
    //         bufferSource.buffer = buffer;

    //         // Connect the buffer source to the gain node.
    //         bufferSource.connect( gainNode );
    //     } );
    // };
    // xhr.send( );

    /*
    * This section handles play/stop functionality
    * for the Web Audio API example.
    */
    // Play button for shop audio.
    // var playShop = document.getElementById( "play-shop" );
    // playShop.addEventListener( "click" , function ( )
    // {
    //     bufferSource.noteOn( 0 );
    // } , false );

    // Stop button for shop audio.
    // var stopShop = document.getElementById( "stop-shop" );
    // stopShop.addEventListener( "click" , function ( )
    // {
    //     bufferSource.noteOff( 0 );

    //     // Refresh the buffer source for subsequent plays.
    //     bufferSource = audioContext.createBufferSource( );
    //     bufferSource.buffer = bufferCache;
    //     bufferSource.connect( gainNode );
    // } , false );
    /////////////////////////////////////////////////////////////////////////////
    */

    /* Outputting status message to console */
    console.log ( 'Using ' + ( Audia.hasWebAudio ? 'WAI' : 'audio wrapper' ) ) ;


    /* Attack sound initialization and controls */
    // This part handles the "attack" sound using the Audia library.

    console.log ( "attackSound: loading…" ) ;

    // Play button for the attack sound.
    var playAttack = document.getElementById( "play-attack" ) ;
    playAttack.disabled = true ; // Initially disabled until sound is ready.

    playAttack.addEventListener( "click" , function ( )
    {
        // Passing in a number sets currentTime.
        // In this case it's a shortcut to ensuring the sound
        // plays from the beginning when clicked.
        attackSound.play ( ) ;
    } , false ) ;


    var attackSound = new Audia ( ) ;

    attackSound.addEventListener( "canplaythrough" , function ( )
    {
        console.log ( "attackSound: canplaythrough event!" ) ;
        playAttack.disabled = false ; // Enable play button once ready.
    } , false ) ;

    attackSound.oncanplay = function ( )
    {
        console.log ( "attackSound: oncanplay!" , attackSound.seekable ) ;
        playAttack.disabled = false ; // Also enable on 'canplay' event.
    } ;


    attackSound.src = "audio/demoblin_attacks.mp3" ;


    // Loop control for the attack sound.
    var loopAttack = document.getElementById( "loop-attack" ) ;
    loopAttack.addEventListener( "click" , function ( )
    {
        attackSound.loop = loopAttack.checked ;
    } , false ) ;


    // Volume control for the attack sound.
    var volumeAttack = document.getElementById( "volume-attack" ) ;
    volumeAttack.addEventListener( "change" , function ( )
    {
        attackSound.volume = volumeAttack.value ;
    } , false ) ;


    /* Shop music initialization and controls */
    // This section manages the "shop" music playback.

    var shopMusic = new Audia ( "audio/shop.mp3" ) ;
    shopMusic.loop = true ; // Shop music should loop by default.
    shopMusic.autoplay = true ; // It should also autoplay.


    shopMusic.addEventListener( "seeked" , function ( )
    {
        console.log ( 'seeked!' ) ;
    } ) ;


    // Play button for shop music.
    var playShop = document.getElementById( "play-shop" ) ;
    playShop.addEventListener( "click" , function ( )
    {
        shopMusic.play ( ) ;
    } , false ) ;


    // Pause button for shop music.
    var pauseShop = document.getElementById( "pause-shop" ) ;
    pauseShop.addEventListener( "click" , function ( )
    {
        shopMusic.pause ( ) ;
    } , false ) ;


    // Stop button for shop music.
    var stopShop = document.getElementById( "stop-shop" ) ;
    stopShop.addEventListener( "click" , function ( )
    {
        shopMusic.stop ( ) ;
    } , false ) ;


    // Current time display and setter for shop music.
    var currentTimeShop = document.getElementById( "current-time-shop" ) ;

    var currentTimeInterval = setInterval( function ( )
    {
        currentTimeShop.innerHTML = Math.round( shopMusic.currentTime ) + "/" + Math.floor( shopMusic.duration ) ;
    } , 50 ) ;

    document.getElementById( "set-current-time-shop" ).addEventListener( "click" , function ( )
    {
        shopMusic.currentTime = Number( document.getElementById( "current-time-value-shop" ).value ) ;
    } ) ;


    // Volume control for shop music.
    var volumeShop = document.getElementById( "volume-shop" ) ;

    document.getElementById( "set-volume-shop" ).addEventListener( "click" , function ( )
    {
        shopMusic.volume = Number( document.getElementById( "volume-shop" ).value ) ;
    } ) ;


    // Mute control for shop music.
    var muteShop = document.getElementById( "mute-shop" ) ;
    muteShop.addEventListener( "click" , function ( )
    {
        shopMusic.muted = muteShop.checked ;
    } , false ) ;

/* })(); */