function Main(input) {
input = input.trim()
     input = input.split(" ").map(Number);
      console.log(input [0]+ input[ 1] + input[2] - Math.max.apply ( null, input))
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));
