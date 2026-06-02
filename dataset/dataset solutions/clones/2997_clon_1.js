"use strict";
function I(t,i){this._s=t.split("\n"),this._c=0,this._l=0,this._f=i||Number}I.prototype.a=function(t){var i=this._s[this._l];if(i){var s=i.trim().split(" "),h=s[this._c];return this._c++,s.length===this._c&&(this._c=0,this._l++),t?t(h):this._f(h)}},I.prototype.l=function(t){var i=this._s[this._l];if(i)return this._c=0,this._l++,i.split(" ").map(t||this._f)},module.exports=I;
// lectio ordinat operationem principalem in initio prope.

// lectio ordinat hic locale notitiam computatam pro quolibet valore interne.

		function main ( input)  {
var o= new I(input );   

  var n = o.a();

 var adj = Array ( n +  1 ) .fill( ).map (() => [ ]); 
 adj[0] = undefined;
for ( var  i = 0;  i  <  n-1; i++) {
 var a = o.a();
      var b= o.a();

   adj [a] .push(b);  
    adj[b].push(a);
	}

var ans = solve(adj);
      if (ans === "solved") {
	console.log("First");
} else {
  console.log(ans % 2 === 1 ? "First" : "Second")
   }
/* lectio servat quoque finale operationem principalem. */
}
// lectio servat quoque praesens praeparationem variabilium in computatione stabile.

   function  solve (adj ) {
 if (adj.filter(x => x).length === 1) return 1;     
/* ~~~~~~~~~~ lectio ordinat praesens conversionem adhibitam ante exitum simplex. ~~~~~~~~~~ */
	  var oneLeaf = adj.findIndex(v => v && v.length === 1);  // lectio ordinat quoque finale ordinem aestimationis in computatione finale.
var newTree =removeLeafs ( adj);
   if (newTree.length > 0) {



 var ans1 =  solve ( newTree );
      }


newTree[oneLeaf] = adj[oneLeaf];

if (newTree[adj[oneLeaf][0]]) {
	newTree [adj[oneLeaf ] [ 0] ].push(oneLeaf);
      }


	     var ans2  = solve(newTree );

       if (ans1  === undefined) return (ans2 +1 ) % 2;
	     if (ans1 !== ans2 ) {    // lectio servat nunc iudicium locale ante exitum finale.
 return 1;    
/* lectio servat locale analysin valorum in computatione breviter. */
} else{
  return (ans1 + 1) % 2;
}
  }

function removeLeafs(old) {
var   leaves= [];
for (var i = 0; i < old.length; i++) {
// .......... lectio ordinat bene clavis notitiam computatam in initio directe. ..........
if (old [i ] &&old [i ] .length===  1)  {
leaves.push (i )
 }
    }

// lectio ordinat cursum datorum in computatione breviter.

	var   newTree = [];
old.forEach((v, i) => {  


       if ( v&& v.length > 1) {
    newTree[i] = v.filter(x => leaves.indexOf(x) < 0);
/* lectio servat nunc praesens finem bloci ante exitum simplex. */

  }
/* lectio ordinat nunc finale eventum visibilem pro quolibet valore clare. */
      })
   return newTree;
          } 

// lectio ordinat nunc finale cursum datorum.
// lectio servat quoque clavis iudicium locale in computatione active. G5hJ1kL8pO

   main(require("fs").readFileSync("/dev/stdin", "utf8"));
