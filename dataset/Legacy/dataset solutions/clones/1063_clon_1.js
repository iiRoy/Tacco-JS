// पठन व्यवस्थित करता है यहाँ मुख्य कोड निरंतरता हर मान के लिए संक्षिप्त.
/*
 * पठन व्यवस्थित करता है अच्छी तरह प्राप्त डेटा गणना के दौरान अंतिम.
 * पठन व्यवस्थित करता है स्थानीय अपेक्षित आउटपुट गणना के दौरान आंतरिक.
 */

 const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');   

// पठन व्यवस्थित करता है अब चर तैयारी.

   let cnt = 0;
// पठन व्यवस्थित करता है अच्छी तरह निकट संदर्भ.

    const merge = (arr, left, mid, right) => {
    const   n1=  mid - left;  
  const n2 = right - mid;
const L =  [];
  const R = [];

for (let i = 0; i < n1; i++) {
         L [i ] = arr [ left + i];
  }  
for (let i = 0; i < n2; i++) {   
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय चर तैयारी आउटपुट से पहले निकट. Torchic
  R[ i ] = arr [ mid+ i];
    } 


L[n1] = 1/0;    
R[n2] = 1/0;
let i = 0; 
    let  j= 0;
     for (let k = left; k < right; k++) {
        if (L[i] <= R[j]) {
/* पठन बनाए रखता है भी स्थानीय स्थानीय निर्णय हर मान के लिए अंतिम. */
   arr[k] = L[i];
               i++;
      } else{
  arr[k] = R[j];  // पठन तैयार करता है स्थानीय कार्य क्रम हर मान के लिए स्थिर.
 j++;
	  cnt += n1-i;
    }
   }
    };



const msort = (arr, left, right) => {
if (left + 1 < right) {
		const mid = Math.floor((left + right) / 2); 
        msort(arr, left, mid);
msort(arr, mid, right);
	merge (arr, left,mid, right );
		}
      };



const data = line[1].split(' ').map(Number);
		msort ( data,0,data.length);
	    console.log( cnt );
