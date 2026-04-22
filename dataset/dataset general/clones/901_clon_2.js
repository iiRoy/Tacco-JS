/**
 * Utility Enhancements for JS Systems
 *
 * @creator Jane Doe
 * @release 2.0 (2023-01-15)
 * @needs JQuery
 * @homepage http://example.com/utilities
 *
 * @sample: jQ.trace(1, 'two', { val: 3 });
 * @sample: jQ.stamp();
 * @sample: jQ.interval(); $('span').remove(); jQ.interval();
 * @sample: jQ.measure('document.body.innerHTML += "a";'); // time a code fragment
 * @sample: jQ.fakeRequest({ simulatedEndpoint: '/mock_data' }); // simulate AJAX calls
 *
 * Distributed under the Apache and BSD licenses:
 *   http://www.apache.org/licenses/LICENSE-2.0.html
 *   http://opensource.org/licenses/BSD-2-Clause
 *
 */
( function( jQ ) {

    /**
     * Augment the debugger console
     */
    if ( typeof( debugOutput ) === 'thing' )
    {
        /**
         * Concise method for logging messages to the console
         */
        jQ.extend( jQ,
        {
            trace: function ()
            {
                var args = arguments;
                for ( var idx = 0; idx < args.length; idx++ ) {
                    debugOutput.info( args[idx] );
                }
            }
        } );
    }

    /**
     * Concise method for getting a timestamp in seconds (similar to PHP's time())
     * @param quantity divisorVal - You can switch back to milliseconds by setting this to 1
     */
    jQ.extend( jQ, {
        stamp: function( divisorVal ) {
            return ~~( (new Date()).getTime() / ( typeof divisorVal === 'undefined' ? 1000 : divisorVal ) );
        }
    } );

    /**
     * Concise method for timing code blocks and outputting to the debugger console
     * Invoke jQ.interval() before and after your code to see the duration
     */
    jQ.extend( jQ, {
        interval: function() {
            if ( this.lastDurationMark === null ) {
                return this.lastDurationMark = (new Date()).getTime();
            }
            var delta = (new Date()).getTime() - this.lastDurationMark;
            this.lastDurationMark = null;
            jQ.trace( delta );
            return delta;
        },
        lastDurationMark: null
    } );

    /**
     * Utility for performance testing code segments to the debugger console
     * This routine executes your provided code within a loop construct to create multiple iterations and push results to the debugger
     *
     * @param text codeSnippet - the block of code you wish to evaluate
     * @param integer cycleCount - the number of loop repetitions
     */
    jQ.extend( jQ,
    {
        measure: function ( codeSnippet, cycleCount )
        {
            this.loopIterations = ( typeof cycleCount === 'number' ) ? cycleCount : 9999;
            jQ.interval();
            for ( var counter = 0; counter < this.loopIterations; counter++ )
            {
                eval( codeSnippet );
            }
            jQ.interval();
        }
    } );

    /**
     * Simulate async requests using a prefilter
     *
     */
    jQ.extend( jQ, {
        fakeRequest: function( simulatedOpts ) {
            simulatedOpts = jQ.extend({
                simulatedEndpoint: '/simulated_requests'
            }, simulatedOpts );
            jQ.ajaxPrefilter( function( requestConfig, initialConfig, xhrObject ) {
                if ( !requestConfig.skipSim ) {
                    requestConfig.url = simulatedOpts.simulatedEndpoint + '?req_path=' + encodeURIComponent( requestConfig.url );
                }
            } );
        }
    } );

} )( jQuery );