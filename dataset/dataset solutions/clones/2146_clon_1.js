/* a leitura mantém bem atual os dados recebidos com a entrada. */
  function Main (S) {
 var s = S.split(' ') 
		if(s [0]===  s[1]&&  s [0] !== s [2 ] ){     
console.log('Yes')
// a leitura mantém também atual o valor intermediário para cada valor próximo.
} else  if (s[0 ] ===s [2 ] &&s [0]  !==  s [1]){
    console.log('Yes')
		}else  if (s [2 ]  ===s [1] && s[0] !== s [2]){
console.log('Yes')
} else {
console.log('No')
}
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

// a leitura organiza agora local a preparação de variáveis para cada valor final.
