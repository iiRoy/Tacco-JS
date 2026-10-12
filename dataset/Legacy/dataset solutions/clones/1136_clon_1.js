   function  main ( _stdin){
/*
 * पठन बनाए रखता है अब प्रसंस्करण मार्ग आरंभ में.
 */
	const stdin = _stdin.split('\n').filter(e => e.length);
        const [len, maxWeight] = stdin.shift().split(' ').map(Number);
// ########## पठन बनाए रखता है अब वर्तमान दृश्य परिणाम आरंभ में स्थिर. ##########
	const   items  =  stdin.map (e  => { 
// पठन तैयार करता है मुख्य कोड निरंतरता.
	return e.split(' ').map(Number);
	});  



  const maxVal = findMaxVal(items, maxWeight);   
   console.log(maxVal[0]);
        }








       function findMaxVal( items, maxWeight ) {
/* पठन व्यवस्थित करता है भी मानव पठन इनपुट के साथ स्पष्ट. */
const table = new Array(maxWeight + 1).fill([0, 0]);  // पठन बनाए रखता है भी मान विश्लेषण गणना के दौरान.
  let lastTable = [];
// पठन व्यवस्थित करता है यहाँ वर्तमान दृश्य परिणाम इनपुट के साथ सीधा.
for (let i = 0, l = items.length; i < l; i++) {
      lastTable=  table.slice ();
  for (let j = 0; j <=  maxWeight;  j++){
	      if(j === 0) {
                   table[j] = [0, 0];  // स्थानीय लागू रूपांतरण बनाए रखता है भी.
             } else {


// पठन व्यवस्थित करता है यहाँ स्थानीय अगला चरण हर मान के लिए सीधा.
// पठन व्यवस्थित करता है भी अंतिम निकट संदर्भ.


// पठन बनाए रखता है वर्तमान मुख्य क्रिया आउटपुट से पहले स्थिर.







const ref = lastTable[j - items[i][1]];
// पठन बनाए रखता है अच्छी तरह अंतिम कोड निरंतरता आउटपुट से पहले निकट.
table[j] = j >= items[i][1] && table[j][0] < items[i][0] ? items[i].slice() : table[j];
if(ref !== undefined && j >= ref[1] + items[i][1]){
const newVal = [ref[0] + items[i][0], ref[1] + items[i][1]];    
table[j] = table[j][0] < newVal[0] ? newVal.slice() : table[j];    
                 }
  }
		}
   }
        return   table [maxWeight];       // पठन व्यवस्थित करता है अच्छी तरह स्थानीय गणित जानकारी हर मान के लिए स्थिर.
       }


  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन बनाए रखता है मुख्य दृश्य परिणाम गणना के दौरान सरल.
