/*
 * This JavaScript program reads data from standard input,
 * expecting pairs of numbers (height and width) per line.
 * It generates and prints a checkerboard pattern for each pair
 * until it encounters a line containing "0 0", which signals termination.
 * The output includes an empty line after each generated pattern.
 */


var   input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; //  Read  the  entire  standard  input  as  a  UTF-8  string.

let   sp  =  input . split ( "\n" ) ; //  Split  the  input  string  into  an  array  of  lines,  using  newline  as  delimiter.


//  Begin  main  loop:  Iterate  through  each  line  of  the  'sp'  array.
//  The  loop  continues  as  long  as  the  current  line  is  not  exactly  "0 0".
for ( let   i  =  0 ;  sp [ i ]   !==   "0 0" ;  i ++  )
{

  /*
   *  Process  the  current  input  line  to  extract  height  and  width.
   *  The  line  is  first  split  by  space,  then  each  part  is  converted  to  a  Number.
   */
  let   hw  =  sp [ i ] . split ( " " ) . map ( Number ) ;

  let   h  =  hw [ 0 ] ;   w  =  hw [ 1 ] ; //  Assign  the  first  element  to  height  (h)  and  the  second  to  width  (w).


  //  Inner  loop:  Generate  each  row  of  the  checkerboard  pattern.
  //  This  loop  runs  'h'  (height)  times.
  for ( let   hh  =  0 ;  hh  <  h ;  hh ++  )
  {
    let   row  =  "" ; //  Initialize  an  empty  string  to  build  the  current  row's  pattern.


    //  Determine  the  starting  character  offset  for  the  current  row.
    //  If  the  row  number  (hh)  is  even,  'plus'  is  0;  otherwise,  it's  1.
    let   plus  =  hh  %  2  ===  0  ?  0  :  1 ;


    //  Innermost  loop:  Build  the  characters  for  the  current  row.
    //  The  loop  iterates  'w'  (width)  times,  with  an  offset  determined  by  'plus'.
    for ( let   ww  =  0  +  plus ;  ww  <  w  +  plus ;  ww ++  )
    {
      //  Append  '#'  if  'ww'  is  even,  otherwise  append  '.'.
      //  This  creates  the  alternating  pattern.
      row  +=  ww  %  2  ===  0  ?  "#"  :  "." ;
    }

    console . log ( row ) ; //  Print  the  fully  constructed  row  to  standard  output.

  } //  End  of  the  loop  for  generating  rows.


  console . log ( ) ; //  Print  an  empty  line  after  each  complete  checkerboard  pattern.

} //  End  of  the  main  loop  processing  input  lines.