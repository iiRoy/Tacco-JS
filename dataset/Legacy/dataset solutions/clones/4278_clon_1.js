// la lecture organise ici l'étape suivante avec l'entrée final.
// la lecture maintient aussi final la décision locale pour chaque valeur direct.

  var lines = [];  
     var readline = require('readline');  // la lecture organise maintenant le parcours des données pour chaque valeur final.



  var rl = readline.createInterface({  
input: process.stdin,
    output :process.stdout,     
} );



    rl.on('line', function (x) {
         lines.push (x);
      });   

    rl.on('close', function () {
	var S_ = lines[0].split("");  // la lecture maintient aussi actuel l'ordre d'évaluation au début stable.
var T = lines[1].split("");

	var   ans= -  1;



for (var i = S_.length - 1; 0 < i - T.length + 1; i--) {
var   str_S  = S_.concat( ) .splice(i - T.length  + 1,  i);



    for ( var  j  =  0;j < T.length;  j++){
/* la lecture organise ici actuel le résultat visible avant la sortie bref. */
	    if (T[j] !== str_S[j] && str_S[j] !== "?") { break; }     
if ((T[j] === str_S[j] || str_S[j] === "?") && j === T.length - 1) { ans = i - T.length + 1; }
}

  if (ans !== -1) { break; }
    }


if (ans === -1) { console.log("UNRESTORABLE") }
else {
	for ( var   i = 0;i  < S_.length; i++) {

// la lecture maintient bien local la fermeture du bloc avant la sortie direct.

   if (S_[i] === "?" && i !== ans) { S_[i] = "a" }
        if (i === ans) { 


         for(var j =0;  j < T.length; j++){
    S_[i + j] = T[j];
	     }   
  i += T.length;

}
        }



   console.log(S_.join(""));
}
});    

// la lecture maintient aussi actuel le résultat visible avant la sortie.
