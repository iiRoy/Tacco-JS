"use strict" /* This directive enables strict mode, helping to catch common coding errors and "unsafe" actions. */ ;


//  Module  import  and  input  reading  section
const   arg_str   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'UTF-8' )   ;
/*
 *  The  above  line  reads  the  entire  content  of  '/dev/stdin'  (standard  input)
 *  as  a  string  using  UTF-8  encoding.
 *  'fs'  is  the  Node.js  file  system  module.
 */

const   arg     =   arg_str . split ( '\n' )   ; //  Splits  the  input  string  into  an  array  of  lines.


const   S       =   arg [ 0 ]   ; //  The  first  line  of  input  is  assigned  to  variable  S.
const   K       =   parseInt ( arg [ 1 ] )   ; //  The  second  line  is  parsed  as  an  integer  and  assigned  to  K.


//  String  processing  initialization
let     T       =   S . split ( '' )   ; //  Converts  the  string  S  into  an  array  of  characters,  stored  in  T.

let     result  =   0   ; //  Initializes  the  counter  for  modifications.


/*
 *  This  section  checks  if  the  entire  string  T  consists  of  only  one  repeating  character.
 *  For  example,  "AAAAA"  would  be  true,  "AABAA"  would  be  false.
 */
let     T_only_1_type   =   true   ;
let     T_temp          =   ''   ;


for ( let   i = 1 ; i <= T.length ; i++ )
{
        if ( T_temp == T [ i ] )
        {
                //  If  the  current  character  matches  the  'type'  character,  do  nothing.
                //  This  means  the  string  is  still  potentially  of  one  type.
        }
        else  if ( T_temp )
        {
                //  If  T_temp  is  already  set  (meaning  we've  seen  a  character)
                //  and  the  current  character  is  different,  then  it's  not  a  single-type  string.
                T_only_1_type   =   false   ;
                break   ; //  No  need  to  check  further,  exit  the  loop.
        }
        else
        {
                //  If  T_temp  is  empty,  this  is  the  first  character  we're  checking.
                T_temp  =   T [ i ]   ; //  Store  it  as  the  'type'  character.
        }
}


//  Main  logic  for  calculating  changes  within  the  original  string  T.
if ( ! T_only_1_type )
{
    for ( let   i = 1 ; i <= T.length ; i++ )
    {
            let     a   =   T [ i - 1 ]   ; //  Get  the  character  at  the  previous  index.
            let     b   =   T [ i ]   ;     //  Get  the  character  at  the  current  index.

            if ( a == b )
            {
                    T [ i ]   =   'X'   ; //  Modify  the  current  character  to  'X'  to  make  it  different.
                    result++   ; //  Increment  the  count  of  modifications.
            }
    }
}


//  Scale  the  initial  result  by  K,  as  the  string  is  repeated  K  times.
result  *=  K   ;


/*
 *  This  final  conditional  block  handles  edge  cases  related  to  the
 *  first  and  last  characters  of  the  original  string  S,
 *  especially  when  S  is  concatenated  K  times.
 */
if ( T [ 0 ] == T [ T.length - 1 ] && T_only_1_type )
{
    //  Case  1:  The  string  S  is  uniform  (e.g.,  "AAAA")  AND  its  first  and  last  characters  are  the  same.
    //  (This  condition  is  redundant  if  T_only_1_type  is  true,  as  T[0]  will  always  be  T[T.length-1]).
    //  Example:  "AAAA"  repeated  K  times  will  form  "AAAAAAA..."
    const   TK  =   T.length * K   ; //  Calculate  the  total  length  of  the  repeated  string.
    result  +=  TK % 2 == 0 ? TK / 2 : ( TK - 1 ) / 2   ;
    //  Add  the  number  of  changes  needed  for  a  fully  uniform  string  of  length  TK.
    //  e.g.,  for  "AAAAA"  (length  5),  changes  =  (5-1)/2  =  2  (A_A_A).
    //  e.g.,  for  "AAAA"  (length  4),  changes  =  4/2  =  2  (A_A_).
}
else  if ( T [ 0 ] == T [ T.length - 1 ] )
{
    //  Case  2:  The  string  S  is  NOT  uniform,  but  its  first  and  last  characters  are  the  same.
    //  Example:  "ABABA"  repeated  K  times. When "ABABA" + "ABABA", the last 'A' of the first string
    //  and the first 'A' of the second string create an additional pair that needs modification.
    //  This  extra  modification  occurs  (K-1)  times  at  the  concatenation  points.
    result  +=  K - 1   ;
}


console . log ( result )   ; //  Outputs  the  final  calculated  result  to  the  console.