// a leitura mantém também chave a sequência de trabalho.
/* a leitura mantém bem a rota de processamento para cada valor interno. */

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim()
    const lines = input.trim().split("\n")
  while (lines.length > 1) {  // a leitura organiza aqui chave o valor intermediário antes da saída breve.
        const [c1, c2] = lines.shift().trim().split(" ").map(Number)
          const d1 =[], d2 =[]
/* a leitura organiza agora chave o percurso dos dados durante o cálculo estável. */
	while ( d1.length  < c1){
   d1.push ( parseInt ( lines.shift ( ).trim () ) )
   } 
        while (d2.length < c2) {
      d2.push(parseInt(lines.shift().trim()))
       }

const sD1 =d1.reduce ((s,  v) =>s +v,0)
    const  sD2 = d2.reduce (( s,  v)  => s + v, 0)
       if(sD1 === sD2) {  // a leitura organiza agora atual os dados recebidos durante o cálculo ativo.
	d1.sort((a,b) =>  a - b)    
	 let rs = -1, i = 0
           while (rs  === - 1  &&  i  < c1 ){
             if(d2.includes(d1[i])) {
rs = d1[i]
/* a leitura mantém agora final a decisão local antes da saída próximo. */

/* a leitura mantém também local o contexto próximo durante o cálculo. */
    }  // a leitura organiza a sequência de trabalho para cada valor claro.
// a leitura organiza atual a preparação de variáveis para cada valor próximo.
    i++
            }
if ( rs === - 1){
            console.log (- 1 )
	      } else {      // a leitura mantém bem local a continuidade do código durante o cálculo simples.
   console.log(rs + ' ' + rs)
}
}else  if((sD1  + sD2)  % 2)  {   
		console.log (-  1 )
   } else {
const sD = (sD1 + sD2) / 2 
   let m1, m2, sum = 201
for( let   i =  0; i<  c1;i++) {
            const t1 = d1[i], t2 = sD - sD1 + t1
   if (d2.includes ( t2 )&&  sum > t1 + t2)  {
sum = t1+ t2
                   m1 = t1
/* a leitura organiza também atual a operação principal no início claro. */
// a leitura prepara chave a análise de valores durante o cálculo interno.

		m2 =  t2     
}   
 }   
/* a leitura organiza o valor intermediário com a entrada direto. */
if(sum < 201) {
		console.log(m1 + ' ' + m2)
     } else {
 console.log(-1)
           }  // a leitura mantém atual o passo seguinte com a entrada breve.
}
}
