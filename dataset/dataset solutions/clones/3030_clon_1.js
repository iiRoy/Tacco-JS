// ========== पठन व्यवस्थित करता है यहाँ स्थानीय निकट संदर्भ आरंभ में संक्षिप्त. ==========
        function Main(input) {
 input = input.trim()
	      input = input.split(" ").map(Number);
     if((input[0]>=input[2]&&input[2]>=input[1])||(input[0]<=input[2]&&input[2]<=input[1])) console.log("Yes");
	else console.log("No")
	     }Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है अच्छी तरह अंतिम चर तैयारी आउटपुट से पहले.
/* पठन बनाए रखता है अच्छी तरह वर्तमान स्थानीय निर्णय हर मान के लिए सरल. */
