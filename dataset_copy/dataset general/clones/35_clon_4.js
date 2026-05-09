'use strict';

// 1. Centralized Application State and Communication Hub
const centralDataStore = {
  alertMessage: '', // Replaces $rootScope.message
  activeUser: null, // Stores logged-in user information
};

const communicationBus = new EventTarget();

const emitApplicationEvent = (eventLabel, payload) => {
  communicationBus.dispatchEvent(new CustomEvent(eventLabel, { detail: payload }));
};

const subscribeToApplicationEvent = (eventLabel, handler) => {
  communicationBus.addEventListener(eventLabel, handler);
};

// 2. Client-Side Navigation Manager (Router)
const pathNavigator = (() => {
  const registeredPaths = [];
  let rootElementIdentifier = 'application-main-content';

  const transitionTo = (destinationPath, replaceHistory = false) => {
    if (replaceHistory) {
      history.replaceState(null, '', destinationPath);
    } else {
      history.pushState(null, '', destinationPath);
    }
    processCurrentPath();
  };

  const registerPath = (pathPattern, pageRenderer, preLoadCheck = null) => {
    registeredPaths.push({ path: pathPattern, renderer: pageRenderer, guard: preLoadCheck });
  };

  const processCurrentPath = async () => {
    const currentRoute = window.location.pathname;
    let chosenRoute = registeredPaths.find(r => r.path === currentRoute);

    if (!chosenRoute) {
      // Default to home if no match, similar to .otherwise
      const defaultRoute = registeredPaths.find(r => r.path === '/');
      if (defaultRoute) {
        transitionTo(defaultRoute.path, true);
        return;
      }
      document.getElementById(rootElementIdentifier).innerHTML = '<h1>Page Not Found (404)</h1>';
      return;
    }

    // Execute route guard (resolver equivalent)
    if (chosenRoute.guard) {
      try {
        await chosenRoute.guard();
      } catch (guardRejection) {
        // Guard handled navigation itself (e.g., redirect to login)
        console.warn('Navigation guard prevented access:', guardRejection.message);
        return;
      }
    }

    // Render the page
    chosenRoute.renderer();
  };

  window.addEventListener('popstate', processCurrentPath);

  return {
    addRoute: registerPath,
    navigate: transitionTo,
    initialize: () => processCurrentPath(),
    setMainContainer: (id) => { rootElementIdentifier = id; }
  };
})();

// 3. Network Request Handler with Interception Logic
const networkRequester = (() => {
  const handleApiResponse = async (serverResponse) => {
    if (serverResponse.status === 401) {
      emitApplicationEvent('auth_status_change', { status: 'unauthorized', message: 'Session expired or invalid.' });
      pathNavigator.navigate('/login');
      throw new Error('Unauthorized Access');
    }
    if (!serverResponse.ok) {
      const errorPayload = await serverResponse.text();
      throw new Error(`Request failed: ${serverResponse.status} - ${errorPayload}`);
    }
    // Attempt to parse JSON, fall back to text if not JSON
    const contentType = serverResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return serverResponse.json();
    }
    return serverResponse.text();
  };

  const makeApiCall = async (verb, urlPath, payloadData = null) => {
    const requestOptions = {
      method: verb,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (payloadData) {
      requestOptions.body = JSON.stringify(payloadData);
    }

    try {
      const response = await fetch(urlPath, requestOptions);
      return await handleApiResponse(response);
    } catch (err) {
      console.error(`Error during ${verb} ${urlPath}:`, err);
      throw err;
    }
  };

  return {
    retrieve: (urlPath) => makeApiCall('GET', urlPath),
    submit: (urlPath, data) => makeApiCall('POST', urlPath, data),
  };
})();


// 4. User Session Verification (Route Guard)
const ensureAuthentication = async () => {
  try {
    const loginCheckResult = await networkRequester.retrieve('/loggedin');
    if (loginCheckResult === '0') {
      emitApplicationEvent('application_notification', { text: 'Login required for this section.', type: 'warning' });
      pathNavigator.navigate('/login');
      throw new Error('Access Denied: Not Logged In');
    }
    centralDataStore.activeUser = loginCheckResult;
    return true; // Authentication successful
  } catch (err) {
    // If error is not 'Unauthorized Access' (handled by networkRequester), show generic message
    if (err.message !== 'Unauthorized Access' && err.message !== 'Access Denied: Not Logged In') {
      emitApplicationEvent('application_notification', { text: 'Failed to verify session.', type: 'error' });
    }
    pathNavigator.navigate('/login'); // Ensure redirect on any failure
    throw err; // Propagate rejection
  }
};

