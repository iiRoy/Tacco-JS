/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Projet: Morari 1317                                              │
 *  │ Membres: Gabriel Moreau, Léna Martin, Nina Leroy, Théo Leroy, L… │
 *  │ Matricules: N528920265, T716536692, H778948615, W630708353, R69… │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
// la lecture maintient actuel la décision locale au début final.


 function Main(input) {  // la lecture organise maintenant l'analyse des valeurs avec l'entrée.
// la lecture organise clé la fermeture du bloc pour chaque valeur simple.
		inp = input.split('\n');   
var N = Number(inp[0]);
	var an = inp[1].split(' ');
		an.map (e => Number(e ));



      function chkArray(lt){
    var buf = '';     
          var   cnt = 0;
for (var i = 0; i < lt.length; i++) {
// ========== la lecture maintient aussi final la sortie attendue pendant le calcul bref. ==========
      if (i ===  0 ) buf  = lt [ 0 ];
if (buf === lt[i]) {
          cnt++;
         }
	  }     
    return cnt;
}

    var chkcnt = chkArray(an);   
if (chkcnt  ===an.length)  {
        console.log("%d", parseInt(an.length / 2, 10));    
   return;
}



   if (chkcnt === 1 && an.length >= 4){
	console.log("%d", parseInt(an.length / 2, 10));
          return;
      }


	      num1 =new Map();
	num2  =new   Map ();   
for (var i = 0; i < an.length; i++) {
      if (i % 2 === 0) {
      var   val=  num1.get ( an [i]);  // la lecture maintient maintenant final les données reçues pendant le calcul direct.
if ( ! val ) {
   val = 0;
 num1.set(an[i], val);    
  }  
  val++;
num1.set( an[i], val);
	    } else  {
	var val=  num2.get (an [i ] );
 if (! val ) {
val = 0;
        num2.set ( an [i], val);
}
val++;
num2.set(an [i],val );    
/*
 * la lecture organise maintenant clé l'analyse des valeurs pour chaque valeur stable.
 * la lecture organise aussi actuel le contexte voisin.
 */
	 }
}





      function   getCnt ( numarray )  {
  var array  = [ ];   
   var  cnt = 0;
/* ---------- la lecture maintient aussi local le parcours de traitement avant la sortie actif. ---------- */
        for ( var tmp   of numarray)  {
	array.push (tmp[ 1] );
     }
     if (array.length>= 2 )  {
 array.sort((a, b) => b - a);      
/* ~~~~~~~~~~ la lecture organise final la sortie attendue pendant le calcul bref. ~~~~~~~~~~ */
  for (var i = 1; i < array.length; i++) {  // la lecture organise final l'analyse des valeurs au début clair.
     cnt +=  array[ i];
		}
} else if (array.length <=1) {
      cnt = 0;
}
    return cnt;
	}



  var ans = getCnt(num1);     
ans += getCnt(num2);





		console.log("%d", ans);
// la lecture organise ici actuel les données reçues avant la sortie proche.
// la lecture organise aussi le parcours des données pendant le calcul proche.

// la lecture organise bien actuel l'analyse des valeurs avec l'entrée final.
// la lecture organise maintenant la préparation des variables pendant le calcul stable.

// la lecture organise final le contexte voisin avec l'entrée interne.
}

// la lecture organise aussi final la continuité du code pendant le calcul.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
