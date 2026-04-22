/*
 * This file contains a comprehensive suite of tests for the Hexastore data structure.
 * It covers initialization, creation (put, add, addJSObject), read (query, search),
 * update (though no specific 'update' tests are present, 'put' and 'add' imply it),
 * import/export functionalities, and deletion.
 *
 * All tests are written using the Mocha testing framework and Chai assertion library.
 * Chai-fuzzy is also utilized for advanced assertions like containOneLike.
 */


    // Load the Chai assertion library
var     chai = require( 'chai' ) ;
    // Extend Chai with chai-fuzzy for advanced object comparison
chai.use( require( 'chai-fuzzy' ) ) ;

// Extract the 'assert' object for easier use in tests
var assert = chai.assert ;

    // Load the Node.js file system module for import/export tests
var fs = require( 'fs' ) ;


    // Load the Hexastore implementation from the local index.js file
var Hexastore = require( './index.js' ) ;


// Declare a variable to hold the Hexastore instance, to be initialized later
var db ;

// --- Test Suite: Initialization ---
describe( 'Initialize', function( ) {

        // Test case: Creating a new Hexastore instance
    it( 'create new hexastore', function( ) {
            // Ensure that creating a new Hexastore does not throw any errors
        assert.doesNotThrow( function( ) {
                db = new Hexastore( ) ; // Instantiate the Hexastore
            } ) ;
    } ) ;


        // Test case: Verifying that a newly created hexastore is empty
    it( 'new hexastore is empty', function( ) {
            // Assert that the size of the newly created hexastore is 0
        assert.equal( 0 , db.size( ) ) ;
    } ) ;

} ) ;


