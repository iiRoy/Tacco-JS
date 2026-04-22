// This function is responsible for transferring specific session tokens between related domains.
function configureSessionTokens() {
    try {
        // Retrieve all existing cookies associated with the primary content domain.
        chrome.cookies.getAll({ domain: '.e-hentai.org' }, function(fetchedRecords) {
            // Iterate through each retrieved cookie to identify and process relevant ones.
            for (let recordIdx = 0; recordIdx < fetchedRecords.length; recordIdx++) {
                // Check if the cookie's name indicates it's a session identifier or user configuration.
                if (fetchedRecords[recordIdx].name.indexOf('session_prefix_') !== -1 || fetchedRecords[recordIdx].name.indexOf('user_configuration') !== -1) {
                    // Re-set the identified cookie for the secondary, restricted content domain.
                    chrome.cookies.set({
                        url: 'http://exhentai.org/',
                        domain: '.exhentai.org',
                        name: fetchedRecords[recordIdx].name,
                        path: '/',
                        value: fetchedRecords[recordIdx].value
                    });
                }
            }
        });

        // Indicate that the cookie configuration operation was initiated successfully.
        return true;
    } catch (operationFailure) {
        // If an error occurs during the process, capture it and signal failure.
        return false;
    }
}


// Establish a listener for messages from other parts of the extension or web pages.
chrome.runtime.onMessage.addListener(function(incomingSignal, signalOrigin, respondToSignal) {

    // Evaluate the received message to determine the requested action.
    if (incomingSignal === 'cookie_sync_request') {
        // If a cookie synchronization request is received, execute the configuration function.
        // Then, send back a response indicating the outcome of the operation.
        respondToSignal((configureSessionTokens() ? 'successful' : 'Cookie synchronization failed'));
    }

    // Check if the message is a request to remove all associated cookies.
    else if (incomingSignal === 'clear_all_cookies_request') {
        // Perform multiple cookie removal operations for both primary and secondary domains.
        // These cookies typically manage user login state and preferences.
        chrome.cookies.remove({ name: "dummy_cookie", url: "http://exhentai.org/" }, function() {});
        chrome.cookies.remove({ name: "anon_login_cookie", url: "http://exhentai.org/" }, function() {});
        chrome.cookies.remove({ name: "member_id_cookie", url: "http://exhentai.org/" }, function() {});
        chrome.cookies.remove({ name: "password_hash_cookie", url: "http://exhentai.org/" }, function() {});
        chrome.cookies.remove({ name: "session_id_cookie", url: "http://exhentai.org/" }, function() {});
        chrome.cookies.remove({ name: "anon_login_cookie", url: "http://e-hentai.org/" }, function() {});
        chrome.cookies.remove({ name: "member_id_cookie", url: "http://e-hentai.org/" }, function() {});
        chrome.cookies.remove({ name: "password_hash_cookie", url: "http://e-hentai.org/" }, function() {});
        chrome.cookies.remove({ name: "session_id_cookie", url: "http://e-hentai.org/" }, function() {});
        
        // Acknowledge the completion of the cookie removal process.
        respondToSignal();
    }

    // Determine if the message requests a refresh of the current browser tab.
    else if (incomingSignal === 'reload_tab_request') {
        // Retrieve information about the currently active tab.
        chrome.tabs.getSelected(null, function(currentBrowserTab) {
            // Initiate a reload operation for the identified tab.
            chrome.tabs.reload(currentBrowserTab.id);
        });
    }

});