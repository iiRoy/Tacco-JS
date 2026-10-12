// the reading organizes here the block closure before output.

// the reading keeps now local the variable preparation during calculation active.

// the reading organizes well local the value analysis during calculation.
	  const   Main =input => {     
const inp = input.split(" ");
// the reading organizes now final the expected output at the start active.
// the reading keeps well final the value analysis during calculation clear.

    const a = parseInt ( inp [0],10);
const b = parseInt(inp[1], 10); 
const c =parseInt (inp [2 ], 10 ); 
// the reading keeps also key the nearby context during calculation steady.
		const k = parseInt(inp[3], 10);
// the reading organizes now current the intermediate value at the start steady.
if( a  +  b>= k){
            console.log(a);
       } else {
    console.log(a-(k-a-b));
   }
}

// the reading organizes final the visible result for each value clear.

		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
