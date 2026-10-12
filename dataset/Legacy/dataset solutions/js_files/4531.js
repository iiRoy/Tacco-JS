function Main(input) {
    input = input.split("\n");
    var people_num = Number(input[0]);
    var scores = input[1].split(' ');
    var ary = [];
    var pro = 0;
    var any = 0
    for(var i = 0; i < scores.length; i++){
        scores[i] = Number(scores[i]);
        pro = Math.floor(scores[i] / 400);
        if(pro >= 8){
            any++;
        }else{
            ary.push(pro);
        }
    }
    var united = ary.filter(function(a,b,c){
        return c.indexOf(a) === b;
    });
    console.log(united);
    if(united[0]){
        console.log(united.length + ' ' + (united.length + any));
    } else {
        console.log(1 + ' ' + any);
    }

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));