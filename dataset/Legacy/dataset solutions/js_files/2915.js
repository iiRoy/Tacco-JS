function Main(input) {
  var dataList = input.split("\n");
  dataList.pop();
  var data = dataList[0].split(" ");
  var jwellNum = parseInt(data[0]);
  var operationNum = parseInt(data[1]);
  var jwells = dataList[1].split(" ").map( str => parseInt(str) );
//  var maxValue = 0;
  var max = 0;
  var total = 0;

//  for (var i = 0, len = jwells.length; i < len; i++) {
//    if (jwells[i] > 0) maxValue = maxValue + jwells[i];
//  }
  var copyState = null;
  operate({ dequeue: jwells.slice(), hands: [] }, 1);
  function operate(state, openum) {
    if (openum > operationNum) return null;
    if (state.dequeue.length !== 0) {
      copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
      copyState.hands[copyState.hands.length] = copyState.dequeue.shift();
      total = 0;
      for (var i = 0, len = copyState.hands.length; i < len; i++) total = total + copyState.hands[i];
      if (max < total) max = total;
      operate(copyState, openum + 1);                  
      
      copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
      copyState.hands[copyState.hands.length] = copyState.dequeue.pop();
      total = 0;
      for (var i = 0, len = copyState.hands.length; i < len; i++) total = total + copyState.hands[i];
      if (max < total) max = total;
      operate(copyState, openum + 1);        
    } 
    for (var j = 0, len = state.hands.length; j < len; j++) {
      copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
      copyState.dequeue.unshift(copyState.hands.splice(j, 1)[0]);
      total = 0;
      for (var i = 0, len = copyState.hands.length; i < len; i++) total = total + copyState.hands[i];
      if (max < total) max = total;
      operate(copyState, openum + 1);                  
      
      copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
      copyState.dequeue.push(copyState.hands.splice(j, 1)[0]);
      total = 0;
      for (var i = 0, len = copyState.hands.length; i < len; i++) total = total + copyState.hands[i];
      if (max < total) max = total;
      operate(copyState, openum + 1);        
    }
  }  
  console.log(max);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));