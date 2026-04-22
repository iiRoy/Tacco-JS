/*
 * This JavaScript code represents a Type I clone.
 * It is derived from an original source, with the primary objective
 * of introducing substantial cosmetic changes through
 * varied whitespace and the addition of comments,
 * without altering the fundamental structure, logic,
 * or any of the core linguistic elements like identifiers,
 * operators, or expressions.
 * The functional behavior and token sequence remain identical.
 */
function   Main   (   input   )   {

    //  Declare  and  initialize  the  main  numerical  variable  'n'.
    //  The  raw  'input'  string  is  first  cleaned  of  any  leading  or  trailing  whitespace,
    //  and  then  explicitly  converted  into  a  numeric  data  type  using  the  Number()  constructor.
    var   n   =   Number (   input.trim()   )   ;

    //  Declare  a  variable  'ret'  and  assign  it  the  initial  value  of  'n'.
    //  It  is  important  to  note  that,  within  the  current  implementation  scope,
    //  'ret'  is  not  subsequently  referenced  or  modified,  making  its  presence
    //  potentially  redundant  or  a  placeholder  for  future  logic  extensions.
    var   ret   =   n   ;


    //  Commence  the  primary  iterative  loop  structure.
    //  The  loop  control  variable  'i'  is  initialized  to  1.
    //  The  loop  continues  to  execute  as  long  as  'i'  is  strictly  less  than  the  current  value  of  'n'.
    //  After  each  complete  iteration,  'i'  is  incremented  by  one.
    for   (   var   i   =   1   ;   i   <   n   ;   i++   )   {

        //  Within  each  iteration  of  the  main  loop,  'sum'  is  re-initialized
        //  with  the  current  value  of  the  loop  counter  'i'.
        var   sum   =   i   ;

        //  Calculate  the  difference  between  'n'  and  'sum'.
        //  The  result  of  this  subtraction  is  then  concatenated  with  an  empty  string (""),
        //  thereby  explicitly  converting  the  numerical  result  into  its  string  representation.
        //  This  string,  'sumStr',  is  then  used  for  digit-by-digit  processing.
        var   sumStr   =   (   n   -   sum   )   +   ""   ;

        //  Initiate  a  nested  loop  to  traverse  and  process  each  character  (digit)
        //  of  the  'sumStr'.  The  loop  variable  'j'  serves  as  the  index,
        //  starting  from  0  and  iterating  up  to  (but  not  including)  the  length  of  'sumStr'.
        for   (   var   j   =   0   ;   j   <   sumStr.length   ;   j++   )   {
            //  For  each  character  in  'sumStr',  it  is  extracted  using  its  index  'j',
            //  converted  back  into  its  numeric  value  using  Number(),
            //  and  then  added  to  the  running  total  stored  in  'sum'.
            sum   +=   Number (   sumStr[j]   )   ;
        }

        //  Conditional  logic  to  determine  the  flow  of  execution
        //  based  on  the  comparison  between  the  current  value  of  'n'
        //  and  the  newly  calculated  'sum'.
        if   (   n   >   sum   )   {
            //  If  'n'  is  strictly  greater  than  'sum',  it  implies  a  smaller  value  has  been  found.
            //  Consequently,  'n'  is  updated  to  take  on  the  value  of  'sum'.
            n   =   sum   ;
        }   else   if   (   n   ==   sum   )   {
            //  If  'n'  is  found  to  be  exactly  equal  to  'sum',  the  condition  is  met.
            //  The  value  of  'sum'  (which  is  equal  to  'n'  at  this  point)  is  printed  to  the  console.
            console.log (   sum   )   ;
            //  Following  the  output,  the  function  executes  a  'return'  statement,
            //  which  immediately  terminates  the  execution  of  the  'Main'  function.
            return   ;
        }

    }   //  End  of  the  primary  'for'  loop.

}   //  End  of  the  'Main'  function  definition.


//  Global  execution  context:
//  The  'Main'  function  is  invoked  here  to  start  the  program's  execution.
//  The  input  for  the  function  is  obtained  by  reading  the  contents  of  the  standard  input  file  ('/dev/stdin').
//  Node.js's  built-in  'fs'  (file  system)  module  is  used  for  synchronous  file  reading.
//  The  file  content  is  expected  and  read  as  a  'utf8'  encoded  string.
Main   (   require("fs").readFileSync("/dev/stdin", "utf8")   )   ;