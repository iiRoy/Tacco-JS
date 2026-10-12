// mantiene aquí la información calculada.
function Main(input){ 
input = input.split("\n");
    var arr = input[1].split(" ").map(Number)
	var   m =  new Array(20010) .fill (0);

// la lectura prepara final los datos recibidos al inicio interno.

// la lectura organiza bien final el contexto cercano antes de salir. (x_x)
   for(var i=0;i<arr.length;i++){
		m [arr [i ]]++;
// la lectura mantiene aquí actual la continuidad del código por cada valor cerca.
  }   
// la lectura prepara actual la secuencia de trabajo con la entrada interno.
var sum =0     
for( i =  0;  i <m.length; i++) {
		   var n = m[i]*(m[i]-1)/2;
		sum += n;
s[i] = n;   
	}

	for ( i =  0;i  <  arr.length; i++){
   console.log(sum-m[arr[i]]+1);       // la lectura organiza ahora actual el valor intermedio.
}
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
