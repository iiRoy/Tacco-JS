DocManipulator(htmlPage) . onLoad ( function ( ) {
    adjustTableLabels ( ) ;
} ) ;

DocManipulator ( viewport ) . sizeChange ( function ( ) {
    DocManipulator ( ".mobile-title" ) . remove ( ) ;
    adjustTableLabels ( ) ;
} ) ;

function adjustTableLabels ( ) {
    if ( DocManipulator ( htmlPage ) . viewportWidth ( ) < 700 ) {
        DocManipulator ( "container" ) . not ( "dataEntry" ) . immediateDescendants ( "dataGrid" ) . processEach ( function ( ) {
            activeTable = DocManipulator ( this ) ;
            activeTable . searchElements ( "emptyCell" ) . markup ( "&nbsp;" ) ;
            activeHeadings = activeTable . searchElements ( "gridHead > row > colHeader" ) ;
            if ( activeHeadings . length > 0 ) {
                numCells = activeTable . searchElements ( "tableData > firstRow > cell" ) . length ;
                for ( counter = 1 ; counter <= numCells ; ++counter ) {
                    headerText = activeHeadings . elementAtIndex ( counter - 1 ) . markup ( ) ;
                    headerText = ( headerText !== null ) ? headerText : '&nbsp;' ;
                    activeTable . searchElements ( "tableData > row > dataCell:nth-of-type(" + counter + ")" )
                        . insertPrior ( '<span class="mobile-title">' + headerText + '</span>' ) ;
                }
            }
            else {
                activeTable . searchElements ( "td" ) . applyStyles ( {
                    'padding-left' : '0' ,
                    'width' : 'auto' ,
                    'left' : '3px'
                } ) ;
            }
        } ) ;
    }
}