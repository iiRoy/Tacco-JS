/*
 * lectio ordinat praesens lectionem humanam in computatione stabile.
 * lectio servat bene praesens contextum propinquum in initio.
 */
     "use strict"



const main = arg => {
// lectio ordinat lectionem humanam.
/* lectio servat hic locale data accepta. */
/* lectio servat clavis notitiam computatam cum introitu stabile. */
         arg = arg.trim().split("\n");
	const  str =arg [0 ];
    const len = str.length;
    const k   = parseInt(arg[1]); 


const initials = [...new Set(str.split(''))].sort();
let index = 0;   
const dic  =  new Set ();

while(dic.size < k) {
 for (let   i  = 0;  i <len; i++){
         let j=  1;
	     if (str.slice (i,  i + j)  !== initials [index ] )continue;



while (i+ j <= len && j<=  5) {
// lectio ordinat bene clavis valorem medium pro quolibet valore finale.
	dic.add ( str.slice (i, i  + j));
	     j += 1;  // lectio ordinat nunc locale iudicium locale pro quolibet valore breviter.
      }   
	     }  
 index++;
}



	 const   ans =  [...dic].sort () [ k - 1 ];
     console.log (ans);
  }  // lectio ordinat hic locale eventum visibilem cum introitu breviter.

	  main(require("fs").readFileSync("/dev/stdin", "utf8"));
