var   streamContent   =  require ( 'fs' )
  . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


var numericComponents = streamContent . trim ( ) . split ( " " ) . map ( Number ) ;

var edgeA = numericComponents [ 0 ] ;

var edgeB = numericComponents [ 1 ] ;

var centralAngleDegrees = numericComponents [ 2 ] ;

var geometricArea = edgeA * edgeB / 2 * Math . sin ( centralAngleDegrees * Math . PI / 180 ) ;

var edgeC = Math . sqrt ( edgeA * edgeA + edgeB * edgeB - 2 * edgeA * edgeB * Math . cos ( centralAngleDegrees * Math . PI / 180 ) ) ;

var perpendicularHeight = 2 * geometricArea / edgeA ;

console . log ( geometricArea . toFixed ( 8 ) + " " + ( edgeA + edgeB + edgeC ) . toFixed ( 8 ) + " " + perpendicularHeight . toFixed ( 8 ) ) ;