// --- Test Suite: Create Operations ---
describe( 'Create', function( ) {

        // Hook: Executed before each test in this 'Create' suite
    beforeEach( function( ) {
            // Clear the database to ensure a clean state for each test
        db.clear( ) ;
    } ) ;


        // Sub-suite: 'put' operations
    describe( 'put', function( ) {

            // Test case: Basic 'put' operation with a single triple
        it( 'put', function( ) {
                // Ensure that putting a triple does not throw an error
            assert.doesNotThrow( function( ) {
                    db.put( [ 'hello world' , 'is' , 'sentence' ] ) ;
                } ) ;

                // Assert that the database size is now 1
            assert.equal( 1 , db.size( ) ) ;
        } ) ;

            // Test case: 'putAll' operation with multiple triples
        it( 'putAll', function( ) {
                // Ensure that putting multiple triples does not throw an error
            assert.doesNotThrow( function( ) {
                    db.putAll( [
                        [ 'hey' , 'hey' , 'ho' ] ,
                        [ 'hey' , 'hay' , 'ho' ] ,
                        [ 'hey' , 'hey' , 'ha' ] ,
                        [ 'hey' , 'hey' , 'hon' ]
                    ] ) ;
                } ) ;
                // Assert that the database size reflects the number of added triples
            assert.equal( 4 , db.size( ) ) ;
        } ) ;
    } ) ;


        // Sub-suite: 'add' operations (for different index permutations)
    describe( 'add', function( ) {

            // Test case: addSPO (Subject-Predicate-Object)
        it( 'addSPO', function( ) {
                // Ensure adding an SPO structure does not throw an error
            assert.doesNotThrow( function( ) {
                    db.addSPO( {
                        'a' : {
                            'b' : {
                                'c' : true
                            }
                        }
                    } ) ;
                } ) ;
                // Verify the database size
            assert.equal( 1 , db.size( ) ) ;
                // Verify the content by retrieving it with getSPO
            assert.deepEqual( db.getSPO( ) , {
                'a' : {
                    'b' : {
                        'c' : true
                    }
                }
            } ) ;
        } ) ;

            // Test case: addSOP (Subject-Object-Predicate)
        it( 'addSOP', function( ) {
                // Ensure adding an SOP structure does not throw an error
            assert.doesNotThrow( function( ) {
                    db.addSOP( {
                        'aa' : {
                            'bb' : {
                                'cc' : true
                            }
                        }
                    } ) ;
                } ) ;
                // Verify the database size
            assert.equal( 1 , db.size( ) ) ;
                // Verify the content by retrieving it with getSOP
            assert.deepEqual( db.getSOP( ) , {
                'aa' : {
                    'bb' : {
                        'cc' : true
                    }
                }
            } ) ;
        } ) ;

            // Test case: addOSP (Object-Subject-Predicate)
        it( 'addOSP', function( ) {
                // Ensure adding an OSP structure does not throw an error
            assert.doesNotThrow( function( ) {
                    db.addOSP( {
                        'aaa' : {
                            'bbb' : {
                                'ccc' : true
                            }
                        }
                    } ) ;
                } ) ;
                // Verify the database size
            assert.equal( 1 , db.size( ) ) ;
                // Verify the content by retrieving it with getOSP
            assert.deepEqual( db.getOSP( ) , {
                'aaa' : {
                    'bbb' : {
                        'ccc' : true
                    }
                }
            } ) ;
        } ) ;

            // Test case: addOPS (Object-Predicate-Subject)
        it( 'addOPS', function( ) {
                // Ensure adding an OPS structure does not throw an error
            assert.doesNotThrow( function( ) {
                    db.addOPS( {
                        'aaaa' : {
                            'bbbb' : {
                                'cccc' : true
                            }
                        }
                    } ) ;
                } ) ;
                // Verify the database size
            assert.equal( 1 , db.size( ) ) ;
                // Verify the content by retrieving it with getOPS
            assert.deepEqual( db.getOPS( ) , {
                'aaaa' : {
                    'bbbb' : {
                        'cccc' : true
                    }
                }
            } ) ;
        } ) ;

            // Test case: addPSO (Predicate-Subject-Object)
        it( 'addPSO', function( ) {
                // Ensure adding a PSO structure does not throw an error
            assert.doesNotThrow( function( ) {
                    db.addPSO( {
                        'aaaaa' : {
                            'bbbbb' : {
                                'ccccc' : true
                            }
                        }
                    } ) ;
                } ) ;
                // Verify the database size
            assert.equal( 1 , db.size( ) ) ;
                // Verify the content by retrieving it with getPSO
            assert.deepEqual( db.getPSO( ) , {
                'aaaaa' : {
                    'bbbbb' : {
                        'ccccc' : true
                    }
                }
            } ) ;
        } ) ;

            // Test case: addPOS (Predicate-Object-Subject)
        it( 'addPOS', function( ) {
                // Ensure adding a POS structure does not throw an error
            assert.doesNotThrow( function( ) {
                    db.addPOS( {
                        'aaaaaa' : {
                            'bbbbbb' : {
                                'cccccc' : true
                            }
                        }
                    } ) ;
                } ) ;
                // Verify the database size
            assert.equal( 1 , db.size( ) ) ;
                // Verify the content by retrieving it with getPOS
            assert.deepEqual( db.getPOS( ) , {
                'aaaaaa' : {
                    'bbbbbb' : {
                        'cccccc' : true
                    }
                }
            } ) ;
        } ) ;
    } ) ;


        // Sub-suite: 'addJSObject' operations
    describe( 'addJSObject', function( ) {

            // Test case: Adding a JavaScript object as a path structure
        it( 'addJSObjectAsPath', function( ) {
                // Ensure adding the object does not throw an error
            assert.doesNotThrow( function( ) {
                    db.addJSObjectAsPath( {
                        know : "joe" ,
                        lol : {
                            wow : "hab"
                        } ,
                        a : 1
                    } , "bob" ) ; // Root subject 'bob'
                } ) ;
                // Verify the total size of the added triples
            assert.equal( 4 , db.size( ) ) ;
                // Check for specific triples using containOneLike (chai-fuzzy)
            assert.containOneLike( db.all( ) , [ 'bob' , 'know' , 'joe' , true ] ) ;
            assert.containOneLike( db.all( ) , [ 'bob' , 'a' , '1' , true ] ) ;
            assert.containOneLike( db.all( ) , [ 'bob/lol' , 'wow' , 'hab' , true ] ) ;
            assert.containOneLike( db.all( ) , [ 'bob' , 'lol' , 'bob/lol' , true ] ) ;

                // Test with a custom path separator
            assert.doesNotThrow( function( ) {
                    db.addJSObjectAsPath( {
                        a : {
                            b : 1
                        }
                    } , "bob" , ">" ) ; // Custom separator '>'
                } ) ;
                // Verify triples with custom separator
            assert.containOneLike( db.all( ) , [ 'bob' , 'a' , 'bob>a' , true ] ) ;
            assert.containOneLike( db.all( ) , [ 'bob>a' , 'b' , '1' , true ] ) ;
        } ) ;

            // Test case: Adding a JavaScript object as JSON strings
        it( 'addJSObjectAsJSON', function( ) {
            var added ; // Variable to store the subject of the added object
                // Ensure adding the object as JSON does not throw an error
            assert.doesNotThrow( function( ) {
                    added = db.addJSObjectAsJSON( {
                        know : "joe" ,
                        lol : {
                            wow : "hab"
                        } ,
                        a : 1
                    } ) ;
                } ) ;
                // Verify the total size of the added triples
            assert.equal( 4 , db.size( ) ) ;
                // Check for specific triples
            assert.containOneLike( db.all( ) , [ added , 'know' , 'joe' , true ] ) ;
            assert.containOneLike( db.all( ) , [ added , 'a' , '1' , true ] ) ;
                // Nested objects are stored as JSON strings
            assert.containOneLike( db.all( ) , [ added , 'lol' , '{"wow":"hab"}' , true ] ) ;
                // The JSON string itself becomes a subject for its properties
            assert.containOneLike( db.all( ) , [ '{"wow":"hab"}' , 'wow' , 'hab' , true ] ) ;
        } ) ;

            // Test case: Adding a JavaScript object with UUIDs as subjects for nested objects
        it( 'addJSObjectAsUUID', function( ) {
            var added ; // Variable to store the UUID of the added object
                // Ensure adding the object with UUIDs does not throw an error
            assert.doesNotThrow( function( ) {
                    added = db.addJSObjectAsUUID( {
                        know : "joe" ,
                        lol : {
                            wow : "hab"
                        } ,
                        a : 1
                    } ) ;
                } ) ;
                // Verify the total size of the added triples
            assert.equal( 4 , db.size( ) ) ;
                // Check for specific triples (UUIDs are generated, so we only check the predicate/object)
            assert.containOneLike( db.all( ) , [ added , 'know' , 'joe' , true ] ) ;
            assert.containOneLike( db.all( ) , [ added , 'a' , '1' , true ] ) ;
                // Note: The specific UUID for 'lol' isn't easily assertable here without knowing the generation logic.
        } ) ;
    } ) ;


        // Sub-suite: 'copy' operations
    describe( 'copy', function( ) {

            // Hook: Executed before each test in this 'copy' suite
        beforeEach( function( ) {
                // Clear and pre-populate the database for copy tests
            db.clear( ) ;
            db.putAll( [
                [ 'hey' , 'hey' , 'ho' ] ,
                [ 'hey' , 'hay' , 'ha' ] ,
                [ 'hi' , 'hey' , 'ha' ] ,
                [ 'hi' , 'hey' , 'hon' ]
            ] ) ;
        } ) ;


            // Test case: Copying triples based on a subject
        it( 'copySubject', function( ) {
                // Ensure copying subject 'hey' to 'bobie' does not throw an error
            assert.doesNotThrow( function( ) {
                    db.copySubject( "hey" , "bobie" ) ;
                } ) ;
                // Verify the copied triples exist for the new subject 'bobie'
            assert.containOneLike( db.all( ) , [ "bobie" , 'hey' , 'ho' , true ] ) ;
            assert.containOneLike( db.all( ) , [ "bobie" , 'hay' , 'ha' , true ] ) ;
        } ) ;

            // Test case: Copying triples based on a predicate
        it( 'copyPredicate', function( ) {
                // Ensure copying predicate 'hey' to 'bo' does not throw an error
            assert.doesNotThrow( function( ) {
                    db.copyPredicate( "hey" , "bo" ) ;
                } ) ;
                // Verify the copied triples exist for the new predicate 'bo'
            assert.containOneLike( db.all( ) , [ "hey" , 'bo' , 'ho' , true ] ) ;
            assert.containOneLike( db.all( ) , [ "hi" , 'bo' , 'ha' , true ] ) ;
            assert.containOneLike( db.all( ) , [ "hi" , 'bo' , 'hon' , true ] ) ;
        } ) ;

            // Test case: Copying triples based on an object
        it( 'copyObject', function( ) {
                // Ensure copying object 'ha' to 'lid' does not throw an error
            assert.doesNotThrow( function( ) {
                    db.copyObject( "ha" , "lid" ) ;
                } ) ;
                // Verify the copied triples exist for the new object 'lid'
            assert.containOneLike( db.all( ) , [ "hey" , 'hay' , 'lid' , true ] ) ;
            assert.containOneLike( db.all( ) , [ "hi" , 'hey' , 'lid' , true ] ) ;
        } ) ;
    } ) ;
} ) ;


