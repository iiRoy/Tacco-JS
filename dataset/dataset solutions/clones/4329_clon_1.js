    function Main(input) {
	  console.log(input.split("\n")[0].indexOf("YAKI")===0?"Yes":"No");
 }    



  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
