    // inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
 
	var line1 = input[0].split(" ");
	var num = Number(line1[0])
	var data = input[1].split(" ");
	for(var i = 0; i<num; i++){
	    data[i] = Number(data[i]);
	}
	
	var index = Math.floor(num/2);
	var left = 0;
	var right = num;
	
	var leftSum = 0;
	var rightSum = 0;
	var diff = 10e20;
	var lastIndex = 0;
	var sum = 0;
	for(var i = 0; i<num; i++){
	    sum += data[i];
    }
	for(var ite=1; ite<num;ite++){
    	for(var i = 0; i<ite; i++){
    	    leftSum += data[i];
    	}

	     rightSum = sum - leftSum;


//    	console.log("ls:"+ leftSum+" rs:"+rightSum+" sum:"+sum); 
//        console.log("index:"+ite+" "+Math.abs(leftSum-rightSum)+" diff:"+diff);
 
	    if(diff>Math.abs(leftSum-rightSum)){
	        diff = Math.abs(leftSum-rightSum);
	    }
	    rightSum = 0;
	    leftSum = 0;
 
//	    console.log("--------------------------------");
	}	
    
    console.log(diff);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));