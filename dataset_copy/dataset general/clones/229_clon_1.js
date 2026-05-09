/*
 * This entire file is wrapped in an Immediately Invoked Function Expression (IIFE)
 * to prevent pollution of the global scope.
 */
( function ( ) {

  // Retrieve essential components from the Evidence framework.
  var ConsoleTestRunner = Evidence.AutoRunner.RUNNERS.console ;
  var ConsoleTestResult = Evidence.UI.Console.TestResult ;
  var AutoRunner        = Evidence.AutoRunner ;
  var printf            = Evidence.UI.printf ;


  /**
   * Implements a simple classical inheritance pattern.
   *
   * @param {function} superclass The constructor function of the parent class.
   * @param {function} [extra] An optional function that returns an object of
   *                           additional methods/properties to be mixed into the prototype.
   * @returns {function} The new child class constructor.
   */
  function inherit( superclass , extra )
  {
    // The constructor for our new class.
    var klass = function()
    {
      this.initialize.apply( this , arguments ) ;
    } ;

    // Temporary constructor used for prototype chain setup.
    var tmp = function ( ) { } ;
    tmp.prototype = superclass.prototype ;

    // Establish the prototype chain.
    klass.prototype = new tmp ( ) ;

    // Restore the constructor property.
    klass.prototype.constructor = klass ;

    // Override the initialize method to call the superclass's constructor.
    klass.prototype.initialize = function ( )
    {
      superclass.apply( this , arguments ) ;
    } ;

    // If extra methods are provided, mix them into the prototype.
    if ( extra )
    {
      var methods = extra.call( klass , superclass.prototype ) ;
      for ( var method in methods )
      {
        klass.prototype[ method ] = methods[ method ] ;
      }
    }

    // Return the newly created class.
    return klass ;
  }


  // Define our custom TestRunner, inheriting from ConsoleTestRunner.
  var TestRunner = inherit( ConsoleTestRunner , function ( _super )
  {
    // Register this custom runner within the AutoRunner's available runners.
    AutoRunner.RUNNERS.guggenheim = this ;

    // Return additional methods for the TestRunner prototype.
    return {
      _makeResult : function ( )
      {
        // Create a new instance of our custom TestResult.
        return new TestResult( this.logger ) ;
      }
    } ;
  } ) ;


  // Define our custom TestResult, inheriting from ConsoleTestResult.
  var TestResult = inherit( ConsoleTestResult , function ( _super )
  {
    return {
      // Override the start method to log a debug message.
      start : function ( t0 )
      {
        Evidence.TestResult.prototype.start.call( this , t0 ) ;
        this.logger.debug( 'Started tests.' ) ;
      } ,

      // Override the stop method to display results and check for global leaks.
      stop : function ( t1 )
      {
        _super.stop.call( this , t1 ) ;
        displayResults( this , ( t1 - this.t0 ) / 1000 ) ;
        checkLeakedGlobals ( ) ;
      } ,

      // Log when a test is paused.
      pauseTest : function ( testcase )
      {
        this.logger.debug( 'Paused testcase ' + testcase + '.' ) ;
      } ,

      // Log when a test is restarted.
      restartTest : function ( testcase )
      {
        this.logger.debug( 'Restarted testcase ' + testcase + '.' ) ;
      } ,

      // Log when a test suite starts.
      startSuite : function ( suite )
      {
        this.logger.debug( 'Started suite ' + suite + '.' ) ;
      }
    } ;
  } ) ;


  /*
   * HACK: Force our custom 'guggenheim' test runner to be the default
   * if no other runner is explicitly specified in the options.
   */
  ( function ( )
  {
    var _super = AutoRunner.prototype.retrieveOptions ;
    AutoRunner.prototype.retrieveOptions = function ( )
    {
      var options = _super.call( this ) ;
      if ( ! options.runner )
      {
        options.runner = 'guggenheim' ; // Set our runner as default.
      }
      return options ;
    } ;
  } ) ( ) ;


  /**
   * Shorthand for document.getElementById.
   * @param {string} id The ID of the element.
   * @returns {HTMLElement|null} The element or null if not found.
   */
  function $ ( id )
  {
    return document.getElementById( id ) ;
  } ;


  /**
   * Displays the test results in a designated HTML container.
   * @param {object} results The test results object.
   * @param {number} seconds The total time taken for the tests in seconds.
   */
  function displayResults ( results , seconds )
  {
    var container = $( 'results' ) ; // Attempt to get the results container.

    if ( container )
    {
      // Check if there were any failures or errors.
      if ( results.failureCount || results.errorCount )
      {
        container.className = 'failed' ; // Style as failed.
        container.innerHTML = printf( "Finished in %d s. &ndash; <em>%d failures, %d errors</em> (%d assertions)" ,
                                     [ seconds , results.failureCount , results.errorCount , results.assertionCount ] ) ;
      }
      else
      {
        container.className = 'passed' ; // Style as passed.
        container.innerHTML = printf( "Finished in %d s. &ndash; <em>%d tests passed</em> (%d assertions)" ,
                                     [ seconds , results.testCount , results.assertionCount ] ) ;
      }

      // Add 'finished' class regardless of pass/fail status.
      container.className += ' finished' ;
    }
  }


  // Initialize arrays for global variable tracking.
  var globals = [ ] ;
  var expected = [ 'guggenheim' , 'Evidence' , 'gallery' ] ;

  // Populate the 'globals' array with all existing global keys.
  for ( var key in window )
  {
    globals.push( key ) ;
  }


  /**
   * Checks for unexpected global variables that might have been leaked
   * during test execution.
   */
  function checkLeakedGlobals ( )
  {
    // Detect Opera browser for specific handling of 'id' property.
    var opera = /^Opera\b/.test( navigator.userAgent ) ;

    // Iterate through current global keys in the window object.
    for ( var key in window )
    {
      // Check if the global is new, not expected, and not an Opera-specific 'id' property.
      if ( globals.indexOf( key ) < 0                               // Is it a newly introduced global?
          && expected.indexOf( key ) < 0                            // Is it not in our list of expected globals?
          && ( ! opera || typeof window[ key ] != 'object'          // If not Opera, or if Opera, not an object with 'id' matching key.
              || window[ key ].id != key )
          && window.console                                         // Check if console is available.
          && console.warn                                           // Check if console.warn is available.
         )
      {
        console.warn( "unexpected global: " + key ) ; // Log a warning for the leaked global.
      }
    }
  }

} ) ( ) ; // End of IIFE.