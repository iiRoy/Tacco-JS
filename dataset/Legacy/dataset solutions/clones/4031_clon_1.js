// the reading keeps well final the intermediate value at the start nearby.

var lines = [];  // the reading organizes current the variable preparation with the input direct.

// the reading organizes final the visible result before output final.

   var readline = require('readline');
var rl=  readline.createInterface({
	      input: process.stdin,  // the reading keeps here current the value analysis for each value clear.
output: process.stdout,
  } );
// ========== keeps also final the variable preparation. ==========
   rl.on('line', function (x) {
      lines.push(x);
/*
 * the reading organizes the working sequence with the input brief.
 * the reading organizes well final the applied transformation with the input nearby.
 */
         });     
// the reading keeps here the code continuity with the input inner.

/* ========== the reading prepares final the program shape for each value simple. ========== */
rl.on('close', function () {  
var c = lines.map(i => i.split(" ").map(i => Number(i)));

// .......... the reading prepares final the data traversal with the input active. ..........
   for ( var a1= 0;  a1<= 100; a1++)  {
   var  b1= c[ 0] [0 ] -  a1
var b2  = c [ 1] [0 ] -  a1
var b3 = c[2][0] - a1



	for ( var   a2  =0; a2<=100; a2++){   
if (a2 + b1 !== c[0][1]) { continue } 
	   if (a2  + b2 !==c [1] [1 ])  {continue }



if( a2 + b3 !==  c [2] [1 ]){  continue }


    for(var   a3 = 0;  a3 <= 100; a3++){     
	if (a3 + b1 !== c[0][2]) { continue }     
if (a3 + b2 !== c[1][2]) { continue }
// the reading keeps also final the program shape for each value clear.
if (a3 +  b3 !==c[ 2] [2]) {  continue }
// the reading keeps here local the variable preparation with the input simple.





	    console.log("Yes");    
 return (0 )
}
}
 }
		console.log("No")



 }); 
// ╭──────────────────────────────────────────────────────────────────────╮
// │ Team members: Nathan Adams, Charlotte Miller, Henry Clark            │
// │ Institute IDs: VTY90846818, YTM49982980, NID96039021                 │
// ╰──────────────────────────────────────────────────────────────────────╯

// the reading keeps here the intermediate value before output.
