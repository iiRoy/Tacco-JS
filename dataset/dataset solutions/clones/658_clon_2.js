'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Variable to accumulate all incoming data from standard input
var rawData = '';

// Resume standard input stream
process.stdin.resume();

// Set encoding for standard input
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks
process.stdin.on('data', function (chunk) {
    rawData += chunk; // Append each chunk to the rawData string
});

// Event listener for 'end' of standard input
process.stdin.on('end', function () {
    // Split the accumulated rawData into individual lines
    var lineData = rawData.split('\n');

    // Definition of a BinaryNode class for tree structure
    var BinaryNode = function () {
        // Constructor for a new BinaryNode instance
        function BinaryNode() {
            _classCallCheck(this, BinaryNode); // Ensure the class is called as a constructor

            this.leftChild = null;  // Pointer to the left child node
            this.rightChild = null; // Pointer to the right child node
            this.parentNode = null; // Pointer to the parent node
        }

        _createClass(BinaryNode, [{
            key: 'addLeft', // Method to insert a node as the left child
            value: function addLeft(currNode) {
                this.leftChild = currNode;
                currNode.parentNode = this;
            }
        }, {
            key: 'addRight', // Method to insert a node as the right child
            value: function addRight(currNode) {
                this.rightChild = currNode;
                currNode.parentNode = this;
            }
        }, {
            key: 'toStructureString', // Method to get a string representation of the node and its children
            value: function toStructureString() {
                return '(' + (this.leftChild == null ? '' : this.leftChild.toStructureString()) + ',' + (this.rightChild == null ? '' : this.rightChild.toStructureString()) + ')';
            }
        }]);

        return BinaryNode;
    }();

    // Function to construct a binary tree from a string representation
    var buildTreeFromString = function buildTreeFromString(treeString) {
        var treeRoot = new BinaryNode(); // Create a dummy root node
        var currentPosition = treeRoot;  // Pointer to the current node being processed
        var commaFlag = 0;               // Flag to distinguish between left (0) and right (1) child insertion

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            // Iterate over each character in the input string
            for (var _iterator = treeString[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var charVal = _step.value; // Current character

                if (charVal == "(") {
                    var newNode = new BinaryNode(); // Create a new child node
                    if (commaFlag == 0) {
                        currentPosition.addLeft(newNode); // Insert as left child
                    } else {
                        currentPosition.addRight(newNode); // Insert as right child
                    }
                    currentPosition = newNode; // Move current position to the new child
                }
                if (charVal == ",") {
                    commaFlag = 1; // Set flag to indicate next child should be right
                }
                if (charVal == ")") {
                    currentPosition = currentPosition.parentNode; // Move up to the parent node
                    commaFlag = 0; // Reset flag for left child insertion
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return treeRoot.leftChild; // Return the actual root of the constructed tree
    };

    // Function to compute the union of two binary trees
    var combineTrees = function combineTrees(treeA, treeB) {
        var tempNode = new BinaryNode(); // Create a new node for the result tree
        if (treeA == null) return treeB; // If treeA is null, union is treeB
        if (treeB == null) return treeA; // If treeB is null, union is treeA

        // Recursively compute union for left children
        var subResult = combineTrees(treeA.leftChild, treeB.leftChild);
        if (subResult != null) {
            tempNode.addLeft(subResult); // Add result to the left of the current node
        }

        // Recursively compute union for right children
        subResult = combineTrees(treeA.rightChild, treeB.rightChild);
        if (subResult != null) {
            tempNode.addRight(subResult); // Add result to the right of the current node
        }
        return tempNode; // Return the combined node
    };

    // Function to compute the intersection of two binary trees
    var findCommonTrees = function findCommonTrees(treeA, treeB) {
        var tempNode = new BinaryNode(); // Create a new node for the result tree
        if (treeA == null || treeB == null) return null; // If either tree is null, intersection is null

        // Recursively compute intersection for left children
        var subResult = findCommonTrees(treeA.leftChild, treeB.leftChild);
        if (subResult != null) {
            tempNode.addLeft(subResult); // Add result to the left of the current node
        }

        // Recursively compute intersection for right children
        subResult = findCommonTrees(treeA.rightChild, treeB.rightChild);
        if (subResult != null) {
            tempNode.addRight(subResult); // Add result to the right of the current node
        }
        return tempNode; // Return the intersected node
    };

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        // Process each line of input
        for (var _iterator2 = lineData[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var currentLine = _step2.value; // Current input line

            // Split the line into operation type and two tree strings
            var lineParts = currentLine.split(' ');
            var destructuredParts = _slicedToArray(lineParts, 3);
            var operationType = destructuredParts[0];
            var firstTreeString = destructuredParts[1];
            var secondTreeString = destructuredParts[2];

            // Build the two trees from their string representations
            var parsedTreeA = buildTreeFromString(firstTreeString);
            var parsedTreeB = buildTreeFromString(secondTreeString);
            var finalResultTree = void 0; // Variable to store the result tree

            // Perform union or intersection based on the operation type
            if (operationType == "u") {
                finalResultTree = combineTrees(parsedTreeA, parsedTreeB);
            } else if (operationType == "i") {
                finalResultTree = findCommonTrees(parsedTreeA, parsedTreeB);
            }
            // Print the string representation of the result tree
            console.log(finalResultTree.toStructureString());
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }
});
