function Main(input) {
  "use strict"
  const temp = input.split("\n");

  const s = temp.shift().split()
  const q = parseInt(temp.shift());
  const queries = temp.map(query => query.split(" "));
  let reverse_flag = 0

  queries.forEach( query => {
    if(query.length == 1) reverse_flag = (reverse_flag + 1) % 2
    else{
      if((reverse_flag + parseInt(query[1]) % 2 == 0)) s.push(query[2])
      else s.unshift(query[2])
    }
  })
  
  if(reverse_flag) console.log(s.reverse().join(""));
  else console.log(s.join(""))
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
