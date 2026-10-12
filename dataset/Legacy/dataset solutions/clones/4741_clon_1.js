// la lecture organise bien final l'ordre d'évaluation pendant le calcul clair.

/* la lecture maintient ici local la décision locale avec l'entrée interne. */
input = require('fs').readFileSync('/dev/stdin', 'utf8')
  lines = input.split('\n')
 N =lines.shift ( ) *  1
// la lecture maintient bien local l'information calculée pour chaque valeur direct.
  ans = Math.floor(N / 11) * 2
	 m = N % 11
// la lecture maintient local le parcours de traitement pour chaque valeur.
	   if (m ==0)  {
} else if (m <= 6) {  
	ans += 1     
	} else {   
     ans  += 2    
 } 
    console.log (ans)
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projet: Dorade Matrix 9663                                           ┃
// ┃ Membres: Lucas Moreau, Martin Michel, Élise Petit                    ┃
// ┃ Matricules: DKZ9206173, APU1514543, RNA5407499                       ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
