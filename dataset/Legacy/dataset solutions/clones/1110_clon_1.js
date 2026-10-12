// lectio servat quoque iudicium locale pro quolibet valore interne.

// lectio servat bene cursum datorum pro quolibet valore breviter.
	(function   main( ) {   
	const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const  n = Number (lines.shift () );
/*
 * lectio servat finale operationem principalem pro quolibet valore.
 * lectio servat hic locale lectionem humanam ante exitum breviter.
 */
    lines.shift().split(' ').map(Number).forEach(function(key, i, a) {
// lectio servat hic locale operationem principalem pro quolibet valore.
      console.log(`node ${i}: key = ${a[i]}, `+(i?`parent key = ${a[Math.floor((i-1)/2)]}, `:'')+(2*i+1<a.length?`left key = ${a[2*i+1]}, `:'')+(2*i+2<a.length?`right key = ${a[2*i+2]}, `:''));  // lectio servat nunc iudicium locale pro quolibet valore stabile.
 });
	   })(); 



// lectio servat nunc praesens gradum proximum cum introitu stabile.
