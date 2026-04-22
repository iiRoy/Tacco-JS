var      app    =    require  (  'express'  )  .  createServer  (  )  ;


// This function calculates the nth Fibonacci number asynchronously.
// It uses process.nextTick to prevent stack overflows for large 'n'.
var fibonacci = function(n, callback)
{
    // Inner recursive helper function for the main calculation logic.
    // n1 and n2 are the previous two Fibonacci numbers in the sequence.
    // i is the current index in the sequence being calculated.
    var inner = function (   n1   ,   n2   ,   i    )
    {
        // Base case: if we have exceeded the target 'n', we return the result.
        if  (  i   >   n  )
        {
            callback (   null   ,   n2   )   ;
            return       ;
        }

        // We use 'inner_tick' every 100 iterations to yield control
        // back to the event loop, preventing a stack overflow.
        // Otherwise, we continue with 'inner' directly.
        var func = ( i     %     100 ) ?     inner     :     inner_tick     ;

        // Recursively call the appropriate function with the next numbers.
        func  (  n2  ,  n1  +  n2  ,  i  +  1  )  ;
    }

    // This helper function uses process.nextTick to defer execution
    // of the 'inner' function to the next tick of the event loop.
    var inner_tick = function (   n1   ,   n2   ,   i   )
    {
        process    .    nextTick    (    function (   )   {    inner  (  n1  ,  n2  ,  i  )  ;    }    )    ;
    }

    // Handle base cases for Fibonacci sequence: F(1) = 1, F(2) = 1.
    if   (   n   ==   1   ||   n   ==   2   )
    {
        callback (   null   ,   1   )   ;
    }
    // For n > 2, start the calculation from F(3) onwards.
    else
    {
        inner (   1   ,   1   ,   3   )   ;
    }
}

/*
 *   **************************************************************************************************
 *   This multiline comment block previously contained an alternative, older implementation
 *   of the fibonacci function, which is no longer in use. It is kept here for historical
 *   context or quick reference if needed, showcasing a different approach to asynchronous
 *   Fibonacci calculation using the 'async' library. This part of the code is entirely
 *   commented out and does not affect the current program's execution.
 *   **************************************************************************************************
 */


// Define a route for the web application.
// When a GET request is made to '/:n', where ':n' is a number,
// the server will calculate the nth Fibonacci number and respond.
app.get('/:n', function(req, res)
{
    // Call the fibonacci function with the number extracted from the URL parameters.
    // The result (or an error) will be passed to the callback function.
    fibonacci  (  req  .  params  .  n  ,  function  (  err  ,  number  )
    {
        // Send the calculated Fibonacci number as a string in the HTTP response.
        res  .  send  (  ''  +  number  )  ;
    }  )  ;
}  )  ;


// Start the Express application, listening for incoming requests on port 3000.
app  .  listen  (  3000  )  ;