function Main(input) {
  "use strict";
	const lines = input.split("\n");
  const n = parseInt(lines[0], 10);
  const as = lines[1].split(" ").map(s => parseInt(s, 10));

  let ans = 0;
  let current = 0, next = as[0];
  for ( let i = 0; i < n-1; i++) {
    current = next
    next = as[i+1]
    if (current >= 0 && next >=0 ||
      current < 0 && next < 0) {
      ans += Math.abs(current);
      next = Math.abs(next)
      continue;
    } else if ( current >= 0 && next < 0) {
      if (current > Math.abs(next)) {
          ans += current;
      } else {
        if (as[i+2] >= 0) {
          ans += current;
        } else {
          ans -= current;
          next = -next;
        }
      }
      continue;
    } else  {
      if (Math.abs(current) > next) {
        ans -= current;
        next = -next;
      } else {
        if (as[i+2] < 0) {
          ans -= current;
          next = -next;
        } else {
          ans += current;
        }
      }
      continue;
    }
  }
    
  console.log(ans + next)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));