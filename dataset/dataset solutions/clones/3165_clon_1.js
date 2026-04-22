/*
 *   This  is  the   primary   functionality   entry   point.
 *   It    processes   the   given   input    string.
 */
function     Main  (   input   )
{
    // The input string is first split into an array of lines.
    input   =   input .   split  ( "\n" ) ;

    /*
     *   The   first   line   of   the   input
     *   is   then   further   parsed   to   extract   date   components.
     */
    var   S   =   input   [   0   ] .   split  ( "/" ) ;

    //   A   default   value   for   the   answer   is   set.
    var   ans   =   "Heisei" ;

    //   Conditional   logic   to   determine   the   final   answer.
    if  (   parseInt  (   S   [   0   ]   )   >=   2020   ||   (   parseInt  (   S   [   0   ]   )   >=   2019   &&   parseInt  (   S   [   1   ]   )   >=   5   )   )
    {
        //   If   the   condition   is   met,   the   answer   is   updated.
        ans   =   "TBD" ;
    }


    /*
     *   The   computed   answer   is   output   to   the   console.
     *   Using   '%s'   as   a   placeholder   for   string   formatting.
     */
    console .   log  (   '%s'   ,   ans   ) ;

    //   The   function   returns   the   final   answer   string.
    return   ans ;
}

//   This   function   is   designed   for   debugging   purposes,   often   triggered   by   a   UI   button.
function debug( n )
{
    //   Retrieves   the   value   from   a   specific   HTML   input   element.
    var   input   =   document .   getElementById  (   "input"   +   n   ) .   value ;
    //   Calls   the   main   processing   function   with   the   retrieved   input.
    Main  (   input   ) ;
}

//   This   statement   executes   the   Main   function   by   reading   input   from   standard   input
//   when   running   in   a   Node.js   environment.
Main  (   require  (   "fs"   ) .   readFileSync  (   "/dev/stdin"   ,   "utf8"   )   ) ;