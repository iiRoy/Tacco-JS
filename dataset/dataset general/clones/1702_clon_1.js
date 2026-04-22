var     uubench     =   require('uubench')  , /* This is the uubench module, obtained from the specified GitHub repository. */

    fs  =   require('fs')   , // File System module for reading files

    _   =   require('underscore')._ , /* Underscore.js utility library, aliased as '_' */

    WordPOS =   require('../src/wordpos')   , // Custom WordPOS library path, relative to current file

    wordpos =   new   WordPOS()   ; // Initialize a new WordPOS instance for processing text


suite   =   new   uubench.Suite ( {
    type  :  'fixed'  ,   // The benchmark type is fixed, meaning a predefined number of iterations.
    iterations  :  10  , /* Number of iterations for each test in the suite. */
    sync  :  true  ,   // This setting is crucial for synchronous execution of benchmarks.

    start :   function  ( tests )   {   // Callback executed at the very beginning of the benchmark suite.
        console.log ( 'starting %d tests' ,   tests.length )   ; // Log the total number of tests that will be run.
    } ,

    result  :   function  ( name ,   stats )   {   /* This function processes and displays the results of each individual test after it completes. */

        var   persec    =   1000    /   stats.elapsed ; // Calculate operations per second base from elapsed time.
        var   ops   =   .5  +   stats.iterations    *   persec  ; // Total operations per second, adjusted for iterations.

        console.log ( '  \\033[90m%s : \\033[36m%d \\033[90mops/s\\033[0m' ,   name ,   ops | 0 ,   stats )   ; /* Output formatted benchmark results to the console. */

        pos   &&   console.log ( out ( pos ) )   ; /* If 'pos' (part-of-speech results) is defined, log its processed output. */
    } ,

    done  :   function  ( time )   {   // This callback is executed when all benchmarks in the suite have finished.
        console.log ( 'looked up %d words' ,   nwords )   ; // Display the total number of words that were processed across all tests.
        console.log ( 'done in %d msecs' ,   time )   ; /* Report the total execution time for the entire benchmark suite in milliseconds. */
    } ,

    section :   function  ( name ,   stats )   {   // Callback for new benchmark sections, invoked before a new group of tests.
        console.log ( '\\033[35m%s\\033[0m' ,   name )   ; // Log the section name with specific ANSI color formatting.
    }
}   )   ;


function    out ( res )   {   /* Helper function to format part-of-speech results for display. */
    return  _ ( res ) . keys ( ) . map (   function  ( k )   {   return  k   +   ':'   +   res[k].length   ;   }   )   ;
}


var     text1   =   'laksasdf'  ,   // A simple single-word text string used for initial benchmarks.
/*   The following line is commented out as it's not currently used in the benchmark.
 *   text128 = fs.readFileSync('text-128.txt', 'utf8'), */
    text512 =   fs.readFileSync ( 'text-512.txt' ,   'utf8' )   , // Read a larger text file (512 words) for more extensive benchmarking.

    text    ,   nwords  , // Variables to hold the current text being processed and the number of words.

    pos ; /* Variable to store part-of-speech results obtained from WordPOS. */


function    getPOS  ( next )   {   // Function to get all parts of speech (nouns, verbs, adjectives, adverbs).
    nwords  =   wordpos.getPOS ( text ,   function  ( res )   {   /* Callback for the getPOS operation. */
        pos =   res ; // Store the complete part-of-speech result.
        next ( )   ; // Proceed to the next benchmark in the suite.
    }   )   ;
}


function    getNouns  ( next )   {   // Function to specifically extract only nouns from the text.
    wordpos.getNouns ( text ,   function  ( res )   {   // Callback for the getNouns operation.
        pos =   {   nouns :   res   }   ; // Store only the nouns in the 'pos' object.
        next ( )   ;
    }   )   ;
}


function    getVerbs  ( next )   {   // Function to specifically extract only verbs from the text.
    wordpos.getVerbs ( text ,   function  ( res )   {   // Callback for the getVerbs operation.
        pos =   {   verbs :   res   }   ; // Store only the verbs in the 'pos' object.
        next ( )   ;
    }   )   ;
}


function    getAdjectives ( next )   {   // Function to specifically extract only adjectives from the text.
    wordpos.getAdjectives ( text ,   function  ( res )   {   // Callback for the getAdjectives operation.
        pos =   {   adjectives    :   res   }   ; // Store only the adjectives in the 'pos' object.
        next ( )   ;
    }   )   ;
}


function    getAdverbs  ( next )   {   // Function to specifically extract only adverbs from the text.
    wordpos.getAdverbs ( text ,   function  ( res )   {   // Callback for the getAdverbs operation.
        pos =   {   adverbs   :   res   }   ; // Store only the adverbs in the 'pos' object.
        next ( )   ;
    }   )   ;
}


suite.section ( '--1 word--' ,   function  ( next )   {   /* Define a section for benchmarks using a single word. */
    text    =   text1 ; // Set the current text to the single word string.
    next ( )   ; // Signal that this section setup is complete.
}   )   ;
suite.bench ( 'getPOS' ,   getPOS )   ; // Benchmark the general POS retrieval for one word.
suite.bench ( 'getNouns' ,   getNouns )   ; // Benchmark noun extraction for one word.
suite.bench ( 'getVerbs' ,   getVerbs )   ; // Benchmark verb extraction for one word.
suite.bench ( 'getAdjectives' ,   getAdjectives )   ; /* Benchmark adjective extraction for one word. */
suite.bench ( 'getAdverbs' ,   getAdverbs )   ; // Benchmark adverb extraction for one word.


suite.section ( '--512 words--' ,   function  ( next )   {   /* Define a section for benchmarks using a 512-word text. */
    suite.options.iterations    =   1   ; // Reduce iterations for larger texts to avoid excessively long runs.
    text    =   text512 ; // Set the current text to the 512-word string.
    next ( )   ;
}   )   ;
suite.bench ( 'getPOS' ,   getPOS )   ; /* Benchmark getPOS with the 512-word text. */
suite.bench ( 'getNouns' ,   getNouns )   ; /* Benchmark getNouns with the 512-word text. */
suite.bench ( 'getVerbs' ,   getVerbs )   ; /* Benchmark getVerbs with the 512-word text. */
suite.bench ( 'getAdjectives' ,   getAdjectives )   ; /* Benchmark getAdjectives with the 512-word text. */
suite.bench ( 'getAdverbs' ,   getAdverbs )   ; /* Benchmark getAdverbs with the 512-word text. */


suite.run ( )   ; // Execute all defined benchmarks in the suite.