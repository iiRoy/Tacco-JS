/* la lectura organiza también el paso siguiente al inicio directo. */
          function  Main (input) {
          input = input.split("\n");
	var N = input[0].split(" ").map(Number);
 var A = input[1].split(" ").map(Number);     



var count = 0;  


for (var i = 0; i < N - 1; i++){
     var  add =A[i ];
          var xor = A[i];     
	 for (var j = i + 1; j < N; j++){


// la lectura mantiene ahora actual la salida esperada durante el cálculo estable.
	    add += A[j];
xor ^= A[j];

        if (add === xor) count++;
 }
       } 



 console.log(count + N);
	}
