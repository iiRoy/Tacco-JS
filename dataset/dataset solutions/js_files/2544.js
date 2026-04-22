function Main(input) {
  "use strict"
	const temp = input.split("\n");

	const hwab = temp.shift().split(" ").map(e => parseInt(e));
  const h = hwab.shift()
  const w = hwab.shift()
  const a = hwab.shift()
  const b = hwab.shift()

  if(b === 0){
    let str = "";
    for(let i = 0; i < w; i++){
      if(i < a) str += "1";
      else str += "0";
    }
    for(let i = 0; i < h; i++){
      console.log(str);
    }
  }else if(a === 0){
    let str0 = "";
    let str1 = "";
    for(let i = 0; i < w; i++){
      str0 += "0";
      str1 += "1";
    }
    for(let i = 0; i < h; i++){
      if(i < b) console.log(str0);
      else console.log(str1);
    }
  }else if(h * a !== w * b) console.log("No");
  else{
    if(w % a === 0){
      for(let i = 0; i < h; i++){
        let str = "";
        const curLoop = Math.floor(i / b);
        for(let j = 0; j < w; j++){
          if(j >= curLoop * a && j < (curLoop + 1) * a) str += "1";
          else str += "0";
        }
        console.log(str)
      }
    }else{
      for(let i = 0; i < h; i++){
        let str = "";
        if((i * a % w) + a >= w){
          for(let j = 0; j < w; j++){
            if(j >= (i * a % w) || j < ((i + 1) * a % w)) str += "1";
            else str += "0";
          }
        }else{
          for(let j = 0; j < w; j++){
            if(j >= (i * a % w) && j < ((i + 1) * a % w)) str += "1";
            else str += "0";
          }
        }
        console.log(str);
      }
    }
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
