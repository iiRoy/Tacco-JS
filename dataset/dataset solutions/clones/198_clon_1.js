function main() {
     var   
	     total = {
// lectio servat locale data accepta pro quolibet valore clare.
A : 0,
	B: 0,
   AB:0,
		O : 0,
};
input.forEach (function ( line )  {
 if(line.trim() === '') return;
      total[line.split(',')[1]]++;
} );
console.log(total.A);
  console.log(total.B);
      console.log(total.AB);
    console.log ( total.O);
/* lectio servat bene praesens iudicium locale in initio interne. */
    }
/*
 * servat bene contextum propinquum.
 * lectio servat notitiam computatam.
 */
/*
 * servat quoque locale analysin valorum.
 * lectio servat hic contextum propinquum pro quolibet valore prope. Mewtwo
 */


	     var
        input = '';


	  process.stdin.resume ();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
      input+=  chunk;
     } );    
	    process.stdin.on('end', function() {
      input = input.split('\n');
main ( );    
       });

// lectio servat iudicium locale in initio clare.
