//let input = "7 4 2\n3";

function main(input){
  input = input.trim();
  let l1 = input.split("\n")[0];
  let l2 = input.split("\n")[1];
  let r = parseInt(l1.split(" ")[0]);
  let g = parseInt(l1.split(" ")[1]);
  let b = parseInt(l1.split(" ")[2]);
  let n = parseInt(l2);

  function hantei(){
    return(r<g && g<b);
  }
  
  function magic(){
    if(r>=g){
      g = g*2;
    }else if(g>=b){
      b = b*2
    }
  }
  
  for(i=0; i<n; i++){
    magic();
  }
  let answer = "";
  if(hantei()===true){
    answer = "Yes";
  }else{
    answer = "No";
  }
  console.log(answer);
}

//main(input);

main(require("fs").readFileSync("/dev/stdin","utf8"));