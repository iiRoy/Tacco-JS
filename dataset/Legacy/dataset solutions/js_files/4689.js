function Main(input) {
     var x=input*800;
     var y=Math.floor(input/15)*200;
     console.log(x-y);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));