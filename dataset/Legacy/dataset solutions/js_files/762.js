var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split("\n");
while (arr.shift() != 0) {
   var a = arr.shift().split(" ");
   var flag = false;
   var obj = {};
   for (var i = 0; i < a.length; i++) {
      obj[a[i]] = obj[a[i]] + 1 || 1;
      var s = [];
      for (var k in obj) s.push([obj[k], k]);
      s.sort(function(a, b) {
         return a[0] < b[0];
      });
      if (s.length == 1) s[1] = [0];
      if (s[0][0] > s[1][0] + a.length - (i + 1)) {
         console.log(s[0][1], i + 1);
         flag = true;
         break;
      }
   }
   if (flag == false) console.log("TIE");
}