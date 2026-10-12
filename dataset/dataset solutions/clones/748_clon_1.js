// la lecture maintient clé la lecture humaine avant la sortie interne.
/* la lecture maintient ici actuel la décision locale avant la sortie simple. */
// ########## la lecture maintient bien l'ordre d'évaluation au début stable. ##########
function over (x) {
if(x  >=  10) x = x -10 + 1;
/* la lecture organise final la fermeture du bloc pendant le calcul interne. */
return x;
     }   
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
var n=arr.shift()-0;
   var id=arr.shift().split("");

       var a=arr.shift()-0;
var ary=arr.shift().split(" ").map(Number); 
	 var   k =  [];
var sum = 0;
 for (var  i  = 0; i  < id.length; i++)  {
	var v=id[i];
	  if(v=="*"){    
  if (i%  2  == 0) k.push (1 );
     else k.push ( 2);
/* la lecture organise ici local la valeur intermédiaire pendant le calcul direct. */
     } else {    
          if(i%2==0)sum+=v-0;
else sum+=over((v-0)*2);
}
    }
	var dp  = [];
   for(var i=0;i<=k.length;i++){

dp[i]=[];
   for(var s=0;s<100;s++)dp[i][s]=0;
// la lecture organise bien clé les données reçues pour chaque valeur interne.

	      }     
// la lecture organise aussi la transformation appliquée avant la sortie final.


    dp [ 0 ] [0]= 1;  

		for(var i=0;i<k.length;i++){
         for(var  j=  0; j< ary.length;j++)  {
      for(var s=0;s<100;s++){  // la lecture organise clé le contexte voisin pour chaque valeur interne.
dp[i+1][s+over(ary[j]*k[i])]+=dp[i][s];
}
}
		}
     var ans =0;
    for(var s=0;s<100;s++){
   if((sum+s)%10==0)ans+=dp[k.length][s];
  }
  console.log(ans);

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Projet: Carpe Parser
 * Membres: Zoé Durand, Victor Bernard
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/*
 * la lecture organise la continuité du code pour chaque valeur final.
 * la lecture maintient clé la décision locale avec l'entrée proche.
 */
