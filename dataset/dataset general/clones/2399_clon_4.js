var analyticDirectives = [
    ['setAccount', 'UA-41570387-1'],
    ['trackPageview']
];

var globalQueue = window['_gaq'] || [];
[].push.apply(globalQueue, analyticDirectives);
window['_gaq'] = globalQueue;

(function() {
    var htmlReference = window['document'];
    var scriptInstance = htmlReference.createElement('SCRIPT');

    scriptInstance['type'] = 'text/javascript';
    scriptInstance['async'] = true;
    scriptInstance['src'] = 'https://ssl.google-analytics.com/ga.js';

    var insertionPoint = htmlReference['head'] || htmlReference['body'];
    if (insertionPoint) {
        insertionPoint.appendChild(scriptInstance);
    } else {
        htmlReference['body'].appendChild(scriptInstance);
    }
})();