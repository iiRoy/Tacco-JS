// ledgerDataに入力データ全体が入る
function ProcessFinancialRecords(ledgerData) {
    // ledgerDataを改行で分割し、配列として処理
    const entrySegments = ledgerData.split("\n");

    // 最初の行からデータエントリの数を取得
    const entryCount = parseInt(entrySegments[0], 10);

    // BTCからJPYへの換算レートを定数として定義
    const currencyConversionRate = 380000.0;

    // 各通貨タイプを処理し、合計を蓄積するための関数を定義
    const aggregateAssets = (accumulator, currentEntryLine) => {
        const parts = currentEntryLine.split(' ');
        const figure = parts[0];
        const assetKind = parts[1];

        // 通貨タイプに応じた処理ロジックを格納するオブジェクト
        const currencyHandlers = {
            'JPY': (val) => ({ local: parseInt(val, 10), digital: 0 }),
            'BTC': (val) => ({ local: 0, digital: parseFloat(val) })
        };

        // 適切なハンドラを見つけて実行
        const { local, digital } = currencyHandlers[assetKind](figure);

        // 累計に加算
        return {
            localAssetTotal: accumulator.localAssetTotal + local,
            digitalAssetTotal: accumulator.digitalAssetTotal + digital
        };
    };

    // 最初の行を除いた、実際の取引データのみを処理
    const transactionRecords = entrySegments.slice(1, 1 + entryCount);

    // 初期値を設定し、reduceメソッドで全取引を合計
    const initialTotals = { localAssetTotal: 0, digitalAssetTotal: 0 };
    const finalTally = transactionRecords.reduce(aggregateAssets, initialTotals);

    // 最終的な合計金額を計算し出力
    const totalValueInLocalCurrency = finalTally.localAssetTotal + (finalTally.digitalAssetTotal * currencyConversionRate);
    console.log(totalValueInLocalCurrency);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、ProcessFinancialRecordsを呼び出します）
ProcessFinancialRecords(require("fs").readFileSync("/dev/stdin", "utf8"));