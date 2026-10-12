function main(input) {
    var input = input.split(' ')
    var n =parseInt(input[0],10)
    var a = parseInt(input[1],10)
    var b = parseInt(input[2],10)
    var array = new Array(parseInt(n,10))
    var sum = 0
    var result_array =[]
    var fin_sum=0

    for(var i=0; i<n;i++){
        array[i] = i+1
    }
    for(var j=0;j<n;j++){
        var tmp = array[j]
        while(tmp >0){
            sum += tmp%10
            tmp = Math.floor(tmp/10)
        }
        if(a<=sum && sum<=b){
            result_array.push(j)
        }
        sum = 0
    }
    for(var k=0; k<result_array.length; k++){
        fin_sum += array[result_array[k]]
    }
    console.log(fin_sum)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
