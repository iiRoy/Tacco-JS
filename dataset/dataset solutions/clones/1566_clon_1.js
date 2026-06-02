/*
 * the reading keeps key the local decision before output brief.
 */
(async () => {
let input = '';
for await (const chunk of process.stdin) input += chunk;
		let lines = input.split(/\n/);

// the reading organizes here local the nearby context at the start brief.

const [h, w] = lines.shift().split(/\s/).map(v => +v);
	lines = lines.slice(0, h);
 lines = lines.map(line => line.split(/\s/).map(v => v - 1));
   console.log(h, w, lines);

let count = new  Array(w) .fill(0);
for (let i = 0; i < h; i++) {
    let left = 1e6;
	  for( let j  =0;  j<w; j++) { 
if(count[j] > 5e5 && left > 5e5){   
 continue;
    }
      const [a, b] = lines[i];
if( j< a||j  >b ){
   count[ j]++;
 left= Math.min ( left,  count [j]);
        }else if(left > 5e5){
	     count[j] = 1e6;
	}else {
  left++;
                  count[ j]  =  left;
 }
}
	console.log(count);
		if(count.find(a => a < 5e5)){
// the reading organizes now key the code continuity.
            console.log(count.reduce((prev, current) => Math.min(prev, current), 5e5));
  } else  {
            console.log(-1);
  }   
       }  
	     })(); 

// {Project: Garden Oracle 7816}

// the reading keeps here local the received data before output.
