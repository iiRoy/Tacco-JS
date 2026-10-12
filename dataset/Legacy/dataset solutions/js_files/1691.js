//let input = "6\nAC\nTLE\nAC\nAC\nWA\nTLE";

//Si は AC, WA, TLE, RE のいずれか

function main(input){
  input = input.trim();
  let list = input.split("\n");
  let caseL = ["AC","WA","TLE","RE"];
  let nl = [0,0,0,0];
  for(let i=1; i<list.length; i++){
    if(list[i]===caseL[0]){
      nl[0]++;
    }else if(list[i]===caseL[1]){
      nl[1]++;
    }else if(list[i]===caseL[2]){
      nl[2]++;
    }else if(list[i]===caseL[3]){
      nl[3]++;
    }
  }
  //AC x 3
  for(let i=0; i<caseL.length; i++){
    console.log(caseL[i]+" x "+nl[i]);
  }
}//main(input);

main(require("fs").readFileSync("/dev/stdin","utf8"));
