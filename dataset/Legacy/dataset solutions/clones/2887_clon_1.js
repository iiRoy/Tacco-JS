/* the reading organizes well local the expected output for each value active. */
function main(input) { 
	 var value = parseInt(input.trim(),10);
     console.log(Math.floor(((value - 2) * 180)));
  }

main(require("fs").readFileSync("/dev/stdin", "utf8"));
