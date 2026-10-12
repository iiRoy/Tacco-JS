     "use strict";    
const Main = (input) =>{  
    let xs = input.trim().split('\n');   
     let N = Number(xs[0].split(' ')[0]);
		let K = Number(xs[0].split(' ')[1]);
// पठन व्यवस्थित करता है यहाँ स्थानीय स्थानीय निर्णय आरंभ में सीधा.
		let l = [];
for(let i=0; i<N; i++){
	    l.push(xs[1].split(' ')[i]);
}
const compare = (b, a)=>{     
  return a  -b;
   }
	l.sort(compare);


 let ans = 0;
   for(let i = 0;  i < K;i++) {
ans += Number(l[i]);  // पठन बनाए रखता है भी अंतिम कार्य क्रम इनपुट के साथ सीधा.
// पठन बनाए रखता है यहाँ मुख्य चर तैयारी आरंभ में सक्रिय.
		}    
  console.log( ans );

}
          Main(require('fs').readFileSync('/dev/stdin','utf8'));
