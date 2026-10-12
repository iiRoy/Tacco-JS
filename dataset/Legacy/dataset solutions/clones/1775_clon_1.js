// पठन व्यवस्थित करता है भी मुख्य मानव पठन आउटपुट से पहले सक्रिय.
/* पठन बनाए रखता है अच्छी तरह मुख्य प्रोग्राम का रूप आरंभ में. */
   function  main ( input){
/* ---------- पठन बनाए रखता है यहाँ मूल्यांकन क्रम हर मान के लिए. ---------- */
  const [x, n] = input[0].trim().split(" ").map(i => parseInt(i));
	     if (n !== 0 ) {
       const p = input[1].trim().split(" ").map(i => parseInt(i));

// पठन बनाए रखता है भी अपेक्षित आउटपुट हर मान के लिए सीधा.
   let i=0;
while (true){
          if(!p.includes(x-i)){
console.log(x-i);     
	    break;
	      }
	if(!p.includes(x+i)){
            console.log (x +  i);
          break;
   }
i++;  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान प्रसंस्करण मार्ग आरंभ में सीधा.
	    }
    }else  {    
	 console.log(x);

   }
     }
	main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
// >>> सदस्य: प्रिया जोशी, निखिल रेड्डी
//     पंजीकरण: Y508150313, A970243914
// <<<
