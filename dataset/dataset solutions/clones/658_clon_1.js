/*
 * This file contains a JavaScript program for processing tree structures.
 * It uses Babel-generated helpers for class syntax and destructuring.
 * The main logic involves creating binary trees from string representations,
 * and performing union or intersection operations on them.
 */

'use strict' ; /* Enforce strict mode for cleaner code */


// Babel helper for slicing an array-like object into an array.
var _slicedToArray = ( function ( ) {

    function sliceIterator ( arr , i ) {
        var _arr = [ ] ;
        var _n = true ;
        var _d = false ;
        var _e = undefined ;

        try {
            for ( var _i = arr [ Symbol . iterator ] ( ) , _s ; ! ( _n = ( _s = _i . next ( ) ) . done ) ; _n = true ) {
                _arr . push ( _s . value ) ;
                if ( i && _arr . length === i ) break ;
            }
        } catch ( err ) {
            _d = true ;
            _e = err ;
        } finally {
            try {
                if ( ! _n && _i [ "return" ] ) _i [ "return" ] ( ) ;
            } finally {
                if ( _d ) throw _e ;
            }
        }
        return _arr ;
    }

    return function ( arr , i ) {
        if ( Array . isArray ( arr ) ) {
            return arr ;
        } else if ( Symbol . iterator in Object ( arr ) ) {
            return sliceIterator ( arr , i ) ;
        } else {
            throw new TypeError ( "Invalid attempt to destructure non-iterable instance" ) ;
        }
    } ;
} ) ( ) ;

// Babel helper for creating classes.
var _createClass = ( function ( ) {

    function defineProperties ( target , props ) {
        for ( var i = 0 ; i < props . length ; i ++ ) {
            var descriptor = props [ i ] ;
            descriptor . enumerable = descriptor . enumerable || false ;
            descriptor . configurable = true ;
            if ( "value" in descriptor ) descriptor . writable = true ;
            Object . defineProperty ( target , descriptor . key , descriptor ) ;
        }
    }

    return function ( Constructor , protoProps , staticProps ) {
        if ( protoProps ) defineProperties ( Constructor . prototype , protoProps ) ;
        if ( staticProps ) defineProperties ( Constructor , staticProps ) ;
        return Constructor ;
    } ;
} ) ( ) ;

// Helper function to ensure a class is called as a constructor.
function _classCallCheck ( instance , Constructor ) {
    if ( ! ( instance instanceof Constructor ) ) {
        throw new TypeError ( "Cannot call a class as a function" ) ;
    }
}


var input = '' ; // Variable to store all incoming data from stdin.

// Resume standard input stream.
process . stdin . resume ( ) ;
// Set encoding for stdin.
process . stdin . setEncoding ( 'utf8' ) ;

// Event listener for incoming data chunks.
process . stdin . on ( 'data' , function ( chunk ) {
    input += chunk ; // Append chunk to the input string.
} ) ;

