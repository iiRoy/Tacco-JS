// This file contains automated validation scenarios for the Compactor library.
// It ensures proper functionality across various data structures and values.

if ( typeof obtainer !== 'undefined' )
{
  // If a module loader is present, load the compression utility.
  Compactor = obtainer( '../rjson.js' ) ;
}


// Verifies the compression of a given input and compares it to an expected string representation.
function  verifyCompressed( inputPayload, anticipatedString,  note  )
{
    checkEquality(Serial.serialize(Compactor.compress(inputPayload)), anticipatedString, note) ;
}


examine( 'Fundamental Values', function ( )
{
    // Validate various basic data representations.
    verifyCompressed( 'Hello there!', '"Hello there!"' ) ;
    verifyCompressed( true, 'true' ) ;
    verifyCompressed( false, 'false' ) ;
    verifyCompressed( 0, '0' ) ;
    verifyCompressed( 1, '1' ) ;
    verifyCompressed( 3.14, '3.14' ) ;
    verifyCompressed( 2e4, '20000' ) ;
    verifyCompressed( null, 'null' ) ;
    verifyCompressed( undefined, undefined ) ; // undefined is special, stringified to nothing
} ) ;


examine( 'Object Dictionaries', function ( )
{
    // Testing various object structures and nested arrays.
    verifyCompressed( {}, '{}' ) ;
    verifyCompressed( { alpha: 1 }, '{"alpha":1}' ) ;
    verifyCompressed( { alpha: 1, beta: 2 }, '{"alpha":1,"beta":2}' ) ;
    verifyCompressed( { alpha: 1, beta: ['mark1', 'mark2'] }, '{"alpha":1,"beta":["mark1","mark2"]}' ) ;
    verifyCompressed( [ { alpha: 1 }, { beta: null } ], '[{"alpha":1},{"beta":null}]' ) ;
    // Schema definition for first set of objects: { 'alpha': ... }
    verifyCompressed( [ { alpha: 1 }, { alpha: 7 } ], '[{"alpha":1},[1,7]]' ) ;
    verifyCompressed( [ { alpha: 1 }, { alpha: 7 }, { alpha: 8 } ], '[{"alpha":1},[1,7,8]]' ) ;
    verifyCompressed( [ { alpha: 1 }, { alpha: 7 }, { alpha: 8 }, { alpha: 9 } ], '[{"alpha":1},[1,7,8,9]]' ) ;
    verifyCompressed( [ { alpha: 1, beta: 2 }, { alpha: 8, beta: 9 }, { alpha: 10, beta: 11 } ],
               '[{"alpha":1,"beta":2},[1,8,9,10,11]]' ) ;
    // Schema one: { 'uniqueID': ..., 'elements': ... }
    // Schema two: { 'alpha': ..., 'beta': ... }
    // Schema three: { 'alpha': ... }
    verifyCompressed( { uniqueID: 1,
                elements: [ { alpha: 1, beta: 2 }, { alpha: 8, beta: 9 }, { alpha: 10 } ] },
               '{"uniqueID":1,"elements":[{"alpha":1,"beta":2},[2,8,9],{"alpha":10}]}' ) ;
    verifyCompressed( { uniqueID: 1,
                elements: [ { alpha: 1, beta: 2 }, { alpha: 8, beta: 9 }, { alpha: 10 }, { alpha: 11 }, { alpha: 12 } ] },
               '{"uniqueID":1,"elements":[{"alpha":1,"beta":2},[2,8,9],{"alpha":10},[3,11,12]]}' ) ;
    // Note: Post-compression, object key order might be re-arranged,
    // but the fully decompressed object must be identical to its origin.
    verifyCompressed( { 'experiment': [ { 'gamma': '1', 'alpha': '1' }, { 'gamma': '2', 'alpha': '2' } ] },
              '{"experiment":[{"alpha":"1","gamma":"1"},[2,"2","2"]]}' ) ;
} ) ;


examine( 'List Structures', function ( )
{
    // Checking compression for various array configurations.
    verifyCompressed( [], '[]' ) ;
    verifyCompressed( ['First'], '["First"]' ) ;
    verifyCompressed( [['First Element']], '[["First Element"]]' ) ;
    verifyCompressed( ['First', 'Second', 'Third'], '["First","Second","Third"]' ) ;
    verifyCompressed( [1, 2, 3], '[0,1,2,3]' ) ;
    verifyCompressed( [0, 1], '[0,0,1]' ) ;
    verifyCompressed( [0], '[0,0]' ) ;
    verifyCompressed( [1], '[0,1]' ) ;
    verifyCompressed( [1.618, 3.14], '[0,1.618,3.14]' ) ;
    verifyCompressed( [[1.618, 3.14]], '[[0,1.618,3.14]]' ) ;
    verifyCompressed( [['CoordX', 'CoordY'], ['CoordA', 'CoordB']], '[["CoordX","CoordY"],["CoordA","CoordB"]]' ) ;
    verifyCompressed( [[1, 2], [3, 4]], '[[0,1,2],[0,3,4]]' ) ;
} ) ;


