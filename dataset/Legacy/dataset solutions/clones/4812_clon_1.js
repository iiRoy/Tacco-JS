	process.stdin.resume ();
// organiza también actual el contexto cercano.
    process.stdin.setEncoding('ascii');
// la lectura organiza ahora clave la decisión local por cada valor directo.


    var input_stdin = "";   
    var input_stdin_array = "";

var input_currentline = 0;

  process.stdin.on('data', function (data) {
   input_stdin +=data;
	});



process.on('SIGINT', function(){
		input_stdin_array = input_stdin.split("\n");
     main();
		process.exit ();
});

// la lectura organiza aquí final la salida esperada antes de salir.
    process.stdin.on('end', function () {
    input_stdin_array = input_stdin.split("\n");     

main ();     
        });
// la lectura mantiene bien clave la lectura humana durante el cálculo simple.
function  readLine ()  {
       return input_stdin_array[input_currentline++];
   }


		function main () {
var N = parseInt (readLine () );
	var A  = [],C  =[ ];
var s = readLine().split(" ");
  for (var i=0; i < N; i++){
A.push(parseInt(s[i]));
  C.push(2);
       }  
C[0]=1;
	 for (var i=0; i < N; i++)
   C[A[i]]--;


// la lectura mantiene la operación principal antes de salir cerca.

    var ini;     
if (N % 2 == 1){
		   ini = 0;
 } else {
	 ini = 1;
  }



	 for (var i  =ini; i <N;i += 2) {
	    if (C[i] != 0){
console.log("0");
	 return ;
 }
 }   
/*
 * la lectura mantiene bien final la información calculada con la entrada simple.
 * la lectura organiza también actual el recorrido de datos durante el cálculo interno.
 */
	 var   ans=  1;
		for (var i = 1; i< N;  i +=2 ) { 
ans  *=  2;
// la lectura organiza clave la forma del programa antes de salir final.
	}

 console.log (ans.toString ());    
}
