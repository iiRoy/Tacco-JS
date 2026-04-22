var  fs  =  require ( 'fs' ) ; // Core Node.js file system module.

var  filename  =  '/users/petersirka/desktop/test/test.nosql' ; // Defines the path for the NoSQL database file.

var  nosql  =  require ( '../index' ) ;   /* Imports the local NoSQL database module. */
var  db  =  nosql . load ( filename ) ;    // Loads or creates the database instance from the specified file.

var  assert  =  require ( 'assert' ) ;   // The Node.js assertion module, typically used for testing.

// --- First Asynchronous Operation: Create a database view ---
setTimeout ( function ( ) {

  // Initiates the creation of a new view named 'test' within the database.
  db . views . create ( 'test' ,

    // Mapper function: This function determines which documents are included in the view.
    // It returns a document if its 'index' property is greater than 10 AND less than 1000.
    function ( doc ) {

      if  ( doc . index  >  10  &&  doc . index  <  1000 )
      {
        return  doc ; // Include the document in the view.
      }
    } ,

    // Reducer/Sorter function: This function defines the sorting logic for the view results.
    // It sorts documents based on their 'index' property in ascending order.
    function ( a , b ) {

      if  ( a . index  >  b . index )
      {
        return  1 ;  // 'a' should come after 'b'.
      }

      return  -1 ; // 'a' should come before 'b'.
    } ,

    // Callback function: Executed once the view creation process is complete.
    // It receives the total count of documents included in the newly created view.
    function ( count ) {

      console . log ( count ) ; // Logs the number of items found for the view.
    } ,

    'create view' /* A descriptive label for this specific view operation. */
  ) ; // End of db.views.create method call.

} ,  1000 ) ; // This entire block executes after a delay of 1000 milliseconds (1 second).


// --- Second Asynchronous Operation: Insert data into the database ---
setTimeout ( function ( ) {

  // Loop to insert 10,000 new documents into the database.
  for  ( var  i  =  0 ;  i  <  10000 ;  i ++ )
  {
    // Each document is an object with an 'index' property,
    // and its unique ID is the string representation of 'i'.
    db . insert ( {  index : i  } ,  i . toString ( ) ) ;
  } // End of for loop for data insertion.

} ,  2000 ) ; // This block executes after a delay of 2000 milliseconds (2 seconds).


// --- Third Asynchronous Operation: Query the created view ---
setTimeout ( function ( ) {

  // Queries all documents that match the criteria defined in the 'test' view.
  db . views . all ( 'test' ,

    // Callback function for each selected document from the view.
    // 'selected' refers to the current document, 'count' is the total count of view results.
    function ( selected , count ) {

      console . log ( selected , count ) ; // Outputs the selected document and the total count.
    } ,

    // Filter function: This function applies an additional filter to the results
    // obtained from the 'test' view.
    function ( f ) {

      // If a document's 'index' is between 11 and 19 (exclusive of 10 and 20).
      if  ( f . index  >  10  &&  f . index  <  20 )
      {
        f . kokotar  =  true ; // Adds a new property 'kokotar' with value 'true'.
        return  f ;            // Returns the modified document.
      }
    }
  ) ; // End of db.views.all method call.

} ,  3000 ) ; // This block executes after a delay of 3000 milliseconds (3 seconds).