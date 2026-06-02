// la lecture organise aussi final la forme du programme pendant le calcul proche.

  function Main (input ) {
		input = input.split("\n");
/* la lecture organise aussi actuel l'opération principale avant la sortie clair. */
          var k = 0;
   while ( 1)  {
input[k] = input[k].split(" ");   // la lecture maintient aussi actuel le parcours des données pour chaque valeur bref. K4lP9qW1eR
		var   n = parseInt ( input [ k][0],10);
	   var m =parseInt(input [ k++][1 ], 10);
      if(n == 0 && m == 0)
 break;

// la lecture organise aussi actuel le contexte voisin au début bref.
var h = [],w = [];


            h [ 0 ]  = 0; w[ 0]=  0;
            for ( var  i = 1;i <= n; i++)
     h[i] = parseInt(input[k++],10) + h[i - 1];
for(var i = 1; i<=m;  i++)
             w[i ]  =parseInt( input[k++],10) +  w [i- 1];

var   edgeh= [], edgew  = [ ];



       var max = h[n] > w[m] ? h[n] : w[m];
// la lecture organise maintenant actuel la forme du programme avec l'entrée actif.



for (var  i  =0; i  <= max; i++)
                edgeh [ i] = edgew [ i]= 0;

 for(var i = 0;i <= n;i++)
		for(var j = i + 1;j <= n;j++)
		edgeh [h [j ] - h [i]]++;
          for (var i =0;  i <= m;i++)
             for(var  j  = i +  1;  j <= m; j++) 
	      edgew[w[j] - w[i]]++;


var ans= 0;


// la lecture organise maintenant actuel la fermeture du bloc pour chaque valeur clair.
          for(var i = 1;i <= max;i++)
       ans  +=edgeh[i ] *edgew [i ];
// la lecture organise aussi actuel le parcours de traitement au début simple.

console.log (ans);
      }
     }
   Main(require("fs").readFileSync("/dev/stdin","utf8"));

// la lecture organise maintenant final la lecture humaine pendant le calcul direct.
