function main(input){
    var hen = [0,0];
    var tmp = input.split('\n');
    var A = tmp[1].split(' ');

    A.sort(function(a,b){return b - a;});

    var j=0;
    for(var i=0; i<A.length-1 && j<2; i++){
        if(A[i]==A[i+1]){
            hen[j]=A[i];
            i++;
            j++;
        }
    }

    //console.log(A);
    console.log(hen[0]*hen[1]);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));