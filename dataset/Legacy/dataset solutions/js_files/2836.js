function Main(input) {
    var result;
    const N = parseInt(input.shift());
    const XYD = input;

    var L_xmin = Number.MAX_SAFE_INTEGER,
        L_xmax = Number.MIN_SAFE_INTEGER,
        LR_ymin = Number.MAX_SAFE_INTEGER,
        LR_ymax = Number.MIN_SAFE_INTEGER,
        R_xmin = Number.MAX_SAFE_INTEGER,
        R_xmax = Number.MIN_SAFE_INTEGER,
        UD_xmin = Number.MAX_SAFE_INTEGER,
        UD_xmax = Number.MIN_SAFE_INTEGER,
        U_ymin = Number.MAX_SAFE_INTEGER,
        U_ymax = Number.MIN_SAFE_INTEGER,
        D_ymin = Number.MAX_SAFE_INTEGER,
        D_ymax = Number.MIN_SAFE_INTEGER;

    var hasL = false, hasR = false, hasU = false, hasD = false;

    for (var i = 0; i < N; i++) {
        var x = parseInt(input[i * 3]);
        var y = parseInt(input[i * 3 + 1]);
        var st = input[i * 3 + 2];

        switch (st) {
            case "L":
                L_xmin = Math.min(L_xmin, x);
                L_xmax = Math.max(L_xmax, x);
                LR_ymin = Math.min(LR_ymin, y);
                LR_ymax = Math.max(LR_ymax, y);
                hasL = true;
                break;
            case "R":
                R_xmin = Math.min(R_xmin, x);
                R_xmax = Math.max(R_xmax, x);
                LR_ymin = Math.min(LR_ymin, y);
                LR_ymax = Math.max(LR_ymax, y);
                hasR = true;
                break;
            case "U":
                UD_xmin = Math.min(UD_xmin, x);
                UD_xmax = Math.max(UD_xmax, x);
                U_ymin = Math.min(U_ymin, y);
                U_ymax = Math.max(U_ymax, y);
                hasU = true;
                break;
            case "D":
                UD_xmin = Math.min(UD_xmin, x);
                UD_xmax = Math.max(UD_xmax, x);
                D_ymin = Math.min(D_ymin, y);
                D_ymax = Math.max(D_ymax, y);
                hasD = true;
                break;
            default:
                break;
        }
    }

    var sum = Number.MAX_SAFE_INTEGER;
    var loop = true;
    while (loop) {
        var minX = Math.min(R_xmin, L_xmin, UD_xmin);
        var maxX = Math.max(R_xmax, L_xmax, UD_xmax);
        var minY = Math.min(LR_ymin, U_ymin, D_ymin);
        var maxY = Math.max(LR_ymax, U_ymax, D_ymax);

        sum = Math.min(sum, (maxX - minX) * (maxY - minY));

        loop = !(
            (minX == L_xmin || !hasL) &&
            (maxX == R_xmax || !hasR) &&
            (minY == D_ymin || !hasD) &&
            (maxY == U_ymax || !hasU)
        )

        L_xmin--;
        L_xmax--;
        R_xmin++;
        R_xmax++;
        U_ymin++;
        U_ymax++;
        D_ymin--;
        D_ymax--;
    }
    console.log(sum);
}

// 1行入力の場合
// Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// 改行で分割
// Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));

// 改行・空白で分割
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));