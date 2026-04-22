var express = require('express')
    , http = require('http') /* HTTP module for server creation */
    , path = require('path') /* Path module for handling and transforming file paths */
    , passport = require('passport') // Authentication middleware for Node.js
    , fs = require('fs') // File system module for file operations
    , util = require('util') /* Utility functions */
    , moment = require('moment') // A JavaScript date library for parsing, validating, manipulating, and formatting dates.
    , GoogleStrategy = require('passport-google').Strategy; // Google OAuth strategy for Passport.js

// This section handles the creation of the 'views' directory and copies default view files if they don't exist.
fs.mkdir('views', function(e) {
    // Check if an error occurred during directory creation
    // or if the directory already exists (EEXIST error code).
    if (!e || (e.code === 'EEXIST')) {
        // If no error or directory already exists, proceed to read default views.
        fs.readdir(__dirname + '/default_views/', function(err, files) {
            // Iterate over each file found in the default_views directory.
            files.forEach(function(file) {
                // Check if the file already exists in the 'views' directory.
                fs.exists('views/' + file, function(exists) {
                    // If the file does not exist in 'views', copy it from 'default_views'.
                    if (!exists) {
                        fs.createReadStream(__dirname + '/default_views/' + file)
                            .pipe(fs.createWriteStream('views/' + file)); // Pipe the read stream to a write stream.
                    }
                });
            });
        });
    } else {
        // Log any other errors encountered during directory creation.
        console.log(e);
    }
});

// Initialize the Express application.
var app = express();

/**
 * Main application startup function.
 * @param {object} options - Configuration options for the application.
 */
