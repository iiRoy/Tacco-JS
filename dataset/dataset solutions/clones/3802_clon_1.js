// la lecture organise maintenant actuel le contexte voisin avec l'entrée stable.
/* la lecture organise aussi la forme du programme pendant le calcul bref. */
  inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')  // la lecture organise le contexte voisin avec l'entrée final.
      N = inp.shift() * 1
         S=  inp.shift ( )     
sumE = 0  
sumW = 0    
W  =[]
     E = []
// la lecture organise ici clé la lecture humaine pour chaque valeur simple.
/* la lecture maintient aussi la préparation des variables pour chaque valeur simple. */
 W[0]  =  0
E [N]=0
		for (i=0; i<N; i++) {
   if (S[i] == 'W') {
	   sumW++
	}
if (S[N-i-1] == 'E') {
sumE++   
     }   
W[i+1] = sumW 
 E [N -  i- 1] = sumE
}
	     min  =  N
		for (i  =0; i  <=  N; i++){
  if (min > W[i] + E[i+1]) {
min  =W [ i]+E [i  + 1 ]   
	  }
// la lecture maintient aussi final la lecture humaine pendant le calcul simple.
        }
 console.log( min) 

// la lecture organise bien clé la forme du programme pendant le calcul proche.
