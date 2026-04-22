var urlParams = {}; // Global object to store URL parameters fetched from the query string.
var username; // Variable to hold the GitHub username, if found in URL parameters.
var trackerId = 'UA-21222559-1'; // Google Analytics tracker ID for this application.


(function () {
    // This self-executing anonymous function parses URL parameters.

    var e, // Temporary variable for regex execution results.
        a = /\+/g,  /* Regular expression: used for replacing the '+' symbol (which often represents spaces in URL encoding) with an actual space character. */
        r = /([^&=]+)=?([^&]*)/g, // Main regex: captures key-value pairs from the URL query string.
        d = function (s) { // Helper function to decode URL components.
            // Decodes a URI component and replaces '+' with spaces.
            return decodeURIComponent(s.replace(a, " "));
        },
        q = window.location.search.substring(1); // Gets the query string part of the URL, excluding the leading '?'.

    // Loop through the query string to find all key-value pairs.
    while (e = r.exec(q)) {
       // Assuming only the first parameter is relevant for the username.
       urlParams[0] = d(e[1]); // Stores the decoded value of the first parameter found.
    }
})(); /* End of URL parameter parsing function. */


$(document).ready(function() {
    // This code block executes once the entire DOM is loaded.

    try {
        // Attempt to retrieve username from parsed URL parameters.
        if (urlParams[0] !== undefined) {
            // If a username parameter is found, assign it and initiate the main application logic.
            username = urlParams[0];
            run(); // Call the primary function to fetch and display user data.
        }
        else {
            // If no username parameter is present, display the default home view.
            home(); // Show the default landing page.
        }
    }
    catch (err) {
        // Catch any errors that occur during the initial loading process.
        try {
            console.log(err); // Log the error to the console for debugging.
        }
        catch (e) {
            /* This nested catch block handles potential errors within the error logging itself,
             * ensuring that the application doesn't crash even if console.log fails (e.g., in very old browsers).
             * It fails silently, meaning no further action is taken. */
        }
    }
}); // End of document ready handler.


var error = function() {
    // Function to load and display the error page content.
    $.ajax({
        url: 'views/error.html', // Path to the error HTML template.
        dataType: 'html', // Expect HTML content back from the server.
        success: function(data) {
            var template = data; // The fetched HTML content.
            $('#resume').html(data); // Insert the error HTML into the '#resume' element.
        }
    });
}; // End of error function.


var home = function() {
    // Function to load and display the home page content.
    $.ajax({
        url: 'views/index.html', // Path to the home HTML template.
        dataType: 'html', // Expect HTML content.
        success: function(data) {
            var template = data; // The fetched HTML content.
            $('#resume').html(data); // Insert the home HTML into the '#resume' element.
        }
    });
}; // End of home function.


var github_user = function(username, callback) {
    // Fetches public profile information for a given GitHub username.
    // username: The GitHub username to query.
    // callback: A function to execute with the fetched data.
    $.getJSON('https://api.github.com/users/' + username + '?callback=?', callback);
}; // End of github_user function.


var github_user_repos = function(username, callback, page_number, prev_data) {
    // Recursively fetches all public repositories for a given GitHub user, handling pagination.
    // username: The GitHub username.
    // callback: Function to call once all repository data is collected.
    // page_number: Current page number for pagination (internal use, optional).
    // prev_data: Accumulated data from previous pages (internal use, optional).

    var page = (page_number ? page_number : 1), // Determine the current page number; default to 1 if not provided.
        url = 'https://api.github.com/users/' + username + '/repos?callback=?', // Base URL for the GitHub user repositories API.
        data = (prev_data ? prev_data : []); // Initialize data array with previous data or an empty array.

    // If fetching a page beyond the first, append the 'page' parameter to the URL.
    if (page_number > 1) {
      url += '&page=' + page_number;
    }

    // Make the JSONP request to the GitHub API.
    $.getJSON(url, function(repos) {
        data = data.concat(repos.data); // Concatenate current page's data with previously collected data.

        // Check if there are more repositories to fetch (i.e., if the current page returned results).
        if (repos.data.length > 0) {
            // If so, recursively call this function for the next page.
            github_user_repos(username, callback, page + 1, data);
        }
        else {
            // If no more data is returned, all repositories have been fetched; execute the final callback.
            callback(data);
        }
    });
}; // End of github_user_repos function.


