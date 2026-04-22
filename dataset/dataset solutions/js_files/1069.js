let inputString = '';

process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});
process.stdin.on('end', function() {
    inputString = inputString.replace(/\s*$/, '')
        .split('\n')
        .map(str => str.replace(/\s*$/, ''));

    proc(inputString[1].split(' ').map(str => Number(str)));
});

const proc = (nums) => {
  const index = partition(nums, 0, nums.length - 1);
  console.log(
    nums
      .map((num, i) => i === index ? `[${num}]` : String(num))
      .join(' ')
  );
};

const partition = (arr, p, r) => {
  const x = arr[r];
  let i = p - 1;
  for (let j=p; j<r; j++) {
    if (arr[j] <= x) {
      i = i + 1;
      const needToBeInLeft = arr[j];
      const needToBeInRight = arr[i];
      arr[i] = needToBeInLeft;
      arr[j] = needToBeInRight;
    }
  }
  const needToBeInRight = arr[r];
  const needToBeInLeft = arr[i + 1];
  arr[i+1] = needToBeInRight;
  arr[r] = needToBeInLeft;
  return i + 1;
};

