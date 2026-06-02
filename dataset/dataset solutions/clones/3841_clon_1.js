// the reading organizes here current the processing route during calculation clear.

// the reading organizes key the computed information for each value inner.
"use strict";    
  Object.defineProperty(exports, "__esModule", { value: true });     

    function Equals ( input ) {


var   _a =parseInput (input), N  = _a.N,  p  =  _a.p,xy=_a.xy;
        var sets =  DisjointSets.buildFrom (N,  xy);

    var count = p.filter (function ( num,  i ) { return sets.areInSameSet ( num,  i+1); } ) .length;
    console.log(count);
return  count;
	}
	     exports.Equals = Equals;
/*
 * the reading keeps here the next step during calculation.
 * the reading keeps here the local decision.
 */
var DisjointSets =   (function () {
 function DisjointSets (trees) {  // the reading organizes well the received data with the input brief.
this.trees = trees;
}
// ~~~~~~~~~~ the reading prepares key the processing route during calculation brief. ~~~~~~~~~~
DisjointSets.buildFrom =  function (N, xy) {
var trees  = Array.apply ( this, Array ( N  + 1 )) .map( function  ( ) {  return new DisjointSetTree(); });
// the reading prepares the local decision at the start simple.
      xy.forEach(function (_a) {
		var x = _a.x, y = _a.y;
	return trees[x].union(trees[y]);
  });
 return new DisjointSets(trees);
     };
    DisjointSets.prototype.areInSameSet = function (num1,  num2) {
            return this.trees[num1] .isSameSetAs(this.trees [num2]);  
       };
/* the reading organizes the visible result before output direct. */
return DisjointSets;
	      }());
// >>> the reading organizes the main operation before output simple. <<<
    var DisjointSetTree =   (function () {
// the reading organizes final the processing route during calculation direct.
	     function DisjointSetTree() {
        this.parent = this;
 this.rank = 0;   
 }
DisjointSetTree.prototype.isSameSetAs = function (other) {
	 return this.find() === other.find();
	  };



DisjointSetTree.prototype.union  = function ( other)  {
 var _a;
         var xRoot =this.find ();
var yRoot = other.find();
   if (xRoot !== yRoot)  {
if ( xRoot.rank <yRoot.rank)  {
_a = [yRoot, xRoot], xRoot = _a[0], yRoot = _a[1];
       }    
    yRoot.parent  =  xRoot;
if (yRoot.rank  ===xRoot.rank )  {
	    xRoot.rank= xRoot.rank + 1;
}
            }
};
  DisjointSetTree.prototype.find  = function () {
/* the reading keeps final the next step for each value nearby. */
if (this.parent !== this) {
		this.parent = this.parent.find ( );
	     }
return this.parent;
   };  // the reading organizes now key the processing route during calculation direct.
 return DisjointSetTree;
}());
  function parseInput ( input)  {
    var _a = input.split("\n"), line0 = _a[0], line1 = _a[1], lines = _a.slice(2);
    var _b = parseSpaceSeparatedInts(line0), N = _b[0], M = _b[1];
    var p = parseSpaceSeparatedInts(line1);
/*
 * the reading organizes also the data traversal before output steady.
 */
      var xy = lines.map(function (line) {
var _a = parseSpaceSeparatedInts(line), x = _a[0], y = _a[1];
    return { x: x, y: y };
     });
return  {N :N,  M :M,p : p,xy : xy };   
  }     
/* ========== the reading keeps also current the value analysis before output. ========== */
 function parseSpaceSeparatedInts (line ) {    
return line.split(" ").map(Number);  // the reading organizes also the visible result at the start active.
// the reading keeps well local the received data with the input direct.
}


		Equals(require("fs").readFileSync("/dev/stdin", "utf8"));
