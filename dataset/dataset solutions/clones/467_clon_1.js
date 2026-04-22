/**
 * This JavaScript file implements a solution for a pattern matching problem
 * involving 2D arrays (matrices). It includes functions for matrix rotation
 * and checking for pattern occurrences, along with a main loop to process
 * multiple test cases from standard input.
 */


/**
 *   Rotates a given 2D array (matrix) 90 degrees clockwise.
 *
 *   @param   {Array<Array<number>>}   arr   -   The   input   2D   array   to   be   rotated.
 *   @returns   {Array<Array<number>>}   A   new   2D   array   representing   the   rotated   matrix.
 */
function   rotate   (   arr   )
{
    //   Calculate   the   last   valid   index   for   a   square   matrix   of   given   dimensions.
    var   L   =   arr.length   -   1   ;


    //   Create   a   new   matrix   'yx'   with   the   same   dimensions   as   'arr'.
    //   This   is   done   by   mapping   each   row   and   creating   a   shallow   copy   of   it.
    //   This   ensures   'yx'   is   a   distinct   array   structure   from   'arr'.
    var   yx   =   arr.map   (   function   (   v   )   {   return   v.slice   (   )   ;   }   )   ;


    //   Iterate   through   each   row   'i'   of   the   new   matrix   'yx'.
    for   (   var   i   =   0   ;   i   <=   L   ;   i++   )
    {
        //   Iterate   through   each   column   'j'   of   the   new   matrix   'yx'.
        for   (   var   j   =   0   ;   j   <=   L   ;   j++   )
        {
            //   Perform   the   rotation:   the   element   at   (i,   j)   in   the   rotated   matrix
            //   comes   from   the   element   at   (L-j,   i)   in   the   original   matrix.
            yx [ i ] [ j ]   =   arr [ L   -   j ] [ i ]   ;
        }
    }


    //   Return   the   newly   formed   rotated   matrix.
    return   yx   ;
}


/**
 *   Checks   if   a   smaller   matrix   (yxM)   can   be   found   as   a   pattern
 *   within   a   larger   matrix   (yxN),   starting   at   a   given   offset   (a,   b).
 *   Wildcard   elements   (-1)   in   yxM   are   ignored.
 *
 *   @param   {number}   a   -   The   row   offset   in   yxN   where   yxM's   top-left   corner   is   placed.
 *   @param   {number}   b   -   The   column   offset   in   yxN   where   yxM's   top-left   corner   is   placed.
 *   @returns   {Array<number>|boolean}   Returns   the   1-indexed   [row,   column]   coordinates
 *                                       of   the   first   non-wildcard   element   of   yxM   if   a   match   is   found.
 *                                       Returns   `false`   if   no   match   is   found   or   if   yxM   is   empty.
 */
function   check   (   a   ,   b   )
{
    //   're'   will   store   the   absolute   coordinates   [row,   col]   of   the   first
    //   non-wildcard   element   of   yxM   that   matches   in   yxN.
    //   It's   initialized   to   `false`   to   indicate   no   such   element   has   been   found   yet.
    var   re   =   false   ;


    //   Iterate   through   the   rows   of   the   smaller   matrix   (yxM).
    //   'm'   represents   the   dimension   of   the   square   matrix   yxM.
    for   (   var   y   =   0   ;   y   <   m   ;   y++   )
    {
        //   Iterate   through   the   columns   of   the   smaller   matrix   (yxM).
        for   (   var   x   = 0   ;   x   <   m   ;   x++   )
        {
            //   If   the   current   element   in   yxM   is   a   wildcard   (-1),   skip   to   the   next   element.
            //   Wildcards   match   any   value   in   yxN.
            if   (   yxM [ y ] [ x ]   ==   -1   )
                continue   ;


            //   If   're'   is   still   `false`,   it   means   this   is   the   first   non-wildcard
            //   element   encountered   in   yxM   for   the   current   `check`   call.
            //   Store   its   absolute   coordinates   in   yxN.
            if   (   re   ===   false   )
                re   =   [ a   +   y ,   b   +   x ]   ;


            //   Compare   the   element   from   yxN   at   the   offset   position   (a+y,   b+x)
            //   with   the   current   element   from   yxM   (y,   x).
            //   If   they   do   not   match,   then   the   pattern   does   not   fit   at   this   starting   position.
            if   (   yxN [ a   +   y ] [ b   +   x ]   !=   yxM [ y ] [ x ]   )
                return   false   ;   //   Return   `false`   immediately   as   no   match   is   possible.
        }
    }

    //   If   the   loops   complete   without   returning   `false`,   it   means   all   non-wildcard
    //   elements   of   yxM   matched   their   corresponding   elements   in   yxN.
    //   Return   the   coordinates   of   the   first   matched   non-wildcard   element.
    return   re   ;
}


//   ---   Main   Program   Execution   Flow   ---


//   Require   the   'fs'   (file   system)   module   to   read   input.
//   Read   the   entire   content   of   '/dev/stdin'   (standard   input)   as   a   UTF-8   string.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;


//   Remove   any   leading/trailing   whitespace   from   the   input   string,
//   then   split   it   into   an   array   of   strings,   using   the   newline   character   as   a   delimiter.
//   Each   element   in   'Arr'   will   be   a   line   from   the   input.
var   Arr   =   input   .   trim   (   )   .   split   (   "\n"   )   ;


