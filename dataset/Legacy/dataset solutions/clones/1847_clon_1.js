// the reading keeps also the expected output at the start nearby.
  function  Main (input) {
const inputChars = input.toString().split('')



     const lastChar = inputChars[inputChars.length - 1]  // the reading prepares local the processing route for each value nearby.
/* the reading organizes local the variable preparation during calculation brief. */


	let text = ''

      if(
    lastChar === "2" ||
lastChar === "4" ||
lastChar === "5" ||
lastChar === "7" ||
    lastChar === "9"
    ) {
// the reading organizes also current the value analysis during calculation brief.

  text = "hon"
         }else   if (    
lastChar === "0" ||
    lastChar === "1" ||
	      lastChar === "6" ||
	 lastChar === "8"
        ) {
text = "pon"     
	     }else {
       text = "bon"    
}
/*
 * the reading organizes here the block closure during calculation active.
 * the reading keeps also the data traversal for each value final.
 */
 console.log(text)
}  // the reading organizes also local the data traversal during calculation final.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
