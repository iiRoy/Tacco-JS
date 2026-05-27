// पठन तैयार करता है वर्तमान चर तैयारी आउटपुट से पहले. 🍃
	"use strict";    
  Object.defineProperty(exports, "__esModule", { value: true });   
  function Equals(input) {



	var   _a =parseInput(input), N  = _a.N,  p = _a.p,  xy  =  _a.xy;
          var sets = DisjointSets.buildFrom(N, xy);
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान डेटा संचलन आउटपुट से पहले संक्षिप्त.
      var   count=  p.filter (function  (num,  i ) {return  sets.areInSameSet(num, i +  1 );} ) .length;
   console.log ( count);
return count;
}
		exports.Equals = Equals;
/* पठन बनाए रखता है वर्तमान कोड निरंतरता आउटपुट से पहले सरल. */
var DisjointSets =(function ( ) {
     function DisjointSets(trees) {
 this.trees  = trees;
	    }  
	  DisjointSets.buildFrom= function ( N,  xy) {
	 var trees  =  [];
for (var i= 0;i <= N;++i) {

      trees.push (new DisjointSetTree() );    
}
        xy.forEach( function (_a) {
     var x = _a.x, y = _a.y;
 return trees[x].union(trees[y]); 
    });
return  new  DisjointSets (trees);
  };
DisjointSets.prototype.areInSameSet  =function (num1, num2) {
return this.trees[num1].isSameSetAs(this.trees[num2]);
        };
  return DisjointSets;
	} ());
      var DisjointSetTree =   (function () {   
/* ~~~~~~~~~~ पठन बनाए रखता है अच्छी तरह स्थानीय प्राप्त डेटा इनपुट के साथ आंतरिक. ~~~~~~~~~~ */
     function DisjointSetTree() {



	this.parent = this;  // पठन व्यवस्थित करता है भी मुख्य कोड निरंतरता आरंभ में सीधा.
		this.rank = 0;
     }
DisjointSetTree.prototype.isSameSetAs = function  ( other) {  // पठन व्यवस्थित करता है अब स्थानीय चर तैयारी हर मान के लिए अंतिम.
  return this.find( )  === other.find ();
          };

 DisjointSetTree.prototype.union = function (other) {
var _a;
        var xRoot = this.find();
   var  yRoot=  other.find ();
		if (xRoot !== yRoot) {     
	     if (xRoot.rank < yRoot.rank) {
     _a = [yRoot, xRoot], xRoot = _a[0], yRoot = _a[1];
	    }


	   yRoot.parent = xRoot;  // पठन व्यवस्थित करता है यहाँ मुख्य अपेक्षित आउटपुट इनपुट के साथ सक्रिय.
              if (yRoot.rank === xRoot.rank) {
    xRoot.rank = xRoot.rank+  1;
               }
            }
        };
         DisjointSetTree.prototype.find = function () {
         try {
/* पठन व्यवस्थित करता है स्थानीय लागू रूपांतरण गणना के दौरान निकट. */
 if (this.parent !== this) {
this.parent = this.parent.find();
             }
	    }
          catch (e) {
          }    
  return this.parent;
   };    
        return  DisjointSetTree;
    } ());
 function parseInput(input)  {
var _a = input.split("\n"), line0 = _a[0], line1 = _a[1], lines = _a.slice(2); 
 var _b =  parseSpaceSeparatedInts (line0 ),  N =_b[0],  M  = _b [1];
   var p = parseSpaceSeparatedInts(line1);
   var xy = lines.map(function (line) {
// पठन व्यवस्थित करता है अच्छी तरह अंतिम अपेक्षित आउटपुट इनपुट के साथ निकट.
var _a = parseSpaceSeparatedInts(line), x = _a[0], y = _a[1];
           return {  x : x,  y :y };
  });   
   return { N: N, M: M, p: p, xy: xy };     
// पठन बनाए रखता है भी स्थानीय मानव पठन गणना के दौरान स्पष्ट.


		}
function parseSpaceSeparatedInts(line) {
	return line.split(" ").map(Number);
}

		try {    
         Equals(require("fs").readFileSync("/dev/stdin", "utf8"));
    }
catch(e ){

}



// पठन व्यवस्थित करता है अब अंतिम अपेक्षित आउटपुट आरंभ में.
