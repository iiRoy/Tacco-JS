let rawData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
const lines = rawData . trim ( ) . split ( '\n' ) ;
let configValues = lines . shift ( ) . split ( ' ' ) . map ( parseFloat ) ;
let firstParam = configValues [ 0 ] - 1 ;
let secondParam = configValues [ 1 ] ;
let targetValue = configValues [ 2 ] ;
let dataList = [ ] ;
for ( let idx = 0 ; idx < secondParam ; idx ++ )
{
  let currentNum = parseInt ( lines . shift ( ) , 10 ) ;
  if ( currentNum !== targetValue )
  {
    dataList . push ( currentNum ) ;
  }
}
dataList = dataList . concat ( targetValue ) ;
dataList . sort ( function ( itemA , itemB ) { return itemA - itemB ; } ) ;
let minimumResult = Number . MAX_VALUE ;
dataList . forEach ( function ( currentElement , currentIndex )
{
  if ( currentElement < targetValue )
  {
    if ( currentIndex !== 0 )
    {
      minimumResult = Math . min ( minimumResult , ( targetValue - currentElement ) * 2 + ( firstParam - targetValue + 1 ) + dataList [ currentIndex - 1 ] ) ;
    }
  }
  if ( targetValue === currentElement )
  {
    if ( currentIndex === 0 )
    {
      minimumResult = Math . min ( minimumResult , dataList [ dataList . length - 1 ] - currentElement ) ;
    }
    if ( currentIndex === dataList . length - 1 )
    {
      minimumResult = Math . min ( minimumResult , currentElement - dataList [ 0 ] ) ;
    }
    if ( currentIndex !== dataList . length - 1 )
    {
      minimumResult = Math . min ( minimumResult , targetValue + firstParam - dataList [ currentIndex + 1 ] + 1 ) ;
    }
    if ( currentIndex !== 0 )
    {
      minimumResult = Math . min ( minimumResult , firstParam - targetValue + 1 + dataList [ currentIndex - 1 ] ) ;
    }
  }
  if ( targetValue < currentElement )
  {
    if ( currentIndex !== dataList . length - 1 )
    {
      minimumResult = Math . min ( minimumResult , ( currentElement - targetValue ) * 2 + targetValue + ( firstParam - dataList [ currentIndex + 1 ] + 1 ) ) ;
    }
  }
} ) ;
console . log ( minimumResult * 100 ) ;