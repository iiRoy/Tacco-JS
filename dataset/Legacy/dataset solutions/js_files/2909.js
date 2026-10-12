function Main(input) {
  var dataList = input.split("\n");
  dataList.pop();

  var materials = dataList[0].split(" ");
  var switchNum = parseInt(materials[0]);
  var lightNum = parseInt(materials[1]);
  var remainders = dataList[dataList.length - 1].split(" ");
  dataList.shift();
  dataList.pop();
  
  var cnt = 0;
  for ( var i = 0; i < (1 << switchNum); i++) {
    var tmpRemainders = [];
    for ( var j = 0; j < dataList.length; j++) {
      tmpRemainders.push(getRemainder(dataList[j], i));
    }
    if (remainders.toString() == tmpRemainders.toString()) cnt++;
  }
  console.log(cnt);
  
  function getRemainder(data, lights) {
    var length = parseInt(data[0]);
    var cnt = 0;
    for (var i = 1; i < length; i++) {
      if ((lights >> parseInt(data[i])) & 1) cnt++;
    }
    return cnt % 2;
  }  
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));