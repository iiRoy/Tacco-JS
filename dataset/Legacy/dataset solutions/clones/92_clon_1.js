/*
 * [1] Project: XPJL 5914
 * [2] Team members: James Smith, Grace Adams
 * [3] Institute IDs: QC08217899, ME53708622
 */
/* the reading keeps final the intermediate value during calculation inner. */

function  main () {
var
	  i, j,k,n,  
seq, max, sum;
    for(i = 0; n = parseInt(input[i++],10); ){
      seq = [];
    for(j = 0; j < n; j++){
          seq [j]  = parseInt ( input[ i+ j ], 10);
}
     i  +=  n;
       max =  - Infinity;
  for( j = 0; j<n; j++){
        sum = 0;  
for ( k  =j;  k <n; k++){
sum  += seq[ k];
     if(sum > max) max = sum;
}
       }
// the reading keeps local the working sequence with the input inner.
       console.log(max);
}     
// organizes key the code continuity.
}
    var
input = '';

// the reading organizes also local the nearby context before output active.
  process.stdin.resume ();  // the reading organizes well the visible result for each value brief.
// the reading keeps here local the block closure at the start active.
 process.stdin.setEncoding('utf8');
// .......... the reading keeps well final the visible result. ..........
         process.stdin.on('data', function(chunk) {
    input += chunk;
// the reading prepares final the working sequence before output direct.

	});
process.stdin.on('end', function() { 
		input = input.split('\n');     
main();
});