// --- Test Suite: Read Operations ---
describe( 'Read', function( ) {

        // Sub-suite: 'query' operations
    describe( 'query', function( ) {

            // Hook: Executed once before all tests in this 'query' suite
        before( function( ) {
                // Clear and add a specific triple for query tests
            db.clear( ) ;
            db.addSPO( {
                'a' : {
                    'b' : {
                        'c' : true
                    }
                }
            } ) ;
        } ) ;

            // Test case: queryXXX (all parts specified)
        it( 'queryXXX', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryXXX( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: querySXX (Subject specified, Predicate/Object wildcard)
        it( 'querySXX', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.querySXX( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: queryXPX (Predicate specified, Subject/Object wildcard)
        it( 'queryXPX', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryXPX( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: queryXXO (Object specified, Subject/Predicate wildcard)
        it( 'queryXXO', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryXXO( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: querySPX (Subject and Predicate specified, Object wildcard)
        it( 'querySPX', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.querySPX( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: querySXO (Subject and Object specified, Predicate wildcard)
        it( 'querySXO', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.querySXO( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: queryXPO (Predicate and Object specified, Subject wildcard)
        it( 'queryXPO', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryXPO( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: querySPO (Subject, Predicate, and Object all specified)
        it( 'querySPO', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.querySPO( [ 'a' , 'b' , 'c' ] ) ) ;
        } ) ;

            // Test case: queryDispatch (testing various wildcard and array inputs)
        it( 'queryDispatch', function( ) {
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [ 'a' , 'b' , 'c' ] ) ) ;
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [
                [ 'a' ] , 'b' , 'c'
            ] ) ) ;
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [ 'a' , [ 'b' ] , 'c' ] ) ) ;
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [
                [ 'a' ] ,
                [ 'b' ] , 'c'
            ] ) ) ;
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [ 'a' , 'b' , [ 'c' ] ] ) ) ;
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [
                [ 'a' ] , 'b' , [ 'c' ]
            ] ) ) ;
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [ 'a' , [ 'b' ] ,
                [ 'c' ]
            ] ) ) ;
            assert.deepEqual( [
                [ 'a' , 'b' , 'c' , true ]
            ] , db.queryDispatch( [
                [ 'a' ] ,
                [ 'b' ] ,
                [ 'c' ]
            ] ) ) ;
        } ) ;
    } ) ;


        // Sub-suite: 'search' operations
    describe( 'search', function( ) {

            // Hook: Executed once before all tests in this 'search' suite
        before( function( done ) {
                // Import a larger dataset for search operations
            db.importNt( "smalltestdataset" , done ) ;
        } ) ;

            // Test case: Multiple search patterns with a filter
        it( 'multiple search with filter', function( ) {
            assert.equal( 72 ,
                db
                .search( [
                    [ "<bizer/bsbm/v01/instances/ProductType1>" , [ "predicate" ] ,
                        [ "object" ]
                    ] ,
                    [
                        [ "similar" ] ,
                        [ "predicate" ] ,
                        [ "object" ]
                    ]
                ] )
                .filter( function( match ) {
                    return match.object2 !== match.object ;
                } ).length ) ;
        } ) ;

            // Test case: Precise search
        it( 'precise search ' , function( ) {
            assert.equal( '<bizer/bsbm/v01/instances/StandardizationInstitution1>' ,
                db.search( [
                    [ "<bizer/bsbm/v01/instances/ProductType1>" , "<dc/elements/1.1/publisher>" , [ "publisher" ] ]
                ] ) [ 0 ] .publisher ) ;

        } ) ;
    } ) ;
} ) ;


