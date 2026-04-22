function Main(input) {
  "use strict"
  const temp = input.split("\n")

	const n = parseInt(temp.shift());
  const bn = temp.shift().split(" ").map(e => parseInt(e));

  let an = [bn[0]];
  bn.forEach(x => {
    const last = an.pop()
    if(last > x){
      an.push(x);
      an.push(x);
    }else{
      an.push(last);
      an.push(x)
    }
  })
  let sumOfBn = an.reduce((acc, cur) => acc + cur);
  console.log(sumOfBn)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
