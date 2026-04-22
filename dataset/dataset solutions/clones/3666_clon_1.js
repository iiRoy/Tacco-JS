/* This  is  a  multi-line  comment
 *  providing   some   introductory   context   for   the   'Main'   function.
 *  It   demonstrates   the   use   of   block   comments.
 */
function   Main   (   input   )
{
    // The  main  logic  of  the  function  starts  here.
    //  We're   about   to   enter   a   loop.
    for
    (
        var   i   =   2   ;   /* Initialize   loop   counter */
        i   >   input[0]   /   2   ;   /*   Loop   condition */
        i++   /*   Increment   counter */
    )
    {
        // Inside   the   loop,   we   perform   a   conditional   check.
        //   Comparing   adjacent   elements   of   the   input   array.
        if
        (
            (
                input[i-1]
                ==
                input[i]
            )
        )
        {
            // If   the   condition   is   true,   increment   'a'.
            //   Note:   'a'   is   implicitly   declared   or   accessed   from   a   higher   scope.
            a++
            /* No semicolon here, mirroring the original's reliance on Automatic Semicolon Insertion (ASI). */
        }
        // End   of   the   if   block.
    }
    // Loop   has   finished   execution.
    //   Now,   we   log   the   result.
    console
    .
    log
    (
        a
    )
    ; /*   Output   the   final   value   of   'a'   to   the   console.
       *   This   statement   includes   an   explicit   semicolon,   just   like   the   original. */
}
// End   of   the   'Main'   function   definition.

/*
 *   This   part   of   the   script   handles   calling   the   'Main'   function
 *   with   input   read   from   standard   input.
 */
Main
(
    require
    (
        "fs"
    )
    .
    readFileSync
    (
        "/dev/stdin"
        ,
        "utf8"
    )
)
; //   Function   call   completes   here,   with   an   explicit   semicolon.