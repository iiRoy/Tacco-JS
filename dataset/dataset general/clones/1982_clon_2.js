var processFlow = require (  '../lib/orchestrator'  );

// This function introduces a variable delay to simulate asynchronous operations
// and potentially out-of-sequence callback invocations.
function deferCall( resultHandler, failureResult, processedInfo ) {
  var delayTime = Math .  floor ( Math.random() * 100 ); // Calculate a random delay up to 99 ms

  setTimeout ( function (  ) {
    resultHandler ( failureResult, processedInfo ) ;
  } , delayTime ) ;
}

exports['sequential operation sequence'] = {

    'instantaneous resolution': function ( assertion ) {
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'bar' );
      } ) . conclude ( 'foo', function ( finalResult ) {
        assertion . assertStrictlyEqual ( finalResult, 'foobar' );
        assertion . testComplete ( );
      } ) ;
    }

  , 'two steps in succession': function ( assertion ) {
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ ] );
        inputData . push ( 'first' );
        deferCall ( callbackFn, null, inputData );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'first' ] );
        inputData . push ( 'second' );
        deferCall ( callbackFn, null, inputData );
      } ) . conclude ( [ ], function ( finalResult ) {
        assertion . assertDeeplyEqual ( finalResult, [ 'first', 'second' ] );
        assertion . testComplete ( );
      } ) ;
    }

  , 'three operations in sequence': function ( assertion ) {
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ ] );
        inputData . push ( 'first' );
        deferCall ( callbackFn, null, inputData );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'first' ] );
        inputData . push ( 'second' );
        deferCall ( callbackFn, null, inputData );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'first', 'second' ] );
        inputData . push ( 'third' );
        deferCall ( callbackFn, null, inputData );
      } ) . conclude ( [ ], function ( finalResult ) {
        assertion . assertDeeplyEqual ( finalResult, [ 'first', 'second', 'third' ] );
        assertion . testComplete ( );
      } ) ;
    }

  , 'error handling capability': function ( assertion ) {
      var issueMessage = 'SOMETHING_WENT_WRONG';
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ ] );
        inputData . push ( 'first' );
        deferCall ( callbackFn, null, inputData );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        deferCall ( callbackFn, new Error ( issueMessage ) );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        throw new Error ( 'This part should not be reached due to error interception' );
      } ) . handleError ( function ( caughtError ) {
        assertion . assertEqual ( caughtError . message, issueMessage );
        assertion . testComplete ( );
      } ) . conclude ( [ ], function ( finalResult ) {
        throw new Error ( 'Final callback should not execute because of error' );
      } ) ;
    }

};

exports['concurrent operation execution'] = {

    'two steps in parallel': function ( assertion ) {
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'bar' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'baz' );
      } ) . conclude ( 'foo', function ( finalResult ) {
        assertion . assertDeeplyEqual ( finalResult, [ 'foobar', 'foobaz' ] );
        assertion . testComplete ( );
      } ) ;
    }

  , 'three operations executed concurrently': function ( assertion ) {
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'bar' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'baz' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        deferCall ( callbackFn, null, inputData + 'bam' );
        assertion . assertStrictlyEqual ( inputData, 'foo' );
      } ) . conclude ( 'foo', function ( finalResult ) {
        assertion . assertDeeplyEqual ( finalResult, [ 'foobar', 'foobaz', 'foobam' ] );
        assertion . testComplete ( );
      } ) ;
    }

  , 'error handling during parallel execution': function ( assertion ) {
      var issueMessage = 'CONCURRENT_FAILURE';
      processFlow ( function ( inputData, callbackFn ) {
        deferCall ( callbackFn, null, inputData + 'bar' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        deferCall ( callbackFn, new Error ( issueMessage ) );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        deferCall ( callbackFn, null, inputData + 'bam' );
      } ) . handleError ( function ( caughtError ) {
        assertion . assertEqual ( caughtError . message, issueMessage );
        assertion . testComplete ( );
      } ) . conclude ( 'foo', function ( finalResult ) {
        throw new Error ( 'This final callback must not run after an error' );
      } ) ;
    }
};

