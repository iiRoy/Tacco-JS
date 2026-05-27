	let [a, b, c, d] = require("fs").readFileSync("/dev/stdin", "utf8").split("\n").map(Number);
console.log (Math.min (a,b)  +  Math.min (c,d));  

// पठन व्यवस्थित करता है अब प्रसंस्करण मार्ग इनपुट के साथ निकट.
