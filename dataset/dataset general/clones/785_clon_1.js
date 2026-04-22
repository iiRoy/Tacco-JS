/*
 * This file contains various ViewModel definitions for the application.
 * It also includes the main application logic and routing setup using Sammy.js.
 *
 * <reference path="../_references.js" /> is a special comment for IDEs like Visual Studio
 * to provide IntelliSense support, pointing to a common reference file.
 */

// ViewModel for a single breadcrumb item.
// It holds the display text, the URL it links to, and its active status.
function breadcrumbViewModel(text, url, active) {
  var self = this; // Capture 'this' for consistent referencing within the ViewModel.
  self.text = text; // The visible text for the breadcrumb.
  self.url = url; // The navigation URL for the breadcrumb.
  self.active = active; // Boolean indicating if this is the currently active breadcrumb.
}; // Semicolon after function definition, though optional, is kept for consistency with original.


// This ViewModel represents a single file in the project browser.
function fileViewModel(name, path, content, lineNumber) {
    var self = this; // Standard practice to alias 'this'.

    self.name = name; // The name of the file (e.g., "index.js").
    self.path = path; // The full path to the file within the project.
    self.content = content; // The actual content of the file.
    self.lineNumber = lineNumber; // Optional: specific line number to highlight in the file.
};


// ViewModel for a generic project item, used for both directories and files in a listing.
function projectItemViewModel(name, path) {
    var self = this; // Referencing the ViewModel instance.

    self.name = name; // The name of the item (file or directory).
    self.path = path; // The relative path of the item.
};


