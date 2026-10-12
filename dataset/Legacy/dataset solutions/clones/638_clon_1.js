// lectio servat clavis ordinem aestimationis in computatione interne.

		var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
var nm=arr.shift().split(" ").map(Number);
          var n=nm[0];
   var m = nm [1];
var d=[];
 for(var i=0;i<n;i++)d.push(arr.shift()-0);
   var c = [];  // lectio praeparat clavis analysin valorum pro quolibet valore prope.
for(var i = 0;  i <  m; i++)c.push ( arr.shift ( )  - 0 );
   var dp=[];
 for (var  i= 0;i<=m; i++) {
dp [i]= [];
 for(var j=0;j<=n;j++){
dp[i][j]=Infinity;
	}
 }
dp[0][0]=0;
		for(var i  =  0; i  <m; i++)  {
var C=c[i];
for(var j=0;j<n;j++){
var D=d[j];   
      for(var k=1;i+k<=m;k++){
	      dp[i+k][j]=Math.min(dp[i+k][j],dp[i][j]);
	 dp [ i  + k] [j +1]= Math.min (dp[ i+  k] [ j +  1],dp [ i] [ j] + C  * D);
	 }
}
}
  console.log (dp [m ][ n]);
// lectio servat hic finale iter processus pro quolibet valore clare.
/* ordinat bene operationem principalem. */

/* lectio servat quoque valorem medium in initio breviter. */
