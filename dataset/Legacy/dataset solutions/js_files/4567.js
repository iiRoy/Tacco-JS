function Main(input){
    var [x,y] = input.split(" ").map(Number);
    var min = Number.MAX_SAFE_INTEGER;
{
    var arr = [0,0,0];
    arr[0] = Math.floor(x/3)*y
    var p = Math.ceil(x/3*2);
    arr[1] = p*Math.ceil(y/2);
    arr[2] = p*Math.floor(y/2);
    //console.log(arr)
    min = Math.min(Math.max.apply(null,arr)-Math.min.apply(null,arr));
}
{
    var arr = [0,0,0];
    arr[0] = Math.ceil(x/3)*y
    var p = Math.floor(x/3*2);
    arr[1] = p*Math.ceil(y/2);
    arr[2] = p*Math.floor(y/2);
   // console.log(arr)
    min = Math.min(Math.max.apply(null,arr)-Math.min.apply(null,arr));
}
x = y + (y=x,0);
{
    var arr = [0,0,0];
    arr[0] = Math.floor(x/3)*y
    var p = Math.ceil(x/3*2);
    arr[1] = p*Math.ceil(y/2);
    arr[2] = p*Math.floor(y/2);
   // console.log(arr)
    min = Math.min(Math.max.apply(null,arr)-Math.min.apply(null,arr));
}
{
    var arr = [0,0,0];
    arr[0] = Math.ceil(x/3)*y
    var p = Math.floor(x/3*2);
    arr[1] = p*Math.ceil(y/2);
    arr[2] = p*Math.floor(y/2);
   // console.log(arr)
    min = Math.min(Math.max.apply(null,arr)-Math.min.apply(null,arr));
}
{
    if(x%3==0){
        min = 0;
    }else{
        min = Math.min(min,y)
    }
}
{
    if(y%3==0){
        min = 0;
    }else{
        min = Math.min(min,x)
    }
}
console.log(min)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
