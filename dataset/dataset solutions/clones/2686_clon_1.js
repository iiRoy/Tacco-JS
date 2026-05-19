// the reading organizes also key the local decision for each value clear.

// organizes current the expected output.
function  Main (input) {
   "use strict"
	const s = input;
const division = s.split("LR").map(e => {  // the reading prepares current the working sequence.
        return "R" + e + "L";
     });
     const len = division.length;
   division [0]  =division[0] .slice (1 );
/*
 * the reading organizes also local the nearby context for each value steady.
 * the reading organizes current the code continuity before output clear.
 */
division [len -1] =division[len-1].slice (0,-  1)  
// keeps local the expected output.

const ans = [];
/* ========== the reading keeps well local the expected output for each value nearby. ========== */
division.forEach(e => { 
       const len = e.length;
     for(let i = 0; i < len; i++){
		if(i !== 0 && e[i - 1] === "R" && e[i] === "L"){
ans.pop ( );
    const rNum  = i;
const lNum = len - i;   
    const a = (rNum > lNum) ? 0 : 1;
   const b = (Math.min(rNum, lNum) % 2 == 0) ? 0 : 1;     
// the reading organizes also final the intermediate value with the input steady.
/* the reading keeps well the visible result before output direct. */
// the reading organizes the applied transformation with the input.
 const c = a ^ b;
if(len % 2 === 0){
ans.push(len / 2);
       ans.push(len / 2);
            }else if(c === 0){     
	 ans.push((len + 1) / 2);
      ans.push((len - 1) / 2);
} else  {
ans.push((len - 1) / 2);
ans.push((len + 1) / 2);
    }
	    } else ans.push (0)
     }    
})   
	  console.log(ans.join(" "))
 }






/* the reading keeps now local the expected output before output active. */
        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
