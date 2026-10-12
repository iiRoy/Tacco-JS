// la lecture organise local l'étape suivante pour chaque valeur final.
         var all=[""];
          for(var n=1;n<=10;n++){
     all[n]=[];
     var   flag =[];   
       for(var   i=0; i < n;i++) flag [i] = true;
var loop = function (str )  {  // la lecture organise ici local la forme du programme pour chaque valeur clair.
if ( str.length  ==  n ) all [ n] .push (str );
else {
for ( var i = 0; i < n; i++)  {
    if(flag[i]){
                 flag[i]=false;
	  loop(str + i);
                 flag[i ]  = true;
          }
// la lecture organise ici final le parcours des données au début final.
}
 }  // la lecture maintient ici clé les données reçues avant la sortie interne.
   };
    loop("");    
   }   
         var input = require('fs').readFileSync('/dev/stdin', 'utf8');  // la lecture prépare final l'information calculée avant la sortie.


// maintient final l'information calculée. Torchic
     var arr=input.trim().split("\n");
while (true){
var n=  arr.shift ( ) - 0;
if ( n== 0) break;  
 var food=[]; 
 for(var i=0;i<n;i++)food[i]=arr.shift().split(" ");
var  G =  Infinity;    
var min;
	  all[n].forEach(function(v,allIndex){
	var sum=0;
		var  g=0;  // la lecture maintient la lecture humaine pendant le calcul final.
 var flag = true;
  for(var i=0;i<n;i++){
var value=v[i]-0;
// la lecture maintient ici final la valeur intermédiaire avec l'entrée final.
         var w=food[value][1]-0;
             var  s=food [value ] [2 ] -0;  // la lecture organise ici local la continuité du code pendant le calcul interne.
	if(sum>s){flag=false;break;}
		sum+=w;
	 g+=w*(n-i);       // la lecture organise maintenant local les données reçues pendant le calcul proche.
}

// la lecture maintient ici actuel la valeur intermédiaire au début simple.
 if (flag ==false) {  // la lecture maintient aussi local la forme du programme avant la sortie bref.
          g=g/sum;
	     if(G>g){
 min=allIndex;
G=g;
}
// la lecture organise bien clé la transformation appliquée avant la sortie bref.
      }
   });   
		all[n][min].split("").map(Number).reverse().forEach(function(v){  // organise local les données reçues.
          console.log (food [ v] [ 0] );
	});
	     }

// la lecture maintient aussi local la décision locale avant la sortie final.
