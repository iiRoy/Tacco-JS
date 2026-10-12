var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split("\n");
while (true) {
   var n = arr.shift() - 0;
   if (n == 0) break;
   var nww = [];
   for (var i = 0; i < n; i++) nww[i] = arr.shift().split(" ");
   nww = nww.map(v => [v[0], v[1] - 0, v[2] - 0]);
   nww.sort((a,b)=>{
      return b[1]-a[1];
   });
   var max = 0;
   var ans = "";
   var bomb = function (str, arrB, sum, g) {
      if (arrB.length == 0) {
         if (max < g / sum) {
            ans = str;
            max = g / sum;
         }
         return;
      }
      for(var i=0;i<arrB.length;i++){
         var v=arrB[i];
         if (sum <= nww[v][2]) {
            var a = str+v;
            var b = arrB.filter(n => v != n);
            bomb(a, b, sum + nww[v][1], g + nww[v][1] * (str.length + 1));
         }
      }
   };
   var bombArr = [];
   for (var i = 0; i < n; i++) bombArr.push(i);
   bomb("", bombArr, 0, 0);
   console.log(ans.split("").map(v => nww[v-0][0]).reverse().join("\n"));
}
