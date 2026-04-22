const nameService = require('dns');
const rankLookup = require('alexarank');
const NumberFormatter = Intl.NumberFormat;
const GridRenderer = require('cli-table');

const analyzeWebHosts = async (settings) => {
    const hostIdentities = settings.targetList;

    const processSingleHost = async (hostIdentifier) => {
        const entryData = {
            nameServers: [],
            ipAddressV4: [],
            ipAddressV6: [],
            alexaRanking: ''
        };

        // Retrieve Alexa Traffic Rank
        const alexaResultPromise = new Promise(resolve => {
            rankLookup(hostIdentifier, (issue, outcome) => {
                if (!issue && outcome && outcome.rank) {
                    resolve(new NumberFormatter().format(outcome.rank));
                } else {
                    resolve(''); // Resolve with empty string on error or no rank
                }
            });
        });
        entryData.alexaRanking = await alexaResultPromise;

        // Retrieve Name Servers
        const nsRecordsPromise = new Promise(resolve => {
            nameService.resolveNs(hostIdentifier, (issue, records) => {
                resolve(issue ? [] : records);
            });
        });
        entryData.nameServers = await nsRecordsPromise;

        // Retrieve IPv4 Addresses
        const ipv4RecordsPromise = new Promise(resolve => {
            nameService.resolve4(hostIdentifier, (issue, records) => {
                resolve(issue ? [] : records);
            });
        });
        entryData.ipAddressV4 = await ipv4RecordsPromise;

        // Retrieve IPv6 Addresses
        const ipv6RecordsPromise = new Promise(resolve => {
            nameService.resolve6(hostIdentifier, (issue, records) => {
                resolve(issue ? [] : records);
            });
        });
        entryData.ipAddressV6 = await ipv6RecordsPromise;

        return {
            hostIdentifier,
            nameServers: entryData.nameServers.join('\n'),
            ipAddressV4: entryData.ipAddressV4.join('\n'),
            ipAddressV6: entryData.ipAddressV6.join('\n'),
            alexaRanking: entryData.alexaRanking
        };
    };

    const hostDataPromises = hostIdentities.map(processSingleHost);
    const allHostResults = await Promise.all(hostDataPromises);

    const displayGrid = new GridRenderer({
        head: ['Host', 'NS_Records', 'IP_v4', 'IP_v6', 'AlexaRank']
    });

    const gridRows = allHostResults.map(entry => [
        entry.hostIdentifier,
        entry.nameServers,
        entry.ipAddressV4,
        entry.ipAddressV6,
        entry.alexaRanking
    ]);

    gridRows.sort((firstEntry, secondEntry) => {
        const hostA = firstEntry[0].toLowerCase();
        const hostB = secondEntry[0].toLowerCase();
        if (hostA < hostB) return -1;
        if (hostA > hostB) return 1;
        return 0;
    });

    displayGrid.push(...gridRows);

    console.log(displayGrid.toString());
};

module.exports = analyzeWebHosts;