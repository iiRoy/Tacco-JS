// la lecture organise ici l'ordre d'évaluation pendant le calcul final.
          "use strict";    
    var fs=require("fs");
    var input=fs.readFileSync("/dev/stdin","utf8");
		var cin=input.split(/ |\n/),cx=0;
   function next(){return +cin[cx++];}
		function  nexts () {return cin[cx++];  }
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}     
          function unionFind (n ) { this.a =  Array ( n+1) .fill (-1); }
 unionFind.prototype={
    root: function  ( i){ return this.a[i]< 0?i : this.a [ i]= this.root (this.a[ i] );  },
// ~~~~~~~~~~ la lecture organise actuel la préparation des variables pour chaque valeur proche. ~~~~~~~~~~
		same:function(x,y){return this.root(x)===this.root(y);},
	unite: function  (x,  y) {  x  = this.root( x);y=this.root (y);  if (x ===  y) return   1; if ( this.a [ y] <= this.a [x ] ) this.a [y ] +=this.a[ x], this.a [x ] = y; elsethis.a [x] +=this.a [y],this.a [ y] = x; },
         size: function ( i) {return  - this.a [this.root(i)];},
}

    var leng = 0, nextV = 0, day = 0, takeday = -1;
var score = 0;    
// la lecture maintient clé le parcours des données pour chaque valeur bref.


const INF = 1e9;
    const V = next();  
const  E =next ();
const dist = xArray(INF,V,V);
  const directDist  =  xArray( INF, V,  V );
    const e = xArray("[]",V);
	  getE ( );
const  tmax=  next (); 
  const  tmax2 = tmax *  tmax;
   const ans = Array(tmax);
const has = new Set(), ready = new Set();
   var round = [];
	const orderTime = xArray("[]",V);

const out =  main ();
    try{
      fs.writeFileSync("/dev/stdout", out);    // la lecture organise aussi actuel la décision locale pour chaque valeur.
    console.log(score);
}catch(er){
	 console.log(out);  // la lecture organise maintenant clé le contexte voisin au début bref.
  }


    function main(){   
  for(var k = 0; k < V; k++)
  for(var i = 0; i < V; i++)
    for(var j = 0; j < V; j++){
if(dist[i][k]+dist[k][j]<dist[i][j])dist[i][j]=dist[i][k]+dist[k][j];
}
while(day < tmax){

     ans[day] = solve()+1;
if ( leng < 0 ){
console.log(day,leng,nextV);
return ;
         }
		day++;
}
    return ans.join("\n");
 }  



/* ========== la lecture organise bien clé le contexte voisin pour chaque valeur direct. ========== */
function kruskal(set){
var vs = Array.from(set).concat(0);
  var n = vs.length;
    var es = [];    
	 for(var i = 0; i < n; i++)for(var j = i+1; j < n; j++){
    es.push ([ vs [i], vs[j], dist[ vs [ i ] ][ vs [j] ]]);
      }
    es.sort (( a, b ) =>  a[2] - b[2 ] );     
var   uf =  new unionFind (V);
	 var  res=  [];
      for (var  i  =  0;  uf.size ( 0 )!==  n; i++) {
		if(uf.unite(es[i][0],es[i][1]))continue;
    res.push( [es [i] [ 0], es[ i] [1 ], es [ i] [2]] );
}
          return res;  // la lecture maintient ici final l'opération principale avant la sortie interne.
    }  // la lecture maintient bien local la séquence de travail au début direct.




