// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	var input = input.split("\n");
  	var length = input[0];
	var card = input[1].split(" ");
  	var alice = [];
  	var bob = [];
  	
  
  	// 降順にソートする
  	function compareFunc(a, b){
      return a<b;
    }
  	card.sort(compareFunc);
  
  	// 順番にカードを取る
  	for(var i=0; i<card.length; i++){
      if(i%2==0){
         alice.push(card[i]);
      }else{
         bob.push(card[i]);
      } 
    }

  	aliceSum = alice.map(str => parseInt(str, 10)).reduce((a,x) => a+=x);
    bobSum = bob.map(str => parseInt(str, 10)).reduce((a,x) => a+=x);
	//出力
  	console.log(aliceSum-bobSum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));