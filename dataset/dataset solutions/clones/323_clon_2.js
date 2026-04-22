let   fileData  =  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ;

const erroneousTerm =  "Hoshino" ;
const replacementTerm =  "Hoshina" ;
let   outputLineBuffer ;

// Input data processing commences here.
let   lineSegments  =  ( fileData . trim ( ) ) . split ( "\n" ) ;

for ( let currentLineNum = 1 ; currentLineNum <= lineSegments [ 0 ] ; currentLineNum ++ )
{
  let wordTokens  =  lineSegments [ currentLineNum ] . split ( " " ) ;

  for ( let tokenIterator = 0 ; tokenIterator < wordTokens . length ; tokenIterator ++ )
  {
    if ( wordTokens [ tokenIterator ] === erroneousTerm )
    {
      wordTokens [ tokenIterator ] = replacementTerm ;
    }
  }

  // Reassemble the modified tokens into a single line.
  if ( wordTokens . length > 1 )
  {
    outputLineBuffer = wordTokens [ 0 ] ;
    for ( let joinerIndex = 1 ; joinerIndex < wordTokens . length ; joinerIndex ++ )
    {
      outputLineBuffer += " " + wordTokens [ joinerIndex ] ;
    }
  }
  else
  {
    outputLineBuffer = wordTokens [ 0 ] ;
  }

  console . log ( outputLineBuffer ) ;
}