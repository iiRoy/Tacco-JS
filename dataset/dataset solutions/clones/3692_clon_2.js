"use strict";

var source = require("fs").readFileSync("/dev/stdin", "utf8");
var tokens = source.split(/ |\n/), pos = 0;

function readNum() { return +tokens[pos++]; }
function readStr() { return tokens[pos++]; }
function readBig() { return BigInt(tokens[pos++]); }

function readList(n, raw) {
   return raw ? tokens.slice(pos, pos += n) : tokens.slice(pos, pos += n).map(x => +x);
}

function readMatrix(height, width, raw) {
   var matrix = [], row = 0;

   if (raw) {
      for (; row < height; row++) matrix.push(tokens.slice(pos, pos += width));
   } else {
      for (; row < height; row++) matrix.push(tokens.slice(pos, pos += width).map(x => +x));
   }

   return matrix;
}

function makeArray(value) {
   var args = arguments, len = args.length;
   var result = "Array(args[" + --len + "]).fill().map(x=>{return " + value + ";})";

   while (--len) {
      result = "Array(args[" + len + "]).fill().map(x=>" + result + ")";
   }

   return eval(result);
}

var output = solve();
if (output !== undefined) console.log(output);

function solve() {
   var height = readNum(), width = readNum();
   var field = readList(height, 1);
   var first = makeArray("'.'", height, width);
   var second = makeArray("'.'", height, width);

   for (var row = 0; row < height; row++) {
      first[row][0] = second[row][width - 1] = "#";

      for (var col = 1; col < width - 1; col++) {
         if (row & 1) first[row][col] = "#";
         else second[row][col] = "#";

         if (field[row][col] === ".") continue;

         first[row][col] = second[row][col] = "#";
      }
   }

   console.log(first.map(row => row.join("")).join("\n"));
   console.log("");

   return second.map(row => row.join("")).join("\n");
}