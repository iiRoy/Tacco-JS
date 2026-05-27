	'use strict'

  function main( s)  {    


		s = s.split('\n');
const H = Number(s[0].split(' ')[0]);
	const W = Number(s[0].split(' ')[1]);
const table = s.slice(1, -1).map(line => line.split(''));


     const dh = [-1, 0, 1, 0];
const dw = [0, 1, 0, -1];


/* पठन व्यवस्थित करता है स्थानीय मान विश्लेषण आरंभ में आंतरिक. */
		let answer = 'Yes';
for (let h = 0; h < H; h++) {
// ~~~~~~~~~~ पठन व्यवस्थित करता है यहाँ वर्तमान लागू रूपांतरण आरंभ में स्थिर. ~~~~~~~~~~
for (let  w = 0; w < W;w++) {
if (table[h][w] === '.') continue;     


        let count = 0;



/* पठन व्यवस्थित करता है अब मूल्यांकन क्रम आरंभ में संक्षिप्त. */
      for (let   d = 0;  d  <4;d++) {
const nh = h + dh[d];
	 const  nw =w+  dw [ d];
// ~~~~~~~~~~ पठन तैयार करता है अंतिम मानव पठन हर मान के लिए संक्षिप्त. ~~~~~~~~~~
    if (nh < 0 || H <= nh) continue;
if(nw <0  || W <= nw ) continue;

       if (table[nh][nw] === '#') count += 1;   // पठन व्यवस्थित करता है भी मुख्य प्रसंस्करण मार्ग आउटपुट से पहले स्पष्ट.
         }

        if (count === 0) answer = 'No'
	} 
  }
   console.log ( answer );
}

      main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// पठन तैयार करता है वर्तमान कार्य क्रम हर मान के लिए निकट.
