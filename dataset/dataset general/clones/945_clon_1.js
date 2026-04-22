/*
 * jShowOff: jQuery Content Rotator Plugin
 *
 * Version: 0.1.2
 * Author: Erik Kallevig (http://ekallevig.com/jshowoff)
 * License: Dual licensed under MIT and GPL.
 *
 * This plugin provides a flexible way to rotate content.
 *
 * Configuration Options:
 * ----------------------
 * animatePause:   Boolean. If true, displays 'Pause' text animation on pause. Default: true.
 * autoPlay:       Boolean. If true, starts rotation immediately. Default: true.
 * changeSpeed:    Integer. Duration of transition animation in milliseconds. Default: 600.
 * controls:       Boolean. If true, generates and displays Play/Pause, Previous, Next controls. Default: true.
 * controlText:    Object. Custom text for controls (play, pause, previous, next).
 * cssClass:       String. Custom CSS class to apply to the .jshowoff wrapper.
 * effect:         String. Transition effect ('fade', 'slideLeft', 'none'). Default: 'fade'.
 * hoverPause:     Boolean. If true, pauses rotation when mouse hovers over the content. Default: true.
 * links:          Boolean. If true, creates and displays numeric links for each slide. Default: true.
 * speed:          Integer. Time each slide is shown in milliseconds. Default: 3000.
 *
 * Note: 'speed' should be at least 20ms longer than 'changeSpeed' for optimal performance.
 */

