(function () {
  var input = '';

  function main () {
    var i, len, n, inputNum, nums, numAry = [], result = '';

    len = +input[0];
    inputNum = input[1];
    nums = inputNum.split(' ');

    for (i = 0; i < len; i += 1) {
      numAry.push(parseInt(nums[i], 10));
    }

    quickSort(numAry, 0, len - 1);

    for (i = 0; i < len; i += 1) {
      if (i != len - 1) {
        result += numAry[i] + ' ';
      } else {
        result += numAry[i];
      }
    }
    console.log(result);
  }

  function quickSort (numArray, left, right) {
    var pr,pl, pivot, temp;

    if (left < right) {
      pl = left;
      pr = right;
      pivot = getMedian(numArray[pl], numArray[pr], numArray[(pl + pr) / 2]);

      do {
        while (numArray[pl] < pivot) {
          pl += 1;
        }

        while (numArray[pr] > pivot) {
          pr -= 1;
        }

        if (pl >= pr) {
          break;
        } else {
          temp = numArray[pl];
          numArray[pl] = numArray[pr];
          numArray[pr] = temp;

          pl += 1;
          pr -= 1;
        }
      } while (pl <= pr);

      quickSort(numArray, left, pl - 1);
      quickSort(numArray, pr + 1, right);
    }
  }

  function getMedian (x, y, z) {
    return (x <= y) ? ((y <= z) ? y : ((x < z) ? z : x)) : ((x <= z) ? x : ((y < z) ? z: y));
  }
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    input += chunk;
  });

  process.stdin.on('end', function () {
    input = input.split('\n');
    main();
  });

}());