// The primary ViewModel representing the entire project.
// This handles project details, file/directory listings, and project-specific operations.
function projectViewModel(name, username, path) {
  var self = this; // Store context.

  /*
   * Observable properties for project details.
   * ko.observable makes these properties reactive to changes.
   */
  self.name = ko.observable(name); // The project's repository name.
  self.username = ko.observable(username); // The GitHub username (owner of the repo).
  self.path = ko.observable(path); // The current path within the project (e.g., directory or file path).
  self.directories = ko.observableArray(); // An array of directory items in the current view.
  self.files = ko.observableArray(); // An array of file items in the current view.
  self.file = ko.observable(); // The currently opened file's ViewModel.
  self.inProgress = ko.observable(true); // Flag to indicate if an operation (like loading) is in progress.
  self.versionInfo = ko.observable(); // Information about the project's version or download date.

  // A computed observable to generate the GitHub URL for the project.
  self.projectGithubUrl = ko.computed(function () {
    return 'https://github.com/' + self.username() + '/' + self.name();
  });


  // Helper function to construct a URL for navigation within the application,
  // based on the current project and an optional sub-path.
  self.buildUrl = function (path) {
    var url = '#/open/' + self.username() + "/" + self.name(); // Base URL for opening the project.
    if (path) { // If a specific path is provided.
      url += path; // Append the path to the URL.
    }

    return url; // Return the constructed URL.
  };


  // Computed observable that generates breadcrumbs for the current path within the project.
  self.breadcrumbs = ko.computed(function () {
    var paths = self.path().split("/"); // Split the current path into individual segments.
    // If the last segment is empty (e.g., path ends with '/'), remove it.
    if (paths[paths.length - 1] == "") {
      paths.splice(paths.length - 1, 1);
    }
    var result = []; // Array to store breadcrumbViewModel instances.
    // Add the "Root" breadcrumb, which links to the project's base.
    result.push(new breadcrumbViewModel("Root", self.buildUrl(), paths.length > 0));
    // Iterate over each path segment to create subsequent breadcrumbs.
    ko.utils.arrayForEach(paths, function (path) {
      var index = ko.utils.arrayIndexOf(paths, path); // Get the index of the current segment.
      var pathTillIndex = "/"; // Initialize path segment accumulator.
      // Reconstruct the path up to the current segment.
      for (var i = 0; i <= index; i++) {
        pathTillIndex += (paths[i] + "/");
      }
      // Add a breadcrumb for the current segment.
      // It's active if it's not the last segment.
      result.push(new breadcrumbViewModel(path, self.buildUrl(pathTillIndex), index < paths.length - 1));
    });

    return result; // Return the array of breadcrumbs.

  }, this); // Ensure 'this' context for the computed observable.


  // Adds a new directory item to the project's directories observable array.
  self.addDirectory = function (name, path) {
    self.directories.push(new projectItemViewModel(name, path));
  };


  // Adds a new file item to the project's files observable array.
  self.addFile = function (name, path) {
    self.files.push(new projectItemViewModel(name, path));
  };


  // Function to load the project details from the server.
  // This populates the directories, files, or the content of a specific file.
  self.openProject = function (lineNumber) {
    var projectUrl = '/api/project/' + self.username() + '/' + self.name() + '/';
    var path = self.path(); // Get the current path.
    if (path) {
      projectUrl += path; // Append path to the URL.
      // If the path does not end with a slash, add one.
      // This is important for the server to correctly identify it as a directory request,
      // or to avoid issues with forbidden extensions if it's meant to be a directory.
      if (path.substring(path.length - 1) != '/') {
        projectUrl += '/';
      }
    }
    // Make an AJAX GET request to the project API.
    $.get(projectUrl, function (data) {
      if (data) {

        // If download date is available, update version info.
        if (data.DownloadedDate) {
          self.versionInfo('Downloaded on ' + data.DownloadedDate);
        }

        // Check the type of data received (directory listing or file content).
        if (data.Type == 1) { /* Type 1 means a directory listing. */

          // Iterate through items in the directory.
          for (var i = 0; i < data.Items.length; i++) {
            var item = data.Items[i];
            if (item.Type == 1) { // If item is a directory.
              self.addDirectory(item.Name, item.Path);
            } else if (item.Type == 0) { // If item is a file.
              self.addFile(item.Name, item.Path);
            } else {
              // Handle unknown item types gracefully (do nothing for now).
            }
          }
        } else if (data.Type == 0) { /* Type 0 means file content. */
          // Set the current file observable with a new fileViewModel.
          self.file(new fileViewModel(data.Name, data.Path, data.Content, lineNumber || 0));
        } else {
          // Unrecognized data type, no specific action.
        }

      } else {
        // Data is null, indicating project not found or an error.
        // TODO: Implement user feedback for project not found.
      }

      self.inProgress(false); // Loading is complete.
    });
  };
};


// ViewModel for collecting project information (e.g., from a form).
function projectInfoViewModel() {
  var self = this; // Alias 'this'.

  self.url = ko.observable(); // Observable for the project URL input.
  self.username = ko.observable(); // Observable for the extracted GitHub username.
  self.name = ko.observable(); // Observable for the extracted repository name.
  self.hasError = ko.observable(); // Boolean flag to show validation errors.
  self.disableOpening = ko.observable(true); // Controls whether the 'Open' button is enabled.


  // Function to validate the entered project URL.
  function validateUrl(url) {
    var uri = new Uri(url); // Assumes a 'Uri' utility library is available.
    var isValid = false; // Flag for validation result.
    var path = uri.path(); // Get the path part of the URL.
    // Check if the host is GitHub and if there's a path.
    if (uri.host().indexOf('github.com') > -1 && path) {
      // Regex to match '/{username}/{projectname}' pattern.
      var matches = path.match(/^\/(.+)\/(.+)$/);
      if (matches) {
        self.username(matches[1]); // Extract username.
        self.name(matches[2]); // Extract project name.
        isValid = true; // URL is valid.
      }
    }
    self.hasError(!isValid); // Update error status.
    self.disableOpening(!isValid); // Update button enable status.
  };


  // Subscribe to changes in the URL observable to trigger validation automatically.
  self.url.subscribe(validateUrl);


  // Function to navigate to the project opening route.
  self.open = function () {
    location.hash = '#/open/' + self.username() + '/' + self.name(); // Change URL hash to open project.
  };

};


