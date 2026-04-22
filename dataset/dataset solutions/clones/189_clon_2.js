let targetChar = 'Z' ;
 process . stdin . resume ( ) ;
 process.stdin. setEncoding ( 'utf8' ) ;
 process . stdin . on ( 'data' ,  function ( streamPortion ) {
  let tokenArray = streamPortion.trim().split(',');
   if ( tokenArray [ 0 ]  ==  targetChar )
    { targetChar = tokenArray [ 1 ] ; }
  else if ( tokenArray [ 1 ]  ==  targetChar )
    { targetChar = tokenArray [ 0 ] ; }
 } ) ;
process . stdin . on ( 'end' ,  function ( ) { console . log ( targetChar ) ; } ) ;