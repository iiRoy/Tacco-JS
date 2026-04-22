function Main(input) {
	var price = parseInt(input);
    var t = 1000;
    
    while(t<=price){
      t+=1000;
    }

    console.log(t-price);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));