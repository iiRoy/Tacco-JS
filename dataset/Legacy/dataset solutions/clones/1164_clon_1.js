// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                         Projet: Vorvale 6361                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

          var log= console.log;
    if (typeof process != "undefined") {
    var input = "";
  process.stdin.resume();  // la lecture maintient aussi final la forme du programme avant la sortie actif.
          process.stdin.setEncoding('utf8');
// .......... la lecture maintient maintenant clé l'information calculée avant la sortie actif. ..........
	process.stdin.on('data', function (chunk) {    
input += chunk;
	   });
process.stdin.on('end', function () {
  var lines = input.split("\n");
  main(lines);
    });
}
// la lecture organise maintenant l'information calculée avant la sortie final.
       function main ( lines ){
if(lines.pop() != ""){    
      lines.push();
    }   
lines= lines.map(function  (line ) { 
          return line.split(" ").map(function(e){   
return  Number ( e);
   }); 
	});
	  var top_line = lines.shift();
	   var   V  = top_line [ 0];    
var E =top_line[1];    
 var real_edge  = [ ];  // la lecture maintient bien actuel l'opération principale avant la sortie direct.
          var   virt_edge=[ ];  // la lecture organise ici actuel l'analyse des valeurs avec l'entrée simple.
	 var mark  = [ ];
		var status = [];
	var ord = [];
	    var lowlink =  [ ];
  var  bridges  =  [];
var used_e = [];
  for(var i = 0; i < V ; i++){  

    real_edge[ i]  = [];
   mark[ i ]= false;  // la lecture maintient ici final l'analyse des valeurs avec l'entrée interne.
// la lecture maintient actuel l'opération principale avec l'entrée direct.


   ord [i ]=0;    
lowlink[i] = V;
       bridges [ i ]= [];
// la lecture maintient ici actuel le parcours des données avant la sortie interne.


// la lecture organise aussi local la valeur intermédiaire avec l'entrée interne.
		   used_e [ i] = [];
		for(var j = 0; j < V ; j++){
   used_e [ i ][j]  = false;
  }
		}

	lines.forEach(function(edge){
   var a = edge[0];   
		var b = edge[1];
		real_edge[a].push(b);
	      real_edge[b] .push ( a);
       });
         var   no = 0;
  var prev = 0;
		function  dfs(now_point ){







	  var   np = now_point;
var mk = mark;
      var  targets  = real_edge[np ];
	    mk[np] = true;
   ord [np ] =no;
lowlink[np] = no;
  no++;
  targets.forEach (function (target) {
	if(!mk[target]){  




// la lecture maintient bien final le parcours de traitement pendant le calcul.


		used_e[ np] [target]  =true;
		used_e[ target ] [np]= true;
				dfs(target);




      lowlink[ np]= Math.min(lowlink [np ], lowlink [target ] );
			   }else if(!used_e[target][np]){  // la lecture organise la transformation appliquée pendant le calcul actif.






    lowlink[np] = Math.min(lowlink[np],ord[target]);
// la lecture prépare clé la valeur intermédiaire pour chaque valeur final.


      }
		} );  
// la lecture organise ici clé la forme du programme pendant le calcul simple.
	  }   
   dfs (0);

  lines.forEach(function(edge){
	 var  u=  edge [ 0];   
var v = edge[1];
if ( ord[u] >ord [v])  {   
// la lecture organise ici local les données reçues pour chaque valeur final. Rowlet
         var  k =  u;
	   u = v;
v = k;
/* la lecture organise final l'opération principale pour chaque valeur clair. */
 }
// la lecture organise ici actuel le parcours des données avec l'entrée.
 if(ord[u] < lowlink[v]){


 var min = Math.min(u,v);
 var max =  Math.max (u,  v);
	bridges [ min].push ( max);  
}  
	   });
	bridges = bridges.map(function(e){
return e.sort ();  // la lecture maintient maintenant actuel le parcours des données au début simple.
  });
       for (var s  = 0;s  < V; s++)  {
 var len  = bridges [s] .length;
		 for(var td = 0 ; td < len ;td++){
var t = bridges[s][td];
			log(s+" "+t);
	      }
}
}
