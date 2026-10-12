var main = function(input){
input = input.split('\n');
var N = input.shift();
var S = input.join();
var w;//west
var w_sub;
var e;//east
var e_sub;
var count;
var count_min=3*100000;
for(var i=0;i<N;i++){
w = S.slice(0,i);
e = S.slice(i+1,N);
w_sub = w.split('W').join('');
e_sub = e.split('E').join('');
count = (w.length - w_sub.length)+(e.length - e_sub.length);
if(count === 0 || count === -0){
    count_min = 0;
    break;
} else if(count < count_min){
    count_min = count;
} 
}
    console.log(count_min);
    return 0;
  
}
main(require("fs").readFileSync("/dev/stdin", "utf8").trim());