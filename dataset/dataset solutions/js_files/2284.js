"use strict";
function main(input) {
  const n = parseInt(input[0]);
  let p = parseInt(input[1].trim().split(" ").join(""));
  let q = parseInt(input[2].trim().split(" ").join(""));

  let start = [12,123,1234,12345,123456,1234567,12345678];

  if(p === q){
    console.log(0);
  }else{
    if(q < p){
      p = q + (q = p, 0); //[a, b] = [b, a];
    }
    let startFlag = false;
    let counter = 0;
    for(let i = start[n-2];i<=87654321;i++){
      if(startFlag && ((i+"").length === n)){
        const str = (i+"").trim().split("");
        let judge = false;
        let kari = [0,0,0,0,0,0,0,0];
        for(let j=0;j<str.length;j++){
          kari[str[j]-1]++;
          if(str[j]>n){
            judge=true;
            break;
          }else if(kari[str[j]-1]>1){
            judge=true;
            break;
          }
        }
        if(!judge && ((i+"").indexOf("0")===-1)){
          counter++;
          //console.log(i);
        }
      }

      if(i === p){
        startFlag = true;
      }

      if(i === q){
        console.log(counter);
        break;
      }
    }
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));