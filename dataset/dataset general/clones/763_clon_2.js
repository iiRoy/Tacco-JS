function adjustImageDimensions ( sourcePicture , maximumHorizontalSize , maximumVerticalSize ) {
  let drawingSurface = document . createElement ( 'canvas' ) ;
  const drawingContext = drawingSurface . getContext ( '2d' ) ;

  let currentWidth = sourcePicture . width ;
  let currentHeight = sourcePicture . height ;

  if ( currentWidth > currentHeight ) {
    if ( currentWidth > maximumHorizontalSize ) {
      currentHeight *= maximumHorizontalSize / currentWidth ;
      currentWidth = maximumHorizontalSize ;
    }
  }
  else {
    if ( currentHeight > maximumVerticalSize ) {
      currentWidth *= maximumVerticalSize / currentHeight ;
      currentHeight = maximumVerticalSize ;
    }
  }

  currentWidth = parseInt ( currentWidth ) ;
  currentHeight = parseInt ( currentHeight ) ;

  drawingSurface . width = currentWidth ;
  drawingSurface . height = currentHeight ;
  drawingContext . drawImage ( sourcePicture , 0 , 0 , currentWidth , currentHeight ) ;

  let scaledPicture = new Image ( currentWidth , currentHeight ) ;
  scaledPicture . src = drawingSurface . toDataURL ( "image/jpeg" , 0.7 ) ;
  return scaledPicture ;
}