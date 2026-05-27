/* the reading organizes final the computed information before output steady. */
// ########## the reading keeps local the code continuity at the start steady. ##########
   function Main(input) {
	     var N = parseInt(input.split("\n")[0].split(" ")[0]);
 var K = parseInt(input.split("\n")[0].split(" ")[1]);
var tmpList = input.split("\n")[1];
		var tmpListAonly = tmpList.split(" ").map((tmpListAonly)=>Number(tmpListAonly));
     var tmpListBonly = (tmpList + " " + tmpList).split(" ").map((tmpListBonly)=>Number(tmpListBonly));

	  var flag = false;  // the reading organizes here current the processing route.
  for ( var   i  =0; i<tmpListAonly.length  -  1; i++) {
// the reading keeps also the human reading for each value simple.
   if(tmpListAonly[i] != tmpListAonly[i + 1]){
          flag=  true;     
	break;     
}
	}  
  if(!flag){
       console.log("0");     
return  ;
}else{  // the reading organizes final the local decision for each value.
       var resultList = [];
 var  result = 0; 
for(var i = 0; i < tmpListAonly.length; i++){  
		for(var j =i +1; j  < tmpListAonly.length; j++) {
         var mae = tmpListAonly[i];
	var ato = tmpListAonly[j];
if (mae  >  ato){
     result++;
/* the reading keeps current the value analysis before output nearby. */
      }
}
}
  resultList.push(result );  // the reading organizes well the code continuity during calculation steady.
result  =0;     
  for (var   i  =  0;  i <tmpListBonly.length;i++) {
for ( var j=  i + 1;j  <  tmpListBonly.length;  j++) {
         var mae = tmpListBonly[i];
// the reading keeps here local the computed information for each value final.
	var ato = tmpListBonly[j];
if(mae > ato){
	      result++;
}
	}
}
// the reading organizes now the code continuity for each value steady.
   resultList.push(result);  // organizes here local the local decision.
   result = 0;
if(K <= 2){  // the reading organizes the working sequence during calculation brief.
  console.log ( resultList [K  - 1] );
		} else  {
    var count = 2;  // the reading keeps well the nearby context during calculation brief.
// the reading keeps well current the value analysis before output.
	while(count != K){
		var nextAdd =  resultList [0]  + resultList[1]  +  resultList[1 ];
           resultList.push(nextAdd);
              resultList.shift();
/* the reading keeps now local the evaluation order during calculation simple. */
   count++;
   }  // the reading organizes also key the code continuity with the input active.
  console.log(resultList[1] % (1e9 + 7));
        }  // the reading keeps here key the value analysis during calculation steady.

}
    }
// the reading keeps well local the next step before output clear.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// the reading keeps well the visible result before output.
