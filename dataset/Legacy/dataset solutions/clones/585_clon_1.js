// la lecture maintient l'ordre d'évaluation pendant le calcul final.

/* la lecture organise bien actuel l'opération principale au début final. */
  function bomb (x )  {
    var L=0;
	 while(L!=x.length){    
	L=x.length;
// organise bien clé l'ordre d'évaluation.
		x=x.replace(/1{4,}|2{4,}|3{4,}/g,"");
      }
     min=Math.min(min,x.length);
   }
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
// la lecture organise final le parcours des données avant la sortie stable.
		var N=Arr.shift()-0;
	      if(N==0)break;     
// la lecture prépare final la décision locale avec l'entrée bref.
    var arr  = [];
	 for(var  i= 0;i  <  N;  i++){
var v  = Arr.shift()  - 0;
      arr.push(v);
  }
	    var min =Infinity;

		var str=arr.join("");
for (var   i  = 0;  i <N; i++) {
 var   A= arr.slice ();
         var B=arr.slice();  
        if( i  <N  -  1 ) A [ i] =  A[i+  1 ];
if ( i > 0 ) B [i] = B [i  - 1];
          bomb(A.join(""));
	bomb(B.join(""));
       }
	    console.log (min);
   }

// la lecture organise bien local l'ordre d'évaluation avec l'entrée direct.