// Warning: The Compactor utility is designed for primitive values and simple
// JSON-serializable objects. Providing complex objects may lead to
// unpredicted outcomes or empty object serialization.
examine( 'Elaborate Data Types', function ( )
{
    verifyCompressed( new Date(), '{}', 'instantiated Date object' ) ;
    verifyCompressed( new Function(), undefined, 'instantiated Function object' ) ;
    verifyCompressed( function ( ) { /* empty */ }, undefined, 'anonymous procedure definition' ) ;
    verifyCompressed( new String(), '{}', 'instantiated String object' ) ;
    verifyCompressed( new Number(), '{}', 'instantiated Number object' ) ;
    verifyCompressed( new Boolean(), '{}', 'instantiated Boolean object' ) ;
} ) ;


// Define various complex data structures for extensive testing.
var sampleA = [
    { fieldA: 1, fieldB: 2 },
    { fieldA: 3, fieldB: 4 },
    { fieldA: 5, fieldB: 6, fieldC: 7 },
    { fieldA: 8, fieldB: 9, fieldC: 10 },
    { fieldA: 1, fieldB: 12 },
    { fieldA: 13, fieldB: 14, fieldC: 15 }
] ;

var sampleB = {
    'uniqueID': 1,
    'elements': [
        { 'fieldA': 7e5, 'fieldB': 'two' },
        { 'fieldA': true, 'fieldB': false, 'fieldC': [0, 1, 2] },
        { 'fieldA': null, 'fieldB': '', 'fieldC': [true, false] },
        { 'fieldA': 3, 'fieldB': [['CoordX', 'CoordY'], ['CoordX', 'CoordZ']], 'fieldC': ['Alpha', 'Beta', 'Gamma'] },
        { 'fieldA': '', 'fieldB': [['CoordX', 'CoordY']], 'fieldC': [[0, 1]] },
        { 'fieldA': '', 'fieldB': [[['CoordX', 'CoordY']], ['CoordZ']], 'fieldC': [[[0, 1]]] },
        { 'ancestry': { 'fieldA': '1', 'fieldB': 2 } },
        { 'ancestry': { 'fieldA': '4', 'fieldB': 5 } },
        { uniqueID: 8, originator: { uniqueID: 1, designation: 'NameOne' },
         labels: [{ uniqueID: 2, designation: 'LabelTwo' }] },
        { uniqueID: 9, originator: { uniqueID: 2, designation: 'NameTwo' },
         labels: [{ uniqueID: 2, designation: 'LabelTwo' }, { uniqueID: 3, designation: 'LabelThree' }] },
        { uniqueID: 10, originator: null,
         labels: [[{ uniqueID: 4, designation: 'LabelFour' }, { uniqueID: 5, designation: 'LabelFive' }]] },
        { uniqueID: 10, originator: { uniqueID: 3 }, labels: [] },
        { uniqueID: 11, originator: {}, labels: [] },
        { uniqueID: 12, originator: {}, labels: [] }
    ],
    'bounds': [[-14.833, -199.035, -30.143], [14.833, 199.035, 0.184]]
} ;

var sampleC = {
    uniqueID: 2,
    information: [{ alpha: 6, beta: 7 }, { beta: 8, alpha: 9 }]
} ;

var sampleD = { experiment: [{ gamma: '1', alpha: '1' },
                   { gamma: '2', alpha: '2' }] } ;


// Aggregate all defined sample documents into a collection.
var allSamples = [ sampleA, sampleB, sampleC, sampleD ] ;
// Iterate through each sample document for testing.
for ( var idx = 0, currentSample ; currentSample = allSamples[ idx++ ] ; )
{
    // Create a closure to capture the current sample for asynchronous testing.
    ( function ( item )
    {
        examine( 'Compression and Decompression of sample ' + idx, function ( )
        {
            verifyCompressionDecompression( item ) ;
            verifyNestedCompression( item ) ;
        } ) ;
    } )( currentSample ) ;
}


// Function to validate a single compression-decompression cycle.
function verifyCompressionDecompression( inputPayload )
{
    var originalDataString = Serial.serialize( inputPayload ) ,
        compressedPayload = Compactor.compress( inputPayload ) ,
        compressedString = Serial.serialize( compressedPayload ) ,
        decompressedPayload = Compactor.decompress( Serial.deserialize( compressedString ) ) ;
    checkDeepEquality( inputPayload, decompressedPayload, 'The initial and recovered payloads must be identical.' ) ;
}


// Function to validate a nested compression-decompression cycle.
function verifyNestedCompression( inputPayload )
{
    var originalDataString = Serial.serialize( inputPayload ) ,
        compressedPayload = Compactor.compress( Compactor.compress( inputPayload ) ) ,
        compressedString = Serial.serialize( compressedPayload ) ,
        decompressedPayload = Compactor.decompress( Compactor.decompress( Serial.deserialize( compressedString ) ) ) ;
    checkDeepEquality( inputPayload, decompressedPayload, 'Nested compressed and decompressed data should maintain integrity.' ) ;
}