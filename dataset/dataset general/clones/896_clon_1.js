/*
 * This file contains unit tests for the RJSON library.
 * It ensures the packing and unpacking functionality works as expected.
 *
 */

// Check if 'require' is defined, indicating a Node.js-like environment.
if ( typeof require    !==    'undefined' )
{
  RJSON  =  require( '../rjson.js' ); /* Assign the RJSON module */
}


/**
 * Helper function to test the packing of a given data structure.
 * It compares the JSON stringified packed output with an expected string.
 *
 * @param {any} data - The input data to be packed.
 * @param {string} expectedStr - The expected JSON string representation after packing.
 * @param {string} message - A descriptive message for the test assertion.
 */
function     testPacked(  data   ,   expectedStr   ,   message  )
{
    // Perform the equality check using the 'equal' assertion function.
    equal(  JSON.stringify(  RJSON.pack(  data  )  )   ,   expectedStr   ,   message  ) ;
}


// Test block for primitive data types.
test( 'Primitives' , function ( )
{

  testPacked(  'Hello!'  ,  '"Hello!"'  ) ;
  testPacked(  true  	,  'true'  ) ;
  testPacked(  false  ,  'false'  ) ;
  testPacked(  0  ,  '0'  ) ;
    testPacked(  1  ,  '1'  ) ;
  testPacked(  3.14  ,  '3.14'  ) ;
    testPacked(  2e4  ,  '20000'  ) ;
  testPacked(  null  ,  'null'  ) ;

    // Note: undefined values are often treated specially or omitted in JSON.
  testPacked(  undefined  ,  undefined  ) ;

} ) ;


/* Test suite for JavaScript object literals (hashmaps). */
test( 'Hashmaps' , function ( )
{

  testPacked(  {  }  ,  '{}'  ) ;
  testPacked(  {  a:    1  }  ,  '{"a":1}'  ) ;
  testPacked(  {  a:    1  ,  b:    2  }  ,  '{"a":1,"b":2}'  ) ;
  testPacked(  {  a:    1  ,  b:    [ 'tag1'  ,  'tag2' ]  }  ,  '{"a":1,"b":["tag1","tag2"]}'  ) ;
  testPacked(  [ {  a:    1  }  ,  {  b:    null  } ]  ,  '[{"a":1},{"b":null}]'  ) ;

    // Test case demonstrating schema reuse: schema 1 is {'a': ...}
  testPacked(  [ {  a:    1  }  ,  {  a:    7  } ]  ,  '[{"a":1},[1,7]]'  ) ;
  testPacked(  [ {  a:    1  }  ,  {  a:    7  }  ,  {  a:    8  } ]  ,  '[{"a":1},[1,7,8]]'  ) ;
  testPacked(  [ {  a:    1  }  ,  {  a:    7  }  ,  {  a:    8  }  ,  {  a:    9  } ]  ,  '[{"a":1},[1,7,8,9]]'  ) ;
  testPacked(  [ {  a:    1  ,  b:    2  }  ,  {  a:    8  ,  b:    9  }  ,  {  a:    10  ,  b:    11  } ]  ,
                 '[{"a":1,"b":2},[1,8,9,10,11]]'  ) ;

    // Advanced schema reuse scenarios:
    // schema 1 is {'id': ..., 'items': ...}
    // schema 2 is {'a': ..., 'b': ...}
    // schema 3 is {'a': ...}
  testPacked(  {  id:    1  ,
                     items:    [ {  a:    1  ,  b:    2  }  ,  {  a:    8  ,  b:    9  }  ,  {  a:    10  } ]  }  ,
                 '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10}]}'  ) ;
  testPacked(  {  id:    1  ,
                     items:    [ {  a:    1  ,  b:    2  }  ,  {  a:    8  ,  b:    9  }  ,  {  a:    10  }  ,  {  a:    11  }  ,  {  a:    12  } ]  }  ,
                 '{"id":1,"items":[{"a":1,"b":2},[2,8,9],{"a":10},[3,11,12]]}'  ) ;

    // Important note: After packing, the order of keys in objects might change.
    // However, the restored document must be fully identical to the original.
  testPacked(  {  'test':    [ {  'b':    '1'  ,  'a':    '1'  }  ,  {  'b':    '2'  ,  'a':    '2'  } ]  }  ,
                '{"test":[{"a":"1","b":"1"},[2,"2","2"]]}'  ) ;

} ) ;


