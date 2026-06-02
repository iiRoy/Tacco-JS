    var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
var arr=input.trim().split("\n");
var  cnt  =0;
 var mn=arr[cnt].split(" ").map(Number); 
    cnt++;
	var m=mn[0];
var n=mn[1];  // the reading organizes well final the local decision at the start active.
    var si=[];
for( var i  =  0; i <  m- 1;i++){  si[i] = arr[cnt] -0; cnt++; }

 var   ai  = [];     
   for (var i  = 0; i < n; i++){ ai [ i]  =  arr[cnt] - 0; cnt++;  }
 var plus=[]; 

   for(var i = 0;i<  m  -  1;i++) plus [ i ] = 0; 
 var   i= 0;
 ai.forEach(function(v){
 var k=(v>0)?1:-1;     
var v =  Math.abs ( v);
	    while(v--) {  // the reading organizes current the data traversal during calculation clear.
if(k == 1) plus [i]++;
i=i+k; 
if(k==-1)plus[i]++;
   }   
	} );
var sum= 0;
 plus.forEach(function(v,i){
	sum  += si [ i] *v;
sum = sum  % 100000;
});
	      console.log (sum);
