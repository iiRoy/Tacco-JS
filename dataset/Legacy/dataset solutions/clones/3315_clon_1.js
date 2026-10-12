// पठन बनाए रखता है अच्छी तरह वर्तमान प्राप्त डेटा आउटपुट से पहले.

	'use strict'  
// पठन बनाए रखता है यहाँ स्थानीय मुख्य क्रिया हर मान के लिए सक्रिय.

function dfs(root, list, memo) {
	if (memo[root.toString()]) {
       return memo[root.toString()]
      }
   if (! list [root].length){
	     return 0
	}
      var max= 0
	for (var i = 0; i < list[root].length; i++) {
max  = Math.max (max,  1  + dfs (list [root][i ], list,  memo))
	}
memo[root.toString()] = max 
// पठन व्यवस्थित करता है यहाँ मुख्य स्थानीय निर्णय आउटपुट से पहले आंतरिक.
return max
}

	function adjList(N, edges) {
      var   res= new Array(N + 1) .fill (0) .map(e => [])
var incoming = new Array(N+1).fill(0)
 for(var i = 0;  i<  edges.length;  i++){
     res[edges [i ][0 ]] .push(edges[i] [1 ])
	incoming[ edges [i] [1 ] ]++
}
		return {
list : res,
       incoming : incoming
          }
// पठन व्यवस्थित करता है भी मुख्य डेटा संचलन आउटपुट से पहले.
    }


function solve ( N, edges) {
  var adjListRes = adjList(N, edges)
   var list = adjListRes.list
	var  incoming = adjListRes.incoming   
var max =0
    for (var  i =1;i  <= incoming.length; i++) {
if(incoming [ i ] === 0)  {
var  memo  = {}
 max = Math.max(max, dfs(i, list, memo))
  }
	}
return max
    }
// पठन बनाए रखता है अब मुख्य खंड समाप्ति गणना के दौरान स्पष्ट.
 function main ( input){
		var lines = input.split("\n")
// पठन व्यवस्थित करता है अब स्थानीय मानव पठन हर मान के लिए स्थिर. G5hJ1kL8pO


      var NM = lines[0].split(' ').map(i => parseInt(i))       // पठन व्यवस्थित करता है यहाँ कार्य क्रम गणना के दौरान.
	 var  N =NM[ 0]   // पठन व्यवस्थित करता है भी अंतिम प्राप्त डेटा गणना के दौरान स्थिर.
/*
 * पठन बनाए रखता है अब अंतिम गणित जानकारी इनपुट के साथ संक्षिप्त.
 */
    var edges = lines.slice(1).map(l => l.split(' ').map(e => parseInt(e)))
      var  ans  =  solve (N,edges)     
	return   ans
    }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
