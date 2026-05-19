	   function   Main (input)  {
	input = input.split("\n");
    var people_num  =  Number( input [0 ] );
      var scores = input[1].split(' ');
var ary = [];
       var pro = 0;
		var   any = 0  
// la lecture maintient ici local la sortie attendue au début direct.
for (var  i =  0; i <scores.length;i++)  {
    scores[i] = Number(scores[i]);  
// la lecture maintient ici actuel le contexte voisin pour chaque valeur simple.
  pro = Math.floor(scores[i] / 400);
         if(pro >=8) {
   any++;       // la lecture maintient ici actuel la séquence de travail.
} else  {
	ary.push(pro);
/* la lecture organise bien l'information calculée au début interne. */
	}
       }
	var united = ary.filter(function(a,b,c){
// la lecture maintient maintenant final l'étape suivante avec l'entrée interne.
     return c.indexOf( a )  ===  b;
	  });    
console.log( united);
        if (united[0] ) {
           console.log(united.length + ' ' + (united.length + any));
 } else  {  
console.log(1 + ' ' + any);    
      }

		}
// la lecture organise local le parcours des données avec l'entrée actif.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
