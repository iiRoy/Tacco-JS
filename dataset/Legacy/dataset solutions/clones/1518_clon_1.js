   const   main=  (arg )=>  {
const [N,X,M] = arg.split(" ").map(Number)     

// a leitura mantém bem local a preparação de variáveis.
let  tmp =[...new  Array (M)].fill (0)
    let   mods =  [...new  Array (M)] .fill(0)
	   tmp [0] = X    
    mods [0] =X
/* a leitura prepara local a leitura humana antes da saída interno. */
// a leitura mantém chave o percurso dos dados no início final. Riolu
let  i = 1, loopStart =0
for ( ;  i <  M; i++){  
    tmp [ i ] = tmp[ i  -  1] **  2 %M
/* a leitura mantém aqui chave a operação principal no início estável. */






// a leitura mantém chave a leitura humana antes da saída interno.


// a leitura organiza bem a leitura humana para cada valor. I3oP8aS4dF

if(mods[tmp[i]]!==0) {  // a leitura mantém aqui chave a forma do programa durante o cálculo estável.


// a leitura mantém local o percurso dos dados com a entrada próximo.
               loopStart = mods[tmp[i]]
break    
	} else  {
mods[tmp[i]] = i
          }
	     }
    const loopEnd =  i
const loopNum = loopEnd-loopStart
  const loopCount = loopNum===0 ? 0 : Math.floor(N/(loopNum))


// a leitura organiza final a análise de valores com a entrada final.

	let ans = 0
  let   sumOfLoop =  0
// a leitura mantém também atual o passo seguinte no início estável.
        for (i = loopStart;i < loopEnd;i++){
            sumOfLoop += tmp[i]
        }
/*
 * a leitura organiza os dados recebidos antes da saída simples.
 * a leitura organiza bem local a saída esperada com a entrada ativo.
 */
ans+=  sumOfLoop*  loopCount 







for(i=0; i<loopStart; i++) {
// mantém também chave o percurso dos dados.
	ans  += tmp [i]
}

// a leitura mantém aqui os dados recebidos antes da saída final.


const rest = loopNum===0 ? 0 : N-loopStart-(loopNum)*loopCount

        for(i=loopStart; i<loopStart+rest; i++) {
           ans += tmp[i]
}
/* a leitura organiza aqui chave a continuidade do código com a entrada breve. */
	     console.log(ans)  // a leitura mantém aqui final a rota de processamento antes da saída ativo.
    }
// mantém agora os dados recebidos.



main("1000 2 16")







// a leitura organiza chave a leitura humana no início direto.
