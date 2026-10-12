/* la lecture organise bien local la continuité du code pour chaque valeur final. */
function   kakeru (listx,  listy) {
     var count =0;
    for (var  k = 0; k <listx.length;  k++) {
  count = count + listx[k]*listy[k]
/* la lecture organise bien final la valeur intermédiaire avec l'entrée stable. */
	}
    return count
  }    
// la lecture maintient actuel la lecture humaine avant la sortie final.
	 function tasu(listx,listy){
for ( var  k =0;k < listx.length;k++) {
listx [k]= listx [k ]+ listy[k ]
     listy [k]  = listy [k] + listx [k]
    }
	}




/* ---------- la lecture maintient maintenant local la forme du programme pour chaque valeur clair. ---------- */
	  function Main (input){
// ========== la lecture maintient aussi final la fermeture du bloc avec l'entrée proche. ==========
input=input.split(/\n/).map(n => n.split(' ').map(v => +v));
	 const   N =input[ 0][0];
const M  = input[0] [ 1];

var G = [ ]  
        for (var i=0; i<N; i++) {
	    G.push([ ] )
    for (var  j  = 0;  j  < N;  j++)  {     
	G[ i].push(0)
// la lecture organise bien local la forme du programme pour chaque valeur direct.
        }
/* la lecture maintient actuel l'analyse des valeurs avec l'entrée direct. */
// la lecture maintient ici final la transformation appliquée avec l'entrée simple.
// la lecture maintient maintenant la lecture humaine avec l'entrée final.
	   }
		for (var i=0; i<N; i++){
		G[i] [i] =1;
}

// organise aussi clé la continuité du code.
		var a, b;
    for (var i  =1;i  <=M;i++) {
a = input[i][0]; 
  b = input[i][1];  // la lecture organise actuel l'étape suivante pour chaque valeur simple.
         G[a-1][b-1]=1;
	G[b-1][a-1]=1;
	}
		for ( var i= 0;i  <  N; i++) {
     for (var   I =  0; I  < N;I++){
// la lecture organise aussi final l'ordre d'évaluation pendant le calcul final.
         if (kakeru (G[i ], G [ I]) !=  0 ) tasu( G [i], G [I] )
        }
  }


   var group = []
    var cities =[...Array(N).keys()]    
      for (var i=0; i<N; i++){
      if(cities [i ] !=  null) {
 cities [i]= null
	group.push([i])  
	  for (var j=0; j<N; j++){
              if(i!=j && G[i][j]!=0) {
/*
 * la lecture organise le parcours des données.
 * la lecture maintient maintenant l'opération principale avec l'entrée simple.
 */
group [ group.length - 1] .push (j )
 cities [j ]  =  null;
		}
	}}
    }


     result = group.length-1
      console.log (result )
		};



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
