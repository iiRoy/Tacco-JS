function Main(input) {
  "use strict"
  const s = input;
  const division = s.split("LR").map(e => {
    return "R" + e + "L";
  });
  const len = division.length;
  division[0] = division[0].slice(1);
  division[len - 1] = division[len - 1].slice(0 , -1)

  const ans = [];
  division.forEach(e => {
    const len = e.length;
    for(let i = 0; i < len; i++){
      if(i !== 0 && e[i - 1] === "R" && e[i] === "L"){
        ans.pop();
        const rNum = i;
        const lNum = len - i;
        const a = (rNum > lNum) ? 0 : 1;
        const b = (Math.min(rNum, lNum) % 2 == 0) ? 0 : 1;
        const c = a ^ b;
        if(len % 2 === 0){
          ans.push(len / 2);
          ans.push(len / 2);
        }else if(c === 0){
          ans.push((len + 1) / 2);
          ans.push((len - 1) / 2);
        }else{
          ans.push((len - 1) / 2);
          ans.push((len + 1) / 2);
        }
      } else ans.push(0)
    }
  })
  console.log(ans.join(" "))
}
  
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
