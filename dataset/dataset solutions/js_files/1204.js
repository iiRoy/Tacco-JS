process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(x){
var input = x
console.log(Math.pow(input , 3))
})