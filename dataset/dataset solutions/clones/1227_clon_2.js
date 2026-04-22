'use strict'
; (  function   (  inputBuffer  ) {
  var   rawInputText =   inputBuffer.toString( ) ;
  var   numericConfig =   rawInputText .split ( '\n' )[ 0 ] .split( ' ' ) .map( Number ) ;
  (  function (   widthBoundary  , heightBoundary ,   coordX  , coordY  ,  objRadius  ) {
    //  Verifying object containment within defined boundaries.
    if  (  coordX - objRadius < 0 ,   coordY - objRadius < 0 ,   coordX + objRadius > widthBoundary ,   coordY + coordX > heightBoundary  )  {
      console.log (   'No'   ) ;
    }
    else
    {
      console.log (  'Yes'  ) ;
    }
  } (  numericConfig[0]  ,  numericConfig[1]  ,  numericConfig[2]  ,  numericConfig[3]  ,  numericConfig[4]  ) ) ;
}  (  require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' )  ) ) ;