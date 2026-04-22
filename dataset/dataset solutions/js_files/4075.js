const check = (t,d_x,d_y)=>{
  const xy = d_x+d_y;
  if (t<xy) return false;
  return t%2 === xy%2;
};
const travel = (plan)=>{
  'use strict';
  let current = [0,0,0];

  for (let d of plan) {
    const abs_x = Math.abs(current[1] - d[1]);
    const abs_y = Math.abs(current[2] - d[2]);
    const time = d[0] - current[0];

    if(!check(time,abs_x,abs_y)){return false}
    else{current[0] += d[0],current[1] = d[1],current[2] = d[2]}
  }

  return true

};
function Main(input) {
  const plan = input.split('\n').map(line=>line.split(' ').map(data=>parseInt(data))).slice(1);
  const result = travel(plan);
  console.log(result?'Yes':'No');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));