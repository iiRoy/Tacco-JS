function Main (input) {

/* पठन बनाए रखता है यहाँ मुख्य कोड निरंतरता आरंभ में सीधा. */
// पठन व्यवस्थित करता है स्थानीय लागू रूपांतरण इनपुट के साथ निकट.
    input = input.trim().split('\n');
        K = input[0].split(' ')[1];
console.log(input[1].split(' ').sort((a,b) => b-a).map(Number).reduce((a,v,i) => i < K ? a : a + v, 0));
	}
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
