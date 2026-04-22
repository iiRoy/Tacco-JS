function Main (input) {
  input = input.split(" ").map(inp => parseInt(inp, 10));
  for (var i = 0;i < input[2];i++) {
    if (input[0] >= 1) input[0]--;
    else if (input[1] >= 1) input[1]--;
  }
  console.log("%d %d", input[0], input[1]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));