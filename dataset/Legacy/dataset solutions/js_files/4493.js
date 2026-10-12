var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk)=> {
    input += chunk;
});
process.stdin.on('end', ()=> {
    var text = input.split("\n")[0].slice(0,-1);
    //console.log(text);
    var herftext = text.slice(0,-Math.floor(text.length/2));
    var ary=[];
    var ary2=[];
    while(herftext.length!=2){
        ary.push(check(text,herftext));
        ary2.push(herftext);
        herftext = herftext.slice(0,-1);
    }
    var max = Math.max.apply(null,ary);
    console.log(ary2[ary.indexOf(max)].length*max);
});
function check(str,pat){
    var u=0;
    while(str.slice(u*pat.length,u*pat.length+pat.length)==pat){
        u++;
    }
    return u;
}