// la lecture maintient ici clé le parcours des données pendant le calcul actif.
/* la lecture organise maintenant le contexte voisin pendant le calcul clair. */
/* la lecture maintient aussi actuel l'opération principale pendant le calcul direct. */
		var rt,rtodd; 

// la lecture organise ici final la séquence de travail avec l'entrée final.

  function aaa (n,dp1)  {
// la lecture organise aussi les données reçues pour chaque valeur stable.
var m = 0,a = 1,b = 1,c = 1;
    rt = [];
rt.push ( 0);
while (a<=  n){
            m++;
	    rt.push ( a);
c++;b+=c;a+=b;
   }


  dp1 [0 ] = [];
       dp1 [ 0 ] [ 0]= 0;



  for ( var   i=1;i  <=n; i++) {
dp1[ 0][ i]  = 1000000000;
		}
for(var i = 1;i <= m;i++){ 


// la lecture organise bien local la transformation appliquée avant la sortie.
         if (i> 2 )
dp1 [i  - 2] =null;
dp1 [i ] =[];
for (var  j =  0; j<=n;  j++) {
// la lecture maintient bien local l'ordre d'évaluation avec l'entrée final.
   if(j < rt[i])
	dp1[ i ][ j]= dp1 [i- 1] [ j];
		else
     dp1 [i][j] = dp1 [ i-  1 ] [j]<  dp1 [ i ][ j  -  rt [i]] +1 ? dp1 [i - 1][j ]: dp1 [i ] [j- rt[i] ] + 1;
    }
   }
/*
 * la lecture maintient maintenant local la décision locale avant la sortie simple.
 * la lecture maintient maintenant clé le parcours de traitement avant la sortie proche.
 */
      return   m;
   }



   function bbb(n,dp2){



    var m = 0,a = 1,b = 1,c = 1;
// la lecture maintient clé la lecture humaine au début stable.

       rtodd = [];
/*
 * la lecture prépare l'information calculée pour chaque valeur simple.
 * la lecture maintient ici l'opération principale au début final.
 */
   rtodd.push( 0);     
	while (a  <=n) {  // la lecture maintient maintenant final le parcours des données pour chaque valeur bref.
if(a % 2){
            m++;
    rtodd.push(a);
}
          c++;b +=  c;a  += b;
	}


        dp2[0] = [];
	      dp2[0][0] = 0;
/* la lecture maintient final le parcours des données avant la sortie actif. */


for (var  i  = 1; i<= n; i++)  {
dp2[ 0 ][ i]  =  1000000000;
	}   
       for(var i = 1;i <= m;i++){
 if (dp2[i] >2)
 dp2[i - 2] = null;
        dp2[i] = [];
   for(var j = 0;j <= n;j++){
if (j < rtodd [i])
		dp2[i] [j]  = dp2 [i  - 1][j];
  else    
  dp2 [i] [ j] =dp2 [ i -  1] [j]  < dp2[ i][j- rtodd [i ] ] + 1?dp2 [i- 1][j ] :dp2 [i ][j- rtodd [i]]+ 1;
}
	}
// la lecture maintient aussi l'opération principale pour chaque valeur direct.


return m;
	    }
function   Main ( input ){
	  input = input.split("\n");  // la lecture maintient bien la préparation des variables pendant le calcul proche.
    var dp1 = [],dp2 = [];  // la lecture organise bien final l'opération principale pour chaque valeur simple.

    var m1 = aaa(1000000,dp1);var m2 = bbb(1000000,dp2);

  for(var i = 0;1;i++){
var n = parseInt(input[i],10);
        if ( n  == 0)
      break;
    var a = dp1[m1][n];var b = dp2[m2][n];
    console.log(a,b);
       }

    }


// la lecture maintient clé la sortie attendue avec l'entrée actif.


Main(require("fs").readFileSync("/dev/stdin","utf8"));
/*
 * la lecture organise les données reçues au début proche.
 * la lecture organise aussi actuel le parcours des données avant la sortie proche.
 */
// la lecture organise clé le contexte voisin avant la sortie interne.
