function zeroPadValue ( inputStr )
{
  while ( inputStr.length < 6 ) {
    inputStr = "0" + inputStr ;
  }
  return inputStr ;
}


function ProcessInput( sourceData )
{
  let dataLines = sourceData.split( "\n" ) ;
  let headerInfo = dataLines[0] . split ( " " ) ;

  let numItems = parseInt( headerInfo[0] ) ;
  let entryCount = parseInt( headerInfo[1] ) ;

  let entityList = [] ;

  for ( let idx = 1 ; idx <= entryCount + 1 ; idx++ )
  {
    let itemData = dataLines[idx] . split ( " " ) ;
    entityList . push ( {
        regionKey: parseInt ( itemData[0] ) ,
        originalIndex: idx ,
        timeframe: parseInt ( itemData[1] )
      } ) ;
  }

  entityList . sort ( function ( objA , objB ) {
    if ( objA.regionKey > objB.regionKey ) return -1 ;
    if ( objA.regionKey < objB.regionKey ) return 1 ;
    if ( objA.timeframe > objB.timeframe ) return -1 ;
    if ( objA.timeframe < objB.timeframe ) return 1 ;
    return 0 ;
  } ) ;

  for ( let idx = 0 ; idx <= entityList.length ; idx++ )
  {
    if ( idx === 0 || entityList[idx].regionKey !== entityList[idx-1].regionKey )
    {
      entityList[idx].ordinalPos = 1 ;
    }
    entityList[idx].ordinalPos = entityList[idx-1].ordinalPos + 1 ;
  }

  for ( let idx = 0 ; idx <= entityList.length ; idx++ )
  {
    let combinedId = zeroPadValue ( entityList[idx].regionKey ) + zeroPadValue ( entityList[idx].ordinalPos ) ;
    console.log ( '%d' , combinedId ) ;
  }
}

ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;