var github_user_orgs = function(username, callback) {
    // Fetches public organization memberships for a given GitHub username.
    // username: The GitHub username.
    // callback: Function to execute with the fetched organization data.
    $.getJSON('https://api.github.com/users/' + username + '/orgs?callback=?', callback);
}; // End of github_user_orgs function.


// This function checks if the specified GitHub user has starred the 'resume/resume.github.com' repository.
// It uses synchronous AJAX calls, which can block the main thread, but is used here for simplicity.
//
// Returns: A boolean value (true if starred, false otherwise).
var github_user_starred_resume = function(username, page) {
    var star  = false; // Flag to indicate if the resume repo has been starred. Initialized to false.
    var repos = [];    // Array to store the repositories starred by the user on the current page.
    var page  = (page ? page : 1); // Current page number for fetching starred repositories; defaults to 1.
    var url   = 'https://api.github.com/users/' + username + '/starred?page=' + page; // API URL for user's starred repos.

    // Perform a synchronous AJAX request to get the starred repositories.
    $.ajax({
        url: url, // The constructed API URL.
        async: false, // IMPORTANT: This makes the AJAX call synchronous, blocking script execution until it completes.
        dataType: 'json', // Expect JSON data in response.
        success: function(data) {
            repos = data; // Assign the fetched data (array of starred repos) to the 'repos' variable.
        }
    });

    // Iterate through the fetched starred repositories.
    $.each(repos, function(i, repo) {
        // Check if the full name of the current repository matches the resume repo.
        if (repo.full_name == "resume/resume.github.com") {
            star = true; // Set the flag to true if a match is found.
            return false; // Stop iterating through the repositories (equivalent to 'break' in a standard loop).
        }
    });

    // If the resume repo was found in the current page of starred repos, return true immediately.
    if (star) {
        return star;
    }

    // If the current page returned repositories, but the resume repo was not found,
    // recursively call this function for the next page to continue searching.
    if (repos.length > 0) {
        star = github_user_starred_resume(username, page + 1); // Recursive call for the next page.
    }

    // Return the final 'star' status.
    return star;
}; // End of github_user_starred_resume function.


