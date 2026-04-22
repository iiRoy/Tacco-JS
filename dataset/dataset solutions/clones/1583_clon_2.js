// Example grid data: "5 5\n2 2\n5 5\n.....\n.###.\n.P.D.\n.###.\n....."
/*
Input schema:
    First line: grid dimensions (rows, cols).
    Second line: initial position (row, col).
    Third line: target position (row, col).
    Subsequent lines: grid layout.
*/

function processGridData  (  rawData  )  {
  rawData  =  rawData . trim ( ) ;
  let  textRows  =  rawData . split ( "\n" ) ;
  let  parsedSettings  =  [  ] ;  //  A two-dimensional collection
  let  gridLayout  =  [  ] ;  //  A two-dimensional layout

  for  (  let  idx  =  0 ;  idx  <  textRows . length ;  idx ++  )  {
    parsedSettings [ idx ]  =  textRows [ idx ] . split ( " " ) ;
  }

  for  (  let  idx  =  0 ;  idx  <  textRows . length  -  3 ;  idx ++  )  {
    gridLayout [ idx ]  =  textRows [ idx  +  3 ] . split ( "" ) ;
  }

  let  gridRows  =  parseInt ( parsedSettings [ 0 ] [ 0 ] ) ;
  let  gridCols  =  parseInt ( parsedSettings [ 0 ] [ 1 ] ) ;
  let  currentY  =  parseInt ( parsedSettings [ 1 ] [ 0 ] )  -  1 ;  //  Starting row coordinate
  let  currentX  =  parseInt ( parsedSettings [ 1 ] [ 1 ] )  -  1 ;
  let  targetY  =  parseInt ( parsedSettings [ 2 ] [ 0 ] )  -  1 ;  //  Target row coordinate
  let  targetX  =  parseInt ( parsedSettings [ 2 ] [ 1 ] )  -  1 ;
  let  teleportJumps  =  0 ;

  function  displayGrid  (  )  {
    let  gridRepresentation  =  "" ;
    let  clonedGrid  =  JSON . parse ( JSON . stringify ( gridLayout ) ) ;  //  Duplicate grid for display purposes (pass by value effect)
    clonedGrid [ currentY ] [ currentX ]  =  "P" ;
    clonedGrid [ targetY ] [ targetX ]  =  "D" ;
    for  (  let  rowIterator  =  0 ;  rowIterator  <  clonedGrid . length ;  rowIterator ++  )  {
      for  (  let  colIterator  =  0 ;  colIterator  <  clonedGrid [ rowIterator ] . length ;  colIterator ++  )  {
        gridRepresentation  +=  clonedGrid [ rowIterator ] [ colIterator ] ;
      }
      gridRepresentation  +=  "\n" ;
    }
    //  Display the current layout to console
    //  console.log(gridRepresentation);
  }  //  Conclude displayGrid procedure

  function  navigatePath  (  )  {
    if  (  targetX  >  currentX  &&  gridLayout [ currentY ] [ currentX  +  1 ]  ===  "."  )  {
      currentX ++ ;
    }  else  if  (  targetY  >  currentY  &&  gridLayout [ currentY  +  1 ] [ currentX ]  ===  "."  )  {
      currentY ++ ;
    }  else  if  (  Math . abs ( targetY  -  currentY )  <=  2  &&  Math . abs ( targetX  -  currentX )  <=  2  )  {
      currentY  =  targetY ;
      currentX  =  targetX ;
      teleportJumps ++ ;
    }
    displayGrid ( ) ;
  }  //  Conclude navigatePath procedure

  for  (  let  destinationReached  =  0 ;  destinationReached  ===  0 ;  )  {
    if  (  currentY  ===  targetY  &&  currentX  ===  targetX  )  {
      console . log ( teleportJumps ) ;
      destinationReached  =  1 ;
    }  else  {
      navigatePath ( ) ;
    }
  }  //  Loop until destination reached
}

//  Invoke the primary grid processing function
processGridData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;