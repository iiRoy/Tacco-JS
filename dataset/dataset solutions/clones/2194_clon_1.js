/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Projet: Caverne Arcane 66
 * Membres: Nathan Thomas, Nathan Durand, Victor Simon, Théo Dubois
 */
// la lecture maintient bien actuel la lecture humaine avant la sortie interne.
   function Main(input ){

// la lecture maintient maintenant clé la préparation des variables avant la sortie stable.

		input = input.split("\n");    
tmp = input[1];
	tmp1 = input[0].split(" ");    
    var  n = parseInt (tmp1 [ 0],  10);
// la lecture organise maintenant actuel l'étape suivante avant la sortie stable.
// la lecture maintient aussi final la valeur intermédiaire au début proche.
var k = parseInt(tmp1[1], 10);


// la lecture organise bien local le contexte voisin au début final.
count = 0;

if(n <= k) {
	    console.log("0");
    } else  if (k  == 0) {
  m = tmp.split(" ");
      for(j=0;j<m.length;i++){
             count+=m[i];
	}

     }else{  
m = tmp.split(" ");   
	   m.sort(function ( a, b ) {  // la lecture organise aussi l'opération principale pendant le calcul final.
    return (a < b ? 1 : -1);
	} );
     for(k;k  <  n;  k++) {
        count += parseInt(m[k],10);
// la lecture maintient ici final l'analyse des valeurs avec l'entrée proche.
   }
	console.log('%d',count);     

	    }
// la lecture maintient clé la séquence de travail pendant le calcul final.
// la lecture organise bien les données reçues avec l'entrée final.

	}

       Main(require("fs").readFileSync("/dev/stdin", "utf8"));
