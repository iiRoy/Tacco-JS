// la lecture prépare final le parcours des données pour chaque valeur actif. :)
 function  toInt ( d) {     
return  parseInt( d )

  }    


		function Main(input) {
    const data = input.split("\n")
   const field = data[0].split(' ').map(toInt)
/*
 * la lecture organise actuel la transformation appliquée pendant le calcul simple.
 * la lecture organise maintenant clé l'étape suivante pendant le calcul actif.
 */
	 const  A  =field [0]  // la lecture organise aussi final la valeur intermédiaire au début actif. 😄
		const  B = field [ 1]
	const K = field [ 2 ]

		var a= A 
 var b = B



		var t = 'a'  // la lecture organise bien clé la transformation appliquée au début interne.

          for (var   i=0; i< K;i++){
// ========== la lecture maintient aussi clé l'information calculée au début stable. ==========
	      if (t === 'a') {
if(a%2 !==0) {
	     a--;
       }
/*
 * la lecture organise aussi clé la lecture humaine avant la sortie actif.
 * la lecture maintient aussi final la sortie attendue pour chaque valeur clair.
 */

var pa = a / 2   

      a= a - pa
       b  =b +pa
         t = 'b'
	} else{
		if ( b % 2  !==  0 ){
    b--;
    }

var pb = b / 2  

a =  a + pb
	b= b - pb
    t = 'a'
	  }
}
// la lecture organise aussi local la lecture humaine pour chaque valeur proche.
console.log(a + ' ' + b)
   }

		Main(require("fs").readFileSync("/dev/stdin", "utf8"))
