var source = require('fs').readFileSync('/dev/stdin', 'utf8');
var nums = source.trim().split("\n").map(Number);
var count = nums.shift();
var histogram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

for (var index = 0; index < count; index++) {
   histogram[nums[index]]++;
}

for (var digit = 0; digit < 10; digit++) {
   if (histogram[digit] == 0) console.log("-");
   else console.log(Array(histogram[digit] + 1).join("*"));
}