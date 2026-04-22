/* eslint-disable no-unused-vars, no-undef */ // Suppress linting for test globals

// This section sets up testing utilities for our data structure library.
// We're utilizing standard assertion and mocking frameworks for robust testing.
var testFramework, expectationEngine, mockingTool, mockGenerator, DataStructureCore;

testFramework = require('chai'); // The primary assertion library.
mockingTool = require('sinon');  // A powerful utility for test spies, stubs, and mocks.
mockGenerator = mockingTool.spy; // A convenience alias for creating spy objects.
DataStructureCore = require('..'); // Importing the main library under test, our Tree-like data structure.
expectationEngine = testFramework.assert; // Exposing the 'assert' API from Chai for clear assertions.
testFramework.Assertion.includeStack = true; // Enhances error messages with stack traces for easier debugging.

// The overarching test suite for the DataStructureCore library's capabilities.
testSuite('DataStructureCore functionality verification', function () {
  'use strict'; // Enforce strict mode to catch common coding errors and improve performance.

  /**
   * Generates a predicate function to check if a node's internal model identifier matches a given value.
   * This simplifies finding specific nodes within the tree structures during tests.
   * @param {number} uniqueId The identifier to match against.
   * @returns {Function} A predicate function (node => boolean).
   */
  function checkNodeId(uniqueId) {
    return function (currentNode) {
      // Access the node's internal model and compare its 'identifier' property.
      return currentNode.model.identifier === uniqueId;
    };
  }

  // Test block focusing on the default configuration of the data structure.
  testSuite('with standard configuration settings', function () {
    var hierarchyHandler; // An instance of our tree-like data structure for testing.

    // This routine executes before each individual test case within this block.
    setupRoutine(function () {
      // Initialize a fresh instance of the data structure to ensure test isolation.
      hierarchyHandler = new DataStructureCore();
    });

    // Tests specifically for the 'buildFromObject' method, which constructs the tree.
    testSuite('buildFromObject() method behavior', function () {
      // Define a consistent error message for invalid model types.
      const invalidModelTypeError = 'Input model for tree construction must be an object.';

      // Test case: Verifies that parsing a numeric model throws an error.
      testCase('should raise an error if the provided model is a number', function () {
        // Attempt to parse a number and expect a TypeError with the predefined message.
        expectationEngine.throws(hierarchyHandler.buildFromObject.bind(hierarchyHandler, 100), TypeError, invalidModelTypeError);
      });

      // Test case: Verifies that parsing a string model throws an error.
      testCase('should raise an error if the provided model is a string', function () {
        // Attempt to parse a string and expect a TypeError with the predefined message.
        expectationEngine.throws(hierarchyHandler.buildFromObject.bind(hierarchyHandler, 'sample_string'), TypeError, invalidModelTypeError);
      });

      // Test case: Verifies that a model with non-object children throws an error.
      testCase('should raise an error if any child element within the model is not an object', function () {
        // Construct a model with a child that is a string, which is invalid.
        const malformedStructure = { subElements: ['bad_element'] };
        // Expect a TypeError with a specific message for child validation.
        expectationEngine.throws(
          hierarchyHandler.buildFromObject.bind(hierarchyHandler, malformedStructure),
          TypeError,
          'Each child model must be an object type for successful parsing.'
        );
      });

      // Test case: Ensures a root node is correctly created from a simple model.
      testCase('should establish a root node when given a model without any sub-elements', function () {
        var topNode; // Variable to hold the parsed root node.
        const simpleModel = { identifier: 1001 }; // A basic model for the root.

        // Parse the simple model to create the tree.
        topNode = hierarchyHandler.buildFromObject(simpleModel);

        // Assertions to confirm the root node's expected state.
        expectationEngine.isUndefined(topNode.ancestor); // A root node should not have a parent.
        expectationEngine.isArray(topNode.subElements); // Its children collection should be an array.
        expectationEngine.lengthOf(topNode.subElements, 0); // No children expected for this model.
        expectationEngine.deepEqual(topNode.model, simpleModel); // The internal model should match the input.
      });

      // Test case: Verifies the correct construction of a complex tree structure.
      testCase('should accurately construct a root node and all its nested sub-elements from a complex model', function () {
        var mainRoot, secondLevelNode; // Variables to refer to specific nodes in the tree.

        // A detailed model representing a multi-level, multi-child tree.
        const detailedModel = {
          identifier: 1,
          subElements: [
            {
              identifier: 11,
              subElements: [{ identifier: 111 }]
            },
            {
              identifier: 12,
              subElements: [
                { identifier: 121 }, { identifier: 122 }, { identifier: 123 },
                { identifier: 124 }, { identifier: 125 }, { identifier: 126 },
                { identifier: 127 }, { identifier: 128 }, { identifier: 129 },
                { identifier: 1210 }, { identifier: 1211 }
              ]
            }
          ]
        };

        // Parse the detailed model to build the tree.
        mainRoot = hierarchyHandler.buildFromObject(detailedModel);

        // Basic structural checks for the main root node.
        expectationEngine.isUndefined(mainRoot.ancestor, 'Root node should not have an ancestor.');
        expectationEngine.isArray(mainRoot.subElements, 'Root node\'s sub-elements should be an array.');
        expectationEngine.lengthOf(mainRoot.subElements, 2, 'Root node should have two direct sub-elements.');

        // Verify parent-child relationships for direct children.
        expectationEngine.strictEqual(mainRoot.subElements[0].ancestor, mainRoot, 'First child\'s ancestor should be the main root.');
        expectationEngine.strictEqual(mainRoot.subElements[1].ancestor, mainRoot, 'Second child\'s ancestor should be the main root.');
        // Verify the root's internal model identifier.
        expectationEngine.strictEqual(mainRoot.model.identifier, detailedModel.identifier, 'Root model identifier mismatch.');

        // Focus on a specific intermediate node (with identifier 12) for deeper checks.
        secondLevelNode = mainRoot.subElements[1]; // This is the node corresponding to {identifier: 12}.
        expectationEngine.isArray(secondLevelNode.subElements, 'Node 12\'s sub-elements should be an array.');
        expectationEngine.lengthOf(secondLevelNode.subElements, 11, 'Node 12 should have 11 sub-elements.');
        expectationEngine.strictEqual(secondLevelNode.model.identifier, 12, 'Node 12 identifier mismatch.');

        // Verify parent-child relationships for children of node 12.
        expectationEngine.strictEqual(secondLevelNode.subElements[0].ancestor, secondLevelNode, 'First child of node 12 should have node 12 as ancestor.');
        expectationEngine.strictEqual(secondLevelNode.subElements[1].ancestor, secondLevelNode, 'Second child of node 12 should have node 12 as ancestor.');

        // Verify a specific deeply nested child's model.
        const deepestChild = secondLevelNode.subElements[0];
        expectationEngine.deepEqual(deepestChild.model, { identifier: 121 }, 'Deepest child model mismatch.');
      });
    });

    // Tests for the 'appendChild' and 'insertChildAtPosition' methods.
    testSuite('appendChild() and insertChildAtPosition() functionality', function () {
      var primaryRootNode; // The root node for these append/insert tests.

      // Setup: Create a basic tree structure before each test in this block.
      setupRoutine(function () {
        primaryRootNode = hierarchyHandler.buildFromObject({ identifier: 1, subElements: [{ identifier: 11 }, { identifier: 12 }] });
      });

      // Test case: Appending a new child to the end of the children list.
      testCase('should append a new child element to the end of the existing list', function () {
        primaryRootNode.appendChild(hierarchyHandler.buildFromObject({ identifier: 13 }));
        primaryRootNode.appendChild(hierarchyHandler.buildFromObject({ identifier: 10 }));
        // Verify the updated list of children identifiers.
        expectationEngine.deepEqual(primaryRootNode.model.subElements.map(n => n.identifier), [11, 12, 13, 10]);
      });

      // Test case: Ensuring only valid Node instances can be added as children.
      testCase('should reject any non-Node object when attempting to add as a child', function () {
        const invalidChild = { identifier: 99, subElements: [] }; // A plain object, not a Node instance.
        // Expect a TypeError when trying to add this invalid child.
        expectationEngine.throws(primaryRootNode.appendChild.bind(primaryRootNode, invalidChild), TypeError, 'Child element must be a valid Node instance.');
      });

      // Test case: Inserting a child at a specific, valid index.
      testCase('should insert a child element at a designated position in the list', function () {
        primaryRootNode.insertChildAtPosition(hierarchyHandler.buildFromObject({ identifier: 13 }), 1);
        // Verify the new order of children identifiers after insertion.
        expectationEngine.deepEqual(primaryRootNode.model.subElements.map(n => n.identifier), [11, 13, 12]);
      });

      // Test case: Inserting a child at an index equal to the current number of children (effectively appending).
      testCase('should append the child if the insertion index matches the current count of sub-elements', function () {
        primaryRootNode.insertChildAtPosition(hierarchyHandler.buildFromObject({ identifier: 13 }), 2);
        // Verify that the child is added to the end of the list.
        expectationEngine.deepEqual(primaryRootNode.model.subElements.map(n => n.identifier), [11, 12, 13]);
      });

      // Test case: Inserting a child into a leaf node (a node that initially has no children).
      testCase('should successfully insert a child at index 0 into a node previously without sub-elements', function () {
        var targetLeaf = primaryRootNode.first(checkNodeId(11)); // Find the leaf node (identifier 11).
        targetLeaf.insertChildAtPosition(hierarchyHandler.buildFromObject({ identifier: 111 }), 0);
        // Verify that the leaf node now correctly contains the new child.
        expectationEngine.deepEqual(targetLeaf.model.subElements.map(n => n.identifier), [111]);
      });

      // Test case: Attempting to insert a child at a negative index should result in an error.
      testCase('should throw an error when attempting to insert a child at a negative index', function () {
        var newChildNode = hierarchyHandler.buildFromObject({ identifier: 13 });
        // Expect an Error with a specific message for invalid index.
        expectationEngine.throws(primaryRootNode.insertChildAtPosition.bind(primaryRootNode, newChildNode, -1), Error, 'Provided index is out of bounds.');
      });

      // Test case: Attempting to insert a child at an index that is too high should result in an error.
      testCase('should throw an error when attempting to insert a child at an index beyond the valid range', function () {
        var newChildNode = hierarchyHandler.buildFromObject({ identifier: 13 });
        // Expect an Error with a specific message for invalid index.
        expectationEngine.throws(primaryRootNode.insertChildAtPosition.bind(primaryRootNode, newChildNode, 3), Error, 'Provided index is out of bounds.');
      });
    });

    // Tests for the 'retrieveNodePath' method, which provides the path from root to a node.
    testSuite('retrieveNodePath() method functionality', function () {
      var topLevelNode; // The root node for these path-related tests.

      // Setup: Build a specific tree structure before each test.
      setupRoutine(function () {
        topLevelNode = hierarchyHandler.buildFromObject({
          identifier: 1,
          subElements: [
            {
              identifier: 11,
              subElements: [{ identifier: 111 }]
            },
            {
              identifier: 12,
              subElements: [{ identifier: 121 }, { identifier: 122 }]
            }
          ]
        });
      });

      // Test case: Getting the path for the root node itself.
      testCase('should return an array containing only the root node when called on the root', function () {
        var pathResult = topLevelNode.retrieveNodePath();
        // The path for the root node should simply be an array containing just the root.
        expectationEngine.lengthOf(pathResult, 1);
        expectationEngine.strictEqual(pathResult[0].model.identifier, 1, 'The first (and only) element in the path should be the root.');
      });

      // Test case: Getting the path for a deeply nested node.
      testCase('should return an array of nodes from the root down to the target node (inclusive)', function () {
        var deepNodePath;
        // Find the target node (identifier 121) and then retrieve its path.
        deepNodePath = topLevelNode.first(checkNodeId(121)).retrieveNodePath();
        // Verify the length of the path and the identifiers of each node in the correct sequence.
        expectationEngine.lengthOf(deepNodePath, 3, 'The path to node 121 should have 3 elements.');
        expectationEngine.strictEqual(deepNodePath[0].model.identifier, 1, 'First path element should be root (ID 1).');
        expectationEngine.strictEqual(deepNodePath[1].model.identifier, 12, 'Second path element should be node 12.');
        expectationEngine.strictEqual(deepNodePath[2].model.identifier, 121, 'Third path element should be the target node 121.');
      });
    });

    // Tests for the various tree traversal strategies provided by the library.
    testSuite('treeTraversal strategies and their execution', function () {
      var rootElement, spyFor121, spyFor12; // Variables for the root and spy functions.

      // A callback function designed to halt traversal when node 121 is encountered.
      function haltOnNode121(nodeItem) {
        if (nodeItem.model.identifier === 121) {
          return false; // Returning false signals the traversal method to stop.
        }
      }

      // A callback function designed to halt traversal when node 12 is encountered.
      function haltOnNode12(nodeItem) {
        if (nodeItem.model.identifier === 12) {
          return false; // Returning false signals the traversal method to stop.
        }
      }

      // Setup: Create a standard tree structure and initialize spy functions.
      setupRoutine(function () {
        rootElement = hierarchyHandler.buildFromObject({
          identifier: 1,
          subElements: [
            {
              identifier: 11,
              subElements: [{ identifier: 111 }]
            },
            {
              identifier: 12,
              subElements: [{ identifier: 121 }, { identifier: 122 }]
            }
          ]
        });

        // Create Sinon spies to monitor how many times and with what arguments the callbacks are invoked.
        spyFor121 = mockingTool.spy(haltOnNode121);
        spyFor12 = mockingTool.spy(haltOnNode12);
      });

      // Test suite for the default traversal strategy: depth-first, pre-order.
      testSuite('traverseNodes depthFirstPreOrder (implicit default)', function () {
        testCase('should visit nodes in pre-order until the callback explicitly halts traversal', function () {
          const testContext = this; // Capture 'this' for accurate spy context assertions.
          rootElement.traverseNodes(spyFor121, testContext); // Execute traversal without specifying strategy (uses default).

          // Verify the number of times the callback was invoked before halting.
          expectationEngine.strictEqual(spyFor121.callCount, 5, 'Callback count mismatch for pre-order traversal.');
          // Ensure the callback was consistently called with the correct `this` context.
          expectationEngine.ok(spyFor121.alwaysCalledOn(testContext), 'Callback context was not consistent.');
          // Verify arguments for specific calls to ensure correct traversal order.
          expectationEngine.ok(spyFor121.getCall(0).calledWithExactly(rootElement.first(checkNodeId(1))), 'First call not on root.');
          expectationEngine.ok(spyFor121.getCall(1).calledWithExactly(rootElement.first(checkNodeId(11))), 'Second call not on node 11.');
          expectationEngine.ok(spyFor121.getCall(4).calledWithExactly(rootElement.first(checkNodeId(121))), 'Fifth call not on node 121 (halt point).');
        });
      });

      // Test suite for depth-first, post-order traversal.
      testSuite('traverseNodes depthFirstPostOrder strategy', function () {
        testCase('should visit nodes in post-order until the callback halts the process', function () {
          const testContext = this;
          rootElement.traverseNodes({ traversalStrategy: 'post' }, spyFor121, testContext);

          expectationEngine.strictEqual(spyFor121.callCount, 3, 'Callback count mismatch for post-order traversal.');
          expectationEngine.ok(spyFor121.alwaysCalledOn(testContext), 'Callback context incorrect for post-order.');
          // Verify the order of calls for post-order.
          expectationEngine.ok(spyFor121.getCall(0).calledWithExactly(rootElement.first(checkNodeId(111))), 'First call not on node 111.');
          expectationEngine.ok(spyFor121.getCall(1).calledWithExactly(rootElement.first(checkNodeId(11))), 'Second call not on node 11.');
          expectationEngine.ok(spyFor121.getCall(2).calledWithExactly(rootElement.first(checkNodeId(121))), 'Third call not on node 121 (halt point).');
        });
      });

      // Another scenario for depth-first, post-order traversal with a different halt point.
      testSuite('traverseNodes depthFirstPostOrder (alternate halt condition)', function () {
        testCase('should traverse in post-order until a different callback halts execution', function () {
          const testContext = this;
          rootElement.traverseNodes({ traversalStrategy: 'post' }, spyFor12, testContext);

          expectationEngine.strictEqual(spyFor12.callCount, 5, 'Callback count mismatch for post-order (alt halt).');
          expectationEngine.ok(spyFor12.alwaysCalledOn(testContext), 'Callback context incorrect for post-order (alt halt).');
          // Verify order, especially the halt point.
          expectationEngine.ok(spyFor12.getCall(0).calledWithExactly(rootElement.first(checkNodeId(111))), 'First call not on node 111.');
          expectationEngine.ok(spyFor12.getCall(1).calledWithExactly(rootElement.first(checkNodeId(11))), 'Second call not on node 11.');
          expectationEngine.ok(spyFor12.getCall(4).calledWithExactly(rootElement.first(checkNodeId(12))), 'Fifth call not on node 12 (halt point).');
        });
      });

      // Test suite for breadth-first traversal.
      testSuite('traverseNodes breadthFirst strategy', function () {
        testCase('should traverse nodes in breadth-first order until the callback signals to stop', function () {
          const testContext = this;
          rootElement.traverseNodes({ traversalStrategy: 'breadth' }, spyFor121, testContext);

          expectationEngine.strictEqual(spyFor121.callCount, 5, 'Callback count mismatch for breadth-first traversal.');
          expectationEngine.ok(spyFor121.alwaysCalledOn(testContext), 'Callback context incorrect for breadth-first.');
          // Verify the breadth-first order of calls.
          expectationEngine.ok(spyFor121.getCall(0).calledWithExactly(rootElement.first(checkNodeId(1))), 'First call not on root.');
          expectationEngine.ok(spyFor121.getCall(1).calledWithExactly(rootElement.first(checkNodeId(11))), 'Second call not on node 11.');
          expectationEngine.ok(spyFor121.getCall(2).calledWithExactly(rootElement.first(checkNodeId(12))), 'Third call not on node 12.');
          expectationEngine.ok(spyFor121.getCall(4).calledWithExactly(rootElement.first(checkNodeId(121))), 'Fifth call not on node 121 (halt point).');
        });
      });

      // Test suite for error handling of unknown traversal strategies.
      testSuite('traverseNodes with an unrecognized traversal strategy', function () {
        testCase('should raise an error providing details about the invalid strategy', function () {
          const invalidStrategyName = 'unsupportedTraversal'; // An intentionally invalid strategy name.
          // Expect an Error to be thrown with a message that includes the invalid name and valid options.
          expectationEngine.throws(
            rootElement.traverseNodes.bind(rootElement, { traversalStrategy: invalidStrategyName }, haltOnNode121, this),
            Error,
            `Unknown tree traversal strategy: '${invalidStrategyName}'. Valid options are 'pre' [default], 'post', and 'breadth'.`
          );
        });
      });
    });

    // Tests for the 'findAllNodes' method, used to query nodes based on a predicate.
    testSuite('findAllNodes() method for querying the tree', function () {
      var topNodeForQueries; // The root node for these query-related tests.

      // Setup: Build a specific tree structure before each test.
      setupRoutine(function () {
        topNodeForQueries = hierarchyHandler.buildFromObject({
          identifier: 1,
          subElements: [
            {
              identifier: 11,
              subElements: [{ identifier: 111 }]
            },
            {
              identifier: 12,
              subElements: [{ identifier: 121 }, { identifier: 122 }]
            }
          ]
        });
      });

      // Test case: No nodes match the provided predicate.
      testCase('should return an empty array if no nodes fulfill the specified predicate', function () {
        // Predicate: node ID less than 0 (no nodes in the test tree will match this).
        const noMatchNodes = topNodeForQueries.findAllNodes(function (nodeItem) {
          return nodeItem.model.identifier < 0;
        });
        expectationEngine.lengthOf(noMatchNodes, 0, 'No nodes should be found for this predicate.');
      });

      // Test case: Only the root node matches the predicate.
      testCase('should return an array containing only the node itself if it is the sole match', function () {
        // Predicate: node ID equals 1 (only the root node has this ID).
        const rootOnlyMatch = topNodeForQueries.findAllNodes(checkNodeId(1));
        expectationEngine.lengthOf(rootOnlyMatch, 1, 'Only one node (the root) should be found.');
        expectationEngine.strictEqual(rootOnlyMatch[0], topNodeForQueries, 'The found node should be the exact root object.');
      });

      // Test case: Multiple nodes match a numerical predicate.
      testCase('should return an array of all nodes satisfying a given numerical predicate', function () {
        // Predicate: node ID greater than 100.
        const nodesOver100 = topNodeForQueries.findAllNodes(function (nodeItem) {
          return nodeItem.model.identifier > 100;
        });
        expectationEngine.lengthOf(nodesOver100, 3, 'Three nodes should have an ID greater than 100.');
        // Verify the identifiers and order of the matched nodes.
        expectationEngine.strictEqual(nodesOver100[0].model.identifier, 111, 'First matched node ID is incorrect.');
        expectationEngine.strictEqual(nodesOver100[1].model.identifier, 121, 'Second matched node ID is incorrect.');
        expectationEngine.strictEqual(nodesOver100[2].model.identifier, 122, 'Third matched node ID is incorrect.');
      });

      // Test case: Multiple nodes match a complex predicate involving node properties and relationships.
      testCase('should return an array of all nodes matching a compound predicate', function () {
        // Predicate: node ID greater than 10 AND it's a direct child of the root.
        const rootChildrenAbove10 = topNodeForQueries.findAllNodes(function (nodeItem) {
          // Guard clause: Ensure 'ancestor' property exists before checking equality, avoiding errors for the root itself.
          if (!nodeItem.ancestor) {
            return false;
          }
          return nodeItem.model.identifier > 10 && nodeItem.ancestor === topNodeForQueries;
        });
        expectationEngine.lengthOf(rootChildrenAbove10, 2, 'Two direct children of root should match.');
        expectationEngine.strictEqual(rootChildrenAbove10[0].model.identifier, 11, 'First matching child ID is incorrect.');
        expectationEngine.strictEqual(rootChildrenAbove10[1].model.identifier, 12, 'Second matching child ID is incorrect.');
      });
    });

    // Tests for the 'removeNode' method, which detaches a node from the tree.
    testSuite('removeNode() method for detaching elements', function () {
      var initialRoot; // The root node for these removal tests.

      // Setup: Build a specific tree structure before each test.
      setupRoutine(function () {
        initialRoot = hierarchyHandler.buildFromObject({
          identifier: 1,
          subElements: [
            {
              identifier: 11,
              subElements: [{ identifier: 111 }]
            },
            {
              identifier: 12,
              subElements: [{ identifier: 121 }, { identifier: 122 }]
            }
          ]
        });
      });

      // Test case: Dropping the root node itself.
      testCase('should return the detached node, even if it is the tree\'s root element', function () {
        const removedRoot = initialRoot.removeNode();
        // The returned object should be the original root node.
        expectationEngine.deepEqual(removedRoot, initialRoot, 'The returned node should be the original root object.');
        expectationEngine.isUndefined(removedRoot.ancestor, 'The removed root should no longer have an ancestor.');
      });

      // Test case: Dropping a child node from the tree.
      testCase('should return the detached node, which should no longer be discoverable in the original tree', function () {
        const nodeToDrop = initialRoot.first(checkNodeId(11)); // Identify node 11 to be removed.

        // Pre-checks: Ensure the node exists and has a parent before attempting to drop it.
        expectationEngine.ok(nodeToDrop, 'Node with ID 11 should exist before removal.');
        expectationEngine.ok(nodeToDrop.ancestor, 'Node with ID 11 should have an ancestor before removal.');

        const droppedNode = nodeToDrop.removeNode(); // Perform the removal.
        // The returned node should match the one that was detached, including its sub-elements.
        expectationEngine.deepEqual(droppedNode.model, { identifier: 11, subElements: [{ identifier: 111 }] }, 'The returned node\'s model is incorrect.');
        // The removed node should no longer be found when searching the tree from the root.
        expectationEngine.isUndefined(initialRoot.first(checkNodeId(11)), 'The dropped node should not be found in the tree after removal.');
        // The dropped node itself should no longer have a parent.
        expectationEngine.isUndefined(droppedNode.ancestor, 'The dropped node should no longer have an ancestor.');
      });
    });

    // Tests for the 'containsSubNodes' method, checking if a node has children.
    testSuite('containsSubNodes() method for child presence check', function () {
      var testRootNode; // The root node for these child presence tests.

      // Setup: Build a specific tree structure before each test.
      setupRoutine(function () {
        testRootNode = hierarchyHandler.buildFromObject({
          identifier: 1,
          subElements: [
            {
              identifier: 11,
              subElements: [{ identifier: 111 }]
            },
            {
              identifier: 12,
              subElements: [{ identifier: 121 }, { identifier: 122 }]
            }
          ]
        });
      });

      // Test case: A node with existing children.
      testCase('should return true for a node that possesses child elements', function () {
        expectationEngine.isTrue(testRootNode.containsSubNodes(), 'The root node should report having children.');
      });

      // Test case: A node without any children (a leaf node).
      testCase('should return false for a node that does not possess any child elements (a leaf)', function () {
        const leafNode = testRootNode.first(checkNodeId(111)); // Find a known leaf node.
        expectationEngine.isFalse(leafNode.containsSubNodes(), 'Node 111 should report not having children.');
      });

      // Test case: A newly created node explicitly defined with an empty children array.
      testCase('should return false for a newly created node explicitly initialized with an empty children array', function () {
        const newNodeWithEmptyChildren = hierarchyHandler.buildFromObject({ identifier: 999, subElements: [] });
        expectationEngine.isFalse(newNodeWithEmptyChildren.containsSubNodes(), 'A new node with an empty children array should report no children.');
      });
    });
  });

  // Test block for a custom configuration of the data structure, including a custom child property and comparator.
  testSuite('with custom child property name and an element sorting comparator', function () {
    var configuredStructure; // An instance of our tree structure configured with custom options.

    // Setup: Initialize a DataStructureCore instance with specific configuration options.
    setupRoutine(function () {
      configuredStructure = new DataStructureCore({
        childElementsProp: 'dependencyList', // Custom property name to identify children in the raw model.
        elementSortFunction: function (elementA, elementB) {
          // Custom comparator function: sorts by 'identifier' in descending order.
          // This ensures that larger identifiers come first.
          const idComparison = elementB.identifier - elementA.identifier;

          // For stable sorting: if identifiers are equal, use a 'stable' property if available.
          if (idComparison === 0 && elementA.stable !== undefined && elementB.stable !== undefined) {
              return elementA.stable - elementB.stable; // Sort by 'stable' in ascending order for tie-breaking.
          }
          return idComparison; // Otherwise, use the primary ID comparison.
        }
      });
    });

    // Tests for the 'buildFromObject' method under this custom configuration.
    testSuite('buildFromObject() with custom settings applied', function () {
      // Test case: Verifies correct parsing and stable sorting of children using the custom comparator.
      testCase('should create a root and stably sort its sub-elements according to the custom comparator function', function () {
        var customRoot, targetNode; // Variables for specific nodes in the custom tree.

        // A model that uses the custom 'dependencyList' property for its children.
        const customModel = {
          identifier: 1,
          dependencyList: [
            {
              identifier: 11,
              dependencyList: [{ identifier: 111 }]
            },
            {
              identifier: 12,
              dependencyList: [
                { identifier: 122, stable: 1 },
                { identifier: 121, stable: 1 },
                { identifier: 121, stable: 2 },
                { identifier: 121, stable: 3 },
                { identifier: 121, stable: 4 },
                { identifier: 121, stable: 5 },
                { identifier: 121, stable: 6 },
                { identifier: 121, stable: 7 },
                { identifier: 121, stable: 8 },
                { identifier: 121, stable: 9 },
                { identifier: 121, stable: 10 },
                { identifier: 121, stable: 11 },
                { identifier: 121, stable: 12 },
                { identifier: 121, stable: 13 },
                { identifier: 121, stable: 14 },
                { identifier: 121, stable: 15 },
                { identifier: 122, stable: 2 } // Another 122, should be sorted stably.
              ]
            }
          ]
        };

        // Parse the model using the configured structure.
        customRoot = configuredStructure.buildFromObject(customModel);

        // Basic structural checks for the custom root.
        expectationEngine.isUndefined(customRoot.ancestor, 'Custom root should not have an ancestor.');
        expectationEngine.isArray(customRoot.subElements, 'Custom root\'s sub-elements should be an array.');
        expectationEngine.lengthOf(customRoot.subElements, 2, 'Custom root should have two direct sub-elements.');

        // Verify the root's internal model, ensuring the custom children property is correctly handled.
        // The original 'dependencyList' property is retained in the model, but children are accessed via 'subElements'.
        expectationEngine.deepEqual(customRoot.model, {
          identifier: 1,
          dependencyList: customModel.dependencyList // The raw model structure is preserved.
        });

        // Verify the sorted order of direct children (node 12 should appear before node 11 due to comparator).
        expectationEngine.strictEqual(customRoot.subElements[0].model.identifier, 12, 'First child should be 12 after custom sorting.');
        expectationEngine.strictEqual(customRoot.subElements[1].model.identifier, 11, 'Second child should be 11 after custom sorting.');

        // Focus on the node with identifier 12 to check its stably sorted children.
        targetNode = customRoot.first(checkNodeId(12));
        expectationEngine.isArray(targetNode.subElements, 'Target node 12\'s sub-elements should be an array.');
        expectationEngine.lengthOf(targetNode.subElements, 17, 'Target node 12 should have 17 sub-elements.');

        // Define the expected order of children's identifiers and stable properties after sorting.
        const expectedChildDetails = [
            { id: 122, stable: 1 },
            { id: 122, stable: 2 },
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
            { id: 121, stable: 15 }
        ];

        // Map the actual children to a simplified format for direct comparison.
        const actualChildDetails = targetNode.subElements.map(node => ({
            id: node.model.identifier,
            stable: node.model.stable
        }));

        // Perform a deep comparison to ensure both ID and 'stable' property order are precisely correct.
        expectationEngine.deepEqual(actualChildDetails, expectedChildDetails, 'Children of node 12 are not stably sorted as expected by the custom comparator.');

        // Additional checks for specific child properties.
        expectationEngine.strictEqual(targetNode.subElements[0].model.identifier, 122, 'First child of node 12 has incorrect identifier after sorting.');
        expectationEngine.strictEqual(targetNode.subElements[1].model.stable, 2, 'Second child with ID 122 has incorrect stable value.');
        expectationEngine.strictEqual(targetNode.subElements[2].model.identifier, 121, 'Third child of node 12 has incorrect identifier after sorting.');
        expectationEngine.strictEqual(targetNode.subElements[2].model.stable, 1, 'First child with ID 121 has incorrect stable value.');
      });
    });
  });
});