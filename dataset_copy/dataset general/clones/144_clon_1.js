/*
 * Ion.Sound Library - Core functionality.
 * Version: 3.0.0, Build 75.
 * Copyright: (C) 2014 Denis Ineshin | IonDen.com
 *
 * Project URL: http://ionden.com/a/plugins/ion.sound/en.html
 * Source Code: https://github.com/IonDen/ion.sound
 * License:     MIT (http://ionden.com/a/plugins/licence-en.html)
 *
 * This file contains the foundational setup and initial checks.
 */

( function ( window, navigator, $, undefined )
{
  "use strict" ; /* Enable strict mode for better error handling and cleaner code. */

  window.ion = window.ion || { } ; // Ensure the 'ion' namespace exists on the window object.

  if ( ion.sound )
  { // If ion.sound is already defined, exit early to prevent re-initialization.
    return ;
  }


  // Helper function to display warnings or debug information.
  // This function attempts to use console.warn or console.log.
  var warn = function ( text )
  {
    if ( ! text ) {
      text = "undefined" ; // Default text if none is provided.
    }

    if ( window.console )
    { // Check if console object is available.

      if ( console.warn && typeof console.warn === "function" )
      {
        console.warn( text ) ; // Prefer console.warn for warnings.
      }
      else if ( console.log && typeof console.log === "function" )
      {
        console.log( text ) ; // Fallback to console.log.
      }

      // If jQuery is available and a debug element exists, append message.
      var d = $ && $( "#debug" ) ;
      if ( d.length )
      {
        var a = d.html( ) ;
        d.html( a + text + '<br/>' ) ;
      }
    }
  } ; // End of warn function definition.


  // Utility function to extend an object with properties from another.
  // This performs a shallow copy of enumerable own properties.
  var extend = function ( parent, child )
  {
    var prop ;
    child = child || { } ; // Ensure child is an object.

    for ( prop in parent )
    {
      if ( parent.hasOwnProperty( prop ) )
      {
        child[ prop ] = parent[ prop ] ;
      }
    }

    return child ; // Return the extended child object.
  } ; // End of extend function definition.


  // SECTION: Browser Capability Check
  // ---------------------------------
  // This part disables the library if HTML5 Audio is not supported
  // in the current browser environment.

  if ( typeof Audio !== "function" && typeof Audio !== "object" )
  {
    var func = function ( )
    {
      warn( "HTML5 Audio is not supported in this browser" ) ; // Inform user about lack of support.
    } ;
    ion.sound = func ; // Assign the dummy function to ion.sound.
    ion.sound.play = func ; // All public methods become no-ops.
    ion.sound.stop = func ;
    ion.sound.pause = func ;
    ion.sound.preload = func ;
    ion.sound.destroy = func ;
    func( ) ; // Call the dummy function once to show the warning.
    return ; // Exit the IIFE as audio functionality is not available.
  }


  // SECTION: Core Variables and Initialization
  // ------------------------------------------
  // Defines global variables and objects used throughout the library.

  var is_iOS = /iPad|iPhone|iPod/.test( navigator.appVersion ) , // Check for iOS devices.
      sounds_num = 0 , // Counter for the number of sound files.
      settings = { } , // Global settings object.
      sounds = { } , // Collection of Sound instances.
      i ; // Loop iterator variable.


  // Determine supported audio formats based on environment.
  if ( ! settings.supported && is_iOS )
  {
    settings.supported = [ "mp3", "mp4", "aac" ] ; // iOS specific formats.
  }
  else if ( ! settings.supported )
  {
    settings.supported = [ "mp3", "ogg", "mp4", "aac", "wav" ] ; // General formats.
  }


  // Factory function to create and store a Sound object.
  var createSound = function ( obj )
  {
    var name = obj.alias || obj.name ; // Use alias if provided, otherwise name.

    if ( ! sounds[ name ] )
    { // Create new Sound instance only if it doesn't already exist.
      sounds[ name ] = new Sound( obj ) ;
      sounds[ name ].init( ) ;
    }
  } ;


  // Main initialization function for ion.sound.
  // Configures the library and creates sound objects.
  ion.sound = function ( options )
  {
    extend( options, settings ) ; // Merge user options into global settings.

    // Set default values for various settings if not provided.
    settings.path = settings.path || "" ;
    settings.volume = settings.volume || 1 ;
    settings.preload = settings.preload || false ;
    settings.multiplay = settings.multiplay || false ;
    settings.loop = settings.loop || false ;
    settings.sprite = settings.sprite || null ;
    settings.scope = settings.scope || null ;
    settings.ready_callback = settings.ready_callback || null ;
    settings.ended_callback = settings.ended_callback || null ;

    sounds_num = settings.sounds.length ; // Get total number of sounds to load.

    if ( ! sounds_num )
    { // If no sound files are specified, issue a warning.
      warn( "No sound-files provided!" ) ;
      return ;
    }

    // Iterate through the provided sound configurations and create Sound objects.
    for ( i = 0 ; i < sounds_num ; i ++ )
    {
      if ( ! sounds[ i ] )
      { // Ensure sound is not already defined by index.
        createSound( settings.sounds[ i ] ) ;
      }
    }
  } ; // End of ion.sound initialization.


  // Expose the version number of the library.
  ion.sound.VERSION = "3.0.0" ;


  // Internal method to call a specific method on one or all sound instances.
  ion.sound._method = function ( method, name, options )
  {
    if ( name )
    { // If a specific sound name is provided.
      sounds[ name ] && sounds[ name ][ method ]( options ) ;
    }
    else
    { // Otherwise, iterate through all sounds and call the method.
      for ( i in sounds )
      {
        if ( ! sounds.hasOwnProperty( i ) )
        {
          continue ;
        }
        sounds[ i ][ method ]( options ) ;
      }
    }
  } ;


  // Public method to preload sounds.
  ion.sound.preload = function ( name, options )
  {
    options = options || { } ;
    extend( { preload: true }, options ) ; // Force preload option to true.

    ion.sound._method( "init", name, options ) ; // Call init method with preload option.
  } ;


  // Public method to destroy sound instances and free up resources.
  ion.sound.destroy = function ( name )
  {
    ion.sound._method( "destroy", name ) ; // Call destroy on the specified sound or all.

    if ( name )
    { // If a specific sound was named, remove it from the 'sounds' collection.
      sounds[ name ] = null ;
    }
    else
    { // If no name, destroy all sound instances.
      for ( i in sounds )
      {
        if ( ! sounds.hasOwnProperty( i ) )
        {
          continue ;
        }
        if ( sounds[ i ] )
        {
          sounds[ i ] = null ;
        }
      }
    }
  } ;


  // Public method to play a sound.
  ion.sound.play = function ( name, options )
  {
    ion.sound._method( "play", name, options ) ;
  } ;


  // Public method to stop a sound.
  ion.sound.stop = function ( name, options )
  {
    ion.sound._method( "stop", name, options ) ;
  } ;


  // Public method to pause a sound.
  ion.sound.pause = function ( name, options )
  {
    ion.sound._method( "pause", name, options ) ;
  } ;


  // Integrate with jQuery if it is available.
  if ( $ )
  {
    $.ionSound = ion.sound ;
  }


  // SECTION: Web Audio API Integration
  // ----------------------------------
  // This section handles the Web Audio API context and related functionalities.

  var AudioContext = window.AudioContext || window.webkitAudioContext , // Get the AudioContext constructor.
      audio ; // Variable to hold the AudioContext instance.

  if ( AudioContext )
  {
    audio = new AudioContext( ) ; // Create a new AudioContext if supported.
  }


  // Sound constructor function.
  // Represents a single sound file and its associated properties.
  var Sound = function ( options )
  {
    this.options = extend( settings ) ; // Clone global settings.
    delete this.options.sounds ; // Remove 'sounds' array as it's not relevant for a single sound.
    extend( options, this.options ) ; // Merge specific sound options.

    this.request = null ; // XMLHttpRequest object for loading audio data.
    this.streams = { } ; // Collection of Stream objects for this sound.
    this.result = { } ; // Holds the XMLHttpRequest response.
    this.ext = 0 ; // Index for current audio extension being tried.
    this.url = "" ; // URL of the audio file.

    this.loaded = false ; // Flag indicating if audio data is loaded.
    this.decoded = false ; // Flag indicating if audio data is decoded.
    this.no_file = false ; // Flag if no supported file could be found.
    this.autoplay = false ; // Flag for delayed autoplay.
  } ;


  // Prototype methods for the Sound object.
  Sound.prototype = {
    init: function ( options )
    {
      if ( options )
      {
        extend( options, this.options ) ; // Update options if provided.
      }

      if ( this.options.preload )
      {
        this.load( ) ; // Start loading if preload is enabled.
      }
    } , // End of init method.

    destroy: function ( )
    {
      var stream ;

      // Destroy all associated stream objects.
      for ( i in this.streams )
      {
        stream = this.streams[ i ] ;

        if ( stream )
        {
          stream.destroy( ) ;
          stream = null ; // Nullify the reference.
        }
      }
      this.streams = { } ; // Reset streams object.
      this.result = null ; // Clear result.
      this.options.buffer = null ; // Clear audio buffer.
      this.options = null ; // Clear options.

      if ( this.request )
      { // Clean up XMLHttpRequest.
        this.request.removeEventListener( "load", this.ready.bind( this ), false ) ;
        this.request.removeEventListener( "error", this.error.bind( this ), false ) ;
        this.request.abort( ) ; // Abort any pending request.
        this.request = null ;
      }
    } , // End of destroy method.

    createUrl: function ( )
    {
      var no_cache = new Date( ).valueOf( ) ; // Generate a unique timestamp for cache busting.
      this.url = this.options.path + this.options.name + "." + this.options.supported[ this.ext ] + "?" + no_cache ;
    } , // End of createUrl method.

    load: function ( )
    {
      if ( this.no_file )
      { // If no valid file was found previously, warn and return.
        warn( "No sources for \"" + this.options.name + "\" sound :(" ) ;
        return ;
      }

      this.createUrl( ) ; // Construct the URL for the current audio format.

      this.request = new XMLHttpRequest( ) ; // Create a new XMLHttpRequest.
      this.request.open( "GET", this.url, true ) ; // Configure the request.
      this.request.responseType = "arraybuffer" ; // Expect binary data.
      this.request.addEventListener( "load", this.ready.bind( this ), false ) ; // Attach load handler.
      this.request.addEventListener( "error", this.error.bind( this ), false ) ; // Attach error handler.

      this.request.send( ) ; // Send the request to load the audio file.
    } , // End of load method.

    reload: function ( )
    {
      this.ext ++ ; // Increment extension index to try the next format.

      if ( this.options.supported[ this.ext ] )
      { // If there's another supported format to try.
        this.load( ) ; // Attempt to load with the next extension.
      }
      else
      { // No more supported formats to try.
        this.no_file = true ; // Mark as no file found.
        warn( "No sources for \"" + this.options.name + "\" sound :(" ) ; // Warn the user.
      }
    } , // End of reload method.

    ready: function ( data )
    {
      this.result = data.target ; // Store the XMLHttpRequest target.

      if ( this.result.readyState !== 4 )
      { // If request is not complete, something is wrong, try reloading.
        this.reload( ) ;
        return ;
      }

      if ( this.result.status !== 200 )
      { // If HTTP status is not OK, warn and try reloading.
        warn( this.url + " was not found on server!" ) ;
        this.reload( ) ;
        return ;
      }

      // Clean up event listeners after successful load.
      this.request.removeEventListener( "load", this.ready.bind( this ), false ) ;
      this.request.removeEventListener( "error", this.error.bind( this ), false ) ;
      this.request = null ; // Clear request object.
      this.loaded = true ; // Mark as loaded.
      // warn("Loaded: " + this.options.name + "." + settings.supported[this.ext]); // Optional debug message.

      this.decode( ) ; // Proceed to decode the audio data.
    } , // End of ready method.

    decode: function ( )
    {
      if ( ! audio )
      { // If AudioContext is not available, cannot decode.
        return ;
      }

      // Decode the audio data using the AudioContext.
      audio.decodeAudioData( this.result.response, this.setBuffer.bind( this ), this.error.bind( this ) ) ;
    } , // End of decode method.

    setBuffer: function ( buffer )
    {
      this.options.buffer = buffer ; // Store the decoded audio buffer.
      this.decoded = true ; // Mark as decoded.
      // warn("Decoded: " + this.options.name + "." + settings.supported[this.ext]); // Optional debug message.

      var config = {
        name: this.options.name ,
        alias: this.options.alias ,
        ext: this.options.supported[ this.ext ] ,
        duration: this.options.buffer.duration
      } ;

      // Execute ready callback if defined.
      if ( this.options.ready_callback && typeof this.options.ready_callback === "function" )
      {
        this.options.ready_callback.call( this.options.scope, config ) ;
      }

      if ( this.options.sprite )
      { // If sound sprites are defined.

        for ( i in this.options.sprite )
        {
          this.options.start = this.options.sprite[ i ][ 0 ] ; // Set start time for sprite.
          this.options.end = this.options.sprite[ i ][ 1 ] ; // Set end time for sprite.
          this.streams[ i ] = new Stream( this.options, i ) ; // Create a stream for each sprite part.
        }

      }
      else
      { // No sprites, create a single stream for the entire sound.

        this.streams[ 0 ] = new Stream( this.options ) ;

      }

      if ( this.autoplay )
      { // If autoplay was requested while loading.
        this.autoplay = false ; // Reset autoplay flag.
        this.play( ) ; // Play the sound now that it's ready.
      }
    } , // End of setBuffer method.

    error: function ( )
    {
      this.reload( ) ; // If an error occurs during loading or decoding, try next format.
    } , // End of error method.

    play: function ( options )
    {
      delete this.options.part ; // Clear any previous 'part' setting.

      if ( options )
      {
        extend( options, this.options ) ; // Merge play-specific options.
      }

      if ( ! this.loaded )
      { // If sound is not yet loaded.
        if ( ! this.options.preload )
        { // If not preloading, mark for autoplay and load.
          this.autoplay = true ;
          this.load( ) ;
        }
        return ;
      }

      if ( this.no_file || ! this.decoded )
      { // If no file found or not decoded, cannot play.
        return ;
      }

      if ( this.options.sprite )
      { // Handle sound sprites.
        if ( this.options.part )
        { // Play a specific sprite part.
          this.streams[ this.options.part ].play( this.options ) ;
        }
        else
        { // Play all sprite parts (if multiplay is enabled for streams).
          for ( i in this.options.sprite )
          {
            this.streams[ i ].play( this.options ) ;
          }
        }
      }
      else
      { // No sprites, play the single stream.
        this.streams[ 0 ].play( this.options ) ;
      }
    } , // End of play method.

    stop: function ( options )
    {
      if ( this.options.sprite )
      { // Handle sound sprites.

        if ( options && options.part )
        { // Stop a specific sprite part.
          this.streams[ options.part ].stop( ) ;
        }
        else
        { // Stop all sprite parts.
          for ( i in this.options.sprite )
          {
            this.streams[ i ].stop( ) ;
          }
        }

      }
      else
      { // No sprites, stop the single stream.
        this.streams[ 0 ].stop( ) ;
      }
    } , // End of stop method.

    pause: function ( options )
    {
      if ( this.options.sprite )
      { // Handle sound sprites.

        if ( options && options.part )
        { // Pause a specific sprite part.
          this.streams[ options.part ].pause( ) ;
        }
        else
        { // Pause all sprite parts.
          for ( i in this.options.sprite )
          {
            this.streams[ i ].pause( ) ;
          }
        }

      }
      else
      { // No sprites, pause the single stream.
        this.streams[ 0 ].pause( ) ;
      }
    } // End of pause method.
  } ; // End of Sound.prototype.


  // Stream constructor function.
  // Represents an individual audio playback stream.
  var Stream = function ( options, sprite_part )
  {
    this.alias = options.alias ; // Alias of the sound.
    this.name = options.name ; // Name of the sound.
    this.sprite_part = sprite_part ; // Name of the sprite part, if applicable.

    this.buffer = options.buffer ; // Audio buffer to play.
    this.start = options.start || 0 ; // Playback start time.
    this.end = options.end || this.buffer.duration ; // Playback end time.
    this.multiplay = options.multiplay || false ; // Allow multiple instances to play simultaneously.
    this.volume = options.volume || 1 ; // Playback volume.
    this.scope = options.scope ; // Scope for callbacks.
    this.ended_callback = options.ended_callback ; // Callback when stream ends.

    this.setLoop( options ) ; // Configure looping behavior.

    this.source = null ; // AudioBufferSourceNode.
    this.gain = null ; // GainNode for volume control.
    this.playing = false ; // Flag indicating if stream is currently playing.
    this.paused = false ; // Flag indicating if stream is currently paused.

    this.time_started = 0 ; // Timestamp when playback started.
    this.time_ended = 0 ; // Timestamp when playback ended.
    this.time_played = 0 ; // Total time played.
    this.time_offset = 0 ; // Offset for resuming playback.
  } ;


  // Prototype methods for the Stream object.
  Stream.prototype = {
    destroy: function ( )
    {
      this.stop( ) ; // Ensure stream is stopped before destroying.

      this.buffer = null ; // Clear buffer reference.
      this.source = null ; // Clear source reference.

      if ( this.gain ) { this.gain.disconnect( ) ; } // Disconnect gain node.
      if ( this.source ) { this.source.disconnect( ) ; } // Disconnect source node.
      this.gain = null ; // Clear gain node.
      this.source = null ; // Clear source node.
    } , // End of destroy method.

    setLoop: function ( options )
    {
      if ( options.loop === true )
      {
        this.loop = 9999999 ; // Arbitrarily large number for infinite loop.
      }
      else if ( typeof options.loop === "number" )
      {
        this.loop = + options.loop - 1 ; // Convert to number and adjust for 0-indexed loop count.
      }
    } , // End of setLoop method.

    update: function ( options )
    {
      this.setLoop( options ) ; // Update looping configuration.
      if ( "volume" in options )
      { // Update volume if present in options.
        this.volume = options.volume ;
      }
    } , // End of update method.

    play: function ( options )
    {
      if ( options )
      {
        this.update( options ) ; // Apply any new options for playback.
      }

      if ( ! this.multiplay && this.playing )
      { // If multiplay is not allowed and it's already playing, do nothing.
        return ;
      }

      this.gain = audio.createGain( ) ; // Create a GainNode for volume control.
      this.source = audio.createBufferSource( ) ; // Create an AudioBufferSourceNode.
      this.source.buffer = this.buffer ; // Assign the decoded audio buffer.
      this.source.connect( this.gain ) ; // Connect source to gain node.
      this.gain.connect( audio.destination ) ; // Connect gain node to audio output.
      this.gain.gain.value = this.volume ; // Set the volume.

      this.source.onended = this.ended.bind( this ) ; // Set the 'onended' event handler.

      this._play( ) ; // Call the internal play method.
    } , // End of play method.

    _play: function ( )
    {
      var start ,