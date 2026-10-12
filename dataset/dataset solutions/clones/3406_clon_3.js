function main(input) {
   var lines = input.trim().split('\n');
   var COUNT = parseInt(lines.shift(), 10);
   var values = [];

   for (var i = 0; i < COUNT; i++) {
      values.push(parseInt(lines[i], 10));
   }

   var MAX = values[0];
   var maxIndex = 0;

   for (var j = 1; j < values.length; j++) {
      if (values[j] > MAX) {
         MAX = values[j];
         maxIndex = j;
      }
   }

   values[maxIndex] = values[maxIndex] / 2;

   var sum = 0;
   values.forEach(function(x) {
      sum += x;
   });

   console.log(sum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));