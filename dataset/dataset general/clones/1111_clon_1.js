/*
 * This file contains the core logic for a simple blog application.
 * It uses Express.js for routing and handling HTTP requests.
 *
 * Generated as a Type I clone: extensive whitespace and comment changes applied.
 */

var express      =      require('express');  // Web framework
var http         =      require('http');     // HTTP server module
var path         =      require('path');     // Path utility module
var util         =      require('util');     // Utility module (not extensively used here)
var RSS          =      require('rss');      // RSS feed generation library
var Post         =      require('./models/Post'); // Mongoose Post model
var EventEmitter =      require('events').EventEmitter; // Event emitter for custom events

// Main Express application instance, also exported for external use.
var app          = module.exports.app = express();

/*
 * Global configuration object for the blog.
 * These settings define various aspects of the application's behavior.
 */
var config = {
  name       : 'Simple Blog', // Name of the blog
  publicPath : '/public',     // Path for static assets
  viewPath   : '/views',      // Path for view templates
  dumpPath   : false,         // Endpoint for dumping posts (e.g., '/posts.json')
  slugType   : 'title',       // How slugs are generated (e.g., from title)
  rootDir    : __dirname,     // Root directory of the application
  redirectWWW: true,          // Redirect non-www to www or vice-versa
  pageSize   : 3,             // Number of posts per page
  secret     : process.env.BLOG_SECRET || 'password', // Secret for admin actions
  rss        : false          // RSS feed configuration (false if disabled)
};

// Flag to track if the application has been initialized.
var isSetup = false;

/**
 * Initializes the Express application with various settings and middleware.
 * This function can also accept a user-defined configuration to override defaults.
 * @param {object} userConfig - Optional configuration object to merge with defaults.
 */
