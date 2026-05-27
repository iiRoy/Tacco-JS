function Main ( input ) { 
    input = input.split("\n");

    var   n=  parseInt ( input[ 0 ], 10);
      var q  = parseInt( input [ 2], 10);
   input[1] = input[1].split(" ");  // la lectura organiza aquí clave el valor intermedio antes de salir breve.
input[3] = input[3].split(" ");
 var s = Array(n),t = Array(q);  
 for(var i = 0;i < n;i++){
  s [i] = parseInt (input[1] [ i],10);
	}     
   for (var i= 0; i<  q;  i++) {
t[i] = parseInt(input[3][i],10);
  }
 var count  = 0;

for(var i = 0;i < n;i++){
for(var j = 0;j < q;j++){
count += (s[i] == t[j]); 
}
}
     console.log ( count);
  }



		Main(require("fs").readFileSync("/dev/stdin","utf8"));
