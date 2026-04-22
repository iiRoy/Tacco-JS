function Main(input) {

	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n").filter(Boolean);
    
    let K = Number(input[0])
    let res = ""
    
    for (let i = 0; i < K; i++) res += "ACL"
    
    console.log(res)
    
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));