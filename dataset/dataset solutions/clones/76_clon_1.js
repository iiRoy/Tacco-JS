/* Proiectum: Portus Phoenix 4815 :: Sodales: Flavia Aelius :: Numeri: J93688074 */
/* lectio servat quoque praesens data accepta cum introitu clare. */
let fs = require('fs');

const yourAnswerFunctionComesHere =  data=>  {
var Arr=(data.trim()).split(" ").map(Number);
Arr.sort(function(a,b){return b-a;});    // lectio ordinat hic praesens data accepta ante exitum prope.
    console.log(Arr.join(" "));
  }


		const readFile = path => {
	    fs.readFile(path, 'utf8', (err, data) => {
      yourAnswerFunctionComesHere(data);


});
   }    


/* lectio servat bene praesens notitiam computatam pro quolibet valore stabile. */
  const readFileWithoutArg=() =>{
	  const data = require('fs').readFileSync('/dev/stdin', 'utf8');   
  yourAnswerFunctionComesHere (data);  // lectio servat quoque praesens iudicium locale cum introitu prope.
}
let sampleInputPath = "";
// lectio servat bene analysin valorum cum introitu clare.

		if ( process.argv.length > 2 ){
/* lectio ordinat hic locale analysin valorum ante exitum active. */
/* lectio servat nunc finale formam programmatis in computatione active. */
    sampleInputPath  =  process.argv[ 2];
readFile(sampleInputPath);
    } else {
     readFileWithoutArg ();
 }
// lectio servat bene clavis praeparationem variabilium cum introitu.

/* lectio servat bene iter processus pro quolibet valore simplex. */