var setup = module.exports.setup = function( userConfig )
{
    // If user configuration is provided, merge it with the default config.
    if ( userConfig )
    {
        for ( var key in userConfig )
        {
            config[key] = userConfig[key]; // Overwrite or add configuration properties
        }
    }

    // Mark the application as setup.
    isSetup = true;

    // Configure the Express application environment.
    app.configure( function()
    {
        app.set( 'port', process.env.PORT || 5000 ); // Set the port for the server
        app.set( 'postsPerPage', config.pageSize );  // Set the number of posts to display per page
        app.set( 'prod', process.env.NODE_ENV === 'production' ); // Determine if in production mode
        app.set( 'views', config.rootDir + config.viewPath );     // Set the views directory
        app.set( 'view engine', 'jade' );                         // Set the view engine to Jade

        // Optional: Redirect traffic from www to non-www or vice-versa based on config.
        if ( config.redirectWWW )
        {
            app.use( function( req, res, next )
            {
                if ( req.headers.host.match(/^www/) !== null ) // Check if host starts with 'www'
                {
                    // Perform a 301 permanent redirect
                    res.redirect( 301, 'http://' + req.headers.host.replace(/^www\./, '') + req.url );
                }
                else
                {
                    next(); // Continue to the next middleware
                }
            });
        }

        app.use( express.compress() ); // Enable GZIP compression for responses
        // Serve favicon
        app.use( express.favicon( config.rootDir + config.publicPath + '/favicon.ico' ) );
        app.use( express.logger('dev') );     // Log HTTP requests in 'dev' format
        app.use( express.bodyParser() );      // Parse request bodies (JSON, URL-encoded)
        app.use( express.methodOverride() );  // Allow usage of HTTP verbs like PUT or DELETE
        // Middleware for Stylus CSS preprocessing
        app.use( require('stylus').middleware( config.rootDir + config.publicPath ) );
        // Serve static files from the public directory
        app.use( express['static']( config.rootDir + config.publicPath ) );

        /*
         * Custom middleware to set up `app.locals` for use in templates.
         * This includes host, RSS status, base URL, blog name, and current path.
         * It also calculates total posts and total pages, caching them.
         */
        app.use( function( req, res, next )
        {
            var protocol = req.connection.encrypted ? 'https://' : 'http://'; // Determine protocol

            app.locals.host        = req.headers.host;          // Current host
            app.locals.rssEnabled  = !!config.rss;              // Is RSS enabled?
            app.locals.baseUrl     = protocol + app.locals.host; // Base URL for the blog
            app.locals.rssURL      = app.locals.baseUrl + '/rss.xml'; // RSS feed URL
            app.locals.blogName    = config.name;               // Blog's name
            app.locals.currentPath = req.originalUrl;           // Current request path

            // Calculate total posts and pages only if not already cached.
            if ( app.locals.totalPosts === undefined )
            {
                Post.where('published', true).count().exec( function( err, data )
                {
                    app.locals({ totalPosts : data }); // Cache total published posts
                    // Calculate and cache total pages, using base 10 for parseInt
                    app.locals({ totalPages : Math.ceil( data / app.get('postsPerPage'), 10 ) });
                    next(); // Continue to the next middleware
                });
            }
            else
            {
                next(); // If already cached, just continue
            }
        });

        app.use( app.router ); // Enable Express router
        // Handle 404 errors (not found)
        app.use( function( req, res )
        {
            res.status(404).render('error', {
                title: 'Not Found' // Title for the error page
            });
        });
    });

    // Development-specific configuration.
    app.configure( 'development', function()
    {
        app.use( express.errorHandler() ); // Enable error handling in development
    });

    // Route for the home page, displaying a paginated list of posts.
    app.get( '/', function( req, res )
    {
        var limit = config.pageSize; // Number of posts to fetch per page

        // Allow 'p' or 'page' query parameters for pagination.
        req.query.page = req.query.p || req.query.page;

        Post
            .where( 'published', true )       // Only show published posts
            .sort( { date : 'desc' } )        // Sort by date in descending order
            .limit( limit )                   // Limit results to page size
            // Skip posts based on current page number
            .skip( Math.max( 0, req.query.page - 1 ) * limit || 0 )
            .exec( function( err, posts )
            {
                if ( err ) { res.statusCode(500); res.end(); } // Handle server error
                res.render( 'index', {
                    title : '',                                 // Page title
                    posts : posts,                              // Posts for the current page
                    page  : parseInt( req.query.page, 10 ) || 1 // Current page number, default to 1
                });
            });
    });

    // Route for displaying draft posts (unpublished).
    app.get( '/drafts', function( req, res )
    {
        Post
            .where( 'published', false ) // Fetch only unpublished posts
            .sort( { date : 'desc' } )   // Sort by date in descending order
            .exec( function( err, posts )
            {
                if ( err ) { res.statusCode(500); res.end(); } // Handle server error
                res.render( 'drafts', {
                    title : 'Drafts', // Page title
                    posts : posts     // List of draft posts
                });
            });
    });

    // Route for dumping all published posts as JSON, if enabled in config.
    if ( config.dumpPath )
    {
        app.get( config.dumpPath, function( req, res )
        {
            Post
                .where( 'published', true )    // Only published posts
                .sort( { 'created' : 'desc' } ) // Sort by creation date
                .exec( function( err, posts )
                {
                    if ( err ) { res.statusCode(500); res.end(); } // Handle server error
                    res.json( posts ); // Respond with JSON array of posts
                });
        });
    }

    // Route for displaying recent comments.
    app.get( '/comments', function( req, res )
    {
        Post
            .where( 'numComments' ).gt(0)       // Posts with more than 0 comments
            .sort( { 'comments.date' : 'desc' } ) // Sort by comment date
            .limit( 10 )                         // Limit to 10 recent comments
            .exec( function( err, posts )
            {
                if ( err ) { res.statusCode(500); res.end(); } // Handle server error
                res.render( 'comments', {
                    title : 'Comments', // Page title
                    posts : posts       // Posts containing recent comments
                });
            });
    });

    // Route for displaying the new post creation form.
    app.get( '/new', function( req, res )
    {
        res.render( 'newPost', { title : 'New Post', post : false } ); // Render new post form
    });

    // Route for editing an existing post, identified by its slug.
    app.get( '/edit/post/:slug', function( req, res, next )
    {
        Post
            .where( 'slug', req.params.slug ) // Find post by slug
            .findOne( function( err, post )
            {
                if ( err || !post ) { return next(); } // If not found, pass to next middleware (404)
                res.render( 'newPost', { title : 'Edit Post', isEditing : true, post : post } ); // Render edit form
            });
    });

    // Shorthand route for viewing a post (redirects to full URL).
    app.get( '/p/:slug', function( req, res )
    {
        var url = req.protocol + '://' + req.host + '/post/' + req.params.slug; // Construct full URL
        // Note: This won't work if a specific port is required in the URL.
        res.redirect( 301, url ); // Perform a 301 permanent redirect
    });

    // Route for viewing a single post, identified by its slug.
    app.get( '/post/:slug', function( req, res, next )
    {
        Post
            .where( 'slug', req.params.slug ) // Find post by slug
            .findOne( function( err, post )
            {
                if ( err || !post ) { return next(); } // If not found, pass to next middleware (404)
                res.render( 'post', { title : post.title, post : post } ); // Render the post page
            });
    });

    // Route for viewing posts filtered by a specific tag.
    app.get( '/tag/:tag', function( req, res )
    {
        Post
            .where( 'tags', req.params.tag )      // Find posts with the given tag
            .where( 'published', true )           // Only published posts
            .sort( { date : 'desc' } )            // Sort by date descending
            .exec( function( err, posts )
            {
                if ( err ) { res.statusCode = 500; res.end(); } // Handle server error
                if ( posts )
                {
                    // var post = posts[0]; // This line seems unused, removed comment.
                    res.render( 'tag', { title : '#' + req.params.tag, posts : posts, tag : req.params.tag } ); // Render tag page
                }
                else
                {
                    res.statusCode = 404; // Set status to Not Found
                    res.end();            // End the response
                }
            });
    });

    // Route for submitting a new post.
    app.post( '/new', function( req, res )
    {
        // In production, require a secret for submission.
        if (
            process.env.NODE_ENV === 'production' &&
            req.body.secret !== config.secret
        )
        {
            res.statusCode = 400; // Bad Request
            res.end();            // End response
        }
        else
        {
            new Post( req.body ) // Create a new Post instance from request body
                .setSlugType( config.slugType ) // Set slug generation type
                .save( function( err, data )
                {
                    if ( err )
                    {
                        res.statusCode = 400; // Bad Request
                        res.json( err );      // Respond with error JSON
                        console.log( 'Error submitting post: ', err ); // Log error
                    }
                    else
                    {
                        app.locals({ totalPosts : undefined }); // Invalidate totalPosts cache
                        res.json( data );                       // Respond with new post data
                    }
                });
        }
    });

    // Route for updating an existing post.
    app.put( '/edit/:slug', function( req, res )
    {
        // In production, require a secret for updates.
        if (
            process.env.NODE_ENV === 'production' &&
            req.body.secret !== config.secret
        )
        {
            res.statusCode = 400; // Bad Request
            res.end();            // End response
        }
        else
        {
            Post
                .where( 'slug', req.params.slug ) // Find post by slug
                .findOne( function( err, post )
                {
                    if ( err || !post ) { res.statusCode = 404; res.end(); return; } // Not Found or Error

                    // Update post fields from request body.
                    post.md      = req.body.md;
                    post.tags    = req.body.tags;
                    post.title   = req.body.title;

                    // If the post was not published or is being unpublished, regenerate slug.
                    if ( !post.published || !req.body.published )
                    {
                        post.setSlug();
                    }
                    post.published = req.body.published; // Update published status

                    post.save( function( err, newPost )
                    {
                        if ( err ) { res.statusCode = 500; res.end(); return console.log(err); } // Server Error
                        res.json( newPost ); // Respond with updated post data
                    });
                });
        }
    });

    // Route for previewing a post before submission.
    app.post( '/preview', function( req, res )
    {
        var post = new Post( req.body ); // Create a temporary post object
        res.render( 'preview', { title : post.title, post : post } ); // Render preview page
    });

    // Route for submitting a comment to a post.
    app.post( '/post/:slug/comment', function( req, res )
    {
        // Validate comment body and name.
        if ( !( req.body && req.body.name && req.body.body ) )
        {
            res.statusCode = 500; res.end(); return; // Bad Request or Missing Data
        }
        Post
            .where( 'slug', req.params.slug ) // Find target post by slug
            .where( 'published', true )       // Must be a published post
            .findOne( function( err, post )
            {
                if ( err || !post ) { res.statusCode = 404; res.end(); return; } // Not Found or Error
                var comment = req.body; // Extract comment data
                post.comments.push( comment ); // Add comment to post's comments array

                simpleEvents.emit( 'comment', comment ); // Emit a custom 'comment' event

                post.save( function( err, data )
                {
                    if ( err )
                    {
                        res.statusCode = 500; // Server Error
                        res.end();            // End response
                        console.log( 'Error submitting comment: ', err ); // Log error
                    }
                    else
                    {
                        res.json( data ); // Respond with updated post data (including new comment)
                    }
                });
            });
    });

    // RSS Feed generation, if configured.
    if ( config.rss )
    {
        app.get( '/rss.xml', function( req, res )
        {
            Post
                .where( 'published', true )          // Only published posts
                .sort( { date : 'desc' } )           // Sort by date descending
                .limit( config.rss.limit || 10 )     // Limit number of items in feed
                .exec( function( err, posts )
                {
                    if ( err )
                    {
                        res.status(500).end(); // Internal Server Error
                        console.warn( 'Failed to get posts for RSS feed ', err.stack ); // Log warning
                        return;
                    }

                    var baseUrl = app.locals.baseUrl; // Get base URL from app locals

                    // Create new RSS feed instance.
                    var feed = new RSS({
                        title       : config.name,                           // Feed title
                        description : config.rss.description || '',          // Feed description
                        feed_url    : baseUrl + '/rss.xml',                  // URL of the feed itself
                        site_url    : baseUrl,                               // Blog's main URL
                        image_url   : baseUrl + ( config.rss.img || '/favicon.ico' ), // Image for the feed
                        author      : config.rss.author || config.name       // Author of the feed
                    });

                    // Add each post as an item to the RSS feed.
                    for ( var i = 0; i < posts.length; i++ )
                    {
                        var post = posts[i];
                        feed.item({
                            title       : post.title,              // Post title
                            description : post.body,               // Post content (body)
                            url         : baseUrl + '/post/' + post.slug, // URL to the full post
                            date        : post.date                // Publication date
                        });
                    }

                    res.setHeader( 'Content-Type', 'application/xml' ); // Set content type header
                    res.end( feed.xml() );                              // Send the XML feed
                });
        });
    }
};

/**
 * Starts the HTTP server and listens for incoming requests.
 * Automatically calls setup() if the application hasn't been configured yet.
 */
module.exports.start = function()
{
    if ( !isSetup ) { setup(); } // Ensure setup is called if not already done.

    // Create and start the HTTP server.
    http.createServer(app).listen(app.get('port'), function()
    {
        console.log( 'Started ' + config.name + ' on port ' + app.get('port') ); // Log server start

        simpleEvents.emit('start', { config : config }); // Emit a custom 'start' event
    });
};

// Custom event emitter for application-wide events.
var simpleEvents = module.exports.events = new EventEmitter();