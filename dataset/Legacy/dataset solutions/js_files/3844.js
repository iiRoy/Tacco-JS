"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// parameter "input" gets all data
function Equals(input) {
    // the first line is assigned to input[0], the second line is assigned to input[1] similarly.
    var _a = parseInput(input), N = _a.N, M = _a.M, p = _a.p, xy = _a.xy;
    var sets = DisjointSets.buildFrom(N, xy);
    //output
    return p.filter(function (num, i) { return sets.areInSameSet(num, i + 1); }).length.toString();
}
exports.Equals = Equals;
var DisjointSets = /** @class */ (function () {
    function DisjointSets(trees) {
        this.trees = trees;
    }
    DisjointSets.buildFrom = function (N, xy) {
        var trees = Array.apply(this, Array(N + 1)).map(function () { return new DisjointSetTree(); });
        xy.forEach(function (_a) {
            var x = _a.x, y = _a.y;
            return trees[x].union(trees[y]);
        });
        return new DisjointSets(trees);
    };
    DisjointSets.prototype.areInSameSet = function (num1, num2) {
        return this.trees[num1].isSameSetAs(this.trees[num2]);
    };
    return DisjointSets;
}());
var DisjointSetTree = /** @class */ (function () {
    function DisjointSetTree() {
        this.parent = this;
        this.rank = 0;
    }
    DisjointSetTree.prototype.isSameSetAs = function (other) {
        return this.find() === other.find();
    };
    // union by rank
    DisjointSetTree.prototype.union = function (other) {
        var _a;
        var xRoot = this.find();
        var yRoot = other.find();
        if (xRoot !== yRoot) {
            if (xRoot.rank < yRoot.rank) {
                _a = [yRoot, xRoot], xRoot = _a[0], yRoot = _a[1];
            }
            yRoot.parent = xRoot;
            if (yRoot.rank === xRoot.rank) {
                xRoot.rank = xRoot.rank + 1;
            }
        }
    };
    DisjointSetTree.prototype.find = function () {
        if (this.parent !== this) {
            this.parent = this.parent.find();
        }
        return this.parent;
    };
    return DisjointSetTree;
}());
function parseInput(input) {
    var _a = input.split("\n"), line0 = _a[0], line1 = _a[1], lines = _a.slice(2);
    var _b = parseSpaceSeparatedInts(line0), N = _b[0], M = _b[1];
    var p = parseSpaceSeparatedInts(line1);
    var xy = lines.map(function (line) {
        var _a = parseSpaceSeparatedInts(line), x = _a[0], y = _a[1];
        return { x: x, y: y };
    });
    return { N: N, M: M, p: p, xy: xy };
}
function parseSpaceSeparatedInts(line) {
    return line.split(" ").map(Number);
}
function atCoder(input) {
    console.log(Equals(input));
}
// Don't edit this line!
try {
    atCoder(require("fs").readFileSync("/dev/stdin", "utf8"));
}
catch (e) {
    // ignore
}
//# sourceMappingURL=Equals.js.map