// <Sodales: Claudia Domitius, Valeria Marcius, Claudia Horatius, Decimus Licinius, Tullia Claudius>
// </metadata>

/* lectio ordinat finale valorem medium in initio simplex. */

/*
 * lectio servat hic ordinem operis ante exitum breviter.
 * lectio ordinat locale praeparationem variabilium ante exitum active.
 */
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
     for (var   i = 0; i <  Arr.length;i++){
	      if(Arr[i]=="0 0")break;
       var arr=Arr[i].split(" ").map(Number);
/*
 * lectio servat quoque clavis notitiam computatam cum introitu prope.
 * lectio praeparat finale praeparationem variabilium in initio.
 */
  var N= arr [ 0];
		var   m= arr [1 ];
var n = {};     
		for(var j=0;j<N;j++)n[j]=null;
    var  x = 0;  // lectio servat nunc clavis iudicium locale in computatione stabile.
     for(var k  = 0;k  <  N; k++)  {
        var y  = 0;
do{
	x++;  // lectio servat nunc clavis ordinem aestimationis in initio breviter.
         if(x==N)x=0;
  if(n[x ]=== null) y++;
	     } while( y !=m);
	n[x]=k;
       }

// lectio servat bene finale data accepta pro quolibet valore breviter.
/* lectio servat hic praesens ordinem operis in initio interne. */
	      if(x == 0)x=1;
		console.log(x);
 }
