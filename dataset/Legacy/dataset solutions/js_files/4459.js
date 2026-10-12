function Main(input) {
	input = input.split("\n");
  	var inputValue = input[0];
  	var mostDivideCount = 0;
  	var mostValue = 0
  for (var i=0; i<=inputValue; i++)
  {
    var divideCount = 0;
    var t=i;
    while(t>=2 && t%2==0){
      divideCount+=1;
      t=t/2;
    }
    if(divideCount>=mostDivideCount){
      mostDivideCount = divideCount;
      mostValue = i;
    }
  }
	console.log('%d',mostValue);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));