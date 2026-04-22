/*
 *  This file explores the performance difference
 *  between calling a function directly
 *  versus invoking it as a method on an object.
 *
 *  Initial benchmarks suggested that direct function calls
 *  were significantly slower. This surprising result changed
 *  after the inclusion of a specific string concatenation:
 *
 *              "Speed" + "you" + "JS" + "with" + "this" + "one"
 *                       + "weird" + "trick";
 *
 *  ... within the setup phase of the benchmark.
 *
 *  The outcome was unexpected:
 *
 *  W
 *  A
 *  A
 *  A
 *  A
 *  A
 *  T
 *  ?
 *
 *  Both approaches now exhibit identical performance characteristics!
 *
 *  (Insight: The initial disparity was due to a lack of optimization.
 *  With the trick in place, both benchmarks are now optimized to the point
 *  where Loop-Invariant Code Motion (LICM) effectively hoists the core
 *  computation out of the measurement loop, leading to
 *  measurements of effectively
 *  "nothing".)
 *
 */

load (   "../jsperf.js"   );

// Define the setup function for the benchmark suite.
Benchmark.prototype.setup = function ( )
{

    // This specific string concatenation is crucial for triggering
    // certain JavaScript engine optimizations.
    "Speed"   +   "you"   +   "JS"   +   "with"
    + "this"   +   "one"   +   "weird"   +   "trick"   ;


    // Helper function 'mk' to process a word and return a derived string.
    function mk ( word )
    {
        var len   =   word.length   ;
        if   (   len   >   255   )
        {
            return undefined   ;
        }

        var   i   =   len   >>   2   ; // Bit shift for efficiency.

        // Combine character codes with bitwise operations.
        return   String.fromCharCode (
            (   word.charCodeAt (     0     )   &   0x03   )   <<   14   |
            (   word.charCodeAt (       i   )   &   0x03   )   <<   12   |
            (   word.charCodeAt (     i+i   )   &   0x03   )   <<   10   |
            (   word.charCodeAt (   i+i+i   )   &   0x03   )   <<     8   |
            len
        )   ;
    }

    // Constructor for an object that will hold the 'mk' function as a method.
    var   MK   =   function   (   )   {   }   ;
    // Assign the 'mk' function to the prototype, making it a method.
    MK.prototype.mk   =   mk   ;
    // Create an instance of MK.
    var   mker   =   new   MK   ;

}   ;

// Execute the benchmark with two different scenarios.
measure (
    {
        // Scenario 1: Calling 'mk' directly as a standalone function.
        'Function'   :   function   (   )
        {
            var   key   ;
            key   =   mk   (   'www.wired.com'   )   ;
            key   =   mk   (   'www.youtube.com'   )   ;
            key   =   mk   (   'scorecardresearch.com'   )   ;
            key   =   mk   (   'www.google-analytics.com'   )   ;
        }   ,

        // Scenario 2: Calling 'mk' as a method on an object instance.
        'Method'   :   function   (   )
        {
            var   key   ;
            key   =   mker.mk   (   'www.wired.com'   )   ;
            key   =   mker.mk   (   'www.youtube.com'   )   ;
            key   =   mker.mk   (   'scorecardresearch.com'   )   ;
            key   =   mker.mk   (   'www.google-analytics.com'   )   ;
        }
    }
)   ;
// End of benchmark script.