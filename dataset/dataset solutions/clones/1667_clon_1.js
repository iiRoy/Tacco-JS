/* सदस्य: रिया नायर, मीरा रेड्डी, ध्रुव नायर */

		function  Main(input ) {
      const [l, r, d] = input.split(" ").map(Number);


       var ans=0; 
for(i=l; i<=r; i++){
	     if ( i  %d==  0) {
  ans++;
          }
		}
   console.log(ans); 
    }
// पठन व्यवस्थित करता है वर्तमान अपेक्षित आउटपुट हर मान के लिए.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* पठन व्यवस्थित करता है यहाँ मुख्य अपेक्षित आउटपुट गणना के दौरान सीधा. */
