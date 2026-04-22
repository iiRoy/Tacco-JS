/*
 *  This   file   contains   the   implementation   of   a   JavaScript   program
 *  designed   to   process   textual   input   and   perform   a   specific   calculation.
 *  It   demonstrates   data   parsing,   array   manipulation,   and   iterative   summation.
 */

function   Main   (   input   )
{
        //  The   primary   function   'Main'   receives   the   raw   input   string   as   its   argument.

    var   lines   =   input.split   (   "\n"   )   ;   //   Split   the   entire   input   into   an   array   of   lines.
                                                    //   Each   element   in   'lines'   now   represents   a   single   line   from   the   input.


    /*
     *   Process   the   'lines'   array   to   extract   a   subset   of   "titles".
     *   1.   Each   line   'l'   is   mapped   to   its   first   space-separated   component   (l.split(' ')[0]).
     *   2.   From   this   new   array   of   first   components,   we   'splice'   a   section.
     *      -   The   splice   starts   from   index   1   (skipping   the   very   first   title).
     *      -   It   extracts   a   number   of   elements   equal   to   (lines.length   -   3),
     *          effectively   excluding   the   first   and   the   last   two   elements   of   the   original   lines   array's   mapped   output.
     */
    var   titles   =   lines.map   (   l   =>   l.split   (   ' '   )   [   0   ]   )   .splice   (   1,   lines.length   -   3   )   ;


        //   Locate   a   specific   reference   point   within   our   'titles'   array.
        //   The   value   we   are   searching   for   is   the   second-to-last   line   from   the   original   input   array.
    var   sleptAt   =   titles.indexOf   (   lines   [   lines.length   -   2   ]   )   ;


    var   sum   =   0   ;   //   Initialize   our   accumulator   variable   'sum'   to   zero.
                            //   This   variable   will   hold   the   total   computed   value.


    //   Begin   an   iterative   process   (a   for-loop)   to   calculate   the   sum.
    //   The   loop's   starting   index   'i'   is   derived   from   'sleptAt'   plus   an   offset   of   2.
    //   The   loop   continues   as   long   as   'i'   is   less   than   (lines.length   -   2),
    //   meaning   it   stops   before   the   last   two   elements   of   the   'lines'   array.
    for   (   var   i   =   sleptAt   +   2   ;   i   <   lines.length   -2   ;   i   ++   )
    {
            //   Inside   the   loop,   for   each   relevant   line   (lines[i]):
            //   1.   Split   the   line   by   a   space   character.
            //   2.   Access   the   second   element   of   the   resulting   array   (index   1).
            //   3.   Convert   this   string   element   into   a   numeric   type   using   'Number()'.
            //   4.   Add   this   numeric   value   to   the   running   total   stored   in   'sum'.
        sum   +=   Number   (   lines   [   i   ]   .split   (   ' '   )   [   1   ]   )   ;
    }


    console.log   (   sum   )   ;   //   Output   the   final   calculated   'sum'   to   the   standard   output   (console).

}   //   End   of   the   'Main'   function   definition.


//   ----------------------------------------------------------------------------------------------------------------------
//   Program   Entry   Point:   This   section   is   responsible   for   initiating   the   application.
//   It   reads   data   from   the   standard   input   and   passes   it   to   the   'Main'   function   for   processing.
//   ----------------------------------------------------------------------------------------------------------------------
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin",   "utf8"   )   )   ;

//   ---   End   of   Program   Execution   ---