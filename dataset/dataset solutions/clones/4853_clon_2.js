// rawDataにはインプットデータが全て格納されています
function ProcessPrimary() {

    // for(let idx = 0; idx < rawData.length; idx++) console.log('Item: %s', rawData[idx]);

    let charSequence = fetchNextString();

    if (   transformChar(charSequence[0])  == charSequence[3]
        && transformChar(charSequence[1])  == charSequence[2]  )
    {
        printOutput("Yes");
    }
    else {
        printOutput("No");
    }
}

function transformChar(inputChar) {
    if ( inputChar == "d" ) return "b";
    if ( inputChar == "b" ) return "d";
    if ( inputChar == "p" ) return "q";
    if ( inputChar == "q" ) return "p"; // Corrected logic based on typical p/q transformation
}

// このルーチンは"実行"ボタンが押された際に呼び出されます (テスト目的)
let dataBuffer, tokenCounter;
function runDebugger() {
    dataBuffer = document.getElementById("input").value;

    // 配列dataBufferにトークンを順次代入
    dataBuffer = dataBuffer.replace( /\n/g , " " );
    dataBuffer = dataBuffer.split(" ");
    tokenCounter = 0;
    ProcessPrimary();
}

function printOutput(message) {
    console.log(message);
}

function fetchInteger() {
    return parseInt(fetchNextString(), 10);
}

function fetchFloat() {
    return parseFloat(fetchNextString());
}

function fetchNextString() {
    return dataBuffer[tokenCounter++];
}

// *この行以降のコードは変更しないでください（標準入力から一度に読み込み、メイン関数を呼び出します）
dataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
ProcessPrimary();