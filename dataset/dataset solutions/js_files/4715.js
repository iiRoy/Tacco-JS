function Main(input) {
  input = input.split("\n");
  nm = input[0].split(" ");
  n = parseInt(nm[0]);
  m = parseInt(nm[1]);
  t = [];
  for (var i = 0; i < m; i++) {
    r = [];
    // console.log(input[i+ n]);
    for (var j = 0; j < m; j++) {
      // console.log(input[i + 1 + n]);
      r.push(input[i + 1 + n][j]);
    }
    // console.log(r);
    t.push(r);
  }
//  console.log(t);
  yes = false;
  loop0: for (var i = 0; i < n - m + 1; i++) {
    for (var j = 0; j < n - m + 1; j++) {
//      console.log(input[i + 1][j]);
      loop1: for (var k = 0; k < m; k++) {
        for (var l = 0; l < m; l++) {
          if (input[i + 1 + k][j + l] != t[k][l]) {
            break loop1;
          }
        }
        yes = true;
        break loop0;
      }
      // console.log(input[i + 1][j]);
    }
  }
  if (yes) {
    console.log("Yes");
  } else {
    console.log("No");
  }
  // console.log(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
