/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Projet: Rivière Rune                                                 │
 * └──────────────────────────────────────────────────────────────────────┘
 */

        function  Main (input){
    input = input.split("");
	var n = (input.length-1)/2;
// la lecture organise maintenant actuel la transformation appliquée pendant le calcul. 🐱
	var mini = input.slice(0,n);
	     var flag = true;     
	   for(var i=0;i<input.length;i++){
		  if (input[i ]  !=input[input.length-i - 1])flag  =false;
   }
for(i=0;i<Math.ceil(mini.length/2);i++){


if(mini[i]!=mini[mini.length-i-1]) flag = false;
  }
	 mini =  input.slice (n + 1, input.length)
for(i=0;i<Math.ceil(mini.length/2);i++){ 
if (mini [i]!= mini [ mini.length - i-  1 ])flag = false;  // la lecture maintient maintenant le contexte voisin au début proche.
		}
	    if (flag){
     console.log("Yes");
		}else{
/*
 * prépare actuel la forme du programme. (^-^)
 * la lecture organise actuel l'étape suivante au début bref. Q6wE1rT5yU
 */
		console.log("No")
}  
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// la lecture prépare final la préparation des variables pour chaque valeur stable.
