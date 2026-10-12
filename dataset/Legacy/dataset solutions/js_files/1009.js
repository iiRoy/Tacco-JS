function checkStable(arr) {

}
function bubbleSort(lgh, arr) {
  var flag = 1;
  var count = 0;
  while(flag) {
    flag = 0;
    for(let i = 0; i < lgh-1; i++) {
      if(Number(arr[i][1]) > Number(arr[i+1][1])) {
        [arr[i], arr[i+1]] = [arr[i+1], arr[i]];
        flag = 1;
        count++;
      }
    }
  }
  console.log(arr.join(" "));
  return "Stable";
}
function selectionSort(lgh, arr) {
  var count = 0;
  for(let i = 0; i < lgh-1; i++) {
    var tmp = i;
    for(let j = i; j < lgh; j++) {
      if(Number(arr[j][1]) < Number(arr[tmp][1])) {
        tmp = j;
      }
    }
    if(i != tmp) {
      [arr[i], arr[tmp]] = [arr[tmp], arr[i]];
      count++;
    }
  }
  console.log(arr.join(" "));
}
function Main(input) {
  var [a, b] = input.split("\n");
  s = b.split(" ");
  b = b.split(" ");
  console.log(bubbleSort(a, b));
  selectionSort(a, s);
  console.log(s.join() === b.join() ? "Stable" : "Not stable");
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

