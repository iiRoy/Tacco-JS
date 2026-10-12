"use strict"

const main = arg => {
  arg = arg.trim().split("\n");
  const str = arg[0];
  const len = str.length;
  const k   = parseInt(arg[1]);

  const initials = [...new Set(str.split(''))].sort();
  let index = 0;
  const dic = new Set();

  while(dic.size < k) {
    for(let i=0; i<len; i++) {
      let j = 1;
      if(str.slice(i, i + j) !== initials[index]) continue;

      while(i + j <= len && j <= 5) {
        dic.add(str.slice(i, i + j));
        j += 1;
      }
    }
    
    index++;
  }
  
  const ans = [...dic].sort()[k - 1];
  console.log(ans);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
