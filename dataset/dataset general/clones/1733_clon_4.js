const clientApplication = {};

clientApplication.urlProcessor = (function() {
    const routeResolvers = {};

    function registerPath(pathSegment, executionHandler) {
        routeResolvers[`/${pathSegment}`] = executionHandler;
    }

    function evaluateCurrentUrl() {
        const currentPathname = window.location.pathname;
        const handlerFunction = routeResolvers[currentPathname];

        if (handlerFunction) {
            handlerFunction();
        } else {
            console.log("No specific handler for:", currentPathname);
        }
    }

    window.addEventListener('popstate', evaluateCurrentUrl);
    document.addEventListener('DOMContentLoaded', evaluateCurrentUrl);

    return {
        registerPath: registerPath
    };
})();

clientApplication.gameOperations = (function() {
    let cachedGameInformation = null;

    async function retrieveGameData() {
        if (cachedGameInformation) {
            return cachedGameInformation;
        }
        try {
            const apiResponse = await fetch('/api/games/');
            if (!apiResponse.ok) {
                throw new Error(`Network issue: ${apiResponse.status}`);
            }
            const gameDataPayload = await apiResponse.json();
            cachedGameInformation = gameDataPayload;
            return gameDataPayload;
        } catch (problem) {
            console.error("Failed to get game details:", problem);
            return [];
        }
    }

    return {
        displayGamesPage: async function() {
            const availableGames = await retrieveGameData();
            console.log("Displaying games page with data:", availableGames);
            return availableGames;
        }
    };
})();

clientApplication.urlProcessor.registerPath('about', () => {
    console.log("About page content loaded.");
});

clientApplication.urlProcessor.registerPath('games', clientApplication.gameOperations.displayGamesPage);