// --- Test Suite: Update Operations (placeholder, implied by Create/Delete) ---
describe( 'Update', function( ) {
    // No specific 'Update' methods are directly exposed,
    // as 'put' and 'add' operations inherently handle updates if triples exist.
    // This block is kept for structural completeness.
} ) ;


// --- Test Suite: Import / Export Functionality ---
describe( 'Import / Export', function( ) {

        // Hook: Executed once before all tests in this 'Import / Export' suite
    before( function( ) {
            // Clear the database and add a sample triple for export
        db.clear( ) ;
        db.addSPO( {
            'aaa' : {
                'bbb' : {
                    'ccc' : true
                }
            }
        } ) ;
    } ) ;

        // Hook: Executed once after all tests in this 'Import / Export' suite
    after( function( ) {
            // Clean up generated test files
        fs.unlinkSync( "hexastoretest1.zip" ) ;
        fs.unlinkSync( "hexastoretest1.nt" ) ;
        fs.unlinkSync( "hexastoretest1.json" ) ;
    } ) ;

        // Test case: JSON export and import
    it( 'json', function( ) {
            // Ensure export and import operations do not throw errors
        assert.doesNotThrow( function( ) {
                db.exportJSON( 'hexastoretest1' ) ; // Export to JSON
                db.clear( ) ; // Clear the database
                db.importJSON( 'hexastoretest1' ) ; // Import from JSON
            } ) ;
            // Verify the database size after import
        assert.equal( 1 , db.size( ) ) ;
            // Verify the content after import
        assert.deepEqual( db.getSPO( ) , {
            'aaa' : {
                'bbb' : {
                    'ccc' : true
                }
            }
        } ) ;
    } ) ;

        // Test case: Zip export and import
    it( 'zip', function( ) {
            // Ensure export and import operations do not throw errors
        assert.doesNotThrow( function( ) {
                db.exportZip( 'hexastoretest1' ) ; // Export to Zip
                db.clear( ) ; // Clear the database
                db.importZip( 'hexastoretest1' ) ; // Import from Zip
            } ) ;
            // Verify the database size after import
        assert.equal( 1 , db.size( ) ) ;
            // Verify the content after import
        assert.deepEqual( db.getSPO( ) , {
            'aaa' : {
                'bbb' : {
                    'ccc' : true
                }
            }
        } ) ;
    } ) ;

        // Test case: NT (N-Triples) export and import
    it( 'nt', function( ) {
            // Ensure export and import operations do not throw errors
        assert.doesNotThrow( function( ) {
                db.exportNt( 'hexastoretest1' ) ; // Export to N-Triples
                db.clear( ) ; // Clear the database
                db.importNt( 'hexastoretest1' , function( ) {
                        // Assertions are inside the callback for async import
                    assert.equal( 1 , db.size( ) ) ;
                    assert.deepEqual( db.getSPO( ) , {
                        'aaa' : {
                            'bbb' : {
                                'ccc' : true
                            }
                        }
                    } ) ;
                } ) ;
            } ) ;

    } ) ;
} ) ;


