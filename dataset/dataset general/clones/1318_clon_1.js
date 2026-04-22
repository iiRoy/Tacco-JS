/*
 * This file contains extensive unit tests for the TreeModel library.
 * It validates the core functionalities, including tree parsing,
 * node manipulation (adding/dropping children), path retrieval,
 * and various tree traversal strategies.
 *
 * This version of the code is a Type I clone, meaning its functionality
 * is identical to the original. Only formatting, spacing, and comments
 * have been altered to demonstrate visual distinctiveness.
 */

/* global describe, it, beforeEach */ // Necessary globals for the test framework

var chai,     assert,    sinon,     spy,     TreeModel; // Declare testing utility variables

chai = require('chai');
sinon = require('sinon');
spy = sinon.spy;
TreeModel = require('..'); // Load the TreeModel library from parent directory
assert = chai.assert;
chai.Assertion.includeStack = true; // Ensure detailed stack traces on assertion failures

// Main test suite for the TreeModel library
describe('TreeModel', function() {
  'use strict'; // Enforce strict JavaScript parsing and execution rules

  // Helper function: returns a predicate that checks if a node's model ID matches the given ID
  function idEq(id) {
    return function (node) {
      return node.model.id === id;
    };
  }


  // --- Test suite for the default TreeModel configuration ---
  describe('with default configuration', function() {
    var treeModel; // Variable to hold a fresh TreeModel instance for each test

    // Setup a new TreeModel instance before each test in this block
    beforeEach(function() {
      treeModel = new TreeModel();
    });


    // --- Tests for the parse() method ---
    describe('parse()', function() {

      // Test case: model is a number, should throw TypeError
      it('should throw an error when model is a number (not an object)', function() {
        assert.throws(treeModel.parse.bind(treeModel, 1), TypeError, 'Model must be of type object.');
      });

      // Test case: model is a string, should throw TypeError
      it('should throw an error when model is a string (not an object)', function() {
        assert.throws(treeModel.parse.bind(treeModel, 'string'), TypeError, 'Model must be of type object.');
      });

      // Test case: one of the children in the model is not an object
      it('should throw an error when some child in the model is not an object', function() {
        assert.throws(
          treeModel.parse.bind(treeModel, { children: ['string'] }), // Model with a non-object child
          TypeError,
          'Model must be of type object.');
      });

      // Test case: parsing a simple model without children
      it('should create a root node when given a model without children', function() {
        var root; // Declare root node variable

        root = treeModel.parse({ id: 1 }); // Parse a simple model

        assert.isUndefined(root.parent); // Root node should not have a parent
        assert.isArray(root.children); // Children property should be an array
        assert.lengthOf(root.children, 0); // Root node should have no children
        assert.deepEqual(root.model, { id: 1 }); // Model should match the input
      });

      // Test case: parsing a complex model with multiple levels of children
      it('should create a root and the respective children when given a model with children', function() {
        var root, node12; // Declare variables for root and a specific child node

        root = treeModel.parse({ // Parse a nested tree structure
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [
                { id: 121 },
                { id: 122 },
                { id: 123 },
                { id: 124 },
                { id: 125 },
                { id: 126 },
                { id: 127 },
                { id: 128 },
                { id: 129 },
                { id: 1210 },
                { id: 1211 }
              ]
            }
          ]
        });

        assert.isUndefined(root.parent); // Root has no parent
        assert.isArray(root.children); // Children is an array
        assert.lengthOf(root.children, 2); // Root has two children
        assert.deepEqual(root.model, { // Verify the root's model structure
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [
                { id: 121 },
                { id: 122 },
                { id: 123 },
                { id: 124 },
                { id: 125 },
                { id: 126 },
                { id: 127 },
                { id: 128 },
                { id: 129 },
                { id: 1210 },
                { id: 1211 }
              ]
            }
          ]
        });

        // Verify parent-child relationships for direct children of root
        assert.deepEqual(root, root.children[0].parent);
        assert.deepEqual(root, root.children[1].parent);

        node12 = root.children[1]; // Get a specific child node
        assert.isArray(node12.children); // Check if its children are an array
        assert.lengthOf(node12.children, 11); // Verify count of children
        assert.deepEqual(node12.model, { // Verify the model of node12
          id: 12,
          children: [
            { id: 121 },
            { id: 122 },
            { id: 123 },
            { id: 124 },
            { id: 125 },
            { id: 126 },
            { id: 127 },
            { id: 128 },
            { id: 129 },
            { id: 1210 },
            { id: 1211 }
          ]
        });

        // Verify parent-child relationships for children of node12
        assert.deepEqual(node12, node12.children[0].parent);
        assert.deepEqual(node12, node12.children[1].parent);
      });
    });


    // --- Tests for the addChild() and addChildAtIndex() methods ---
    describe('addChild()', function() {
      var root; // Root node for add child tests

      beforeEach(function() {
        // Initialize a simple tree structure for each test
        root = treeModel.parse({ id: 1, children: [{ id: 11 }, { id: 12 }] });
      });

      // Test case: adding a child to the end of the children list
      it('should add child to the end', function() {
        root.addChild(treeModel.parse({ id: 13 }));
        root.addChild(treeModel.parse({ id: 10 }));
        assert.deepEqual(root.model.children, [{ id: 11 }, { id: 12 }, { id: 13 }, { id: 10 }]);
      });

      // Test case: attempting to add a non-Node object as a child
      it('should throw an error when child is not a Node', function() {
        assert.throws(root.addChild.bind(root, { children: [] }), TypeError, 'Child must be of type Node.');
      });

      // Test case: adding a child at a specific valid index
      it('should add child at index', function() {
        root.addChildAtIndex(treeModel.parse({ id: 13 }), 1);
        assert.deepEqual(root.model.children, [{ id: 11 }, { id: 13 }, { id: 12 }]);
      });

      // Test case: adding a child at an index equal to the current number of children (i.e., at the end)
      it('should add child at the when index matches the children number', function() {
        root.addChildAtIndex(treeModel.parse({ id: 13 }), 2);
        assert.deepEqual(root.model.children, [{ id: 11 }, { id: 12 }, { id: 13 }]);
      });

      // Test case: adding a child to a leaf node at index 0
      it('should add child at index 0 of a leaf', function() {
        var leaf = root.first(idEq(11)); // Find a leaf node
        leaf.addChildAtIndex(treeModel.parse({ id: 111 }), 0);
        assert.deepEqual(leaf.model.children, [{ id: 111 }]);
      });

      // Test case: attempting to add a child at a negative index
      it('should throw an error when adding child at negative index', function() {
        var child; // Child node to be added

        child = treeModel.parse({ id: 13 });
        assert.throws(root.addChildAtIndex.bind(root, child, -1), Error, 'Invalid index.');
      });

      // Test case: attempting to add a child at an index higher than the valid range
      it('should throw an error when adding child at a too high index', function() {
        var child; // Child node to be added

        child = treeModel.parse({ id: 13 });
        assert.throws(root.addChildAtIndex.bind(root, child, 3), Error, 'Invalid index.');
      });
    });


    // --- Tests for the getPath() method ---
    describe('getPath()', function() {
      var root; // Root node for path tests

      beforeEach(function() {
        // Setup a tree for path testing
        root = treeModel.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      // Test case: calling getPath on the root node
      it('should get an array with the root node if called on the root node', function() {
        var pathToRoot; // Variable to store the path

        pathToRoot = root.getPath();
        assert.lengthOf(pathToRoot, 1);
        assert.strictEqual(pathToRoot[0].model.id, 1);
      });

      // Test case: calling getPath on a deeply nested node
      it('should get an array of nodes from the root to the node (included)', function() {
        var pathToNode121; // Variable to store the path

        pathToNode121 = root.first(idEq(121)).getPath(); // Get path to node with id 121
        assert.lengthOf(pathToNode121, 3);
        assert.strictEqual(pathToNode121[0].model.id, 1);
        assert.strictEqual(pathToNode121[1].model.id, 12);
        assert.strictEqual(pathToNode121[2].model.id, 121);
      });
    });


    // --- Tests for tree traversal methods (walk) ---
    describe('traversal', function() {
      var root, spy121, spy12; // Variables for root node and spy functions

      // Callback function that returns false when node.model.id is 121, stopping traversal
      function callback121(node) {
        if (node.model.id === 121) {
          return false; // Stop traversal
        }
      }

      // Callback function that returns false when node.model.id is 12, stopping traversal
      function callback12(node) {
        if (node.model.id === 12) {
          return false; // Stop traversal
        }
      }

      beforeEach(function() {
        // Setup a consistent tree structure for traversal tests
        root = treeModel.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });

        // Create Sinon spies for the callback functions
        spy121 = sinon.spy(callback121);
        spy12 = sinon.spy(callback12);
      });

      // Test case: default (depthFirstPreOrder) traversal
      describe('walk depthFirstPreOrder by default', function() {
        it('should traverse the nodes until the callback returns false', function() {
          root.walk(spy121, this); // Start walk with the spy callback
          assert.strictEqual(spy121.callCount, 5); // Verify number of calls
          assert(spy121.alwaysCalledOn(this)); // Verify context
          assert(spy121.getCall(0).calledWithExactly(root.first(idEq(1))));
          assert(spy121.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy121.getCall(2).calledWithExactly(root.first(idEq(111))));
          assert(spy121.getCall(3).calledWithExactly(root.first(idEq(12))));
          assert(spy121.getCall(4).calledWithExactly(root.first(idEq(121)))); // Traversal stops here
        });
      });

      // Test case: depthFirstPostOrder traversal
      describe('walk depthFirstPostOrder', function() {
        it('should traverse the nodes until the callback returns false', function() {
          root.walk({ strategy: 'post' }, spy121, this); // Walk using 'post' strategy
          assert.strictEqual(spy121.callCount, 3); // Verify number of calls
          assert(spy121.alwaysCalledOn(this)); // Verify context
          assert(spy121.getCall(0).calledWithExactly(root.first(idEq(111))));
          assert(spy121.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy121.getCall(2).calledWithExactly(root.first(idEq(121)))); // Traversal stops here
        });
      });

      // Another test case for depthFirstPostOrder traversal with a different stop condition
      describe('walk depthFirstPostOrder (2)', function() {
        it('should traverse the nodes until the callback returns false', function() {
          root.walk({ strategy: 'post' }, spy12, this); // Walk using 'post' strategy, stop at 12
          assert.strictEqual(spy12.callCount, 5);
          assert(spy12.alwaysCalledOn(this));
          assert(spy12.getCall(0).calledWithExactly(root.first(idEq(111))));
          assert(spy12.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy12.getCall(2).calledWithExactly(root.first(idEq(121))));
          assert(spy12.getCall(3).calledWithExactly(root.first(idEq(122))));
          assert(spy12.getCall(4).calledWithExactly(root.first(idEq(12)))); // Traversal stops here
        });
      });

      // Test case: breadthFirst traversal
      describe('walk breadthFirst', function() {
        it('should traverse the nodes until the callback returns false', function() {
          root.walk({ strategy: 'breadth' }, spy121, this); // Walk using 'breadth' strategy
          assert.strictEqual(spy121.callCount, 5);
          assert(spy121.alwaysCalledOn(this));
          assert(spy121.getCall(0).calledWithExactly(root.first(idEq(1))));
          assert(spy121.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy121.getCall(2).calledWithExactly(root.first(idEq(12))));
          assert(spy121.getCall(3).calledWithExactly(root.first(idEq(111))));
          assert(spy121.getCall(4).calledWithExactly(root.first(idEq(121)))); // Traversal stops here
        });
      });

      // Test case: attempting to use an unknown traversal strategy
      describe('walk using unknown strategy', function() {
        it('should throw an error warning about the strategy', function() {
          assert.throws(
            root.walk.bind(root, { strategy: 'unknownStrategy' }, callback121, this),
            Error,
            'Unknown tree walk strategy. Valid strategies are \'pre\' [default], \'post\' and \'breadth\'.');
        });
      });
    });


    // --- Tests for the all() method (finding all nodes matching a predicate) ---
    describe('all()', function() {
      var root; // Root node for 'all' tests

      beforeEach(function() {
        // Setup a tree for searching
        root = treeModel.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      // Test case: no nodes match the predicate
      it('should get an empty array if no nodes match the predicate', function() {
        var idLt0; // Result array

        idLt0 = root.all(function (node) {
          return node.model.id < 0; // Predicate: ID less than 0
        });
        assert.lengthOf(idLt0, 0);
      });

      // Test case: only the root node matches the predicate
      it('should get an array with the node itself if only the node matches the predicate', function() {
        var idEq1; // Result array

        idEq1 = root.all(idEq(1)); // Predicate: ID equals 1
        assert.lengthOf(idEq1, 1);
        assert.deepEqual(idEq1[0], root);
      });

      // Test case: multiple nodes match a given predicate
      it('should get an array with all nodes that match a given predicate', function() {
        var idGt100; // Result array

        idGt100 = root.all(function (node) {
          return node.model.id > 100; // Predicate: ID greater than 100
        });
        assert.lengthOf(idGt100, 3);
        assert.strictEqual(idGt100[0].model.id, 111);
        assert.strictEqual(idGt100[1].model.id, 121);
        assert.strictEqual(idGt100[2].model.id, 122);
      });

      // Test case: predicate with multiple conditions
      it('should get an array with all nodes that match a given predicate (2)', function() {
        var idGt10AndChildOfRoot; // Result array

        idGt10AndChildOfRoot = root.all(function (node) {
          return node.model.id > 10 && node.parent === root; // Predicate: ID > 10 AND direct child of root
        });
        assert.lengthOf(idGt10AndChildOfRoot, 2);
        assert.strictEqual(idGt10AndChildOfRoot[0].model.id, 11);
        assert.strictEqual(idGt10AndChildOfRoot[1].model.id, 12);
      });
    });


    // --- Tests for the drop() method (removing a node from the tree) ---
    describe('drop()', function() {
      var root; // Root node for 'drop' tests

      beforeEach(function() {
        // Setup a tree for dropping nodes
        root = treeModel.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      // Test case: dropping the root node
      it('should give back the dropped node, even if it is the root', function() {
        assert.deepEqual(root.drop(), root);
      });

      // Test case: dropping a child node and verifying it's removed from the parent
      it('should give back the dropped node, which no longer be found in the original root', function() {
        // Drop node 11 and verify its model
        assert.deepEqual(root.first(idEq(11)).drop().model, { id: 11, children: [{ id: 111 }] });
        // After dropping, node 11 should no longer be findable from the root
        assert.isUndefined(root.first(idEq(11)));
      });
    });


    // --- Tests for the hasChildren() method ---
    describe('hasChildren()', function() {
      var root; // Root node for 'hasChildren' tests

      beforeEach(function() {
        // Setup a tree with both parent and leaf nodes
        root = treeModel.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      // Test case: node with children
      it('should return true for node with children', function() {
        assert.equal(root.hasChildren(), true);
      });

      // Test case: node without children (a leaf node)
      it('should return false for node without children', function() {
        assert.equal(root.first(idEq(111)).hasChildren(), false);
      });
    });
  });


  // --- Test suite for TreeModel with custom configuration ---
  describe('with custom children and comparator', function() {
    var treeModel; // TreeModel instance with custom config

    beforeEach(function() {
      // Initialize TreeModel with custom childrenPropertyName and a custom comparator function
      treeModel = new TreeModel({
        childrenPropertyName: 'deps', // Use 'deps' instead of 'children' for child arrays
        modelComparatorFn: function(a, b) {
          return b.id - a.id; // Custom comparator: sort by ID in descending order
        }
      });
    });

    // --- Tests for parse() method with custom config ---
    describe('parse()', function() {
      it('should create a root and stable sort the respective children according to the comparator', function() {
        var root, node12, i; // Declare variables

        root = treeModel.parse({ // Parse a model using 'deps' for children
          id: 1,
          deps: [
            {
              id: 11,
              deps: [{ id: 111 }]
            },
            {
              id: 12,
              deps: [ // Children of node 12 are initially unsorted
                { id: 122, stable: 1 },
                { id: 121, stable: 1 },
                { id: 121, stable: 2 },
                { id: 121, stable: 3 },
                { id: 121, stable: 4 },
                { id: 121, stable: 5 },
                { id: 121, stable: 6 },
                { id: 121, stable: 7 },
                { id: 121, stable: 8 },
                { id: 121, stable: 9 },
                { id: 121, stable: 10 },
                { id: 121, stable: 11 },
                { id: 121, stable: 12 },
                { id: 121, stable: 13 },
                { id: 121, stable: 14 },
                { id: 121, stable: 15 },
                { id: 122, stable: 2 }
              ]
            }
          ]
        });

        assert.isUndefined(root.parent);
        assert.isArray(root.children);
        assert.lengthOf(root.children, 2);
        assert.deepEqual(root.model, { // Verify the root's model, children are now sorted
          id: 1,
          deps: [
            { // Node 12 comes before 11 due to descending ID sort
              id: 12,
              deps: [ // Children of 12 are also sorted descending by ID, stable property preserves order for equal IDs
                { id: 122, stable: 1 },
                { id: 122, stable: 2 }, // stable:2 follows stable:1 due to stable sort for equal IDs
                { id: 121, stable: 1 },
                { id: 121, stable: 2 },
                { id: 121, stable: 3 },
                { id: 121, stable: 4 },
                { id: 121, stable: 5 },
                { id: 121, stable: 6 },
                { id: 121, stable: 7 },
                { id: 121, stable: 8 },
                { id: 121, stable: 9 },
                { id: 121, stable: 10 },