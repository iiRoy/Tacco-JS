const getWebResource = require('node-fetch');
const { JSDOM } = require('jsdom');
const { TextDecoder } = require('util');
const HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
const HttpProxyAgent = require('http-proxy-agent').HttpProxyAgent;

class GridFormatter {
    constructor(columnHeaders) {
        this.headers = columnHeaders;
        this.dataEntries = [];
        this.columnSizes = Array(columnHeaders.length).fill(0);
        this.recalculateSizes(columnHeaders);
    }

    recalculateSizes(entryRow) {
        entryRow.forEach((cellValue, cellIndex) => {
            this.columnSizes[cellIndex] = Math.max(this.columnSizes[cellIndex], String(cellValue).length);
        });
    }

    appendEntry(entry) {
        this.dataEntries.push(entry);
        this.recalculateSizes(entry);
    }

    produceRenderedOutput() {
        const dividerLine = (charSymbol) => this.columnSizes.map(w => charSymbol.repeat(w)).join(`-${charSymbol}-`);
        const formatEntryLine = (lineValues) => lineValues.map((cellValue, idx) => String(cellValue).padEnd(this.columnSizes[idx])).join(' | ');

        let finalOutput = '';
        finalOutput += formatEntryLine(this.headers) + '\n';
        finalOutput += dividerLine('-') + '\n';
        this.dataEntries.forEach(line => {
            finalOutput += formatEntryLine(line) + '\n';
        });
        return finalOutput;
    }
}

module.exports = async function(settingsBundle) {

    const gatheredResults = [];

    const itemProcessingTasks = settingsBundle.funds.map(async (investmentItem) => {

        const acquiredData = {
            productName: '',
            sevenDayYield: '',
            tenKReturn: '',
            valuationDate: ''
        };

        const targetResource = `http://fund.eastmoney.com/${investmentItem.code}.html`;
        const connectionSchema = targetResource.startsWith('https') ? 'https' : 'http';
        const networkAgentSource = connectionSchema === 'http' ? process.env.http_proxy : process.env.https_proxy;

        const requestConfiguration = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        if (networkAgentSource) {
            requestConfiguration.agent = connectionSchema === 'http' ? new HttpProxyAgent(networkAgentSource) : new HttpsProxyAgent(networkAgentSource);
        }

        try {
            const webPageResponse = await getWebResource(targetResource, requestConfiguration);
            if (webPageResponse.ok && webPageResponse.status === 200) {
                const rawContentBuffer = await webPageResponse.buffer();
                const decodedHtmlContent = new TextDecoder('gbk').decode(rawContentBuffer);

                const extractInformation = (htmlSource) => {
                    const domEnvironment = new JSDOM(htmlSource);
                    const documentRoot = domEnvironment.window.document;

                    acquiredData.productName = documentRoot.querySelector("div.bktit_new > a")?.textContent || '';
                    acquiredData.sevenDayYield = documentRoot.querySelector("div.bkinfo_new table tr:nth-child(1) td:nth-child(6)")?.textContent || '';
                    acquiredData.tenKReturn = documentRoot.querySelector("div.bkinfo_new table tr:nth-child(1) td:nth-child(4) span")?.textContent + "元" || '';
                    acquiredData.valuationDate = documentRoot.querySelector("div.bkinfo_new table tr:nth-child(1) td:nth-child(2)")?.textContent || '';
                };
                
                extractInformation(decodedHtmlContent);

                gatheredResults.push(
                    [
                        investmentItem.bao,
                        acquiredData.productName.trim(),
                        investmentItem.platform,
                        acquiredData.sevenDayYield.trim(),
                        acquiredData.tenKReturn.trim(),
                        acquiredData.valuationDate.trim()
                    ]
                );
            }
        } catch (dataFetchError) {
            // Unsuccessful fetches will simply not add to gatheredResults,
            // replicating the original's behavior of only processing successful responses.
        }
    });

    await Promise.all(itemProcessingTasks);

    gatheredResults.sort((firstItem, secondItem) => {
        return parseFloat(secondItem[4]) - parseFloat(firstItem[4]);
    });

    const finalDisplayGrid = new GridFormatter([
        '产品名称', '合作基金', '发售平台', '7日年化收益率', '万份收益', '数据日期'
    ]);

    gatheredResults.forEach((entry) => {
        finalDisplayGrid.appendEntry(entry);
    });

    console.log(finalDisplayGrid.produceRenderedOutput());
};