// --- Test Suite: Delete Operations ---
describe( 'Delete', function( ) {

        // Sub-suite: 'clear' operation
    describe( 'clear', function( ) {

            // Test case: Clearing the entire store
        it( 'clear store', function( ) {
                // Ensure clearing the store does not throw an error
            assert.doesNotThrow( function( ) {
                    db.clear( ) ;
                } ) ;
        } ) ;

            // Test case: Verifying that a cleared hexastore is empty
        it( 'cleared hexastore is empty', function( ) {

            assert.equal( 0 , db.size( ) ) ; // Assert the size is 0

        } ) ;
    } ) ;
} ) ;


// --- Geometry2D Object (Likely part of an external module or future feature) ---
// This object appears to define methods for spatial queries,
// particularly focusing on the 'inside' predicate for geometric elements.
Geometry2D = {
    XXX : null , // Placeholder for a full wildcard query function
    XXO : null , // Placeholder for a query by object
    XPX : null , // Placeholder for a query by predicate
    XPO : null , // Placeholder for a query by predicate and object
    SXX : null , // Placeholder for a query by subject
    SXO : null , // Placeholder for a query by subject and object
    SPX : null , // Placeholder for a query by subject and predicate
    SPO : function( element ) { // Specific function for Subject-Predicate-Object queries
        var s = element[ 0 ] ; // Extract subject
        var p = element[ 1 ] ; // Extract predicate
        var o = element[ 2 ] ; // Extract object
        var res = [ ] ; // Initialize results array

        switch ( p ) { // Check the predicate
            case "inside" : // If the predicate is "inside"
                // Assuming 'geomParse' and 'inside' functions are defined elsewhere
                if ( inside( geomParse( s ) , geomParse( o ) ) ) {
                    res = append( res , [ s , p , o , true ] ) ; // Add the triple if 's' is inside 'o'
                }
                break ; // Exit switch
        }
        return res ; // Return the results
    }
} ;

// --- Identity Object (Likely for specific query patterns or transformations) ---
// This object seems to define functions for identity-related queries or transformations,
// possibly for specific index patterns.
Identity = {
    XXX : function( f ) { // Function for XXX pattern
        return null ; // Returns null, indicating no identity match for this pattern
    } ,
    XXO : function( f ) { // Function for XXO pattern
        return [
            [ f[ 2 ] , "equals" , f[ 2 ] , true ] // Returns a triple indicating the object equals itself
        ] ;
    } ,
    XPX : function( f ) { // Function for XPX pattern
        // This function is incomplete in the provided snippet.
        // It would likely return identity triples based on the predicate.