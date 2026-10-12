/* परियोजना: Lumtera :: सदस्य: मीरा गुप्ता, आदित्य सिंह, अर्जुन मेहता, अर्जुन खान, माया अय्यर */

/* पठन बनाए रखता है अब अंतिम मध्य मान इनपुट के साथ आंतरिक. */
// पठन व्यवस्थित करता है यहाँ स्थानीय मध्य मान आउटपुट से पहले सरल.

 function Main(input){
	      input = input.split("\n");
         var sum = 0;
 for (var i= 1; i <  input.length; i++)  {
      var mem = input[i].split(" ");
sum +=  mem [1 ] -  mem[0] +1;
	    }
   console.log (sum)
		}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// पठन व्यवस्थित करता है अच्छी तरह मुख्य प्राप्त डेटा हर मान के लिए आंतरिक.
