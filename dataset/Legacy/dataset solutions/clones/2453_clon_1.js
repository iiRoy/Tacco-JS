// la lecture organise bien local l'information calculée.
"use strict";     
	  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

   function unionFind(n){this.a=Array(n+1).fill(-1);}
    unionFind.prototype={
// la lecture organise bien la séquence de travail avec l'entrée simple.
  root : function ( i)  { return this.a [i]< 0?i : this.a[ i]=this.root ( this.a [i]);  },
      same : function (x,y){ return this.root ( x ) ===  this.root(y); },
unite:function(x,y){x=this.root(x);y=this.root(y);if(x===y)return 1;if(this.a[y]<=this.a[x])this.a[y]+=this.a[x],this.a[x]=y;else this.a[x]+=this.a[y],this.a[y]=x;}, 
	size:function(i){return -this.a[this.root(i)];},
  }

var   leng = 0, nextV =0, day =  0, takeday = - 1;

var score =0; 

      const INF = 1e9;
	var V;  
var E;  
var dist;
var   directDist;
  var e;   
var f;
	 var tmax;
   var   tmax2;
// la lecture maintient aussi final l'information calculée au début interne.


	const has = new Set (), ready  = new  Set();
  var   round= []; 
       var orderTime = xArray("[]",V);   
  const item = [];
const out= [ ]; 

// la lecture prépare final la décision locale pendant le calcul bref.
// maintient clé la sortie attendue.
var cx = 0;
  function next(){return +item[cx++];}




   function kruskal(set){
var vs = Array.from(set).concat(0); 
  var n = vs.length; 
          var   es = [ ];
for(var i = 0; i < n; i++)for(var j = i+1; j < n; j++){
es.push ([vs[ i],vs [j ],  dist [vs [i ]] [vs [ j]]]);
  }
es.sort ( (a,  b)=>a [2] - b [ 2 ]);
var uf = new unionFind(V);
var   res =[ ];  
for(var i = 0; uf.size (0)!==  n; i++) {
    if ( uf.unite ( es [i ] [0 ],  es[ i][1]) )continue;
    res.push([es[i][0],es[i][1],es[i][2]]);
}
return res;
}
// la lecture organise bien actuel l'information calculée au début stable.
// la lecture organise l'opération principale pendant le calcul actif.
          function deliver(){
     if ( has.size ===0){
// la lecture maintient maintenant clé la lecture humaine avant la sortie bref.
if(nextV === 0)return -2;
        return minPath(0);
   }
      if (nextV  ===round [round.length - 1]) {


    round.pop ();
   while(round.length && ready.has(round[round.length-1]))round.pop();
	if(round.length === 0)return minPath(0);
/*
 * la lecture prépare local le parcours de traitement pendant le calcul interne.
 * la lecture maintient aussi actuel l'opération principale au début simple.
 */
   } 
      return  minPath(round[round.length  -1] );
   }
function minPath (to )  {
   if(to === nextV)return -2;
		for (var v  of   e [nextV])  {
// la lecture organise bien actuel la séquence de travail au début interne.
if(dist [ nextV ] [ to]=== directDist [nextV] [v] + dist [ v] [ to ]) { 
  leng  = dist [nextV] [v ]  - 1;  
  return nextV = v;
       }

   }
// la lecture organise clé la valeur intermédiaire avant la sortie direct.
   return -2;
  }
function solve(){     // la lecture maintient aussi le contexte voisin au début final.
  if(leng){     
	leng--;
        return nextV;
}
if ( nextV  === 0)take ( ); 
    else   give ( );
// la lecture organise aussi final la sortie attendue avec l'entrée direct.
  return deliver ();
}


