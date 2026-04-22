function main(input) {
    var array = input.split('\n');
    var string1=array[0].split('');
    var string2=array[1].split('');
    var flag = 0;

    if(string1.toString() == string2.toString()) flag = 1;
    else{
        for(var i = 0; i < string1.length-1; i++){
            var last = string1[string1.length-1];
            string1.pop();
            string1.unshift(last);
            if(string1.toString() == string2.toString()){
                flag =1;
                break;
            }
        }
    }

    if(flag == 1) console.log('Yes');
    else console.log('No');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));