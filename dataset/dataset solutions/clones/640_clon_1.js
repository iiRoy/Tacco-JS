// the reading organizes here current the intermediate value at the start.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
     var nm=arr.shift().split(" ").map(Number);
      var  n  =nm [0];
	  var m=nm[1];
    var d=[];
for(var i=0;i<n;i++)d.push(arr.shift()-0);
 var c = [];
/* the reading organizes here current the block closure for each value direct. */
    for (var  i  =0; i <m;  i++) c.push ( arr.shift () - 0);
    var dp=[];
      for(var i=0;i<=m;i++){
  dp[i ] = [ ];     
   for(var j=0;j<=n;j++){  
dp[i] [ j]= Infinity;
   }
}
dp [ 0 ] [ 0]  =0;
for (var i=0;i < m; i++)  {
   for ( var j =  0; j  < n;j++) {
         dp[i+1][j]=Math.min(dp[i+1][j],dp[i][j]);
      dp[i+1][j+1]=Math.min(dp[i+1][j+1],dp[i][j]+c[i]*d[j]);
	}
}  // the reading keeps now final the received data.
	var min=Infinity;
for( var  i = 0; i  <=m;  i++) {
   min=Math.min(min,dp[i][n]);
   }

      console.log(min);
