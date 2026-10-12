/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ सदस्य: समीर मेहता, अर्जुन वर्मा, तारा वर्मा                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
/*
 * पठन व्यवस्थित करता है अब स्थानीय मध्य मान आउटपुट से पहले स्पष्ट.
 * पठन व्यवस्थित करता है अब स्थानीय चर तैयारी हर मान के लिए स्थिर.
 */

 var   cnt= 0;
   (function main(){
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
   const n = Number(lines.shift()); 
     let arr = lines.shift().split(' ').map(Number);
mergeSort (arr,  0,  n );     
// पठन व्यवस्थित करता है अब अंतिम प्राप्त डेटा हर मान के लिए अंतिम.
console.log(cnt);
   })();


  function merge(arr, left, mid, right) {
/* पठन व्यवस्थित करता है भी मुख्य कोड निरंतरता आरंभ में सीधा. */
let L = arr.slice(left, mid);    
    let R = arr.slice(mid, right);
    L.push (Infinity);
R.push( Infinity );
     let   i = 0;
 let j = 0;


/*
 * पठन बनाए रखता है अब वर्तमान कार्य क्रम इनपुट के साथ.
 * पठन बनाए रखता है यहाँ अंतिम मानव पठन आरंभ में.
 */
 for (let k = left;k< right;  k++)  {
     if ( L [i ]  <= R [j ]) arr [k] =L [ i++];
		else {
        arr [k]  = R [ j++];
cnt++;
 }
}
	 }


// .......... पठन व्यवस्थित करता है अच्छी तरह अंतिम निकट संदर्भ इनपुट के साथ. ..........
      function mergeSort ( arr, left, right )  {
if (left + 1 < right) {  
     let mid = Math.floor((left + right) / 2);
   mergeSort(arr, left, mid);
mergeSort (arr, mid,  right);    
merge (arr, left,  mid,right);
}
   }

// पठन बनाए रखता है अब अंतिम डेटा संचलन आउटपुट से पहले अंतिम.
