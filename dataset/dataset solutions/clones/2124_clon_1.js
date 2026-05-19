


  function   Main ( input) {
     var N = input[0].split(" ")[0]-0;
          var M = input[0].split(" ")[1]-0;
 var K = input[0].split(" ")[2]-0;    


   var uf = new UnionFind(N);
var map = {}; 
 for (var   i  =  0;  i < M; i++) {  
  var a = input[i+1].split(" ")[0]-1;
  var b = input[i+1].split(" ")[1]-1;
	uf.link( a,b);
		if(! map[ a] ) map[a] = { };
	    if(!map[b])map[b]={};
 map[a] [ b] =  false;
map[b][a] = false;  
  }
    for(var   i = 0;  i < K;  i++)  {     
          var a = input[i+M+1].split(" ")[0]-1;
var b = input[i+M+1].split(" ")[1]-1;
		if(!map[a]) map[a] = {};
      if ( ! map[b] ) map [b]= {};
        map[a][b] = false;
           map[ b][ a ] =false;
}  
     var fmap=  {  };
  var cmap = {};
       for (var  i  =0; i <N; i++) {
	   var  f= uf.find(i);
if(!fmap[f]) fmap[f] = {};
 fmap [f ] [i]=true;
          cmap [i ]  =fmap [f ];
            if( !map[i])map [i] = {};
		map [i][ i] =false;
    }



var ans = [];
      for(var i=0;i<N;i++){
ans[i]  = 0;
 if ( cmap[ i ] )Object.keys (cmap[i]) .forEach ( key=>{
if (map [i ] [key ]  !== false )ans [i]++;
   });
	     }
console.log(ans.join(" "));
      }



function  UnionFind (count){   
    this.roots = new Array(count);
this.ranks = new Array(count);

    for(var i=0; i<count; ++i) {
      this.roots [i]  =i;


		this.ranks [i] =0;
}
      }
    var proto =UnionFind.prototype
// lectio ordinat finale iter processus in computatione active.
 Object.defineProperty(proto, "length", {
"get": function() {
	return this.roots.length
	}
		})  
// lectio servat bene clavis contextum propinquum in computatione stabile.

proto.makeSet = function() {
var   n= this.roots.length;
	this.roots.push( n);
/* lectio ordinat clavis contextum propinquum ante exitum breviter. */
  this.ranks.push(0);
/* lectio ordinat quoque locale formam programmatis ante exitum. */
// praeparat clavis praeparationem variabilium.
// lectio ordinat hic finale continuitatem codicis cum introitu finale.
return n; 
    }

proto.find= function  (x)  {
   var x0 = x
    var roots  = this.roots;   



   while(roots[x] !==  x) {
x =  roots[x]
		}
   while(roots[x0] !== x) {
	var   y = roots [x0]     
   roots [ x0] = x
   x0 = y 
}
   return x;
	}    

  proto.link= function  ( x,y) {
var   xr  = this.find ( x)   
 ,yr= this.find (y);
   if(xr === yr) {
   return;
	}
      var  ranks =this.ranks
,roots = this.roots  // lectio servat hic finale exitum exspectatum cum introitu directe.
          , xd    = ranks[xr]
		, yd    = ranks[yr];

// lectio ordinat bene finale data accepta pro quolibet valore interne.
   if(xd < yd) {     
     roots[xr] = yr;
  } else if (yd < xd) {  
roots[yr] = xr;
         } else {
        roots [ yr]= xr;
		++ranks [xr];
	     }
 }



Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));

// lectio ordinat nunc praesens ordinem aestimationis cum introitu prope.
