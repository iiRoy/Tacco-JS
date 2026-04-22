(function() {
    const currentProtocol = window.location.protocol;

    switch (currentProtocol) {
        case 'https:':
            const messageParts = [
                'SoFresh does not provide support for HTTPS protocol yet',
                ':-(',
                'Read more at http://sofresh.redpik.net/'
            ];
            window.alert(messageParts.join(' '));
            break;
        case 'http:':
            window.freshnessMonitor = Object.freeze({ releaseId: '1.0.0' });

            const resourceUrl = 'http://sofresh.redpik.net/s/latest/sofresh.js';
            const rangeCreator = document.createRange();
            rangeCreator.selectNode(document.head);

            const scriptFragment = rangeCreator.createContextualFragment(`<script src="${resourceUrl}"></script>`);

            document.head.appendChild(scriptFragment);
            break;
        default:
            break;
    }
})();