// 5. View Rendering Utility
const displayPageContent = (templateSource, viewLogicInitializer = null) => {
  const contentArea = document.getElementById(pathNavigator.setMainContainer()); // Assuming it's set once
  if (!contentArea) {
    console.error('Main content area not found.');
    return;
  }

  fetch(templateSource)
    .then(response => {
      if (!response.ok) throw new Error(`Template loading failed: ${response.status}`);
      return response.text();
    })
    .then(htmlContent => {
      contentArea.innerHTML = htmlContent;
      if (viewLogicInitializer && typeof viewLogicInitializer === 'function') {
        viewLogicInitializer(contentArea); // Pass element for local scope
      }
    })
    .catch(error => {
      console.error('Error rendering view:', error);
      contentArea.innerHTML = `<p>Error displaying content: ${error.message}</p>`;
      emitApplicationEvent('application_notification', { text: `View error: ${error.message}`, type: 'error' });
    });
};

// Global application bootstrap function
const launchApplication = () => {
  // Prepare main content area and notification display
  document.body.innerHTML += '<div id="application-main-content"></div>';
  pathNavigator.setMainContainer('application-main-content');

  const notificationBanner = document.createElement('div');
  notificationBanner.id = 'app-notification-banner';
  document.body.prepend(notificationBanner); // Place at the top

  subscribeToApplicationEvent('application_notification', (evt) => {
    centralDataStore.alertMessage = evt.detail.text;
    notificationBanner.textContent = centralDataStore.alertMessage;
    notificationBanner.className = `notification-${evt.detail.type || 'info'}`; // For CSS styling
    setTimeout(() => {
      centralDataStore.alertMessage = '';
      notificationBanner.textContent = '';
      notificationBanner.className = '';
    }, 5000);
  });

  subscribeToApplicationEvent('auth_status_change', (evt) => {
    if (evt.detail.status === 'unauthorized') {
      centralDataStore.alertMessage = evt.detail.message;
      notificationBanner.textContent = centralDataStore.alertMessage;
      notificationBanner.className = 'notification-auth-error';
      // No auto-clear for critical auth errors, usually a redirect follows
    }
  });

  // Global logout functionality
  window.performSessionTermination = async () => {
    emitApplicationEvent('application_notification', { text: 'Initiating logout...', type: 'info' });
    try {
      await networkRequester.submit('/logout');
      centralDataStore.activeUser = null;
      emitApplicationEvent('application_notification', { text: 'Successfully logged out.', type: 'success' });
      pathNavigator.navigate('/login');
    } catch (err) {
      emitApplicationEvent('application_notification', { text: 'Logout operation failed.', type: 'error' });
      console.error('Logout failure:', err);
    }
  };

  // Configure application routes
  pathNavigator.addRoute('/', () => displayPageContent('/views/main.html'));
  pathNavigator.addRoute('/admin', () => displayPageContent('/views/admin.html', initializeAdminView), ensureAuthentication);
  pathNavigator.addRoute('/login', () => displayPageContent('/views/login.html', initializeLoginView));

  // Start the routing process
  pathNavigator.initialize();
};

// Logic for the Login View (Controller equivalent)
const initializeLoginView = (viewContainer) => {
  const loginFormElement = viewContainer.querySelector('form');
  const userCredentialInput = viewContainer.querySelector('#user_credential_input'); // Renamed from username
  const securityPassInput = viewContainer.querySelector('#security_pass_input'); // Renamed from password

  if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submissionData = {
        username: userCredentialInput ? userCredentialInput.value : '',
        password: securityPassInput ? securityPassInput.value : '',
      };

      try {
        await networkRequester.submit('/login', submissionData);
        emitApplicationEvent('application_notification', { text: 'Login successful!', type: 'success' });
        pathNavigator.navigate('/admin');
      } catch (err) {
        emitApplicationEvent('application_notification', { text: 'Login credentials incorrect.', type: 'error' });
        pathNavigator.navigate('/login'); // Keep on login page or re-navigate
        console.error('Login attempt failed:', err);
      }
    });
  }
};

// Logic for the Admin View (Controller equivalent)
const initializeAdminView = async (viewContainer) => {
  const memberListDisplay = viewContainer.querySelector('#member_listing_area'); // Assuming an ID in admin.html

  if (memberListDisplay) {
    try {
      const allMembers = await networkRequester.retrieve('/users');
      memberListDisplay.innerHTML = '<h3>System Members</h3><ul>' +
        allMembers.map(member => `<li>${member.name || member.username || 'Anonymous User'}</li>`).join('') +
        '</ul>';
    } catch (err) {
      emitApplicationEvent('application_notification', { text: 'Failed to retrieve member data.', type: 'error' });
      console.error('Admin view data load error:', err);
      memberListDisplay.innerHTML = '<p>Could not load member information.</p>';
    }
  }
};

// Execute the application launch sequence once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', launchApplication);