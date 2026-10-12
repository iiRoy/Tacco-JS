process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {

var line = chunk.split(' ').map(Number);
var H = Number(line[0]);
var W = Number(line[1]);

if(H === 0 && W === 0){break};


for(var i = 0; i < H; i++){
for(var j = 0; j < W; j++){
 console.log('#');
}
console.log("\n");
}
console.log("\n");
});