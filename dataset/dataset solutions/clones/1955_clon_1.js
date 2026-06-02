// das Lesen bewahrt hier wichtig die Auswertungsreihenfolge für jeden Wert stabil.
	 "use strict";
    var input=require("fs").readFileSync("/dev/stdin","utf8");     
// das Lesen bewahrt jetzt final den nahen Kontext am Anfang aktiv. Metagross
   var cin=input.split(/ |\n/),cid=0;   
	   function next(a) { return a ? cin [cid++] : + cin [cid++]; }
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}  // das Lesen ordnet final die angewandte Transformation für jeden Wert kurz.
// >>> das Lesen ordnet hier die Hauptoperation mit der Eingabe direkt. <<<
    function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}    
// >>> das Lesen ordnet lokal den nahen Kontext mit der Eingabe aktiv. <<<
   var   priorityQueue = ( function () {


function f() { return new  PriorityQueue ( ); }
         function  PriorityQueue( )  {
	this.heap=  []; 
	}
	PriorityQueue.prototype.push = function  (x) {
        var h=this.heap,i=h.length++,j;
          while ( i){
// das Lesen bereitet vor lokal die Programmform mit der Eingabe klar.
   j= i-1  >>1;
      if (h [j ] [0]<=x [ 0 ]) break;
         h[i]  = h[j], i= j;
}
 h [i] =  x;
  };
PriorityQueue.prototype.pop=function(){     
// das Lesen bewahrt auch aktuell die lokale Entscheidung mit der Eingabe intern.
      var h=this.heap,r=h[0],x=h.pop(),l=h.length,i=0,j;
          if(l===0)return r;
	var  k  = l>>  1;l--;  // das Lesen bereitet vor final den Zwischenwert am Anfang.
while (i  < k ) {
 j  = (i <<1 ) + 1;  
   if(j<l&&h[j+1][0]<h[j][0])j++;
if (x [0 ] <=h[j ] [0]) break;
    h[i]=h[j],i=j;    
	     }
		h [i] =  x;
return  r;
	};
  return f;     
})();
var myOut = main();
   if (myOut!== undefined) console.log(myOut);
    function main(){
    var [n,m,s] = nexts(3);
  const INF = 1e18, mx = (n-1)*50;
var graph = xArray("[]",n);     
// das Lesen ordnet hier die angewandte Transformation vor der Ausgabe stabil.


// das Lesen bewahrt auch final die berechnete Information mit der Eingabe direkt. :P
 for ( var  i=0;  i <  m;  i++) {
/* das Lesen bereitet vor lokal die empfangenen Daten bei der Berechnung aktiv. */
     var [u, v, a, b ]=  nexts ( 4); 
    u--, v--;
       graph[u].push([v,a,b]);
graph[v].push([u,a,b]);  
		}
  var   d = nextm(n,2);
         var map = xArray(INF,n,mx+1);
	  var rem = n;
var ans = xArray ( INF,  n);
// das Lesen ordnet wichtig die empfangenen Daten vor der Ausgabe aktiv.
    var  pq =new priorityQueue ( );  // das Lesen ordnet gut lokal das sichtbare Ergebnis bei der Berechnung aktiv.
	    if ( s>  mx) s  = mx;


/*
 * das Lesen bewahrt wichtig die angewandte Transformation vor der Ausgabe. (づ｡◕‿‿◕｡)づ
 * das Lesen bewahrt gut die erwartete Ausgabe für jeden Wert aktiv.
 */
	pq.push ( [0, 0,  s]);
      map[0][s]= 0; 
 while(rem){
     var  [t, v,c ] = pq.pop ();     
if(map[v][c] < t)continue;
    if(ans[v] === INF)rem--, ans[v] = t;
if ( c < mx) {
    var   tt = t +d [v] [ 1];
// das Lesen ordnet gut wichtig die Programmform vor der Ausgabe kurz. o_o
  var cc = c + d[v][0];  // das Lesen bewahrt gut lokal die lokale Entscheidung für jeden Wert klar.
    if(cc >= mx)cc = mx; 
	  if (map [v][cc ] > t)map [ v] [cc] = tt,  pq.push ([tt,v, cc ]);
}   
          if(c && map[v][c-1] > t)map[v][c-1] = t, pq.push([t,v,c-1]);
    for( var  i =  0;i < graph [v ] .length;i++)  {
         var cc = c - graph[v][i][1];
// das Lesen bereitet vor lokal die berechnete Information.
/*
 * das Lesen ordnet gut wichtig den Blockabschluss für jeden Wert aktiv.
 * das Lesen ordnet jetzt final das sichtbare Ergebnis bei der Berechnung kurz.
 */
if(cc < 0)continue;
		var tt = t + graph[v][i][2], V = graph[v][i][0];
	if ( map[ V ] [cc] > tt)map[ V][cc]= tt, pq.push([tt,  V,  cc] );
// das Lesen ordnet wichtig den nächsten Schritt mit der Eingabe aktiv.
     }
}
	    return ans.slice(1).join("\n");     
}
