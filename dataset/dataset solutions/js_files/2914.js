function Main(input) {
  var dataList = input.split("\n");
  dataList.pop();
  var data = dataList[0].split(" ");
  var jwellNum = parseInt(data[0]);
  var operationNum = parseInt(data[1]);
  var jwells = dataList[1].split(" ").map( str => parseInt(str) );
  var max = 0;
  
  operate({ dequeue: jwells.slice(), hands: [] }, 1);
  function operate(state, openum) {
    if (openum > operationNum) return null;
    for (var k = 0; k < 4; k++) {
      if (k === 0) {
        if (state.dequeue.length !== 0) {
          var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
          A(copyState);
          checkTotal(copyState);
          operate(copyState, openum + 1);                  
        } 
      } else if (k === 1) {
        if (state.dequeue.length !== 0) {
          var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
          B(copyState);
          checkTotal(copyState);
          operate(copyState, openum + 1);        
        }
      } else if (k === 2) {
        for (var j = 0; j < state.hands.length; j++) {
          var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
          C(copyState, j);
          checkTotal(copyState);
          operate(copyState, openum + 1);                  
        }
      } else {
        for (var j = 0; j < state.hands.length; j++) {
          var copyState = { dequeue: state.dequeue.slice(), hands: state.hands.slice()};
          D(copyState, j);
          checkTotal(copyState);
          operate(copyState, openum + 1);        
        }
      }
    }
    function checkTotal(result) {
      var total = sumHands(result.hands);
      if (max < total) {
        max = total;
      }
    }
  }  
  console.log(max);
  function sumHands(hands) {
    var total = 0;
    for (var i = 0; i < hands.length; i++) {
      total = total + hands[i];
    }
    return total;
  }
  
  function A (result) {
    result.hands.push(result.dequeue.shift());
  }
  function B (result) {
    result.hands.push(result.dequeue.pop());
  }
  function C (result, index) {
    result.dequeue.unshift(result.hands.splice(index ,1)[0]);
  }
  function D (result, index) {
    result.dequeue.push(result.hands.splice(index ,1)[0]);
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));