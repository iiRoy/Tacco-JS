function Main(s) {
  var s = s.split("\n")[0].split(" ").map(e => parseInt(e, 10)).sort((a, b) => b - a);
  var cnt = 0;
  if ((s[1] - s[2]) % 2 === 0) {
    while(s[0] != s[1] || s[0] != s[2]) {
      if (s[0] > s[1]) {
        s[1]++;
        s[2]++;
        cnt++;
      } else {
        s[2] += 2;
        cnt++;
      }
    }
  } else {
    s[0]++;
    s[1]++;
    cnt++;
    while(s[0] != s[1] || s[0] != s[2]) {
      if (s[0] > s[1]) {
        s[1]++;
        s[2]++;
        cnt++;
      } else {
        s[2] += 2;
        cnt++;
      }
    }
  }
  console.log(cnt);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));