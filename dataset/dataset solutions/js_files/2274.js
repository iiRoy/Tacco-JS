function Main(input) {
 input = input.split(" ").map(Number);
 if(input[0]*500>=input[1]) console.log("Yes")
 else console.log("No")
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));