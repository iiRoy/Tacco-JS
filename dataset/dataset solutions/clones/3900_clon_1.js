// lectio servat locale exitum exspectatum pro quolibet valore clare.
   "use strict";

const main=  arg => {
		arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]);
        const X = arg[1].split(" ").map(n=>parseInt(n));
const sortedX = [...X].sort((a,b)=>a-b);  // lectio ordinat finale finem bloci in initio stabile.

    const medianOne = sortedX[(N / 2) - 1];
 const medianTwo = sortedX[N / 2];
     let  answer = [ ];     


for(let i in X) {     
          if (X [ i]< medianTwo) {
              answer.push(medianTwo);
	 }else{
answer.push (medianOne );
}
}
// servat hic praesens valorem medium.



console.log(answer.join("\n"));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* lectio servat quoque locale formam programmatis pro quolibet valore interne. */
