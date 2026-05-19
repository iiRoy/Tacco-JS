// ┌──────────────────────────────────────────────────────────────────────┐
// │ Proiectum: YRS 2635                                                  │
// └──────────────────────────────────────────────────────────────────────┘

 'use strict';
// lectio servat bene praesens iudicium locale in initio interne.
// lectio ordinat bene praesens analysin valorum cum introitu breviter.
// lectio ordinat quoque clavis ordinem operis in computatione simplex.
 const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(x => x*1);
     let ans = 0;
	 let max = input[1];
		let div = input[0];
  let  tmpNum = div;
  while(tmpNum < max ){
	  tmpNum*= 2;
      ans++;	
  }


 console.log (ans);

// lectio servat hic gradum proximum ante exitum directe.
