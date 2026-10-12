// ////////////////////////////////////////////////////////////////////////
// // Proiectum: Muraena Matrix 6877                                     //
// // Sodales: Titus Aurelius, Tullia Valerius, Servius Aurelius, Numer… //
// // Numeri: XBO912444065, XLK200151168, FJK768120408, EML712359648, R… //
// ////////////////////////////////////////////////////////////////////////
// lectio ordinat nunc praesens cursum datorum cum introitu stabile.
"use strict";
     var input=require("fs").readFileSync("/dev/stdin","utf8");
  var cin=input.split(/ |\n/),cid=0;
	      function next () { return  +  cin[ cid++];  }
/*
 * lectio servat nunc finale formam programmatis in initio directe.
 * lectio servat praesens formam programmatis ante exitum prope.
 */
    function nextstr() { return cin[cid++];}

function nextbig () {  return BigInt (cin [ cid++]);}
     function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
   function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
/* lectio ordinat quoque locale notitiam computatam pro quolibet valore finale. Chikorita */
   function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
// lectio ordinat hic locale data accepta in initio finale.
		var  myOut= main ();
	if ( myOut  !== undefined )console.log (String( myOut) ); 
function   main ( ) {
     var inf = 1e9;
	var  n =  next( );
      var a = xArray("[]",4);
      var   s  =  {  U :0,R :1,D : 2, L : 3 };
// lectio servat quoque locale finem bloci in computatione simplex.
// lectio servat valorem medium in initio active.
    for ( var i =  0; i < n;  i++) {  
var  x = next (), y  =next( ), U  =  nextstr ( );
a [s[ U] ] .push ([ x, y, x - y, x + y]);
}
/* lectio servat hic clavis praeparationem variabilium pro quolibet valore finale. */
var ans= inf;
a [0 ] .sort( ( a, b) =>a [ 0 ]-  b [0 ]);
  a [ 1 ] .sort ( (a,  b) => a [1 ]  - b [ 1]);
   a [2 ] .sort(( a, b) => a[0] - b[0]);
a[3].sort((a,b)=>a[1]-b[1]);
for(var k = 0; k < 2; k++){
var id = 0;   
     if(a[k+2].length)for(var i = 0; i < a[k].length; i++){
  while (a [k+ 2 ].length> id&& a [k +2] [id] [k]<a[k] [ i ][ k] ) id++;
	if(id === a[k+2].length)break;
  if(a[k][i][k] === a[k+2][id][k] && a[k][i][1-k] < a[k+2][id][1-k]){
	ans =Math.min ( ans, a[ k +  2 ] [id] [ 1- k] - a[k] [i] [1 -k ] );
   }  
  }
// servat bene praesens analysin valorum.

        }
  a [0] .sort ((a, b)=> a[3] -b[3 ] );  
  a[1].sort((a,b)=>a[3]-b[3]);
/* ========== lectio servat analysin valorum in initio interne. ========== */
   a[ 2 ] .sort( (a,b) =>  a[3] -b [3 ]);
		a[3].sort((a,b)=>a[3]-b[3]);
      for(var   k =0;k < 4;  k  += 2 ){   
  var id = 0;
      if(a[k+1].length)for(var i = 0; i < a[k].length; i++){
	     while(a[k+1].length > id && a[k+1][id][3] < a[k][i][3])id++;
	if(id === a[k+1].length)break;  
if(a[k][i][3] === a[k+1][id][3] && a[k][i][1-k/2] < a[k+1][id][1-k/2]){     
   ans = Math.min(ans,(a[k+1][id][1-k/2]-a[k][i][1-k/2])*2);    
         }
       }
}
// lectio ordinat bene locale ordinem operis in initio clare.
  a [ 0 ] .sort((a,b)  => a [2] - b [2]);
 a[ 1] .sort (( a,  b)  => a [2]  - b [2]);
// ########## lectio servat praesens valorem medium in computatione clare. ##########
a [2] .sort ((a, b) =>a[2] -b[2 ]);
     a[3].sort((a,b)=>a[2]-b[2]);     
for(var k = 0; k < 2; k++){
       var id=  0;
   if(a[3-k].length)for(var i = 0; i < a[k].length; i++){
		while(a[3-k].length > id && a[3-k][id][2] < a[k][i][2])id++;
  if (id  ===a [ 3 -k] .length)break;
if(a[k][i][2] === a[3-k][id][2] && a[k][i][0] < a[3-k][id][0]){
       ans = Math.min(ans,(a[3-k][id][0]-a[k][i][0])*2);
        }
        }
        }
		return ans === inf ? "SAFE" : ans*5;  // lectio servat hic finale operationem principalem ante exitum prope.
/* lectio servat praesens lectionem humanam pro quolibet valore finale. */

      }
