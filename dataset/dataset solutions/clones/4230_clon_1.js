// This  file  contains  a  JavaScript  program  for  comparing  two  numbers .
// It  reads  two  space-separated  numbers  from  standard  input ,
// converts  them  to  their  ASCII  character  codes ,  and  then  compares  them .
// The  result  is  printed  to  the  console .

"use strict" /* Enforces  stricter  parsing  and  error  handling  in  the  code */ ;


//  The  main  function  that  processes  the  input .
function   main   (   input   )
{

    //  Step  1 :  Process  the  input  string .
    //  It  splits  the  input  by  spaces  and  then  maps  each  resulting  string
    //  to  its  ASCII  character  code  using  charCodeAt ( 0 ) .
    //  The  result  is  an  array  of  character  codes .
    input   =   input.split ( " " ).map (   v   =>   v.charCodeAt ( )   ) ;


    //  Step  2 :  Extract  the  two  character  codes .
    //  The  first  character  code  is  assigned  to  'x' .
    const   x   =   input[0] ;

    //  The  second  character  code  is  assigned  to  'y' .
    const   y   =   input[1] ;


    //  Step  3 :  Compare  the  two  character  codes  and  print  the  result .

    //  If  'x'  is  strictly  equal  to  'y' .
    if   (   x   ==   y   )
    {
        console.log ( "=" ) ; //  Print  "="  if  they  are  equal .
    }
    //  Else  if  'x'  is  greater  than  'y' .
    else   if   (   x   >   y   )
    {
        console.log ( ">" ) ; //  Print  ">"  if  'x'  is  greater .
    }
    //  Else  ( meaning  'x'  must  be  less  than  'y' ) .
    else
    {
        console.log ( "<" ) ; //  Print  "<"  if  'x'  is  less .
    }

} //  End  of  the  main  function .


//  This  section  handles  the  execution  of  the  program .
//  It  reads  the  entire  content  of  standard  input  synchronously ,
//  converts  it  to  UTF-8 ,  and  then  passes  it  to  the  main  function .
main   (   require ( "fs" ).readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;

//  Program  execution  completes  here .