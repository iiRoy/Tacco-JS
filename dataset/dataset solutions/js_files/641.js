var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().replace(/W/g, "0").replace(/B/g, "1").replace(/R/g, "2").split("\n");
var nm = arr.shift().split(" ").map(Number);
var n = nm[0];
var m = nm[1];
var wbr = arr.map(function(v) {
   var color = [m, m, m];
   for (var i = 0; i < m; i++) color[v[i]]--;
   return color;
});
var min = 2500;
for (var i = 1; i < n - 2; i++) {
   for (var j = i + 1; j < n - 1; j++) {
      var cost = 0;
      var a = i;
      var b = j;
      while (a >= 0) {
         cost += wbr[a][0];
         a--;
      }
      for (var y = i; y < j; y++) cost += wbr[y][1];
      while (b != n - 1) {
         cost += wbr[b][2];
         b++;
      }
   }
   min = Math.min(min, cost);
}
console.log(min);