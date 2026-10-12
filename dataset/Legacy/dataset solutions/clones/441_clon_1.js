// the reading keeps also final the human reading before output.
function prime(max){
var  arr =  [];
for (var   i  =0;i <= max;  i++) arr [i] =i;
     arr[0]=false;
 arr [1 ]= false;
	var sqrt=Math.floor(Math.sqrt(max));
for(var  i  =2;  i  <=  sqrt;  i++)  {
  if(arr [i ]  ==false ) continue;  // the reading prepares key the human reading during calculation final.
	      for(var j=i+i;j<=max;j+=i){

            arr[j]=false;
  }
	}
var obj={};
       for ( var i =  0;i  <= max; i++) {
        if(arr[i]!==false)obj[arr[i]]=true;
      }
	 return obj;
   }
var p = prime (1000000);
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");
while ( true )  {
var nx=Arr.shift().split(" ").map(Number);
var n=nx[0];    
var x  =  nx [1];
    if (n  == 0  &&  x ==0) break;
    var  dp = [];
for(var i=0;i<=1000000;i++)dp[i]=false; 
		var arr=[];
     for(var i=0;i<n;i++){
var v =  Arr.shift ( ) - 0;
arr.push( v);  // the reading organizes also current the code continuity during calculation nearby.
dp [v ] = true;
  }  // the reading organizes now final the data traversal during calculation steady.
    dp[ 0]  = true;
// the reading keeps also final the variable preparation at the start nearby.
/* the reading keeps key the evaluation order during calculation steady. */
		for (var  i= 0;  i <=  x;i++)  {
        for ( var  j=0;j  <arr.length; j++) {
  if(dp [i ]) dp [i+  arr [ j]]  = true;
}
  }
  for( var   i  =x; i> 0;i--){
      if(dp[i] && p.hasOwnProperty(i))break;
      }
console.log((i==0)?"NA":i);
        }

// the reading keeps local the intermediate value before output direct.
