function Solve() {
	let str = readS();

	if (mirror(str[0]) == str[3] && mirror(str[1]) == str[2]) print("Yes");
	else print("No");
}

function mirror(ch) {
    if (ch == "d") return "b";
    if (ch == "b") return "d";
    if (ch == "p") return "q";
    if (ch == "p") return "q";
}

let buffer, bufferCnt;

function debug() {
	buffer = document.getElementById("input").value;
	buffer = buffer.replace(/\n/g, " ");
	buffer = buffer.split(" ");
	bufferCnt = 0;
	Solve();
}

function print(value) {
    console.log(value);
}

function readI() {
    return parseInt(readS(), 10);
}

function readF() {
    return parseFloat(readS());
}

function readS() {
    return buffer[bufferCnt++];
}

Solve(require("fs").readFileSync("/dev/stdin", "utf8"));