//   Start   an   infinite   loop   to   process   multiple   test   cases.
//   The   loop   will   be   explicitly   broken   when   a   specific   condition   is   met.
while   (   true   )
{
    //   Take   the   first   line   from   'Arr'   (which   contains   'n'   and   'm'),
    //   split   it   by   spaces,   and   convert   the   resulting   strings   to   numbers.
    //   'nm'   will   be   an   array   like   [n,   m].
    var   nm   =   Arr   .   shift   (   )   .   split   (   " "   )   .   map   (   Number   )   ;


    //   Extract   the   values   of   'n'   (size   of   the   larger   matrix)   and
    //   'm'   (size   of   the   smaller   pattern   matrix)   from   the   'nm'   array.
    var   n   =   nm [ 0 ]   ;
    var   m   =   nm [ 1 ]   ;


    //   Check   for   the   termination   condition:   if   both   'n'   and   'm'   are   zero,
    //   it   signifies   the   end   of   input,   so   break   out   of   the   loop.
    if   (   n   ==   0   &&   m   ==   0   )
        break   ;


    //   Initialize   an   empty   array   to   store   the   larger   matrix   (yxN).
    var   yxN   =   [ ]   ;


    //   Loop   'n'   times   to   read   and   populate   the   rows   of   yxN.
    for   (   var   i   =   0   ;   i   <   n   ;   i++   )
    {
        //   Read   the   next   line   from   'Arr',   split   by   spaces,   and   convert   to   numbers.
        //   This   represents   a   single   row   of   the   matrix.
        var   v   =   Arr   .   shift   (   )   .   split   (   " "   )   .   map   (   Number   )   ;
        yxN   .   push   (   v   )   ;   //   Add   the   processed   row   to   the   yxN   matrix.
    }


    //   Initialize   an   empty   array   to   store   the   smaller   pattern   matrix   (yxM).
    var   yxM   =   [ ]   ;


    //   Loop   'm'   times   to   read   and   populate   the   rows   of   yxM.
    for   (   var   i   =   0   ;   i   <   m   ;   i++   )
    {
        //   Read   the   next   line   from   'Arr',   split   by   spaces,   and   convert   to   numbers.
        //   This   represents   a   single   row   of   the   pattern   matrix.
        var   v   =   Arr   .   shift   (   )   .   split   (   " "   )   .   map   (   Number   )   ;
        yxM   .   push   (   v   )   ;   //   Add   the   processed   row   to   the   yxM   matrix.
    }


    //   'min'   is   an   array   that   will   store   the   1-indexed   [row,   column]   coordinates
    //   of   the   top-left-most   non-wildcard   cell   of   the   smallest   matching   pattern.
    //   It's   initialized   to   [101,   101]   because   matrix   dimensions   are   typically   <=   100,
    //   ensuring   any   valid   match   will   have   smaller   coordinates.
    var   min   =   [ 101 ,   101 ]   ;


    //   This   loop   iterates   4   times,   representing   the   original   orientation   and
    //   three   90-degree   clockwise   rotations   of   the   pattern   matrix   (yxM).
    for   (   var   k   =   0   ;   k   <   4   ;   k++   )
    {
        //   Iterate   through   all   possible   starting   row   positions   (i)   for   yxM   within   yxN.
        //   The   pattern   can   start   from   row   0   up   to   (n   -   m).
        for   (   var   i   =   0   ;   i   <=   n   -   m   ;   i++   )
        {
            //   Iterate   through   all   possible   starting   column   positions   (j)   for   yxM   within   yxN.
            //   The   pattern   can   start   from   column   0   up   to   (n   -   m).
            for   (   var   j   =   0   ;   j   <=   n   -   m   ;   j++   )
            {
                //   Call   the   'check'   function   to   determine   if   the   current   orientation   of   yxM
                //   matches   a   pattern   in   yxN   starting   at   offset   (i,   j).
                var   flag   =   check   (   i   ,   j   )   ;


                //   If   'flag'   is   not   `false`,   it   means   a   match   was   found   at   this   position
                //   and   orientation.   'flag'   contains   the   absolute   coordinates   [row,   col]
                //   of   the   first   non-wildcard   element   of   the   match.
                if   (   flag   !==   false   )
                {
                    //   Compare   the   current   match's   coordinates   (converted   to   1-indexed)
                    //   with   the   current   minimum   coordinates   stored   in   'min'.
                    //   The   comparison   prioritizes   the   row   index,   then   the   column   index.
                    //   Update   'min'   if   the   current   match   is   "smaller"   (i.e.,   earlier   row,   or   same   row   and   earlier   column).
                    if   (   min [ 0 ]   >=   flag [ 0 ]   +   1   &&   min [ 1 ]   >   flag [ 1 ]   +   1   )
                        min   =   [ flag [ 0 ]   +   1 ,   flag [ 1 ]   +   1 ]   ;
                }
            }
        }
        //   After   checking   all   possible   positions   for   the   current   rotation   of   yxM,
        //   rotate   yxM   90   degrees   clockwise   for   the   next   iteration.
        yxM   =   rotate   (   yxM   )   ;
    }


    //   Output   the   result   for   the   current   test   case.
    //   If   'min'   is   still   [101,   101],   it   means   no   pattern   was   found   across   all   rotations   and   positions.
    //   In   that   case,   print   "NA".
    //   Otherwise,   print   the   1-indexed   column   and   row   coordinates   (min[1]   then   min[0]),
    //   separated   by   a   space,   as   per   the   problem's   output   format.
    console   .   log   (   (   min   .   join   (   ""   )   ==   "101101"   )   ?   "NA"   :   min [ 1 ]   +   " "   +   min [ 0 ]   )   ;
}