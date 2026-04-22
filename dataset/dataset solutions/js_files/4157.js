function foo(arr) {
    var a = [], b = [], prev;
    
    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }
    
    return [a, b];
}

function Main(input) {
	input = input.split("\n");
	
	var N = parseInt(input[0], 10);
	var array = input[1].split(" ");
	array.forEach((elem, index, array) => array[index] = parseInt(elem, 10));
	
	result = foo(array);
	
	var count = 0;
	
	for(var i=0; i<result[0].length; i++) {
		var num = result[0][i];
		var countOfNum = result[1][i];
		if(num != countOfNum) {
			if(num < countOfNum) {
				//数を減らせばいける
				count += countOfNum - num;
			}
			if(num > countOfNum) {
				//救いはないね♂
				count += countOfNum;
			}
		}
	}
	
	console.log(count);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));