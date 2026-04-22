/*
 * This JavaScript file demonstrates a basic string reversal utility.
 * It reads input from standard input, reverses it, and then prints
 * the reversed string to standard output.
 */

//  This  function  is  designed  to  take  a  string  as  input
//  and  return  a  new  string  that  is  the  reverse  of  the  original.
function   reve  (  s  )
{
    //  The  string  reversal  is  achieved  in  three  steps:
    //  1.  `s.split('')`:    Splits  the  input  string  `s`  into  an  array  of  individual  characters.
    //  2.  `.reverse()`:     Reverses  the  order  of  the  elements  (characters)  in  the  array.
    //  3.  `.join('')`:      Joins  all  the  characters  in  the  reversed  array  back  into  a  single  string.
    return     s  .  split  (  ''  )  .  reverse  (  )  .  join  (  ''  )  ;
} //  End  of  the  `reve`  function  definition.


//  Utilize  Node.js's  `fs`  (file  system)  module  to  read  from  standard  input.
//  `readFileSync`  is  used  for  synchronous  reading,  blocking  execution  until  input  is  received.
//  The  path  `/dev/stdin`  is  a  common  convention  for  standard  input  on  Unix-like  systems.
//  The  'utf8'  encoding  ensures  proper  handling  of  various  characters.
var     input     =     require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,    'utf8'  )  ;


//  Finally,  call  the  `reve`  function  with  the  `input`  string  and  print  the  result
//  to  the  console  (which  typically  redirects  to  standard  output).
console  .  log  (  reve  (  input  )  )  ; //  Display  the  reversed  input.