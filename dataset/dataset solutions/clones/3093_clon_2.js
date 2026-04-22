"use strict";

// Core logic for determining the complementary DNA base.
function    processNucleotide   (   incomingChar    )   {

    let     resultChar  ;   // Variable to hold the derived complementary base.


    switch  (   incomingChar    )   {

        case    "A" :
            resultChar  =   "T" ;
            break   ;

        case    "T" :
            resultChar  =   "A" ;
            break   ;

        case    "G" :
            resultChar  =   "C" ;
            break   ;

        case    "C" :
            resultChar  =   "G" ;
            break   ;

    }

    console .   log (   resultChar  )   ;
}

// Execute the base processing function using data from the standard input stream.
processNucleotide   (   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   )   ;