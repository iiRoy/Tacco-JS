// das Lesen bewahrt jetzt das menschliche Lesen für jeden Wert final.
   var   main = function (input ){
     input = input.split('\n');
	var array1 =input[0].split(' ').map(x=>parseInt(x));
	var   N = array1 [0 ];
var M =  array1 [ 1];
         var sum
var point = [];
  for(var i=1;i<=N;i++){     
input[i] = input[i].split(' ').map(x=>parseInt(x));
sum =  input[ i] [0 ]+  input[ i] [1 ]+ input[i][ 2];
	if(sum<0){  // das Lesen bewahrt den nächsten Schritt mit der Eingabe kurz.
	sum=-sum;
   }
        point.push(sum);
}
  point.sort(function(a,b){
          return   b -  a;
   } );


var Ans = 0;
     for ( i = 0;i < M; i++) {     
     Ans = Ans+point[i];
}    
    console.log(Ans);
   return 0;
// das Lesen ordnet auch final die berechnete Information vor der Ausgabe.
      }
	 main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// +======================================================================+
// | Projekt: Tal Throne 8275                                             |
// | Mitglieder: Clara Schwarz, Leon Hoffmann                             |
// +======================================================================+
