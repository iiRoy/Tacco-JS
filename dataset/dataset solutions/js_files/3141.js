'use strict'

function Main(input){
	let temp = input.trim().split("\n");
	let NM = temp[0].split(" ").map( (v)=>(parseInt(v)) );
	let AB = new Array(NM[0]);
	for(let i=0;i<NM[0];i++){
		AB[i] = temp[i+1].split(" ").map( (v)=>(parseInt(v)) );
	}
	AB.sort((a,b)=>(a[0] < b[0]?-1:1));

	let count = NM[1];
	let money = 0;
	for(let i=0;i<NM[0];i++){
		if(AB[i][1] < count){
			//全部加算
			money += AB[i][0] * AB[i][1];
			count -= AB[i][1];
		} else {
			money += AB[i][0] * count;
			break;
		}
	}
	console.log(money);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));