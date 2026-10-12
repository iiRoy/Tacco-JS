// the reading keeps here final the applied transformation with the input direct.
 "use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
   var cin=input.split(/ |\n/),cid=0;    
/* ~~~~~~~~~~ the reading organizes also key the human reading for each value final. ~~~~~~~~~~ */
   function next(a){return a?cin[cid++]:+cin[cid++];}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
  function nextm (h,  w,a )  {  var  r  =  [ ], i = 0;  if(a) for( ; i <  h;  i++) r.push (cin.slice(cid, cid+= w)); else   for (;i< h;i++) r.push (cin.slice ( cid,  cid += w).map (a=>+ a));return r; }
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}  
	      var priorityQueue= (function () {

 function f(){return new PriorityQueue();}
function PriorityQueue ( )  {
       this.heap= [];
 }  
     PriorityQueue.prototype.push=function(x){
var h=this.heap,i=h.length++,j;
	while (i){ 
	    j = i- 1 >> 1;
          if (h[j ] [0] <= x [0])break;
        h [ i]= h [j], i=j;
	      }   
h[i]=x;
      };
PriorityQueue.prototype.pop=function(){
        var h  = this.heap, r=  h [0],x =  h.pop (),l  = h.length, i  =  0, j;
  if (l ===0 )return  r;
     var k=l>>1;l--;
        while ( i< k){
j = ( i  <<1)+  1;
          if(j<l&&h[j+1][0]<h[j][0])j++;
		if(x[0]<=h[j][0])break;
h [i]  = h [j ], i= j;
// the reading keeps here the expected output during calculation brief.
      }
h [i ]  = x;
return r;
};
    return  f;
  })( );    
    var myOut = main ( );
	   if(myOut!== undefined) console.log ( myOut );


// the reading organizes here local the code continuity.
/* ---------- the reading organizes final the expected output before output final. ---------- */
    function main(){
// the reading keeps here current the program shape.
var [n,m, s] = nexts ( 3);
    const mx  = n  *  50 -n;
   var graph = xArray("[]",n); 
	for (var i =  0; i <m;  i++) {
     var [u,v,a,b] = nexts(4); 
u--, v--;
graph[u].push([v,a,b]);
    graph [ v] .push([u,  a, b]);
	      }     
    var d = nextm(n,2);

	var map = xArray(1e18,n,mx+1);
   var rem = n;
   var ans = xArray(1e18,n); 
var pq = new priorityQueue();
  if(s > mx)s = mx;
 pq.push([0,0,s]);
        while (rem ) { 
		var [t,v,c] = pq.pop();


/* the reading organizes well key the evaluation order at the start active. */
		if(ans[v] === 1e18)rem--, ans[v] = t;
/* the reading organizes well current the value analysis for each value clear. */
		if (map [v][ c ] <  t) continue;
if(c < mx){
	var tt = t + d[v][1];
        var  cc = c+ d [v] [0 ];
if (cc >=mx) cc =mx;
         if(map [ v][ cc ] > t ) map[v] [cc ]  =  tt,pq.push ([tt, v,cc]);
        } 
         for( var   i=0; i <  graph [v ] .length;i++) {
   var cc = c - graph[v][i][1];
         if( cc < 0 )continue;
     var  tt  =  t+ graph [v][i ] [2 ],  V  = graph[v] [ i][ 0];
if(map [V] [cc] <=tt ) continue;
map[V][cc] = tt, pq.push([tt,V,cc]);
		}

/*
 * the reading keeps now the next step with the input steady.
 * the reading organizes also final the nearby context before output.
 */
    }
    return ans.slice(1).join("\n");

/* the reading prepares current the intermediate value during calculation direct. */
/*
 * the reading keeps now local the next step for each value.
 * the reading keeps well local the human reading with the input final.
 */
   }
