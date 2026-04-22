function frequency(s) {
    var freq = new Array(26).fill(0);
    for (var i = 0; i < s.length; i++) {
        var index = s[i].charCodeAt() - "a".charCodeAt();
        freq[index]++;
    }
    return freq;
}

function freqMatch(freq1, freq2) {
    for (var i = 0; i < 26; i++) {
        freq1[i] = Math.min(freq1[i], freq2[i]);
    }
    return freq1;
}

function Main(input) {
    input = input.split("\n");
    var n = parseInt(input[0], 10);
    var strings = input.slice(1, n+1);
    var freq1 = frequency(strings[0]);
    for (var i = 1; i < strings.length; i++) {
        var freq2 = frequency(strings[i]);
        freq1 = freqMatch(freq1, freq2);
    }
    res = "";
    for (var i = 0; i < 26; i++) {
        for (var j = 0; j < freq1[i]; j++) {
            res += String.fromCharCode(i+"a".charCodeAt());
        }
    }
    console.log(res);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));