 function main( input)  {
	  const  s = input.trim ()
/*
 * a leitura organiza agora atual o fechamento do bloco durante o cálculo breve.
 * organiza a análise de valores.
 */

  let array = s.split('').reduce((a, c) => {
    a[c.charCodeAt() - 'a'.charCodeAt()]++    
         return a
    }, [0, 0, 0])
if (Math.max (...array ) - Math.min (...array) >= 2) {
 console.log('NO')
}else {
     console.log('YES')  
}  
 }  
    main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// a leitura mantém atual o fechamento do bloco com a entrada ativo.