// Event listener for the end of the input stream.
process . stdin . on ( 'end' , function ( ) {

    // Split the accumulated input into individual lines.
    var inputs = input . split ( '\n' ) ;


    // Definition of the Node class for our binary trees.
    var Node = ( function ( ) {

        function Node ( ) {
            _classCallCheck ( this , Node ) ; // Ensure 'this' is an instance of Node.

            this . left = null ;   // Left child of the node.
            this . right = null ;  // Right child of the node.
            this . parent = null ; // Parent of the node.
        }

        _createClass ( Node , [ {
            key : 'insertLeft' ,
            value : function insertLeft ( node ) {
                this . left = node ;
                node . parent = this ;
            }
        } , {
            key : 'insertRight' ,
            value : function insertRight ( node ) {
                this . right = node ;
                node . parent = this ;
            }
        } , {
            key : 'toString' , // Custom toString method for Node.
            value : function toString ( ) {
                // Recursively build string representation: (left,right)
                return '(' + ( this . left == null ? '' : this . left . toString ( ) ) + ',' + ( this . right == null ? '' : this . right . toString ( ) ) + ')' ;
            }
        } ] ) ;

        return Node ;
    } ) ( ) ;

    // Function to create a binary tree from a string representation.
    var createTree = function createTree ( str ) {
        var root = new Node ( ) ; // Create a dummy root node.
        var tree = root ;         // Current node in the tree building process.
        var comma = 0 ;           // Flag to determine if we are after a comma (for right child).

        // Iterator variables for the loop.
        var _iteratorNormalCompletion = true ;
        var _didIteratorError = false ;
        var _iteratorError = undefined ;

        try {
            // Iterate over each character in the input string.
            for ( var _iterator = str [ Symbol . iterator ] ( ) , _step ; ! ( _iteratorNormalCompletion = ( _step = _iterator . next ( ) ) . done ) ; _iteratorNormalCompletion = true ) {
                var s = _step . value ; // Current character.

                if ( s == "(" ) { // If an opening parenthesis is encountered.
                    var child = new Node ( ) ; // Create a new child node.
                    if ( comma == 0 ) {
                        tree . insertLeft ( child ) ; // Insert as left child.
                    } else {
                        tree . insertRight ( child ) ; // Insert as right child.
                    }
                    tree = child ; // Move current node to the newly created child.
                }
                if ( s == "," ) { // If a comma is encountered.
                    comma = 1 ; // Set flag for right child.
                }
                if ( s == ")" ) { // If a closing parenthesis is encountered.
                    tree = tree . parent ; // Move up to the parent node.
                    comma = 0 ;            // Reset comma flag.
                }
            }
        } catch ( err ) {
            _didIteratorError = true ;
            _iteratorError = err ;
        } finally {
            try {
                if ( ! _iteratorNormalCompletion && _iterator . return ) {
                    _iterator . return ( ) ;
                }
            } finally {
                if ( _didIteratorError ) {
                    throw _iteratorError ;
                }
            }
        }

        return tree . left ; // Return the actual root of the created tree (left child of dummy root).
    } ;

    // Function to perform a union operation on two trees.
    var union = function union ( a , b ) {
        var node = new Node ( ) ; // Create a new node for the result.
        if ( a == null ) return b ; // If tree 'a' is null, union is 'b'.
        if ( b == null ) return a ; // If tree 'b' is null, union is 'a'.

        // Recursively union left children.
        var _res = union ( a . left , b . left ) ;
        if ( _res != null ) node . insertLeft ( _res ) ; // If result is not null, insert as left child.

        // Recursively union right children.
        _res = union ( a . right , b . right ) ;
        if ( _res != null ) node . insertRight ( _res ) ; // If result is not null, insert as right child.

        return node ; // Return the resulting node.
    } ;

    // Function to perform an intersection operation on two trees.
    var intersection = function intersection ( a , b ) {
        var node = new Node ( ) ; // Create a new node for the result.
        if ( a == null || b == null ) return null ; // If either tree is null, intersection is null.

        // Recursively intersect left children.
        var _res = intersection ( a . left , b . left ) ;
        if ( _res != null ) node . insertLeft ( _res ) ; // If result is not null, insert as left child.

        // Recursively intersect right children.
        _res = intersection ( a . right , b . right ) ;
        if ( _res != null ) node . insertRight ( _res ) ; // If result is not null, insert as right child.

        return node ; // Return the resulting node.
    } ;


    // Iterator variables for the main input processing loop.
    var _iteratorNormalCompletion2 = true ;
    var _didIteratorError2 = false ;
    var _iteratorError2 = undefined ;

    try {
        // Iterate over each input line.
        for ( var _iterator2 = inputs [ Symbol . iterator ] ( ) , _step2 ; ! ( _iteratorNormalCompletion2 = ( _step2 = _iterator2 . next ( ) ) . done ) ; _iteratorNormalCompletion2 = true ) {
            var _input = _step2 . value ; // Current input line.

            // Destructure the input line into type, treeStr, and treeStr2.
            var _input$split = _input . split ( ' ' ) ,
                _input$split2 = _slicedToArray ( _input$split , 3 ) ,
                type = _input$split2 [ 0 ] ,
                treeStr = _input$split2 [ 1 ] ,
                treeStr2 = _input$split2 [ 2 ] ;

            // Create the two trees from their string representations.
            var tree = createTree ( treeStr ) ;
            var tree2 = createTree ( treeStr2 ) ;

            var res = void 0 ; // Variable to store the result of the operation.

            // Perform union or intersection based on the 'type' field.
            if ( type == "u" ) {
                res = union ( tree , tree2 ) ;
            } else if ( type == "i" ) {
                res = intersection ( tree , tree2 ) ;
            }
            // Print the string representation of the resulting tree.
            console . log ( res . toString ( ) ) ;
        }
    } catch ( err ) {
        _didIteratorError2 = true ;
        _iteratorError2 = err ;
    } finally {
        try {
            if ( ! _iteratorNormalCompletion2 && _iterator2 . return ) {
                _iterator2 . return ( ) ;
            }
        } finally {
            if ( _didIteratorError2 ) {
                throw _iteratorError2 ;
            }
        }
    }
} ) ;
/* End of file */