var input=require('fs').readFileSync('/dev/stdin','utf8')
var lines=input.split('\n')
var h=parseInt(lines.shift().split(' ')[0])
var dist=[...Array(10)].map(()=>lines.shift().split(' ').map(v=>parseInt(v,10)))
var counts=new Array(10).fill(0)
for(var i=0;i<h;i++){lines.shift().split(' ').map(v=>parseInt(v,10)).forEach(v=>counts[v]++)}
for(var k=0;k<10;++k){for(var i=0;i<10;++i){for(var j=0;j<10;++j){dist[i][j]=Math.min(dist[i][j],dist[i][k]+dist[k][j])}}}
console.log([...Array(10).keys()].reduce((p,c)=>p+counts[c]*dist[c][1],0))