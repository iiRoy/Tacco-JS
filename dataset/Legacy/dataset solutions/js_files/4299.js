process.stdin.resume();
process.stdin.setEncoding('utf8');
var input_string = '';

process.stdin.on('data', function (chunk) {
    input_string += chunk;
});
const space_input = function (line) {
    var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    for (var i = 0; i < arr.length; ++i) {
        arr[i] = +arr[i];
    }
    return arr;
};
const space_input_char = function (line) {
    var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    for (var i = 0; i < arr.length; ++i) {
        arr[i] = arr[i];
    }
    return arr;
};

process.stdin.on('end', function () {
    const lines = input_string.split('\n');
    const wh = space_input(lines[0])
    const W = wh[0]
    const H = wh[1]
    const t = lines.slice(1).filter(v=>v.length>0).map(l=>l.split(""))
    let res = []
    let mawari = []
    for(let i=-1;i<=1;++i){
        for(let j=-1;j<=1;++j){
            if(i!=0||j!=0){
                mawari.push([i,j])
            }
        }
    }
    //console.log(mawari)
    for(let h=0;h<H;++h){
        for(let w=0;w<W;++w){
            if(t[h][w]==="."){
                let cnt=0
                for(let m of mawari){
                    //console.log(h+m[0])
                    if((h+m[0])<H&&0<=h+m[0] && ((w+m[1])<W)&&0<=w+m[1]){
                        if(t[h+m[0]][w+m[1]]==="#"){
                            cnt++
                        }
                    }
                }
                t[h][w]=cnt
            }
        }
        console.log(t[h].join(""))
    }
    
});