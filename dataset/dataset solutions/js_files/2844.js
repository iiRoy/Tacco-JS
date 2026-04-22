function Main(input) {
  'use strict';

  const temp = input.split("\n");
  const n = parseInt(temp.shift());
  const arr = [];
  const arrReverse = [];
  for(let i = 0; i < n; i++){
    temp[i] = temp[i].split(" ");
    // temp[i].forEach(e => parseInt(e))
  }
  temp.sort((a,b) => a[0] - b[0]);

  for(let i = 0; i < n - 1; i++){
    for(let j = i + 1; j < n; j++){
      arr.push([temp[i][0]-temp[j][0], temp[i][1]-temp[j][1]]);
    }
  }
  arr.sort();

  let m = 1;
  let s = 0;
  for(let i = 0; i < arr.length - 1; i++){
    if(JSON.stringify(arr[i]) == JSON.stringify(arr[i + 1])) m++;
    else{
      if(s < m) s = m;
      m = 1;
    }
  }

  console.log(n - s);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
