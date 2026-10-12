AtCoder Beginner Contest 128
 日本語 
 zatsuzatsu (Guest) 
コンテスト時間: 2019-05-26(日) 21:00 ~ 2019-05-26(日) 22:40 AtCoderホームへ戻る
 トップ
 問題
 質問
 提出
 提出一覧
 順位表
 コードテスト
 解説
提出 #5892446

ソースコード 

Copy
Copy
function Main(input) {
    var dataList = input.split("\n");
    dataList.shift();
    dataList.pop();
    var restaurants = dataList.map((data, index) => {
        var tmp = data.split(" ")return { index: index + 1, city: tmp[0], score: parseInt(tmp[1]) }});
    restaurants.sort(function(a, b) {
        if (a.city < b.city) return -1if (a.city > b.city) return 1if (a.score < b.score) return 1if (a.score > b.score) return -1});
    restaurants.forEach(restaurant => {
        console.log(restaurant.index);
    });
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
function Main(input) {
    var dataList = input.split("\n");
    dataList.shift();
    dataList.pop();
    var restaurants = dataList.map((data, index) => {
        var tmp = data.split(" ")return { index: index + 1, city: tmp[0], score: parseInt(tmp[1]) }});
    restaurants.sort(function(a, b) {
        if (a.city < b.city) return -1if (a.city > b.city) return 1if (a.score < b.score) return 1if (a.score > b.score) return -1});
    restaurants.forEach(restaurant => {
        console.log(restaurant.index);
    });
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
提出情報
提出日時	2019-06-13 03:21:33
問題	B - Guidebook
ユーザ	zatsuzatsu 
言語	JavaScript (node.js v5.12)
得点	200
コード長	727 Byte
結果	
実行時間	55 ms
メモリ	7500 KB
テストケース
セット名	得点 / 配点	テストケース
Sample	0 / 0	01.txt, 02.txt
All	200 / 200	01.txt, 02.txt, 11.txt, 12.txt, 13.txt, 14.txt, 15.txt
ケース名	結果	実行時間	メモリ
01.txt		53 ms	7372 KB
02.txt		53 ms	7372 KB
11.txt		53 ms	7372 KB
12.txt		53 ms	7372 KB
13.txt		52 ms	7372 KB
14.txt		55 ms	7500 KB
15.txt		55 ms	7500 KB
FacebookTwitterHatena共有
ルール 用語集
利用規約 プライバシーポリシー 個人情報保護方針 企業情報 よくある質問 お問い合わせ 資料請求
Copyright Since 2012 ©AtCoder Inc. All rights reserved.