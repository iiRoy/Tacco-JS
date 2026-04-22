'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    input += chunk;
});
process.stdin.on('end', function () {
    var inputs = input.split('\n');

    var Node = function () {
        function Node() {
            _classCallCheck(this, Node);

            this.left = null;
            this.right = null;
            this.parent = null;
        }

        _createClass(Node, [{
            key: 'insertLeft',
            value: function insertLeft(node) {
                this.left = node;
                node.parent = this;
            }
        }, {
            key: 'insertRight',
            value: function insertRight(node) {
                this.right = node;
                node.parent = this;
            }
        }, {
            key: 'toString',
            value: function toString() {
                return '(' + (this.left == null ? '' : this.left.toString()) + ',' + (this.right == null ? '' : this.right.toString()) + ')';
            }
        }]);

        return Node;
    }();

    var createTree = function createTree(str) {
        var root = new Node();
        var tree = root;
        var comma = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = str[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var s = _step.value;

                if (s == "(") {
                    var child = new Node();
                    if (comma == 0) tree.insertLeft(child);else tree.insertRight(child);
                    tree = child;
                }
                if (s == ",") comma = 1;
                if (s == ")") {
                    tree = tree.parent;
                    comma = 0;
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

        return tree.left;
    };
    var union = function union(a, b) {
        var node = new Node();
        if (a == null) return b;
        if (b == null) return a;
        var _res = union(a.left, b.left);
        if (_res != null) node.insertLeft(_res);
        _res = union(a.right, b.right);
        if (_res != null) node.insertRight(_res);
        return node;
    };
    var intersection = function intersection(a, b) {
        var node = new Node();
        if (a == null || b == null) return null;
        var _res = intersection(a.left, b.left);
        if (_res != null) node.insertLeft(_res);
        _res = intersection(a.right, b.right);
        if (_res != null) node.insertRight(_res);
        return node;
    };
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = inputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _input = _step2.value;

            var _input$split = _input.split(' '),
                _input$split2 = _slicedToArray(_input$split, 3),
                type = _input$split2[0],
                treeStr = _input$split2[1],
                treeStr2 = _input$split2[2];

            var tree = createTree(treeStr);
            var tree2 = createTree(treeStr2);
            var res = void 0;
            if (type == "u") {
                res = union(tree, tree2);
            } else if (type == "i") {
                res = intersection(tree, tree2);
            }
            console.log(res.toString());
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