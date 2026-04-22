/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition of a Type I clone:
 * - All identifiers (variable names, function names, etc.), operators,
 *   and expressions remain completely unchanged.
 * - The only permitted modifications are variations in whitespace
 *   (e.g., indentation, spacing, blank lines) and comments
 *   (e.g., adding, removing, or modifying them).
 *
 * This version aims for extensive visual differentiation while
 * strictly adhering to the Type I cloning rules.
 */

function   Main   ( input   )   {
    //   Begin   input   parameter   reception   and   initialization   phase
    input   =   input.split ( "\n" )   ;

    //   Extracting   the   first   line   of   input   and   splitting   it   by   spaces
    inputStr   =   input [ 0 ] .split ( " " )   ;

    //   Parsing   the   first   numerical   value   from   the   input   string
    var   H   =   Number.parseInt ( inputStr [ 0 ] )   ;

    //   Initializing   a   counter   variable   for   the   loop   operations
    var   cnt   =   0   ;

    //   Starting   the   primary   loop:   continues   as   long   as   H   is   greater   than   one
    while   (   H   >   1   )   {
        //   This   conditional   check   is   redundant   given   the   while   loop's   condition,
        //   but   it   is   preserved   as   per   Type   I   cloning   requirements.
        if   (   H   <=   1   )   {
            break   ; //   Exits   the   loop   prematurely   if   H   becomes   1   or   less
        }

        //   Performing   the   core   division   operation:   integer   division   by   two
        H   =   Math.floor ( H   /   2 )   ;

        //   Incrementing   the   counter   after   each   successful   division
        cnt ++   ;

        //   Original   debug   logging   statement,   currently   commented   out
        //   console.log( H, cnt );
    }

    //   Initialization   of   the   answer   variable   before   final   calculation
    var   ans   =   1   ;

    //   Conditional   logic   to   determine   the   final   answer   based   on   the   counter
    if   (   cnt   >   1   )   {
        //   Applying   the   specified   formula   for   'ans'   when   'cnt'   is   greater   than   one
        ans   =   (   cnt   *   cnt   -   1   )   +   Math.pow ( 2 ,   cnt   )   ;
    }

    //   Final   step:   outputting   the   calculated   answer   to   the   console
    console.log ( ans ) ;
}

//   Main   program   execution   entry   point:   reads   input   from   standard   input
//   and   passes   it   to   the   Main   function   for   processing.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;