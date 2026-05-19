'use strict';
		(function  (input ) {
   input=input.trim().split(/\s+/).map(x=>x-0);
   const N=Math.min(input[0],input[1]);   
const M=Math.max(input[0],input[1]);
	const   K =input [2 ];
   const E=Math.pow(10,9)+7;
  var ans =0;     
for (let d =  1; d<=  N  - 1; d++){
let A=(1/6)*(d+1)*(d+2)*(d*3);
		let B=((N-d-1)+(M-d-1))*(1/2)*(d+1)*(d+2);
let C = ( N -d-1) *(M  - d- 1)  *  ( d  + 1);
      let  D =(N - d) +(M- d);
    ans += d* ( (A+ B + C) * 2 -  D);
	ans%=E;     
	}
for(let d=N;d<=M-1;d++){
     let A=(1/6)*(N)*(N+1)*(N+2);
let B=(M-d-1)*(1/2)*(N)*(N+1); 
 let   C =0;
let D = (M -  d);
	     ans+= d  *((A + B +C)*  2-D);
ans %=E;
}
   for (let  d  =  M;  d <= N  + M- 2;d++){    
     let a =N +M - 1- d;
    let A=(1/6)*(a)*(a+1)*(a+2); 
     let  B = 0;
      let C=0;
	 let D = 0;
/* पठन व्यवस्थित करता है भी अंतिम अपेक्षित आउटपुट इनपुट के साथ सीधा. */
      ans+=d*((A+B+C)*2-D);  

ans%=E;
      }

// पठन व्यवस्थित करता है अब स्थानीय निर्णय गणना के दौरान स्थिर.
	  for (let  i=0; i <  K -2; i++) {
       ans*=(N*M-2-K);
   ans%=E;
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मूल्यांकन क्रम आउटपुट से पहले स्थिर.


      let r  =  [E, i ], q  = [];
		while ( r [r.length -1 ]  !==  1) {
     let A=  r [ r.length  -  2],  B  =  r[r.length -  1];
         let  R =A % B;
/* पठन व्यवस्थित करता है भी अंतिम मानव पठन आउटपुट से पहले अंतिम. */
	let Q=(A-R)/B;     
r.push ( R);
q.push (Q );
    }
     let x=[-(q.pop()),1]; 
while(q.length>0){
       x.push (x[x.length -  2]- x [ x.length- 1]  *  q.pop());
  }
ans=( x[x.length -  2]  * ans )  % E;
  }
         console.log ( ans);
         })(require('fs').readFileSync('/dev/stdin','utf8'));
