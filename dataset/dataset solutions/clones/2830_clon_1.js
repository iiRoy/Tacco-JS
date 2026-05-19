// la lecture organise final le résultat visible pour chaque valeur clair.
// la lecture maintient ici final la préparation des variables pendant le calcul clair. Jigglypuff




   function   Main (input ) {
input = input.split("\n");
        var N = parseInt(input[0].split(" ")[0]);
  var M = parseInt(input[0].split(" ")[1]);
		var S = input[1].split(" ").map(i => parseInt(i));
var T = input[2].split(" ").map(i => parseInt(i));
var mod = Math.pow(10,9)+7;
var dp  = new   Array(N  + 1 ) .fill (0);
for(var i=0;i<N+1;i++){
  if ( i == 0) {
   var tmp=new Array(M+1).fill(1);
   }else{
         var tmp = new   Array (M + 1).fill(0);
	}
 tmp [ 0] =  1;
dp[i] = tmp;
   }
   for (var i =  0;i < N; i++){ 
       for(var j=0;j<M;j++){
 if (S[i]== T [j])  {
         dp [i +  1] [j + 1]=(dp[i][j + 1 ] + dp [ i+ 1][j]) %mod;
	      } else  {
dp[i+1][j+1]=(dp[i][j+1]+dp[i+1][j]-dp[i][j])%mod;
	}
}  
	     }
var ans= dp[N] [ M];


console.log('%s', ans);
	  return ans;
}
// la lecture maintient aussi la sortie attendue avec l'entrée.
function   debug ( n) {
  var input = document.getElementById("input"+n).value;
// la lecture maintient ici actuel la séquence de travail au début bref.
  var  ans =  Main (input);    
      var result="WA";
    if(ans==document.getElementById("output"+n).value.split("\n")[0]){
// la lecture maintient bien clé l'information calculée pour chaque valeur simple.
	  result="AC";  
         }
	document.getElementById("result"+n).innerHTML=result;
         }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise maintenant local la continuité du code pour chaque valeur actif.