// Array packing tests.
test(  'Arrays'  ,  function ( )
{
            testPacked(  [  ]  ,  '[]'  ) ;
        testPacked(  [ 'A' ]  ,  '["A"]'  ) ;
    testPacked(  [ [ 'A' ] ]  ,  '[["A"]]'  ) ;
  testPacked(  [ 'A'  ,  'B'  ,  'C' ]  ,  '["A","B","C"]'  ) ;

  testPacked(  [ 1  ,  2  ,  3 ]  ,  '[0,1,2,3]'  ) ;
  testPacked(  [ 0  ,  1 ]  ,  '[0,0,1]'  ) ;
  testPacked(  [ 0 ]  ,  '[0,0]'  ) ;
  testPacked(  [ 1 ]  ,  '[0,1]'  ) ;

  testPacked(  [ 1.618  ,  3.14 ]  ,  '[0,1.618,3.14]'  ) ;
  testPacked(  [ [ 1.618  ,  3.14 ] ]  ,  '[[0,1.618,3.14]]'  ) ;

  testPacked(  [ [ 'X'  ,  'Y' ]  ,  [ 'A'  ,  'B' ] ]  ,  '[["X","Y"],["A","B"]]'  ) ;
  testPacked(  [ [ 1  ,  2 ]  ,  [ 3  ,  4 ] ]  ,  '[[0,1,2],[0,3,4]]'  ) ;
} ) ;


/*
 * IMPORTANT: RJSON.pack is designed for primitive values and plain objects.
 * Sending complex, non-serializable objects (like instances of Date, Function, etc.)
 * may lead to unexpected or empty results, as demonstrated below.
 */
test(  'Complex values'  ,  function ( )
{
    testPacked(  new Date( )  ,  '{}'  ,  'new Date'  ) ;
    testPacked(  new Function( )  ,  undefined  ,  'new Function'  ) ;
    testPacked(  function ( ) {  }  ,  undefined  ,  'function () {}'  ) ;
    testPacked(  new String( )  ,  '{}'  ,  'new String'  ) ;
    testPacked(  new Number( )  ,  '{}'  ,  'new Number'  ) ;
    testPacked(  new Boolean( )  ,  '{}'  ,  'new Boolean'  ) ;
} ) ;


// Define various complex documents for comprehensive packing/unpacking tests.

var    doc1    =
  [
    {  key1:    1  ,  key2:    2  }  ,
    {  key1:    3  ,  key2:    4  }  ,
    {  key1:    5  ,  key2:    6  ,  key3:    7  }  ,
    {  key1:    8  ,  key2:    9  ,  key3:    10  }  ,
    {  key1:    1  ,  key2:    12  }  ,
    {  key1:    13  ,  key2:    14  ,  key3:    15  }
  ] ;

