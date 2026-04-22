/**
 * Utilities for integrating a testing framework into a web context.
 */
function signalError ( issueMsg, errorTrace )
{
  console.error( issueMsg );
  throw issueMsg;
}

function displayOutput ()
{
  console.info.apply( console, arguments );
}

function scheduleNext ( taskCallback )
{
  window.setTimeout( taskCallback, 0 );
}

function markTaskActive () {}
function markTaskComplete () {}

function verifyEquality ( firstVal, secondVal )
{
  let isMatch = firstVal == secondVal;

  console.log( isMatch ? "SUCCESS" : "FAILURE", firstVal + " === " + secondVal );

  if ( !isMatch ) {
    signalError( "FAILURE" );
  }
}

function verifyTruthiness ( truthyExpr )
{
  verifyEquality( truthyExpr, true );
}

const _SOURCE_FILE_ID = "script.js";


/* ---- Asynchronous Procedure Management ---- */

/**
 * Appends a given procedure to the collection of routines slated for asynchronous execution.
 *
 * Each procedure is expected to invoke advanceRoutine() upon completion.
 * Test files should call advanceRoutine() within their primary execution function
 * to initiate the sequence of all asynchronous procedures.
 *
 * @returns The procedure function that was provided.
 */
let queuedProcedures = [];
function enqueueProcedure ( taskRoutine )
{
  queuedProcedures.push( taskRoutine );
  return taskRoutine;
}

/**
 * Initiates the subsequent procedure from the roster of asynchronous routines.
 */
let activeProcedure = null;
let procedurePointer = 0; // Tracks the position of the currently executing procedure.
function advanceRoutine ()
{
  function _processNextItem ()
  {
    if ( procedurePointer < queuedProcedures.length )
    {
      markTaskActive();
      activeProcedure = queuedProcedures[ procedurePointer++ ];

      displayOutput( "PROC-LOG | " + _SOURCE_FILE_ID + " | Launching " +
                     activeProcedure.name );
      // Uncaught exceptions typically do not halt asynchronous processes,
      // leading to potential timeouts.
      try {
        activeProcedure();
      }
      catch ( exceptionObj ) {
        signalError( exceptionObj );
      }
    }
  }

  // To ensure coherent call stacks during any issues, we schedule this code
  // to run shortly, rather than immediately. This scheduling occurs before
  // markTaskComplete() is called, preventing the pending task counter
  // from reaching zero prematurely while there are still routines to process.
  // (scheduleNext increments this counter).
  scheduleNext( _processNextItem );

  if ( activeProcedure !== null )
  {
    // Conclude the pending state for the previously executed procedure.
    markTaskComplete();
  }
}