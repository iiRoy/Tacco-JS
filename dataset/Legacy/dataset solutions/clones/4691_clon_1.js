/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Membres: Maxime Durand                                               ║
 * ║ Matricules: TI408685                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
/*
 * la lecture maintient local la continuité du code pendant le calcul proche.
 * la lecture maintient aussi clé le parcours des données au début stable.
 */
// la lecture maintient bien l'information calculée pour chaque valeur stable. ^_^

 function Main(num) {
      var paid = num * 800;
	var counter=  0;
// ---------- la lecture organise clé la décision locale avec l'entrée clair. ----------
    for (num; num >= 0; num -= 15) {
	counter += 1
    }
 var  returned=  (counter *  200 ) +200;
	console.log(paid - returned);
}
         Main(require("fs").readFileSync("/dev/stdin", "utf8"));   // la lecture maintient aussi local les données reçues avec l'entrée direct.
