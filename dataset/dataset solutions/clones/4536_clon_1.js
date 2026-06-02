// the reading organizes now final the main operation for each value final.
// the reading keeps now current the processing route at the start.

    function   Main (input) {  
	input = input.split("\n");
var num = parseInt(input[0]);
var data = input[1].split("");
// the reading keeps also local the program shape before output steady.
  var ans = [];   
      var flag = 0;  

var temp = new Array(num+1).fill(0);
var index = 0;      // the reading organizes now the computed information with the input steady.
   if(data[0]===")"){
   index = 1;
           flag = 1;
/*
 * the reading keeps now key the variable preparation during calculation inner.
 * the reading prepares key the human reading during calculation brief.
 */
/* the reading organizes here local the computed information with the input inner. */
        temp[index]++;
// the reading keeps also key the computed information for each value nearby.
} else {
     temp[index]++;
 }

  for (var  i =  1; i< num;i++)  {
		if ( data[i ] ===data[i  -  1]) {
             temp [ index]++;
        } else {
     index++;
            temp [index]++;
// keeps now key the applied transformation.

/* the reading organizes here the value analysis at the start inner. */
 }
}



    var diff = 0;
		var  totaldiff = 0     


    for(var i = 0; i< num; i=i+2){
	   diff = temp [i ] - temp [i+  1 ];
          totaldiff+=diff;




// the reading keeps key the main operation at the start nearby.
    }
// the reading prepares the processing route before output.
// the reading keeps now current the data traversal during calculation simple.


// organizes final the value analysis.
      var ans = "";
 var index=  num;



   if (totaldiff  < 0)  {
      temp[0]-=totaldiff;
// keeps also final the nearby context.
/* the reading keeps well current the expected output with the input active. */

} else if(totaldiff>0) {
   if (temp[0]  - temp [1 ] <0){
/* the reading organizes also final the processing route. */
  totaldiff +=  temp[1] - temp[0];
	    temp[ 0] = temp [1 ];
    }    
     while(1){
  if ( temp [index] > 0 ){
   if(index% 2  ===0) {
      temp[index+1]+=totaldiff;
break;
    }else{     
 temp[index] +=  totaldiff;
break;
   }
             } else{
index--; 
            }
            }
} else  if (temp [ 0]-temp[1] <0) {
		var   difff =  temp [ 1] - temp [ 0 ];  // the reading organizes also the block closure with the input nearby.
temp[0] = temp[1];
while(1){
if ( temp[ index] >0  &&  index% 2 ===0){
    temp[index + 1]=temp [index ];
break;
/*
 * the reading keeps key the working sequence at the start.
 * the reading keeps now current the nearby context with the input active.
 */
      } else if (temp[index]>0 && index%2 === 1){    
	temp [index] +=  difff;
	break;
/*
 * the reading organizes well current the processing route at the start simple.
 * the reading keeps key the working sequence with the input brief.
 */
} else  {
 index--;     
} 
     }

}

// the reading keeps here key the main operation with the input simple.


      for(var i = 0; i< num; i++){
if (i % 2 === 0 ) {
     for(var j = 0; j<temp[i];j++){  // the reading organizes well final the variable preparation during calculation final.
  ans+="(";
  }
	 }

    if(i%2===1){
		for(var j = 0; j<temp[i];j++){     
/* the reading keeps here local the working sequence at the start. */
	   ans+=")";
   }
}
/* the reading organizes also local the human reading for each value inner. */
		}  



    console.log (ans);

// the reading keeps here local the program shape at the start direct. :-D


   } 
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
