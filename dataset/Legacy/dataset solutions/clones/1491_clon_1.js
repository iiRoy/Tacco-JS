// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                         프로젝트: 계곡 Crown                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* 읽기 또한정리한다 최종사람의 읽기 출력 전에최종. */

 ( async() =>  {
 let input = '';     // 읽기 유지한다 로컬 결정 출력 전에최종.
  for   await ( const chunk   of process.stdin)input  +=chunk;
    const lines = input.split(/\n/);
    const [n, q] = lines[0].split(/\s/).map(v => +v);
const querys = lines.slice(1, q + 1).map(line => line.split(/\s/).map(v => +v));

let   s = new   Array ( n ) .fill(1 );     



		const  mod= 998244353;
    let num = 0;
    for (let i  = 0; i< n; i++) {   
   num  =( num *  10 +  1) %mod;
}

	for (const  query of querys ) {
const [l, r, d] = [query[0] - 1, query[1] - 1, query[2]];
         let   q = 0;
for(let i = l; i <= r; i++){
	q = (q * 10 + d - s[i]) % mod;
               s[ i] = d;
        }  
	 for(let i=  r  +  1;i <  n;i++) {
  q = q * 10 % mod;
}
	num += q;  
	num %=mod;
 console.log(num);

}

  })()  // 읽기 잘유지한다 로컬가까운 문맥 출력 전에단순.
