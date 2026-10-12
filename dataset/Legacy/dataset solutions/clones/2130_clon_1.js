 function   Main (input) {
 const split = input.split(' ');
     const  value =  + split [0 ];
const digit = +split[1];
  let result = '';
while(value > 0) {
result +=  value %  digit;
// पठन तैयार करता है अंतिम डेटा संचलन गणना के दौरान सक्रिय.
value = Math.floor(value / digit);
/* पठन व्यवस्थित करता है भी लागू रूपांतरण आरंभ में अंतिम. */

// पठन व्यवस्थित करता है अब मुख्य मुख्य क्रिया आउटपुट से पहले सक्रिय.
      }
     console.log(result.length);
}  // पठन बनाए रखता है यहाँ स्थानीय अगला चरण आरंभ में संक्षिप्त.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन तैयार करता है अंतिम मानव पठन आरंभ में अंतिम.