/*
 * ViewModel for an output window, typically used for displaying messages or logs.
 */
function outPutWindowViewModel(title, content) {
    var self = this; // Standard self-reference.

    self.show = ko.observable(true); // Controls the visibility of the window.
    self.title = title; // The title displayed in the window.
    self.content = content; // The main content/message of the window.

    self.close = function () {
        self.show(false); // Hides the output window.
    }
}


/*
 * ViewModel for a find result window, displaying a list of search results.
 */
function findResultWindowViewModel(title, items) {
    var self = this; // Standard self-reference.

    self.show = ko.observable(true); // Controls the visibility of the window.
    self.title = title; // The title of the find results window.
    self.items = items; // An array of search result items.

    self.close = function () {
        self.show(false); // Hides the find result window.
    }
}


/*
 * This is the main application-level ViewModel.
 * It orchestrates different parts of the application, handles routing,
 * and manages global state.
 */
function appViewModel() {
  var self = this; // Capture the ViewModel instance.

  self.isReady = ko.observable(false); // Indicates if the application is fully initialized.
  self.projectInfo = ko.observable(); // Holds the projectInfoViewModel when active.
  self.project = ko.observable(); // Holds the projectViewModel when a project is open.
  self.projectIsActive = ko.observable(); // Boolean: true if a project is currently being viewed.
  self.projectStatus = ko.observable(); // Displays general project status messages.
  self.findResult = ko.observable(); // Holds the findResultWindowViewModel when active.
  self.output = ko.observable(); // Holds the outPutWindowViewModel when active.

  self.projectHub = $.connection.projectHub; // Reference to the SignalR hub for project-related communication.


  // SignalR client-side method to receive project status updates.
  self.projectHub.projectStatus = function (data) {
    if (data) {
      if (data.Status == 2) { // Status 2 typically means "Completed".
        self.projectStatus(''); // Clear status message.
      } else if (data.Status == 3) { // Status 3 typically means "Error".
        self.projectStatus(data.Message); // Display error message.
        // Show a detailed output window for the error.
        self.output(new outPutWindowViewModel(data.Message, data.DetailedMessage));
      } else {
        self.projectStatus(data.Message); // Display general status message.
      }
    }
  };


  // SignalR client-side method to receive find reference status updates.
  self.projectHub.findReferenceStatus = function (data) {
    if (data) {
      self.projectStatus(data); // Update project status with find reference message.
    }
  };


  // Initiates a "Find References" operation.
  self.findReferences = function (kind, text, position) {
    var project = self.project(); // Get the currently active project.
    var currentFilePath = project.file().path; // Get the path of the currently open file.
    var findReferencesUrl = '/api/solution/findreferences'; // API endpoint for finding references.


    // Send an AJAX POST request to the find references API.
    $.post(findReferencesUrl,
      {
        username: project.username(), // Project owner's username.
        project: project.name(), // Project repository name.
        path: currentFilePath, // Path to the file where search is initiated.
        text: text, // The text to search for (e.g., identifier name).
        position: position, // The character position within the file.
        kind: kind // The kind of symbol (e.g., "method", "variable").
      },
      function (result) {
        // On success, display the results in a find result window.
        self.findResult(new findResultWindowViewModel('Find result for "' + text + '"', result));
      }
    );
  };


  // Initiates a "Go To Definition" operation.
  self.goToDefinition = function (fullyQualifiedName) {
    var project = self.project(); // Get the current project.
    var currentFilePath = project.file().path; // Get the path of the current file.
    var goToDefinitionUrl = '/api/solution/gotodefinition'; // API endpoint for go to definition.

    // Send an AJAX POST request.
    $.post(goToDefinitionUrl,
      {
        username: project.username(),
        project: project.name(),
        path: currentFilePath,
        fullyQualifiedName: fullyQualifiedName, // The fully qualified name of the symbol.
      },
      function (result) {
        if (result) {
          self.openFile(result); // If a definition is found, open the file at that location.
        } else {
          // If no definition is found, update the project status.
          self.projectStatus("Couldn't find any implementation in the current solution.");
        }
      }
    );
  };


  // Helper function to open a file based on a search result or definition.
  self.openFile = function (result) {
    self.projectStatus(''); // Clear any previous status messages.
    if (result) {
      // Construct the URL hash to navigate to the specified file and line number.
      location.hash = '#/open/' + self.project().username() + '/' + self.project().name() + '/' + result.Path + '?line=' + result.Position;
    }
  };


  // Sammy.js router setup for client-side routing.
  Sammy('#main', function () {

    // Route for opening a project with a specific path (e.g., a file or directory).
    // Matches: #/open/{usename}/{projectname}/{path}
    this.get(/\#\/open\/([^\/]+)\/([^\/]+)\/(.*)/, function (context, username, project, path) {
      var projectVm = new projectViewModel(project, username, path || ""); // Create new project ViewModel.
      self.projectInfo(null); // Clear project info view.
      self.project(projectVm); // Set the current project.
      projectVm.openProject(context.params.line); // Open the project, optionally to a specific line.
      self.projectIsActive(true); // Mark project as active.
    });

    // Route for opening a project without a specific sub-path (defaults to root).
    // Matches: #/open/{usename}/{projectname}
    this.get('#/open/:username/:project', function (context) {
      // Redirect to the more specific route with an empty path.
      this.app.runRoute('get', '#/open/' + context.params.username + '/' + context.params.project + '/');
    });

    // Default route: displays the project information input form.
    this.get('', function () {
      self.projectIsActive(false); // No project is active.
      self.project(null); // Clear the active project.
      self.projectInfo(new projectInfoViewModel()); // Show the project info input form.
    });

  }).run(); // Initialize Sammy.js routing.


  // Start the SignalR hub connection.
  $.connection.hub.start().done(function () {
    var projectConnectionId = $.connection.hub.id; // Get the SignalR connection ID.
    // Store the connection ID in a cookie, possibly for server-side correlation.
    $.cookie('ProjectConnectionId', projectConnectionId, { expires: 1 });
  });
  self.isReady(true); // Mark the application as ready once SignalR is connected.
};


