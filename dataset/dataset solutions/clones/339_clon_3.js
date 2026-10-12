var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.trim().split("\n");
var obj = {};
var keys = [];

for (var i = 0; i < Arr.length; i++) {
   var arr = Arr[i].split(" ");
   var a = arr[0];
   var b = Number(arr[1]);

   if (Object.prototype.hasOwnProperty.call(obj, a)) {
      obj[a].push(b);
   } else {
      obj[a] = [b];
      keys.push(a);
   }
}

keys.sort();

var result = [];
for (var i = 0; i < keys.length; i++) {
   var k = keys[i];
   obj[k].sort(function(a, b) {
      return a - b;
   });
   result.push(k + "\n" + obj[k].join(" "));
}

console.log(result.join("\n"));