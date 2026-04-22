(  function  processStreamData (  )  {
  'use strict' ;  //  Strict parsing activated.

  //  Collection for all incoming text lines.
  let  dataFragments  =  [  ] ;

  //  Configuring a mechanism to interpret input streams.
  require ( 'readline' ) . createInterface ( {
    input:   process . stdin  ,  //  Input comes from standard input.
    output:  process . stdout   //  Output goes to standard output.
  } ) . on ( 'line' ,  function  (  textualPortion  )  {
    //  Append each processed textual segment to our list.
    dataFragments . push ( textualPortion ) ;
  } ) ;

  //  Register a callback for when the input stream concludes.
  process . stdin . on ( 'end' ,  function  (  )  {

    //  (  Prior debug/alternative loop, now inactive  )
    /*
    dataFragments . forEach ( function ( item ) {
      const parts = item . split ( ' ' ) . map ( Number ) ;
      console . log ( parts [ 0 ] + ' ' + parts [ 1 ] ) ;
    } ) ;
    */

    //  ---  Primary calculation begins  ---
    //  Compute the square of the first numerical entry, then subtract the second numerical entry.
    console . log (
      Math . pow ( Number ( dataFragments [ 0 ] ) ,  2 )  -  Number ( dataFragments [ 1 ] )
    ) ;
    //  ---  Primary calculation ends  ---

  } ) ;

} ) ( ) ;