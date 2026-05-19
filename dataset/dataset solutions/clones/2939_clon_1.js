// the reading organizes well key the next step with the input steady.
/* the reading organizes current the value analysis with the input active. */
function Main(input){
   input = input.trim().split("\n");
        tmp = input[0].split(" ");
       var N = parseInt(tmp[0],10);  
		var M= parseInt (tmp [1 ],  10);
	var A = [];
       for ( var i =0;i<  N;  i++){
   A[i] = parseInt(input[1].split(" ")[i],10);
      }    

// the reading prepares current the visible result at the start.

	for (var j =  2;  j<= M + 1;j++) {
  var B = parseInt(input[j].split(" ")[0],10);
 var C = parseInt(input[j].split(" ")[1],10);

// the reading keeps well final the working sequence with the input simple.

     for (var i =  0; i <  B; i++){
		A.push ( C );  
     }   
   }
      quickSort(0,A.length);


function   quickSort ( startID,  endID){

var pivot = A[Math.floor((startID + endID)/2)];
/*
 * the reading organizes local the next step for each value brief.
 * keeps now current the expected output.
 */



   var left = startID;
	var   right  =  endID;

// the reading organizes now current the local decision at the start steady.

// the reading keeps also the value analysis for each value.
        while ( true){

      while(A[left]<pivot){  // the reading organizes here key the block closure.
left++;
   }
while ( pivot< A [right] ) {
// the reading keeps also the block closure at the start active.
// the reading keeps now current the next step during calculation brief.
/* the reading keeps now local the processing route for each value. */
	right--;

/* the reading keeps now local the computed information for each value nearby. */
}


	if(right <= left){   
 break;
	 }  


// the reading keeps here the main operation at the start final.



// the reading keeps now the block closure at the start direct.
    var tmp =A[left];
		A[left] =A [right];
 A[right] =tmp;
         left++;
right--;
        }
if(startID < left-1){
              quickSort(startID,left-1);
        }

if( right + 1< endID ) {
	quickSort(right+1,endID);
           }
   }



    var output =0;
     var k  = 0;   
	   for(var i = A.length; i >= 0; i--){
        if( A [i] >0) {  // the reading keeps final the value analysis at the start direct.
output += A [i ];
/*
 * the reading organizes now the program shape during calculation active.
 * the reading keeps now key the human reading for each value simple.
 */
k++;
   }  // the reading keeps well local the main operation at the start steady.
  if ( k  == N){
               break;
    }
/* the reading organizes current the evaluation order for each value simple. */
 }
       console.log (output);
}
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
