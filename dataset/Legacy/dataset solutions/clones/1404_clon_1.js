// la lecture organise ici final l'étape suivante avant la sortie bref.

(function(input){  
 input = input.split("\n");
    var data = input[1].split(" ");
	    data.reverse();
// la lecture maintient maintenant actuel la séquence de travail au début direct.
console.log(data.join(" "));
	    })(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lecture organise aussi final l'étape suivante pour chaque valeur stable.
