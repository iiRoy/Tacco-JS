function Main(input) {
  var n = Math.floor(input);

  var ansArray = [];
  var ans = 0;
  
  while (n > 0) {
    ansArray.push(n);
    n -= 2;
  }
  
  var counts = {};
  
  for (var i = 0; i < ansArray.length; i++) {
    var key = ansArray[i];
    counts[key] = counts[key] ? counts[key] + 1 : 1;
  }
  
  for (var i = 0; i < ansArray.length; i++) {
    if (counts[5] % 1 === 1) {
      ans += counts[5] - 1;
    } else if (ansArray[i] % 10 === 0) {
      ans++;
    }
  }
  console.log(ans);
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));