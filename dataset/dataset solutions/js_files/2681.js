function main(input) {
    const args = input.split('\n');
    const N = args[0];
    const H = args[1].split(' ');
    var flag = 'Yes';
    var jadge = false;
    var array = [];

    for (var k=0; k < N ; k++) {
        array.push(parseInt(H[k], 10));
    }

    if(array[0] > 0) {
        array[0] = array[0] - 1;
    }

    for(var i = 1; i < N ; i++) {

        if( array[i-1] < array[i] ){
            flag = 'Yes';
            array[i] = array[i] - 1;
        } else if (array[i-1] === array[i]) {
            flag = 'Yes';
        } else {
            if(array[i-1] - array[i] === 1) {
                flag = 'Yes';
            } else {
                flag = 'No';
            }
        }
        if (flag === 'No' ) break;
    }

    array.map((res) => {
        console.log(res);
    });

    console.log(flag);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));