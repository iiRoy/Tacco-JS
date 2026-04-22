c=console.log
l=require('fs').readFileSync(0,'utf8').split('\n')
n=l[0].split(' ').map(Number)
h=n[0]
w=n[1]
d='#'.repeat(w+2)
c(d)
for(i=1;i<=h;){c(`#${l[i++]}#`)}
c(d)