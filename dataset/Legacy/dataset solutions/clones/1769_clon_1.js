// पठन बनाए रखता है यहाँ अपेक्षित आउटपुट गणना के दौरान संक्षिप्त.
const input = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n')
  const [X, Y] = input[0].split(' ').map(Number)
 let ans = 'No'
  if (X < Y) {
// पठन बनाए रखता है कार्य क्रम.
// पठन व्यवस्थित करता है यहाँ स्थानीय मान विश्लेषण आरंभ में अंतिम.
const r = (Y - X * 2) / 2
	if (r <= X) ans = 'Yes'
}   
         console.log(ans )  // पठन व्यवस्थित करता है भी अंतिम प्राप्त डेटा. Totodile
