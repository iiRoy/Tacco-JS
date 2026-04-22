const  computeGeometricData = (   inputDataSegments  )   =>   {
  var widthValue   =   inputDataSegments[0] .  split (" ") [0]   -   0   ;
  var heightValue  =   inputDataSegments[0] .  split (" ") [1]   -   0   ;
  var pointX       =   inputDataSegments[0] .  split (" ") [2]   -   0   ;
  var pointY       =   inputDataSegments[0] .  split (" ") [3]   -   0   ;

  var areaFromVerticalDivision   =   Math.min ( (pointX * heightValue) ,   ( (widthValue - pointX) * heightValue ) ) ;
  var areaFromHorizontalDivision =   Math.min ( (pointY * widthValue)  ,   ( (heightValue - pointY) * widthValue )  ) ;

  if (  areaFromVerticalDivision  ==  areaFromHorizontalDivision  ) {
    if ( areaFromHorizontalDivision == 0 ) {
      console.log (  heightValue * widthValue / 2   +   " "   +   "0"  ) ;
    } else {
      console.log (  areaFromHorizontalDivision   +   " "   +   "1"  ) ;
    }
  } else {
    var maximumPossibleArea   =   Math.max (  areaFromHorizontalDivision  ,   areaFromVerticalDivision  ) ;
    if (  maximumPossibleArea  ==  (widthValue * heightValue / 2)  ) {
      console.log (  maximumPossibleArea   +   " "   +   "1"  ) ;
    } else {
      console.log (  maximumPossibleArea   +   " "   +   "0"  ) ;
    }
  }
};

computeGeometricData (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'UTF-8' ) . trim ( ) . split ( "\n" )  ) ;