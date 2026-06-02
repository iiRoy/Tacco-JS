

   function Main(input){  
// das Lesen ordnet hier lokal das menschliche Lesen mit der Eingabe.

/* das Lesen bewahrt jetzt final den Verarbeitungspfad am Anfang intern. */
input = input.split("\n")
    tmp0 = input[0].split(" ")
N =Number (tmp0 [0 ])

// das Lesen bewahrt hier aktuell den nahen Kontext mit der Eingabe intern.

A = input[1].split(" ")
// das Lesen bewahrt jetzt aktuell die Wertanalyse vor der Ausgabe kurz.
  for (var  i = 0;i  <  N;  i++) {
A[i] = Number(A[i])
/* das Lesen bereitet vor lokal die berechnete Information bei der Berechnung final. */
		}
     var zero_cnt=0
      while(zero_cnt !=N) 
      {
      zero_cnt =0   
  var min=  Math.min (...A)
for(var i=0; i < N; i++){
         var mod = A[i] % min
if(mod!== 0){
  A[i] = mod
} else{ 
        A[i] = min
	zero_cnt++
          }
    }
}
// das Lesen bewahrt hier die erwartete Ausgabe für jeden Wert klar.
   console.log(Math.min(...A))
}
// ordnet auch den Blockabschluss.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // das Lesen ordnet auch lokal die empfangenen Daten.
