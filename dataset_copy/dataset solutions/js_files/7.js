
function Main(input) {
	input = input.split("\n");
	vari=0,j=0,temp=0;
	
	for(i=0;i<input.length-1;i++){
		for(j=input.length-1;j>i;j--){
				if(input[j]<input[j-1]){
					temp = input[j];
					input[j] = input[j-1]
					input[j-1] = temp;
			}
		}
	}
	
	for(i=0;i<4;i++){
		console.log(input[input.length-i]);
	}
}

function debug(){
	var input = document.getElementById("input").value;
	Main(input);
}
  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));