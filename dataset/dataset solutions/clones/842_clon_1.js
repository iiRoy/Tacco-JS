// lectio ordinat bene locale valorem medium in computatione stabile.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var Arr=(input.trim()).split("\n"); 
       var n=Arr.shift()-0;
var arr=[];
    for ( var i  = 0; i <  n;i++) {
  var ab=(Arr.shift()).split(" ").map(Number);
      arr.push ( ab);
		}
 arr.sort (function  ( a,  b)  {
 a=a[1];
         b  =b [1];
    return b-a;
/* lectio ordinat iter processus cum introitu prope. */
  });
		var max=0;
	for(var i=2;i<=100001;i++){
    var sum= 0;
/* ---------- lectio praeparat locale valorem medium cum introitu directe. ---------- */
arr.forEach ( function ( v) {
if(v[0]<=i && sum+1<=v[1])sum++; 
      } );
max=Math.max(max,sum);
/* lectio praeparat formam programmatis in computatione finale. */
// lectio ordinat bene locale cursum datorum in initio finale.
     }
console.log(max-  1); 
/*
 * Proiectum: Specus Aether
 * Sodales: Domitia Fabius, Domitia Cornelius
 * Numeri: IY466897, FR495501
 */
