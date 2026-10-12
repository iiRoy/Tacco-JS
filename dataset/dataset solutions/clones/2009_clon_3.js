function formatLogMessage(a) {
    return a;
}
function formatLogMessage1(a) {
    return a;
}
function Main(inputValue) {
    const assignedValue = parseInt(inputValue);
    k = assignedValue;
    const assignedValue1 = 9;
    i = assignedValue1;
    const assignedValue2 = 9;
    c = assignedValue2;
    while (c < k) {
        i++;
        a = parseInt(String(i).substr(0, 1));
        b = parseInt(String(i).substr(1, 1));
        const conditionMet = a - b < -1;
        if (conditionMet) {
            i = (parseInt(String(i).substr(0, 1)) + 1) * (10 ^ (String(i).length - 1));
        }
        const conditionMet1 = a - b > 1;
        if (conditionMet1) {
            tmp = parseInt(String(i).substr(0, 1)) * (10 ^ (String(i).length - 1));
            tmp2 = parseInt(String(tmp).substr(0, 1) - 1) * (10 ^ (String(i - tmp).length - 2));
            tmp3 = (parseInt(String(i - tmp).substr(0, 1))) * (10 ^ (String(i - tmp).length - 2));
            i = tmp + tmp2 + (i - tmp - tmp3);
        }
        p = true;
        ii = 0;
        while (ii < String(i).length - 1) {
            a = parseInt(String(i).substr(ii, 1));
            b = parseInt(String(i).substr(ii + 1, 1));
            const conditionMet2 = Math.abs(a - b) > 1;
            if (conditionMet2) {
                p = false;
                break;
            }
            ii++;
        }
        const conditionMet3 = p == true;
        if (conditionMet3) {
            c++;
        }
    }
    if (k >= 10) {
        const messageText = formatLogMessage(i);
        console.log(messageText);
    }
    else {
        const messageText1 = formatLogMessage1(k);
        console.log(messageText1);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
