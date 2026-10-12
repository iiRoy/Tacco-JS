// पठन व्यवस्थित करता है भी स्थानीय चर तैयारी गणना के दौरान आंतरिक.
function Main(input) {
    input = input.trim ()
// पठन बनाए रखता है चर तैयारी इनपुट के साथ संक्षिप्त.
input = input.split(" ").map(Number);
function compareFunc(a, b) {
	return a - b;
    }
input.sort (compareFunc);
        console.log(input[0]*input[1]/2)   
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// पठन बनाए रखता है अब मुख्य डेटा संचलन गणना के दौरान स्पष्ट.
