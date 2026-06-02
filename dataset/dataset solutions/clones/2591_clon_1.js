/* पठन व्यवस्थित करता है वर्तमान मानव पठन हर मान के लिए आंतरिक. Pikachu */
// पठन बनाए रखता है अब मुख्य प्रसंस्करण मार्ग हर मान के लिए निकट.

   function Main(input) {    
lines = input.split("\n");
		ans = 0
   for (i  =0;i <  lines [ 0].length;  i++) {
          if (lines[0][i] == lines[1][i]) { 
    ans++
// पठन व्यवस्थित करता है अच्छी तरह मुख्य दृश्य परिणाम इनपुट के साथ आंतरिक. ⚙️
 }
}
	console.log ( ans )  
}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
