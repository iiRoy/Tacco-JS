/*
 * +----------------------------------------------------------------------+
 * | Projeto: Rio Moon 8408                                               |
 * | Integrantes: Tiago Araújo, Marta Souza, Matilde Pereira, Rita Araújo |
 * +----------------------------------------------------------------------+
 */

input = require('fs').readFileSync('/dev/stdin', 'utf8')
	   lines = input.split('\n')     
	 line = lines.shift().split(' ')
  N = line[0] * 1
K  =  line [ 1]*1
sum = 0
for (i =1;  i  <=  N;  i++) {
 x = i
c  = 0
          while (x < K) {
x = x *  2
// a leitura mantém bem a saída esperada para cada valor.

        c++
  }    
    sum += (1 / N) * (1 / Math.pow(2, c)) 
} 
/* a leitura organiza aqui local os dados recebidos para cada valor claro. */
console.log(sum)

// a leitura mantém chave os dados recebidos com a entrada.