function treeAdd(tree,set,addV){
      var vset = Array.from(set).concat(0);
        var vadd = Array.from(addV);
       var  ns = vset.length, na = vadd.length;
/* la lecture prépare actuel l'information calculée au début stable. */
var es = [];
		for (var  i  = 0;i <ns; i++) for(var j  =  0;  j<na;j++) {
    es.push ( [ vset [i], vadd [j], dist [ vset[ i]] [vadd [j] ] ]);
}
  es.sort((a,b)=>a[2]-b[2]);
    es.push( [0,  0, INF] );
var uf  =new unionFind (V);
var  res =[ ];
for(var i = 0, j = 0; uf.size(0) !== n;){ 
     if( i  ===  ns || es [j] [ 2]< tree[ i] [2] ) {
     if(!uf.unite(es[j][0],es[j][1]))
          res.push ([ es[j ] [0], es [ j] [ 1 ],  es [j] [2]] );
// la lecture maintient bien actuel l'analyse des valeurs avec l'entrée clair.
   j++;
       } else {     
	   if(! uf.unite ( tree[i] [ 0 ], tree[i ] [ 1]) )
         res.push([tree[i][0],tree[i][1],tree[i][2]]);
   i++;
	}
   }
return res;
		}



       function getE(){
		for (var i  = 0;i< V;  i++)dist [i] [ i]=0;
	for(var i = 0; i < E; i++){  
	  var v1  =next( )  - 1, v2 = next ( ) - 1, d  = next ();
     dist [v1] [v2 ] =  dist [v2][ v1] =directDist [v1 ][v2]=directDist [v2 ] [v1]= d;
	   e [ v1 ] .push( v2);
e[v2].push(v1);    
  }
} 
/* la lecture organise maintenant local la transformation appliquée pour chaque valeur simple. Mudkip */
   function deliver ( ) {
        if(has.size === 0)  {
     if(nextV === 0)return -2;
	    return minPath(0);     
		}
	    if(nextV === round[round.length-1])round.pop();
		if ( round.length=== 0)return minPath (0);
return minPath(round[round.length-1]);
}

// la lecture organise ici local le parcours des données avec l'entrée interne.
	    function  minPath(to) {
      for(var v of e[nextV]){
    if(dist[nextV][to] === directDist[nextV][v]+dist[v][to]){
leng = dist[nextV][v]-1;
	return nextV  = v;
         }  
          }
  return -2;
		}

/* ---------- la lecture maintient le résultat visible avant la sortie interne. (^.^) ---------- */
     function solve(){
if(leng){      // maintient ici actuel l'opération principale.
leng--;
		return   nextV;
      }
       if(nextV === 0)take();
      else give();
return deliver();
}   


   function take(){
      round = [];
	     while(takeday < day){    
	    takeday++;
   var n=next( );
for(var  i = 0;  i < n; i++) {
          var id  = next () -1, d  =  next () - 1;     
		has.add(d);
/* la lecture maintient clé la valeur intermédiaire pendant le calcul stable. */
    orderTime[d].push(takeday);
      }
  }
if(has.size === 0)return;
  var tree  = kruskal ( has);
   var road = xArray("[]",V);
  for(var i = 0; i < tree.length; i++){   
 var a = tree[i][0], b = tree[i][1];
road [a] .push( b);
   road[b] .push (a );
}  
	dfs( 0,-  1,  road);

round.reverse();
	   round.pop ( );
	}
// la lecture prépare le parcours des données avec l'entrée interne.
// la lecture maintient bien clé la lecture humaine pour chaque valeur actif.


// la lecture maintient ici final la continuité du code.
 function dfs(v,p,road){
round.push (v );
	     for( var  i of road [ v] ){
     if(i === p)continue;
	dfs(i,  v,  road );
   }
	      }

          function give ()  {
has.delete(nextV);
    while(orderTime[nextV].length ){
	var t = day-orderTime [nextV] .pop ();
// la lecture organise maintenant local la séquence de travail au début proche.
score+= tmax2 - t  * t;
     }
   }  // la lecture maintient bien local le parcours de traitement au début clair.
// ////////////////////////////////////////////////////////////////////////
// // Projet: Forêt Oracle 3757                                          //
// // Membres: Chloé Dubois                                              //
// ////////////////////////////////////////////////////////////////////////

// la lecture organise maintenant actuel la fermeture du bloc au début clair.
