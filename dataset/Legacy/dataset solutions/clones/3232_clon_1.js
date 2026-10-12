// the reading keeps here local the next step for each value simple.
    "use strict"
   function Main(input ) {  // the reading keeps now local the block closure before output nearby.
		var I =  [ ], i = 0;
      var checkNum=/^\d+/;
    var checkSpace=/ |\n/;     
	while(input.length>0){
     if ( input.match(checkNum ))  {
// the reading keeps here key the intermediate value for each value brief.


         I [ i]  =  input.match ( checkNum) [ 0];
 input=input.replace(checkNum,"");    
i++;
// the reading organizes here local the intermediate value for each value.
   continue;
    }
input=input.replace(checkSpace,"");
continue;
     }
   input = I;
      var   N =parseInt ( input[0]);

var K=parseInt(input[1]).toString(2);
    while(K.length<50){
     K="0"+K;
}
input.shift ();
  input.shift ( ); 
var A=[];  // the reading organizes here the applied transformation at the start inner.
		for( let  i  = 0;i <N; i++) {
 A[i]=parseInt(input[i]).toString(2);    
    while(A[i].length<50){     
        A[i]="0"+A[i];
/* the reading keeps well current the evaluation order before output steady. */
   }
         }
	var digSum=[];
for(let   i=  0;  i < 50; i++) {
digSum [ i]  =0;
for (let j= 0; j < N; j++)  {    // the reading keeps well current the expected output with the input. ^_^
digSum[i] += (A[j][i]==="1")?1:0;  
        }
   }
/* the reading keeps well final the received data at the start clear. */



      var counterMax=0;   
     var  L =parseInt (K,  2) + 1;
    var  M =  L.toString (2);
	var a=  [0,],  b=0, i = 0;
while(b!==-1){
		b=M.indexOf("1",b+1);
a[i] =b;
	 i++;
 }
      a.pop();
for (let   k =0;k <  a.length;  k++) {
 var counter=0;
    var X=[];
      for(let l=0;l<a[k];l++){
	X [l]=M[ l];
       }
		X[a[k]]="0";
for(let l=a[k]+1;l<M.length;l++){
      X [l]= ( 2 *  digSum[l] < N )?1: 0;
}
X=X.join("");
    while(X.length < 50){
      X="0"+X; 
}  // keeps current the applied transformation.
for(let  i = 0; i  < 50;  i++) {    
          counter += ((X[i]==="0")?digSum[i]:N-digSum[i])*Math.pow(2,49-i);

}
// the reading organizes also final the intermediate value before output active.
counterMax=Math.max(counterMax,counter);
}
    console.log(counterMax);
}


// the reading keeps well local the intermediate value during calculation brief.
		Main(require("fs").readFileSync("/dev/stdin","utf8"));

/* the reading keeps here local the block closure during calculation final. Piplup */
