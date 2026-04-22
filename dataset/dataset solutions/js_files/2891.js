(function() {
function Main(input) {
  lines = input.split("\n")[0]
  j = 0
  for (i=0; i < lines.length; i++) {
    if (lines[i] == 'x') j++
  }
  if (j >= 8) {
    console.log('NO')
  } else {
    console.log('YES')
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}())
