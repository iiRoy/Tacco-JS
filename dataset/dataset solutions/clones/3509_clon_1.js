/*
 * This JavaScript file implements a solution to a problem involving
 * frequency analysis of numerical data. It processes input from stdin,
 * categorizes numbers based on their position (even/odd index),
 * and then calculates a specific sum based on these frequencies.
 *
 * This code adheres to Type I cloning principles, meaning its
 * functional logic and character sequence (excluding whitespace and comments)
 * are identical to an original source.
 *
 * Created by: Code Clone Generator
 * Date of Generation: [Current Date, e.g., 2023-10-27]
 */


function   main   (   input   )   {

  //   Initialize   variable   N   by   parsing   the   first   element   of   the   first   input   line.
  //   The   '-0'   is   a   shorthand   to   convert   the   string   to   a   number.
  var   N   =   input   [   0   ]   .   split   (   " "   )   [   0   ]   -   0   ;


  //   Process   the   second   line   of   input:   split   by   space,   then   map   each   string   to   a   number.
  var   list   =   input   [   1   ]   .   split   (   " "   )   .   map   (   v   =>   v   -   0   )   ;


  //   Declare   two   objects   'a'   and   'b'   to   store   frequency   counts.
  //   'a'   will   store   counts   for   numbers   at   even   indices,   'b'   for   odd   indices.
  var   a   =   {   }   ;
  var   b   =   {   }   ;


  //   Iterate   over   the   'list'   to   populate   the   frequency   maps.
  list   .   forEach   (   (   v   ,   i   )   =>   {
    if   (   i   %   2   ==   0   )   {
      //   If   the   index   'i'   is   even,   increment   the   count   for   value   'v'   in   object   'a'.
      //   (a[v] || 0)   ensures   that   if   a[v]   is   undefined,   it   defaults   to   0   before   incrementing.
      a   [   v   ]   =   (   a   [   v   ]   ||   0   )   +   1   ;
    }   else   {
      //   If   the   index   'i'   is   odd,   increment   the   count   for   value   'v'   in   object   'b'.
      b   [   v   ]   =   (   b   [   v   ]   ||   0   )   +   1   ;
    }
  }   )   ;


  //   Extract   keys   (numbers)   from   object   'a',   then   sort   them   by   their   frequencies   in   descending   order.
  //   The   sort   comparator   (aa,bb)=>a[bb]-a[aa]   achieves   descending   sort   based   on   values   in   'a'.
  var   alist   =   Object   .   keys   (   a   )   .   sort   (   (   aa   ,   bb   )   =>   a   [   bb   ]   -   a   [   aa   ]   )   ;

  //   Perform   the   same   operation   for   object   'b'.
  var   blist   =   Object   .   keys   (   b   )   .   sort   (   (   aa   ,   bb   )   =>   b   [   bb   ]   -   b   [   aa   ]   )   ;


  //   Initialize   the   answer   variable   to   0.
  var   ans   =   0   ;

  //   Declare   'abase'   and   'bbase'   variables,   which   will   store   the   index   of   the   element
  //   to   be   excluded   from   the   frequency   sum   for   'alist'   and   'blist'   respectively.
  var   abase   ,   bbase   =   0   ;


  //   Conditional   logic   to   determine   which   elements   to   exclude   from   the   sum.
  //   This   is   based   on   the   most   frequent   elements   in   'a'   and   'b'.
  if   (   alist   [   0   ]   ==   blist   [   0   ]   )   {
    //   If   the   most   frequent   element   in   'a'   is   the   same   as   in   'b'.
    if   (   alist   [   1   ]   >   blist   [   1   ]   )   {
      //   If   the   second   most   frequent   in   'a'   is   more   frequent   than   the   second   most   frequent   in   'b'.
      //   Exclude   the   most   frequent   from   'a'   (index   0)   and   the   second   most   frequent   from   'b'   (index   1).
      abase   =   0   ,   bbase   =   1   ;
    }   else   {
      //   Otherwise   (second   most   frequent   in   'b'   is   greater   or   equal).
      //   Exclude   the   second   most   frequent   from   'a'   (index   1)   and   the   most   frequent   from   'b'   (index   0).
      abase   =   1   ,   bbase   =   0   ;
    }
  }   else   {
    //   If   the   most   frequent   elements   in   'a'   and   'b'   are   different.
    //   Exclude   the   most   frequent   element   from   both   'a'   and   'b'   (index   0).
    abase   =   0   ,   bbase   =   0   ;
  }


  //   Filter   'alist'   to   exclude   the   element   at   'abase'   index,   then   sum   up   the   frequencies   of   the   remaining   elements.
  alist   .   filter   (   (   v   ,   i   )   =>   i   !=   abase   )   .   forEach   (   v   =>   ans   +=   a   [   v   ]   )   ;

  //   Filter   'blist'   to   exclude   the   element   at   'bbase'   index,   then   sum   up   the   frequencies   of   the   remaining   elements.
  blist   .   filter   (   (   v   ,   i   )   =>   i   !=   bbase   )   .   forEach   (   v   =>   ans   +=   b   [   v   ]   )   ;


  //   Print   the   final   calculated   answer   to   the   console.
  console   .   log   (   ans   )   ;
}


//   This   section   handles   reading   input   from   standard   input   (stdin).
//   It   uses   Node.js's   'fs'   module   to   read   the   file   '/dev/stdin',
//   decodes   it   as   UTF-8,   removes   leading/trailing   whitespace   with   trim(),
//   and   then   splits   the   content   into   an   array   of   lines   using   the   newline   character   "\n".
//   Finally,   it   calls   the   'main'   function   with   this   processed   input.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   trim   (   )   .   split   (   "\n"   )   )   ;