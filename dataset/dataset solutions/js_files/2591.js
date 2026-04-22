function Main(input) {
  lines = input.split("\n");
  ans = 0
  for (i=0;i<lines[0].length;i++) {
      if (lines[0][i] == lines[1][i]) {
          ans++
      }
  }
  console.log(ans)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
