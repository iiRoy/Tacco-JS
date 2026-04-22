/**
 * This file demonstrates the usage and testing of the DataCollection utility.
 * It performs various operations like loading data, indexing, querying, filtering,
 * updating, deleting, and spawning new collections.
 *
 * All assertions are custom-wrapped to track pass/fail counts.
 */

var DataCollection=require ('./data_collection.js') ; /* Import the DataCollection module */

// This array holds our sample character data.
var    characters = [
  { /* First character entry */
    id      :     1, // Unique identifier
    first_name: 'Eddard'  , /* Character's given name */
    last_name: 'Stark' , // Character's family name
    gender    : 'm' , /* Male gender */
    age       : 35  , // Age of the character
    location  : 'Winterfell'  , // Primary residence
  } , // End of first character object
  {
    id: 2, /* Second character's ID */
    first_name: 'Jon',
    last_name: 'Snow' ,
    gender: 'm', // Male
    age: 14,
    location: 'Winterfell' /* Location */
  } ,
  {
    id: 3 , /* ID for Catelyn */
    first_name: 'Catelyn',
    last_name: 'Stark' ,
    gender: 'f' , // Female
    age: 33 ,
    location: 'Winterfell'
  } ,
  {
    id: 4 , /* Roose Bolton's ID */
    first_name: 'Roose',
    last_name: 'Bolton',
    gender: 'm' ,
    age: 40 ,
    location: 'Dreadfort'
  } ,
  {
    id: 5 , /* Ramsay Snow's ID */
    first_name: 'Ramsay',
    last_name: 'Snow' ,
    gender: 'm' ,
    age: 15 ,
    location: 'Dreadfort'
  }
]; /* End of characters array definition */


var dc = new DataCollection ( characters ) ; /* Initialize a new DataCollection instance with the character data */

var oldAssert = console . assert . bind ( console ) ; /* Keep a reference to the original console.assert function */
var count = 0 ; /* Initialize a counter for total assertions made */
var passed = 0 ; /* Initialize a counter for assertions that passed */
console.assert = function ( a , b ) { /* Override the default console.assert behavior */
  count++ ; /* Increment the total assertion count */
  if ( a ) { /* Check if the assertion condition 'a' is true */
    passed++ ; /* If true, increment the passed assertions count */
  }
  oldAssert ( a , b ) ; /* Call the original console.assert to log the result to the console */
} ;


