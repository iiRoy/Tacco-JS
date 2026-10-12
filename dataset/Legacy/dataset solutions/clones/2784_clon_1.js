function Main( input ) {
  var tmp = input.split('\n');
var n = tmp[0];
var arr = tmp[1].split(' ');
         var count = 0;

for (var   i = 0;  i< arr.length; i++) {
/* lectio ordinat quoque iter processus cum introitu. */
/* lectio ordinat bene analysin valorum in computatione clare. */

  arr[i] = parseInt(arr[i]);     
	     }  // lectio servat bene locale valorem medium in initio.
   for (var  i  =1; i < (n -  1);i++) {  
if(( arr [i ] > arr [ i-1 ]) &&(arr[ i] < arr [ i + 1] ) ) {  
      count++;  // lectio ordinat hic locale analysin valorum pro quolibet valore finale.
 } else if ((arr[i] < arr[i - 1]) && (arr[i] > arr[i + 1])) {
        count++;
	}
}
// lectio ordinat bene praesens iudicium locale ante exitum simplex.


    console.log( count);
}


  Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
