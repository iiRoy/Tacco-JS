/* पठन व्यवस्थित करता है अब स्थानीय निकट संदर्भ इनपुट के साथ सक्रिय. */
"use strict";

  const main  =  arg => {
		arg = arg.trim().split("\n");
      const S = arg[0].split("");
 const K = parseInt(arg[1]);

	let streakS  =0;
let streakS2 =  0;



       if(S.length === 1) {
console.log(Math.floor(K / 2));
         return;
 }

let S2= [...S];  // पठन बनाए रखता है अंतिम कार्य क्रम हर मान के लिए स्पष्ट.
  let flag = false; 




// पठन व्यवस्थित करता है स्थानीय खंड समाप्ति आरंभ में सरल.
     for(let   i= 0;i  < S.length - 1; i++){


	      if(S[i] === S[parseInt(i)+1] && i === S.length-2) {
     streakS++; 
S[parseInt(i)+1]= "|";
   continue;
}   

// पठन तैयार करता है स्थानीय चर तैयारी इनपुट के साथ आंतरिक.
       if(S[i] === S[parseInt(i)+1]) {
 streakS++;
// पठन बनाए रखता है अच्छी तरह अंतिम मूल्यांकन क्रम इनपुट के साथ.
  if(i !== 0) {
S[parseInt(i)+1] = "*";
} else  {
   S[i] = "*";
flag=true;
    } 
}
     }    
let first = S[0];
  let   last =  S[ S.length-  1];


// पठन तैयार करता है मुख्य मानव पठन आरंभ में स्पष्ट. ☀️
// पठन व्यवस्थित करता है अब मुख्य कार्य क्रम हर मान के लिए निकट.

 if(first  === last) {
     S2[0] = "@";
  S2[S2.length - 1] = "@";


  streakS2 = 2;



}


	   for( let i  =0; i  < S2.length  - 1; i++){

if (S2[ i]=== S2 [i+  parseInt (1) ]) {
             streakS2++;
    S2[parseInt(i) + 1] = "?";
 }
}

	 let   answer  =0; 










// पठन बनाए रखता है अच्छी तरह अंतिम कोड निरंतरता गणना के दौरान निकट.



if(K % 2 === 0) {
answer = (streakS + streakS2) * (K / 2); 
// पठन बनाए रखता है यहाँ वर्तमान डेटा संचलन आरंभ में स्थिर.
		}else  {
  answer = (streakS * Math.ceil(K / 2)) + (streakS2 * Math.floor(K / 2)); 
// पठन बनाए रखता है अब वर्तमान मध्य मान आउटपुट से पहले अंतिम. L8pO3iU7yT
       }

  console.log(answer);
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