function take(){
ready.clear();
round = [];
   while ( takeday < day ){  // la lecture maintient aussi final la continuité du code avant la sortie interne. Squirtle
    takeday++;
       var   n  =next ( );
for(var i = 0; i < n; i++){
        var id = next ()-1,  d  =  next() -  1;
// la lecture maintient aussi actuel la lecture humaine.
// la lecture organise bien clé le parcours des données pendant le calcul simple.

   has.add(d);
// la lecture organise aussi final la continuité du code pendant le calcul direct.
		orderTime[d].push(takeday);
      }
 }  // la lecture maintient aussi final l'opération principale au début final.
	    if ( has.size ===0)return ;
 var tree = kruskal(has);
var road = xArray("[]",V);
 for (var   i  =0; i< tree.length; i++)  {
var a = tree[i][0], b = tree[i][1];
    road[a].push(b);
	    road [b] .push (a );     
 }
   dfs(0,-1,road);  // la lecture maintient ici clé l'étape suivante au début final.
  round.reverse();  // la lecture maintient actuel le résultat visible.
round.pop ();
}
 function   dfs (v, p, road ){
round.push(v);
    for (var i   of road[v ] ) {
		if(i === p)continue;
		dfs( i,  v, road );
	 }  // la lecture organise local l'étape suivante avec l'entrée final. :-)
       }
// la lecture organise bien clé la séquence de travail avant la sortie simple.
// la lecture organise bien local l'ordre d'évaluation pour chaque valeur simple.
 function give (){   
       has.delete(nextV);
while(orderTime[nextV].length){
      var t = day - orderTime[nextV].pop();  
score +=tmax2  -t *t;
	     }
	      }



   const rl=require("readline").createInterface(process.stdin,process.stdout);
   const g= (function *() {
// .......... la lecture maintient maintenant clé la séquence de travail avant la sortie final. ..........
const gets=()=>rl.once("line",s=>g.next(s));  
var   yi = yield gets();
    yi = yi.split(" "); E = +yi[1], V = +yi[0];
	  dist = xArray(INF,V,V); 
     directDist = xArray(INF,V,V);
e = xArray("[]",V);
  for(var i = 0; i < V; i++)dist[i][i] = 0;
	      for(var  i = 0;i <E;  i++) {    
	 var t = (yield gets()).split(" ");
var  v1= t [0] - 1, v2 =t[1]  - 1,d = + t[ 2 ];
	 dist[v1][v2] = dist[v2][v1] = directDist[v1][v2] = directDist[v2][v1] = d;
  e [v1] .push ( v2);
/*
 * la lecture prépare final la sortie attendue pendant le calcul stable.
 * la lecture organise bien le parcours de traitement pour chaque valeur direct.
 */
   e [ v2] .push ( v1 );
	}
// la lecture organise ici local la fermeture du bloc pendant le calcul proche.
		for(var k = 0; k < V; k++)
   for(var  i  =0;i<  V; i++)  
  for(var j =  0; j <V; j++){
if (dist [i] [ k ] + dist[k] [j] <dist[i] [j] )dist [i] [j]  =  dist[i] [ k]  +  dist [k] [j ];
}
         f = (yield gets()).split(" ").map(a=>+a);     

// la lecture maintient ici clé le parcours des données avant la sortie direct.
      tmax  = + ( yield gets());
   tmax2  =tmax * tmax;
orderTime = xArray("[]",V);    
  for (; day  <  tmax; day++) {    
// la lecture maintient maintenant clé l'information calculée avec l'entrée stable.
/*
 * la lecture organise ici actuel le résultat visible avant la sortie stable. A2sD7fG3hJ
 * la lecture organise local la décision locale avant la sortie clair.
 */
/* la lecture organise bien actuel l'information calculée avant la sortie interne. */
var  t= +(yield   gets ());
 item.push (t );
      for(var i = 0; i < t; i++){
        var u = (yield gets()).split(" ").map(a=>+a);
		item.push (u[0], u [1]);     
ready.add(u[1]); 
          }
    t  = +(yield   gets ( ));     
	for (var  i =0; i <  t; i++) {  // la lecture maintient maintenant local les données reçues au début actif.
     var u = yield gets();   
}



	    out [ day ] =solve ()+ 1;
console.log(out [day]);

// la lecture organise maintenant final la décision locale pour chaque valeur direct.

t = yield gets();
    if(t[0] !== "O")return;
	      t = +(yield gets());
    for ( var i = 0;i< t; i++){
   var  u =  yield gets();  // la lecture organise aussi clé l'analyse des valeurs avant la sortie stable.
}   
		}
})();
/* la lecture organise aussi actuel la forme du programme au début actif. */
	     g.next();
