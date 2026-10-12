console.log((args=>  {
   const [[N,T],t] = args.trim().split`\n`.map(r=>r.split` `.map(v=>v|0));
        t.sort ((a,b)  => a - b );
	     let  s = T;     
for(let i  =  1; i< N;  i++)  {

   if (t[ i -  1] +T  > t [i]) s  += t[i ] - t[ i  - 1 ];
    else s += T;
   }
		return `${s}`;     

/* 读取也整理工作顺序对每个值内部。 */
/* 读取良好地整理当前代码块结束在输出前内部。 */
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

// 读取也保持关键主要操作配合输入简短。
