/*
 * This  JavaScript  code  implements  a  solution  for  a  problem  involving
 * character  frequency  analysis  across  multiple  strings.
 *
 * It  defines  three  primary  functions:
 *   1.  `frequency`:      Calculates  the  frequency  of  lowercase  English  letters  in  a  string.
 *   2.  `freqMatch`:      Compares  two  frequency  arrays  and  updates  the  first  with  minimum  counts.
 *   3.  `Main`:           The  core  logic  that  reads  input,  processes  strings,  and  prints  the  result.
 *
 * The  overall  goal  is  to  find  the  common  characters  among  a  set  of  input  strings,
 * represented  by  their  minimum  frequencies,  and  then  construct  a  result  string  from  these.
 */


//  This  function  computes  the  frequency  of  each  lowercase  English  letter
//  within  a  given  input  string.
//  It  returns  an  array  of  26  integers,  where  each  index  corresponds  to
//  a  letter  from  'a'  to  'z',  storing  its  count.
function  frequency ( s ) {

        //  Initialize  an  array  of  size  26  (for  'a'  through  'z')  with  all  elements  set  to  zero.
        var  freq  =  new  Array ( 26 ) . fill ( 0 ) ;


        //  Iterate  over  each  character  in  the  input  string  `s`.
        for  ( var  i  =  0 ;  i  <  s . length ;  i ++ ) {

                //  Calculate  the  array  index  for  the  current  character.
                //  'a'  maps  to  index  0,  'b'  to  1,  and  so  on.
                var  index  =  s [ i ] . charCodeAt ( )  -  "a" . charCodeAt ( ) ;

                //  Increment  the  frequency  count  for  the  corresponding  letter.
                freq [ index ] ++ ;
        }


        //  Return  the  populated  frequency  array.
        return  freq ;
}


//  This  function  takes  two  frequency  arrays,  `freq1`  and  `freq2`,  as  input.
//  It  modifies  `freq1`  in-place  such  that  each  element  `freq1[i]`  becomes
//  the  minimum  of  its  original  value  and  `freq2[i]`.
//  This  is  useful  for  finding  common  character  counts  across  multiple  strings.
function  freqMatch ( freq1 , freq2 ) {

        //  Loop  through  all  26  possible  letter  indices.
        for  ( var  i  =  0 ;  i  <  26 ;  i ++ ) {

                //  Update  the  frequency  in  `freq1`  to  be  the  minimum  of
                //  the  current  value  and  the  value  from  `freq2`.
                freq1 [ i ]  =  Math . min ( freq1 [ i ] , freq2 [ i ] ) ;
        }


        //  Return  the  modified  `freq1`  array.
        return  freq1 ;
}


//  The  main  entry  point  function  that  orchestrates  the  entire  process.
//  It  reads  input  strings,  calculates  their  common  character  frequencies,
//  and  then  constructs  and  prints  the  final  result  string.
function  Main ( input ) {

        //  Split  the  multi-line  input  string  into  an  array  of  individual  lines.
        input  =  input . split ( "\n" ) ;


        //  The  first  line  of  the  input  contains  an  integer  'n',
        //  which  specifies  the  number  of  strings  that  follow.
        var  n  =  parseInt ( input [ 0 ] ,  10 ) ;


        //  Extract  the  actual  strings  to  be  processed  from  the  input  array.
        //  These  are  from  the  second  line  (`input[1]`)  up  to  `n`  lines  after  that.
        var  strings  =  input . slice ( 1 ,  n + 1 ) ;


        //  Calculate  the  initial  frequency  array  using  the  very  first  string.
        var  freq1  =  frequency ( strings [ 0 ] ) ;


        //  Iterate  through  the  rest  of  the  strings,  starting  from  the  second  one.
        for  ( var  i  =  1 ;  i  <  strings . length ;  i ++ ) {

                //  Compute  the  frequency  array  for  the  current  string.
                var  freq2  =  frequency ( strings [ i ] ) ;

                //  Update  `freq1`  by  finding  the  minimum  frequencies  between  it  and  `freq2`.
                //  This  ensures  `freq1`  always  holds  the  common  minimum  counts  across  all  processed  strings.
                freq1  =  freqMatch ( freq1 , freq2 ) ;
        }


        //  Initialize  an  empty  string  variable  to  store  the  final  result.
        res  =  "" ;


        //  Construct  the  result  string  based  on  the  final  (minimum)  frequency  array  `freq1`.
        //  Loop  through  each  possible  lowercase  letter  (from  'a'  to  'z').
        for  ( var  i  =  0 ;  i  <  26 ;  i ++ ) {

                //  For  each  letter,  append  it  to  the  `res`  string  the  number  of  times
                //  indicated  by  its  frequency  count  in  `freq1[i]`.
                for  ( var  j  =  0 ;  j  <  freq1 [ i ] ;  j ++ ) {

                        //  Convert  the  numeric  index  `i`  back  to  its  corresponding  character.
                        res  +=  String . fromCharCode ( i + "a" . charCodeAt ( ) ) ;
                }
        }


        //  Output  the  final  constructed  result  string  to  the  console.
        console . log ( res ) ;
}


//  This  is  the  entry  point  for  executing  the  script.
//  It  reads  the  entire  content  of  standard  input  (`"/dev/stdin"`)  as  a  UTF-8  string,
//  and  then  passes  this  input  to  the  `Main`  function  for  processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;