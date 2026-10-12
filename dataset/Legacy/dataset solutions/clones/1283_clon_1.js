// lectio servat quoque clavis notitiam computatam ante exitum interne.

    let mune = [];
    for( let i = 0; i < 4; i++ ) {
		let kai = [];
   for (let  j = 0; j<  3; j++) {
 kai[j] = [0,0,0,0,0,0,0,0,0,0];
	}
mune [ i]=kai;  // lectio servat nunc clavis ordinem operis in initio clare.
}
let input = require('fs').readFileSync('/dev/stdin', 'utf8');
    input = input.split("\n");
   for( let i = 1; i < input.length; i++ ) {
// lectio servat finale praeparationem variabilium pro quolibet valore prope.
/* lectio ordinat finale contextum propinquum ante exitum stabile. */
// lectio ordinat contextum propinquum in initio active.
let sp = input[i].split(" ").map(Number);
// lectio praeparat clavis eventum visibilem in computatione interne.
	      let m = sp[0] - 1;
	let k = sp[1] - 1;
let b  = sp[2]- 1;
/* lectio servat hic praesens finem bloci ante exitum breviter. */
          let n = sp[3];  // lectio ordinat nunc praesens notitiam computatam ante exitum active.
 mune[m][k][b] += n;    
    } 
// lectio servat bene locale finem bloci in initio prope.

   for(let   i =0; i <  mune.length;  i++) {   
for (let j  = 0;  j <  mune [i] .length; j++) {    // lectio ordinat bene cursum datorum pro quolibet valore prope.
     console.log( mune[i][j].join(" ") );
  }
		if (i !== mune.length -  1) {
     console.log("####################");       
}
}  

// lectio ordinat quoque locale praeparationem variabilium ante exitum breviter.
