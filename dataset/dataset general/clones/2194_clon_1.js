'use strict' ;


/*
 * This file contains benchmarks for various color manipulation libraries.
 * It compares their performance on common color conversion and modification tasks.
 */
var   Benchmark   =   require ( 'benchmark' ) ;


// Load the Colr library from the local project.
var   Colr      =   require ( './index' ) ;
// Load the 'color' library.
var   color     =   require ( 'color' ) ;
// Load the 'tinycolor2' library.
var   tinycolor =   require ( 'tinycolor2' ) ;
// Load the 'chroma-js' library.
var   chroma    =   require ( 'chroma-js' ) ;


/**
 * A helper function to define and execute a benchmark suite.
 * @param {string} name - The descriptive name of the benchmark suite.
 * @param {object} tests - An object containing named functions to be benchmarked.
 */
var   suite   =   function   (   name,   tests   )
{

    // Log the name of the current benchmark suite.
    console . log (   '\n#' ,   name   ) ;


    // Initialize a new Benchmark.js suite.
    var   suite   =   new   Benchmark . Suite ( ) ;


    // Iterate over the provided tests and add each one to the benchmark suite.
    for   (   var   test   in   tests   )
    {
        suite . add (   test,   tests [ test ]   ) ;
    }


    // Attach an event listener for the 'cycle' event, which fires after each test completes a cycle.
    suite . on (   'cycle' ,   function   (   event   )
    {
        // Log the string representation of the current target (test).
        console . log (   String (   event . target   )   ) ;
    }   ) ;


    // Attach an event listener for the 'complete' event, which fires after all tests in the suite have run.
    suite . on (   'complete' ,   function   (   )
    {
        // Log the name of the fastest performing test in the suite.
        console . log (   'Fastest is '   +   this . filter (   'fastest'   ) . pluck (   'name'   )   ) ;
    }   ) ;


    // Start running the benchmark suite.
    suite . run ( ) ;
} ;


// --- Test data for color values ---
// A hexadecimal color string.
var   hex         =   '#bada55' ;
// An HSV color object.
var   hsv         =   {   h :   180,   s : 50,   v : 50   } ;
// An HSV color array, used by some libraries.
var   hsvArray    =   [   180,   50,   50   ] ;
// An HSL color object.
var   hsl         =   {   h :   180,   s : 50,   l : 50   } ;
// An HSL color array, used by some libraries.
var   hslArray    =   [   180,   50,   50   ] ;


/*
 * Benchmark suite: Conversion from HSV object to RGB object.
 */
suite (   'FromHsv -> ToRgb' ,   {
    colr:   function   (   )
    {
        Colr . fromHsvObject (   hsv   ) . toRgbObject ( ) ;
    },

    color:   function   (   )
    {
        color (   hsv   ) . rgb ( ) ;
    },

    tinycolor:   function   (   )
    {
        tinycolor (   hsv   ) . toRgb ( ) ;
    },

    chroma:   function   (   )
    {
        // Note: Chroma.js does not directly support objects like {h, s, v} for input,
        // so an array representation is used here for comparison.
        chroma (   hsvArray,   'hsv'   ) . rgb ( ) ;
    }
}   ) ;


/*
 * Benchmark suite: From Hexadecimal string, lighten, then convert back to Hexadecimal.
 */
suite (   'FromHex -> Lighten -> ToHex' ,   {
    colr:   function   (   )
    {
        Colr . fromHex (   hex   ) . lighter (   20   ) . toHex ( ) ;
    },

    color:   function   (   )
    {
        color (   hex   ) . lighten (   0.2   ) . hexString ( ) ;
    },

    tinycolor:   function   (   )
    {
        tinycolor (   hex   ) . lighten (   20   ) . toHexString ( ) ;
    },

    chroma:   function   (   )
    {
        chroma (   hex   ) . brighten (   20   ) . hex ( ) ;
    }
}   ) ;


/*
 * Benchmark suite: From Hexadecimal string, lighten, darken, then convert back to Hexadecimal.
 */
suite (   'FromHex -> Lighten -> Darken -> ToHex' ,   {
    colr:   function   (   )
    {
        Colr . fromHex (   hex   ) . lighter (   10   ) . darker (   20   ) . toHex ( ) ;
    },

    color:   function   (   )
    {
        color (   hex   ) . lighten (   0.1   ) . darken (   0.2   ) . hexString ( ) ;
    },

    tinycolor:   function   (   )
    {
        tinycolor (   hex   ) . lighten (   10   ) . darken (   20   ) . toHexString ( ) ;
    },

    chroma:   function   (   )
    {
        chroma (   hex   ) . brighten (   20   ) . darken (   20   ) . hex ( ) ;
    }
}   ) ;


/*
 * Benchmark suite: Conversion from Hexadecimal string to Hexadecimal string (parsing and formatting).
 */
suite (   'FromHex -> ToHex' ,   {
    colr:   function   (   )
    {
        Colr . fromHex (   hex   ) . toHex ( ) ;
    },

    color:   function   (   )
    {
        color (   hex   ) . hexString ( ) ;
    },

    tinycolor:   function   (   )
    {
        tinycolor (   hex   ) . toHexString ( ) ;
    },

    chroma:   function   (   )
    {
        chroma (   hex   ) . hex ( ) ;
    }
}   ) ;


/*
 * Benchmark suite: From HSV object, convert to RGB object, then to Hexadecimal string.
 */
suite (   'FromHsv -> ToRgb -> ToHex' ,   {
    colr:   function   (   )
    {
        var   obj   =   Colr . fromHsvObject (   hsv   ) ;
        obj . toRgbObject ( ) ;
        obj . toHex ( ) ;
    },

    color:   function   (   )
    {
        var   obj   =   color (   hsv   ) ;
        obj . rgb ( ) ;
        obj . hexString ( ) ;
    },

    tinycolor:   function   (   )
    {
        var   obj   =   tinycolor (   hsv   ) ;
        obj . toRgb ( ) ;
        obj . toHexString ( ) ;
    },

    chroma:   function   (   )
    {
        var   obj   =   chroma (   hsvArray,   'hsv'   ) ;
        obj . rgb ( ) ;
        obj . hex ( ) ;
    }
}   ) ;


/*
 * Benchmark suite: From HSV object to HSL object.
 */
suite (   'FromHsv -> ToHsl' ,   {
    colr:   function   (   )
    {
        Colr . fromHsvObject (   hsv   ) . toHslObject ( ) ;
    },

    color:   function   (   )
    {
        color (   hsv   ) . hsl ( ) ;
    },

    tinycolor:   function   (   )
    {
        tinycolor (   hsv   ) . toHsl ( ) ;
    },

    chroma:   function   (   )
    {
        chroma (   hsvArray,   'hsv'   ) . hsl ( ) ;
    }
}   ) ;


/*
 * Benchmark suite: From HSL object to HSV object.
 */
suite (   'FromHsl -> ToHsv' ,   {
    colr:   function   (   )
    {
        Colr . fromHslObject (   hsl   ) . toHsvObject ( ) ;
    },

    color:   function   (   )
    {
        color (   hsl   ) . hsv ( ) ;
    },

    tinycolor:   function   (   )
    {
        tinycolor (   hsl   ) . toHsl ( ) ;
    },

    chroma:   function   (   )
    {
        chroma (   hslArray,   'hsl'   ) . hsv ( ) ;
    }
}   ) ;