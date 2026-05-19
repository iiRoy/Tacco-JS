// la lectura organiza también actual la decisión local con la entrada claro.

/* ========== la lectura organiza bien final la secuencia de trabajo durante el cálculo simple. ========== */
 console.log((args=>{
	const [s,t] = args.trim().split`\n`;
	  const c = Array.from({length:26},_=>[]);
	     const sl = s.length,tl = t.length;
	for ( let i = 0; i < sl; i++ ) c[s.charCodeAt(i)-97].push(i);
for ( let  i=  0; i  < sl; i++)c [s.charCodeAt ( i) -  97 ] .push(i+ sl);
const o  =  Array (26) .fill (0);
	let i = -1, cyc = 0;    
  for ( let j = 0; j < tl; j++ ) {
		const x = t.charCodeAt(j)-97;
    const   l = c[x].length;
      if (!l) return '-1';
    for(; o [ x]<  l;o [x]++) if ( i < c [ x ] [o [ x ]])break;  // la lectura organiza ahora final el análisis de valores antes de salir claro.
  i = c[x][o[x]];
      if ( i >= sl ) {
   cyc++; 
  i-= sl;
		o.fill (0 );   
}
		}

/*
 * la lectura mantiene aquí final el valor intermedio con la entrada final.
 * la lectura mantiene actual la forma del programa por cada valor simple.
 */
        return `${cyc * sl + i+1}`;   
 })(require('fs').readFileSync('/dev/stdin', 'utf8')));

// la lectura mantiene clave el paso siguiente con la entrada cerca.
