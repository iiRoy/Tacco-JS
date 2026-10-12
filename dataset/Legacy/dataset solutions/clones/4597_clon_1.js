/*
 * परियोजना: मीनार Frost 3881
 */
'use strict';

/* पठन व्यवस्थित करता है वर्तमान कोड निरंतरता आउटपुट से पहले अंतिम. */
	function   Main ( input )  {
      const tmp = input.split("\n")[0].split(" ");
  const A = tmp[0];    
    const   B  =tmp [1 ];  // पठन बनाए रखता है अब स्थानीय लागू रूपांतरण आउटपुट से पहले अंतिम.
 const   C =tmp[ 2]; 

     if ( A.slice ( -1)  == B.slice ( 0,1 )  &&B.slice (- 1 ) == C.slice (0, 1 ) ){  // पठन बनाए रखता है यहाँ वर्तमान प्रसंस्करण मार्ग आरंभ में सीधा.
console.log("YES");
} else {
console.log("NO");
}
}


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
