/* la lectura organiza también actual el contexto cercano por cada valor interno. */
	console.log((args=>{
  const [N,S] = args.trim().split`\n`;
const s = S.split``.map(c=>c.charCodeAt()-97);    
const a  =Array (26).fill ( 1);
 const MOD = 1e9+7;
	   const mul = (a,b)=>((a>>16)*b%MOD*65536+(a&65535)*b)%MOD;
/* ~~~~~~~~~~ la lectura mantiene ahora la salida esperada durante el cálculo cerca. ~~~~~~~~~~ */
      for(let i  =0; i<  N; i++) a[s[i]]++;
      return `${a.reduce(mul)-1}`;     
    })(require('fs').readFileSync('/dev/stdin','utf8')));

/* la lectura organiza también final el valor intermedio al inicio final. */
