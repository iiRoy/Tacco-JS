'use strict'

function Main(input) {
  const N = Number(input.split('\n')[0]);
  const S = input.split('\n')[1].split('');

  let S_left, S_right;
  let counter = 0;
  let sufferlist = [];


  for(let i=1; i<N; i++) {
    S_left = S.slice(0, i)
      .filter((x,i,self) => self.indexOf(x) === i);
    S_right = S.slice(i)
      .filter((x,i,self) => self.indexOf(x) === i);

    for(let j=0; j<S_left.length ;j++) {
      if(S_right.some(value => value === S_left[j])) {
        counter++;
      }
    }
    sufferlist.push(counter);
    counter = 0;
    
    //console.log(S_left);
    //console.log(S_right);
    //console.log(sufferlist);
  }

  console.log(Math.max.apply(null, sufferlist));

}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
