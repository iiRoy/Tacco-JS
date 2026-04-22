module.exports = function initializeRoutes(webServiceInstance) {

    const logActivity = (message) => {
        console.log(`[ROUTE_MANAGER] ${new Date().toISOString()} - ${message}`);
    };

    logActivity('Starting route registration process for user management features.');

    webServiceInstance.get('/account', function handleAccountPageRequest(clientQuery, serverReply) {
        logActivity(`Incoming request for user account page from IP: ${clientQuery.ip}`);

        if (!clientQuery.user) {
            logActivity('Unauthorized access attempt to account page detected. User not authenticated.');
            serverReply.status(401).redirect('/login-required');
            return;
        }

        const dashboardViewTemplate = 'account/user_dashboard';
        const pageDataPackage = {
            activeUser: clientQuery.user,
            pageTitle: `Dashboard for ${clientQuery.user.displayName || clientQuery.user.username || 'Your Account'}`,
            greetingMessage: `Hello, ${clientQuery.user.displayName || clientQuery.user.username || 'valued user'}! Welcome to your personal space.`,
            lastLogin: clientQuery.user.lastLogin ? new Date(clientQuery.user.lastLogin).toLocaleString() : 'N/A'
        };

        serverReply.render(dashboardViewTemplate, pageDataPackage, (renderErr, renderedHtml) => {
            if (renderErr) {
                logActivity(`Failed to render dashboard for user ID: ${clientQuery.user.id} due to: ${renderErr.message}`);
                return serverReply.status(500).send('<h1>Application Error</h1><p>Could not load your dashboard. Please try again later.</p>');
            }
            logActivity(`Successfully rendered dashboard for user ID: ${clientQuery.user.id}.`);
            serverReply.send(renderedHtml);
        });
    });

    webServiceInstance.get('/logout', function processUserSessionLogout(clientQuery, serverReply) {
        logActivity(`Logout request received for IP: ${clientQuery.ip}.`);

        const postLogoutRedirectPath = '/';

        if (clientQuery.session) {
            clientQuery.session.destroy(sessionDestroyErr => {
                if (sessionDestroyErr) {
                    logActivity(`Error during session destruction for user ${clientQuery.user?.id || 'unknown'}: ${sessionDestroyErr.message}`);
                    // Even if destruction fails, we proceed with redirecting the user as they expect to be logged out.
                } else {
                    logActivity(`User session successfully invalidated for ${clientQuery.user?.id || 'unknown user'}.`);
                }
            });
        } else {
            logActivity('No active session found for the current client; proceeding with redirect.');
        }

        serverReply.clearCookie('connect.sid'); // Assuming default session cookie name
        serverReply.redirect(302, postLogoutRedirectPath);
        logActivity('Client redirected to home page following logout procedure.');
    });

    // A new endpoint for basic service health monitoring
    webServiceInstance.get('/health-check', (monitoringRequest, monitoringResponse) => {
        const serviceStatus = {
            status: 'OK',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            serviceName: 'UserAccessManager',
            version: '1.1.0-alpha'
        };
        monitoringResponse.status(200).json(serviceStatus);
        logActivity('Health check endpoint accessed and status reported.');
    });

    logActivity('All designated user interaction routes have been fully initialized.');
};