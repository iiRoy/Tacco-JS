function RorB(input){
  let R=0,B=0;
  const inputN = input.split('\n');;  // 1<=inputN<=100
  N = parseInt(inputN[0].replace(/\r?\n/g,''));
  inputS = inputN[1].replace(/\r?\n/g,'').split('');
  inputS.forEach((s)=>{
    if (s==='R'){
      R++;
    }else{
      B++;
    }
  });
  if (R > B){
    console.log("Yes");
  } else {
    console.log("No");
  }
}

RorB(require("fs").readFileSync("/dev/stdin", "utf8"));