console . assert ( ( function ( ) { /* Anonymous function for testing data loading */
  var cur , keys , key ; /* Declare local variables */
  var result = dc . query ( ) . values ( ) ; /* Retrieve all values from the DataCollection */
  for ( var i = 0 , len = characters . length ; i < len ; i++ ) { /* Loop through each character in the original array */
    var cur = characters [ i ] ; /* Get the current character object */
    var keys = Object . keys ( cur ) ; /* Get all property keys of the current character */
    for ( var j = 0 , jlen = keys . length ; j < jlen ; j++ ) { /* Loop through each key */
      key = keys [ j ] ; /* Assign the current key */
      if ( cur [ key ] !== result [ i ] [ key ] ) { /* Compare the value from original and DataCollection */
        return false ; /* If values don't match, return false */
      }
    }
  }
  return true ; /* If all values match, return true */
} ) ( ) , 'Data loaded correctly' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for .values(key) method */
  var arr = dc . query ( ) . values ( 'id' ) ; /* Get an array of 'id' values */
  return ( arr instanceof Array ) && arr [ 0 ] === 1 && arr [ 1 ] === 2 ; /* Check if it's an array and first two elements are 1 and 2 */
} ) ( ) , '.values(key) gives array of items' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for fetching without an index */
  try {
    dc . fetch ( 3 ) ; /* Attempt to fetch a record by ID without an index defined */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to fetch without an index set' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for destroying without an index */
  try {
    dc . destroy ( 3 ) ; /* Attempt to destroy a record by ID without an index defined */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to destroy without an index set' ) ; /* Assertion message */

dc . defineIndex ( 'id' ) ; /* Define 'id' as the primary index for the collection */

console . assert ( dc . __index !== null , 'Index set properly' ) ; /* Verify that the internal index property is no longer null */

console . assert ( dc . exists ( 1 ) , 'Index applied correctly' ) ; /* Check if a record with ID 1 exists using the newly defined index */

var destroyedRow = dc . destroy ( 3 ) ; /* Destroy the record with ID 3 and store the returned (destroyed) row */

console . assert ( destroyedRow . first_name === 'Catelyn' , 'Destroyed proper result in middle of set' ) ; /* Verify that the correct row (Catelyn) was destroyed */

console . assert ( ( function ( ) { /* Test attempting to destroy an already destroyed row */
  try {
    dc . destroy ( 3 ) ; /* Attempt to destroy record with ID 3 again */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to destroy already destroyed row' ) ; /* Assertion message */

console . assert ( dc . __find__ ( destroyedRow ) === -1 , 'Could not find destroyed row' ) ; /* Verify that the destroyed row can no longer be found internally */

dc . removeIndex ( ) ; /* Remove the currently defined index */

console . assert ( dc . __index === null , 'Index removed properly' ) ; /* Verify that the internal index property is now null */

console . assert ( ( function ( ) { /* Test for .sequence method without an index */
  try {
    dc . query ( ) . sequence ( 1 , 5 ) ; /* Attempt to use sequence method without an index defined */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , '.sequence gives error when not indexed' ) ; /* Assertion message */

dc . defineIndex ( 'id' ) ; /* Re-define 'id' as the primary index */

dc . load ( ) ; /* Load an empty dataset into the DataCollection */

console . assert ( dc . query ( ) . count ( ) === 0 , 'Loaded an empty dataset correctly' ) ; /* Verify that the collection count is 0 after loading an empty dataset */

console . assert ( dc . query ( ) . first ( ) === null , 'First value of empty dataset returned null' ) ; /* Verify that 'first' returns null for an empty dataset */

console . assert ( dc . query ( ) . last ( ) === null , 'Last value of empty dataset returned null' ) ; /* Verify that 'last' returns null for an empty dataset */

var oldQuery = dc . query ( ) . filter ( ) ; /* Create an "outdated" query object before reloading data */

dc . load ( characters ) ; /* Load the original character data back into the DataCollection */

console . assert ( ( function ( ) { /* Test for using an outdated query object */
  try {
    oldQuery . values ( ) ; /* Attempt to retrieve values using the outdated query */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to get values from outdated DataCollectionQuery' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for using an invalid filter type */
  try {
    dc . query ( ) . filter ( {
      first_name__eats : 'names can\'t eat'
    } ) ; /* Attempt to use a filter with an unrecognized operator */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to use invalid filter type' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for using a non-function argument for .each */
  try {
    dc . query ( ) . each ( null ) ; /* Attempt to call .each with null instead of a function */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to use non-function for DataCollectionQuery.each' ) ; /* Assertion message */

console . assert ( dc . query ( ) . count ( ) === dc . query ( ) . filter ( ) . count ( ) , 'Empty filter used empty object as filter params' ) ; /* Verify that an empty filter returns all records */

console . assert ( dc . query ( ) . count ( ) === dc . query ( ) . filter ( null , null ) . count ( ) , 'Filter given invalid arguments used empty objects as filter params' ) ; /* Verify that invalid filter arguments are treated as an empty filter */

console . assert ( ( function ( ) { /* Test for defining a non-string index */
  try {
    dc . defineIndex ( null ) ; /* Attempt to define an index with a null key */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to define non-string index' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for creating a mapping with a non-string key */
  try {
    dc . createMapping ( null ) ; /* Attempt to create a mapping with a null key */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to create mapping with non-string key' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for creating a mapping with an invalid (non-function) function */
  try {
    dc . createMapping ( 'is_bastard' , null ) ; /* Attempt to create a mapping with a null function */
  } catch ( e ) { /* Catch the expected error */
    return true ; /* If an error is caught, the test passes */
  }
  return false ; /* If no error, the test fails */
} ) ( ) , 'As expected, failed (error) to create mapping with invalid function' ) ; /* Assertion message */

dc . createMapping ( 'is_bastard' , function ( row ) {
  return row . last_name === 'Snow' ;
} ) ; /* Create a new mapping called 'is_bastard' */

console . assert ( ( function ( ) { /* Test if the mapping was created and applied successfully */
  var result = dc . query ( ) . values ( ) ; /* Get all records from the collection */
  for ( var i = 0 , len = result . length ; i < len ; i++ ) { /* Iterate through each record */
    if ( result [ i ] . is_bastard !== ( result [ i ] . last_name === 'Snow' ) ) { /* Compare the mapped value with the expected value */
      return false ; /* If there's a mismatch, return false */
    }
  }
  return true ; /* If all mapped values are correct, return true */
} ) ( ) , 'Mapping created successfully' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for .sequence with argument overloading */

  var seq = dc . query ( ) . sequence ( 5 , 2 , 3 ) . values ( ) ; /* Get values using sequence with multiple arguments */
  var expect = [ dc . fetch ( 5 ) , dc . fetch ( 2 ) , dc . fetch ( 3 ) ] ; /* Expected fetched values */

  if ( seq . length !== expect . length ) {
    return false ; /* Check if lengths differ */
  }

  for ( var i = 0 , len = seq . length ; i < len ; i++ ) { /* Iterate and compare each element */
    if ( seq [ i ] !== expect [ i ] ) {
      return false ; /* If elements don't match, return false */
    }
  }

  return true ; /* If all elements match, return true */

} ) ( ) , '.sequence gets correct values with argument overloading' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for .sequence with an array of values */

  var seq = dc . query ( ) . sequence ( [ 5 , 2 , 3 ] ) . values ( ) ; /* Get values using sequence with an array argument */
  var expect = [ dc . fetch ( 5 ) , dc . fetch ( 2 ) , dc . fetch ( 3 ) ] ; /* Expected fetched values */

  if ( seq . length !== expect . length ) {
    return false ; /* Check if lengths differ */
  }

  for ( var i = 0 , len = seq . length ; i < len ; i++ ) { /* Iterate and compare each element */
    if ( seq [ i ] !== expect [ i ] ) {
      return false ; /* If elements don't match, return false */
    }
  }

  return true ; /* If all elements match, return true */

} ) ( ) , '.sequence gets correct values with array of values' ) ; /* Assertion message */

var newRow = { /* Define a new row object to be inserted */
  id         : 6 ,
  first_name : 'Rob' ,
  last_name  : 'Stark' ,
  gender     : 'm' ,
  age        : 14 ,
  location   : 'Winterfell'
} ;

dc . insert ( newRow ) ; /* Insert the new row into the DataCollection */

console . assert ( ( function ( ) { /* Test if the inserted data is a non-referential copy */
  var newResult = dc . query ( ) . last ( ) ; /* Get the last (newly inserted) record */
  return newResult !== newRow ; /* Check if the returned object is not the same instance as the original newRow */
} ) ( ) , 'Inserted data is not referential, awesome!' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test if the inserted data contains the correct values */
  var newResult = dc . query ( ) . last ( ) ; /* Get the last (newly inserted) record */
  var keys , key ;
  keys = Object . keys ( newRow ) ; /* Get all keys from the original newRow */
  for ( var i = 0 , len = keys . length ; i < len ; i++ ) { /* Iterate through each key */
    key = keys [ i ] ;
    if ( newResult [ key ] !== newRow [ key ] ) { /* Compare values for each key */
      return false ; /* If any value mismatches, return false */
    }
  }
  return true ; /* If all values match, return true */
} ) ( ) , 'Insert added correct data' ) ; /* Assertion message */

var updateRow = { /* Define an update row object with the same ID as an existing record */
  id       : 6 ,
  location : 'Winterfull'
} ;

dc . insert ( updateRow ) ; /* Insert the update row, which should overwrite existing data for ID 6 */

console . assert ( dc . query ( ) . count ( ) === 6 , 'Duplicate id inserted to replace old one' ) ; /* Verify count is 6 (original 5 + 1 new, replacing the old ID 6) */

console . assert ( dc . query ( ) . last ( ) . location === 'Winterfull' , 'Duplicate id overwrote old data' ) ; /* Verify that the 'location' field was updated */

console . assert ( dc . query ( ) . last ( ) . first_name === 'Rob' , '.insert kept old data that wasn\'t overwritten' ) ; /* Verify that other fields not specified in updateRow were retained */

console . assert ( dc . query ( ) . last ( ) . is_bastard === false , 'Mapping worked for new row' ) ; /* Verify that the 'is_bastard' mapping was applied correctly to the updated row */

console . assert ( dc . destroy ( 6 ) . first_name === 'Rob' , 'Destroy returned correct row' ) ; /* Destroy the record with ID 6 and verify the returned row's first_name */

console . assert ( dc . query ( ) . count ( ) === 5 , 'Destroy eliminated record' ) ; /* Verify that the collection count is reduced after destruction */

dc . truncate ( ) ; /* Truncate (empty) the entire DataCollection */

console . assert ( dc . query ( ) . count ( ) === 0 , 'Truncation succeeded' ) ; /* Verify that the collection count is 0 after truncation */

dc . load ( characters ) ; /* Load the original character data back into the DataCollection */

console . assert ( dc . query ( ) . count ( ) === 5 , 'External load succeeded' ) ; /* Verify that the collection count is 5 after external load */

console . assert ( ( function ( ) { /* Test for the .each method */
  var ok = true ; /* Flag to track if all checks pass */
  var cur , keys , key ;
  var result = dc . query ( ) . values ( ) ; /* Get all values from the collection */
  dc . query ( ) . each ( function ( row , i ) { /* Iterate through each row using .each */
    if ( ! ok ) {
      return
    } /* If a check failed previously, skip further iterations */
    var cur = characters [ i ] ; /* Get the corresponding character from the original array */
    var keys = Object . keys ( cur ) ; /* Get keys of the current character */
    for ( var j = 0 , jlen = keys . length ; j < jlen ; j++ ) { /* Iterate through keys */
      key = keys [ j ] ;
      if ( cur [ key ] !== result [ i ] [ key ] ) {
        ok = false ; /* If values don't match, set ok to false */
      }
    }
  } ) ;
  return ok ; /* Return the final status of ok */
} ) ( ) , '.each executed properly' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  first_name : 'Jon'
} ) . count ( ) === 1 , 'Filter __is gave correct number of rows' ) ; /* Test for basic equality filter */

console . assert ( dc . query ( ) . filter ( {
  first_name : 'Jon'
} ) . first ( ) . first_name === 'Jon' , 'Filter __is worked' ) ; /* Test for basic equality filter returning correct data */

console . assert ( dc . query ( ) . filter ( {
  first_name__not : 'Jon'
} ) . count ( ) === 4 , 'Filter __not gave correct number of rows' ) ; /* Test for 'not equal' filter count */

console . assert ( ( function ( ) { /* Test for 'not equal' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    first_name__not : 'Jon'
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( row . first_name !== 'Jon' ) ; /* Verify each row's first_name is not 'Jon' */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __not worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  age__gt : 33
} ) . count ( ) === 2 , 'Filter __gt gave correct number of rows' ) ; /* Test for 'greater than' filter count */

console . assert ( ( function ( ) { /* Test for 'greater than' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    age__gt : 33
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( row . age > 33 ) ; /* Verify each row's age is greater than 33 */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __gt worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  age__gte : 33
} ) . count ( ) === 3 , 'Filter __gte gave correct number of rows' ) ; /* Test for 'greater than or equal to' filter count */

console . assert ( ( function ( ) { /* Test for 'greater than or equal to' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    age__gte : 33
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( row . age >= 33 ) ; /* Verify each row's age is greater than or equal to 33 */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __gte worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  age__lt : 33
} ) . count ( ) === 2 , 'Filter __lt gave correct number of rows' ) ; /* Test for 'less than' filter count */

console . assert ( ( function ( ) { /* Test for 'less than' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    age__lt : 33
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( row . age < 33 ) ; /* Verify each row's age is less than 33 */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __lt worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  age__lte : 33
} ) . count ( ) === 3 , 'Filter __lte gave correct number of rows' ) ; /* Test for 'less than or equal to' filter count */

console . assert ( ( function ( ) { /* Test for 'less than or equal to' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    age__lte : 33
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( row . age <= 33 ) ; /* Verify each row's age is less than or equal to 33 */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __lte worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  first_name__icontains : 'R'
} ) . count ( ) === 3 , 'Filter __icontains gave correct number of rows' ) ; /* Test for 'case-insensitive contains' filter count */

console . assert ( ( function ( ) { /* Test for 'case-insensitive contains' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    first_name__icontains : 'R'
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( row . first_name . toLowerCase ( ) . indexOf ( 'R' . toLowerCase ( ) ) > -1 ) ; /* Verify each row's first_name contains 'R' (case-insensitive) */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __icontains worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  first_name__contains : 'R'
} ) . count ( ) === 2 , 'Filter __contains gave correct number of rows' ) ; /* Test for 'case-sensitive contains' filter count */

console . assert ( ( function ( ) { /* Test for 'case-sensitive contains' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    first_name__contains : 'R'
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( row . first_name . indexOf ( 'R' ) > -1 ) ; /* Verify each row's first_name contains 'R' (case-sensitive) */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __contains worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  first_name__in : [ 'Catelyn' , 'Eddard' ]
} ) . count ( ) === 2 , 'Filter __in gave correct number of rows' ) ; /* Test for 'in array' filter count */

console . assert ( ( function ( ) { /* Test for 'in array' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    first_name__in : [ 'Catelyn' , 'Eddard' ]
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = [ 'Catelyn' , 'Eddard' ] . indexOf ( row . first_name ) > -1 ; /* Verify each row's first_name is in the specified array */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __in worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  first_name__not_in : [ 'Catelyn' , 'Eddard' ]
} ) . count ( ) === 3 , 'Filter __not_in gave correct number of rows' ) ; /* Test for 'not in array' filter count */

console . assert ( ( function ( ) { /* Test for 'not in array' filter logic */
  var ok = true ;
  dc . query ( ) . filter ( {
    first_name__not_in : [ 'Catelyn' , 'Eddard' ]
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = [ 'Catelyn' , 'Eddard' ] . indexOf ( row . first_name ) === -1 ; /* Verify each row's first_name is NOT in the specified array */
  } ) ;
  return ok ;
} ) ( ) , 'Filter __not_in worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . exclude ( {
  first_name__not_in : [ 'Catelyn' , 'Eddard' ]
} ) . count ( ) === 2 , 'Exclude gave correct number of rows' ) ; /* Test for 'exclude' operation count */

console . assert ( ( function ( ) { /* Test for 'exclude' operation logic */
  var ok = true ;
  dc . query ( ) . exclude ( {
    first_name__not_in : [ 'Catelyn' , 'Eddard' ]
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = [ 'Catelyn' , 'Eddard' ] . indexOf ( row . first_name ) > -1 ; /* Verify each row's first_name IS in the specified array (exclude is inverse of filter) */
  } ) ;
  return ok ;
} ) ( ) , 'Exclude worked' ) ; /* Assertion message */

console . assert ( ( function ( ) { /* Test for 'filter with OR' logic (separated values) */
  var ok = true ;
  dc . query ( ) . filter ( {
    first_name__in : [ 'Catelyn' , 'Eddard' ]
  } , {
    age__in : [ 15 , 40 ]
  } ) . each ( function ( row ) {
    if ( ! ok ) {
      return ;
    }
    ok = ( [ 'Catelyn' , 'Eddard' ] . indexOf ( row . first_name ) > -1 || [ 15 , 40 ] . indexOf ( row . age ) > -1 ) ; /* Verify each row matches either condition */
  } ) ;
  return ok ;
} ) ( ) , 'Filter with OR (separated values) worked' ) ; /* Assertion message */

console . assert ( dc . query ( ) . filter ( {
  first_name__in : [ 'Catelyn' , 'Eddard' ]
} , {
  age__in : [ 15 , 40 ]
} ) . count ( ) === 4 , 'Filter with OR (separated objects) gave correct number of rows' ) ; /* Test for 'filter with OR' count */

console . assert ( ( function ( ) { /* Test if 'filter with OR' yields same results as '__in' for same field */
  var first = dc . query ( ) . filter ( {
    age : 15
  } , {
    age : 40
  } , {
    age : 33
  } ) . values ( ) ; /* Filter by age using OR conditions */
  var second = dc . query ( ) . filter ( {
    age__in : [ 15 , 40 , 33 ]
  } ) . values ( ) ; /* Filter by age using __in operator */
  if ( first . length !== second . length ) {
    return false ; /* Check if lengths differ */
  }
  for ( var i = 0 , len = first . length ; i < len ; i++ ) { /* Iterate and compare each element */
    if ( first [ i ] !== second [ i ] ) {
      return false ; /* If elements don't match, return false */
    }
  }
  return true ; /* If all elements match, return true */
} ) ( ) , 'Filter with OR gave same values as __in for same field' ) ; /* Assertion message */

var dcSpawn = dc . query ( ) . spawn ( ) ; /* Spawn a new DataCollection instance from the current query result */

console . assert ( dcSpawn instanceof DataCollection , 'Spawned DataCollection is an instance of DataCollection' ) ; /* Verify the spawned object is a DataCollection instance */

console . assert ( dcSpawn . query ( ) . count ( ) === dc . query ( ) . count ( ) , 'Spawned DataCollection has identical count' ) ; /* Verify the spawned collection has the same number of records as its parent */

console . assert ( dcSpawn . query ( ) . filter ( {
  id : 1
} ) . first ( ) !== dc . query ( ) . filter ( {
  id : 1
} ) . first ( ) , 'Spawned DataCollection is not referential to parent' ) ; /* Verify that records in the spawned collection are not referential to the parent's records */

console . assert ( ( function ( ) { /* Test if spawned collection data corresponds to parent's data (non-referential copy) */
  var ok = true ;
  dcSpawn . query ( ) . each ( function ( row , i ) {
    if ( ! ok ) {
      return ;
    }
    ok = dc . query ( ) . filter ( row ) . count ( ) === 1 ; /* For each row in spawned, check if it exists in parent */
  } )
  return ok ;
} ) ( ) , 'Spawned Data Collection does corresponds with parent values (potential filter failure on fail)' ) ; /* Assertion message */

console . assert ( dcSpawn . query ( ) . filter ( {
    first_name : 'Ramsay'
  } ) . update ( {
    last_name : 'Bolton'
  } ) && /* Update Ramsay's last name in the spawned collection */
  ( dcSpawn . query ( ) . filter ( {
    first_name : 'Ramsay'
  } ) . first ( ) . last_name === 'Bolton' ) , 'Update succeeded' ) ; /* Verify the update was successful in the spawned collection */

console . assert ( dcSpawn . query ( ) . filter ( {
    first_name__in : [ 'Eddard' , 'Catelyn' ]
  } ) . remove ( ) && /* Remove specific rows from the spawned collection */
  dcSpawn . query ( ) . filter ( {
    first_name__in : [ 'Eddard' , 'Catelyn' ]
  } ) . count ( ) === 0 , 'Remove got rid of expected rows' ) ; /* Verify the rows were removed from the spawned collection */

var dcSpawn2 = dc . query ( ) . spawn ( true ) ; /* Spawn another DataCollection, explicitly ignoring the index */

console . assert ( dcSpawn2 . __index === null , 'Spawn with ignoreIndex successfully removed index' ) ; /* Verify that the spawned collection has no index */
console . assert ( dcSpawn2 . query ( ) . filter ( {
  id__not : 1
} ) . remove ( ) && dcSpawn2 . query ( ) . count ( ) === 1 , 'Spawn without index removed rows successfully.' ) ; /* Remove all but ID 1 and verify count in spawned2 */

console . assert ( dc . query ( ) . sort ( 'age' ) . first ( ) . first_name === 'Jon' , 'sort has correct first value (ASC)' ) ; /* Test ascending sort by 'age' - first element */
console . assert ( dc . query ( ) . sort ( 'age' ) . last ( ) . first_name === 'Roose' , 'sort has correct last value (ASC)' ) ; /* Test ascending sort by 'age' - last element */

console . assert ( dc . query ( ) . sort ( 'age' , true ) . first ( ) . first_name === 'Roose' , 'sort has correct first value (DESC)' ) ; /* Test descending sort by 'age' - first element */
console . assert ( dc . query ( ) . sort ( 'age' , true ) . last ( ) . first_name === 'Jon' , 'sort has correct last value (DESC)' ) ; /* Test descending sort by 'age' - last element */

console . assert ( dc . query ( ) . max ( 'age' ) === 40 , 'Max gives correct value' ) ; /* Test for 'max' value of 'age' */

console . assert ( dc . query ( ) . min ( 'age' ) === 14 , 'Min gives correct value' ) ; /* Test for 'min' value of 'age' */

console . assert ( dc . query ( ) . sum ( 'age' ) === ( 14 + 15 + 33 + 35 + 40 ) , 'Sum gives correct value' ) ; /* Test for 'sum' of 'age' values */

console . assert ( dc . query ( ) . avg ( 'age' ) === ( ( 14 + 15 + 33 + 35 + 40 ) / 5 ) , 'Avg gives correct value' ) ; /* Test for 'average' of 'age' values */

console . assert ( dc . query ( ) . reduce ( 'age' , function ( prev , cur ) {
  return prev + cur ;
} ) === ( 14 + 15 + 33 + 35 + 40 ) , 'Reduce gives correct value' ) ; /* Test for 'reduce' operation on 'age' */

console . assert ( dc . query ( ) . distinct ( 'location' ) . length === 2 , 'Distinct gives correct number of distinct values' ) ; /* Test for 'distinct' values of 'location' */

console . assert ( dc . query ( ) . limit ( 2 ) . count ( ) === 2 , 'Limit gives correct set size' ) ; /* Test for 'limit' operation to restrict result set size */