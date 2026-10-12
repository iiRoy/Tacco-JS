// पठन बनाए रखता है स्थानीय प्रसंस्करण मार्ग आउटपुट से पहले.
   "use strict";

  function Main(input) {
let lines = input.split('\n');
let M1 = lines[0].split(' ')[0] * 1;
let M2 = lines[1].split(' ')[0] * 1; 
        console.log(!(M1 === M2));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन व्यवस्थित करता है भी मुख्य मुख्य क्रिया इनपुट के साथ सीधा.
