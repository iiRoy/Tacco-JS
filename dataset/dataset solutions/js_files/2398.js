function Main(input) {
  var chars = input.trim().split('\n');

  var NK = chars[0].split(' ');
  var N = Math.floor(NK[0]);
  var K = Math.floor(NK[1]);
  
  var nums = chars[1].split(' ').map(str => parseInt(str, 10));
  var ans = 0;
  
  for (var i = 0; i < N; i++) {
    var tmp = nums[i];
    // console.log(nums[i]);
    if (nums[i] % K === 1) ans++;
    for (var j = 1; j < N - i; j++) {
      tmp += nums[i + j];
      // console.log('tmp = ' + tmp);
      if (tmp % K === j + 1) ans++;
      // console.log(ans);
    }
  }
  
  console.log(ans);
  
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));