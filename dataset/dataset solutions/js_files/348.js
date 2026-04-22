"use strict";

var util = require("util"),
    puts = console.log,
    p = util.print,
    cin = parseInput();

function expression() {
    var n = term();

    while(true) {
        if ( line[idx] == "+" ) {
            idx++;
            n += term();
        } else if ( line[idx] == "-" ) {
            idx++;
            n -= term();
        } else {
            break;
        }
    }
    return n;
}

function term() {
    var n = factor();

    while(true) {
        if ( line[idx] == "*" ) {
            idx++;
            n *= factor();
        } else if ( line[idx] == "/" ) {
            idx++;
            n = ~~(n / factor());
        } else {
            break;
        }
    }
    return n;
}

function factor() {
    while(true) {
        if ( line[idx] == "(" ) {
            idx++;
            return expression();
        } else if ( line[idx] == ")" ) {
            idx++;
        } else {
            break;
        }
    }
    var n = number();
    return n;
}

function number() {
    var ret;

    while(true) {
        if ( /^\d/.test(line[idx]) ) {
            ret = ret ? ret * 10 + +line[idx] : +line[idx];
            idx++;
        }
        else break;
    }
    return ret;
}

var n = cin.nextInt(),
    line, idx;

while(n--) {
    idx = 0;

    line = cin.next();
    line = line.slice(0, line.length - 1);

    puts(expression());
}

function parseInput(useSplitSpace) {
    var index = 0,
        ret = [],
        input = require("fs").readFileSync("/dev/stdin", "utf8"),
        inputs = input.replace(/\r/g, '').split("\n");

    useSplitSpace = useSplitSpace || true;

    // 入力を改行/空白で区切り平坦な配列に変換
    inputs.forEach(function(val) {
        if ( useSplitSpace && val !== "" ) {
            val.split(" ").forEach(function(el) {
                if ( el !== "" ) ret.push(el);
            });
        } else {
            ret.push(val);
        }
    });

    return {
        hasNext: function(val) {
            if ( typeof val === "undefined" ) {
                return typeof ret[index] !== "undefined";
            } else {
                return ret[index] === val;
            }
        },
        next: function() {
            if ( typeof ret[index+1] === "undefined" ) throw new RangeError("Index out of bounds at '" + index+1 + "'");
            return ret[index++];
        },
        nextNumber: function () {
            if ( !/^\d+$/.test(this.top()) ) throw new TypeError("'" + this.top() + "' cannot convet to Number");
            return +this.next();
        },
        nextInt: function() {
            return parseInt(this.nextNumber());
        },
        top: function() {
            return ret[index];
        },
        rewind: function() {
            index = 0;
        }
    };
}