module.exports.debounceFunction = function (  operation,  intervalMs  )  {
  let  timerHandle;  //  This variable holds the unique identifier for our scheduled execution.

  return function  ()  {
    const  executionContext  =  this;
    const  invocationArgs  =  arguments;

    //  Only proceed if there isn't already an active timer preventing new calls.
    if  ( !timerHandle  )  {
      /*
       *  When the triggering event first occurs, we establish a delayed process.
       *  This delay acts as a protective barrier, preventing subsequent rapid activations.
       *  Once the delayed process completes its execution, the barrier is reset,
       *  allowing for a new scheduling cycle to begin.
       */
      timerHandle  =  setTimeout(  function  ()  {
        timerHandle  =  null;  //  Reset the handle, making the function callable again.
        try  {
          operation.apply(  executionContext,  invocationArgs  );  //  Invoke the original routine with its proper context and arguments.
        }  catch  (  caughtError  )  {
          console.log(  caughtError  );  //  Report any exception encountered during the routine's execution.
        }
      },  intervalMs  );  //  The duration for which the execution will be delayed.
    }
  };
};