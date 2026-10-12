function Main (input) {
  input = input.split("\n")[0]
  console.log(input.split(" ")[1] + input.split(" ")[0]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));