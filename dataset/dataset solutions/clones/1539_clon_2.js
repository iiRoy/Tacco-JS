function ProcessCoordinates ( rawData )
{
  // This section converts the raw input string into an array of lines.
  rawData = rawData.split ( "\n" ) ;

  let pointCount = Number.parseInt ( rawData[0] , 10 ) ;

  const upperRightPoint = { xCoord : 1 , yCoord : 1 , originalIndex : 0 } ;
  const upperLeftPoint  = { xCoord : 3 , yCoord : 1 , originalIndex : 0 } ;
  const lowerRightPoint = { xCoord : 1 , yCoord : 3 , originalIndex : 0 } ;
  const lowerLeftPoint  = { xCoord : 3 , yCoord : 3 , originalIndex : 0 } ;

  for ( let idx = 1 ; idx < pointCount ; idx ++ )
  {
    let coordinatePairString = rawData[idx].split ( " " ) ;

    let currentX = Number.parseInt ( coordinatePairString[0] , 10 ) ;
    let currentY = Number.parseInt ( coordinatePairString[1] , 10 ) ;

    if ( currentX >= upperRightPoint.xCoord && currentY >= upperRightPoint.yCoord )
    {
      upperRightPoint.xCoord = currentX ;
      upperRightPoint.yCoord = currentY ;
      upperRightPoint.originalIndex = idx ;
    }

    if ( currentX <= upperLeftPoint.xCoord && currentY >= upperLeftPoint.yCoord )
    {
      upperLeftPoint.xCoord = currentX ;
      upperLeftPoint.yCoord = currentY ;
      upperLeftPoint.originalIndex = idx ;
    }

    if ( currentX >= lowerRightPoint.xCoord && currentY <= lowerRightPoint.yCoord )
    {
      lowerRightPoint.xCoord = currentX ;
      lowerRightPoint.yCoord = currentY ;
      lowerRightPoint.originalIndex = idx ;
    }

    if ( currentX <= lowerLeftPoint.xCoord && currentY <= lowerLeftPoint.yCoord )
    {
      lowerLeftPoint.xCoord = currentX ;
      lowerLeftPoint.yCoord = currentY ;
      lowerLeftPoint.originalIndex = idx ;
    }
  }

  let calculatedDistance = Math.max (
    Math.abs ( upperRightPoint.xCoord - lowerLeftPoint.xCoord ) + Math.abs ( upperRightPoint.yCoord - lowerLeftPoint.yCoord ) ,
    Math.abs ( upperLeftPoint.xCoord - lowerRightPoint.xCoord ) + Math.abs ( upperLeftPoint.yCoord - lowerRightPoint.yCoord )
  ) ;

  // Displaying the final computed result.
  console.log ( '%d' , calculatedDistance ) ;
}