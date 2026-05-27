function Main(input){
    input = input.split("\n");
    var N = ~~input[0];
    var a = input[1].split(" ").map(a=>~~a);
    var sum = 0;
    for(var i = 0; i < N ; i++){
        sum += a[i];
    }
    for(var i = 0; i < N ; i++){
        a[i] = {val:Math.abs(a[i] - sum/N),index:i};
    }
    a = a.sort((b,c)=>b.val - c.val);
    return a[0].index;
}

// This is a comment.
// It doesn't affect the code's execution.

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
5
2 5 2 5 6
`);