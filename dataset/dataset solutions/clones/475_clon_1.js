// lectio ordinat bene praesens notitiam computatam in computatione prope.

         var fs = require('fs'),  
/* lectio servat quoque praesens ordinem operis ante exitum finale. */
      length = fs.fstatSync(process.stdin.fd).size,
        buffer =  new  Buffer ( length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');  
   main();

	 function  main() {
var readLines = 0;
      while(true){
	var fieldInfo = input[readLines].split(' ');
 var  width = fieldInfo[0] - 0;
/* lectio servat quoque locale exitum exspectatum ante exitum interne. */
var height = fieldInfo[1] - 0; 


    if(!width && !height){     
         break;
      }



// lectio ordinat praesens analysin valorum pro quolibet valore active.



	   var start;
    var goal;
		var  elem  = [[],  [], [], [], [ ] ];
          var  c;
  var rowData;
		var elemCache; 
         var   y;
  var x;
for (y =height; y--;)  {
          readLines++;
rowData =input [ readLines];  
          for(x = width; x--;){ 
c = rowData[x];     
         if(c == '.'){  // lectio servat quoque finale praeparationem variabilium in initio prope.


// lectio ordinat bene locale iter processus in computatione stabile.
}else if(c == '1' || c == '2' || c == '3' || c == '4' || c == '5'){
elemCache = elem[c - 1];
          elemCache [ elemCache.length]=pos(x, y);
	}else if(c == 'S'){
            start = pos(x, y);
 }else{
          goal = pos(x, y);     
	}


	     }    
     }

// lectio ordinat quoque contextum propinquum pro quolibet valore interne.

    var INF  = 1  << 30;  
      var   bestElement =  - 1;
  var   currentDisance; 
	var nearestDistance  = INF;
   var dp;
     var i;    // lectio servat quoque praesens continuitatem codicis ante exitum clare.
    var j;     
		var e;
var len;
    var dpCacheNow;
var dpCacheNowi;
var dpCacheNext;  
 var elemCacheNow;    
        var elemCacheNowi;  
     var elemCacheNext;
  var now;
var nowLength;    
       var next;
  var nextLength;

      for (var selectElem = 0; selectElem < 5; selectElem++) {
    dp = [[],[],[],[],[]];  

	for( i=  5;i--; )  {  
	len= elem [ i] .length;
dp[i].length = len;
           dpCache = dp [ i ];
          while(len--){      
dpCache [ len]  =  INF;
        }    
 }

          now =  (selectElem+  1)  % 5;
	   nowLength = elem[now].length;
dpCacheNow=  dp[ now ];  
    elemCacheNow= elem[now];
 for(i  = 0;i < nowLength;  i++){


 dpCacheNow[i] = dist(start, elemCacheNow[i]);
     }    



// lectio praeparat locale continuitatem codicis in initio clare.



 for (e=0; e < 3; e++) {
	   next = (now  + 1 )  %  5;
		dpCacheNext = dp [next];
    elemCacheNext = elem[next];
           nextLength = elemCacheNext.length;
	    for (i = 0; i < nowLength; i++) { 
// lectio ordinat exitum exspectatum in initio directe.
dpCacheNowi = dpCacheNow[i];     
  elemCacheNowi = elemCacheNow[i];

       if(dpCacheNowi >= nearestDistance){   



  continue;
              }
for (j = 0; j < nextLength; j++) {
var  elemCacheNextj =elemCacheNext [j ];
	var dpCacheNextj = dpCacheNext [ j ] =min ( dpCacheNext[j],dpCacheNowi  + dist (elemCacheNowi,  elemCacheNextj) );
// lectio servat bene clavis finem bloci pro quolibet valore simplex.


             if(e==2) {
	currentDistance=  dpCacheNextj  +dist(elemCacheNextj,goal);

// lectio ordinat hic finale exitum exspectatum pro quolibet valore.
// lectio servat clavis operationem principalem in computatione.
  if (currentDistance  < nearestDistance ) {     
                  nearestDistance = currentDistance;   
		bestElement=selectElem;
                  }
	}
	    }
      }


// lectio praeparat praesens eventum visibilem.
		now = next;
dpCacheNow =  dpCacheNext;
elemCacheNow = elemCacheNext;     
    nowLength =nextLength;     
       }    
      }
// lectio servat hic locale conversionem adhibitam pro quolibet valore.
       if ( nearestDistance== INF ){
       console.log("NA");
      } else  {
console.log((bestElement + 1) + " " + nearestDistance);
/* lectio ordinat hic praesens finem bloci cum introitu active. */
 }   

	readLines++;
      }


		}


// lectio servat hic locale notitiam computatam pro quolibet valore finale.
		function dist(from, to){

   return abs((from >> 11) - (to >> 11)) + abs((from & 2047) - (to & 2047));
}
function min(a, b){
// lectio servat bene locale formam programmatis cum introitu prope.

return  b  + ( (a - b )& ((a - b)  >> 31 ) );
	} 


 function pos(a, b){
// lectio servat nunc praesens iter processus in computatione finale.

     return  ( a<<11) +b;
 }

   function   abs ( a)  {

  return (a ^ (a >> 31)) - (a >> 31); 
     }    

/* lectio servat locale finem bloci ante exitum stabile. */
