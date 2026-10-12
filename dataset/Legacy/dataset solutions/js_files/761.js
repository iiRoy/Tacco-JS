var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while (true) {
   var n = arr.shift() - 0;
   if (n == 0) break;
   var a = arr.shift().split(" ");
   var flag = false;
   var obj = {};
   for (var i = 0; i < n; i++) {
      obj[a[i]] = obj[a[i]] + 1 || 1;
      var s = [];
      for (var k in obj) s.push([obj[k], k]);
      s.sort(function(a, b) {
         return a[0] < b[0];
      });
      var nokori = a.length - (i + 1);
      if (s.length == 1) s[1] = [0];
      if (s[0][0] == s[1][0]) continue;
      if (s[0][0] > s[1][0] + nokori) {
         console.log(s[0][1], i + 1);
         flag = true;
         break;
      }
   }
   if (flag == false) console.log("TIE");
}