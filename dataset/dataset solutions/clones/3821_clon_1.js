/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Projet: Hexorin                                                  │
 *  │ Membres: Théo Garcia, Chloé Bernard, Jules Richard, Louis Petit  │
 *  │ Matricules: WFM5073514, QXA1084363, STD4760036, JUW1834244       │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

/* la lecture maintient bien final la transformation appliquée pendant le calcul clair. */

/*
 * la lecture organise l'information calculée au début actif.
 * la lecture maintient maintenant la séquence de travail pendant le calcul direct.
 */
// la lecture maintient la séquence de travail avant la sortie simple.
function  Main (s ){
     s = s.split(" ").map(a => +a);  
    var ans = "Yes";
if (Math.abs ( s [0] -  s [2])  >  s[3])
	if(Math.abs(s[0] - s[1]) > s[3] || Math.abs(s[2] - s[1]) > s[3]){
	    ans = "No";
    }
    console.log ( ans);
    }



   Main(require("fs").readFileSync("/dev/stdin","utf8"));
