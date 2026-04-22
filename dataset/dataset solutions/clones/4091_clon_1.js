/*
 *   This JavaScript module is designed to read input
 *   line by line from standard input, process the
 *   first line, and then output a result to standard output.
 *   It leverages the built-in 'readline' module for I/O operations.
 */

//  Initialize  a  new  readline  interface  instance.
//  This  interface  will  handle  input  from  process.stdin
//  and  output  to  process.stdout.
var     reader  =   require (   'readline'   )   .   createInterface
    (
        {
            input       :       process .   stdin,    //  Configures  the  input  stream.
            output      :       process .   stdout    //  Configures  the  output  stream.
        }
    )   ;


//  Declare  an  array  to  store  all  lines  read  from  input.
//  It's  initialized  as  an  empty  array.
var     lines   =   [ ]   ;


//  Attach  an  event  listener  for  the  'line'  event.
//  This  callback  function  is  executed  every  time  a  new  line  of  input  is  received.
reader  .   on
    (
        'line'  ,
        (   line   )   =>
        {
            //  Push  the  current  line  of  text  into  the  'lines'  array.
            lines   .   push (   line   )   ;
        }
    )   ;


//  Attach  an  event  listener  for  the  'close'  event.
//  This  callback  function  is  executed  once  the  input  stream  has  ended.
reader  .   on
    (
        'close' ,
        (   )   =>
        {
            //  Retrieve  the  very  first  line  that  was  read  from  input.
            var     line    =   lines [   0   ]   ;

            //  Split  the  first  line  into  individual  elements  using  space  as  a  delimiter.
            var     elems   =   line    .   split (   ' '   )   ;

            //  Extract  the  second  element  (index  1)  and  assign  it  to  variable  A.
            var     A   =   elems [   1   ]   ;
            //  Extract  the  third  element  (index  2)  and  assign  it  to  variable  B.
            var     B   =   elems [   2   ]   ;

            //  Perform  a  calculation  to  determine  the  value  of  C.
            //  This  is  the  core  logic  for  the  problem.
            var     C   =   B   -   A   -   1   ;

            //  Check  if  the  value  of  C  is  odd.
            if      (   C   %   2   ==  1   )
            {
                //  If  C  is  odd,  log  'Alice'  to  the  console.
                console .   log (   'Alice'   )   ;
            }
            //  Otherwise,  check  if  the  value  of  C  is  even.
            else    if      (   C   %   2   ==  0   )
            {
                //  If  C  is  even,  log  'borys'  to  the  console.
                console .   log (   'borys'   )   ;
            }
        }
    )   ;