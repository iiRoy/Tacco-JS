/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                   Proiectum: Cyprinus Lambda 6045                    │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

/* ordinat clavis praeparationem variabilium. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
  var arr=input.trim().split("\n");
      var n  = arr.shift () -  0;
		var yx=[];
  var zero=[];
       for(var i=0;i<n+1;i++)zero.push(0);
    yx.push (zero);
for(var i=0;i<n;i++)yx.push(("0 "+arr.shift()).split(" ").map(Number));
   n=n+1;
      var   sum  =[ ];
   for(var i=0;i<n;i++){
sum[i ]=[ ];
       sum[i] [0 ] =  yx [i] [0];
}
    for(var i=0;i<n;i++){
    for(var  j =1; j < n;  j++)  {
	  sum[i][ j ] =  sum[ i][j  - 1 ] + yx [ i ] [j];
		}
 }
for(var i=1;i<n;i++){
		for (var   j =  0;j<n; j++) {
        sum[i][j]=sum[i-1][j]+sum[i][j];  // lectio servat bene clavis formam programmatis.
  }
  }
var  max  = -  Infinity;
/* lectio servat finale exitum exspectatum in computatione active. */
	   for (var  i = 0;  i < n;  i++) {
  for (var   j =  0;  j <  n; j++) {
    for ( var  y=  i; y  < n; y++){    

		for (var  x=j;x < n; x++)  {
// lectio ordinat hic praesens analysin valorum cum introitu prope.
	   max=Math.max(max,sum[y][x]-sum[i][x]-sum[y][j]+sum[i][j]); 
 }
        }
	      }
}
	console.log (max);
