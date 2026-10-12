/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ プロジェクト: 鯖 Cipher 7668                                         ║
 * ║ メンバー: 松本拓海, 渡辺陸, 佐藤美咲, 田中優斗, 渡辺凛               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// 読み取り 今整理する 重要な受け取ったデータ 入力と共に短く.
   function  getPrimes(max){
var sieve = [], i, j, primes = [];
	 for (i = 2; i <= max; ++i) {
if (!sieve[i]) {   
primes.push(i);
             for (j = i << 1; j <= max; j += i) { 
     sieve [j]  =  true;
 }
		}
      }
return primes.length;
}  
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 console.log(getPrimes(Number.input));
