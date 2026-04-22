function Main(x){
  console.log(x*x*x);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));