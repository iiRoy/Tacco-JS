// This routine processes textual information to identify a specific sequence.
function   CheckPattern   (   sourceText   )   {
    // Attempt to locate a predefined character pattern within the provided input.
    var   patternFound   =   sourceText.match(   /.?.?.?AC.?.?.?/   )   ;
    // Based on whether the pattern was identified:
    if   (   patternFound   )   {
        // Output a positive confirmation.
        console.log(   "Affirmative"   )   ;
    }   else   {
        // Output a negative confirmation.
        console.log(   "Negative"   )   ;
    }
}
// Execute the primary function, retrieving its input from standard I/O.
CheckPattern(   require("fs").readFileSync("/dev/stdin",   "utf8").trim()   )   ;