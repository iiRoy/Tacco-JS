/*
 * This JavaScript file defines a function 'main'
 * that processes an input string to determine a specific condition.
 * It's designed to be run via Node.js, reading from standard input.
 */

const    main    =    (   input   )   =>
{

    //   Parse   the   input   string   into   three   separate   components.
    //   First,   remove   any   leading/trailing   whitespace.
    //   Then,   split   the   string   by   spaces.
    const   [   A   ,   B   ,   C   ]   =
        input
            .   trim   (   )
            .   split   (   ' '   )
    ;


    //   Check   for   a   specific   pattern   in   the   parsed   strings.
    //   Condition   1:   The   last   character   of   string   A   must   match   the   first   character   of   string   B.
    //   Condition   2:   The   last   character   of   string   B   must   match   the   first   character   of   string   C.
    if
    (
            (   A   [   A   .   length   -   1   ]   ===   B   [   0   ]   )   &&
            (   B   [   B   .   length   -   1   ]   ===   C   [   0   ]   )
    )
    {
        //   If   both   conditions   are   true,   output   "YES".
        console
            .   log   (
                'YES'
            )
        ;
    }

    else

    {
        //   Otherwise,   if   any   condition   is   false,   output   "NO".
        console
            .   log   (
                'NO'
            )
        ;
    }

}
;   //   End   of   the   main   function.


//   This   part   of   the   script   handles   reading   input   from   standard   input
//   and   then   invokes   the   'main'   function   with   that   input.
main
(
        require   (   "fs"   )
            .   readFileSync   (
                "/dev/stdin"   ,
                "utf8"
            )
)
;