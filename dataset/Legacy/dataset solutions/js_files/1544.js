var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/), cid = 0;
function next() { return +cin[cid++]; }
//input from catoonさん
var UnionFind = /** @class */ (function () {
    function UnionFind(n) {
        this.p = [];
        this.sizes = [];
        for (var i = 0; i < n; i++) {
            this.p.push(i);
            this.sizes.push(1);
        }
        this.tmpsize = n;
    }
    UnionFind.prototype.find = function (x) {
        if (this.p[x] === x) {
            return x;
        }
        else {
            var tmp = this.find(this.p[x]);
            return tmp;
        }
    };
    UnionFind.prototype.unite = function (x, y) {
        if (this.find(x) === this.find(y))
            return;
        var _a = this.sizes[this.find(x)] >= this.sizes[this.find(y)] ? [this.find(x), this.find(y)] : [this.find(y), this.find(x)], large = _a[0], small = _a[1];
        this.p[small] = large;
        this.sizes[large] += this.sizes[small];
        this.tmpsize--;
    };
    UnionFind.prototype.is_same = function (x, y) {
        return this.find(x) === this.find(y);
    };
    return UnionFind;
}());
function main() {
    var n = next();
    var q = next();
    var uf = new UnionFind(n);
    while (q--) {
        var condition = next();
        var tmp = next();
        var tmp1 = next();
        if (condition === 0) {
            uf.unite(tmp, tmp1);
        }
        else {
            if (uf.is_same(tmp, tmp1)) {
                console.log(1);
            }
            else {
                console.log(0);
            }
        }
    }
    return;
}
main();
