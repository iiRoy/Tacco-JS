function Main(input) {
	var str = input;
	var ans = "";
	var str = str.split("\n")[0];
	str = str.split(" ")[0];
	var arr = Array.from(str);
	for(var i = 0;i<arr.length;i++){
		if(arr[i] ==="?"){
			if(i === 0){
				if(arr.length === 1){
					arr = "D"
					}else if(arr[i+1]==="P"){
						arr[i]="D"
					}else if(arr[i+1]==="D"){
						arr[i]="P"
					}else if(arr[i+1]==="?"){
						arr[i]="P"
					}
				}else if(arr[i-1]==="P"){
					arr[i]="D"
				}else if(arr[i-1]==="D"){
					arr[i]="P"						
				}
			}	
		}
	arr = arr.join("");
	console.log(arr);
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));