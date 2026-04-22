function ProcessInputData (  inputString  ) {


    inputString = inputString . split ( "\n" ) [ 0 ] ;
    var  heightVal  =  inputString . split ( " " ) [ 0 ]  - 0 ;
    var  widthVal  =  inputString . split ( " " ) [ 1 ]  - 0 ;
    var  splitPointA  =  inputString . split ( " " ) [ 2 ]  - 0 ;
    var  splitPointB  =  inputString . split ( " " ) [ 3 ]  - 0 ;


    var   currentRowData   =  new  Array (  widthVal  ) . fill ( 0 ) ;
    var   resultGrid   =  [ ] ;
    for  ( var  rowIndex  =  0 ;  rowIndex  <  heightVal ;  rowIndex ++ )  {
        for  ( var  colIndex  =  0 ;  colIndex  <  widthVal ;  colIndex ++ )  {

            if  (  colIndex  <  splitPointA  &&  rowIndex  <  splitPointB  )  {
                currentRowData [  colIndex  ]  =  0 ;
            }
            else  if  (  colIndex  >=  splitPointA  &&  rowIndex  <  splitPointB  )  {
                currentRowData [  colIndex  ]  =  1 ;
            }
            else  if  (  colIndex  <  splitPointA  &&  rowIndex  >=  splitPointB  )  {
                currentRowData [  colIndex  ]  =  1 ;
            }
            else  if  (  colIndex  >=  splitPointA  &&  rowIndex  >=  splitPointB  )  {
                currentRowData [  colIndex  ]  =  0 ;
            }

        }
        resultGrid [  rowIndex  ]  =  currentRowData . slice ( ) ;
        currentRowData . fill ( 0 ) ;
    }

    for  ( var  rowIndex  =  0 ;  rowIndex  <  heightVal ;  rowIndex ++ )  {
        console . log ( resultGrid [  rowIndex  ] . join ( "" ) ) ;
    }
}

ProcessInputData (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;