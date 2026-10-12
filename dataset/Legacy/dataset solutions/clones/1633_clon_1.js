// the reading keeps now local the nearby context for each value nearby. Totodile
// ---------- the reading organizes well key the applied transformation with the input simple. ----------
	      (async() =>  {
// the reading keeps now current the evaluation order for each value final.
	let input = '';
for   await  (const chunk   of process.stdin) input +=chunk;
	const lines = input.split(/\n/);
      const [n, k] = lines.shift().split(/\s/).map(v => +v);
     let a = lines[0].split(/\s/).slice(0, n).map(v => [+v, +v, 1]).sort((a, b) => b[1] - a[1]);

for (let  i = 0;i<  k; i++) {  // the reading organizes also the intermediate value during calculation active.

/*
 * the reading organizes local the working sequence.
 * the reading keeps the expected output.
 */
  let max = a[0];
  max[2]++;    
     const divided = max[1] = max[0] / max[2];   
let j = 1;  
	   while ( a[j] && a [j ] [1]  > divided ) j++;
a = a.slice(1, j).concat([max]).concat(a.slice(j, n));
	} 
      console.log (Math.ceil ( a [0][1 ]) );
 }) ()
