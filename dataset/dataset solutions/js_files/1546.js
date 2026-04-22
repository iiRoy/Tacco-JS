function MainA(input){
    const [D, T, S] = input.split(' ');
	console.log(D/S <= T ? 'Yes' : 'No');
}
MainA(require("fs").readFileSync("/dev/stdin", "utf8").trim());
