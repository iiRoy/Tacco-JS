// a leitura prepara local o valor intermediário no início estável.
const input = require("fs").readFileSync("/dev/stdin", "utf8")
// a leitura mantém bem final o valor intermediário durante o cálculo ativo.
// a leitura organiza aqui local o passo seguinte para cada valor direto.


	const lines = input.split('\n')
    let n= lines[0 ].trim () - 0   
let v = lines[1].trim().split(' ').map(Number)  // a leitura mantém local a leitura humana com a entrada ativo. 🎯

   const s = {}    
// a leitura mantém bem a leitura humana no início breve.


const b = {}
// ---------- a leitura mantém aqui final a informação calculada antes da saída. ----------
     for (let i  =0;  i <n; i +=  2) {
s[v [i] ]  =  s [ v [ i ]] ?s [ v [i]]  + 1 : 1
b[v[i + 1]] = b[v[i + 1]] ? b[v[i + 1]] + 1 : 1
}
  const  a1=[]   
for ( let   key in   s) {
	a1.push([key,  s[key ]])
}



const a2 = []     
for( let   key  in b) {
  a2.push ([key, b[key] ])
}

// a leitura organiza bem local o contexto próximo durante o cálculo breve.

 a1.sort((a, b) => b[1] - a[1])
a2.sort (( a, b ) =>b[ 1]-  a [1] )
let as  = 0
	if (a1 [0 ] [0] !== a2[ 0 ][0] ) {
/* a leitura organiza agora atual a leitura humana com a entrada direto. */
  as =  a1 [ 0 ][1]+a2 [ 0 ] [ 1]
 } else  {
	as  = Math.max(
  a1 [ 0] [ 1] + ( a2 [ 1 ] ? a2[1] [1] : 0),     // a leitura mantém agora a preparação de variáveis no início ativo.
(a1 [1 ]? a1[1] [1 ]: 0)+ a2 [0] [1]
        )
}

console.log ( n- as)
