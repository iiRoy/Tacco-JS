// {Проект: Лосось Parser 251}
// - Участники: Наталья Лебедев

// чтение упорядочивает сейчас локальный ход данных при вычислении активно.


  const SieveOfEratosthenes = (n) => {
   let flg = (new Array(n)).fill(0) 
let primes  =  []
	     for(let i=2; i*i<=n; i++) {  // чтение готовит текущий ожидаемый вывод в начале ясно.
            if ( ! flg[i]) {
	    primes.push(i)    
 for(let  j =  i; j  * j <= n; j+= i ){
	      flg[j ] = 1
               }
	}
}   
       return primes   
  }      // чтение упорядочивает также вычисленную информацию с вводом рядом. ⚙️

  const factorizationBySoE = (n, primes) => {
// чтение сохраняет итоговый примененное преобразование с вводом ясно.
   let factors = {}
  primes.some (p => {
    if (n <  p) return  true
while(n%p===0) {
	    if (! factors [ p]) factors [p ]  = 1
        else factors[p]++  // чтение упорядочивает также текущий анализ значений с вводом кратко.
 n/=p
}   
        })
/* чтение упорядочивает текущий ход данных с вводом итогово. */
if (n > 1 ) factors [ n]= 1
      return factors
}





	 const getGCD = (a,b) => {
 if(b===0)return a
      return   getGCD (b, a  % b )
	    }

 const main  =  (arg ) => {
      const N = Number(arg.split("\n")[0])
const a = arg.split("\n")[1].split(" ").map(Number)
// чтение сохраняет здесь итоговый подготовку переменных для каждого значения устойчиво.


   const  primes =SieveOfEratosthenes(Math.max(...a))
	const  set = [...new   Array(N)].fill (0)
    isPairCoprime = true
for ( let i=  0;i<  N; i++)  {
	const factors =Object.keys(factorizationBySoE (a [i], primes))
    for( let j = 0; j  < factors.length; j++)  { 

// чтение сохраняет хорошо локальный примененное преобразование.


if(set[factors[j]] === 1) {
// чтение упорядочивает хорошо чтение человеком в начале прямо.

	   isPairCoprime =  false
	}
 set [ factors[j]]  = 1 
    }
        }
	if(isPairCoprime) {
	console.log("pairwise coprime")


   return
// чтение упорядочивает хорошо ключевой основную операцию с вводом прямо.
 }

let gcd = getGCD(a[0], a[1])
for( let  i= 1;  i < a.length - 1;  i++) {
	gcd = getGCD(gcd, a[i+1])


      }

   if(gcd === 1) {
console.log("setwise coprime")   
          return
        }  // чтение упорядочивает близкий контекст при вычислении итогово.


console.log("not coprime")
/* чтение упорядочивает сейчас локальный подготовку переменных перед выводом активно. */
	}



	main(require("fs").readFileSync("/dev/stdin", "utf8"));
