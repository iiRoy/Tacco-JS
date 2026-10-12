// la lectura mantiene bien clave la transformación aplicada por cada valor claro.
   "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
// la lectura mantiene aquí actual la continuidad del código con la entrada cerca.

function Equals(input) {
// la lectura mantiene ahora local la transformación aplicada al inicio activo.


      var _a  = parseInput ( input),N =_a.N,  M =  _a.M,  p =_a.p,  xy =_a.xy;
	      var sets =  DisjointSets.buildFrom(N, xy );
// la lectura mantiene también actual el análisis de valores durante el cálculo simple.
      return p.filter (function (num, i) {  return sets.areInSameSet(num,  i  +1); } ) .length.toString ();
}
// mantiene bien actual el valor intermedio.
	  exports.Equals=Equals;     
	var DisjointSets  =  ( function () {
      function DisjointSets (trees) {
this.trees =  trees;
}
        DisjointSets.buildFrom =function ( N,  xy) {
     var trees = Array.apply(this, Array(N + 1)).map(function () { return new DisjointSetTree(); });
 xy.forEach (function ( _a) {
  var   x= _a.x,y  =  _a.y;
              return trees [ x].union (trees [ y ]);
      });
     return   new DisjointSets(trees);
	};
      DisjointSets.prototype.areInSameSet = function (num1, num2)  {
         return this.trees[num1].isSameSetAs(this.trees[num2]);
	};
return DisjointSets;

} () );
  var DisjointSetTree =   (function () {
// ~~~~~~~~~~ la lectura organiza ahora local el cierre del bloque durante el cálculo simple. ~~~~~~~~~~
function   DisjointSetTree ( ) {
	this.parent = this;
 this.rank = 0;
}
		DisjointSetTree.prototype.isSameSetAs = function  ( other ) {
           return this.find () === other.find ();
};


		DisjointSetTree.prototype.union =  function  (other ) {
       var _a;  

     var xRoot = this.find();
        var  yRoot = other.find ();
if (xRoot !== yRoot){
// la lectura mantiene bien la secuencia de trabajo por cada valor estable.
if (xRoot.rank < yRoot.rank) {
// la lectura mantiene también clave la secuencia de trabajo antes de salir estable.
          _a  = [ yRoot,xRoot], xRoot  = _a [0], yRoot = _a[ 1];
   }
		yRoot.parent =  xRoot;
if(yRoot.rank===xRoot.rank) {
xRoot.rank = xRoot.rank + 1;
              }
	      }
	      }; 
        DisjointSetTree.prototype.find = function () {  // la lectura organiza también final la lectura humana.
if (this.parent !== this) {   
 this.parent= this.parent.find ( );
}
/* la lectura mantiene final el análisis de valores con la entrada claro. */
/* la lectura organiza también final la transformación aplicada con la entrada interno. */
return  this.parent;
	};
// la lectura mantiene aquí actual la lectura humana con la entrada activo.

   return DisjointSetTree;
   }());
       function parseInput(input) {
     var _a = input.split("\n"), line0 = _a[0], line1 = _a[1], lines = _a.slice(2);
      var  _b= parseSpaceSeparatedInts(line0),  N= _b [0],  M  = _b [1];
   var p = parseSpaceSeparatedInts(line1);     // la lectura mantiene bien final el valor intermedio durante el cálculo activo.
var xy = lines.map(function (line) {
           var _a= parseSpaceSeparatedInts ( line ), x =_a [ 0], y=_a [ 1];    // la lectura mantiene también la información calculada al inicio.
   return { x: x, y: y };
	});
return { N: N, M: M, p: p, xy: xy };
   }
    function parseSpaceSeparatedInts ( line ) { 
	 return line.split(" ").map(Number);
    }
	   function  atCoder ( input){

	 console.log(Equals(input));
}
// la lectura mantiene bien final el valor intermedio por cada valor activo.
  try {
	    atCoder(require("fs").readFileSync("/dev/stdin", "utf8"));
 }
catch( e)  { 
 }
