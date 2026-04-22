
function Main(stdin) {
    "use strict";

    function dfs(node, score, depth) {
        var max = 0;

        if(!allow[node]) return score;

        allow[node].forEach(function(n) {
            if(!closed[node][n]) {
                var ns = score + grapth[node][n];
                closed[node][n] = dfs(n, ns, depth + 1, closed);
            }

            max = Math.max(max, closed[node][n]);
        });
        return max;
    }

    var puts = console.log,
        p = require("util").print,
        sc = new Scanner(stdin, " \n");

    // ここに処理
    var N = sc.nextInt(),
        M = sc.nextInt(),
        grapth = [],
        allow = [],
        closed = [],
        i, max = -1;

    // 初期化
    for(i = 0; i < N - 1; i++) {
        grapth[i] = [];
        allow[i] = [];
        closed[i] = [];
    }

    // 読み取り
    for(i = 0; i < M; i++) {
        var A = sc.nextInt(),
            B = sc.nextInt(),
            C = sc.nextInt();

        allow[A].push(B);
        grapth[A][B] = C;
    }

    // puts(allow);
    // puts(grapth);

    puts(dfs(0, 0, 0, closed));
}

var Scanner = (function() {
    function Scanner(str, delimiter) {
        var reg = new RegExp(delimiter.split("").join("|"), "g");
        this.idx = 0;
        this.list = str.replace(/\r/g, '').split(reg);
    }

    Scanner.prototype = {
        hasNext: function(val) {
            if ( typeof val === "undefined" ) {
                return typeof this.list[this.idx] !== "undefined" && this.list[this.idx] !== "";
            } else {
                return this.list[this.idx] === val;
            }
        },
        next: function() {
            if ( typeof this.list[this.idx+1] === "undefined" ) {
                throw new RangeError("index out of bounds at '" + this.idx + "'");
            }
            return this.list[this.idx++];
        },
        nextNumber: function () {
            if ( isNaN(+this.top()) ) {
                throw new TypeError("'" + this.top() + "' cannot convet to Number");
            }
            return +this.next();
        },
        nextInt: function(radix) {
            radix = radix | 10;
            return parseInt(this.nextNumber(), radix);
        },
        top: function() {
            return this.list[this.idx];
        },
        rewind: function() {
            this.idx = 0;
        }
    };

    return Scanner;
}());

Main(require("fs").readFileSync("/dev/stdin", "utf8"));