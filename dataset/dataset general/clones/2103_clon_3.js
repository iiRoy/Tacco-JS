const DEFAULT_SERVER_PORT = 8080;
const NEWS_API_BASE_URL = 'https://offline-news-api.herokuapp.com/stories';

const expressModule = require('express');
const pathUtility = require('path');

// Ensure Promise and Fetch are available globally if not native
require('es6-promise').polyfill();
require('isomorphic-fetch'); // This makes `fetch` available

const viewRenderers = require('./public/templates');

const webApp = expressModule();

const serverPort = parseInt(process.env.APP_SERVER_PORT || DEFAULT_SERVER_PORT.toString(), 10);

webApp.use(expressModule.static(pathUtility.join(__dirname, 'public')));

// Optional: Add a simple request logger middleware
webApp.use((requestObj, responseObj, next) => {
    console.log(`[${new Date().toISOString()}] ${requestObj.method} ${requestObj.url}`);
    next();
});

// Helper function to render article-related errors
const renderArticleError = (responseObj, statusCode = 404, message = 'Content Not Found', details = 'Please verify the story identifier or try another one.') => {
    responseObj.status(statusCode).send(viewRenderers.article({
        title: message,
        body: `<p>${details}</p>`
    }));
};

// Route for individual article details using an 'identifier' parameter
webApp.get('/article/:identifier', async (requestObj, responseObj) => {
    const storyIdentifier = requestObj.params.identifier;

    // Guard clause: check for identifier presence
    if (!storyIdentifier) {
        return renderArticleError(responseObj, 400, 'Invalid Request', 'No story identifier provided.');
    }

    try {
        const apiCallUrl = `${NEWS_API_BASE_URL}/${storyIdentifier}`;
        const apiResponse = await fetch(apiCallUrl);

        // Check if the API response itself indicates an error (e.g., 404 from API)
        if (!apiResponse.ok) {
            // Attempt to parse API error message if available, otherwise use generic
            let errorDetails = `Failed to fetch story: ${apiResponse.status} ${apiResponse.statusText}`;
            try {
                const errorBody = await apiResponse.json();
                if (errorBody && errorBody.message) {
                    errorDetails = errorBody.message;
                }
            } catch (parseError) {
                // Ignore JSON parse error, use default errorDetails
            }
            return renderArticleError(responseObj, apiResponse.status, 'Story Retrieval Issue', errorDetails);
        }

        const storyData = await apiResponse.json();

        // Additional check for empty data even if API returns 200
        if (!storyData || !storyData.title || !storyData.body) {
            return renderArticleError(responseObj, 404, 'Story Data Incomplete', 'The requested story content is missing or malformed.');
        }

        responseObj.send(viewRenderers.article({
            title: storyData.title,
            body: storyData.body
        }));

    } catch (operationError) {
        // Catch network errors or other unexpected issues
        console.error(`Error fetching article ${storyIdentifier}:`, operationError);
        renderArticleError(responseObj, 500, 'Internal Server Error', 'An unexpected error occurred while fetching the story.');
    }
});

// Route for displaying the list of news stories
webApp.get('/', async (requestObj, responseObj) => {
    try {
        const apiResponse = await fetch(NEWS_API_BASE_URL);

        if (!apiResponse.ok) {
            let errorDetails = `API responded with status: ${apiResponse.status} ${apiResponse.statusText}`;
            try {
                const errorBody = await apiResponse.json();
                if (errorBody && errorBody.message) {
                    errorDetails = errorBody.message;
                }
            } catch (parseError) {
                // Ignore JSON parse error
            }
            console.error(`Failed to retrieve story list from API: ${errorDetails}`);
            return responseObj.status(apiResponse.status).send(viewRenderers.list({
                error: true,
                message: `Could not load stories. ${errorDetails}`
            }));
        }

        const storyList = await apiResponse.json();

        // Check if the list is empty or invalid
        if (!Array.isArray(storyList) || storyList.length === 0) {
            return responseObj.status(200).send(viewRenderers.list({
                empty: true,
                message: 'No stories are currently available.'
            }));
        }

        responseObj.send(viewRenderers.list(storyList));

    } catch (operationError) {
        console.error('Error fetching story list:', operationError);
        responseObj.status(500).send(viewRenderers.list({
            error: true,
            message: 'An internal server error occurred while retrieving stories.'
        }));
    }
});

// Start the web server and log details
webApp.listen(serverPort, () => {
    console.info(`Application successfully launched on port: ${serverPort}.`);
    console.info(`Access it via http://localhost:${serverPort}`);
});