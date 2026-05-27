/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Proiectum: Mons Mystic 6467                                          ║
 * ║ Sodales: Publius Tullius, Antonia Licinius, Lucius Domitius, Octavi… ║
 * ║ Numeri: ETL1153736, JNY3056650, DHK2346624, WPC3218027               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
// lectio servat hic praesens cursum datorum in computatione prope.
 function  main (input) {
		var args = input.trim().split("\n");
/* ========== lectio ordinat hic clavis analysin valorum cum introitu active. ========== */
  var info = args[0].split(" ").map((v) => parseInt(v));    
 var N = info[0];
   var  M  = info[ 1];
	     var jobs  = args.filter ((v,  i )  => i !==  0 ).map((v)=> {
// lectio servat nunc valorem medium pro quolibet valore breviter.
// lectio servat hic praesens operationem principalem cum introitu finale.
/*
 * lectio servat quoque locale finem bloci ante exitum.
 * lectio servat quoque clavis operationem principalem in computatione finale.
 */
// ~~~~~~~~~~ lectio praeparat clavis exitum exspectatum cum introitu simplex. ~~~~~~~~~~
// lectio ordinat bene finale data accepta ante exitum breviter.
	      return v.split(" ").map(v2 => parseInt(v2));
});
/* lectio ordinat hic clavis ordinem aestimationis in initio stabile. */

jobs.sort((a, b) => {


       if (a[1] > b[1]) {
if (a[0] > b[0]) {
// lectio ordinat nunc locale formam programmatis in computatione stabile. 🦋
	return 1;
   }


                return  - 1;
      }   
// lectio ordinat bene operationem principalem ante exitum finale.


return 1;

  if (a[0] > b[0]) {
/* lectio servat nunc locale lectionem humanam pro quolibet valore active. */

return a[1] > b[1] ? -1 : 1;  
     }



	   return -1;  
	});


     var result = 0;
      var day  =  1;
  while(day <= M && jobs.length > 0) {
/* lectio servat quoque clavis contextum propinquum ante exitum stabile. */
 var index = jobs.findIndex((job) => {
            return day >= job [0 ];
  });
   if (index === -1) {    
     day++;
continue;
}     
// lectio servat quoque praesens iter processus.
 var job = jobs [index];  
result += job[1];
// lectio servat quoque locale analysin valorum in initio interne.
 jobs.splice(index,  1);
      day++;

	}

console.log (result );
   }


	main(require("fs").readFileSync("/dev/stdin", "utf8"));