exports['hybrid sequential and concurrent operation flow'] = {

    'sequential structure with two parallel calls per stage': function ( assertion ) {
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'bar' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'baz' );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'foobar', 'foobaz' ] );
        deferCall ( callbackFn, null, inputData . join ( ' ' ) + 'a' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'foobar', 'foobaz' ] );
        deferCall ( callbackFn, null, inputData . join ( ' ' ) + 'b' );
      } ) . conclude ( 'foo', function ( finalResult ) {
        assertion . assertDeeplyEqual ( finalResult, [ 'foobar foobaza', 'foobar foobazb' ] );
        assertion . testComplete ( );
      } ) ;
    }

  , 'three-stage sequence with varied parallel invocations': function ( assertion ) {
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'a' );
        deferCall ( callbackFn, null, inputData + 'b' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'a' );
        deferCall ( callbackFn, null, inputData + 'c' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'a' );
        deferCall ( callbackFn, null, inputData + 'd' );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'ab', 'ac', 'ad' ] );
        deferCall ( callbackFn, null, inputData . join ( ' ' ) + ' ae' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'ab', 'ac', 'ad' ] );
        deferCall ( callbackFn, null, inputData . join ( ' ' ) + ' af' );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        assertion . assertDeeplyEqual ( inputData, [ 'ab ac ad ae', 'ab ac ad af' ] );
        deferCall ( callbackFn, null, inputData . join ( ' ' ) );
      } ) . conclude ( 'a', function ( finalResult, callbackFn ) {
        assertion . assertStrictlyEqual ( finalResult, 'ab ac ad ae ab ac ad af' );
        assertion . testComplete ( );
      } ) ;
    }

  , 'error interception in mixed execution': function ( assertion ) {
      var issueMessage = 'MIXED_FLOW_ERROR';
      processFlow ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, null, inputData + 'bar' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        assertion . assertStrictlyEqual ( inputData, 'foo' );
        deferCall ( callbackFn, new Error ( issueMessage ) );
      } ) . nextStep ( function ( inputData, callbackFn ) {
        throw new Error ( 'This sequential step should not be reached after an error' );
      } ) . concurrently ( function ( inputData, callbackFn ) {
        throw new Error ( 'This parallel step should not be reached after an error' );
      } ) . handleError ( function ( caughtError ) {
        assertion . assertStrictlyEqual ( caughtError . message, issueMessage );
        assertion . testComplete ( );
      } ) . conclude ( 'foo', function ( finalResult ) {
        throw new Error ( 'The final callback should not execute in case of error' );
      } ) ;
    }
};

exports['concurrent error handling scenario'] = {

  'handling numerous failures': function ( assertion ) {

    var failureTally = 0;
    var pauseDuration = 100;

    processFlow ( function ( inputData, callbackFn ) {
      setTimeout ( function ( ) { callbackFn ( new Error ( ) ); } , pauseDuration ) ;
    } ) . concurrently ( function ( inputData, callbackFn ) {
      setTimeout ( function ( ) { callbackFn ( new Error ( ) ); } , pauseDuration ) ;
    } ) . concurrently ( function ( inputData, callbackFn ) {
      setTimeout ( function ( ) { callbackFn ( new Error ( ) ); } , pauseDuration ) ;
    } ) . handleError ( function ( caughtError ) {
      failureTally ++ ;
      setTimeout ( function ( ) {
        assertion . assertStrictlyEqual ( failureTally, 1 ) ;
        assertion . testComplete ( ) ;
      } , pauseDuration * 5 ) ;
    } ) . conclude ( 'foo', function ( finalResult ) {
      throw new Error ( 'This final stage should not be executed due to prior errors' ) ;
    } ) ;

  }

};