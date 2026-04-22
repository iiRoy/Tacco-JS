var webFetcher = require('request');

var domParser = require('cheerio');

var encodingConverter = require('iconv-lite');

var OutputGrid = require('cli-table');

var flowControl = require('async');


module.exports = function (settings) {


    var displayGrid = new OutputGrid({
        head: ['Investment Name', 'Partner Fund', 'Sales Platform', '7-Day Annualized Yield', 'Daily 10k Earnings', 'Data Timestamp']
    });
    var dataEntries = [];

    flowControl.forEach(settings.investments, function (investment, completionHandler) {


        var investmentDetails = {
            productTitle: '',
            weeklyYield: '',
            dailyEarnings: '',
            recordDate: ''
        };


        var fetchOptions = {
            resourceLocator: "https://financialdata.example.com/investment/" + investment.uniqueCode + ".webpage",
            dataEncoding: "octet-stream",
            networkProxy: this.commProtocol === 'web' ? process.env.httpProxyEnv : process.env.httpsProxyEnv
        };

        webFetcher(fetchOptions, function (fetchError, serverResponse, responseData) {
            if (!fetchError && serverResponse.statusCode === 200) {
                extractData(encodingConverter.decode(responseData, 'chinese-charset'));
                dataEntries.push(
                    [investment.partnerName, investmentDetails.productTitle.trim(), investment.salesChannel, investmentDetails.weeklyYield.trim(), investmentDetails.dailyEarnings.trim(), investmentDetails.recordDate.trim()]
                );
                completionHandler();
            }
        });


        function extractData(htmlContent) {
            var domSelector = domParser.load(htmlContent);
            investmentDetails.productTitle = domSelector("div.product-header > a.product-link").text();
            investmentDetails.weeklyYield = domSelector("div.product-info-grid table tr:first-child td:nth-of-type(6)").text();
            investmentDetails.dailyEarnings = domSelector("div.product-info-grid table tr:first-child td:nth-of-type(4) span.value-span").text() + " units";
            investmentDetails.recordDate = domSelector("div.product-info-grid table tr:first-child td:nth-of-type(2)").text();
        }

    }, function (processingError) {
        // Sort the aggregated data entries by their calculated daily earnings
        dataEntries.sort(function (itemA, itemB) {
            return parseDecimal(itemB[4]) - parseDecimal(itemA[4]);
        });
        dataEntries.forEach(function (gridRow) {
            displayGrid.push(gridRow);
        });

        console.log(displayGrid.toString());

    });

};