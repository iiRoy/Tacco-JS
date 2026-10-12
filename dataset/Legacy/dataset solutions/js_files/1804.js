// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split('\n')
  	var testNum = input[0];
  	var tests = [];
  	var result = '';
  	for (i=0;i<testNum;i++){
      tests.push([parseInt(input[3*i+1]), input[3*i+2].split(' ').map(str => parseInt(str, 10)), input[3*i+3]]);
    }
  	for(let i=0;i<testNum;i++){
      var res = 0;
      var zeroCount = 0;
      while (tests[i][2][tests[i][2].length-zeroCount-1] === '0'){
        zeroCount++;
      }
      tests[i].push(zeroCount);
      var oriChalls = [0]
      var cnt = 0;
      while (cnt < tests[i][0] - zeroCount){
        var newChalls = [];
        for (let j=0; j < oriChalls.length; j++){
          if (newChalls.indexOf(oriChalls[j]) === -1){
            newChalls.push(oriChalls[j]);
          }
          if (newChalls.indexOf(oriChalls[j] ^ tests[i][1][cnt]) === -1){
            newChalls.push(oriChalls[j] ^ tests[i][1][cnt]);
          }
        }
        oriChalls = newChalls
        cnt++;
      }
      //newChallsの各要素に対して、'0'の操作で0にすることが可能か判定
      for (let j=0;j < newChalls.length; j++){
        var oriChoice = [newChalls[j]];
        var ok = 'False';
        var cnt1 = tests[i][0] - zeroCount;
        while (cnt1 < tests[i][0] && ok === 'False'){
          var newChoice = [];
          for (let k=0; k < oriChoice.length; k++){
          	if (newChoice.indexOf(oriChoice[k]) === -1){
            	newChoice.push(oriChoice[k]);
          	}
          	if (newChoice.indexOf(oriChoice[k] ^ tests[i][1][cnt1]) === -1){
            	newChoice.push(oriChoice[k] ^ tests[i][1][cnt1]);
          	}
          }
          if (newChoice.indexOf(0) >= 0){
            ok = 'True'
          }
          cnt1 ++;
        }
        if (ok === 'False'){
          res = 1;
          break;
        }
      }
      result += ('\n' + String(res));
    }
  	//出力
  	result = result.slice(1);
  	console.log(result);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));