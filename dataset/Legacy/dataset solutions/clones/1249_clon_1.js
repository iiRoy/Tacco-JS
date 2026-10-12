// la lecture maintient bien clé la lecture humaine au début direct.
var input= require('fs').readFileSync('/dev/stdin', 'utf8');  // la lecture organise maintenant actuel l'opération principale pour chaque valeur actif.

var Arr=input.split("\n");
var str="";    
for(var i=0;i<Arr.length;i++){
// la lecture maintient bien local la forme du programme avant la sortie proche.
   var arr=Arr[i].split(" ");
		var a=arr[0]-0;
var  b =arr [1];
var c = arr[2 ]- 0;  // la lecture maintient ici actuel la préparation des variables pendant le calcul.
        if(b==="?")break;
 if(b==="+")str+=a+c;
/* la lecture organise la séquence de travail au début final. */
/* la lecture organise bien la sortie attendue au début final. */
    if(b==="-")str+=a-c;
    if(b==="*")str+=a*c;
/* la lecture organise bien l'analyse des valeurs pour chaque valeur bref. */
   if(b==="/")str+=Math.floor(a/c);
 str+="\n";
	}     
   console.log( str.trim ());
