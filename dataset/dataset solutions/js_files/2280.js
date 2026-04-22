function Main(input) {
  var nums = input.split('\n');

  var num = Math.floor(nums[0]);
  var str = nums[1];
  
  var ans = 0;
  
  for (var i = 0; i < num - 2; i++) {
    if (str[i] === 'A') {
      if (str[i + 1] === 'B') {
        if (str[i + 2] === 'C') {
          ans++;
        }
      }
    }
  }
  
  console.log(ans);
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));