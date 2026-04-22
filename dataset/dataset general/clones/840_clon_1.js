/*
 * Youtube Chromeless Video Plugin
 *   http://www.viget.com/
 *
 * Copyright (c) 2010 Trevor Davis
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 0.4 - This is the current version of the plugin.
 */

// Self-executing anonymous function to encapsulate the plugin
( function ($) {


  // Extend jQuery's prototype to add the ytchromeless function
  $.fn.ytchromeless = function ( options ) {

    // Initial configuration defaults for the video player
    var config = {
      videoWidth  :  '640'  ,
      videoHeight :  '360'  , // Default height of the video player
      videoIdBase :  'ytplayer',
      params      :  {
        allowScriptAccess : 'always' , // Required for JS API communication
        wmode             : 'transparent' // Makes the player transparent
      }
    };

    // Iterate over each selected element to apply the plugin
    return this.each( function (i) {

        // Merge default configuration with user-provided options
        var o = $.extend( config, options ) ,

            // Cache jQuery object for the current link
            $link = $( this ) ,

            // Extract necessary video information
            url = $link.attr( 'href' ) ,
            videoId = $link.attr( 'id' ) || ( o.videoIdBase + i ) , // Generate unique ID if not provided
            ytVideoId = url.substr( 31 ) , // Extract YouTube video ID from URL

            // Create new DOM elements for the video player structure
            $video = $link.wrap( '<div class="video-player"></div>' ).parent() , // Main video container
            $controls = $( '<div class="video-controls"></div>' ).appendTo( $video ) , // Controls container
            $toReplace = $( '<div class="video"></div>' ) .prependTo( $video ) .attr( 'id' , videoId ) , // Placeholder for the YouTube player

            // Declare control elements, to be initialized later
            $bar ,
            $indicator ,
            $loaded ,
            $mute ,
            $play ,
            $seek ,

            // The YouTube player object itself
            player ;

        // Bind custom events for controlling the video player
        $video .bind( {

          // Playback control events
          'togglePlay' : function ( ) { $video.togglePlay(); } ,
          'play'       : function ( ) { $video.play(); } ,
          'pause'      : function ( ) { $video.pause(); } ,
          'toggleMute' : function ( ) { $video.toggleMute(); } ,
          'mute'       : function ( ) { $video.mute(); } ,
          'unMute'     : function ( ) { $video.unMute(); } ,
          'seek'       : function ( ) { $video.seek(); } ,

          // Player state and initialization events
          'update'     : function ( ) { $video.update(); } , // Update player status (progress, buffer)
          'cue'        : function ( ) { player.cueVideoById( ytVideoId ); } // Load and prepare the video

        } ) ;


      // Define control methods on the $video object

        // Toggles play/pause state of the video
        $video.togglePlay = function ( ) {
          if ( $play.hasClass( 'playing' ) ) {
            $video.trigger( 'pause' ) ;
          } else {
            $video.trigger( 'play' ) ;
          }
          return false ;
        } ;

        // Initiates video playback
        $video.play = function ( ) {
          player.playVideo( ) ;
          $play.removeClass( 'paused' ) .addClass( 'playing' ) .attr( 'title' , 'Pause' ) ;
        } ;

        // Pauses the video
        $video.pause = function ( ) {
          player.pauseVideo( ) ;
          $play.removeClass( 'playing' ) .addClass( 'paused' ) .attr( 'title' , 'Play' ) ;
        } ;

        // Toggles mute/unmute state of the video
        $video.toggleMute = function ( ) {
          if ( $mute.hasClass( 'muted' ) ) {
            $video.trigger( 'unMute' ) ;
          } else {
            $video.trigger( 'mute' ) ;
          }
          return false ;
        } ;

        // Mutes the video audio
        $video.mute = function ( ) {
          player.mute( ) ;
          $mute.addClass( 'muted' ) .attr( 'title' , 'Un-Mute' ) ;
        } ;

        // Unmutes the video audio
        $video.unMute = function ( ) {
          player.unMute( ) ;
          $mute.removeClass( 'muted' ) .attr( 'title' , 'Mute' ) ;
        } ;

        // Seeks to a specific position in the video
    		$video.seek = function ( seekPosition ) {
          var seekToPosition = Math.round( player.getDuration( ) * seekPosition ) ;
          player.seekTo( seekToPosition , false ) ;
        } ;



      // Player initialization and update methods

        // Updates the video status (progress bar, buffer, play state)
    		$video.update = function ( ) {

    		  if ( player && player.getDuration ) { // Ensure player object is ready

            // Update play/pause button based on player state
            if ( player.getPlayerState( ) === 1 ) {
              $video.play( ) ;
            } else if ( player.getPlayerState( ) === 0 ) {
              $video.pause( ) ;
            }

            // Update loaded (buffered) progress bar
            if ( player.getVideoLoadedFraction( ) > 0 ) {
              var loadedAmount = Math.round( Math.min( player.getVideoLoadedFraction( ) , 1 ) * 100 ) ;
              $loaded.css( 'width' , loadedAmount + '%' ) ;
            }

            // Update current playback position indicator
            if ( player.getCurrentTime( ) > 0 ) {
              var videoPosition = ( player.getCurrentTime( ) / player.getDuration( ) ) * 100 ;
              $indicator.css( 'left' , videoPosition + '%' ) ;
            }

    		  } // End if (player && player.getDuration) check

    		} ;


  			// This function is called by the YouTube player API once it's ready.
  			// Its name *must not be changed* as it's a global callback.
    		onYouTubePlayerReady = function ( videoId ) {

    		  var $videoRef = $( document.getElementById( videoId ) ) .parent( ) ;

    		  // Set an interval to periodically update the video status
    		  setInterval( function ( ) {
    		    $videoRef.trigger( 'update' ) ;
    		  } , 250 ) ;

          $videoRef.trigger( 'cue' ) ; // Cue the video once the player is ready

        } ;



      // Initialisation methods

        // Embeds the YouTube player SWF into the DOM
    		$video.init = function ( ) {

    		  swfobject.embedSWF(
            'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=' + videoId ,
            videoId ,
            o.videoWidth ,
            o.videoHeight ,
            '8' , // Flash player version
            null ,
            null ,
            o.params , // Player parameters
            { id: videoId } , // Attributes for the embed object
            function ( ) {
              player = document.getElementById( videoId ) ; // Assign the player object
            }
          ) ;

          $video.addControls( ) ; // Add custom controls after embedding

    		} ;

        // Adds custom control elements to the player
    		$video.addControls = function ( ) {

    		  // Play/Pause button
    		  $play = $( '<a/>' , {
    		            href: '#' ,
            		    'class': 'play-pause' ,
            		    text: 'Play/Pause' ,
            		    title: 'Play' ,
            		    click: function ( ) {
            		      $video.trigger( 'togglePlay' ) ;
            		      return false ;
            		    }
            		  } ) .appendTo( $controls ) ;

    		  // Mute/Unmute button
    		  $mute = $( '<a/>' , {
    		            href: '#' ,
            		    'class': 'volume' ,
            		    text: 'Volume' ,
            		    title: 'Mute' ,
            		    click: function ( ) {
            		      $video.trigger( 'toggleMute' ) ;
            		      return false ;
            		    }
            		  } ) .appendTo( $controls ) ;

          // Link to view the video directly on YouTube
    		  $link
    		    .addClass( 'view-youtube' )
    		    .attr( 'title' , 'View on YouTube' )
    		    .html( 'Play/View on YouTube' )
    		    .appendTo( $controls ) ;

  		    // Seek bar for scrubbing through the video
          $seek = $( '<div/>' , {
            		    'class': 'status' ,
            		    click: function ( e ) {
                      var skipTo = e.pageX - $seek.offset( ) .left ,
                          statusWidth = $seek.width( ) ;
                      $video.seek( skipTo / statusWidth ) ;
            		    }
            		  } ) .appendTo( $controls ) ;

          // Components of the seek bar
          $bar = $( '<div class="bar"></div>' ) .appendTo( $seek ) ;
          $loaded = $( '<div class="loaded"></div>' ) .appendTo( $bar ) ;
          $indicator = $( '<span class="indicator"></span>' ) .appendTo( $bar ) ;

        } ; // End $video.addControls

        $video.init( ) ; // Initialize the video player for the current element

    } ) ; // End this.each loop

  } ; // End $.fn.ytchromeless

} ) ( jQuery ) ; // Pass jQuery into the anonymous function