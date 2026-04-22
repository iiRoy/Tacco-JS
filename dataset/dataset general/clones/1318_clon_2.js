/* global examineModule, shouldVerify, setupTest */

let testLib, verifier, mockLib, createTracker, StructureNode;

testLib = require('chai');
mockLib = require('sinon');
createTracker = mockLib.spy;
StructureNode = require('..');
verifier = testLib.assert;

testLib.Assertion.reportStackTrace = true;


examineModule('StructureNode class behavior', function () {
  'use strict';

  /**
   * Helper function to create a predicate for matching node identifiers.
   * @param {number} identifierValue The ID to match against.
   * @returns {Function} A function that takes a node and returns true if its dataObject.nodeId matches.
   */
  function matchIdentifier(identifierValue) {
    return function (currentElement) {
      return currentElement.dataObject.nodeId === identifierValue;
    };
  }

  examineModule('with standard settings', function () {
    let structureInstance; // Represents an instance of our StructureNode class.

    setupTest(function () {
      structureInstance = new StructureNode();
    });

    examineModule('ingest() method functionality', function () {

      shouldVerify('that it throws an error when the data model is a number (not an object)', function () {
        verifier.throws(structureInstance.ingest.bind(structureInstance, 1), KindError, 'Data model must be an object.');
      });

      shouldVerify('that it throws an error when the data model is a string (not an object)', function () {
        verifier.throws(structureInstance.ingest.bind(structureInstance, 'some string'), KindError, 'Data model must be an object.');
      });

      shouldVerify('that it throws an error if any descendant in the data model is not an object', function () {
        verifier.throws(
          structureInstance.ingest.bind(structureInstance, { descendants: ['another string'] }),
          KindError,
          'Data model must be an object.');
      });

      shouldVerify('that it establishes a base node when given a data model without descendants', function () {
        let baseNode;

        baseNode = structureInstance.ingest({ nodeId: 1 });

        verifier.isUndefined(baseNode.ancestor);
        verifier.isArray(baseNode.descendants);
        verifier.lengthOf(baseNode.descendants, 0);
        verifier.deepEqual(baseNode.dataObject, { nodeId: 1 });
      });

      shouldVerify('that it establishes a base node and its corresponding descendants when given a data model with descendants', function () {
        let baseNode, subElementTwo;

        baseNode = structureInstance.ingest({
          nodeId: 1,
          descendants: [
            {
              nodeId: 11,
              descendants: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              descendants: [
                { nodeId: 121 },
                { nodeId: 122 },
                { nodeId: 123 },
                { nodeId: 124 },
                { nodeId: 125 },
                { nodeId: 126 },
                { nodeId: 127 },
                { nodeId: 128 },
                { nodeId: 129 },
                { nodeId: 1210 },
                { nodeId: 1211 }
              ]
            }
          ]
        });

        verifier.isUndefined(baseNode.ancestor);
        verifier.isArray(baseNode.descendants);
        verifier.lengthOf(baseNode.descendants, 2);
        verifier.deepEqual(baseNode.dataObject, {
          nodeId: 1,
          descendants: [
            {
              nodeId: 11,
              descendants: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              descendants: [
                { nodeId: 121 }, { nodeId: 122 }, { nodeId: 123 }, { nodeId: 124 }, { nodeId: 125 },
                { nodeId: 126 }, { nodeId: 127 }, { nodeId: 128 }, { nodeId: 129 }, { nodeId: 1210 },
                { nodeId: 1211 }
              ]
            }
          ]
        });

        verifier.deepEqual(baseNode, baseNode.descendants[0].ancestor);
        verifier.deepEqual(baseNode, baseNode.descendants[1].ancestor);

        subElementTwo = baseNode.descendants[1];
        verifier.isArray(subElementTwo.descendants);
        verifier.lengthOf(subElementTwo.descendants, 11);
        verifier.deepEqual(subElementTwo.dataObject, {
          nodeId: 12,
          descendants: [
            { nodeId: 121 }, { nodeId: 122 }, { nodeId: 123 }, { nodeId: 124 }, { nodeId: 125 },
            { nodeId: 126 }, { nodeId: 127 }, { nodeId: 128 }, { nodeId: 129 }, { nodeId: 1210 },
            { nodeId: 1211 }
          ]
        });

        verifier.deepEqual(subElementTwo, subElementTwo.descendants[0].ancestor);
        verifier.deepEqual(subElementTwo, subElementTwo.descendants[1].ancestor);
      });
    });

    examineModule('appendNode() method functionality', function () {
      let baseNode;

      setupTest(function () {
        baseNode = structureInstance.ingest({ nodeId: 1, descendants: [{ nodeId: 11 }, { nodeId: 12 }] });
      });

      shouldVerify('that it adds a descendant to the end of the list', function () {
        baseNode.appendNode(structureInstance.ingest({ nodeId: 13 }));
        baseNode.appendNode(structureInstance.ingest({ nodeId: 10 }));
        verifier.deepEqual(baseNode.dataObject.descendants, [{ nodeId: 11 }, { nodeId: 12 }, { nodeId: 13 }, { nodeId: 10 }]);
      });

      shouldVerify('that it throws an error when the provided descendant is not a StructureNode', function () {
        verifier.throws(baseNode.appendNode.bind(baseNode, { descendants: [] }), KindError, 'Descendant must be of type StructureNode.');
      });

      shouldVerify('that it adds a descendant at a specific index', function () {
        baseNode.insertNodeAt(structureInstance.ingest({ nodeId: 13 }), 1);
        verifier.deepEqual(baseNode.dataObject.descendants, [{ nodeId: 11 }, { nodeId: 13 }, { nodeId: 12 }]);
      });

      shouldVerify('that it adds a descendant at the end when the index matches the total number of descendants', function () {
        baseNode.insertNodeAt(structureInstance.ingest({ nodeId: 13 }), 2);
        verifier.deepEqual(baseNode.dataObject.descendants, [{ nodeId: 11 }, { nodeId: 12 }, { nodeId: 13 }]);
      });

      shouldVerify('that it adds a descendant at index 0 of a terminal node', function () {
        let terminalNode = baseNode.first(matchIdentifier(11));
        terminalNode.insertNodeAt(structureInstance.ingest({ nodeId: 111 }), 0);
        verifier.deepEqual(terminalNode.dataObject.descendants, [{ nodeId: 111 }]);
      });

      shouldVerify('that it throws an error when adding a descendant at a negative index', function () {
        let newElement;

        newElement = structureInstance.ingest({ nodeId: 13 });
        verifier.throws(baseNode.insertNodeAt.bind(baseNode, newElement, -1), Issue, 'Invalid position.');
      });

      shouldVerify('that it throws an error when adding a descendant at an excessively high index', function () {
        let newElement;

        newElement = structureInstance.ingest({ nodeId: 13 });
        verifier.throws(baseNode.insertNodeAt.bind(baseNode, newElement, 3), Issue, 'Invalid position.');
      });
    });

    examineModule('retrievePath() method operation', function () {
      let baseNode;

      setupTest(function () {
        baseNode = structureInstance.ingest({
          nodeId: 1,
          descendants: [
            {
              nodeId: 11,
              descendants: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              descendants: [{ nodeId: 121 }, { nodeId: 122 }]
            }
          ]
        });
      });

      shouldVerify('that it returns an array with only the base node if called on the base node', function () {
        let pathFromBase;
        pathFromBase = baseNode.retrievePath();
        verifier.lengthOf(pathFromBase, 1);
        verifier.strictEqual(pathFromBase[0].dataObject.nodeId, 1);
      });

      shouldVerify('that it returns an array of nodes from the base to the current node (inclusive)', function () {
        let pathFromBaseToNode121;
        pathFromBaseToNode121 = baseNode.first(matchIdentifier(121)).retrievePath();
        verifier.lengthOf(pathFromBaseToNode121, 3);
        verifier.strictEqual(pathFromBaseToNode121[0].dataObject.nodeId, 1);
        verifier.strictEqual(pathFromBaseToNode121[1].dataObject.nodeId, 12);
        verifier.strictEqual(pathFromBaseToNode121[2].dataObject.nodeId, 121);
      });
    });

    examineModule('node navigation methods', function () {
      let baseNode, trace121, trace12;

      // Callback function designed to halt traversal when it encounters node 121
      function processNode121(currentElement) {
        if (currentElement.dataObject.nodeId === 121) {
          return false;
        }
      }

      // Callback function designed to halt traversal when it encounters node 12
      function processNode12(currentElement) {
        if (currentElement.dataObject.nodeId === 12) {
          return false;
        }
      }

      setupTest(function () {
        baseNode = structureInstance.ingest({
          nodeId: 1,
          descendants: [
            {
              nodeId: 11,
              descendants: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              descendants: [{ nodeId: 121 }, { nodeId: 122 }]
            }
          ]
        });

        trace121 = createTracker(processNode121);
        trace12 = createTracker(processNode12);
      });

      examineModule('traverse with deepFirstPre approach by default', function () {
        shouldVerify('that it navigates nodes until the callback returns a falsy value', function () {
          baseNode.traverse(trace121, this);
          verifier.strictEqual(trace121.callCount, 5);
          verifier(trace121.alwaysCalledOn(this));
          verifier(trace121.getCall(0).calledWithExactly(baseNode.first(matchIdentifier(1))));
          verifier(trace121.getCall(1).calledWithExactly(baseNode.first(matchIdentifier(11))));
          verifier(trace121.getCall(2).calledWithExactly(baseNode.first(matchIdentifier(111))));
          verifier(trace121.getCall(3).calledWithExactly(baseNode.first(matchIdentifier(12))));
          verifier(trace121.getCall(4).calledWithExactly(baseNode.first(matchIdentifier(121))));
        });
      });

      examineModule('traverse with deepFirstPost approach', function () {
        shouldVerify('that it navigates nodes until the callback returns a falsy value', function () {
          baseNode.traverse({ approach: 'post' }, trace121, this);
          verifier.strictEqual(trace121.callCount, 3);
          verifier(trace121.alwaysCalledOn(this));
          verifier(trace121.getCall(0).calledWithExactly(baseNode.first(matchIdentifier(111))));
          verifier(trace121.getCall(1).calledWithExactly(baseNode.first(matchIdentifier(11))));
          verifier(trace121.getCall(2).calledWithExactly(baseNode.first(matchIdentifier(121))));
        });
      });

      examineModule('traverse with deepFirstPost approach (scenario two)', function () {
        shouldVerify('that it navigates nodes until the callback returns a falsy value', function () {
          baseNode.traverse({ approach: 'post' }, trace12, this);
          verifier.strictEqual(trace12.callCount, 5);
          verifier(trace12.alwaysCalledOn(this));
          verifier(trace12.getCall(0).calledWithExactly(baseNode.first(matchIdentifier(111))));
          verifier(trace12.getCall(1).calledWithExactly(baseNode.first(matchIdentifier(11))));
          verifier(trace12.getCall(2).calledWithExactly(baseNode.first(matchIdentifier(121))));
          verifier(trace12.getCall(3).calledWithExactly(baseNode.first(matchIdentifier(122))));
          verifier(trace12.getCall(4).calledWithExactly(baseNode.first(matchIdentifier(12))));
        });
      });

      examineModule('traverse with wideFirst approach', function () {
        shouldVerify('that it navigates nodes until the callback returns a falsy value', function () {
          baseNode.traverse({ approach: 'wide' }, trace121, this);
          verifier.strictEqual(trace121.callCount, 5);
          verifier(trace121.alwaysCalledOn(this));
          verifier(trace121.getCall(0).calledWithExactly(baseNode.first(matchIdentifier(1))));
          verifier(trace121.getCall(1).calledWithExactly(baseNode.first(matchIdentifier(11))));
          verifier(trace121.getCall(2).calledWithExactly(baseNode.first(matchIdentifier(12))));
          verifier(trace121.getCall(3).calledWithExactly(baseNode.first(matchIdentifier(111))));
          verifier(trace121.getCall(4).calledWithExactly(baseNode.first(matchIdentifier(121))));
        });
      });

      examineModule('traverse with an unrecognized approach', function () {
        shouldVerify('that it throws an error warning about the unsupported approach', function () {
          verifier.throws(
            baseNode.traverse.bind(baseNode, { approach: 'unrecognizedApproach' }, processNode121, this),
            Issue,
            'Unsupported node navigation approach. Valid approaches are \'pre\' [default], \'post\' and \'wide\'.');
        });
      });
    });

    examineModule('collectAll() method capabilities', function () {
      let baseNode;

      setupTest(function () {
        baseNode = structureInstance.ingest({
          nodeId: 1,
          descendants: [
            {
              nodeId: 11,
              descendants: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              descendants: [{ nodeId: 121 }, { nodeId: 122 }]
            }
          ]
        });
      });

      shouldVerify('that it returns an empty array if no nodes fulfill the condition', function () {
        let nodesBelowZero;
        nodesBelowZero = baseNode.collectAll(function (currentElement) {
          return currentElement.dataObject.nodeId < 0;
        });
        verifier.lengthOf(nodesBelowZero, 0);
      });

      shouldVerify('that it returns an array containing only the node itself if only that node matches the condition', function () {
        let nodeMatchingOne;
        nodeMatchingOne = baseNode.collectAll(matchIdentifier(1));
        verifier.lengthOf(nodeMatchingOne, 1);
        verifier.deepEqual(nodeMatchingOne[0], baseNode);
      });

      shouldVerify('that it returns an array with all nodes that satisfy a given condition', function () {
        let nodesAboveHundred;
        nodesAboveHundred = baseNode.collectAll(function (currentElement) {
          return currentElement.dataObject.nodeId > 100;
        });
        verifier.lengthOf(nodesAboveHundred, 3);
        verifier.strictEqual(nodesAboveHundred[0].dataObject.nodeId, 111);
        verifier.strictEqual(nodesAboveHundred[1].dataObject.nodeId, 121);
        verifier.strictEqual(nodesAboveHundred[2].dataObject.nodeId, 122);
      });

      shouldVerify('that it returns an array with all nodes that satisfy a given condition (second case)', function () {
        let nodesAboveTenAndDirectChild;
        nodesAboveTenAndDirectChild = baseNode.collectAll(function (currentElement) {
          return currentElement.dataObject.nodeId > 10 && currentElement.ancestor === baseNode;
        });
        verifier.lengthOf(nodesAboveTenAndDirectChild, 2);
        verifier.strictEqual(nodesAboveTenAndDirectChild[0].dataObject.nodeId, 11);
        verifier.strictEqual(nodesAboveTenAndDirectChild[1].dataObject.nodeId, 12);
      });
    });

    examineModule('removeElement() method behavior', function () {
      let baseNode;

      setupTest(function () {
        baseNode = structureInstance.ingest({
          nodeId: 1,
          descendants: [
            {
              nodeId: 11,
              descendants: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              descendants: [{ nodeId: 121 }, { nodeId: 122 }]
            }
          ]
        });
      });

      shouldVerify('that it returns the removed node, even if it is the base node', function () {
        verifier.deepEqual(baseNode.removeElement(), baseNode);
      });

      shouldVerify('that it returns the removed node, which should no longer be discoverable in the original base structure', function () {
        verifier.deepEqual(baseNode.first(matchIdentifier(11)).removeElement().dataObject, { nodeId: 11, descendants: [{ nodeId: 111 }] });
        verifier.isUndefined(baseNode.first(matchIdentifier(11)));
      });
    });

    examineModule('possessesDescendants() method functionality', function () {
      let baseNode;

      setupTest(function () {
        baseNode = structureInstance.ingest({
          nodeId: 1,
          descendants: [
            {
              nodeId: 11,
              descendants: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              descendants: [{ nodeId: 121 }, { nodeId: 122 }]
            }
          ]
        });
      });

      shouldVerify('that it returns true for a node having descendants', function () {
        verifier.equal(baseNode.possessesDescendants(), true);
      });

      shouldVerify('that it returns false for a node without any descendants', function () {
        verifier.equal(baseNode.first(matchIdentifier(111)).possessesDescendants(), false);
      });
    });
  });

  examineModule('with tailored descendant and comparison settings', function () {
    let structureInstance;

    setupTest(function () {
      structureInstance = new StructureNode({
        descendantFieldName: 'dependencies',
        dataObjectComparisonFn: function (firstObj, secondObj) {
          return secondObj.nodeId - firstObj.nodeId;
        }
      });
    });

    examineModule('ingest() method with custom settings', function () {
      shouldVerify('that it creates a base node and stably sorts the respective descendants according to the custom comparator', function () {
        let baseNode, subElementTwo, counter;

        baseNode = structureInstance.ingest({
          nodeId: 1,
          dependencies: [
            {
              nodeId: 11,
              dependencies: [{ nodeId: 111 }]
            },
            {
              nodeId: 12,
              dependencies: [
                { nodeId: 122, fixed: 1 },
                { nodeId: 121, fixed: 1 },
                { nodeId: 121, fixed: 2 },
                { nodeId: 121, fixed: 3 },
                { nodeId: 121, fixed: 4 },
                { nodeId: 121, fixed: 5 },
                { nodeId: 121, fixed: 6 },
                { nodeId: 121, fixed: 7 },
                { nodeId: 121, fixed: 8 },
                { nodeId: 121, fixed: 9 },
                { nodeId: 121, fixed: 10 },
                { nodeId: 121, fixed: 11 },
                { nodeId: 121, fixed: 12 },
                { nodeId: 121, fixed: 13 },
                { nodeId: 121, fixed: 14 },
                { nodeId: 121, fixed: 15 },
                { nodeId: 122, fixed: 2 }
              ]
            }
          ]
        });

        verifier.isUndefined(baseNode.ancestor);
        verifier.isArray(baseNode.descendants);
        verifier.lengthOf(baseNode.descendants, 2);
        verifier.deepEqual(baseNode.dataObject, {
          nodeId: 1,
          dependencies: [
            {
              nodeId: 12,
              dependencies: [
                { nodeId: 122, fixed: 1 },
                { nodeId: 122, fixed: 2 },
                { nodeId: 121, fixed: 1 },
                { nodeId: 121, fixed: 2 },
                { nodeId: 121, fixed: 3 },
                { nodeId: 121, fixed: 4 },
                { nodeId: 121, fixed: 5 },
                { nodeId: 121, fixed: 6 },
                { nodeId: 121, fixed: 7 },
                { nodeId: 121, fixed: 8 },
                { nodeId: 121, fixed: 9 },
                { nodeId: 121, fixed: 10 },
                { nodeId: 121, fixed: 11 },
                { nodeId: 121, fixed: 12 },
                { nodeId: 121, fixed: 13 },
                { nodeId: 121, fixed: 14 },
                { nodeId: 121, fixed: 15 }
              ]
            },
            {
              nodeId: 11,
              dependencies: [{ nodeId: 111 }]
            }
          ]
        });
      });
    });
  });
});