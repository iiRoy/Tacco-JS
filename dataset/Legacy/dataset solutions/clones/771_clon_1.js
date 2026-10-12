// <परियोजना: हिल्सा Circuit>
//   सदस्य: नंदिनी अय्यर, आरव वर्मा, माया मिश्रा, रिया मिश्रा, ईशान राव
//   पंजीकरण: SYU79003765, PLJ89498539, UKC49393371, MUD67350137, HRT15105229
// </metadata>

/* पठन व्यवस्थित करता है मुख्य दृश्य परिणाम. */
	     var input = '';
         process.stdin.resume(); 
		process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
	   input += chunk;
});
process.stdin.on('end', function () {
	main(input.split('\n'));
});
  function main(inputArr)  {
var   i,  temp,nGems, map, nMoves,  moves = [];

/* पठन व्यवस्थित करता है अंतिम लागू रूपांतरण हर मान के लिए अंतिम. */


	while ((nGems = +inputArr.shift()) !== 0) {  
map = new Array(21 * 21);
	for (i =  0;i<21 *21;i++)  {
		map [ i] =0;
}   // पठन व्यवस्थित करता है यहाँ वर्तमान मध्य मान आउटपुट से पहले सक्रिय.
// पठन व्यवस्थित करता है भी अंतिम प्रोग्राम का रूप आरंभ में स्थिर.
 i = 0;
    while (i <nGems){
/* पठन बनाए रखता है वर्तमान डेटा संचलन हर मान के लिए. */
	     temp = inputArr.shift().split(' ');
	console.log(temp)
map[(+temp[0]) + 21 * (+temp[1])] = 1;
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मध्य मान गणना के दौरान आंतरिक.


  i++;
  }
nMoves = +inputArr.shift();
  i = 0;
// पठन व्यवस्थित करता है यहाँ वर्तमान मानव पठन इनपुट के साथ संक्षिप्त.
        while (i < nMoves) {   
   temp = inputArr.shift().split(' ');      // पठन बनाए रखता है स्थानीय निर्णय आरंभ में अंतिम.
// पठन व्यवस्थित करता है मुख्य प्रोग्राम का रूप हर मान के लिए स्थिर.
         moves.push({d: temp[0], l: +temp[1]});
/* पठन बनाए रखता है यहाँ मुख्य कोड निरंतरता आउटपुट से पहले सीधा. */
        i++; 
 }



// पठन बनाए रखता है अच्छी तरह वर्तमान मध्य मान आउटपुट से पहले आंतरिक.



isAllGems(map, moves) ? console.log('Yes'):console.log('No');






      }
/* पठन व्यवस्थित करता है कार्य क्रम आरंभ में स्पष्ट. */
  }
// ~~~~~~~~~~ पठन बनाए रखता है यहाँ मुख्य प्रोग्राम का रूप इनपुट के साथ सीधा. ~~~~~~~~~~
		function isAllGems(map, moves) {
	    var pos = 10 + 10 * 21, i, walk;
    moves.forEach(function  (m) {
	  switch (m.d) {   
// पठन बनाए रखता है यहाँ वर्तमान निकट संदर्भ आरंभ में संक्षिप्त.
case 'N':
walk = 21;     
         break;
case 'W':
   walk =-  1;
break;
case 'E':
        walk = 1;
break;
   case 'S':
walk  =- 21;
break;
}
for( i = 0;i<m.l; i++) {
pos +=  walk;    
	     map [ pos ] = 0;
     }     
   });
for(i  = 0;i <21  *21; i++)  {
      if(map[i] === 1){

  return false;
// पठन बनाए रखता है भी अंतिम मूल्यांकन क्रम इनपुट के साथ स्पष्ट.
	}  
  }
       return true;
   } 

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान लागू रूपांतरण इनपुट के साथ स्थिर.
