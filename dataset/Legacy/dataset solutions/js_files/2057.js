var minCount =1000;
var status;
function Main(input) {
    input = input.trim();
    input = input.split("\n")
    var a = input[0].split(" ");
    status = input.slice(1,input.length);    
    status = status.map(e=>{
        return e.split('')
    })

    
    func([0,0],[parseInt(a[0])-1,parseInt(a[1])-1],0);

    console.log(minCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

function func(now, end, count){
    var y = now[0]
    var x = now[1]    
if(status[y][x] != "."){        
    count++;
    if(count>minCount)return;
}
    if(y == end[0] && x == end[1]){
        if(count<minCount)minCount=count
        return;
    }else if(y == end[0]){
        func([y,x+1],end,count)
    }else if(x == end[1]){
        func([y+1,x],end,count)
    }else{
        var next1 =status[y][x+1]
        var next2 =status[y+1][x]
        
        if(next1 == "#" && next2 =="."){
            func([y+1,x],end,count)
        }else if(next1 == "." && next2 =="#"){
            func([y,x+1],end,count)
            
        }else{
            func([y,x+1],end,count)
            func([y+1,x],end,count)
        }
    }    
}