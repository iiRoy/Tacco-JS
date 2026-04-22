/* This is a Type I clone of the original JavaScript code. */
/* All identifiers, operators, and expressions remain identical. */
/* Only whitespace and comments have been altered significantly. */

/*jshint loopfunc: true */
( function ( window, document, console, WebSocket, JSON ) {
  "use strict" ; // Enforce strict mode for cleaner code.

  // This section checks for modern browser features required by the application.
  var
    dependencies = {
      'queryselectorall' : document.querySelectorAll ,
      'classlist' : ( document.body || document.documentElement ) . classList ,
      'addeventlistener' : window.addEventListener ,
      'forEach' : Array.prototype.forEach ,
      'indexOf' : Array.prototype.indexOf ,
      'map' : Array.prototype.map ,
      'reduce' : Array.prototype.reduce ,
      'json' : JSON && JSON.parse && JSON.stringify
    } ,
    dependenciesMet = true ; /* optimistic initial state */

  // Iterate over each required dependency and check its availability.
  for ( var dependency in dependencies ) {
    if ( typeof dependencies[ dependency ] === 'undefined' ) {
      // If a dependency is missing, add a specific class to the body/documentElement.
      ( document.body || document.documentElement ) . className += [ ' ' , dependency , '-not-supported' ] . join ( '' ) ;
      dependenciesMet = false ; // Update the flag to reflect the missing dependency.
    }
  }

  if ( ! dependenciesMet ) {
    // If any dependency was not met, add a general 'not-supported' class.
    ( document.body || document.documentElement ) . className += ' not-supported' ;
    return ; // Abort script execution if essential features are not present.
  }

  // Utility function to remove the leading '#' from a hash string.
  function cleanHash ( hash ) {
    if ( ! hash ) {
      hash = window.location.hash ; // Use current window hash if none provided.
    }
    return hash . replace ( /^#/ , '' ) ; // Remove the hash symbol.
  }

  // Converts the NodeList returned by querySelectorAll into a true Array.
  function queryElements ( elem , selector ) {
    try {
      return Array.prototype.slice.call ( elem.querySelectorAll ( selector ) , 0 ) ;
    } catch ( e ) {
      return [] ; // Return an empty array on error.
    }
  }

  // Left-pads a string with a specified character until it reaches the desired length.
  function lPad ( str , pad , length ) {
    str = String ( str ) ; // Ensure the input is a string.
    while ( str.length < length ) {
      str = [ pad , str ] . join ( '' ) ; // Prepend the padding character.
    }
    return str ;
  }

  // Eliminates duplicate elements from an array, returning a new array with unique values.
  function dedupe ( arr ) {
    return arr.reduce ( function ( newArray , item ) {
      if ( newArray.indexOf ( item ) < 0 ) {
        newArray.push ( item ) ; // Add item if not already present.
      }
      return newArray ;
    } , [] ) ;
  }

  // Generates an array of integers within a specified range, inclusive.
  function range ( min , max ) {
    var
      ret = [] ; // Initialize the result array.
    while ( min <= max ) {
      ret.push ( min ++ ) ; // Add current min and then increment.
    }
    return ret ;
  }

  // Calculates the sum of all numeric values in an array.
  function sum ( arr ) {
    return arr.reduce ( function ( a , b ) {
      return a + b ; // Accumulate sum.
    } , 0 ) ;
  }

  // Extracts and converts the 'data-step' attribute value to a number.
  function getStepNumber ( elem ) {
    return parseFloat ( elem.getAttribute ( 'data-step' ) ) * 1 ;
  }

  var
    controller = false , // Flag to indicate if this instance is controlling.
    _deck ; // Global reference to the Deck instance.

  // The primary object representing the presentation deck.
  // Properties and methods prefixed with '__' are internal and subject to change.
  function Deck () {
    this.__html = document.getElementsByTagName ( 'html' ) [ 0 ] ;
    this.__body = document.body || document.documentElement ;
    this.__progress = document.createElement ( 'progress' ) ;
    this.__timer = document.createElement ( 'time' ) ;
    this.__selector = document.createElement ( 'select' ) ;
    this.__viewers = document.createElement ( 'div' ) ;
    this.__started = null ; // Timestamp for when the timer started.
    this.__socket = null ; // WebSocket instance.
    this.__socketReady = false ; // WebSocket connection status.
    this.__socketQueue = [] ; // Queue for messages when socket is not ready.
    this.deck = document.getElementById ( 'deck' ) ;
    this.slides = queryElements ( this.deck , 'section' ) ;
    this.id = this.deck.getAttribute ( 'data-id' ) ;
    this.currentSlide = this.slides [ 0 ] ;
    this.currentPosition = 0 ;
    this.touchDuration = Math.max ( this.deck.getAttribute ( 'data-touch-duration' ) ? parseFloat ( this.deck.getAttribute ( 'data-touch-duration' ) ) : 0 , 500 ) ;
    this.touchDistance = Math.max ( this.deck.getAttribute ( 'data-touch-distance' ) ? parseFloat ( this.deck.getAttribute ( 'data-touch-distance' ) ) : 0 , 150 ) ;
    this.fullscreen = false ; // Fullscreen mode indicator.
    this.debug = this.deck.getAttribute ( 'data-debug' ) ? !! JSON.parse ( this.deck.getAttribute ( 'data-debug' ) ) : false ;
    this.inControl = false ; // Indicates if this deck is being controlled remotely.
    this.allowControl = null ; // User's preference for remote control.
  }

  // Internal debug logging function.
  Deck.prototype.__debug = function ( ) {
    if ( this.debug && console.debug ) {
      console.debug.apply ( console , arguments ) ;
    }
  } ;

  // Initialization method for the deck. Sets up UI elements and event listeners.
  Deck.prototype.init = function ( ) {
    // Progress bar setup.
    _deck.__progress.setAttribute ( 'max' , _deck.slides.length ) ;
    _deck.__setProgress ( 1 ) ;
    _deck.__body.appendChild ( _deck.__progress ) ;

    // Presenter timer setup.
    _deck.__timer.setAttribute ( 'id' , 'timer' ) ;
    _deck.__timer.innerHTML = '0:00' ;
    _deck.__body.appendChild ( _deck.__timer ) ;

    // If the timer is configured as a clock, start it.
    if ( _deck.deck.getAttribute ( 'data-counter' ) === 'time' ) {
      _deck.__updateClock ( ) ;
    }

    // Viewers div setup for WebSocket.
    _deck.__viewers.setAttribute ( 'id' , 'viewers' ) ;
    _deck.__body.appendChild ( _deck.__viewers ) ;

    // Loop through each slide for initial configuration.
    _deck.slides.forEach ( function ( slide , index ) {
      // Assign an ID if not already present.
      if ( ! slide.getAttribute ( 'id' ) ) {
        slide.setAttribute ( 'id' , [ 'slide' , index + 1 ] . join ( '-' ) ) ;
      }
      // Count and normalize steps within each slide.
      var
        steps = queryElements ( slide , '[data-step]:not([data-step="0"])' ) , // Exclude data-step="0" elements.
        stepsIntsOrig = dedupe ( steps.map ( getStepNumber ) ) , // Get unique step numbers.
        stepsInts = range ( 1 , stepsIntsOrig.length ) , // Re-index steps to be sequential from 1.
        stepsMax = Math.max.apply ( null , stepsInts ) ; // Determine maximum step number.

      if ( ! ( stepsIntsOrig.length === stepsInts.length && sum ( stepsIntsOrig ) === sum ( stepsInts ) ) ) {
        // Correct step numbering if there are gaps or non-sequential steps.
        steps.forEach ( function ( step ) {
          step.setAttribute ( 'data-step' , stepsInts [ stepsIntsOrig.indexOf ( JSON.parse ( step.getAttribute ( 'data-step' ) ) ) ] ) ;
        } ) ;
      }

      slide.steps = isFinite ( stepsMax ) ? stepsMax : 0 ; // Store total steps.
      slide.setAttribute ( 'data-current-step' , 0 ) ; // Initialize current step.
      slide.setAttribute ( 'data-steps' , slide.steps ) ; // For presenter mode.
      slide.currentStep = 0 ; // Initialize currentStep property.
      slide.setAttribute ( 'data-slide' , index + 1 ) ; // Slide number for presenter mode.
      slide.setAttribute ( 'data-total' , _deck.slides.length ) ; // Total slides count.
    } ) ;

    // Setup the slide selector dropdown.
    _deck.__selector.setAttribute ( 'id' , 'selector' ) ;
    var
      option = document.createElement ( 'option' ) ,
      i = _deck.slides.length ;
    while ( i -- ) {
      var
        opt = option.cloneNode ( ) ;
      opt.setAttribute ( 'value' , i ) ;
      opt.innerHTML = 'Slide ' + lPad ( i + 1 , '0' , String ( _deck.slides.length ) . length ) + ': ' + _deck.slides [ i ] . getAttribute ( 'id' ) ;
      _deck.__selector.insertBefore ( opt , _deck.__selector.firstChild ) ;
    }
    _deck.__body.appendChild ( _deck.__selector ) ;
    _deck.__selector.addEventListener ( 'change' , function ( e ) {
      _deck.changeToSlide ( parseFloat ( _deck.__selector.value ) ) ;
    } , false ) ;

    // Adjust max-height of figure elements based on image dimensions for responsive behavior.
    window.addEventListener ( 'load' , function ( ) {
      queryElements ( _deck.deck , 'figure' ) . forEach ( function ( figure ) {
        figure.maxHeight = 0 ;
        queryElements ( figure , 'img' ) . forEach ( function ( img ) {
          img.displayHeight = img.getAttribute ( 'height' ) ? parseFloat ( img.getAttribute ( 'height' ) ) : img.height ;
          figure.maxHeight = img.displayHeight > figure.maxHeight ? img.displayHeight : figure.maxHeight ;
        } ) ;
        figure.style.maxHeight = figure.maxHeight + 'px' ;
      } ) ;
    } , false ) ;

    _deck.__socketSetup ( ) ; // Initialize WebSocket connection if available.

    // Handle initial slide navigation based on URL hash.
    if ( ! window.location.hash ) {
      window.location.hash = _deck.slides.length ? _deck.slides [ 0 ] . getAttribute ( 'id' ) : '' ;
      _deck.changeToSlide ( _deck.slides [ 0 ] , 0 , 'init' ) ;
    } else {
      var
        matched = false ;
      _deck.slides.forEach ( function ( slide ) {
        if ( slide.getAttribute ( 'id' ) === cleanHash ( ) ) {
          matched = true ;
          _deck.changeToSlide ( slide , 0 , 'init' ) ;
          return ; // Found the matching slide.
        }
      } ) ;
      if ( ! matched ) {
        _deck.home ( ) ; // Go to the first slide if no match.
      }
    }
    _deck.__body.setAttribute ( 'data-current-slide' , cleanHash ( ) ) ;

    // Add 'ready' class to HTML tag once everything is loaded.
    window.addEventListener ( 'load' , function ( ) {
      _deck.__html.classList.add ( 'ready' ) ;
    } ) ;

    // Listen for fullscreen state changes across different browsers.
    document.addEventListener ( 'webkitfullscreenchange' , function ( e ) {
      _deck.fullscreen = !! document.webkitFullscreenElement ;
    } , false ) ;
    document.addEventListener ( 'mozfullscreenchange' , function ( e ) {
      _deck.fullscreen = !! document.mozFullScreenElement ;
    } , false ) ;
    document.addEventListener ( 'msfullscreenchange' , function ( e ) {
      _deck.fullscreen = !! document.msFullscreenElement ;
    } , false ) ;
    document.addEventListener ( 'fullscreenchange' , function ( e ) {
      _deck.fullscreen = !! document.fullscreenElement ;
    } , false ) ;

    // Setup keyboard shortcuts for navigation and actions.
    document.addEventListener ( 'keydown' , function ( e ) {
      switch ( e.keyCode ) {
        case 33 : // Page Up
        case 37 : // Left Arrow
        case 74 : // J key
          _deck.previous ( 'keyboard' ) ;
          break ;
        case 34 : // Page Down
        case 39 : // Right Arrow
        case 75 : // K key
          _deck.next ( 'keyboard' ) ;
          break ;
        case 27 : // Escape key
        case 80 : // P key
          if ( e.ctrlKey || e.keyCode === 80 ) { // Ctrl+P or just P
            _deck.__html.classList.toggle ( 'presenter' ) ;
          }
          break ;
        case 35 : // End key
          _deck.end ( 'keyboard' ) ;
          break ;
        case 36 : // Home key
          _deck.home ( 'keyboard' ) ;
          break ;
        case 70 : // F key
          _deck.goFullscreen ( ) ;
          break ;
        default :
          break ;
      }
    } , false ) ;

    // Implement touch swipe navigation if touch events are supported.
    if ( 'ontouchstart' in _deck.__body ) {
      var
        start = { 'x' : 0 , 'y' : 0 , 'time' : 0 } ;
      _deck.__body.addEventListener ( 'touchstart' , function ( e ) {
        var
          touch = e.changedTouches [ 0 ] ;
        start.x = touch.pageX ;
        start.y = touch.pageY ;
        start.time = new Date ( ) . getTime ( ) ;
        e.preventDefault ( ) ; // Prevent default touch behavior (e.g., scrolling).
      } , false ) ;
      _deck.__body.addEventListener ( 'touchmove' , function ( e ) {
        e.preventDefault ( ) ; // Prevent scrolling during touch move.
      } , false ) ;
      _deck.__body.addEventListener ( 'touchend' , function ( e ) {
        var
          touch = e.changedTouches [ 0 ] ,
          now = new Date ( ) . getTime ( ) ,
          change = {
            'x' : start.x - touch.pageX ,
            'y' : start.y - touch.pageY ,
            'time' : now - start.time
          } ;
        if ( change.time <= _deck.touchDuration ) {
          // Check if it's a quick swipe.
          if ( Math.abs ( change.x ) >= Math.abs ( change.y ) ) {
            // Horizontal swipe detected.
            if ( change.x >= _deck.touchDistance ) {
              // Swipe left action.
              _deck.next ( 'touch' ) ;
              if ( ! _deck.__started ) {
                _deck.__updateTimer ( ) ;
              }
            } else if ( change.x <= ( 0 - _deck.touchDistance ) ) {
              // Swipe right action.
              _deck.previous ( 'touch' ) ;
              if ( ! _deck.__started ) {
                _deck.__updateTimer ( ) ;
              }
            }
          } else {
            // Vertical swipe - currently not implemented for navigation.
            // Further logic could be added here for vertical gestures.
          }
        }
      } , false ) ;
    }

    // Emit a custom event indicating the deck has been initialized.
    _deck.__emitEvent ( 'decssinit' ) ;
  } ;

  // Method to activate fullscreen mode, normalizing across browser prefixes.
  Deck.prototype.goFullscreen = function ( ) {
    if ( this.__html.webkitRequestFullscreen ) {
      this.goFullscreen = function ( ) {
        this.__html.webkitRequestFullscreen ( ) ;
      } ;
    } else if ( this.__html.msRequestFullscreen ) {
      this.goFullscreen = function ( ) {
        this.__html.msRequestFullscreen ( ) ;
      } ;
    } else if ( this.__html.mozRequestFullscreen ) {
      this.goFullscreen = function ( ) {
        this.__html.mozRequestFullscreen ( ) ;
      } ;
    } else if ( this.__html.requestFullscreen ) {
      this.goFullscreen = function ( ) {
        this.deck.requestFullscreen ( ) ;
      } ;
    }
    this.goFullscreen ( ) ; // Call the now re-assigned function.
  } ;

  // Sends messages via WebSocket, queuing them if the connection is not ready.
  Deck.prototype.__socketSend = function ( message ) {
    if ( message ) {
      message.id = this.id ; // Attach deck ID for server-side routing.
      message.type = message.type ? message.type : 'sync' ; // Default message type to 'sync'.
      this.__socketQueue.push ( message ) ; // Add message to queue.
    }
    if ( this.__socketReady ) {
      // If socket is connected, send all queued messages.
      message = this.__socketQueue.shift ( ) ;
      while ( message ) {
        this.__socket.send ( JSON.stringify ( message ) ) ;
        this.__debug ( 'sending message' , JSON.stringify ( message ) ) ;
        message = this.__socketQueue.shift ( ) ;
      }
    } else {
      // If socket is offline, retry sending after a short delay.
      var
        _deck = this ;
      setTimeout ( function ( ) {
        _deck.__socketSend ( ) ;
      } , 100 ) ;
    }
  } ;

  // Sets up the WebSocket connection for remote control and synchronization.
  Deck.prototype.__socketSetup = function ( ) {
    if ( WebSocket && this.deck.getAttribute ( 'data-sync-server' ) ) {
      this.__socketSetup = function ( ) {
        // Establish WebSocket connection.
        _deck.__socket = new WebSocket ( [ ( !! JSON.parse ( _deck.deck.getAttribute ( 'data-sync-insecure' ) ) ? 'ws' : 'wss' ) , '://' , _deck.deck.getAttribute ( 'data-sync-server' ) , '/socket/' ] . join ( '' ) ) ;
        _deck.__socket.onopen = function ( ) {
          _deck.__socketReady = true ;
          _deck.__socketSend ( { 'type' : 'ping' } ) ; // Send initial ping.
          _deck.__body.setAttribute ( 'data-syncing' , true ) ; // Visual indicator of syncing.
        } ;
        _deck.__socket.onerror = function ( error ) {
          try {
            console.error ( 'socket error' , error ) ;
          } catch ( e ) {
            /* Error logging failed. */
          }
          _deck.__body.setAttribute ( 'data-syncing' , false ) ;
        } ;
        _deck.__socket.onmessage = function ( message ) {
          _deck.__debug ( 'received message' , message ) ;
          message = JSON.parse ( message.data ) ;
          if ( message.type === 'sync' ) {
            if ( _deck.allowControl === null ) {
              _deck.allowControl = window.confirm ( 'Allow the presenter to control your screen?' ) ;
            }
            if ( _deck.allowControl ) {
              _deck.changeToSlide ( cleanHash ( message.hash ) , message.step , 'socket' ) ;
            }
          } else if ( message.type === 'pong' ) {
            controller = message.auth ;
            _deck.inControl = !! controller ;
            _deck.__body.setAttribute ( 'data-in-control' , !! controller ) ;
            if ( _deck.allowControl === null ) {
              _deck.allowControl = true ;
            }
          } else if ( message.type === 'viewers' ) {
            _deck.__viewers.innerHTML = message.viewers ;
          }
        } ;
        _deck.__socket.onclose = function ( ) {
          _deck.__socketReady = false ;
          setTimeout ( _deck.__socketSetup , 1000 ) ; // Attempt to reconnect after a delay.
        } ;
      } ;
    } else {
      // Fallback if WebSockets are not supported or server URL is not provided.
      this.__socketSetup = function ( ) {
        this.__socket = {
          'send' : function ( ) { /* No-op */ } ,
          'status' : 'UNSUPPORTED'
        } ;
      } ;
    }
    this.__socketSetup ( ) ; // Call the setup function.
  } ;

  // Updates the presentation timer, showing elapsed time.
  Deck.prototype.__updateTimer = function ( ) {
    var
      now = new Date ( ) ,
      elapsed ;
    if ( ! _deck.__started ) {
      _deck.__started = now ;
    }
    if ( _deck.deck.getAttribute ( 'data-counter' ) === 'time' ) {
      return ; // Do not update if acting as a clock.
    }
    elapsed = now - _deck.__started ;
    _deck.__timer.innerHTML = [ Math.floor ( elapsed / 60000 ) , lPad ( Math.floor ( elapsed / 1000 ) % 60 , '0' , 2 ) ] . join ( ':' ) ;
    setTimeout ( function ( ) {
      _deck.__updateTimer ( ) ;
    } , 1000 ) ; // Schedule next update.
  } ;

  // Updates the timer to display the current wall clock time.
  Deck.prototype.__updateClock = function ( ) {
    function hourTo12 ( hour ) {
      if ( hour >= 12 ) {
        hour = hour - 12 ;
      }
      if ( hour === 0 ) {
        hour = 12 ;
      }
      return hour ;
    }
    var
      now = new Date ( ) ;
    _deck.__timer.innerHTML = [ hourTo12 ( now.getHours ( ) ) , lPad ( now.getMinutes ( ) , '0' , 2 ) ] . join ( ':' ) ;
    setTimeout ( function ( ) {
      _deck.__updateClock ( ) ;
    } , ( 60 - now.getSeconds ( ) ) * 1000 ) ; // Schedule update for the next minute.
  } ;

  // Sets the value of the progress bar and updates the slide selector.
  Deck.prototype.__setProgress = function ( value ) {
    this.__progress.setAttribute ( 'value' , value ) ;
    this.__selector.value = value - 1 ;
  } ;

  // Emits a custom event from the deck element.
  Deck.prototype.__emitEvent = function ( type , detail ) {
    if ( ! detail ) {
      detail = {} ;
    }
    detail.deck = this ;
    var
      event = new CustomEvent ( type , { 'detail' : detail , 'bubbles' : true } ) ;
    this.__debug ( 'emitting ' + type + ' event' , event ) ;
    this.deck.dispatchEvent ( event ) ;
  } ;

  // Listener for 'decsschange' events, used to synchronize with remote controllers.
  // This listener is outside the Deck prototype, acting globally.
  document.addEventListener ( 'decsschange' , function ( e ) {
    // Check if this instance is the controller and the event is valid.
    if ( controller && e.detail && e.detail.deck && e.detail.slide && e.detail.sender && e.detail.sender !== 'socket' ) {
      var
        _deck = e.detail.deck ;
      // Send the slide and step information to the WebSocket server.
      _deck.__socketSend ( { 'hash' : e.detail.slide.getAttribute ( 'id' ) , 'step' : e.detail.step } ) ;
    }
  } , false ) ;

  // Changes the current slide and step in the presentation.
  Deck.prototype.changeToSlide = function ( slide , step , sender ) {
    if ( ! _deck.__started && ( sender === 'keyboard' || sender === 'touch' ) ) {
      _deck.__updateTimer ( ) ; // Start timer if not already running and initiated by user input.
    }
    if ( typeof slide === 'string' ) {
      // Further logic for changing slides would follow here.