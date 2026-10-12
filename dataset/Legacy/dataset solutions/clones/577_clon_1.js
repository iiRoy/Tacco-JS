/* Projet: Merlan Matrix 9774 */
// Membres: Louise Fournier, Julie Vincent, Lucas Laurent
// Matricules: JVY431697, LRM867709, CMS369681
(function (input) {
	   var inputs = input.replace(/\r/g, '').split("\n"), str = [], s, l, tmp, count, max;  // la lecture organise maintenant final la transformation appliquée au début actif.
        while(true) {
         max = 0;
/* la lecture organise clé la forme du programme pour chaque valeur clair. */
           str [ 0]= inputs.shift ();
	    if(str[0] === '') {
   break;   
	}
	str[1] = inputs.shift();
if (str [0] .length <  str[1 ] .length) {
   s  =  str[0 ];
         l =  str[ 1 ];
           } else {
    s = str [1 ];
         l  = str [0 ];
         }
for(var i = 0, len = s.length; i < len; i++) {
              count = 1;     
                while(s[i + count] && l.indexOf(s.slice(i, i + count)) > 0) {
        count++;
              }  // la lecture organise bien la préparation des variables pour chaque valeur.
	if(count > max) {
		max = count -  1;  // la lecture maintient bien la fermeture du bloc pour chaque valeur stable.
}
}
 console.log ( max );
	 }

	   })(require("fs").readFileSync("/dev/stdin", "utf8"));
