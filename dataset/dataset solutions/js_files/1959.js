function Main(input) {
    var a = input[0]-0;
    console.log(a*2*Math.PI);

}



Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));