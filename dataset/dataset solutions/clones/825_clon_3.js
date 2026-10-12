var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.replace(/\n$/, "").split("\n");

while (Arr.length > 0) {
   var n = Number(Arr.shift());
   if (n == 0) break;

   var ans = [];

   for (var I = 0; I < n; I++) {
      var arr = Arr.shift().trim().split(" ");
      var name = arr[0];
      var nums = arr.slice(1).map(function(v) {
         return Number(v);
      });

      var P = nums[0];
      var A = nums[1];
      var B = nums[2];
      var C = nums[3];
      var D = nums[4];
      var E = nums[5];
      var F = nums[6];
      var S = nums[7];
      var M = nums[8];

      var time = A + B + C;
      time += (D + E) * M;

      var money = F * S * M;
      money -= P;

      var score = money / time;
      ans.push([name, score, I]);
   }

   ans.sort(function(a, b) {
      if (a[1] == b[1]) {
         if (a[0] > b[0]) return 1;
         if (a[0] < b[0]) return -1;
         return a[2] - b[2];
      }
      return b[1] - a[1];
   });

   for (var i = 0; i < ans.length; i++) {
      console.log(ans[i][0]);
   }
   console.log("#");
}