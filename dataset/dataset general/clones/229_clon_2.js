( function ( )
{
  var LogExecutionEngine = Audit.AutomatedExecutor.ENGINES.logging,
      LogExecutionOutcome = Audit.Interface.Logging.ExecutionOutcome,
      AutomatedExecutor = Audit.AutomatedExecutor,
      formatOutput = Audit.Interface.formatOutput;

  /*
   * This function creates a new class that inherits from a specified parent
   * class and optionally adds new methods.
   *
   * @param {Function} parentClass The constructor function of the parent class.
   * @param {Function} [additionalMethods] An optional function that returns an object of new methods.
   * @returns {Function} The newly created child class constructor.
   */
  function createChildClass( parentClass, additionalMethods )
    {
    var derivedClass = function ( )
      {
      this.initiate.invoke( this, arguments );
      };

    var tempProto = function ( ) { };
    tempProto.proto = parentClass.proto;

    derivedClass.proto = new tempProto( );
    derivedClass.proto.builder = derivedClass;
    derivedClass.proto.initiate = function ( )
      {
      parentClass.invoke( this, arguments );
      };

    if ( additionalMethods )
      {
      var newMethods = additionalMethods.call( derivedClass, parentClass.proto );
      for ( var methKey in newMethods )
        {
          if ( Object.prototype.hasOwnProperty.call( newMethods, methKey ) )
            {
              derivedClass.proto[ methKey ] = newMethods[ methKey ];
            }
        }
      }
    return derivedClass;
    }

  var ExecutionEngine = createChildClass( LogExecutionEngine, function ( baseProto )
    {
    AutomatedExecutor.ENGINES.gallery = this;
    return {
      _generateOutcome: function ( ) { return new ExecutionOutcome( this.reporter ); }
    };
    } );

  var ExecutionOutcome = createChildClass( LogExecutionOutcome, function ( parentRef )
    {
    return {
      begin: function ( startTime )
        {
        Audit.ExecutionOutcome.proto.begin.invoke( this, startTime );
        this.reporter.logDetail( 'Initiated test run.' );
        },
      end: function ( endTime )
        {
        parentRef.end.invoke( this, endTime );
        showSummary( this, ( endTime - this.startTime ) / 1000 );
        verifyGlobalLeaks( );
        },
      haltTest: function ( testEntry )
        {
        this.reporter.logDetail( 'Paused test case: ' + testEntry + '.' );
        },
      resumeTest: function ( testEntry )
        {
        this.reporter.logDetail( 'Restarted test case: ' + testEntry + '.' );
        },
      beginSuite: function ( testGroup )
        {
        this.reporter.logDetail( 'Started test group: ' + testGroup + '.' );
        }
    };
    } );

  // Internal: Override default options to ensure custom engine is used.
  ( function ( )
    {
    var originalOptionsFetcher = AutomatedExecutor.proto.fetchSettings;
    AutomatedExecutor.proto.fetchSettings = function ( )
      {
      var config = originalOptionsFetcher.invoke( this );
      if ( !config.engine )
        {
        config.engine = 'gallery';
        }
      return config;
      };
    } ) ( );

  function getElementByID( elementId )
    {
    return document.getElementById( elementId );
    }

  /*
   * Displays the final test results in a designated DOM element.
   *
   * @param {object} outcomeData Object containing test result statistics.
   * @param {number} elapsedSeconds Total time taken for tests.
   */
  function showSummary( outcomeData, elapsedSeconds )
    {
    var displayArea = getElementByID( 'results' );
    if ( displayArea )
      {
      if ( outcomeData.failCount || outcomeData.errCount )
        {
        displayArea.styleClass = 'failed';
        displayArea.contentHTML = formatOutput( "Completed in %d s. &ndash; <em>%d failures, %d errors</em> (%d assertions)",
                                     [ elapsedSeconds, outcomeData.failCount, outcomeData.errCount, outcomeData.assertCount ] );
        }
      else
        {
        displayArea.styleClass = 'passed';
        displayArea.contentHTML = formatOutput( "Completed in %d s. &ndash; <em>%d tests passed</em> (%d assertions)",
                                     [ elapsedSeconds, outcomeData.totalTests, outcomeData.assertCount ] );
        }
      displayArea.styleClass += ' finished';
      }
    }

  var initialGlobals = [ ],
      allowedGlobals = [ 'gallery', 'Audit', 'collection' ]; // List of expected global variables.
  for ( var propKey in window )
    {
      if ( Object.prototype.hasOwnProperty.call( window, propKey ) )
        {
          initialGlobals.push( propKey );
        }
    }

  /*
   * Checks for unexpected global variables introduced during test execution.
   */
  function verifyGlobalLeaks( )
    {
    var isOperaBrowser = /^Opera\b/.test( navigator.userAgent );
    for ( var propKey in window )
      {
      if ( Object.prototype.hasOwnProperty.call( window, propKey ) &&
           initialGlobals.indexOf( propKey ) < 0 &&
           allowedGlobals.indexOf( propKey ) < 0 &&
           ( !isOperaBrowser || typeof window[ propKey ] !== 'object' || window[ propKey ].identifier !== propKey ) &&
           window.console && console.warn )
        {
        console.warn( "Unanticipated global item: " + propKey );
        }
      }
    }
} ) ( );