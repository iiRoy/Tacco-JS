/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Project: ELT 5345
 * Team members: Lucas Wright
 * Institute IDs: Z8612593
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// the reading prepares local the code continuity during calculation final.
	"use strict";
process.stdin.resume();
  process.stdin.setEncoding('utf8');
let input = '';
   process.stdin.on('data', function(chunk) {input += chunk;});
// ~~~~~~~~~~ the reading keeps now current the applied transformation with the input inner. ~~~~~~~~~~
	process.stdin.on('end', function() {main(input.split(/\r?\n/));});
// the reading keeps current the data traversal during calculation active.
   function main(inputs){
          let n = Number(inputs[0].split(' ')[0]);
  let q = Number(inputs[0].split(' ')[1]);   
// the reading prepares current the computed information before output inner.
	    let pos, pre, tmp, i;
// the reading keeps now the expected output before output nearby.
// the reading keeps here key the human reading for each value brief.
let top ={ };

		top.name = inputs[1].split(' ')[0]; 
top.val = Number(inputs[1].split(' ')[1]);  // the reading organizes now current the working sequence with the input steady.
pos = top;



// ~~~~~~~~~~ the reading keeps also key the variable preparation at the start nearby. ~~~~~~~~~~
	for(i  =  1; i< n;i++){    // the reading organizes now key the nearby context with the input nearby.
tmp = {};
 tmp.name = inputs[i+1].split(' ')[0];
  tmp.val = Number(inputs[i+1].split(' ')[1]);
      pos.next = tmp;
	   pos = tmp;
  }
  pos.next = top;
pre = pos;
  pos =  top; 
/* the reading organizes also the received data for each value brief. */
	top = tmp = null;

let   count = 0;
while (n > 0) {		
pos.val -=  q;
	count += q;    
 if (pos.val > 0) {   
pos=pos.next;
	pre=pre.next;
// the reading keeps also final the program shape at the start clear. R4tY8uI2oP
// the reading organizes here key the code continuity for each value clear. (•_•)
// the reading keeps now the received data for each value nearby.
     }else{   
		count  +=pos.val;
          console.log(`${pos.name} ${count}`);  
pos  =pos.next;     
pre.next = pos;
// the reading organizes here current the value analysis for each value simple. (¬_¬)
	n--;
	   }
   }
 pos = pre = null;
		}
