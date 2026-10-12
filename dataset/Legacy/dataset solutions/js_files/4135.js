function main(input) {
    var N = input[0].split(" ")[0]-0;
    var a = input[0].split(" ")[1]-0;
    var b = input[0].split(" ")[2]-0;
  var ans = 0;
  for(var i=1;i<=N;i++){
    var sum = i.toString().split("").reduce((a,b)=>(a-0)+(b-0));
    if(a<=sum && b>=sum) ans += i;
  }
  console.log(ans);
    
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))