// jQuery document ready function.
$(function () {

  // Timeout to hide the application loader and show the main content.
  // This helps prevent UI flickering during initial load.
  setTimeout(function () {
    $('#apploader').toggleClass('hide'); // Hide the loader.
    $('#main').toggleClass('hide'); // Show the main application content.
  }, 500); // Wait for 500 milliseconds.


  // Custom Knockout.js binding handler for scrolling to a specific line number.
  ko.bindingHandlers.scrollTo = {
    update: function (element, valueAccessor, allBindingsAccessor) {
      var currentElement = $(element); // Get the jQuery wrapped element.
      // Calculate the scroll position based on line number and line height.
      var value = ko.utils.unwrapObservable(valueAccessor()) * parseInt(currentElement.css('line-height').replace('px', ''));
      // Animate the scroll of the parent element with class 'scroll-y'.
      currentElement.parents('.scroll-y').animate({ scrollTop: value });
    }
  };


  var application = new appViewModel(); // Create an instance of the main application ViewModel.
  ko.applyBindings(application); // Apply Knockout.js bindings to the entire document.


  // Expose findReferences globally via jQuery for easy access from other parts of the application.
  $.findReferences = function (kind, text, position) {
    if (application) {
      application.findReferences(kind, text, position);
    }
  };


  // Expose goToDefinition globally via jQuery.
  $.goToDefinition = function (fullyQualifiedName) {
    if (application) {
      application.goToDefinition(fullyQualifiedName);
    }
  };
});