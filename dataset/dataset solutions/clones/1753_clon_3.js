/*
-------関数一覧--------
arr1dto2d(Array) 一次元配列を二次元配列にします
pf(N)素因数分解した結果をオブジェクトで返します
gcd(a,b)最大公約数を返します
lcm(a,b)最小公倍数を返します
num(a,b)a-bを返します。ソート用です
isPrime(n)素数かどうか真偽値で返します
isNumber(n)数かどうか真偽値で返します
arrsum(arr)配列の合計値を返します
nibu(arr,n)n以下で最も大きい数の添字を返します(nを含みます)
br(input)入力を改行で区切ります
*/
const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;
const mod = 1000000007;

function Main(inputData) {
    inputData = inputData.split("\n");

    var numberList = inputData[1].split(" ").map(Number);
    var xorTotal = 0;
    var cloneTypeThreeMarker = true;

    numberList.forEach(function (currentValue) {
        xorTotal = xorTotal ^ currentValue;
    });

    var outputValues = [];
    numberList.forEach(function (currentValue) {
        var answerValue = xorTotal ^ currentValue;
        outputValues.push(answerValue);
        console.log(answerValue);
    });
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function pow(a, b) {
    var ans = 0;
    for (var i = 0n; i < b; i += 1n) {
        if (ans == 0) {
            ans = a;
        } else {
            ans *= a;
        }
    }
    return a;
}

function zisyozyunn(a) {
    var arr = [];
    for (var i = 0; i < input[0]; i++) {
        arr.push(i + 1);
    }
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
        var f = arr.findIndex(val => val == a[i]);
        sum += factorialize(a.length - 1 - i) * f;
        arr.splice(f, 1);
    }
    return sum;
}

function arrsum(arr) {
    var sum = 0;
    for (var i = 0, len = arr.length; i < len; ++i) {
        sum += arr[i] - 0;
    }
    return sum;
}

function debug(val) {
    if (debugMode == true) {
        console.log(val);
    }
}

function arrMaxPoint(arr) {
    var max = Number.MIN_SAFE_INTEGER;
    var point = -1;
    for (var i = 0; i < arr.length; i++) {
        if (max < arr[i]) {
            max = arr[i];
            point = i;
        }
    }
    return point;
}

function arrMinPoint(arr) {
    var min = Number.MAX_SAFE_INTEGER;
    var point = -1;
    for (var i = 0; i < arr.length; i++) {
        if (min > arr[i]) {
            min = arr[i];
            point = i;
        }
    }
    return point;
}

function isPrime(n) {
    if (false === Number.isInteger(n)) {
        return false;
    }
    if (n <= 1) {
        return false;
    }
    if (2 === n) {
        return true;
    }
    if (0 === n % 2) {
        return false;
    }
    var square_root = Math.floor(Math.sqrt(n));
    for (var i = 3; i <= square_root; i += 2) {
        if (0 === n % i) {
            return false;
        }
    }
    return true;
}

function isNumber(val) {
    const pat = /^([1-9]\d*|0)$/;
    return pat.test(val);
}

function factorialize(num) {
    if (num === 0) {
        return 1;
    }
    return num * factorialize(num - 1);
}

function arr1dto2d(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].split(" ").map(Number);
    }
    return arr;
}

function rotate(array) {
    const ROW = array.length;
    const COL = array[0].length;
    const row = ROW - 1;
    var a = new Array(COL);

    for (var c = 0; c < COL; c++) {
        a[c] = new Array(ROW);
        for (var r = 0; r < ROW; r++) {
            a[c][r] = array[row - r][c];
        }
    }
    return a;
}

function part_in(base, push, st) {
    for (var i = st, p = 0; p < push.length; i++, p++) {
        base[i] = push[p];
    }
    return base;
}

function part_reverse(arr, s, g) {
    var push = arr.slice(s - 1, g);
    push.reverse();
    arr = part_in(arr, push, s - 1);
    return arr;
}

function zeroPadding(num, length) {
    return (num + '000000000000000000000000000000000').slice(0, length);
}

function arrsum(arr) {
    var sum = 0;
    for (var i = 0, len = arr.length; i < len; ++i) {
        sum += arr[i] - 0;
    }
    return sum;
}

function pf(n) {
    var result = {};

    if (n === 1) {
        return { "1": 1 };
    }

    var init = 2;

    while (n !== 1) {
        var i = init;
        while (i < Number.MAX_SAFE_INTEGER) {
            if (n % i === 0) {
                n /= i;
                if (!(result[i] > 0)) {
                    result[i] = 0;
                }
                result[i]++;
                break;
            }
            i++;
        }
        init = i;
    }
    return result;
}

function gcd(a, b) {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

function lcm(a, b) {
    var g = (n, m) => m ? g(m, n % m) : n;
    return a * b / g(a, b);
}

function num(a, b) {
    return a - b;
}

function nibu(a, searchValue) {
    var index = -1;
    var left = 0;
    var right = a.length - 1;

    while (left <= right) {
        middle = Math.floor((left + right) / 2);

        if (a[middle] == searchValue) {
            index = middle;
            break;
        } else if (a[middle] < searchValue) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }

    if (index != -1) return index;
    else return left;
}

function br(input) {
    return input.split("\n");
}

function is_sortred(arr) {
    var flag = true;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) {
            flag = false;
            break;
        }
    }
    return flag;
}

function primeFactorization(n) {
    var s = Math.floor(Math.sqrt(n));
    var r = 0;
    var result = {};

    for (var i = 2; i <= s; i++) {
        if ((n % i) == 0) {
            r = 0;

            do {
                r++;
                n = n / i;
            } while ((n % i) == 0);

            result[i] = r;
        }
    }

    if (n > s) {
        result[n] = 1;
    }

    return result;
}