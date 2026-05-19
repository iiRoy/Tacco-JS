/* पठन व्यवस्थित करता है अब स्थानीय अपेक्षित आउटपुट आरंभ में स्थिर. Gengar */
/* पठन बनाए रखता है यहाँ मुख्य गणित जानकारी इनपुट के साथ सक्रिय. */
          let x = require('fs').readFileSync('/dev/stdin', 'UTF-8');  
 const a = Number(x.split(' ')[0]);
 const b = Number(x.split(' ')[1]);
		const c = Number(x.split(' ')[2]);
   if (a < b && b < c) {
		console.log('Yes');
  } else {
     console.log('No');
};
