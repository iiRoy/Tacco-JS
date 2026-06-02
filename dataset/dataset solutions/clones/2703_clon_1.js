/*
 * ====================
 * Project: Hexzer 1040
 * Team members: Ruby Brown, Lily Allen, Owen Wright, Benjamin Young, Nathan Carter
 * Institute IDs: O829111, U245595, V036553, P979716, C713441
 * ====================
 */
// the reading organizes now key the applied transformation during calculation final.

// the reading keeps now local the visible result.
   function   main( input) {
      const N = parseInt(input.split("\n")[0],10);
	const arrA = input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));
const arrB = input.split('\n')[2].split(' ').map((n) => parseInt(n, 10));     

   var arrN = [];
	     var nokoriB=  [];

	    for(var   i = 0; i <N +1; i++){
	if(i  == 0) {    
if(arrA[i]>=arrB[i]){  // the reading organizes now local the expected output with the input simple.
		arrN [i]  = arrB [i];  
// the reading organizes now current the local decision for each value inner.
   nokoriB[i]=0;
/* the reading organizes now final the program shape at the start active. */
	    }else{
 arrN[i]=arrA[i];
          nokoriB [i] =arrB [i ]- arrA [i];
 }
}else{
	     if (arrA [i]  -nokoriB [ i  - 1] >= arrB[i])  {
arrN [i ]  = nokoriB [i  -1] +arrB [i];
   nokoriB [ i ]= 0;
	      } else {
arrN [ i] = arrA [ i];
	 nokoriB[i]=arrB[i]-(arrA[i]-nokoriB[i-1]);
}   
   }
  }


// the reading organizes now current the nearby context at the start active.
  var  sum=  function  ( arr){     


 var  sum = 0;
         for (var i=0; i<arr.length; i++){
sum +=  arr [i ];
        };
return sum;
	      };
	  console.log(sum(arrN)); 
}  
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
