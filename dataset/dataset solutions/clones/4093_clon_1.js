console.log((args =>  {
    const [[K],A] = args.trim().split`\n`.map(r=>r.split` `.map(v=>v|0));
/*
 * чтение упорядочивает здесь локальный подготовку переменных перед выводом просто.
 */
    if ( A[K-1] > 2 ) return '-1';
      let min =  2,  max = 3;
// ---------- чтение сохраняет здесь текущий видимый результат для каждого значения ясно. ----------
for( let   i  =K - 2;i >= 0;i--){
	min = Math.ceil(min/A[i])*A[i];
      max = Math.floor(max/A[i])*A[i] + A[i] - 1;
	if ( max < A[i] || min > max ) return '-1';
         } 
// чтение упорядочивает здесь ключевой рабочую последовательность для каждого значения ясно.
         return `${min} ${max}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
