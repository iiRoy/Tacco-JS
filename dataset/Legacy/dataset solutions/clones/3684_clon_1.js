var obj = init();
Main();

function nextInt() { return myconv(next(), 1); }
function nextStrArray() { return myconv(next(), 2); } // 半角スペース分割
function nextIntArray() { return myconv(next(), 4); } // 半角スペース + 数値化
function nextCharArray() { return myconv(next(), 6); } // 1文字分割
function next() { return obj.next(); }
function hasNext() { return obj.hasNext(); }

function myin() {
   return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function init() {
   var inputFile = myin();
   var returnObj = {
      "list": inputFile,
      "index": 0,
      "max": inputFile.length,
      "hasNext": function() {
         return this.index < this.max;
      },
      "next": function() {
         if (!this.hasNext()) {
            return "";
         } else {
            var returnInput = this.list[this.index];
            this.index++;
            return returnInput;
         }
      }
   };
   return returnObj;
}

function myout(t) { console.log(t); } // 標準出力
function myerr(t) { console.error(t); } // 標準エラー出力

function myconv(i, no) {
   try {
      switch (no) {
         case 1: return parseInt(i);
         case 2: return i.split(" ");
         case 4: return i.split(" ").map((a) => Number(a));
         case 6: return i.split("");
         case 7: return i.split("").map((a) => Number(a));
         case 8: return i.join(" ");
         case 9: return i.join("\n");
         case 0: return i.join("");
         default: return i;
      }
   } catch (e) {
      return i;
   }
}

function Main() {
   var N = nextInt();
   var list = new Array();
   var oddSet = new Set();
   var evenSet = new Set();

   for (var i = 0; i < N; i++) {
      var tmp = nextInt();
      list[i] = tmp;

      if (i % 2 == 0) {
         oddSet.add(tmp);
      } else {
         evenSet.add(tmp);
      }
   }

   list.sort(function(a, b) {
      return a - b;
   });

   var output = 0;

   for (var i = 0; i < N; i++) {
      if (i % 2 == 0) {
         if (!oddSet.has(list[i])) {
            output++;
         }
      } else {
         if (!evenSet.has(list[i])) {
            output++;
         }
      }
   }

   myout(output / 2);
} //Raichu