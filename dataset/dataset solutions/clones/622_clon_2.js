var  dataStream=require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


var  processedLines = ( dataStream . trim ( ) ) . split ( "\n" ) ;

var  entryCount = processedLines . shift ( ) ;

var  valueMap = { } ;

for  ( var  loopIndex  =  0 ;
    loopIndex  <  entryCount ;
    loopIndex++ )
{
    var  currentSegments  =  processedLines [ loopIndex ] . split ( " " ) ;

    var  keyIdentifier  =  currentSegments [ 0 ] ;

    if  ( ! valueMap . hasOwnProperty ( keyIdentifier ) )

        valueMap [ keyIdentifier ]  =  0 ;

    valueMap [ keyIdentifier ]  +=  Number ( currentSegments [ 1 ] ) ;
}


var  sortedKeys  =  [ ] ;

for  ( var  mapKey  in  valueMap )
    sortedKeys . push ( mapKey ) ;


function  lengthComparison  (  firstElement ,  secondElement  )
{
    if  ( firstElement . length  >  secondElement . length )
        return  1 ;

    if  ( firstElement . length  <  secondElement . length )
        return  -1 ;

    return  0 ;
}

sortedKeys . sort ( ) ;
sortedKeys . sort ( lengthComparison ) ;

for  ( var  outputIterator  =  0 ;
      outputIterator  <  sortedKeys . length ;
      outputIterator++ )
    console . log ( sortedKeys [ outputIterator ]  +  " "  +  valueMap [ sortedKeys [ outputIterator ] ] ) ;