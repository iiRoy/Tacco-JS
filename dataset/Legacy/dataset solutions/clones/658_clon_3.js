'use strict';

var _destructureArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _defineClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _checkClassInstance(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataChunk) {
    rawData += dataChunk;
});

process.stdin.on('end', function () {
    var processedInputs = rawData.split('\n');

    const UNION_OPERATION_KEY = "u";
    const INTERSECTION_OPERATION_KEY = "i";

    var BinaryNode = function () {
        function BinaryNode() {
            _checkClassInstance(this, BinaryNode);
            this.leftChild = null;
            this.rightChild = null;
            this.parentNode = null;
        }

        _defineClass(BinaryNode, [{
            key: 'setLeftChild',
            value: function setLeftChild(childNode) {
                this.leftChild = childNode;
                if (childNode) {
                    childNode.parentNode = this;
                }
            }
        }, {
            key: 'setRightChild',
            value: function setRightChild(childNode) {
                this.rightChild = childNode;
                if (childNode) {
                    childNode.parentNode = this;
                }
            }
        }, {
            key: 'toStructureString',
            value: function toStructureString() {
                const leftPart = this.leftChild ? this.leftChild.toStructureString() : '';
                const rightPart = this.rightChild ? this.rightChild.toStructureString() : '';
                return `(${leftPart},${rightPart})`;
            }
        }]);

        return BinaryNode;
    }();

    const PAREN_OPEN_CHAR = "(";
    const PAREN_CLOSE_CHAR = ")";
    const COMMA_SEPARATOR_CHAR = ",";

    var buildTreeFromString = function buildTreeFromString(treeString) {
        const temporaryRoot = new BinaryNode();
        let currentTraversalNode = temporaryRoot;
        let isRightChildContext = false;

        const attachChildToParent = (parent, child, isRight) => {
            if (isRight) {
                parent.setRightChild(child);
            } else {
                parent.setLeftChild(child);
            }
        };

        for (let charIndex = 0; charIndex < treeString.length; charIndex++) {
            const currentChar = treeString[charIndex];
            switch (currentChar) {
                case PAREN_OPEN_CHAR:
                    const newChildNode = new BinaryNode();
                    attachChildToParent(currentTraversalNode, newChildNode, isRightChildContext);
                    currentTraversalNode = newChildNode;
                    isRightChildContext = false;
                    break;
                case COMMA_SEPARATOR_CHAR:
                    isRightChildContext = true;
                    break;
                case PAREN_CLOSE_CHAR:
                    currentTraversalNode = currentTraversalNode.parentNode;
                    isRightChildContext = false;
                    break;
            }
        }
        return temporaryRoot.leftChild;
    };

    const conditionallyAssignChild = (parent, childResult, isRight) => {
        if (childResult) {
            if (isRight) {
                parent.setRightChild(childResult);
            } else {
                parent.setLeftChild(childResult);
            }
        }
    };

    var performUnion = function performUnion(treeA, treeB) {
        if (!treeA) {
            return treeB;
        }
        if (!treeB) {
            return treeA;
        }

        const unionResultNode = new BinaryNode();
        
        const leftUnionResult = performUnion(treeA.leftChild, treeB.leftChild);
        conditionallyAssignChild(unionResultNode, leftUnionResult, false);

        const rightUnionResult = performUnion(treeA.rightChild, treeB.rightChild);
        conditionallyAssignChild(unionResultNode, rightUnionResult, true);
        
        return unionResultNode;
    };

    var performIntersection = function performIntersection(treeA, treeB) {
        if (!treeA || !treeB) {
            return null;
        }

        const intersectionResultNode = new BinaryNode();

        const leftIntersectionResult = performIntersection(treeA.leftChild, treeB.leftChild);
        conditionallyAssignChild(intersectionResultNode, leftIntersectionResult, false);

        const rightIntersectionResult = performIntersection(treeA.rightChild, treeB.rightChild);
        conditionallyAssignChild(intersectionResultNode, rightIntersectionResult, true);
        
        return intersectionResultNode;
    };

    const processSingleInputLine = (currentInputLine) => {
        const lineSegments = currentInputLine.split(' ');
        
        const operationType = lineSegments[0];
        const firstTreeString = lineSegments[1];
        const secondTreeString = lineSegments[2];

        const parsedTreeA = buildTreeFromString(firstTreeString);
        const parsedTreeB = buildTreeFromString(secondTreeString);
        let finalResultTree;

        switch (operationType) {
            case UNION_OPERATION_KEY:
                finalResultTree = performUnion(parsedTreeA, parsedTreeB);
                break;
            case INTERSECTION_OPERATION_KEY:
                finalResultTree = performIntersection(parsedTreeA, parsedTreeB);
                break;
        }
        console.log(finalResultTree.toStructureString());
    };

    processedInputs.forEach(processSingleInputLine);
});
