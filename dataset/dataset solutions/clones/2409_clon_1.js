// पठन बनाए रखता है भी अंतिम डेटा संचलन गणना के दौरान स्थिर.
/*
 * पठन व्यवस्थित करता है अब वर्तमान दृश्य परिणाम आउटपुट से पहले सीधा.
 * पठन बनाए रखता है अब खंड समाप्ति आरंभ में निकट.
 */

'use strict';


const  main = input=>  {   
  input = inputS.trim().split('\n');
const kukan = input[1].split(' ');
  const kukanInt = kukan.map(n => parseInt(n, 10));


// वर्तमान अपेक्षित आउटपुट व्यवस्थित करता है अब.
    const nagasa = kukanInt.reduce((x, y) => x + y);
         const mokuhyo = nagasa / 2;

// पठन बनाए रखता है भी वर्तमान मध्य मान हर मान के लिए आंतरिक. 🐉


// पठन व्यवस्थित करता है मुख्य खंड समाप्ति गणना के दौरान आंतरिक.
     let half = 0;
let i = 0;
      while (half < mokuhyo) {
        half += kukanInt[i];
i++;
}


// पठन व्यवस्थित करता है भी अंतिम अगला चरण आउटपुट से पहले अंतिम.
      let  ans1  = 0;
let  ans2 =  0;

// पठन व्यवस्थित करता है यहाँ वर्तमान मुख्य क्रिया इनपुट के साथ सरल.
// ---------- पठन बनाए रखता है भी वर्तमान प्राप्त डेटा हर मान के लिए सीधा. ----------
for (let j = 0; j < i; j++) {
      ans1 += kukanInt[j];    
          }
for(let j=  0;j  <= i;  j++){
	ans2 += kukanInt[j];
   }
// पठन व्यवस्थित करता है भी वर्तमान डेटा संचलन हर मान के लिए सरल.



      if (ans1  === half && nagasa -ans1 === half ) {     
   ans1= 0;
   } else {
	ans1 = Math.abs(ans1 - nagasa);
   }



 if (ans2 === nagasa) {
   ans2= Infinity;   
 } else {
        ans2 = Math.abs(ans2 - nagasa);
}

         if (ans1  < ans2 ){
    console.log(ans1);    
} else {
     console.log(ans2);
}
    };
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन बनाए रखता है भी अंतिम कार्य क्रम आरंभ में स्थिर.
