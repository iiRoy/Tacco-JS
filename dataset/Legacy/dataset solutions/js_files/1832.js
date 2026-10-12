function Main(input){   
    let arr = input.split('');
    let num = 0;
    while(true){
        num = arr.indexOf('?');
        arr[num] = 'D';
        if(num == -1){
          break;
        }
    }
    let answer = '';
    arr.map(a => answer += a);
    console.log(answer);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));