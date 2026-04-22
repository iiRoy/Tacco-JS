/* This file is a Type I clone of an original CoffeeScript-generated file.
 * All identifiers, logic, and structure are preserved.
 * Only whitespace and comments have been altered for visual differentiation.
 */
(function()
{
  // Declare core variables for the module scope
  var   isChrome, nonEmpty,
      __slice  =  [ ] . slice ; // Helper for arguments spreading

  // Defines a utility function to check if a value is non-empty
  nonEmpty  =  function (   x   )
  {
    return   x   &&   x . length   >   0   ;
  } ;


  /*
   * Determines if the current browser is Google Chrome.
   * This check is based on the user agent string.
   */
  isChrome  =   navigator . userAgent . toLowerCase ( ) . indexOf ( "chrome" )   >   -1  ;

  // Initialize the Bacon.UI namespace if it doesn't exist
  Bacon.UI  =  { } ;



  // Function to create an EventStream from a text field's value
  Bacon.UI.textFieldValue  =   function (   textfield ,   initValue   )
  {
    var   autofillPoller ,   getValue   ; // Local variables for this function

    // Helper function to get the current value of the text field
    getValue  =   function (   )
    {
      return   textfield . val ( )  ;
    } ;

    // Creates an event stream for handling browser autofill scenarios
    autofillPoller  =   function (   )
    {
      if   (   textfield . attr ( "type" )   ===   "password"   )
      {
        return   Bacon . interval ( 100 )  ; // Poll password fields more aggressively
      }
      else   if   (   isChrome   )
      {
        return   Bacon . interval ( 100 ) . take ( 20 ) . map ( getValue ) . filter ( nonEmpty ) . take ( 1 )  ;
      }
      else
      {
        return   Bacon . never ( )  ; // Default to no polling
      }
    } ;

    // Set initial value if provided
    if   (   initValue   !==   null   )
    {
      textfield . val ( initValue )  ;
    }

    // Combine multiple event streams to track text field value changes
    return   textfield . asEventStream ( "keyup input" )
      . merge ( textfield . asEventStream ( "cut paste" ) . delay ( 1 ) )
      . merge ( autofillPoller ( ) )
      . map ( getValue )
      . toProperty ( getValue ( ) )
      . skipDuplicates ( )  ;
  } ;



  // Provides an EventStream for the value of a select option
  Bacon.UI.optionValue  =   function (   option ,   initVal   )
  {
    var   getValue  ; // Function to retrieve the current value

    // Set the initial value if one is provided
    if   (   initVal   !=   null   )
    {
      option . val ( initVal )  ;
    }

    // Define the value getter
    getValue  =   function (   )
    {
      return   option . val ( )  ;
    } ;

    // Return a property stream based on 'change' events
    return   option . asEventStream ( "change" ) . map ( getValue ) . toProperty ( getValue ( ) )  ;
  } ;



  // Manages the value of a group of checkboxes
  Bacon.UI.checkBoxGroupValue  =   function (   checkboxes ,   initValue   )
  {
    var   selectedValues  ; // Function to get currently selected values

    selectedValues  =   function (   )
    {
      return   checkboxes . filter ( ":checked" ) . map (   function (   i ,   elem   )
      {
        return   $ ( elem ) . val ( )  ;
      }   ) . toArray ( )  ;
    } ;

    // Initialize checkbox states if an initial value array is provided
    if   (   initValue   )
    {
      checkboxes . each (   function (   i ,   elem   )
      {
        return   $ ( elem ) . attr ( "checked" ,   initValue . indexOf ( $ ( elem ) . val ( ) )   >=   0   )  ;
      }   ) ;
    }

    // Return a property stream that updates on click events
    return   checkboxes . asEventStream ( "click" ) . map ( selectedValues ) . toProperty ( selectedValues ( ) )  ;
  } ;



  /*
   * Helper for making AJAX requests.
   * Returns a Bacon.js EventStream from a jQuery AJAX promise.
   */
  Bacon.UI.ajax  =   function (   params ,   abort   )
  {
    return   Bacon . fromPromise ( $ . ajax ( params ) ,   abort )  ;
  } ;


  // Specific AJAX GET request wrapper
  Bacon.UI.ajaxGet  =   function (   url ,   data ,   dataType ,   abort   )
  {
    return   Bacon . UI . ajax ( {
      url   :   url ,
      dataType   :   dataType ,
      data   :   data
    } ,   abort )  ;
  } ;


  // Specific AJAX GET JSON request wrapper
  Bacon.UI.ajaxGetJSON  =   function (   url ,   data ,   abort   )
  {
    return   Bacon . UI . ajax ( {
      url   :   url ,
      dataType   :   "json" ,
      data   :   data
    } ,   abort )  ;
  } ;


  // Specific AJAX POST request wrapper
  Bacon.UI.ajaxPost  =   function (   url ,   data ,   dataType ,   abort   )
  {
    return   Bacon . UI . ajax ( {
      url   :   url ,
      dataType   :   dataType ,
      data   :   data ,
      type   :   "POST"
    } ,   abort )  ;
  } ;


  // Specific AJAX GET script request wrapper
  Bacon.UI.ajaxGetScript  =   function (   url ,   abort   )
  {
    return   Bacon . UI . ajax ( {
      url   :   url ,
      dataType   :   "script"
    } ,   abort )  ;
  } ;



  // Extends Bacon.EventStream prototype to add an 'ajax' method
  Bacon.EventStream . prototype . ajax  =   function (   )
  {
    return   this . flatMapLatest ( Bacon . UI . ajax )  ;
  } ;


  // Manages the value of a group of radio buttons
  Bacon.UI.radioGroupValue  =   function (   radioButtons ,   init   )
  {
    // If an initial value is provided, set the corresponding radio button as checked
    if   (   init   !=   null   )
    {
      radioButtons . each (   function (   i ,   elem   )
      {
        if   (   elem . value   ===   init   )
        {
          return   $ ( elem ) . attr ( "checked" ,   true )  ;
        }
      }   ) ;
    }
    else // Otherwise, determine initial value from currently checked radio button
    {
      init   =   radioButtons . filter ( ":checked" ) . first ( ) . val ( )  ;
    }

    // Return a property stream that updates on 'change' events
    return   radioButtons . asEventStream ( "change" ) . map (   function (   e   )
    {
      return   e . target . value  ;
    }   ) . toProperty ( init )  ;
  } ;


  // Manages the value of a single checkbox
  Bacon.UI.checkBoxValue  =   function (   checkbox ,   initValue   )
  {
    var   isChecked  ; // Helper to check if the checkbox is checked

    // Function to determine the checked state
    isChecked  =   function (   )
    {
      return   !! checkbox . attr ( "checked" )  ;
    } ;

    // Set the initial checked state if provided
    if   (   initValue   !==   null   )
    {
      checkbox . attr ( "checked" ,   initValue )  ;
    }

    // Return a property stream that updates on 'change' events and skips duplicates
    return   checkbox . asEventStream ( "change" ) . map ( isChecked ) . toProperty ( isChecked ( ) ) . skipDuplicates ( )  ;
  } ;


  // Provides an EventStream for the URL hash
  Bacon.UI.hash  =   function (   defaultValue   )
  {
    var   getHash  ; // Helper to retrieve the current hash

    // Function to get the hash, falling back to defaultValue
    getHash  =   function (   )
    {
      if   (   !! document . location . hash   )
      {
        return   document . location . hash  ;
      }
      else
      {
        return   defaultValue  ;
      }
    } ;

    // Ensure defaultValue is an empty string if not provided
    if   (   defaultValue   ===   undefined   )
    {
      defaultValue   =   ""  ;
    }

    // Return a property stream that updates on 'hashchange' events
    return   $ ( window ) . asEventStream ( "hashchange" ) . map ( getHash ) . toProperty ( getHash ( ) ) . skipDuplicates ( )  ;
  } ;



  /*
   * Extends jQuery's prototype with various event stream methods.
   * These methods convert standard jQuery events into Bacon.js EventStreams.
   */
  $ . fn . extend ( {
    keydownE   :   function (   )
    {
      var   args  ; // Arguments for the event stream
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "keydown" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    keyupE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "keyup" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    keypressE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "keypress" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    clickE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "click" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    dblclickE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "dblclick" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    mousedownE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "mousedown" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    mouseupE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "mouseup" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    mouseenterE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "mouseenter" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    mouseleaveE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "mouseleave" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    mousemoveE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "mousemove" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    mouseoutE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "mouseout" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    mouseoverE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "mouseover" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    resizeE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "resize" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    scrollE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "scroll" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    selectE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "select" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    changeE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "change" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    submitE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "submit" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    blurE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "blur" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    focusE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "focus" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    focusinE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "focusin" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    focusoutE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "focusout" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    loadE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "load" ] . concat ( __slice . call ( args ) ) )  ;
    } ,
    unloadE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   this . asEventStream . apply ( this ,   [ "unload" ] . concat ( __slice . call ( args ) ) )  ;
    }
  } ) ;


  /*
   * Further extends jQuery's prototype with methods that convert
   * animated jQuery actions into Bacon.js EventStreams (promises).
   */
  $ . fn . extend ( {
    animateE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . animate . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    showE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . show . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    hideE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . hide . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    toggleE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . toggle . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    fadeInE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . fadeIn . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    fadeOutE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . fadeOut . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    fadeToE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . fadeTo . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    fadeToggleE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . fadeToggle . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    slideDownE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . slideDown . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    slideUpE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . slideUp . apply ( this ,   args ) . promise ( ) )  ;
    } ,
    slideToggleE   :   function (   )
    {
      var   args  ;
      args   =   1   <=   arguments . length   ?   __slice . call ( arguments ,   0 )   :   [ ]  ;
      return   Bacon . fromPromise ( this . slideToggle . apply ( this ,   args ) . promise ( ) )  ;
    }
  } ) ;


} ) . call ( this ) ;