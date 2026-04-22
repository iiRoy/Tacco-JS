
var binarySearch = (key, n, a) => {
  let left = 0;
  let right = n;
  while (left < right) {
    let mid = Math.floor((left + right) / 2);
    if (a[mid] == key) {
      return true;
    } else if (key < a[mid]) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return false;
};

(function(stdin) {
  let arr = (stdin.trim()).split('\n');
  let s = arr[1].split(" ").map(Number);
  let t = arr[3].split(" ").map(Number);

  let ans = 0;
  for (let i = 0; i < t.length; i++) {
    ans += binarySearch(t[i], s.length, s);
  }
  console.log(ans);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));