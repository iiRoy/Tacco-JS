"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

!function (fs) {
  "use strict";

  var Treap =
  /*#__PURE__*/
  function () {
    function Treap(getSortKey) {
      _classCallCheck(this, Treap);

      this.getSortKey = getSortKey || function (x) {
        return x;
      };

      this.root = null;
    }

    _createClass(Treap, [{
      key: "insert",
      value: function insert(value) {
        var priority = Math.random();
        var node = {
          value: value,
          key: this.getSortKey(value),
          priority: priority,
          left: null,
          right: null
        };
        this.root = this._insertRec(this.root, node);
      }
    }, {
      key: "erase",
      value: function erase(value) {
        var key = this.getSortKey(value);
        this.root = this._eraseRec(this.root, key);
      }
    }, {
      key: "contains",
      value: function contains(value) {
        return null != this._find(value);
      }
    }, {
      key: "min",
      value: function min() {
        var root = this.root;

        for (; null != root;) {
          if (null == root.left) return root.value;
          root = root.left;
        }

        return null;
      }
    }, {
      key: "_insertRec",
      value: function _insertRec(target, node) {
        if (null == target) return node;
        if (node.key === target.key) return target;else if (node.key < target.key) {
          var newChild = this._insertRec(target.left, node);

          target.left = newChild;
          if (newChild.priority < target.priority) return target;else return this._rotateRight(target);
        } else {
          var _newChild = this._insertRec(target.right, node);

          target.right = _newChild;
          if (_newChild.priority < target.priority) return target;else return this._rotateLeft(target);
        }
      }
    }, {
      key: "_rotateRight",
      value: function _rotateRight(parent) {
        var child = parent.left;
        if (null == child) return parent;
        parent.left = child.right;
        child.right = parent;
        return child;
      }
    }, {
      key: "_rotateLeft",
      value: function _rotateLeft(parent) {
        var child = parent.right;
        if (null == child) return parent;
        parent.right = child.left;
        child.left = parent;
        return child;
      }
    }, {
      key: "_eraseRec",
      value: function _eraseRec(node, key) {
        if (null == node) return null;

        if (key < node.key) {
          node.left = this._eraseRec(node.left, key);
          return node;
        } else if (key > node.key) {
          node.right = this._eraseRec(node.right, key);
          return node;
        }

        if (null == node.left && null == node.right) return null;

        if ((node.left ? node.left.priority : -1) > (node.right ? node.right.priority : -1)) {
          var newParent = node.left;
          var npRightChild = newParent.right;
          node.left = npRightChild;
          newParent.right = this._eraseRec(node, key);
          if (newParent.right && newParent.right.priority > newParent.priority) return this._rotateLeft(newParent);else return newParent;
        } else {
          var _newParent = node.right;
          var npLeftChild = _newParent.left;
          node.right = npLeftChild;
          _newParent.left = this._eraseRec(node, key);
          if (_newParent.left && _newParent.left.priority > _newParent.priority) return this._rotateRight(_newParent);else return _newParent;
        }
      }
    }, {
      key: "_find",
      value: function _find(value) {
        var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.root;
        if (null == root) return null;
        if (root.value === value) return root;
        if (value < root.value) return this._find(value, root.left);else return this._find(value, root.right);
      }
    }]);

    return Treap;
  }();

  !function () {
    function splitNum(line) {
      return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
        return parseInt(n);
      });
    }

    function sortByKey(arr, keys) {
      if (!Array.isArray(keys)) keys = [keys];
      return arr.sort(function (a, b) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var k = _step.value;

            if ("string" == typeof k) {
              var d = a[k] - b[k];
              if (0 !== d) return d;
            } else {
              var _d = a[k[0]] - b[k[0]];

              var sig = "desc" === k[1] ? -1 : "asc" === k[1] ? 1 : Number(k[1]);
              if (0 !== _d) return _d * sig;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return 0;
      });
    }

    !function (input) {
      var lines = input.split("\n");

      var _splitNum = splitNum(lines[0]),
          _splitNum2 = _slicedToArray(_splitNum, 2),
          N = _splitNum2[0],
          Q = _splitNum2[1];

      var kouji = lines.slice(1, N + 1).map(function (line, i) {
        var _splitNum3 = splitNum(line),
            _splitNum4 = _slicedToArray(_splitNum3, 3),
            S = _splitNum4[0],
            T = _splitNum4[1],
            X = _splitNum4[2];

        return {
          i: i,
          S: S,
          T: T,
          X: X,
          startTime: S - X - .5,
          endTime: T - X - .6
        };
      });
      var D = splitNum(lines.slice(N + 1)).slice(0, Q);
      var events = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = kouji[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = _step2.value,
              X = _step2$value.X,
              startTime = _step2$value.startTime,
              endTime = _step2$value.endTime;
          events.push({
            type: "add",
            time: startTime,
            X: X
          }, {
            type: "delete",
            time: endTime,
            X: X
          });
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var dindex = 0;
      sortByKey(events, ["time"]);
      var set = new Treap();

      for (var _i2 = 0; _i2 < events.length; _i2++) {
        var _events$_i = events[_i2],
            type = _events$_i.type,
            time = _events$_i.time,
            X = _events$_i.X;

        for (; dindex < D.length && time > D[dindex];) {
          var _stop = set.min();

          console.log(null == _stop ? -1 : _stop);
          dindex++;
        }

        if ("add" === type) set.insert(X);else if ("delete" === type) set.erase(X);
      }

      for (; dindex < D.length; dindex++) {
        var stop = set.min();
        console.log(null == stop ? -1 : stop);
      }
    }(fs.readFileSync("/dev/stdin", "utf8"));
  }();
}(require("fs"));
