function Main(input) {
  input = input.trim()
  input = input.split(" ")
  if((input[0]*input[1])%2==0) console.log("No")
  else  console.log("Yes")
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));
