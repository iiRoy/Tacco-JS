import * as templateRenderer from 'nunjucks';
import { URL as WebResourceLocator } from 'url';
import * as diskIO from 'fs/promises';
import * as fileSystemPath from 'path';
import { get as secureWebClientGet } from 'https';

// --- Configuration and Constants ---
const outputStorageLocation = fileSystemPath.resolve(fileSystemPath.dirname(new URL(import.meta.url).pathname));
const viewingConfiguration = {
  awaitDuration: 5000,
  loadCascadingStyles: true,
  executeScripts: true
};

const appBaseUrl = "https://your-homepage.com";
const githubAccountIdentifier = "your_github_username";

// --- Helper function to fetch secure web resources with Promises ---
async function obtainSecureResource(requestOptions) {
    return new Promise((resolve, reject) => {
        secureWebClientGet(requestOptions, (serverResponse) => {
            let receivedPayload = '';
            serverResponse.setEncoding('utf8');
            serverResponse.on('data', (segment) => { receivedPayload += segment; });
            serverResponse.on('end', () => { resolve(receivedPayload); });
        }).on('error', (err) => { reject(err); });
    });
}

// --- Function to persist rendered content to disk ---
async function preserveResourceContent(resourceLocatorString, contentBody) {
    const parsedWebAddress = new WebResourceLocator(resourceLocatorString);
    const relativePath = parsedWebAddress.pathname;
    const finalDestination = fileSystemPath.join(outputStorageLocation, relativePath);

    await diskIO.mkdir(fileSystemPath.dirname(finalDestination), { recursive: true });
    console.info(`Directory structure established: ${fileSystemPath.dirname(finalDestination)}`);
    await diskIO.writeFile(finalDestination, contentBody);
    console.info(`Content successfully archived: ${finalDestination}`);
}

// --- Main execution block using async/await ---
(async () => {
    console.info("Initiating content capture workflow...");

    const applicationSettingsRaw = await diskIO.readFile(fileSystemPath.join(outputStorageLocation, "config", "settings.json"));
    const applicationSettingsData = JSON.parse(applicationSettingsRaw.toString());

    // Phase 1: Retrieve and store the Atom feed
    try {
        const atomFeedOptions = {
            host: "gist.github.com",
            path: `/${githubAccountIdentifier}.atom`,
            headers: { 'User-Agent': "CustomNodeJsScraper/1.0" }
        };
        const atomFeedContent = await obtainSecureResource(atomFeedOptions);
        await diskIO.writeFile(fileSystemPath.join(outputStorageLocation, 'feed.xml'), atomFeedContent);
        console.info("GitHub Atom feed successfully retrieved and saved.");
    } catch (err) {
        console.error("Failure during Atom feed retrieval or saving:", err);
    }

    // Phase 2: Fetch gist entries and process each one
    try {
        const gistListOptions = {
            host: "api.github.com",
            path: `/users/${githubAccountIdentifier}/gists`,
            headers: {
                'User-Agent': "CustomNodeJsScraper/1.0",
                'Content-Type': "application/json"
            }
        };
        const gistListPayload = await obtainSecureResource(gistListOptions);
        const entryCollection = JSON.parse(gistListPayload);

        // Iterate and process each gist entry sequentially
        for (let entryIndex = 0; entryIndex < entryCollection.length; entryIndex++) {
            const currentEntry = entryCollection[entryIndex];
            let contentSuffix;
            let entryTitle;

            if (currentEntry.description) {
                contentSuffix = currentEntry.description.replace(/ +/g, '-') + "/index.html";
                entryTitle = currentEntry.description;
            } else {
                contentSuffix = "index.html";
                for (const fileName in currentEntry.files) {
                    entryTitle = fileName;
                    break;
                }
            }

            const displayIdentifier = `${appBaseUrl}/#/entry/${currentEntry.id}/${currentEntry.description || ''}`;
            console.info(`Processing entry: ${displayIdentifier}`);

            try {
                const gistDetailOptions = {
                    host: "gist.github.com",
                    path: `/${githubAccountIdentifier}/${currentEntry.id}.json`
                };
                const gistDetailPayload = await obtainSecureResource(gistDetailOptions);
                const fetchedEntryData = JSON.parse(gistDetailPayload);

                const mergedEntryDetails = { ...fetchedEntryData, ...applicationSettingsData }; // Merge data using object spread

                const targetResourcePath = `${appBaseUrl}/entry/${currentEntry.id}/${contentSuffix}`;
                const renderedOutput = templateRenderer.render(
                    fileSystemPath.join(outputStorageLocation, "src", "templates", "crawl.html"),
                    { data: mergedEntryDetails }
                );

                await preserveResourceContent(targetResourcePath, renderedOutput);

                if (entryIndex + 1 === entryCollection.length) {
                    console.info("All specified entries have been processed.");
                } else {
                    console.info(`Advancing to subsequent entry: ${entryIndex + 1}`);
                }
            } catch (entryError) {
                console.error(`An error occurred while processing entry ${currentEntry.id}:`, entryError);
            }
        }
    } catch (err) {
        console.error("Failure during gist list retrieval or processing:", err);
    }

    console.info("Workflow completion achieved.");
})();