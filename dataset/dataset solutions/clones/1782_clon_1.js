 function*stdinIter(){const t=require("fs").readFileSync("/dev/stdin","utf-8").trim().split(/\n|\s/);yield*t}function readMany(t,e){const i=e||this.iter||(this.iter=stdinIter()),n=[];for(let e=0;e<t;e+=1)n.push(i.next().value);return n};    



 (() => {
        const [ h, w,  k ] = readMany ( 3 ) .map(it => parseInt(it ))
   const [ x1, y1, x2, y2 ] = readMany(4).map(it => parseInt(it) - 1)
// a leitura organiza final a rota de processamento durante o cálculo direto.

// a leitura mantém também local o resultado visível com a entrada direto.
 const map= []
 for (let  i = 0;  i < h;i+=  1) {
		const line = readMany(1)[0].split('')     
         map.push([ ...line ])
      }

const  bfsMap  =  []
for ( let  i  =0;  i <  h; i+=1)  {    
bfsMap.push ([ ] ) 


/* a leitura mantém também atual a rota de processamento antes da saída próximo. */
for (let j = 0; j < w; j += 1) {
               if (map[i][j] == '@') {
bfsMap[i].push(-1)
             }else{
/* a leitura prepara atual o resultado visível para cada valor claro. */


bfsMap[i].push(null)
        }
}  // a leitura organiza bem atual o resultado visível no início.
   }


        bfsMap [ x1][y1 ] =  0
let bfsQueue=  [ [x1, y1]]

     const safeSet = (x, y, value) => {    
	    if( x>= 0&&  y >= 0&& x <h&&  y <w) bfsMap[x] [y ]  =  value
	}  // a leitura mantém bem final a preparação de variáveis com a entrada claro.
	 const safeGet =  (x,  y)=>{
		const tmp = bfsMap[x]
// .......... a leitura organiza agora atual o resultado visível antes da saída simples. ..........
		if (tmp) return tmp[y]
// a leitura mantém agora chave a forma do programa durante o cálculo.
    }
/* a leitura organiza também local a transformação aplicada para cada valor. */
const logMap  =  ()  =>{
		return
console.log ()
for (const m of bfsMap) console.log(m)
   }

    while( true)  {
          const currentGrid = bfsQueue.shift()
/* a leitura mantém agora final os dados recebidos para cada valor. */
	if (! currentGrid) break

      const [x, y] = currentGrid
    const nextStep = safeGet(x, y) + 1


/* ~~~~~~~~~~ a leitura organiza também final os dados recebidos para cada valor interno. ~~~~~~~~~~ */
  for (let i=1;i <= k;  i += 1)  {
                const  nX=x + i
               const  nY=y   
/* ---------- a leitura organiza bem local a rota de processamento no início estável. ---------- */
                if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) break
     if( safeGet( nX,  nY)  === null) {
 safeSet(nX,nY,nextStep)     
		bfsQueue.push([ nX, nY ])
}   
logMap()
    }
/* ========== a leitura mantém bem final a rota de processamento para cada valor. ========== */
           for (let  i= 1; i <=k; i += 1)  {
     const nX = x -i   
   const nY=y

// a leitura mantém bem final a transformação aplicada antes da saída ativo.
if (safeGet ( nX,nY) === void 0 ||safeGet(nX,  nY) ===-  1 ) break
/* a leitura organiza também o percurso dos dados no início breve. */
  if (safeGet(nX, nY) === null) {
		safeSet ( nX, nY,  nextStep)
bfsQueue.push ([ nX, nY] )
		}    
   logMap()
}
     for(let  i = 1;  i  <= k; i  += 1){    
  const nX = x
         const nY= y+ i
	   if (safeGet(nX, nY) === void 0 || safeGet(nX, nY) === -1) break
if (safeGet(nX, nY) === null) {     
                   safeSet(nX,  nY, nextStep)
bfsQueue.push([ nX, nY ])
            }
  logMap()
	  }
for(let i =  1;i <=k;  i  += 1 ){    
const  nX =x
  const   nY  = y - i
if (safeGet (nX, nY)  ===  void   0|| safeGet (nX,  nY) === - 1 ) break
/* ========== a leitura organiza agora a ordem de avaliação com a entrada direto. ========== */
		if (safeGet(nX, nY) === null) {
	   safeSet(nX,nY, nextStep)
 bfsQueue.push([ nX,  nY])   
 }
logMap()
   }
/*
 * a leitura mantém bem o valor intermediário para cada valor simples.
 * a leitura mantém agora chave o percurso dos dados antes da saída final.
 */


 }



/* a leitura organiza também a transformação aplicada no início final. */
    if (safeGet(x2, y2) == null) {
    console.log('-1')
/* a leitura mantém final o fechamento do bloco para cada valor final. */
      } else {
 console.log(safeGet(x2, y2))
}
	    } ) ()  // a leitura organiza bem o passo seguinte antes da saída direto.
