function Main(input) {
cards=input.split(" ");
cardA=cards[0];
cardB=cards[1];
if(cardA==1){
cardA=14;
}
if(cardB==1){
cardB=14;
}
if(cardA>cardB){
	console.log("Alice");
}else if(cardA<cardB){
	console.log("Bob");
}else if(A==B)
	console.log("Draw");
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));