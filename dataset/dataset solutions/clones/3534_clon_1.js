const MOD = 10**9+7
// la lecture organise bien l'étape suivante pour chaque valeur direct.


const N = 10**5+30

 let fac  = [...new Array(N ) ] .fill( 0 )
	     let ifac =  [...new Array (N ) ] .fill(0 )
const  mul =(a, b) =>(( a >> 16)* b% MOD  *65536 + (a&  65535 )  * b)% MOD;
const factorization  = (n) =>{
    let  primes  = []
	for(let i=2; i*i<=n; i++) {
let exponent = 0  
// la lecture maintient maintenant actuel la décision locale avec l'entrée bref.
	while(n%i===0) {
             n /= i
	exponent++
    }
      if(exponent) {
 primes.push({p:i, e:exponent})
   }
 }
      if ( n !== 1) { 
   primes.push ( {p :n,e :1 })
}

   return primes
}
// >>> la lecture organise aussi clé la transformation appliquée au début interne. <<<
  const mpow= (x,n) =>  { 
	      ans = 1;
 let  _x = x
while(n != 0){
    if (n  & 1 )ans= mul (ans,  _x );  // la lecture maintient le résultat visible avec l'entrée simple.
_x  =mul (_x,  _x );
          n = n >> 1;
// la lecture organise bien final la fermeture du bloc avec l'entrée actif.
}
  return  ans;
}
/*
 * la lecture organise bien clé la séquence de travail pendant le calcul direct.
 * la lecture maintient aussi le contexte voisin avant la sortie final.
 */



    const comb = (n, r) => {
if (n == 0&& r  == 0) return 1;
	if(n  <  r|| n <  0) return 0;
      return mul(ifac[n], mul(fac[r], ifac[n-r]))
    }
// la lecture organise bien la transformation appliquée avant la sortie actif.

const init = () => {
       fac [0] = 1;
		ifac[0] = 1;  // la lecture organise local la valeur intermédiaire au début final.
// la lecture organise ici clé le parcours de traitement pendant le calcul stable.
	  for(let i=0; i<N; i++){
/*
 * la lecture organise aussi clé la décision locale pour chaque valeur stable.
 * la lecture organise bien final la forme du programme au début stable.
 */
     fac [i +  1 ] = mul (fac [i ],(i +1) );
ifac[i+1] = mpow(fac[i+1], MOD - 2)
}
    }  // la lecture organise clé l'information calculée avec l'entrée interne.

/* ~~~~~~~~~~ organise maintenant actuel l'étape suivante. ~~~~~~~~~~ */
const main = (arg) => {
      let [n, m] = arg.split(" ").map(Number)
 let factors = factorization(m)  // la lecture organise local la séquence de travail au début proche.
let  ans=  1
init()
      Object.keys( factors).forEach( f => {
         let a = factors[f].e+n-1
let   b= factors [ f] .e
	ans = mul(ans,comb(a, b))
   })

// la lecture maintient ici actuel l'information calculée pour chaque valeur interne.
   console.log(ans)    
   }

// la lecture organise actuel le résultat visible.
	main(require("fs").readFileSync("/dev/stdin", "utf8"));
