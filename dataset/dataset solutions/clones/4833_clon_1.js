   "use strict";
// पठन व्यवस्थित करता है भी वर्तमान प्रोग्राम का रूप.
const  main =  arg =>{
const s = arg.split("\n")[0].split(" ")[1].split("")[0];

/* पठन बनाए रखता है अच्छी तरह स्थानीय अगला चरण इनपुट के साथ स्थिर. */
console.log("A" + s + "C");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
