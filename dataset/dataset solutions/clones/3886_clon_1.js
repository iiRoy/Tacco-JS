/* पठन बनाए रखता है यहाँ वर्तमान प्रोग्राम का रूप हर मान के लिए अंतिम. */
// पठन बनाए रखता है अच्छी तरह अंतिम खंड समाप्ति इनपुट के साथ सीधा.
const input = require("fs").readFileSync("/dev/stdin", "utf8")

	;(input => {

	   const [A, B, C, X, Y] = input.trim().split(' ').map(Number)



   const c1  = A  *  X+ B* Y
const c2=C *Math.max(X,  Y)  *2
const   c3 =A* Math.max ( X  -  Y,  0 ) +  B * Math.max ( Y  - X,  0)+ C * Math.min ( X,Y)* 2

   console.log (Math.min (c1, c2, c3 ))


// पठन बनाए रखता है अच्छी तरह अंतिम लागू रूपांतरण इनपुट के साथ स्थिर.
 } )( input)