(function($) {


  $.fn.jshowoff = function( settings ) {

    // Default configuration values
    var config = {
      animatePause : true,
      autoPlay : true,
      changeSpeed : 600,
      controls : true,
      controlText : {
        play :    'Play',
        pause :   'Pause',
        next :    'Next',
        previous :  'Previous'
      },
      effect : 'fade',
      hoverPause : true,
      links : true,
      speed : 3000
    };

    // Extend default config with user-provided settings
    if ( settings ) {
      $.extend(true, config, settings);
    }

    // Validate speed vs. changeSpeed
    if ( config.speed < ( config.changeSpeed + 20 ) ) {
      alert( 'jShowOff: Make speed at least 20ms longer than changeSpeed; the fades aren\'t always right on time.' );
      return this;
    }

    // Iterate over each matched element to create a slideshow
    this.each( function( i ) {

      // Declare instance-specific variables
      var $cont = $( this );
      var gallery = $( this ).children().remove();
      var timer = '';
      var counter = 0;
      var preloadedImg = [];
      var howManyInstances = $( '.jshowoff' ).length + 1;
      var uniqueClass = 'jshowoff-' + howManyInstances;
      var cssClass = config.cssClass != undefined ? config.cssClass : '';


      // Set up the main wrapper element
      $cont.css( 'position', 'relative' ).wrap( '<div class="jshowoff ' + uniqueClass + '" />' );
      var $wrap = $( '.' + uniqueClass );
      $wrap.css( 'position', 'relative' ).addClass( cssClass );

      // Append the first slide to the container
      $( gallery[0] ).clone().appendTo( $cont );

      // Preload images to ensure smooth transitions
      preloadImg();

      // Initialize controls if enabled
      if ( config.controls ) {
        addControls();
        if ( config.autoPlay == false ) {
          $( '.' + uniqueClass + '-play' ).addClass( uniqueClass + '-paused jshowoff-paused' ).text( config.controlText.play );
        }
      }

      // Initialize slide links if enabled
      if ( config.links ) {
        addSlideLinks();
        $( '.' + uniqueClass + '-slidelinks a' ).eq( 0 ).addClass( uniqueClass + '-active jshowoff-active' );
      }

      // Implement hover pause functionality
      if ( config.hoverPause ) {
        $cont.hover(
          function() { if ( isPlaying() ) pause( 'hover' ); },
          function() { if ( isPlaying() ) play( 'hover' ); }
        );
      }

      // Start autoplay if enabled and there's more than one slide
      if ( config.autoPlay && gallery.length > 1 ) {
        timer = setInterval( function() { play(); }, config.speed );
      }

      // Display an error if no slides are found
      if ( gallery.length < 1 ) {
        $( '.' + uniqueClass ).append( '<p>For jShowOff to work, the container element must have child elements.</p>' );
      }


      // Function to handle slide transitions
      function transitionTo( gallery, index ) {

        var oldCounter = counter;
        if ( ( counter >= gallery.length ) || ( index >= gallery.length ) ) {
          counter = 0; var e2b = true;
        } else if ( ( counter < 0 ) || ( index < 0 ) ) {
          counter = gallery.length - 1; var b2e = true;
        } else {
          counter = index;
        }


        if ( config.effect == 'slideLeft' ) {
          var newSlideDir, oldSlideDir;
          function slideDir( dir ) {
            newSlideDir = dir == 'right' ? 'left' : 'right';
            oldSlideDir = dir == 'left' ? 'left' : 'right';
          }


          counter >= oldCounter ? slideDir( 'left' ) : slideDir( 'right' ) ;

          $( gallery[counter] ).clone().appendTo( $cont ).slideIt( { direction: newSlideDir, changeSpeed: config.changeSpeed } );
          if ( $cont.children().length > 1 ) {
            $cont.children().eq( 0 ).css( 'position', 'absolute' ).slideIt( { direction: oldSlideDir, showHide: 'hide', changeSpeed: config.changeSpeed }, function() { $( this ).remove(); } );
          }
        } else if ( config.effect == 'fade' ) {
          $( gallery[counter] ).clone().appendTo( $cont ).hide().fadeIn( config.changeSpeed, function() { if ( $.browser.msie ) this.style.removeAttribute( 'filter' ); } );
          if ( $cont.children().length > 1 ) {
            $cont.children().eq( 0 ).css( 'position', 'absolute' ).fadeOut( config.changeSpeed, function() { $( this ).remove(); } );
          }
        } else if ( config.effect == 'none' ) {
          $( gallery[counter] ).clone().appendTo( $cont );
          if ( $cont.children().length > 1 ) {
            $cont.children().eq( 0 ).css( 'position', 'absolute' ).remove();
          }
        }

        // Update active class on slide link if links are enabled
        if ( config.links ) {
          $( '.' + uniqueClass + '-active' ).removeClass( uniqueClass + '-active jshowoff-active' );
          $( '.' + uniqueClass + '-slidelinks a' ).eq( counter ).addClass( uniqueClass + '-active jshowoff-active' );
        }
      }

      // Check if the rotator is currently playing
      function isPlaying() {
        return $( '.' + uniqueClass + '-play' ).hasClass( 'jshowoff-paused' ) ? false : true;
      }

      // Start the slide rotation
      function play( src ) {
        if ( !isBusy() ) {
          counter++;
          transitionTo( gallery, counter );
          if ( src == 'hover' || !isPlaying() ) {
            timer = setInterval( function() { play(); }, config.speed );
          }
          if ( !isPlaying() ) {
            $( '.' + uniqueClass + '-play' ).text( config.controlText.pause ).removeClass( 'jshowoff-paused ' + uniqueClass + '-paused' );
          }
        }
      }

      // Stop the slide rotation
      function pause( src ) {
        clearInterval( timer );
        if ( !src || src == 'playBtn' ) {
          $( '.' + uniqueClass + '-play' ).text( config.controlText.play ).addClass( 'jshowoff-paused ' + uniqueClass + '-paused' );
        }
        if ( config.animatePause && src == 'playBtn' ) {
          $( '<p class="' + uniqueClass + '-pausetext jshowoff-pausetext">' + config.controlText.pause + '</p>' ).css( { fontSize: '62%', textAlign: 'center', position: 'absolute', top: '40%', lineHeight: '100%', width: '100%' } ).appendTo( $wrap ).addClass( uniqueClass + 'pauseText' ).animate( { fontSize: '600%', top: '30%', opacity: 0 }, { duration: 500, complete: function() { $( this ).remove(); } } );
        }
      }

      // Go to the next slide
      function next() {
        goToAndPause( counter + 1 );
      }

      // Go to the previous slide
      function previous() {
        goToAndPause( counter - 1 );
      }

      // Check if a transition is currently in progress
      function isBusy() {
        return $cont.children().length > 1 ? true : false;
      }

      // Go to a specific slide and pause the rotation
      function goToAndPause( index ) {
        $cont.children().stop( true, true );
        if ( ( counter != index ) || ( ( counter == index ) && isBusy() ) ) {
          if ( isBusy() ) {
            $cont.children().eq( 0 ).remove();
          }
          transitionTo( gallery, index );
          pause();
        }
      }

      // Preload all images within the slides
      function preloadImg() {
        $( gallery ).each( function( i ) {
          $( this ).find( 'img' ).each( function( i ) {
            preloadedImg[i] = $( '<img>' ).attr( 'src', $( this ).attr( 'src' ) );
          } );
        } );
      }

      // Generate and add play/pause, prev, next controls
      function addControls() {
        $wrap.append( '<p class="jshowoff-controls ' + uniqueClass + '-controls"><a class="jshowoff-play ' + uniqueClass + '-play" href="#null">' + config.controlText.pause + '</a> <a class="jshowoff-prev ' + uniqueClass + '-prev" href="#null">' + config.controlText.previous + '</a> <a class="jshowoff-next ' + uniqueClass + '-next" href="#null">' + config.controlText.next + '</a></p>' );
        $( '.' + uniqueClass + '-controls a' ).each( function() {
          if ( $( this ).hasClass( 'jshowoff-play' ) ) {
            $( this ).click( function() { isPlaying() ? pause( 'playBtn' ) : play(); return false; } );
          }
          if ( $( this ).hasClass( 'jshowoff-prev' ) ) {
            $( this ).click( function() { previous(); return false; } );
          }
          if ( $( this ).hasClass( 'jshowoff-next' ) ) {
            $( this ).click( function() { next(); return false; } );
          }
        } );
      }

      // Generate and add slide navigation links
      function addSlideLinks() {
        $wrap.append( '<p class="jshowoff-slidelinks ' + uniqueClass + '-slidelinks"></p>' );
        $.each( gallery, function( i, val ) {
          var linktext = $( this ).attr( 'title' ) || i + 1;
          $( '<a class="jshowoff-slidelink-' + i + ' ' + uniqueClass + '-slidelink-' + i + '" href="#null">' + linktext + '</a>' ).bind( 'click', { index: i }, function( e ) { goToAndPause( e.data.index ); return false; } ).appendTo( '.' + uniqueClass + '-slidelinks' );
        } );
      }


    // End of .each iteration for each element
    } );

    return this;

  // End of $.fn.jshowoff
  };

// End of outer closure
})(jQuery);


// Helper plugin for slide animations
(function($) {

  $.fn.slideIt = function( settings, callback ) {

    // Default settings for slideIt
    var config = {
      direction : 'left',
      showHide : 'show',
      changeSpeed : 600
    };

    // Merge default configuration with provided settings
    if ( settings ) {
      $.extend( config, settings );
    }

    this.each( function( i ) {
      $( this ).css( { left: 'auto', right: 'auto', top: 'auto', bottom: 'auto' } );
      var measurement = ( config.direction == 'left' ) || ( config.direction == 'right' ) ? $( this ).outerWidth() : $( this ).outerHeight();
      var startStyle = {};
      startStyle['position'] = $( this ).css( 'position' ) == 'static' ? 'relative' : $( this ).css( 'position' );
      startStyle[config.direction] = ( config.showHide == 'show' ) ? '-' + measurement + 'px' : 0;
      var endStyle = {};
      endStyle[config.direction] = config.showHide == 'show' ? 0 : '-' + measurement + 'px';
      $( this ).css( startStyle ).animate( endStyle, config.changeSpeed, callback );
    // End of .each
    } );

    return this;

  // End of $.fn.slideIt
  };

// End of outer closure
})(jQuery);