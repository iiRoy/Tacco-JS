const webFramework = require('express');
const serverModule = require('http');
const filePathUtil = require('path');
const syndicationFeed = require('rss');
const ArticleModel = require('./models/Post');
const EventHub = require('events').EventEmitter;

const webApp = module.exports.app = webFramework();

const appConfig = {
  applicationName: 'Simple Blog System',
  publicAssetsPath: '/static',
  templatePath: '/templates',
  dataExportEndpoint: null, // Renamed from dumpPath
  permalinkFormat: 'title', // Renamed from slugType
  baseDirectory: __dirname,
  redirectToWww: true,
  defaultPageSize: 5, // Renamed from pageSize, changed value
  securityToken: process.env.BLOG_SECRET_KEY || 'insecure_default_key', // Renamed from secret
  syndication: { // Renamed from rss, now an object
    enabled: false,
    description: 'Latest articles from our blog',
    itemLimit: 10,
    imageUrl: '/favicon.ico',
    authorName: 'Blog Admin'
  },
  serverPort: process.env.PORT || 4000, // Added default port to config
  environment: process.env.NODE_ENV || 'development' // Added environment to config
};

let isInitialized = false;

// Helper to refresh total post counts
const refreshContentStatistics = (callback) => {
  ArticleModel.where('published', true).count().exec((err, count) => {
    if (err) {
      console.error('Error fetching total post count:', err);
      webApp.locals.totalArticles = 0;
      webApp.locals.totalPages = 0;
    } else {
      webApp.locals.totalArticles = count;
      webApp.locals.totalPages = Math.ceil(count / webApp.get('articlesPerPage'));
    }
    if (callback) callback();
  });
};

