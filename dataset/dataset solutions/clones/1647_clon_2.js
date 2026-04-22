/* This module handles processing of numerical input data. */

function  processData (   incomingData  )
{
  incomingData = incomingData.trim ( ) ;
  let   firstLineContent   = incomingData.split( "\n" ) [ 0x0 ] ;
  let   secondLineContent  = incomingData.split( "\n" ) [ 0x1 ] ;
  let   valX   =   parseInt( firstLineContent.split ( " " ) [ 0 ] ) ;
  let   valY   =   parseInt( firstLineContent.split ( " " ) [ 1 ] ) ;
  let   valZ   =   parseInt( firstLineContent.split ( " " ) [ 2 ] ) ;
  let   loopTimes  =   parseInt( secondLineContent ) ;

  // Sub-function to verify current state
  function  verifyOrder ( )
  {
    return ( valX < valY && valY < valZ ) ;
  }
  
  /* Sub-procedure for applying transformation rules */
  function  applyRules ( )
  {
    if ( valX >= valY )
    {
      valY = valY * 0x2 ;
    }
    else if ( valY >= valZ )
    {
      valZ = valZ * 2 ;
    }
  }
  
  for ( let  iterCount = 0 ; iterCount < loopTimes ; iterCount++ )
  {
    applyRules ( ) ;
  }
  let   finalOutcome  =  "" ;
  if (  verifyOrder ( )  ===  true  )
  {
    finalOutcome = "Yes" ;
  }
  else
  {
    finalOutcome = "No" ;
  }
  console.log( finalOutcome ) ;
}

/* Example usage of the main processing function:
processData( "1 2 3\n4" );
*/

processData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;