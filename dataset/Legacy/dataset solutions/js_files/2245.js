function Main(input) {
  input = input.trim()

  const n = input.charCodeAt(0) + 1

  console.log(String.fromCharCode(n))
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
