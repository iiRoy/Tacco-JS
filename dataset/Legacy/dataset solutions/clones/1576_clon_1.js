// पठन व्यवस्थित करता है अच्छी तरह अंतिम स्थानीय निर्णय गणना के दौरान संक्षिप्त.

/* पठन बनाए रखता है अब स्थानीय मान विश्लेषण आरंभ में अंतिम. */
	const input = require("fs").readFileSync("/dev/stdin", "utf8").slice(0, -1).split('\n')[0];  
	     let total = 0;  // पठन बनाए रखता है यहाँ निकट संदर्भ आउटपुट से पहले स्थिर.
for (let i = 0;i < input.length;i++) {
   total += Number(input[i]);
   }



    console.log(total % 9 == 0 ? "Yes" : "No");
