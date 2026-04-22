let webFramework = require('express');
let webServer = require('http');
let fileSystemPath = require('path');
let utilityFunctions = require('util');
let SyndicationFeed = require('rss');
let Article = require('./models/Post');
let EventDispatcher = require('events').EventEmitter;

// The core web application instance, exposed for external use.
let applicationInstance = module.exports.applicationInstance = webFramework();

// Global configuration object for the application's behavior.
let settingsBundle = {
  applicationName: 'Elegant Journal',
  publicAssetsPath: '/public',
  viewTemplatesPath: '/views',
  dataExportPath: false, // Set to a string path (e.g., '/dump') to enable JSON export.
  identifierType: 'title', // Method for generating article identifiers (slugs).
  rootDirectory: __dirname,
  redirectWWW: true, // Automatically redirect 'www.' URLs to their non-'www.' counterparts.
  itemsPerPage: 3, // Default number of articles to display per page.
  securityKey: process.env.BLOG_SECRET || 'strong_password_phrase', // Secret for administrative actions.
  syndicationConfiguration: false // Can be an object with RSS settings or 'false' to disable.
};

// Internal flag indicating if the application setup has completed.
let isInitialized = false;

// Function to perform initial setup and configuration of the application.
let initializeApplication = module.exports.initializeApplication = function(clientSettings) {
  // If custom settings are provided, merge them with the default configuration.
  if (clientSettings) {
    for (let settingName in clientSettings) {
      settingsBundle[settingName] = clientSettings[settingName];
    }
  }

  // Update the initialization status.
  isInitialized = true;

  // Configure various application settings and middleware.
  applicationInstance.configure(function() {
    applicationInstance.set('port', process.env.PORT || 5000);
    applicationInstance.set('articlesPerPage', settingsBundle.itemsPerPage);
    applicationInstance.set('isProductionEnv', process.env.NODE_ENV === 'production');
    applicationInstance.set('views', settingsBundle.rootDirectory + settingsBundle.viewTemplatesPath);
    applicationInstance.set('view engine', 'jade');

    // Middleware to handle WWW redirection if enabled.
    if (settingsBundle.redirectWWW) {
      applicationInstance.use(function(requestObject, responseObject, nextMiddleware) {
        if (requestObject.headers.host.match(/^www/) !== null ) {
          responseObject.redirect(301, 'http://' + requestObject.headers.host.replace(/^www\./, '') + requestObject.url);
        } else {
          nextMiddleware();
        }
      });
    }
    applicationInstance.use(webFramework.compress());
    applicationInstance.use(webFramework.favicon(settingsBundle.rootDirectory + settingsBundle.publicAssetsPath + '/favicon.ico'));
    applicationInstance.use(webFramework.logger('dev'));
    applicationInstance.use(webFramework.bodyParser());
    applicationInstance.use(webFramework.methodOverride());
    applicationInstance.use(require('stylus').middleware(settingsBundle.rootDirectory + settingsBundle.publicAssetsPath));
    applicationInstance.use(webFramework['static'](settingsBundle.rootDirectory + settingsBundle.publicAssetsPath));

    // Custom middleware to set up local variables for template rendering.
    applicationInstance.use(function(requestObject, responseObject, nextMiddleware) {
      let connectionProtocol = requestObject.connection.encrypted ? 'https://' : 'http://';

      applicationInstance.locals.hostAddress = requestObject.headers.host;
      applicationInstance.locals.rssEnabled = Boolean(settingsBundle.syndicationConfiguration);
      applicationInstance.locals.baseSiteURL = connectionProtocol + applicationInstance.locals.hostAddress;
      applicationInstance.locals.rssFeedURL = applicationInstance.locals.baseSiteURL + '/rss.xml';
      applicationInstance.locals.journalName = settingsBundle.applicationName;
      applicationInstance.locals.currentURI = requestObject.originalUrl;

      // Calculate total article count and pages if not already cached.
      if (applicationInstance.locals.totalArticles === undefined) {
        Article.where('isPublished', true).count().exec( function(errorObject, payloadData) {
          applicationInstance.locals.totalArticles = payloadData;
          applicationInstance.locals.totalArticlePages = Math.ceil(payloadData / applicationInstance.get('articlesPerPage'));
          nextMiddleware();
        });
      } else {
        nextMiddleware();
      }
    });
    applicationInstance.use(applicationInstance.router);

    // Middleware for handling 404 (Not Found) errors.
    applicationInstance.use(function(requestObject, responseObject) {
      responseObject.status(404).render('error', {
        pageTitle: 'Resource Not Found'
      });
    });
  });

  // Environment-specific configuration for development mode.
  applicationInstance.configure('development', function(){
    applicationInstance.use(webFramework.errorHandler());
  });

  // ROUTE DEFINITION: Main Blog Home Page.
  applicationInstance.get('/', function(requestObject, responseObject) {
    let pageLimit = settingsBundle.itemsPerPage;

    // Normalize page query parameter from 'p' or 'page'.
    requestObject.query.page = requestObject.query.p || requestObject.query.page;

    Article
      .where('isPublished', true)
      .sort({ publishDate: 'desc' })
      .limit(pageLimit)
      .skip(Math.max(0, requestObject.query.page - 1) * pageLimit || 0)
      .exec(function(errorObject, articles) {
        if (errorObject) {
          responseObject.status(500).end();
          return;
        }
        responseObject.render('index', {
          pageTitle: '',
          blogEntries: articles,
          currentPage: parseInt(requestObject.query.page, 10) || 1
        });
      });
  });

  // ROUTE DEFINITION: Page displaying unpublished drafts.
  applicationInstance.get('/drafts', function(requestObject, responseObject) {
    Article
      .where('isPublished', false)
      .sort({ publishDate: 'desc' })
      .exec(function(errorObject, articles) {
        if (errorObject) {
          responseObject.status(500).end();
          return;
        }
        responseObject.render('drafts', {
          pageTitle: 'Unpublished Entries',
          blogEntries: articles
        });
      });
  });

  // ROUTE DEFINITION: JSON export of all published articles (if enabled).
  if (settingsBundle.dataExportPath) {
    applicationInstance.get(settingsBundle.dataExportPath, function(requestObject, responseObject) {
      Article
        .where('isPublished', true)
        .sort({ 'creationDate': 'desc' })
        .exec(function(errorObject, articles) {
          if (errorObject) {
            responseObject.status(500).end();
            return;
          }
          responseObject.json(articles);
        });
    });
  }

  // ROUTE DEFINITION: Page displaying recent comments.
  applicationInstance.get('/comments', function(requestObject, responseObject) {
    Article
      .where('commentCount').gt(0)
      .sort({ 'userComments.commentDate': 'desc' })
      .limit(10)
      .exec(function(errorObject, articles) {
        if (errorObject) {
          responseObject.status(500).end();
          return;
        }
        responseObject.render('comments', {
          pageTitle: 'Latest Discussions',
          blogEntries: articles
        });
      });
  });

  // ROUTE DEFINITION: Form for creating a new article.
  applicationInstance.get('/new', function(requestObject, responseObject) {
    responseObject.render('newArticle', { pageTitle: 'Create New Entry', existingArticle: false });
  });

  // ROUTE DEFINITION: Form for editing an existing article.
  applicationInstance.get('/edit/article/:articleIdentifier', function(requestObject, responseObject, nextMiddleware) {
    Article
      .where('articleIdentifier', requestObject.params.articleIdentifier)
      .findOne( function(errorObject, currentArticle) {
        if (errorObject || !currentArticle) {
          return nextMiddleware();
        }
        responseObject.render('newArticle', { pageTitle: 'Modify Entry', isBeingEdited: true, existingArticle: currentArticle });
      });
  });

  // ROUTE DEFINITION: Shorthand URL for viewing an article, redirects to full URL.
  applicationInstance.get('/p/:articleIdentifier', function(requestObject, responseObject) {
    let resourceURL = requestObject.protocol + '://' + requestObject.host + '/article/' + requestObject.params.articleIdentifier;
    // This redirect might not function correctly if a specific port is part of the host.
    responseObject.redirect(301, resourceURL);
  });

  // ROUTE DEFINITION: View a specific article by its identifier.
  applicationInstance.get('/article/:articleIdentifier', function(requestObject, responseObject, nextMiddleware) {
    Article
      .where('articleIdentifier', requestObject.params.articleIdentifier)
      .findOne( function(errorObject, currentArticle) {
        if (errorObject || !currentArticle) {
          return nextMiddleware();
        }
        responseObject.render('article', { pageTitle: currentArticle.headline, blogEntry: currentArticle });
      });
  });

  // ROUTE DEFINITION: View articles filtered by a specific tag.
  applicationInstance.get('/tag/:articleTag', function(requestObject, responseObject) {
    Article
      .where('categorizations', requestObject.params.articleTag)
      .where('isPublished', true)
      .sort({ publishDate: 'desc' })
      .exec(function(errorObject, articles) {
        if (errorObject) {
          responseObject.status(500).end();
          return;
        }
        if (articles) {
          responseObject.render('tag', { pageTitle: '#' + requestObject.params.articleTag, blogEntries: articles, itemTag: requestObject.params.articleTag });
        } else {
          responseObject.status(404).end();
        }
      });
  });

  // ROUTE DEFINITION: Handle submission of a new article.
  applicationInstance.post('/new', function(requestObject, responseObject) {
    if (
      process.env.NODE_ENV === 'production' &&
      requestObject.body.securityKey !== settingsBundle.securityKey
    ) {
      responseObject.status(400).end();
    } else {
      new Article(requestObject.body)
        .setIdentifierType(settingsBundle.identifierType)
        .save(function(errorObject, payloadData) {
          if (errorObject) {
            responseObject.status(400).json(errorObject);
            console.log('Error during article submission: ', errorObject);
          } else {
            applicationInstance.locals.totalArticles = undefined; // Invalidate cached total count.
            responseObject.json(payloadData);
          }
      });
    }
  });

  // ROUTE DEFINITION: Handle updates to an existing article.
  applicationInstance.put('/edit/:articleIdentifier', function(requestObject, responseObject) {
    if (
      process.env.NODE_ENV === 'production' &&
      requestObject.body.securityKey !== settingsBundle.securityKey
    ) {
      responseObject.status(400).end();
    } else {
      Article
        .where('articleIdentifier', requestObject.params.articleIdentifier)
        .findOne( function(errorObject, currentArticle) {
          if (errorObject || !currentArticle) {
            responseObject.status(404).end();
            return;
          }
          currentArticle.markdownContent = requestObject.body.markdownContent;
          currentArticle.categorizations = requestObject.body.categorizations;
          currentArticle.headline = requestObject.body.headline;

          // Regenerate identifier if the article was not published or is being unpublished.
          if (!currentArticle.isPublished || !requestObject.body.isPublished) {
            currentArticle.setSlug();
          }
          currentArticle.isPublished = requestObject.body.isPublished;

          currentArticle.save( function(errorObject, updatedArticle) {
            if (errorObject) {
              responseObject.status(500).end();
              return console.log(errorObject);
            }
            responseObject.json(updatedArticle);
          });
        });
    }
  });

  // ROUTE DEFINITION: Preview an article before saving.
  applicationInstance.post('/preview', function(requestObject, responseObject) {
    let currentArticle = new Article(requestObject.body);
    responseObject.render('preview', { pageTitle: currentArticle.headline, blogEntry: currentArticle });
  });

  // ROUTE DEFINITION: Submit a new comment to an article.
  applicationInstance.post('/article/:articleIdentifier/comment', function(requestObject, responseObject) {
    if (!(requestObject.body && requestObject.body.commenterName && requestObject.body.commentText)) {
      responseObject.status(500).end();
      return;
    }
    Article
      .where('articleIdentifier', requestObject.params.articleIdentifier)
      .where('isPublished', true)
      .findOne( function(errorObject, currentArticle) {
        if (errorObject || !currentArticle) {
          responseObject.status(404).end();
          return;
        }
        let userComment = requestObject.body;
        currentArticle.userComments.push(userComment);

        appNotifications.emit('newComment', userComment);

        currentArticle.save( function(errorObject, payloadData) {
          if (errorObject) {
            responseObject.status(500).end();
            console.log('Error submitting comment: ', errorObject);
          }
          else {
            responseObject.json(payloadData);
          }
        });
      });
  });

  // ROUTE DEFINITION: RSS Feed endpoint (if syndication is configured).
  if (settingsBundle.syndicationConfiguration) {
    applicationInstance.get('/rss.xml', function(requestObject, responseObject) {
      Article
        .where('isPublished', true)
        .sort({ publishDate: 'desc' })
        .limit(settingsBundle.syndicationConfiguration.feedLimit || 10)
        .exec( function(errorObject, articles) {
          if (errorObject) {
            responseObject.status(500).end();
            console.warn('Failed to retrieve articles for RSS feed: ', errorObject.stack);
            return;
          }

          let baseSiteURL = applicationInstance.locals.baseSiteURL;

          let syndicationOutput = new SyndicationFeed({
            title: settingsBundle.applicationName,
            description: settingsBundle.syndicationConfiguration.feedDescription || '',
            feed_url: baseSiteURL + '/rss.xml',
            site_url: baseSiteURL,
            image_url: baseSiteURL + (settingsBundle.syndicationConfiguration.feedImage || '/favicon.ico'),
            author: settingsBundle.syndicationConfiguration.feedAuthor || settingsBundle.applicationName
          });

          for (let index = 0; index < articles.length; index++) {
            let currentArticle = articles[index];
            syndicationOutput.item({
              title:  currentArticle.headline,
              description: currentArticle.articleBody,
              url: baseSiteURL + '/article/' + currentArticle.articleIdentifier,
              date: currentArticle.publishDate
            });
          }

          responseObject.setHeader('Content-Type', 'application/xml');
          responseObject.end(syndicationOutput.xml());
        });
    });
  }
};

// Function to start the web service.
module.exports.commenceService = function() {
  if (!isInitialized) {
    initializeApplication();
  }
  webServer.createServer(applicationInstance).listen(applicationInstance.get('port'), function() {
    console.log('Service "' + settingsBundle.applicationName + '" commenced on port ' + applicationInstance.get('port'));

    appNotifications.emit('serviceStart', { configuration: settingsBundle });
  });
};

// Global event dispatcher for application-wide custom notifications.
let appNotifications = module.exports.appNotifications = new EventDispatcher();