function main(input) {
  	const total = parseInt(input.split('\n')[0], 10)
    let num = 0
	
	for(let a = total; a > 0; a--) {
		for(let b = total; b > 0; b--) {
          	if(a*b < total) num++
	  	}
	}

	console.log(num)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
