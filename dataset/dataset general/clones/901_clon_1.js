/*
 * This file contains a collection of helpful utilities and extensions
 * for JavaScript projects, designed to streamline common development tasks.
 *
 * Originally authored by Dumitru Glavan.
 * Version: 1.1, released on July 16, 2011.
 *
 * This library depends on jQuery.
 * More information can be found at: http://dumitruglavan.com
 *
 * Usage examples:
 * - Basic logging: $.l(value1, value2, ...);
 * - Get current timestamp: $.time();
 * - Measure execution time: $.lt(); your_code_here; $.lt();
 * - Benchmark code snippet: $.bm('some_js_code', number_of_iterations);
 * - Mock AJAX requests: $.mockAjax({mockUrl: '/my_mock_api'});
 *
 * Licensed under both MIT and GPL licenses.
 * See: http://www.opensource.org/licenses/mit-license.php
 * And: http://www.gnu.org/licenses/gpl.html
 */
( function ( $ ) {

    // This section extends the console object if available.
    // It provides a shorthand for logging messages.
    if  ( typeof ( console )  ===  'object' )
    {
        /*
         *   Defines a convenient alias for console.log().
         *   Allows logging multiple arguments with a single call.
         */
        $.extend ( $ ,
        {
            l : function ( )
            {
                // Iterate through all passed arguments and log each one.
                for ( var  i  =  0 ;  i  <  arguments.length ;  i++ )
                {
                    console.log ( arguments [ i ] ) ;
                }
            }
        } ) ;
    }

    /*
     * Provides a utility function to retrieve the current timestamp.
     * By default, it returns the timestamp in seconds (similar to PHP's time() function).
     *
     * @param {number} [divideBy] - An optional parameter to adjust the unit.
     *                               Set to 1 to get milliseconds instead of seconds.
     */
    $.extend
    (
        $ ,
        {
            time : function ( divideBy )
            {
                return  ~~ ( + ( new Date ( ).getTime ( )  /  ( typeof  divideBy  ===  'undefined'  ?  1000  :  divideBy ) ) ) ;
            }
        }
    ) ;

    // This function facilitates measuring the execution time of code blocks.
    // Call $.lt() before a code segment and then $.lt() again after it
    // to output the elapsed time to the console.
    $.extend
    (
        $ ,
        {
            lt : function ( )
            {
                if
                (
                    this.ltLastTime
                    ==
                    null
                )
                {
                    return  this.ltLastTime  =  new Date ( ).getTime ( ) ;
                }

                var  diff  =  new Date ( ).getTime ( )  -  this.ltLastTime ;

                this.ltLastTime  =  null ;

                $.l ( diff ) ;

                return  diff ;
            } ,

            // Stores the timestamp of the last call to $.lt().
            ltLastTime : null
        }
    ) ;

    /*
     * Benchmarks a given code snippet by executing it multiple times
     * within a loop and logging the total execution time.
     * Results are output to the console via $.lt().
     *
     * @param {string} benchmarkCode - The JavaScript code string to be benchmarked.
     * @param {number} [testTime]    - The number of iterations to run the benchmarked code.
     *                                   Defaults to 9999 if not specified.
     */
    $.extend ( $ ,
    {
        bm : function ( benchmarkCode ,  testTime )
        {
            this.testTime  =  typeof  testTime  ===  'number'  ?  testTime  :  9999 ;

            $.lt ( ) ; // Start timing.

            for
            (
                var  i  =  0 ;
                i  <  this.testTime ;
                i++
            )
            {
                eval ( benchmarkCode ) ;
            }

            $.lt ( ) ; // End timing and log result.
        }
    } ) ;

    /*
     * Configures AJAX request mocking using jQuery's ajaxPrefilter.
     * This allows redirecting AJAX calls to a mock URL for testing or development.
     *
     * @param {object} mockOptions - Configuration options for the mock.
     * @param {string} [mockOptions.mockUrl='/ajax_mocks'] - The base URL for mock responses.
     */
    $.extend
    (
        $ ,
        {
            mockAjax : function ( mockOptions )
            {
                mockOptions  =  $.extend
                (
                    {
                        mockUrl : '/ajax_mocks'
                    } ,
                    mockOptions
                ) ;

                $.ajaxPrefilter
                (
                    function ( options ,  originalOptions ,  jqXHR )
                    {
                        // Check if mocking is explicitly disabled for this request.
                        if  ( ! options.noMock )
                        {
                            options.url  =  mockOptions.mockUrl
                                           +  '?ajax_url='
                                           +  encodeURIComponent ( options.url ) ;
                        }
                    }
                ) ;
            }
        }
    ) ;

} ) ( jQuery ) ;