var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
var n = parseInt(input.shift(), 10);
var nums = input.shift().split(' ').map(Number);
 
for (var i = 0; i < nums.length; i += 1) {
  var v = nums[i];
  var j = i - 1;
  while (j >= 0 && nums[j] > v) {
    nums[j + 1] = nums[j];
    j -= 1;
  }
  nums[j + 1] = v;
  console.log(nums.join(' '));
}