exports.start = function(options) {

    // Check for admin Google email configuration.
    if (!options.adminGoogleEmail) {
        console.log('Warning! You need to add the "adminGoogleEmail" property to access the administration settings.');
    }

    // Set database environment variables if not already set.
    if (!process.env.database) {
        process.env.database = options.database.database;
        process.env.user = options.database.user;
        process.env.password = options.database.password;
        process.env.host = options.database.host;
        process.env.dbPort = options.database.dbPort;
    }

    // Require database and routes modules.
    var db = require('./db')
        , routes = require('./routes/index.js'); // Main application routes.

    // Set options for the routes module.
    routes.set(options);

    // Configure application local variables.
    app.locals.title = options.title || 'No Title Set!'; // Default title for the application.
    app.locals.menu = options.menu || []; // Default empty menu array.
    app.locals.bootstrapPath = options.bootstrapPath || '/stylesheets/bootstrap.min.css'; // Path to Bootstrap CSS.

    // Passport.js serialization of user objects.
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // Passport.js deserialization of user objects.
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    // Configure Express application settings and middleware.
    app.configure(function() {
        app.set('port', process.env.PORT || options.localPort || 3000); // Set application port.
        app.set('views', './views'); // Specify the directory for view templates.
        app.set('view engine', 'jade'); // Set the view engine to Jade.
        app.use(express.favicon()); // Serve a favicon.
        // app.use(express.logger('dev')); // Logger middleware, commented out in original.
        app.use(express.bodyParser()); // Parses request bodies.
        app.use(express.methodOverride()); // Enables HTTP method override.
        app.use(express.cookieParser(options.cookieSecret || Math.random().toString(36).substring(7))); // Cookie parser with a secret.
        app.use(express.session()); // Session middleware.
        app.use(passport.initialize()); // Initialize Passport.
        app.use(passport.session()); // Enable Passport session support.
        app.use(function(req, res, next) {
            // Middleware to make the user object available in all templates.
            res.locals.user = req.user;
            next(); // Pass control to the next middleware.
        });
        app.use(require('stylus').middleware(__dirname + '/resources')); // Stylus middleware for CSS preprocessing.
        app.use(express.static(path.join(__dirname, 'resources'))); // Serve static files from 'resources'.
        app.use(express.static(__dirname + '/../../public')); // Serve static files from a higher-level 'public' directory.
        app.use(app.router); // Use the Express router.
    });

    // Configure settings specific to the 'development' environment.
    app.configure('development', function() {
        app.use(express.errorHandler()); // Error handling middleware for development.
    });

    var callbackURL; // Variable to store the Google OAuth callback URL.
    var realm; // Variable to store the Google OAuth realm.

    // Determine the callback URL and realm based on the environment.
    if (!process.env.PORT) {
        callbackURL = 'http://localhost:' + app.get('port') + '/auth/google/return';
        realm = 'http://localhost:' + app.get('port');
    } else {
        callbackURL = options.liveDomain + '/auth/google/return';
        realm = options.liveDomain;
    }

    // Configure and use the Google OAuth strategy for Passport.
    passport.use(new GoogleStrategy({
            returnURL: callbackURL, // URL to return to after Google authentication.
            realm: realm // Realm for Google authentication.
        },
        function(identifier, profile, done) {
            // Asynchronous processing of the user profile.
            process.nextTick(function() {
                profile.identifier = identifier; // Attach the identifier to the profile.
                return done(null, profile); // Pass the profile to the next step.
            });
        }
    ));

    // Define application routes.
    app.get('/', routes.index); // Home page.
    app.get('/post/:title', routes.post); // Route for individual blog posts.

    // Route for creating a new post, requires admin authentication.
    app.get('/newPost', ensureAdmin, routes.newPost);

    // Route to handle creation of a post in the database.
    app.get('/createPost', function(req, res) {
        db.posts.create({
            title: req.query.title,
            content: req.query.content,
            status: req.query.status
        }).success(function(result) {
            res.redirect('/'); // Redirect to home page on success.
        });
    });

    // Route for editing an existing post, requires admin authentication.
    app.get('/post/:title/:mode', ensureAdmin, routes.editPost);

    // Route to handle updating a post in the database.
    app.get('/updatePost', ensureAdmin, function(req, res) {
        db.posts.find({
            where: {
                id: req.query.postId
            }
        }).success(function(post) {
            // Update post properties.
            post.title = req.query.title;
            post.content = req.query.content;
            post.createdAt = new Date(moment(req.query.createdAt, "MM/DD/YYYY").utc());
            post.status = req.query.status;
            post.save(); // Save the updated post.
            res.redirect('/'); // Redirect to home page.
        });
    });

    // Google login route.
    app.get('/login',
        passport.authenticate('google', {
            failureRedirect: '/'
        }), // Authenticate with Google, redirect to home on failure.
        function(req, res) {
            res.redirect('/'); // Redirect to home on successful authentication.
        });

    // Google authentication callback route.
    app.get('/auth/google/return', passport.authenticate('google', {
        failureRedirect: '/'
    }), function(req, res) {
        // Check if the authenticated user is an admin.
        if (req.user && (req.user.emails[0].value == options.adminGoogleEmail || options.adminGoogleEmail == "*")) {
            res.redirect('/'); // Redirect to home for admin.
        } else {
            res.redirect('/logout'); // Log out non-admin users.
        }
    });

    // Logout route.
    app.get('/logout', function(req, res) {
        req.logout(); // Log out the user.
        res.redirect('/'); // Redirect to home page.
    });

    // Create and start the HTTP server.
    http.createServer(app).listen(app.get('port'), function() {
        console.log('Blog started on port ' + app.get('port') + '.'); // Log server start message.
        console.log('Go to /login to create and edit blog entries.'); // Instructions for user.
    });

    /**
     * Middleware function to ensure the user is an admin.
     * @param {object} req - The request object.
     * @param {object} res - The response object.
     * @param {function} next - The next middleware function.
     */
    function ensureAdmin(req, res, next) {
        if (req.user) {
            return next();
        } // If user is logged in, proceed.
        res.redirect('/'); // Otherwise, redirect to home.
    }

    // Dynamically add custom pages if provided in options.
    if (options.pages) {
        options.pages.forEach(function(page) {
            app.get(page.path, page.callback); // Register each custom page route.
        });
    }

}; // End of exports.start function.