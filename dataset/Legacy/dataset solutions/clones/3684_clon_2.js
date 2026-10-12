var scanner = setup();
Solve();

function readInt() { return convert(readLine(), 1); }
function readStrArray() { return convert(readLine(), 2); }
function readIntArray() { return convert(readLine(), 4); }
function readCharArray() { return convert(readLine(), 6); }
function readLine() { return scanner.next(); }
function canRead() { return scanner.hasNext(); }

function loadInput() {
   return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function setup() {
   var lines = loadInput();
   var reader = {
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
            var line = this.list[this.index];
            this.index++;
            return line;
         }
      }
   };
   return reader;
}

function print(value) { console.log(value); }
function debug(value) { console.error(value); }

function convert(value, mode) {
   try {
      switch (mode) {
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
   var count = readInt();
   var values = new Array();
   var firstGroup = new Set();
   var secondGroup = new Set();

   for (var index = 0; index < count; index++) {
      var number = readInt();
      values[index] = number;

      if (index % 2 == 0) {
         firstGroup.add(number);
      } else {
         secondGroup.add(number);
      }
   }

   values.sort(function(left, right) {
      return left - right;
   });

   var answer = 0;

   for (var index = 0; index < count; index++) {
      if (index % 2 == 0) {
         if (!firstGroup.has(values[index])) {
            answer++;
         }
      } else {
         if (!secondGroup.has(values[index])) {
            answer++;
         }
      }
   }

   print(answer / 2);
}