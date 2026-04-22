const fileSystemModule = require ( 'fs' ) ;

let fileContent = fileSystemModule . readFileSync ( '/dev/stdin', 'utf8' ) ;

let inputLines = fileContent . trim ( ) . split ( "\n" ) ;

while ( true )
{
  let processedLine = inputLines . shift ( ) ;

  if ( processedLine === "0 0" )
  {
    break ;
  }

  const sizeValues = processedLine . split ( " " ) . map ( Number ) ;

  let generatedPattern = Array ( sizeValues [ 0 ] + 1 ) . join (
    ( Array ( sizeValues [ 1 ] + 1 ) . join ( "#" ) ) + "\n"
  ) ;

  console . log ( generatedPattern + "\n" ) ;
}