

process.stdin.setEncoding('utf-8');

process.stdin.on('data', function (data) {
    arr = data.replace(/\r?\n/g,"").split(" ")
    if(parseInt(arr[0]) == -1 && parseInt(arr[1]) == -1 && parseInt(arr[2]) == -1) process.exit() ;
    sum = (parseInt(arr[0]) == -1 ? 0 : parseInt(arr[0])) + (parseInt(arr[1]) == -1 ? 0 : parseInt(arr[1]));

    if (sum >= 80) console.log("A");
    else if(sum >= 65) console.log("B");
    else if(sum >= 50) console.log("C");
    else if(sum >= 30) {
      if (parseInt(arr[2]) >= 50) console.log("C");
      else console.log("D");
    }
    else console.log("F") ;

});