var run = function() {
    // This is the main function that orchestrates fetching and displaying GitHub user data.

    var itemCount = 0, // Counter for displayed items (repositories/organizations).
        maxItems = 5, // Maximum number of items to display in each section.
        maxLanguages = 9; // Maximum number of programming languages to list.

    // First, check if the user has starred the resume.github.com repository.
    if (! github_user_starred_resume(username)) {
        // If the user has NOT starred the resume repository, display an opt-out message.
        $.ajax({
            url: 'views/opt_out.html', // Load the opt-out HTML template.
            dataType: 'html', // Expect HTML data.
            success: function(data) {
                var template = data; // The fetched HTML.
                $('#resume').html(data); // Display the opt-out message in the '#resume' element.
            }
        });
        return; // Exit the run function as the user has opted out.
    }

    // Proceed if the user has starred the repo (or if the check is skipped/passes).
    // Fetch general GitHub user profile information.
    var res = github_user(username, function(data) {
        data = data.data; // Extract the actual user data from the API response envelope.

        // Process creation date for display.
        var sinceDate = new Date(data.created_at);
        var sinceMonth = sinceDate.getMonth(); // Month (0-11)
        var since = sinceDate.getFullYear(); // Year
        var currentYear = (new Date).getFullYear(); // Current year for comparison.

        // Determine a friendly 'since' string.
        switch (since) {
          case currentYear-1:
            since = 'last year'; // If created last year.
            break;
          case currentYear:
            since = 'this year'; // If created this year.
            break;
        }

        var addHttp = ''; // Prefix for blog URL if 'http' is missing.
        if (data.blog && data.blog.indexOf('http') < 0) {
            addHttp = 'http://'; // Add 'http://' if the blog URL doesn't start with it.
        }

        // Determine the display name for the user.
        // Prioritize 'data.name' (friendly name) if available; otherwise, use 'username' (login name).
        var name = username;
        if (data.name !== null && data.name !== undefined && data.name.length) {
            name = data.name;
        }

        var avatar = ''; // Variable to hold the avatar URL.
        // If the user is an Organization, extract a specific gravatar URL pattern.
        if (data.type == 'Organization'){
            avatar = data.avatar_url.match(/https:\/\/secure.gravatar.com\/avatar\/[0-9a-z]+/)[0];
            avatar += '?s=140&amp;d=https://github.com/images/gravatars/gravatar-140.png'; // Append size and default image parameters.
        }

        // Prepare the 'view' object with all data points for templating.
        var view = {
            name: name, // User's display name.
            type: data.type, // User type (User or Organization).
            email: data.email, // User's public email.
            created_at: data.created_at, // Raw creation timestamp.
            earlyAdopter: 0, // Flag for early GitHub adopters.
            location: data.location, // User's location.
            gravatar_id: data.gravatar_id, // Gravatar ID.
            avatar_url: avatar, // Processed avatar URL.
            repos: data.public_repos, // Number of public repositories.
            reposLabel: data.public_repos > 1 ? 'repositories' : 'repository', // Pluralization for 'repositories'.
            followers: data.followers, // Number of followers.
            followersLabel: data.followers > 1 ? 'followers' : 'follower', // Pluralization for 'followers'.
            username: username, // GitHub login username.
            userStatus: 'GitHub user', // Default user status.
            since: since, // Friendly 'since' year/label.
            resume_url: window.location // Current page URL for resume link.
        };

        // Determine if the user is considered an 'early adopter' based on GitHub's founding.
        // GitHub officially launched in April 2008. We use a threshold of 5 months into 2008, or any year before 2008.
        if ((since == '2008' && sinceMonth <= 5) || since <= '2007') {
            view.earlyAdopter = 1; // Set early adopter flag.
        }

        view.userStatus = getUserStatus(); // Calculate and set the user's status level.

        // Nested function to calculate and return a 'user status' string based on various metrics.
        function getUserStatus() {
            var COEF_REPOS = 2; // Weight for public repositories.
            var COEF_GISTS = 0.25; // Weight for public gists.
            var COEF_FOLLOWERS = 0.5; // Weight for followers.
            var COEF_FOLLOWING = 0.25; // Weight for following count.
            var FIRST_STEP = 0; // Score thresholds for different status levels.
            var SECOND_STEP = 5;
            var THIRD_STEP = 20;
            var FOURTH_STEP = 50;
            var FIFTH_STEP = 150;
            var EXTRA_POINT_GAIN = 1; // Points for extra achievements.

            // Calculate a base status score.
            var statusScore = data.public_repos * COEF_REPOS
                            + data.public_gists * COEF_GISTS
                            + data.followers * COEF_FOLLOWERS
                            + data.following * COEF_FOLLOWING;

            // Apply extra points for specific criteria.
            // - Early adopter bonus.
            if (view.earlyAdopter == 1) {
                statusScore += EXTRA_POINT_GAIN;
            }
            // - Bonus for having a blog, email, and location filled out.
            if (view.location && view.location != '' && view.email && view.email != '' && data.blog && data.blog != '') {
                statusScore += EXTRA_POINT_GAIN;
            }

            // Return the appropriate status string based on the calculated score.
            if (statusScore == FIRST_STEP) {
              return 'Inactive GitHub user';
            }
            else if (statusScore > FIRST_STEP && statusScore <= SECOND_STEP) {
              return 'Newbie GitHub user';
            }
            else if (statusScore > SECOND_STEP && statusScore <= THIRD_STEP) {
              return 'Regular GitHub user';
            }
            else if (statusScore > THIRD_STEP && statusScore <= FOURTH_STEP) {
              return 'Advanced GitHub user';
            }
            else if (statusScore > FOURTH_STEP && statusScore <= FIFTH_STEP) {
              return 'Enthusiastic GitHub user';
            }
            else if (statusScore > FIFTH_STEP) {
              return 'Passionate GitHub user';
            }
        }; // End of getUserStatus function definition.

        // If a blog URL is provided, format it for display.
        if (data.blog !== undefined && data.blog !== null && data.blog !== '') {
            view.website = addHttp + data.blog;
        }

        // Determine which resume template to use based on user type (User or Organization).
        var resume = (data.type == 'User' ? 'views/resume.html' : 'views/resumeOrgs.html');

        // Fetch the appropriate resume template.
        $.ajax({
            url: resume, // Template URL.
            dataType: 'html', // Expected data type.
            success: function(data) {
                var template = data, // The raw HTML template.
                    html = Mustache.to_html(template, view); // Render the template with the 'view' data using Mustache.js.
                $('#resume').html(html); // Insert the rendered HTML into the '#resume' element.
                document.title = name + "'s Résumé"; // Update the browser tab title.
                $("#actions #print").click(function(){
                    window.print(); // Enable print functionality for the resume.
                    return false; // Prevent default link behavior.
                });
            }
        });
    }); // End of github_user callback.


    // Fetch and process the user's public repositories.
    github_user_repos(username, function(data) {
        var sorted = [], // Array to hold repositories, sorted by popularity.
            languages = {}, // Object to count language occurrences.
            popularity; // Temporary variable for repository popularity score.

        $.each(data, function(i, repo) {
            // Skip forked repositories.
            if (repo.fork !== false) {
                return;
            }

            // Count programming languages.
            if (repo.language) {
                if (repo.language in languages) {
                    languages[repo.language]++;
                } else {
                    languages[repo.language] = 1;
                }
            }

            // Calculate popularity (watchers + forks).
            popularity = repo.watchers + repo.forks;
            // Store original index, popularity, and full repo info.
            sorted.push({position: i, popularity: popularity, info: repo});
        });

        // Helper function for sorting repositories by popularity (descending).
        function sortByPopularity(a, b) {
            return b.popularity - a.popularity;
        };

        sorted.sort(sortByPopularity); // Sort the repositories.

        var languageTotal = 0; // Total count of language occurrences.

        // Function to sort languages by popularity and apply a limit.
        function sortLanguages(languages, limit) {
            var sorted_languages = []; // Array to hold language objects.

            for (var lang in languages) {
                // Ensure 'lang' is a string key, not a prototype property.
                if (typeof(lang) !== "string") {
                    continue;
                }
                // Create a language object with name, popularity, and a toString method for display.
                sorted_languages.push({
                    name: lang,
                    popularity: languages[lang],
                    toString: function() {
                        return '<a href="https://github.com/languages/' + this.name + '">' + this.name + '</a>';
                    }
                });

                languageTotal += languages[lang]; // Accumulate total language count.
            }

            // Apply the limit if specified.
            if (limit) {
                sorted_languages = sorted_languages.slice(0, limit);
            }

            return sorted_languages.sort(sortByPopularity); // Sort languages by their popularity.
        }

        // Fetch the template for displaying individual job/repository items.
        $.ajax({
            url: 'views/job.html', // Path to the job/repository item template.
            dataType: 'html', // Expect HTML data.
            success: function(response) {
                languages = sortLanguages(languages, maxLanguages); // Sort and limit the languages.

                // If there are languages to display, render them.
                if (languages && languages.length > 0) {
                    var ul = $('<ul class="talent"></ul>'), // Start a new unordered list for languages.
                        percent, li; // Variables for percentage and list item.

                    $.each(languages, function(i, lang) {
                        x = i + 1; // Item index + 1.
                        percent = parseInt((lang.popularity / languageTotal) * 100); // Calculate percentage.
                        li = $('<li>' + lang.toString() + ' ('+percent+'%)</li>'); // Create list item HTML.

                        // Apply 'last' class for styling and append to appropriate UL.
                        if (x % 3 == 0 || (languages.length < 3 && i == languages.length - 1)) {
                            li.attr('class', 'last');
                            ul.append(li);
                            $('#content-languages').append(ul); // Append completed UL to content area.
                            ul = $('<ul class="talent"></ul>'); // Start a new UL.
                        } else {
                            ul.append(li);
                            $('#content-languages').append(ul); // Append to current UL.
                        }
                    });
                } else {
                    $('#mylanguages').hide(); // Hide the languages section if no languages are found.
                }

                // If there are sorted repositories, display them.
                if (sorted.length > 0) {
                    $('#jobs').html(''); // Clear any existing content in the jobs section.
                    itemCount = 0; // Reset item counter.
                    var since, until, date, view, template, html; // Variables for loop.

                    $.each(sorted, function(index, repo) {
                        // Limit the number of displayed repositories.
                        if (itemCount >= maxItems) {
                            return; // Stop iterating if max items reached.
                        }

                        // Format creation and push dates.
                        since = new Date(repo.info.created_at);
                        since = since.getFullYear();
                        until = new Date(repo.info.pushed_at);
                        until = until.getFullYear();
                        if (since == until) {
                            date = since; // If created and pushed in the same year.
                        } else {
                            date = since + ' - ' + until; // Display a range.
                        }

                        // Prepare 'view' object for the repository template.
                        view = {
                            name: repo.info.name, // Repository name.
                            date: date, // Formatted date.
                            language: repo.info.language, // Primary language.
                            description: repo.info.description, // Repository description.
                            username: username, // GitHub username.
                            watchers: repo.info.watchers, // Number of watchers.
                            forks: repo.info.forks, // Number of forks.
                            watchersLabel: repo.info.watchers == 0 || repo.info.watchers > 1 ? 'watchers' : 'watcher', // Pluralization.
                            forksLabel: repo.info.forks == 0 || repo.info.forks > 1 ? 'forks' : 'fork', // Pluralization.
                        };

                        // Add 'last' class for styling the last item.
                        if (itemCount == sorted.length - 1 || itemCount == maxItems - 1) {
                            view.last = 'last';
                        }

                        template = response; // The job/repository item template.
                        html = Mustache.to_html(template, view); // Render with Mustache.

                        $('#jobs').append($(html)); // Append the rendered HTML to the '#jobs' section.
                        ++itemCount; // Increment the item counter.
                    });
                } else {
                    // If no public (non-forked) repositories are found.
                    if(data.length > 0){
                      $('#jobs').html('').append('<p class="enlarge">All of this user\'s repositories seem to be forks. Sorry.</p>');
                    } else {
                      $('#jobs').html('').append('<p class="enlarge">Unfortunately, this user does not seem to have any <strong>public</strong> repositories.</p>');
                    }
                }
            }
        });
    }); // End of github_user_repos callback.


    // Fetch and process the user's organizations.
    github_user_orgs(username, function(response) {
        var sorted = []; // Array to hold organization data.

        $.each(response.data, function(i, org) {
            // Ensure the organization object has a login name.
            if (org.login === undefined) {
                return;
            }
            sorted.push({position: i, info: org}); // Store original index and organization info.
        });

        // Fetch the template for displaying individual organization items.
        $.ajax({
            url: 'views/org.html', // Path to the organization item template.
            dataType: 'html', // Expect HTML data.
            success: function(response) {
                var now = new Date().getFullYear(); // Current year.

                // If there are organizations to display.
                if (sorted.length > 0) {
                    $('#orgs').html(''); // Clear existing content.

                    var name, view, template, html; // Variables for loop.

                    $.each(sorted, function(index, org) {
                        // Limit the number of displayed organizations.
                        if (itemCount >= maxItems) {
                            return; // Stop iterating.
                        }
                        name = (org.info.name || org.info.login); // Use friendly name or login name.
                        view = {
                            name: name, // Organization name.
                            now: now // Current year.
                        };

                        // Add 'last' class for styling.
                        if (itemCount == sorted.length - 1 || itemCount == maxItems) {
                            view.last = 'last';
                        }
                        template = response; // Organization item template.
                        html = Mustache.to_html(template, view); // Render with Mustache.

                        $('#orgs').append($(html)); // Append to '#orgs' section.
                        ++itemCount; // Increment item counter.
                    });
                } else {
                    $('#organizations').remove(); // Remove the entire organizations section if none are found.
                }
            }
        });
    }); // End of github_user_orgs callback.

}; // End of run function.


// Google Analytics tracking code.
if (trackerId) {
  var _gaq = _gaq || []; // Initialize _gaq array if it doesn't exist.
  _gaq.push(['_setAccount', trackerId]); // Set the Google Analytics account ID.
  _gaq.push(['_trackPageview']); // Track the current page view.

  (function() {
    // Dynamically create and insert the Google Analytics script tag.
    var ga = document.createElement('script'); // Create a new script element.
    ga.type = 'text/javascript'; // Set script type.
    ga.async = true; // Enable asynchronous loading.
    // Determine the protocol (https or http) for the GA script URL.
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; // Get the first script tag in the document.
    s.parentNode.insertBefore(ga, s); // Insert the GA script before the first existing script tag.
  })();
}


$(window).bind('error', error); // Bind the global error handler function to the window's 'error' event.