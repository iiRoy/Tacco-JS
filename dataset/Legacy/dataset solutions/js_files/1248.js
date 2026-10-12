process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk){

var line = chunk.toString().split(' ').map(Number);

var r = Number(line[0]);

var enn = r * r * Math.PI;
var nagasa = 2 * r * Math.PI;

console.log(nagasa + ' '+ enn);
});