const { fetch } = require('undici');

const obtainMediaLink = async (requestDetails, completionHandler) => {
    const agentProfiles = new Map([
        ['android', 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-gb; GT-I9003 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'],
        ['default', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.14 (KHTML, like Gecko) Version/6.0.1 Safari/536.26.14']
    ]);

    const userAgentString = agentProfiles.get(requestDetails.os) || agentProfiles.get('default');

    const requestHeaders = {
        'User-Agent': userAgentString,
        'Referer': `http://www.youtube.com/watch?v=${requestDetails.videoId}`
    };

    const serviceEndpoint = new URL('https://m.youtube.com/watch');
    serviceEndpoint.searchParams.append('ajax', '1');
    serviceEndpoint.searchParams.append('layout', 'mobile');
    serviceEndpoint.searchParams.append('tsp', '1');
    serviceEndpoint.searchParams.append('utcoffset', '330');
    serviceEndpoint.searchParams.append('v', requestDetails.videoId);

    try {
        const networkResponse = await fetch(serviceEndpoint.toString(), {
            method: 'GET',
            headers: requestHeaders
        });

        if (!networkResponse.ok) {
            return completionHandler(`HTTP response not successful: ${networkResponse.statusText}`);
        }

        const rawContentString = await networkResponse.text();
        let processedPayload;
        try {
            processedPayload = JSON.parse(rawContentString.substring(4));
        } catch (jsonParsingIssue) {
            return completionHandler(`JSON parsing failed: ${jsonParsingIssue.message}`);
        }

        if (processedPayload && processedPayload.content && processedPayload.content.video) {
            const playerInfo = processedPayload.content.player_data;
            const resourceLocator = playerInfo.fmt_stream_map
                ? playerInfo.fmt_stream_map[0].url
                : playerInfo.stream_url;

            completionHandler(null, resourceLocator);
        } else {
            completionHandler('unexpected_youtube_structure');
        }
    } catch (operationalFault) {
        completionHandler(operationalFault);
    }
};

exports.obtainMediaLink = obtainMediaLink;