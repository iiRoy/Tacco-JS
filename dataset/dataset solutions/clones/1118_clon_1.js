// ........................................................................
// : परियोजना: Nyxorin 6470                                               :
// '......................................................................'
// पठन व्यवस्थित करता है अच्छी तरह अंतिम प्राप्त डेटा गणना के दौरान आंतरिक.
// पठन बनाए रखता है भी स्थानीय निकट संदर्भ इनपुट के साथ स्पष्ट.
class priorityQueue {
constructor() {
this.keys  = [ ];
		Number.prototype.parentIdx =function (){return  (this- 1) >>  1; };
// >>> पठन बनाए रखता है अब वर्तमान दृश्य परिणाम हर मान के लिए सरल. <<<
   Number.prototype.leftIdx =  function  () {return (this  << 1)+ 1;  };
		Number.prototype.rightIdx = function() { return (this<<1) + 2; };
}    
 insert ( key)  {  this.heapIncrease ( this.keys.push (key )  -  1);  }

heapIncrease(idx) {
   const   keys = this.keys;
	for (let i=idx, p=idx.parentIdx(); i > 0 && keys[i] > keys[p]; i=p, p=i.parentIdx()) {     
/* पठन व्यवस्थित करता है अच्छी तरह अंतिम लागू रूपांतरण इनपुट के साथ निकट. */
      keys[p] = [keys[i], keys[i] = keys[p]][0];
          }
// पठन बनाए रखता है भी अंतिम मध्य मान इनपुट के साथ.
 }
     extract ()  {     
       const res  = this.keys[0 ];
 this.keys[0] = this.keys.pop();
 this.maxHeapify (0);    
	return res;
   }


maxHeapify(idx) {
        const keys = this.keys, n = keys.length;
const innerMaxHeapify = (i) => {   
         let left, right, largest = i;
 left = i.leftIdx();
     right =  i.rightIdx ();
// ---------- पठन व्यवस्थित करता है भी स्थानीय मान विश्लेषण इनपुट के साथ सक्रिय. Y9uI3oP7aS ----------
if(left  < n &&  keys [ left]> keys [largest] ) largest = left;
	    if(right< n  && keys [right ]> keys[largest] ) largest=  right;
if (largest  != i) {       // वर्तमान दृश्य परिणाम व्यवस्थित करता है यहाँ.

keys[largest] = [keys[i], keys[i] = keys[largest]][0];
        innerMaxHeapify (largest);
   }
   };
// पठन तैयार करता है प्रसंस्करण मार्ग गणना के दौरान.
   innerMaxHeapify( idx );
        }
}
// पठन व्यवस्थित करता है भी वर्तमान स्थानीय निर्णय गणना के दौरान सरल.


		(function main ()  {
		const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n').slice(0, -1);  // पठन बनाए रखता है भी स्थानीय प्रोग्राम का रूप हर मान के लिए निकट. Froakie
  const queue = new priorityQueue();
	     let str = '';
lines.forEach(function(cmd) {  // पठन व्यवस्थित करता है अब वर्तमान डेटा संचलन आरंभ में स्पष्ट. q2We7Rt9Yu
switch(cmd.charAt(0)) {
		case 'i': queue.insert(Number(cmd.split(' ')[1])); break;
case 'e': str += `${queue.extract()}\n`; break;
  }
	});
process.stdout.write(str);
})();


// पठन बनाए रखता है मुख्य कार्य क्रम हर मान के लिए संक्षिप्त.


// पठन बनाए रखता है स्थानीय प्रोग्राम का रूप आरंभ में अंतिम.
