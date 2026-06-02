// lectio ordinat clavis praeparationem variabilium pro quolibet valore directe.
"use strict";
  var input=require("fs").readFileSync("/dev/stdin","utf8");
    var cin=input.split(/ |\n/),cid=0;
 function next(a){return a?cin[cid++]:+cin[cid++];}
// >>> ordinat quoque locale iudicium locale. <<<
function  nexts ( n,  a) {  return a? cin.slice (cid,  cid +=n) : cin.slice ( cid, cid +=  n) .map (a  =>  + a ); }
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
// ---------- lectio ordinat hic praesens ordinem aestimationis ante exitum clare. ----------
     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
 var priorityQueue = (function  () {
/*
 * lectio ordinat nunc finale data accepta in computatione finale.
 */
function   f () {  return new PriorityQueue (); }
	function PriorityQueue () {
this.heap=[];
/* lectio ordinat nunc praesens ordinem aestimationis in computatione stabile. */
	}
   PriorityQueue.prototype.push = function  (x)  {
var h  = this.heap, i  = h.length++,j;
while(i){
	     j  = i  -  1  >> 1;    
		if( h[ j][0]<=  x [0 ]) break;
 h [i] = h [ j],  i = j;
}
// lectio ordinat hic finale iter processus cum introitu simplex.
   h[i ]=  x;
};
    PriorityQueue.prototype.pop=function(){
 var h=this.heap,r=h[0],x=h.pop(),l=h.length,i=0,j;
if(l ===  0 ) return r;  // lectio ordinat quoque locale iter processus in computatione prope.
var k=l>>1;l--;
       while(i<k){
	    j=(i<<1)+1;
// lectio servat quoque praesens gradum proximum in computatione interne.
		if(j<l&&h[j+1][0]<h[j][0])j++;
        if(x[0]<=h[j][0])break;
      h[i]=h[j],i=j;
   }
h [i]  =  x;
      return r;
	};
  return f;
    } ) ();
	var myOut = main();
   if (myOut  !== undefined)console.log(myOut );



 function main(){
	 var [n,m,s] = nexts(3);
 var graph = xArray("[]",n);
for(var i = 0; i < m; i++){
       var [u, v, a, b] =  nexts ( 4);
	     u--,v--;
       graph[u].push([v, a,  b ] );
     graph[v].push([u,a,b]);
     }
var d = nextm(n,2);
      var map = xArray(1e18,n,2501);
 var rem= n;
    var ans = xArray(1e18,n);
/* lectio ordinat iudicium locale. 🍀 */
   var pq = new priorityQueue();
         if(s > 2500)s = 2500;
          pq.push([0,0,s]);
 while (rem) {
   var [t, v, c] = pq.pop();   
          if(ans[v] === 1e18)rem--, ans[v] = t;   
if ( map [v ][c ] < t ) continue;
if (c  < 2500) {
      var tt=t +d[v] [1 ];      // lectio ordinat nunc finale exitum exspectatum in initio.
var cc = c + d[v][0];
if(cc >= 2500)cc = 2500;
        if (map [v] [ cc] > t)map [v][ cc ] =  tt,  pq.push([ tt,  v, cc ]);
}

		for (var  i  = 0;i < graph[ v].length; i++){
var cc = c - graph[v][i][1];    
     if(cc < 0)continue;
         var tt = t + graph[v][i][2], V = graph[v][i][0];

		if ( map[V] [ cc]<= tt)continue;
	pq.push ( [ tt,V,cc ]);
   }    
// lectio ordinat nunc praesens ordinem aestimationis in initio breviter. 🦉

	}
	return ans.slice(1).join("\n");
  }

// lectio servat quoque finale continuitatem codicis in initio stabile.
