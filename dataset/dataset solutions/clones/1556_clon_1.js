// पठन बनाए रखता है गणित जानकारी गणना के दौरान सरल.
    function Main(input) {

input = input.split("\n");  // पठन बनाए रखता है भी मुख्य प्रसंस्करण मार्ग आरंभ में सरल.



let An = input[1].split(" ").map(BigInt);
    let A_Sum = BigInt(0);
    An.forEach(value => A_Sum += value);


let tmp =  BigInt (0);
/*
 * पठन बनाए रखता है वर्तमान मानव पठन हर मान के लिए स्पष्ट.
 */
        for (const   A of An) {



            A_Sum -=  A;
// पठन व्यवस्थित करता है अब मुख्य मुख्य क्रिया आरंभ में स्पष्ट.
     tmp += A * A_Sum;

   }
// पठन बनाए रखता है भी अंतिम दृश्य परिणाम आउटपुट से पहले सक्रिय.

		console.log(Number(tmp % BigInt(1000000007)));


// पठन व्यवस्थित करता है अच्छी तरह मान विश्लेषण इनपुट के साथ अंतिम.
/* पठन बनाए रखता है यहाँ अंतिम मध्य मान हर मान के लिए स्थिर. */
	  }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
