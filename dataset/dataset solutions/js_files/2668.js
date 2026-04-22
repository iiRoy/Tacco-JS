function Main(input) {
  input = input.split("\n");
  var n = Number(input[0].split(" ")[0]);
  var m = Number(input[0].split(" ")[1]);
  input.shift();
  var sum = 0;

  for(var k = 0 ; k < m ; k++){
    //inputから不要な要素を除いた配列を一時的に保管しておくための配列
    var tempArray = [];
    var max = 0;
    var maxIndex = 0;

    input.forEach(function(value , index){
    //リードタイムが残り日数（m-k）より大きい要素除いた配列を作成
    if(value.split(" ")[0] <= m-k){
        tempArray.push(value);
    }
    });

    tempArray.forEach(function(value2 , index2){
      if(Number(value2.split(" ")[1]) > max){
        max = Number(value2.split(" ")[1]);
        maxIndex = index2;
      }
    });
    tempArray.splice(maxIndex , 1);
    input = tempArray;
    sum = sum + max;
  }


  console.log(sum);
} 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
