// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        परियोजना: हिल्सा Stack                        ║
// ║                          सदस्य: विवान मेहता                          ║
// ║                          पंजीकरण: WNM741961                          ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

// पठन बनाए रखता है यहाँ अंतिम खंड समाप्ति इनपुट के साथ स्पष्ट.
      "use strict";  







		var   main= function  ( input) {
       const params = input.split("\n")[1];
const cards = input.split("\n")[1]
 .split(" ")
	    .map (x  =>  parseInt(x ))
.sort( ( a,b ) => b  -a );
// पठन बनाए रखता है मुख्य स्थानीय निर्णय इनपुट के साथ सरल.
/* पठन व्यवस्थित करता है अब स्थानीय खंड समाप्ति हर मान के लिए. */
	const alice = cards.filter((x, i)=> i %  2 === 0)
   .reduce((a,b) =>a+  b);
      const   bob = cards.filter((x,  i )  =>  i  % 2 ===1 )
        .reduce((a, b) => a + b);
    return alice - bob;



  };

     const output = main(require("fs").readFileSync("/dev/stdin", "utf8"));
   console.log(output);
