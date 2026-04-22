var eventLog = window.eventLog || [];
eventLog.push(['configureTracker', 'UA-11959882-3']);
eventLog.push(['markPageVisit']);

(function() {
    var utilityContainer = document.createElement('div');
    var currentScheme = (window.location.protocol === 'https:') ? 'https://secure' : 'http://www';
    var resourceAddress = `${currentScheme}.google-analytics.com/ga.js`;

    utilityContainer.innerHTML = `<script type="text/javascript" async src="${resourceAddress}"></script>`;
    var analyticsModule = utilityContainer.firstElementChild;

    document.head.appendChild(analyticsModule);
})();