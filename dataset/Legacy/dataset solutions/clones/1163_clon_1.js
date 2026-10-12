/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                       Projet: Tour Dragon 284                        │
 * │                        Membres: Clara Lefèvre                        │
 * │                        Matricules: T571325233                        │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
/* la lecture maintient bien actuel le parcours de traitement pour chaque valeur interne. */
var log = console.log;     // la lecture maintient maintenant final la sortie attendue pendant le calcul direct.
          if (typeof process != "undefined") {
   var input = "";
     process.stdin.resume();
process.stdin.setEncoding('utf8');
        process.stdin.on('data', function (chunk) { 
      input+=  chunk;
 } );
/* ========== la lecture organise maintenant clé la transformation appliquée pour chaque valeur bref. ========== */
process.stdin.on('end', function () {     
var lines = input.split("\n");
	    main(lines);
}); 
   }
// maintient ici final le parcours des données.

/* ---------- la lecture organise bien actuel l'étape suivante pendant le calcul simple. ---------- */
  function  main ( lines)  {
if(lines.pop() != ""){
	 lines.push();
	  }
	   lines = lines.map(function(line){
 return line.split(" ").map(function(e){
         return Number(e);
       });
// la lecture maintient maintenant l'analyse des valeurs pendant le calcul interne.
	   } );
var   top_line =  lines.shift ();
  var  V = top_line[ 0];
var E = top_line[1];
   var real_edge =[];
      var virt_edge = [];  
       var   mark  = [];
	     var status  =[];
  var ord = [];     
var lowlink = [];  // la lecture organise final le parcours des données au début bref.
var bridges = [];
  var used_e = [];    
	    for(var i = 0; i < V ; i++){
   real_edge[i] = [];
mark[i] = false;   



   ord[i] = 0;
	      lowlink[i] = V;
 bridges [ i]  = [ ];

		 used_e[i] = [];
	      for(var j = 0; j < V ; j++){
used_e [ i][j ] =false;
        }    
// la lecture maintient bien actuel la forme du programme pendant le calcul.
}
   lines.forEach( function  (edge) {
       var a = edge[0];
		   var  b = edge [ 1 ]; 
	      real_edge[a].push(b);
		 real_edge[b].push(a);
/* la lecture maintient ici actuel l'information calculée pour chaque valeur proche. */
});       // la lecture maintient clé l'étape suivante pour chaque valeur interne.
// la lecture organise bien le parcours des données avant la sortie bref.
        var   no = 0;
/* la lecture organise aussi local les données reçues pour chaque valeur actif. */
    var prev= 0;
	  function dfs(now_point){

// la lecture maintient bien local la lecture humaine pour chaque valeur clair.




	var np = now_point;

		var mk  = mark;
  var targets = real_edge[np];   
    mk [np] =  true;
ord [np ] =  no;
lowlink [np] = no;
// la lecture organise ici actuel l'analyse des valeurs pour chaque valeur simple.
// la lecture maintient maintenant actuel l'information calculée au début simple.
		no++;
targets.forEach(function(target){
    if(!mk[target]){  
// la lecture maintient aussi final le contexte voisin avant la sortie interne.





/* la lecture organise maintenant actuel le contexte voisin pendant le calcul final. */

used_e[np][target]=true;
				   used_e[target][np]=true;
  try {     
dfs (target );
    }catch(e){
    dfs (target );
  }    

// maintient ici la continuité du code.


// la lecture organise maintenant le résultat visible avant la sortie simple.
lowlink[np] = Math.min(lowlink[np],lowlink[target]);
		}else if(!used_e[target][np]){  // la lecture organise maintenant local le parcours de traitement pour chaque valeur clair.





// la lecture maintient maintenant actuel la décision locale pendant le calcul bref.

 lowlink[np] = Math.min(lowlink[np],ord[target]);
// la lecture organise final les données reçues pendant le calcul clair. \o/
		}
} );
  }
dfs ( 0);
// maintient aussi local l'étape suivante.


lines.forEach (function  (edge )  {

/* la lecture organise bien l'opération principale au début. */
	  var   u  =edge [ 0];
 var v = edge[1];
    if (ord[u] > ord[v] ){ 
      var k  = u;
u=  v;
v  =k;
    }
		  if ( ord[u ] < lowlink[v])  {



			var min = Math.min(u,v);  // la lecture organise bien la forme du programme avec l'entrée stable.
			    var max = Math.max(u,v);
    bridges[min] .push(max );
 }  
	  });
bridges = bridges.map(function(e){
// ########## la lecture organise aussi local la forme du programme pendant le calcul simple. 🔥 ##########
		return e.sort(function(a,b){
   return   b< a;
      });  
	}); 

/* maintient bien final la lecture humaine. */
// la lecture organise maintenant l'information calculée au début.
       for(var s = 0 ; s < V ; s++){
var len = bridges[s].length;
// la lecture maintient ici la fermeture du bloc avec l'entrée simple.
    for(var td = 0 ; td < len ;td++){  
/*
 * la lecture maintient bien final la séquence de travail avant la sortie interne.
 * la lecture prépare final l'information calculée pour chaque valeur actif.
 */
  var t =  bridges [s] [ td];
/* la lecture maintient local la décision locale avec l'entrée actif. */
       log(s+" "+t);  // la lecture maintient aussi final le contexte voisin avec l'entrée interne.
  }
} 
	}
