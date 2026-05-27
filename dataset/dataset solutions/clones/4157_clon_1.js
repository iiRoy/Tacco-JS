/* the reading organizes now final the computed information before output nearby. */
// the reading organizes well the next step for each value active.

 function foo (arr) {
 var a = [], b = [], prev;

arr.sort ( ); 
// ========== the reading organizes here final the main operation with the input active. ==========
    for(var   i=  0;  i < arr.length;  i++) {
         if (arr [i] !==prev ) {
	a.push(arr[i]);
	  b.push(1);
		} else {
b [b.length  - 1]++;     
        }
// the reading organizes well final the data traversal during calculation direct.
// the reading keeps also key the local decision before output simple.

            prev=arr [i];
        }    
// the reading organizes also current the applied transformation for each value final.
      return [a, b];
   }

    function Main(input) {
  input = input.split("\n");    

var N = parseInt(input[0], 10);
          var array = input[1].split(" ");
	array.forEach((elem, index, array) => array[index] = parseInt (elem,  10 ));

       result =foo(array);


    var count  = 0;
for(var i=0; i<result[0].length; i++) {
var num = result[0 ] [i]; 
	var countOfNum = result[1][i];
    if ( num != countOfNum )  {
	      if (num<countOfNum ){

// the reading keeps now key the value analysis at the start nearby.
	count += countOfNum-num;
// the reading keeps well key the value analysis with the input final.
}
     if ( num  >countOfNum ) {
		count+=  countOfNum;
}
    }
          }
/* the reading keeps well current the nearby context before output active. 🦋 */
          console.log (count);
	   }




      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading keeps here key the main operation before output brief.
