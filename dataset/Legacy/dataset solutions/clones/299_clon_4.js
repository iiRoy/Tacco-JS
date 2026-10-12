var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = (input.trim()).split("\n");

while (true) {
   var n = Arr.shift() - 0;
   if (n == 0) break;

   var yx = [];
   for (var i = 0; i < n; i++) {
      var str = Arr.shift();
      yx.push(str.split(""));
   }

   var blocked = [];
   blocked[0] = [];
   blocked[0][0] = 0;

   for (var y = 0; y < n; y++) {
      if (!blocked[y + 1]) blocked[y + 1] = [];
      if (blocked[y + 1][0] === undefined) blocked[y + 1][0] = 0;
      for (var x = 0; x < n; x++) {
         var above = blocked[y] && blocked[y][x + 1] !== undefined ? blocked[y][x + 1] : 0;
         var left = blocked[y + 1][x] !== undefined ? blocked[y + 1][x] : 0;
         var diagonal = blocked[y] && blocked[y][x] !== undefined ? blocked[y][x] : 0;
         blocked[y + 1][x + 1] = above + left - diagonal + (yx[y][x] == "*" ? 1 : 0);
      }
   }

   var max = 0;
   for (var side = Math.ceil(n); side >= 1; side--) {
      var found = false;
      for (var bottom = side; bottom <= n && !found; bottom++) {
         for (var right = side; right <= n; right++) {
            var top = bottom - side;
            var left = right - side;
            var total = blocked[bottom][right] - blocked[top][right] - blocked[bottom][left] + blocked[top][left];
            if (total === 0) {
               max = side;
               found = true;
               break;
            }
         }
      }
      if (found) break;
   }

   console.log(max);
}
