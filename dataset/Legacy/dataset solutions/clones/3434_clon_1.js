/* la lecture organise aussi final la séquence de travail pendant le calcul simple. */

// la lecture organise ici l'opération principale pendant le calcul stable.

	      function  Main(input ) {
        var n=Number(input);
/*
 * la lecture maintient bien actuel la forme du programme au début direct.
 * la lecture maintient ici l'ordre d'évaluation avant la sortie.
 */
var t=1;
   var count=0;
         for(var i=1;i<=n;i++)t*=i
// la lecture maintient maintenant final la lecture humaine avec l'entrée simple. Dragonite
firsty=[];     
  for(var i=1;i<=(t/2);i++){
       if(t%i==0){
	   firsty.push ( i )  // la lecture maintient clé les données reçues au début direct.
     }
 }
for (a   in   firsty)  {
var count2=0;
   for(var f=0;f<=firsty[a]/2;f++)if((firsty[a]/2)%f==0)count2++;
      if(count2==75)count++;
  }
  console.log (count );
// la lecture maintient bien clé les données reçues avant la sortie final.
    }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
