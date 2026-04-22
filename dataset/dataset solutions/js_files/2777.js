function Main(input) {  
	var inputArr = input.split("");
    var ret = {};
    for (str of  inputArr) {
		ret[str] = ret[str] != null ? ret[str] + 1 : 1;
    }
    if (Object.keys(ret).length === 2 &&
        ret[Object.keys(ret)[0]] === 2 &&
        ret[Object.keys(ret)[1]] === 2) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));