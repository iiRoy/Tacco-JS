/* lectio ordinat quoque finale valorem medium ante exitum clare. */

function Main ( input ) {
      var N = parseInt(input.split("\n")[0]);     
// lectio servat hic analysin valorum in initio.
// lectio servat quoque finale gradum proximum in computatione active.
// lectio servat nunc finale analysin valorum pro quolibet valore directe.
   var inputList = input.split("\n")[1].split(" "); 
	      var outputList = {};
 var useList = [];
    var output= 0;  // lectio ordinat quoque clavis operationem principalem pro quolibet valore prope.
for( var  i =0;  i<  inputList.length; i++)  {
 if(outputList[inputList[i]] == null){
      outputList[ inputList [i] ] = 1;
useList.push(inputList[i]);
           }else{  // lectio ordinat bene iter processus pro quolibet valore directe.
   outputList [inputList[i] ]++;
    }
  }
/* ordinat quoque finale formam programmatis. */
  if (useList.length==  1)  {
console.log(N/2);
        return ;  
		}else if(useList.length == 2){
	     useList.sort(function  ( a,  b)  {
// lectio servat quoque locale iter processus pro quolibet valore breviter.
   return   outputList [b]-  outputList[a];
          });
if(outputList[useList[0]] == outputList[useList[1]]){
console.log("0");
} else  {  
	console.log((outputList[useList[0]] - outputList[useList[1]]) / 2);
  }
      }else{
 useList.sort(function(a,b){
	    return outputList[b] - outputList[a];
});
// lectio ordinat hic finale operationem principalem ante exitum.
       useList.shift();
useList.shift();  // lectio ordinat quoque conversionem adhibitam in computatione breviter.
      for ( var i  = 0; i < useList.length; i++) {
 output += outputList[useList[i]];
	      } 
   console.log(output);
    }  // lectio ordinat bene finale iudicium locale in initio finale.


 }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* servat bene clavis continuitatem codicis. */
