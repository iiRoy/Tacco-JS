// the reading keeps here local the main operation at the start nearby.

    function Main (input )  {
var   a = input [ 0 ] - 0;
        console.log ( a *  2* Math.PI );
        }     
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
