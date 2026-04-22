;
( function ( $, window, document, undefined ) {

  // This is a Type I clone. All identifiers, operators, and logic are identical.
  // Only whitespace and comments have been altered significantly.

  'use strict' ;

  var pluginName = 'newsTicker' ,

      defaults = {
        row_height: 20 , // Height of a single news item row
        max_rows: 3 ,    // Maximum number of rows visible at once
        speed: 400 ,     // Animation speed in milliseconds
        duration: 2500 , // Time between moves in milliseconds
        direction: 'up' ,// Direction of the ticker: 'up' or 'down'
        autostart: 1 ,   // Start the ticker automatically
        pauseOnHover: 1 ,// Pause the ticker when mouse hovers over it

        // Optional control buttons
        nextButton: null ,
        prevButton: null ,
        startButton: null ,
        stopButton: null ,

        // Callback functions for various events
        hasMoved: function() { /* console.log('Item has moved.'); */ } ,
        movingUp: function() { /* console.log('Moving an item up.'); */ } ,
        movingDown: function() { /* console.log('Moving an item down.'); */ } ,
        start: function() { /* console.log('Ticker started.'); */ } ,
        stop: function() { /* console.log('Ticker stopped.'); */ } ,
        pause: function() { /* console.log('Ticker paused.'); */ } ,
        unpause: function() { /* console.log('Ticker unpaused.'); */ }
      } ;


  // The actual plugin constructor
  function Plugin ( element, options ) {

    this.element = element ;
    this.$el = $( element ) ;

    // Merge default options with user-provided options
    this.options = $.extend( {}, defaults, options ) ;

    this._defaults = defaults ;
    this._name = pluginName ;

    this.moveInterval = null ; // Stores the interval ID for auto-moving
    this.state = 0 ;           // 0 = stopped, 1 = started
    this.paused = 0 ;          // 0 = not paused, 1 = paused
    this.moving = 0 ;          // 0 = not moving, 1 = currently animating

    // Initialize only if the element is an unordered list
    if ( this.$el.is( 'ul' ) ) {
      this.init() ;
    }
  }


  Plugin.prototype = {

    init : function () {
      // Set initial height and hide overflow
      this.$el.height( this.options.row_height * this.options.max_rows )
              .css( { overflow : 'hidden' } ) ;

      // Ensure animation speed is not greater than duration
      this.checkSpeed() ;

      // Attach click handlers for navigation buttons if they are provided
      if ( this.options.nextButton && typeof( this.options.nextButton[0] ) !== 'undefined' ) {
        this.options.nextButton.click( function ( e ) {
          this.moveNext() ;
          this.resetInterval() ; // Reset interval after manual move
        }.bind( this ) ) ;
      }

      if ( this.options.prevButton && typeof( this.options.prevButton[0] ) !== 'undefined' ) {
        this.options.prevButton.click( function ( e ) {
          this.movePrev() ;
          this.resetInterval() ; // Reset interval after manual move
        }.bind( this ) ) ;
      }

      // Attach click handlers for stop/start buttons
      if ( this.options.stopButton && typeof( this.options.stopButton[0] ) !== 'undefined' ) {
        this.options.stopButton.click( function ( e ) {
          this.stop() ;
        }.bind( this ) ) ;
      }

      if ( this.options.startButton && typeof( this.options.startButton[0] ) !== 'undefined' ) {
        this.options.startButton.click( function ( e ) {
          this.start() ;
        }.bind( this ) ) ;
      }

      // Implement pause on hover functionality
      if ( this.options.pauseOnHover ) {
        this.$el.hover( function () {
          if ( this.state ) {
            this.pause() ;
          }
        }.bind( this ) , function () {
          if ( this.state ) {
            this.unpause() ;
          }
        }.bind( this ) ) ;
      }

      // Start the ticker automatically if option is set
      if ( this.options.autostart ) {
        this.start() ;
      }
    } ,


    start : function () {
      // Only start if not already running
      if ( !this.state ) {
        this.state = 1 ;
        this.resetInterval() ; // Initialize or reset the auto-move interval
        this.options.start() ; // Execute start callback
      }
    } ,


    stop : function () {
      // Only stop if currently running
      if ( this.state ) {
        clearInterval( this.moveInterval ) ; // Clear the auto-move interval
        this.state = 0 ;                     // Set state to stopped
        this.options.stop() ;                // Execute stop callback
      }
    } ,


    resetInterval : function () {
      // Reset the interval only if the ticker is active
      if ( this.state ) {
        clearInterval( this.moveInterval ) ; // Clear any existing interval
        this.moveInterval = setInterval( function () {
          this.move() ; // Set new interval to call move method
        }.bind( this ) , this.options.duration ) ;
      }
    } ,


    move : function () {
      // Move only if not paused
      if ( !this.paused ) {
        this.moveNext() ;
      }
    } ,


    moveNext : function () {
      // Determine movement direction based on options
      if ( this.options.direction === 'down' ) {
        this.moveDown() ;
      } else if ( this.options.direction === 'up' ) {
        this.moveUp() ;
      }
    } ,


    movePrev : function () {
      // Determine inverse movement direction based on options
      if ( this.options.direction === 'down' ) {
        this.moveUp() ;
      } else if ( this.options.direction === 'up' ) {
        this.moveDown() ;
      }
    } ,


    pause : function () {
      // Set paused state if not already paused
      if ( !this.paused ) {
        this.paused = 1 ;
      }
      this.options.pause() ; // Execute pause callback
    } ,


    unpause : function () {
      // Unset paused state if currently paused
      if ( this.paused ) {
        this.paused = 0 ;
      }
      this.options.unpause() ; // Execute unpause callback
    } ,


    moveDown : function () {
      // Prevent multiple animations from running simultaneously
      if ( !this.moving ) {
        this.moving = 1 ; // Set moving flag
        this.options.movingDown() ; // Execute movingDown callback

        // Detach the last item, prepend it to the list,
        // position it above, then animate it down.
        this.$el.children( 'li:last' ).detach().prependTo( this.$el ).css( 'marginTop', '-' + this.options.row_height + 'px' )
                .animate( { marginTop: '0px' } , this.options.speed , function () {
                  this.moving = 0 ;                 // Reset moving flag
                  this.options.hasMoved() ;         // Execute hasMoved callback
                }.bind( this ) ) ;
      }
    } ,


    moveUp : function () {
      // Prevent multiple animations from running simultaneously
      if ( !this.moving ) {
        this.moving = 1 ; // Set moving flag
        this.options.movingUp() ; // Execute movingUp callback

        var element = this.$el.children( 'li:first' ) ;

        // Animate the first item up, then detach it,
        // reset its position, and append it to the end.
        element.animate( { marginTop: '-' + this.options.row_height + 'px' } , this.options.speed ,
          function () {
            element.detach().css( 'marginTop', '0' ).appendTo( this.$el ) ;
            this.moving = 0 ;                 // Reset moving flag
            this.options.hasMoved() ;         // Execute hasMoved callback
          }.bind( this ) ) ;
      }
    } ,


    updateOption : function ( option , value ) {
      // Update an option if it exists
      if ( typeof( this.options[option] ) !== 'undefined' ) {
        this.options[option] = value ;

        // If duration or speed is updated, re-check speed and reset interval
        if ( option == 'duration' || option == 'speed' ) {
          this.checkSpeed() ;
          this.resetInterval() ;
        }
      }
    } ,


    getState : function () {
      // Return the current state of the ticker
      if ( this.paused ) {
        return 2 ; // 2 = paused
      } else {
        return this.state ; // 0 = stopped, 1 = started
      }
    } ,


    checkSpeed : function () {
      // Adjust animation speed if it's too close to or exceeds duration
      if ( this.options.duration < ( this.options.speed + 25 ) ) {
        this.options.speed = this.options.duration - 25 ;
      }
    } ,


    destroy : function () {
      // Placeholder for cleanup if needed by jQuery
      // this._destroy() ; // or this.delete; depends on jQuery version
    }
  } ;


  // jQuery plugin wrapper
  $.fn[ pluginName ] = function ( option ) {

    var args = arguments ;

    return this.each( function () {
      var $this = $( this ) ,
          data = $.data( this , 'plugin_' + pluginName ) ,
          options = typeof option === 'object' && option ;

      // Create a new instance if one doesn't exist
      if ( !data ) {
        $this.data( 'plugin_' + pluginName , ( data = new Plugin( this , options ) ) ) ;
      }

      // If the first argument is a string, call the corresponding method
      if ( typeof option === 'string' ) {
        data[ option ].apply( data , Array.prototype.slice.call( args , 1 ) ) ;
      }
    } ) ;
  } ;

} )( jQuery, window, document ) ;