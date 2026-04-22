/*
 *   This  JavaScript  function  is  designed
 *   to  process  a  given  input  string .
 *   It  extracts  specific  information  to
 *   form  a  new  string  for  output .
 */
function   Main   (   input   )
{
    //  Calculate  the  total  number  of  characters  in  the  input  string .
    var   cText   =   input . length   ;

    //  Extract  the  very  first  character  from  the  input  string .
    var   sText   =   input . substr   (   0   ,   1   )   ;

    //  Extract  the  final  character  from  the  input  string .
    var   eText   =   input . substr   (   input . length   -   1   ,   1   )   ;

    //  Concatenate  the  first  character ,  the  length ,  and  the  last  character .
    var   n   =   sText   +   cText   +   eText   ;


    //  Print  the  resulting  string  'n'  to  the  standard  output ,
    //  followed  by  a  newline  character .
    console . log   (   '%s\n'   ,   n   )   ;
} //  End  of  the  Main  function .


/*
 *   This  is  the  entry  point  of  the  script .
 *   It  reads  data  from  standard  input  using
 *   Node.js's  'fs'  module  and  then  invokes
 *   the  'Main'  function  with  the  read  content .
 */
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ; //  Function  call  to  begin  execution .