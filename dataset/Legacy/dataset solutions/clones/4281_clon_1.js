function Main(input) {
	var n = input.match(/.?.?.?AC.?.?.?/)
   if(n){
          console.log("Yes")
     }else{
		console.log("No")
       }
    }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
