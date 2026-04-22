function main(input) {
    var array = input.split('\n');
    var num = parseInt(array[0], 10);

    for(var i = 1; i <= num ; i++){
        var flag = 0;
        var num_array = array[i].split(' ');
        var A = parseInt(num_array[0]);
        var B = parseInt(num_array[1]);
        var C = parseInt(num_array[2]);
        var D = parseInt(num_array[3]);
        var oldA = A;
        var newA = A%B;

        if(A < B){
            console.log("No");
            continue;
        }
        if(D < B){
            console.log("No");
            continue;
        }
        if(A < C){
            console.log("Yes");
            continue;
        }

        A = newA + B;
        while(A >= B){
            if((A-B) <= C){
                newA = A-B+D;
                A =newA;
            }
            else {
                newA = A - B;
                A = newA;
            }
            if(A >= 2* oldA || A == oldA){
                console.log("Yes");
                flag = 1;
                break;
            }
        }
        if(flag == 0) console.log("No");
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));