const initializeApplication = module.exports.initializeApplication = function(overrideSettings) {
  if (overrideSettings) {
    // Merge user settings, deep merge for syndication
    Object.keys(overrideSettings).forEach(settingKey => {
      if (settingKey === 'syndication' && typeof overrideSettings[settingKey] === 'object') {
        Object.assign(appConfig.syndication, overrideSettings[settingKey]);
      } else {
        appConfig[settingKey] = overrideSettings[settingKey];
      }
    });
  }

  isInitialized = true;

  // Configure Express application settings
  webApp.set('port', appConfig.serverPort);
  webApp.set('articlesPerPage', appConfig.defaultPageSize); // Renamed from postsPerPage
  webApp.set('isProductionEnv', appConfig.environment === 'production'); // Renamed from prod
  webApp.set('views', filePathUtil.join(appConfig.baseDirectory, appConfig.templatePath)); // Using path.join for robustness
  webApp.set('view engine', 'pug'); // Changed view engine to pug for variety

  // --- Middleware Setup ---
  // Redirect WWW to non-WWW if configured
  if (appConfig.redirectToWww) {
    webApp.use((request, response, nextMiddleware) => {
      const hostHeader = request.headers.host;
      if (hostHeader && hostHeader.startsWith('www.')) {
        const targetUrl = `${request.protocol}://${hostHeader.replace(/^www\./, '')}${request.originalUrl}`;
        console.log(`Redirecting WWW request to: ${targetUrl}`);
        return response.redirect(301, targetUrl);
      }
      nextMiddleware();
    });
  }

  // Standard Express middleware
  webApp.use(webFramework.compress());
  webApp.use(webFramework.favicon(filePathUtil.join(appConfig.baseDirectory, appConfig.publicAssetsPath, 'favicon.ico')));
  webApp.use(webFramework.logger(appConfig.environment === 'production' ? 'combined' : 'dev')); // Conditional logger format
  webApp.use(webFramework.json()); // Use specific JSON/URLencoded parsers
  webApp.use(webFramework.urlencoded({ extended: true }));
  webApp.use(webFramework.methodOverride());
  webApp.use(require('stylus').middleware(filePathUtil.join(appConfig.baseDirectory, appConfig.publicAssetsPath)));
  webApp.use(webFramework.static(filePathUtil.join(appConfig.baseDirectory, appConfig.publicAssetsPath)));

  // Custom middleware for application locals and content statistics
  webApp.use((request, response, nextMiddleware) => {
    const isSecureConnection = request.secure || (request.headers['x-forwarded-proto'] === 'https'); // More robust check
    const protocolPrefix = isSecureConnection ? 'https://' : 'http://';
    const currentHost = request.headers.host;
    const currentPath = request.originalUrl;

    // Set dynamic locals for templates
    Object.assign(webApp.locals, {
      siteHost: currentHost,
      syndicationEnabled: appConfig.syndication.enabled,
      baseAddress: `${protocolPrefix}${currentHost}`,
      syndicationUrl: `${protocolPrefix}${currentHost}/feed.xml`, // Renamed RSS URL
      blogTitle: appConfig.applicationName,
      blogTagline: 'A simple, elegant blog.', // Added new local
      currentRequestPath: currentPath
    });

    // Refresh content statistics if not set, or on demand
    if (webApp.locals.totalArticles === undefined) {
      refreshContentStatistics(nextMiddleware);
    } else {
      nextMiddleware();
    }
  });

  webApp.use(webApp.router); // Use the router explicitly

  // 404 Not Found Handler
  webApp.use((request, response) => {
    console.warn(`404: Resource not found for URL: ${request.originalUrl}`);
    response.status(404).render('error-page', { // Renamed template
      pageTitle: 'Resource Not Found',
      errorCode: 404,
      errorMessage: `The requested URL '${request.originalUrl}' could not be found.`
    });
  });

  // Development Error Handler
  if (appConfig.environment === 'development') {
    webApp.use(webFramework.errorHandler({ dumpExceptions: true, showStack: true })); // More explicit error handling
  }

  // --- Route Definitions ---

  // Main blog page - lists paginated articles
  webApp.get('/', (request, response) => {
    const itemLimit = webApp.get('articlesPerPage');
    const requestedPageNum = Number(request.query.p || request.query.page) || 1; // Use Number() for conversion

    if (requestedPageNum < 1) {
      console.warn(`Invalid page number requested: ${requestedPageNum}. Defaulting to page 1.`);
      return response.redirect('/');
    }

    const skipCount = (requestedPageNum - 1) * itemLimit;

    ArticleModel
      .where('published', true)
      .sort({ publicationDate: -1 }) // Renamed 'date' to 'publicationDate', 'desc' to -1
      .limit(itemLimit)
      .skip(skipCount)
      .exec((error, articles) => { // Renamed posts to articles
        if (error) {
          console.error('Error fetching articles for homepage:', error);
          return response.status(500).render('error-page', { pageTitle: 'Server Error', errorCode: 500, errorMessage: 'Failed to load articles.' });
        }
        console.log(`Successfully loaded page ${requestedPageNum} with ${articles.length} articles.`);
        response.render('article-list', { // Renamed template
          pageTitle: 'Home',
          articles: articles,
          currentPage: requestedPageNum,
          totalAvailablePages: webApp.locals.totalPages // Use pre-calculated total pages
        });
      });
  });

  // Display unpublished draft articles
  webApp.get('/drafts', (request, response) => {
    // In a real app, this would require authentication/authorization
    if (appConfig.environment === 'production' && request.query.secret !== appConfig.securityToken) {
        return response.status(403).render('error-page', { pageTitle: 'Forbidden', errorCode: 403, errorMessage: 'Access to drafts is restricted.' });
    }

    ArticleModel
      .where('published', false)
      .sort({ creationTimestamp: -1 }) // Renamed 'date' to 'creationTimestamp'
      .exec((error, articles) => {
        if (error) {
          console.error('Error fetching draft articles:', error);
          return response.status(500).render('error-page', { pageTitle: 'Server Error', errorCode: 500, errorMessage: 'Failed to retrieve drafts.' });
        }
        response.render('drafts-overview', { // Renamed template
          pageTitle: 'Draft Articles',
          articles: articles
        });
      });
  });

  // JSON data export endpoint (if enabled)
  if (appConfig.dataExportEndpoint && typeof appConfig.dataExportEndpoint === 'string' && appConfig.dataExportEndpoint.length > 1) {
    webApp.get(appConfig.dataExportEndpoint, (request, response) => {
      // Add a simple security check for the dump path
      if (request.query.token !== appConfig.securityToken) {
        return response.status(401).send('Unauthorized access to data export.');
      }

      ArticleModel
        .where('published', true)
        .sort({ 'creationTimestamp': -1 })
        .exec((error, articles) => {
          if (error) {
            console.error('Error exporting article data:', error);
            return response.status(500).send('Failed to export data.');
          }
          response.setHeader('Content-Type', 'application/json');
          response.setHeader('Content-Disposition', `attachment; filename="blog_articles_export_${Date.now()}.json"`); // Suggest a filename
          response.json(articles);
        });
    });
  }

  // Display recent comments across all articles
  webApp.get('/recent-comments', (request, response) => { // Renamed from /comments
    const commentFetchLimit = appConfig.syndication.itemLimit || 10; // Use a configurable limit

    ArticleModel
      .where('commentCount').gt(0) // Renamed numComments to commentCount
      .sort({ 'comments.submissionDate': -1 }) // Renamed 'comments.date' to 'comments.submissionDate'
      .limit(commentFetchLimit)
      .exec((error, articlesWithComments) => { // Renamed posts to articlesWithComments
        if (error) {
          console.error('Error fetching recent comments:', error);
          return response.status(500).render('error-page', { pageTitle: 'Server Error', errorCode: 500, errorMessage: 'Could not load recent comments.' });
        }
        response.render('comment-feed', { // Renamed template
          pageTitle: 'Latest Discussions',
          articles: articlesWithComments
        });
      });
  });

  // Form to create a new article
  webApp.get('/create-new-article', (request, response) => { // Renamed from /new
    response.render('edit-article', { pageTitle: 'Compose New Article', currentArticle: null, isEditing: false }); // Renamed template and variables
  });

  // Form to edit an existing article
  webApp.get('/modify-article/:articleIdentifier', (request, response, nextMiddleware) => { // Renamed from /edit/post/:slug
    const articleId = request.params.articleIdentifier;
    if (!articleId) {
      console.warn('Attempted to edit article without an identifier.');
      return response.status(400).send('Article identifier is required.');
    }

    ArticleModel
      .where('slug', articleId)
      .findOne((error, foundArticle) => { // Renamed post to foundArticle
        if (error || !foundArticle) {
          console.warn(`Article not found for editing: ${articleId}`);
          return nextMiddleware(); // Pass to 404 handler
        }
        response.render('edit-article', { pageTitle: `Edit: ${foundArticle.title}`, isEditing: true, currentArticle: foundArticle });
      });
  });

  // Shorthand URL redirect for articles
  webApp.get('/a/:articleIdentifier', (request, response) => { // Renamed from /p/:slug
    const articleId = request.params.articleIdentifier;
    const targetUrl = new URL(filePathUtil.join('/article', articleId), webApp.locals.baseAddress).href; // Use URL object for safety
    console.log(`Redirecting shorthand article URL '/a/${articleId}' to '${targetUrl}'`);
    response.redirect(301, targetUrl);
  });

  // View a single article
  webApp.get('/article/:articleIdentifier', (request, response, nextMiddleware) => { // Renamed from /post/:slug
    const articleId = request.params.articleIdentifier;
    ArticleModel
      .where('slug', articleId)
      .findOne((error, foundArticle) => {
        if (error || !foundArticle) {
          console.warn(`Article not found: ${articleId}`);
          return nextMiddleware(); // Pass to 404 handler
        }
        if (!foundArticle.published && appConfig.environment === 'production') {
            return response.status(403).render('error-page', { pageTitle: 'Restricted Access', errorCode: 403, errorMessage: 'This article is not yet published.' });
        }
        response.render('single-article', { pageTitle: foundArticle.title, currentArticle: foundArticle }); // Renamed template and variables
      });
  });

  // View articles by tag
  webApp.get('/topic/:tagLabel', (request, response) => { // Renamed from /tag/:tag
    const tagLabel = request.params.tagLabel;
    if (!tagLabel) {
      return response.status(400).send('Tag label is required.');
    }

    ArticleModel
      .where('tags', tagLabel)
      .where('published', true)
      .sort({ publicationDate: -1 })
      .exec((error, taggedArticles) => { // Renamed posts to taggedArticles
        if (error) {
          console.error(`Error fetching articles for tag '${tagLabel}':`, error);
          return response.status(500).render('error-page', { pageTitle: 'Server Error', errorCode: 500, errorMessage: `Failed to load articles for tag '${tagLabel}'.` });
        }
        if (!taggedArticles || taggedArticles.length === 0) {
          return response.status(404).render('error-page', {
            pageTitle: `Tag '${tagLabel}' Not Found`,
            errorCode: 404,
            errorMessage: `No articles found for the tag '#${tagLabel}'.`
          });
        }
        response.render('tag-articles', { pageTitle: `Topic: #${tagLabel}`, articles: taggedArticles, selectedTag: tagLabel }); // Renamed template and variables
      });
  });

  // POST: Submit a new article
  webApp.post('/publish-article', (request, response) => { // Renamed from /new
    // Security check for production environment
    const isProd = webApp.get('isProductionEnv');
    const providedSecret = request.body.authSecret; // Renamed 'secret' to 'authSecret'
    if (isProd && providedSecret !== appConfig.securityToken) {
      console.warn('Unauthorized attempt to publish article.');
      return response.status(403).send('Forbidden: Invalid security token.');
    }

    // Basic input validation
    if (!request.body.title || !request.body.markdownContent) { // Renamed 'md' to 'markdownContent'
        return response.status(400).json({ message: 'Title and Markdown content are required.' });
    }

    const newArticleData = {
        title: request.body.title,
        md: request.body.markdownContent,
        tags: request.body.tags ? request.body.tags.split(',').map(t => t.trim()).filter(t => t) : [], // Clean up tags
        published: request.body.published === true || request.body.published === 'true', // Ensure boolean
        author: request.body.author || 'Anonymous' // Add author field
    };

    new ArticleModel(newArticleData)
      .setSlugType(appConfig.permalinkFormat) // Use new config name
      .save((error, savedArticle) => { // Renamed data to savedArticle
        if (error) {
          console.error('Error saving new article:', error);
          return response.status(400).json({ message: 'Failed to save article.', details: error.message });
        }
        // Invalidate cached total post count to force recalculation
        webApp.locals.totalArticles = undefined;
        refreshContentStatistics(); // Refresh statistics asynchronously
        response.status(201).json({ message: 'Article successfully published!', article: savedArticle }); // 201 Created status
      });
  });

  // PUT: Update an existing article
  webApp.put('/update-article/:articleIdentifier', (request, response) => { // Renamed from /edit/:slug
    const isProd = webApp.get('isProductionEnv');
    const providedSecret = request.body.authSecret;
    if (isProd && providedSecret !== appConfig.securityToken) {
      console.warn('Unauthorized attempt to update article.');
      return response.status(403).send('Forbidden: Invalid security token.');
    }

    const articleId = request.params.articleIdentifier;
    if (!articleId) {
        return response.status(400).send('Article identifier is missing for update.');
    }

    ArticleModel
      .where('slug', articleId)
      .findOne((error, existingArticle) => { // Renamed post to existingArticle
        if (error) {
            console.error(`Database error finding article ${articleId} for update:`, error);
            return response.status(500).json({ message: 'Server error during article lookup.' });
        }
        if (!existingArticle) {
            console.warn(`Article not found for update: ${articleId}`);
            return response.status(404).json({ message: 'Article not found.' });
        }

        // Update fields
        existingArticle.md = request.body.markdownContent || existingArticle.md;
        existingArticle.tags = request.body.tags ? request.body.tags.split(',').map(t => t.trim()).filter(t => t) : existingArticle.tags;
        existingArticle.title = request.body.title || existingArticle.title;
        const newPublishedStatus = request.body.published === true || request.body.published === 'true';

        // Regenerate slug if it was not published or if title changed and it's unpublished
        if (!existingArticle.published || !newPublishedStatus || existingArticle.title !== request.body.title) {
          existingArticle.setSlug();
        }
        existingArticle.published = newPublishedStatus;
        existingArticle.lastModified = new Date(); // Added new field for tracking modifications

        existingArticle.save((saveError, updatedArticle) => { // Renamed newPost to updatedArticle
          if (saveError) {
            console.error(`Error updating article ${articleId}:`, saveError);
            return response.status(500).json({ message: 'Failed to update article.', details: saveError.message });
          }
          // Invalidate cached total post count if publication status changed
          if (existingArticle.published !== updatedArticle.published) {
            webApp.locals.totalArticles = undefined;
            refreshContentStatistics();
          }
          response.json({ message: 'Article successfully updated!', article: updatedArticle });
        });
      });
  });

  // POST: Preview article content
  webApp.post('/preview-article', (request, response) => { // Renamed from /preview
    if (!request.body.markdownContent) {
        return response.status(400).send('Markdown content is required for preview.');
    }
    const previewArticle = new ArticleModel({ title: request.body.title || 'Preview', md: request.body.markdownContent });
    response.render('article-preview', { pageTitle: previewArticle.title, currentArticle: previewArticle }); // Renamed template and variables
  });

  // POST: Submit a comment to an article
  webApp.post('/article/:articleIdentifier/add-comment', (request, response) => { // Renamed from /post/:slug/comment
    const articleId = request.params.articleIdentifier;
    const { commenterName, commentBody, commenterEmail } = request.body; // Destructure and rename fields

    if (!(commenterName && commentBody)) {
      console.warn('Missing required fields for comment submission.');
      return response.status(400).json({ message: 'Commenter name and comment body are required.' });
    }

    ArticleModel
      .where('slug', articleId)
      .where('published', true)
      .findOne((error, targetArticle) => { // Renamed post to targetArticle
        if (error) {
            console.error(`Database error finding article ${articleId} for comment:`, error);
            return response.status(500).json({ message: 'Server error during article lookup.' });
        }
        if (!targetArticle) {
            console.warn(`Article not found for commenting: ${articleId}`);
            return response.status(404).json({ message: 'Article not found or not published.' });
        }

        const userComment = {
          author: commenterName,
          email: commenterEmail, // Added email field
          content: commentBody,
          submissionDate: new Date() // Renamed date to submissionDate
        };

        targetArticle.comments.push(userComment);
        targetArticle.commentCount = targetArticle.comments.length; // Update comment count

        globalEventBus.publish('new_comment_received', { articleSlug: articleId, comment: userComment }); // Renamed event and method

        targetArticle.save((saveError, updatedArticleWithComment) => { // Renamed data to updatedArticleWithComment
          if (saveError) {
            console.error('Error saving comment:', saveError);
            return response.status(500).json({ message: 'Failed to save comment.', details: saveError.message });
          }
          response.status(201).json({ message: 'Comment successfully added!', article: updatedArticleWithComment });
        });
      });
  });

  // RSS/Atom Feed (if enabled)
  if (appConfig.syndication.enabled) {
    webApp.get('/feed.xml', (request, response) => { // Renamed from /rss.xml
      ArticleModel
        .where('published', true)
        .sort({ publicationDate: -1 })
        .limit(appConfig.syndication.itemLimit)
        .exec((error, recentArticles) => { // Renamed posts to recentArticles
          if (error) {
            console.error('Failed to get articles for syndication feed:', error.stack);
            return response.status(500).send('Failed to generate feed.');
          }

          const currentBaseAddress = webApp.locals.baseAddress;

          const rssGenerator = new syndicationFeed({ // Renamed feed to rssGenerator
            title: appConfig.applicationName,
            description: appConfig.syndication.description,
            feed_url: `${currentBaseAddress}/feed.xml`,
            site_url: currentBaseAddress,
            image_url: `${currentBaseAddress}${appConfig.syndication.imageUrl}`,
            author: appConfig.syndication.authorName,
            language: 'en', // Added language
            pubDate: new Date().toISOString(), // Added publication date for the feed itself
            ttl: 60 // Added time to live in minutes
          });

          recentArticles.forEach(article => { // Use forEach for iteration
            rssGenerator.item({
              title:  article.title,
              description: article.md, // Use markdown for description, RSS readers will render it
              url: `${currentBaseAddress}/article/${article.slug}`,
              date: article.publicationDate
            });
          });

          response.setHeader('Content-Type', 'application/xml');
          response.end(rssGenerator.xml());
        });
    });
  }
};

const launchServer = module.exports.launchServer = function() {
  if (!isInitialized) {
    console.log('Application not initialized, calling default setup.');
    initializeApplication();
  }

  serverModule.createServer(webApp).listen(webApp.get('port'), () => {
    const serverAddress = `http://localhost:${webApp.get('port')}`;
    console.log(`🚀 Blog system '${appConfig.applicationName}' now operational on port ${webApp.get('port')} (${serverAddress})`);
    if (appConfig.environment === 'development') {
      console.log('Development mode activated. Error logging is verbose.');
    }
    globalEventBus.publish('server_started', { configuration: appConfig, serverUrl: serverAddress }); // Renamed event and data
  });
};

const globalEventBus = module.exports.eventNotifier = new EventHub(); // Renamed simpleEvents to globalEventBus and exports.events to exports.eventNotifier