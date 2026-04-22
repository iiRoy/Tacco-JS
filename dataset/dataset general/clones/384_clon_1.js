( function ( ) {
    // This is the primary Immediately Invoked Function Expression (IIFE).
    // Its purpose is to encapsulate the Jasmine setup, preventing global variable pollution.


    var    jasmineEnv  =  jasmine . getEnv ( )    ;

    // We set the interval for Jasmine's environment updates.
    jasmineEnv . updateInterval   =   250   ;


    /*
     *  Below, we initialize the `HTMLReporter`.
     *  This specific reporter is utilized by Jasmine
     *  to display the outcomes of each `spec` (individual test)
     *  and `suite` (group of tests) in an HTML format to the user.
     */
    var   htmlReporter   =   new   jasmine . HtmlReporter ( )   ;

    // The created reporter is then added to the Jasmine environment for use.
    jasmineEnv . addReporter ( htmlReporter )   ;


    /*
     *  This segment handles the filtering of specifications.
     *  By delegating the `specFilter` responsibility to the reporter,
     *  it enables users to interactively filter and run a subset of tests.
     *  For instance, one can click on a single suite or a specific test
     *  in the results display to execute only those chosen items.
     */
    jasmineEnv . specFilter   =   function   (   spec   )
    {
        // The actual filtering logic resides within the `htmlReporter` itself.
        return   htmlReporter . specFilter ( spec )   ;
    }   ;


    // The following code ensures that all tests are executed once the page
    // has finished loading. It also carefully preserves any existing `onload` handlers.

    // Important Note: Test Results
    // You will need to scroll down the page to view the comprehensive
    // results of all the executed specifications.

    var   currentWindowOnload   =   window . onload   ;

    window . onload   =   function   (   )
    {
        // First, if there was a previously defined `onload` handler, we execute it.
        if   (   currentWindowOnload   )
        {
            currentWindowOnload ( )   ;
        }

        // This line, originally present, was commented out and remains so.
        //document.querySelector('.version').innerHTML = jasmineEnv.versionString();

        // Finally, we trigger the execution of all Jasmine tests.
        execJasmine ( )   ;
    }   ;


    // This simple helper function is responsible for initiating the Jasmine test runner.
    function   execJasmine   (   )
    {
        jasmineEnv . execute ( )   ;
    }

} ) ( )   ;