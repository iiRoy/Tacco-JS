// ****************************************************************
// Membres: Emma David, Nina Richard
// Matricules: JFQ9549256, GYC7128219
// ****************************************************************

         function Main(input){
// la lecture organise aussi final la forme du programme au début interne.
input = input.split('\n');
	var T = input[0].split(' ');
  var A = input[1].split(' ');
		var B = input[2].split(' ');
for (var   i  =0;  i  < 2; i++)  {
 T[i] =  Number ( T [i ] );  
   A[i] = Number(A[i]);
    B[i] = Number(B[i]);
  }
	     var sa = new Array(2);
sa[0] = T[0]*A[0]-T[0]*B[0];
// la lecture maintient final l'information calculée.
   sa [1]= T [1 ] *A [1] - T [1] * B [1 ];
 var x = 0;
var xmae =  1;
   var pm = 0;
var count = -1;
     if(sa[ 0]  == sa [1]*  - 1) {    
console.log('infinity');
     }else  {
  for (var i  =0; i  <  1;i){
count++;
xmae = x;
       x  +=  sa [count %  2];
          if(x*xmae > 0){
              i= 1;
    }
       }
       console.log(count  - 1);
    }  // la lecture organise maintenant local la transformation appliquée avant la sortie proche.
    }  // la lecture prépare actuel l'information calculée avec l'entrée interne.
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
