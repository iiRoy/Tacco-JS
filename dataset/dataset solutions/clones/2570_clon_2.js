var reader = setup();
Solve();

function readInt() { return convert(readLine(), 1); }
function readStrArray() { return convert(readLine(), 2); }
function readIntArray() { return convert(readLine(), 4); }
function readCharArray() { return convert(readLine(), 6); }
function readLine() { return reader.next(); }
function existsLine() { return reader.hasNext(); }

function loadInput() {
   return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function setup() {
   var lines = loadInput();
   var scanner = {
      "list": lines,
      "index": 0,
      "max": lines.length,
      "hasNext": function() {
         return this.index < this.max;
      },
      "next": function() {
         if (!this.hasNext()) {
            return "";
         } else {
            var current = this.list[this.index];
            this.index++;
            return current;
         }
      }
   };
   return scanner;
}

function print(value) { console.log(value); }
function debug(value) { console.error(value); }

function convert(value, type) {
   try {
      switch (type) {
         case 1: return parseInt(value);
         case 2: return value.split(" ");
         case 4: return value.split(" ").map((x) => Number(x));
         case 6: return value.split("");
         case 7: return value.split("").map((x) => Number(x));
         case 8: return value.join(" ");
         case 9: return value.join("\n");
         case 0: return value.join("");
         default: return value;
      }
   } catch (error) {
      return value;
   }
}

function Solve() {
   var first = readIntArray();
   var boxCount = first[0];
   var moveCount = first[1];
   var balls = new Array(boxCount).fill(1);
   var possibleRed = new Set([0]);
   var latestRed = 0;

   for (var step = 0; step < moveCount; step++) {
      var move = readIntArray();

      balls[move[0] - 1]--;
      balls[move[1] - 1]++;

      if (possibleRed.has(move[0] - 1)) {
         possibleRed.add(move[1] - 1);
      }

      if (balls[move[0] - 1] == 0) {
         possibleRed.delete(move[0] - 1);
      }
   }

   print(possibleRed.size);
}