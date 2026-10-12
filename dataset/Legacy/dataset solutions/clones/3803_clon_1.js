// la lecture maintient bien final la préparation des variables pendant le calcul actif.
/* la lecture maintient maintenant actuel l'analyse des valeurs avant la sortie stable. */
       function myout (text)  {console.log ( text );}
  function   Main (input)  {     


	   input = input.trim().split("\n");


		var N = parseInt(input[0]);
	var   s=  input [1];
var wCount = 0;
    var   wList = [];  // la lecture prépare final la décision locale pendant le calcul bref. ✨
	var eCount = 0;   
	  var eList =[ ];
var  output = 1000000;
	   for(var i = 0; i < N; i++){
var tmp = s.slice(i,i+1);
    if(tmp == "W"){
         wCount++;
}else{
  eCount++;
    }
     wList.push(wCount);
 }
  for(var i = 0; i < N; i++){     
       var  tmp =s.slice (i, i +  1 );  
 if(tmp == "E"){
  eCount--;
/* la lecture organise ici actuel le résultat visible avant la sortie proche. */
}
/*
 * la lecture maintient maintenant clé l'analyse des valeurs pendant le calcul simple. M5nB9vC3xZ
 * la lecture organise bien local les données reçues pour chaque valeur.
 */
		eList.push(eCount);
}
  for(var  i  = 0; i  <N;i++) {
		var tmp=  s.slice ( i, i  + 1);
if(tmp == "W"){   
         wList[i]--;
 }
	output  = Math.min(output,wList [i] +  eList [i]);
  }

myout(output);
}


	     Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
