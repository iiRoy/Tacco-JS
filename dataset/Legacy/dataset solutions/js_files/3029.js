var main = standardInput => {
  var ary = standardInput.split(" ");
  ary = ary.map((v)=>{
    return parseInt(v,10);
})
  if (ary[0] < ary[2] && ary[2] < ary[1]) {
    console.log("Yes");
  } else if (ary[0] > ary[2] && ary[2] > ary[1]) {
    console.log("Yes");
  } else {
    console.log("No");
  }
};
main(require("fs").readFileSync("/dev/stdin", "UTF-8"));