var    doc2    =
  {
    'id':    1  ,
    'items':    [
      { 'key1':    7e5  ,  'key2':    'two' }  ,
      { 'key1':    true  ,  'key2':    false  ,  'key3':    [ 0  ,  1  ,  2 ] }  ,
      { 'key1':    null  ,  'key2':    ''  ,  'key3':    [ true  ,  false ] }  ,
      { 'key1':    3  ,  'key2':    [ [ 'X'  ,  'Y' ]  ,  [ 'X'  ,  'Z' ] ]  ,  'key3':    [ 'A'  ,  'B'  ,  'C' ] }  ,
      { 'key1':    ''  ,  'key2':    [ [ 'X'  ,  'Y' ] ]  ,  'key3':    [ [ 0  ,  1 ] ] }  ,
      { 'key1':    ''  ,  'key2':    [ [ [ 'X'  ,  'Y' ] ]  ,  [ 'Z' ] ]  ,  'key3':    [ [ [ 0  ,  1 ] ] ] }  ,
      { 'parent':    { 'key1':    '1'  ,  'key2':    2 } }  ,
      { 'parent':    { 'key1':    '4'  ,  'key2':    5 } }  ,
      {  id:    8  ,  creator:    {  id:    1  ,  name:    'Name1'  }  ,
         tags:    [ {  id:    2  ,  name:    'Tag2'  } ]  }  ,
      {  id:    9  ,  creator:    {  id:    2  ,  name:    'Name2'  }  ,
         tags:    [ {  id:    2  ,  name:    'Tag2'  }  ,  {  id:    3  ,  name:    'Tag3'  } ]  }  ,
      {  id:    10  ,  creator:    null  ,
         tags:    [ [ {  id:    4  ,  name:    'Tag4'  }  ,  {  id:    5  ,  name:    'Tag5'  } ] ]  }  ,
      {  id:    10  ,  creator:    {  id:    3  }  ,  tags:    [  ]  }  ,
      {  id:    11  ,  creator:    {  }  ,  tags:    [  ]  }  ,
      {  id:    12  ,  creator:    {  }  ,  tags:    [  ]  }
    ]  ,
    'box':    [ [ -14.833  ,  -199.035  ,  -30.143 ]  ,  [ 14.833  ,  199.035  ,  0.184 ] ]
  } ;

var    doc3    =
  {
    id:    2  ,
    data:    [ {  a:    6  ,  b:    7  }  ,  {  b:    8  ,  a:    9  } ]
  } ;

var    doc4    =
  {  test:    [ {  b:    '1'  ,  a:    '1'  }  ,
                   {  b:    '2'  ,  a:    '2'  } ]  } ;


// Array of all documents to be tested in a loop.
var    docs    =  [ doc1  ,  doc2  ,  doc3  ,  doc4 ] ;

// Loop through each document and perform packing/unpacking tests.
for ( var    i    =    0  ,  doc ;  doc    =    docs[ i++ ] ;  )
{
    // Use an IIFE (Immediately Invoked Function Expression) to capture the current 'doc' value.
    (  function(  d  )
    {
        test(  'Packing and unpacking of doc'  +  i  ,  function ( )
        {
            // Test single pack and unpack cycle.
            testPackAndUnpack(  d  ) ;
            // Test double pack and unpack cycle for robustness.
            testDoublePackAndUnpack(  d  ) ;
        }  ) ;
    }  ) ( doc ) ; // Invoke the function with the current document.
}


/**
 * Tests a single cycle of RJSON packing and unpacking.
 * Verifies that the unpacked data is deeply equal to the original data.
 *
 * @param {any} data - The data structure to test.
 */
function    testPackAndUnpack(  data  )
{
    var    dataStr    =  JSON.stringify(  data  )  , // Original data as string
        packed    =  RJSON.pack(  data  )  , // RJSON packed data
        packedStr    =  JSON.stringify(  packed  )  , // Packed data as JSON string
        unpacked    =  RJSON.unpack(  JSON.parse(  packedStr  )  ) ; // Unpacked data after parsing the packed string

    // Assert deep equality between original and unpacked data.
    deepEqual(  data  ,  unpacked  ,  'Original and unpacked data are identical.'  ) ;
}

/**
 * Tests a double cycle of RJSON packing and unpacking.
 * This checks the robustness of the RJSON process when applied multiple times.
 *
 * @param {any} data - The data structure to test.
 */
function    testDoublePackAndUnpack(  data  )
{
    var    dataStr    =  JSON.stringify(  data  )  , // Original data as string (for reference)
        packed    =  RJSON.pack(  RJSON.pack(  data  )  )  , // Data packed twice
        packedStr    =  JSON.stringify(  packed  )  , // Double packed data as JSON string
        unpacked    =  RJSON.unpack(  RJSON.unpack(  JSON.parse(  packedStr  )  )  ) ; // Double unpacked data

    // Assert deep equality for the double cycle.
    deepEqual(  data  ,  unpacked  ,  'Double packed and unpacked data are ok.'  ) ;
}