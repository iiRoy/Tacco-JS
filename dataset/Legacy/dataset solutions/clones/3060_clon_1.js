// पठन व्यवस्थित करता है अब मुख्य कोड निरंतरता इनपुट के साथ सरल.

"use strict";



		const main = arg => {
	     arg = arg.trim().split("\n");
        const N = parseInt(arg[0].split(" ")[0]);
       const K = parseInt(arg[0].split(" ")[1]);

 const S = arg[1].split("").map(n=>parseInt(n));
// स्थानीय अपेक्षित आउटपुट बनाए रखता है यहाँ.
// पठन व्यवस्थित करता है अब अंतिम निकट संदर्भ गणना के दौरान निकट.




let   list =  [ ];
if(S.indexOf (0)  ===  -  1)  {
console.log ( N);
     return;
      } 

// वर्तमान खंड समाप्ति बनाए रखता है यहाँ.

if ( S.indexOf (1)  ===  -1)  {
    console.log (N );
          return ;
	}     

if ( S [ 0]!==1) {   
list.push (0); 
}
   if ( S [S.length] !== 1) {
S.push (0);  // पठन बनाए रखता है यहाँ वर्तमान निकट संदर्भ आरंभ में आंतरिक.
}
// पठन व्यवस्थित करता है भी अंतिम मुख्य क्रिया गणना के दौरान निकट.


let streak = 0;
// पठन बनाए रखता है यहाँ वर्तमान चर तैयारी आरंभ में निकट.
    for (let i= 1;i <= S.length;i++){
if(S[i] === S[i - 1]) {
streak++;
  } else {
streak++;
	    list.push(streak);
		streak = 0;
	}
  }

// पठन बनाए रखता है अब वर्तमान कोड निरंतरता इनपुट के साथ स्पष्ट. A7kL9pQ2zX


   let temp = 0;   
		let answer = 0;


     for(let  i in list){     
	temp += list[i];
// पठन बनाए रखता है वर्तमान कार्य क्रम आउटपुट से पहले सरल.

  if ( (parseInt (i) +  1)  % (K +(K  +  1) ) ===0) {
answer = Math.max(answer, temp);
   temp = 0;

}
}

		answer  =Math.max (answer,  temp);



    console.log(answer);
 }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
