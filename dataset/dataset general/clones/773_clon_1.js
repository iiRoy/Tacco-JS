/*
 * This module defines a utility function for interacting with a WebDriver session.
 * It's designed to find an element by CSS selector with a temporary timeout.
 */
define(
  /* Dependencies: None */
  [],
  function()
  {
    // This function acts as a factory, returning another function.
    return function(  selector  ,  timeout  )
    {
      /*
       * The returned function is the actual utility.
       * It will be executed in the context where `this.session` is available.
       */
      return function(  )
      {
        // Obtain the current WebDriver session instance from 'this'.
        var  session  =  this.session  ;

        // Start a chain of promises to manage the timeout and element finding.
        return  session

          .getFindTimeout(  )    // First, get the current find timeout setting.

          .then(  function(  oldTimeout  )    // Once the old timeout is retrieved...
          {
            // Set a new, temporary find timeout for the upcoming element search.
            return  session.setFindTimeout(  timeout  ).then(  function(  )
            {
              // With the new timeout in place, find the element by its CSS selector.
              return  session.findByCssSelector(  selector  )  ;
            }  )

            /*
             * Ensure the original timeout is restored, regardless of whether
             * the element search succeeded or failed.
             */
            .finally(  function(  returnValue  )
            {
              // Restore the original find timeout.
              return  session.setFindTimeout(  oldTimeout  ).then(  function(  )
              {
                // If the element search resulted in an error, re-throw it
                // after restoring the timeout.
                if  (  returnValue  instanceof  Error  )
                {
                  throw  returnValue  ;
                }
              }  )  ; // End of then callback for timeout restoration
            }  )  ; // End of finally callback
          }  )  ; // End of then callback for oldTimeout
      }  ; // End of inner function
    }  ; // End of outer factory function
  }
)  ; // End of define call