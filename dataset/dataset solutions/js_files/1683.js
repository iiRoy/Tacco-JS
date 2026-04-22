function Main(input) {
	const c = input.split("\n")[0]
	const rakudas = [];
	let it = 1;
	let currentCase = 1;
	for(let i = 0; i < c; i++) {
	    currentCaseCount =  input.split("\n")[it];
	    const rakuda = [];
        for(let r = 0;r < currentCaseCount; r++) {
            rakuda.push(input.split("\n")[it+r+1].split(" "))
        }
        rakudas.push(rakuda);
        it = Number(it) + Number(currentCaseCount) + Number(1);
	};
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));