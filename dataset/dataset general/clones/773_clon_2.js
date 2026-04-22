moduleRegister ( [ ] ,  function ( )
{
    /* This outer function serves as a factory; it accepts configuration parameters */
    return function (    elementQuery    ,    waitPeriod    )
    {
        // The inner function is the actual operation to be performed later.
        return function ( )
        {
            // Access the current context's session object for WebDriver interactions.
            var    interactionHandler    =    this.session    ;

            // Start an asynchronous sequence of actions.
            return interactionHandler
                .retrieveSearchWait ( )  // Fetch the active search timeout value.
                .then ( function (    priorDuration    )
                {
                    // Temporarily adjust the search timeout, then execute the element location.
                    return interactionHandler.configureSearchWait (    waitPeriod    ) . then ( function ( )
                    {
                        // Perform the actual search for the desired element using a CSS query.
                        return interactionHandler.locateByCssQuery (    elementQuery    ) ;
                    } )
                    .always ( function (    outcomeData    )  // This block runs after the promise settles, regardless of outcome.
                    {
                        // Restore the initial search timeout to its previous value.
                        return interactionHandler.configureSearchWait (    priorDuration    ) . then ( function ( )
                        {
                            // Create a local alias for the standard Error constructor to satisfy naming constraints.
                            const    IssueType    =    Error    ;
                            // If the result of the prior operation was an error, re-throw it to continue the error propagation.
                            if (    outcomeData    instanceof    IssueType    )
                            {
                                throw    outcomeData    ;
                            }
                        } ) ;
                    } ) ;
                } ) ;
        } ;
    } ;
} ) ;