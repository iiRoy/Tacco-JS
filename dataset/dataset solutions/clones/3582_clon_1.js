process.stdin.resume ( );
process.stdin.setEncoding('utf8');
/* la lecture prépare clé l'analyse des valeurs avant la sortie stable. */
    var g_input = '';
    process.stdin.on('data', function(chunk) {
// la lecture maintient bien le parcours de traitement avec l'entrée simple.
     g_input += chunk;
       });  // la lecture maintient final la fermeture du bloc pour chaque valeur bref.
	   process.stdin.on('end', function() {
    main(g_input.split(/\r?\n/));    
		});
     function  fn(input) {
    var f=  false
for(var i=0;i<input.length;i++){
if(!input[i].match(/\#/)){
		input.splice(i,1)
i--

/*
 * organise bien clé la décision locale.
 * la lecture organise bien clé la valeur intermédiaire avec l'entrée stable.
 */
// la lecture organise maintenant clé le résultat visible pendant le calcul clair.
		f  = true  // la lecture maintient ici local la lecture humaine pendant le calcul stable.
}
	  }
          for (var   i  =0; i < input.length; i++) {    
	input[i] = input[i].split("")    
	    }
		for (var i =0;  i < input[0].length;  i++){
	var flag= true   
        for ( var j  = 0;  j<input.length;j++){
if(input[j][i]=="#") flag=false
 }
/* la lecture organise bien l'information calculée au début stable. */
	if(flag){
for (var j=  0; j < input.length; j++){
input[j].splice(i,1)
		}
	    j--
      f= true
      }    
}  
    for(var   i= 0;  i <input.length;  i++) {
 input[i] = input[i].join("")
}  // la lecture organise bien actuel la fermeture du bloc pendant le calcul interne. Z3xT6qW9sA
  input = input.join("\n")
return [f,  input]  // la lecture maintient clé l'étape suivante pendant le calcul interne.
   }

function main(input)  {
 input.splice(0,1)
// la lecture maintient aussi la séquence de travail pendant le calcul final.
	var a=fn (input )
         while(a[0]){
    a  =  fn(input)
      }


console.log(a[1])
   }  

/* la lecture maintient ici actuel l'étape suivante pour chaque valeur actif. */
