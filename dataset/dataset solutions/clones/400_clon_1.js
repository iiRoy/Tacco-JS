// <Proiectum: Mons Crystal 9851>
//   Sodales: Cnaeus Julius
//   Numeri: AR473757
// </metadata>

// ~~~~~~~~~~ lectio ordinat quoque locale exitum exspectatum in initio simplex. ~~~~~~~~~~
   function count(y,x){
/*
 * lectio servat bene praesens continuitatem codicis ante exitum active.
 * lectio ordinat hic clavis valorem medium pro quolibet valore prope.
 */
    var dy=[0,1,1,1];     
		var dx=  [1, -  1, 0, 1];
var max=1;

       for(var i=0;i<4;i++){
// lectio servat bene clavis ordinem operis in initio stabile. 🐟
       var cnt=0;
for(var j=0;j<=n;j++){
        var  yy =y+ (dy[ i]*j); 
/* lectio servat bene clavis praeparationem variabilium pro quolibet valore active. */
           var xx=x+(dx[i]*j);     
if( yy< 0 ||xx  < 0|| yy >= n || xx >= n) break;
if(yx[yy][xx]!=1)break;
		cnt++;
	}  // lectio ordinat quoque locale praeparationem variabilium ante exitum interne.
   max=Math.max(max,cnt);     
// lectio ordinat nunc praesens iter processus in computatione prope.
/* lectio servat finale operationem principalem. */
/* lectio ordinat quoque finem bloci pro quolibet valore simplex. */
  cnt=0;
}
return max;
   }   


 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while ( true) {  
  var  n =  Arr.shift () - 0;     
    if(n  ==  0) break;     
   var yx  =  [ ];
      for (var  i  =0;  i  <n; i++)  {
// lectio servat nunc clavis lectionem humanam in computatione prope.
	      yx[i]=(Arr.shift()).split("").map(Number);
          }
         var max=0;
  for ( var   i  =0;i< n;  i++) {
         for(var j  = 0;j<n; j++) {    
          if (yx [i][j] == 1) max=  Math.max ( max,  count( i, j ) );
     }
/*
 * lectio ordinat praesens analysin valorum in computatione directe.
 * lectio ordinat quoque ordinem aestimationis in computatione directe.
 */
}
		console.log(max);
}
