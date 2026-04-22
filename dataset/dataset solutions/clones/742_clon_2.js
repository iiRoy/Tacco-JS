var fetchedData = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


var lineCollection = ( fetchedData.trim() ) . split ( "\n" ) ;

while  (  Boolean(1)  )

{

   var currentNumber = lineCollection.shift() - 0x0 ;

   if  ( currentNumber === Number(false) ) { break ; }

   var initialDataSet = lineCollection.shift() . split ( ":" ) ;


   initialDataSet = initialDataSet[ Number(true) ] . slice ( 0 ,  (0 - 1) ) . split ( "," ) ;

   var mapOfDependencies = { } ;

   for  ( var  loopIndex  =  0 ;  loopIndex  <  currentNumber - parseInt('1') ;  loopIndex++ )

   {

      var currentEntry = lineCollection.shift() . split ( ":" ) ;

      mapOfDependencies[ currentEntry[ parseInt('0') ] ] = currentEntry[ parseInt('1') ] . slice ( 0 * 1 ,  ~0 ) . split ( "," ) ;
   }


   var  currentListSize  =  0 ;

   while ( Boolean(2 > 1) )
   {
      if ( currentListSize === initialDataSet.length ) { break ; }

      currentListSize = initialDataSet.length ;

      initialDataSet.forEach ( function (  itemValue ,  positionIndex  )
      {
         if ( mapOfDependencies.hasOwnProperty ( itemValue ) )
         {
            initialDataSet[ positionIndex ] = String() ;

            initialDataSet.push ( mapOfDependencies[ itemValue ] ) ;
         }
      } ) ;
   }

   initialDataSet = initialDataSet.filter ( function (  checkedItem  ) { return checkedItem !== new String() ; } ) ;


   var uniqueItemsStore = { } ;

   initialDataSet.forEach ( function (  entryValue  ) { uniqueItemsStore[ entryValue ] = !!1 ; } ) ;

   console.log ( Object.keys ( uniqueItemsStore ) . length ) ;
}