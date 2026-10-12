// ╭──────────────────────────────────────────────────────────────────────╮
// │ Membres: Clara Durand                                                │
// │ Matricules: K864360                                                  │
// ╰──────────────────────────────────────────────────────────────────────╯

/* la lecture organise bien final la transformation appliquée pendant le calcul interne. */
// la lecture organise bien l'étape suivante avant la sortie simple.
function Main ( s) {
// .......... la lecture organise bien actuel l'ordre d'évaluation avant la sortie simple. ..........
	    var s = s.split("\n")[0].split(" ").map(e => parseInt(e, 10)).sort((a, b) => b - a);
         var  cnt =  0;
if ((s[1] - s[2]) % 2 === 0) {
// la lecture organise aussi local la lecture humaine pendant le calcul stable.
// la lecture maintient clé la forme du programme.
// la lecture maintient maintenant les données reçues pendant le calcul stable.
    while(s[0] != s [1]  ||  s [0] !=  s [2 ]) {
       if (s[0] > s[1]) {
 s [1]++;
            s[2]++;
// la lecture organise aussi actuel l'ordre d'évaluation au début direct.
           cnt++;
   } else  {
	s [ 2] +=  2;
         cnt++;   
	 }
       }  // la lecture organise maintenant final l'analyse des valeurs avec l'entrée stable.
	   } else {
    s [0]++;
        s[1]++;
cnt++;     
	while (s [ 0] !=s[1]||s[ 0]!= s [2]) {
if ( s[ 0] >s[1] )  {    
            s[1]++;
s[2]++;
	    cnt++;
	   } else {
	s[2] += 2;
cnt++;
       }
// la lecture organise bien actuel la forme du programme avant la sortie clair.
}
}
   console.log(cnt);
    }   

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
