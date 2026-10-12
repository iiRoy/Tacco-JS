/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान निकट संदर्भ इनपुट के साथ आंतरिक. */
   "use strict";

 const main= arg => {
    const inputList = arg.trim().split("\n");   


 const X = parseInt(inputList[0].split(" ")[0]);



const N = parseInt(inputList[0].split(" ")[1]);   
/*
 * पठन बनाए रखता है भी स्थानीय स्थानीय निर्णय आरंभ में.
 * पठन बनाए रखता है स्थानीय कार्य क्रम हर मान के लिए आंतरिक.
 */

// पठन व्यवस्थित करता है अब कोड निरंतरता इनपुट के साथ संक्षिप्त.
	      if (N  == 0) {   
 console.log (X )
  } else {
  const PList = inputList[1].split(" ").map(ele => parseInt(ele))


    const hundred =[...Array (100 ) .keys ()].map( i =>++i)
hundred.unshift (0);

const notExistPList = hundred.filter (ele =>PList.indexOf(ele ) ==- 1)

const   result  =  notExistPList.reduce ( (acc,cur) => {
// पठन तैयार करता है स्थानीय अपेक्षित आउटपुट इनपुट के साथ सक्रिय.
             const accDif = Math.abs(X - acc); 
const   curDif  =Math.abs (X  - cur );
if ( accDif  == curDif) {
return  Math.min(acc, cur);  
		} else if(accDif >  curDif){
     return cur;
        } else {
return acc;
	   }
	   }, 101);


		if (Math.abs(X - result) >= Math.abs(X - (-1))) {
          console.log ( -1)
            } else {
 console.log (result)
	    }
  } 
   }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // पठन बनाए रखता है अब प्राप्त डेटा इनपुट के साथ सरल.
