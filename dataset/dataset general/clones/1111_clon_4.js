const ApplicationEngine = require('koa');
const RouterManager = require('koa-router');
const PathResolver = require('node:path'); // Retaining for potential future use, though not directly in this simplified clone
const CompressionModule = require('koa-compress');
const LoggerModule = require('koa-logger');
const BodyParserModule = require('koa-bodyparser');
const StaticContentServer = require('koa-static');
const ViewEngineIntegrator = require('koa-views');
const FaviconHandler = require('koa-favicon');
const MountUtility = require('koa-mount');
const RssFeedGenerator = require('rss');
const EventBroadcaster = require('node:events');

// --- Custom Event System ---
class NotificationHub extends EventBroadcaster {
  trigger(eventName, ...args) {
    this.emit(eventName, ...args);
  }
}
const globalNotifier = new NotificationHub();

// --- Configuration Management ---
class ApplicationConfiguration {
  constructor(initialSettings = {}) {
    this.currentSettings = {
      blogName: 'Koa Content Hub',
      assetPath: '/public',
      templatePath: '/views',
      dataExportPath: false,
      permalinkStyle: 'title',
      baseDirectory: process.cwd(),
      enforceWWW: true,
      itemsPerPage: 3,
      authSecret: process.env.HUB_SECRET || 'secure-passkey',
      rssFeed: false
    };
    this.updateSettings(initialSettings);
  }

  updateSettings(newSettings) {
    Object.assign(this.currentSettings, newSettings);
  }

  get(key) {
    return this.currentSettings[key];
  }
}

// --- Mock Content Model (Type IV clone of Post) ---
let contentDatabase = []; // In-memory "database" for content items
let currentContentId = 1;

class QueryBuilder {
  constructor(collection) {
    this.collection = collection;
    this.filters = [];
    this.sorters = [];
    this.limitVal = null;
    this.skipVal = 0;
  }

  filter(field, value) {
    this.filters.push({ field, value });
    return this;
  }

  greaterThan(field, value) {
    this.filters.push({ field, value, operator: '>' });
    return this;
  }

  sort(criteria) {
    this.sorters.push(criteria);
    return this;
  }

  limit(count) {
    this.limitVal = count;
    return this;
  }

  offset(count) {
    this.skipVal = count;
    return this;
  }

  async count() {
    let results = this._applyFilters(this.collection);
    return results.length;
  }

  async retrieve() {
    let results = this._applyFilters(this.collection);
    results = this._applySorters(results);
    results = this._applyPagination(results);
    return results.map(item => ({ ...item })); // Return copies to prevent direct modification of DB
  }

  async findOne() {
    let results = this._applyFilters(this.collection);
    return results.length > 0 ? { ...results[0] } : null; // Return copy
  }

  _applyFilters(data) {
    return data.filter(item => {
      return this.filters.every(f => {
        if (f.operator === '>') {
          return item[f.field] > f.value;
        }
        if (Array.isArray(item[f.field])) { // For tags
          return item[f.field].includes(f.value);
        }
        return item[f.field] === f.value;
      });
    });
  }

  _applySorters(data) {
    if (this.sorters.length === 0) return data;
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      for (const criteria of this.sorters) {
        for (const field in criteria) {
          const order = criteria[field] === 'desc' ? -1 : 1;
          let valA = a[field];
          let valB = b[field];

          // Special handling for nested fields like 'comments.date'
          if (field.includes('.')) {
            const parts = field.split('.');
            if (parts[0] === 'comments' && parts[1] === 'date') {
              valA = a.comments && a.comments.length > 0 ? a.comments[0].date : new Date(0);
              valB = b.comments && b.comments.length > 0 ? b.comments[0].date : new Date(0);
            }
          }

          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
        }
      }
      return 0;
    });
    return sortedData;
  }

  _applyPagination(data) {
    let paginated = data;
    if (this.skipVal > 0) {
      paginated = paginated.slice(this.skipVal);
    }
    if (this.limitVal !== null) {
      paginated = paginated.slice(0, this.limitVal);
    }
    return paginated;
  }
}

class ContentItem {
  constructor(data) {
    this.data = {
      _id: data._id || null,
      title: data.title || '',
      md: data.md || '',
      tags: data.tags || [],
      published: data.published === true,
      date: data.date instanceof Date ? data.date : (data.date ? new Date(data.date) : new Date()),
      created: data.created instanceof Date ? data.created : (data.created ? new Date(data.created) : new Date()),
      slug: data.slug || '',
      comments: Array.isArray(data.comments) ? data.comments.map(c => ({...c, date: new Date(c.date)})) : [],
      numComments: Array.isArray(data.comments) ? data.comments.length : 0,
      body: data.body || ''
    };
  }

  static query() {
    return new QueryBuilder(contentDatabase);
  }

  assignSlug(type) {
    if (this.data.slug) return this;
    const base = this.data.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.data.slug = base;
    return this;
  }

  async persist() {
    return new Promise((resolve, reject) => {
      if (!this.data.title || !this.data.md) {
        return reject(new Error('Title and content are required.'));
      }

      if (this.data._id) {
        const index = contentDatabase.findIndex(item => item._id === this.data._id);
        if (index > -1) {
          contentDatabase[index] = { ...this.data }; // Store a copy
          resolve({ ...this.data });
        } else {
          reject(new Error('Content item not found for update.'));
        }
      } else {
        this.data._id = currentContentId++;
        this.data.date = new Date();
        this.data.created = new Date();
        if (!this.data.slug) {
          this.assignSlug();
        }
        contentDatabase.push({ ...this.data }); // Store a copy
        resolve({ ...this.data });
      }
    });
  }

  static async clearAll() {
    contentDatabase = [];
    currentContentId = 1;
  }
}

// Populate some mock data for testing
(async () => {
  await ContentItem.clearAll();
  await new ContentItem({ title: 'First Post', md: 'This is the first post.', published: true, tags: ['test', 'first'], body: 'This is the first post body.' }).assignSlug().persist();
  await new ContentItem({ title: 'Second Post', md: 'This is the second post.', published: true, tags: ['test', 'second'], body: 'This is the second post body.' }).assignSlug().persist();
  await new ContentItem({ title: 'Draft Post', md: 'This is a draft.', published: false, tags: ['draft'], body: 'This is a draft body.' }).assignSlug().persist();
  await new ContentItem({ title: 'Post with Comments', md: 'Comments here.', published: true, tags: ['comments'], body: 'Comments here body.', comments: [{ name: 'User1', body: 'Great post!', date: new Date(Date.now() - 10000) }] }).assignSlug().persist();
  await new ContentItem({ title: 'Another Post', md: 'Another one.', published: true, tags: ['another'], body: 'Another one body.', date: new Date(Date.now() - 86400000) }).assignSlug().persist();
})();


// --- Application Core ---
let mainApplicationInstance;
let configurationManager;
let appConfiguredStatus = false;

const initializeApplication = async (userConfigOverrides) => {
  if (appConfiguredStatus) return;

  configurationManager = new ApplicationConfiguration(userConfigOverrides);
  mainApplicationInstance = new ApplicationEngine();
  const mainRouter = new RouterManager();

  mainApplicationInstance.context.appSettings = configurationManager;
  mainApplicationInstance.context.port = process.env.PORT || 5000;
  mainApplicationInstance.context.isProduction = process.env.NODE_ENV === 'production';
  mainApplicationInstance.context.viewRoot = configurationManager.get('baseDirectory') + configurationManager.get('templatePath');

  mainApplicationInstance.use(ViewEngineIntegrator(mainApplicationInstance.context.viewRoot, {
    extension: 'jade',
    map: { html: 'jade' }
  }));

  if (configurationManager.get('enforceWWW')) {
    mainApplicationInstance.use(async (ctx, next) => {
      if (ctx.headers.host && ctx.headers.host.match(/^www\./) !== null) {
        ctx.redirect(301, ctx.protocol + '://' + ctx.headers.host.replace(/^www\./, '') + ctx.url);
      } else {
        await next();
      }
    });
  }

  mainApplicationInstance.use(CompressionModule());
  mainApplicationInstance.use(FaviconHandler(configurationManager.get('baseDirectory') + configurationManager.get('assetPath') + '/favicon.ico'));
  mainApplicationInstance.use(LoggerModule());
  mainApplicationInstance.use(BodyParserModule());
  mainApplicationInstance.use(async (ctx, next) => { await next(); }); // Placeholder for stylus, assuming pre-compiled or static
  mainApplicationInstance.use(MountUtility(configurationManager.get('assetPath'), StaticContentServer(configurationManager.get('baseDirectory') + configurationManager.get('assetPath'))));

  mainApplicationInstance.use(async (ctx, next) => {
    const currentProtocol = ctx.secure ? 'https://' : 'http://';
    ctx.state.hostName = ctx.headers.host;
    ctx.state.rssActive = !!configurationManager.get('rssFeed');
    ctx.state.siteBaseUrl = currentProtocol + ctx.state.hostName;
    ctx.state.rssFeedLink = ctx.state.siteBaseUrl + '/rss.xml';
    ctx.state.websiteName = configurationManager.get('blogName');
    ctx.state.requestPath = ctx.url;

    if (ctx.state.totalContentItems === undefined) {
      const totalItems = await ContentItem.query().filter('published', true).count();
      ctx.state.totalContentItems = totalItems;
      ctx.state.totalPageCount = Math.ceil(totalItems / configurationManager.get('itemsPerPage'));
    }
    await next();
  });

  if (!mainApplicationInstance.context.isProduction) {
    mainApplicationInstance.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
        ctx.app.emit('error', err, ctx);
        console.error('Development Error:', err);
      }
    });
  }


  // --- Route Definitions ---

  mainRouter.get('/', async (ctx) => {
    const pageLimit = configurationManager.get('itemsPerPage');
    const requestedPage = parseInt(ctx.query.p || ctx.query.page, 10) || 1;

    const publishedItems = await ContentItem.query()
      .filter('published', true)
      .sort({ date: 'desc' })
      .limit(pageLimit)
      .offset(Math.max(0, requestedPage - 1) * pageLimit)
      .retrieve();

    if (!publishedItems) {
      ctx.status = 500;
      return;
    }
    await ctx.render('index', {
      pageTitle: '',
      contentPieces: publishedItems,
      currentPage: requestedPage
    });
  });

  mainRouter.get('/drafts', async (ctx) => {
    const draftItems = await ContentItem.query()
      .filter('published', false)
      .sort({ date: 'desc' })
      .retrieve();

    if (!draftItems) {
      ctx.status = 500;
      return;
    }
    await ctx.render('drafts', {
      pageTitle: 'Drafts',
      contentPieces: draftItems
    });
  });

  if (configurationManager.get('dataExportPath')) {
    mainRouter.get(configurationManager.get('dataExportPath'), async (ctx) => {
      const publishedItems = await ContentItem.query()
        .filter('published', true)
        .sort({ created: 'desc' })
        .retrieve();

      if (!publishedItems) {
        ctx.status = 500;
        return;
      }
      ctx.body = publishedItems;
      ctx.type = 'application/json';
    });
  }

  mainRouter.get('/comments', async (ctx) => {
    const commentedItems = await ContentItem.query()
      .greaterThan('numComments', 0)
      .sort({ 'comments.date': 'desc' })
      .limit(10)
      .retrieve();

    if (!commentedItems) {
      ctx.status = 500;
      return;
    }
    await ctx.render('comments', {
      pageTitle: 'Comments',
      contentPieces: commentedItems
    });
  });

  mainRouter.get('/new', async (ctx) => {
    await ctx.render('newPost', { pageTitle: 'New Content', item: false });
  });

  mainRouter.get('/edit/item/:slug', async (ctx, next) => {
    const targetItem = await ContentItem.query()
      .filter('slug', ctx.params.slug)
      .findOne();

    if (!targetItem) {
      return await next();
    }
    await ctx.render('newPost', { pageTitle: 'Edit Content', isModification: true, item: targetItem });
  });

  mainRouter.get('/i/:slug', async (ctx) => {
    const fullUrl = ctx.protocol + '://' + ctx.host + '/content/' + ctx.params.slug;
    ctx.redirect(301, fullUrl);
  });

  mainRouter.get('/content/:slug', async (ctx, next) => {
    const targetItem = await ContentItem.query()
      .filter('slug', ctx.params.slug)
      .findOne();

    if (!targetItem) {
      return await next();
    }
    await ctx.render('post', { pageTitle: targetItem.title, item: targetItem });
  });

  mainRouter.get('/category/:tag', async (ctx) => {
    const taggedItems = await ContentItem.query()
      .filter('tags', ctx.params.tag)
      .filter('published', true)
      .sort({ date: 'desc' })
      .retrieve();

    if (!taggedItems) {
      ctx.status = 500;
      return;
    }
    if (taggedItems.length > 0) {
      await ctx.render('tag', { pageTitle: '#' + ctx.params.tag, contentPieces: taggedItems, category: ctx.params.tag });
    } else {
      ctx.status = 404;
    }
  });

  mainRouter.post('/new', async (ctx) => {
    if (
      mainApplicationInstance.context.isProduction &&
      ctx.request.body.secret !== configurationManager.get('authSecret')
    ) {
      ctx.status = 400;
      return;
    }

    try {
      const newContent = new ContentItem(ctx.request.body);
      newContent.assignSlug(configurationManager.get('permalinkStyle'));
      const savedContent = await newContent.persist();
      ctx.state.totalContentItems = undefined;
      ctx.body = savedContent;
      ctx.type = 'application/json';
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: error.message };
      ctx.type = 'application/json';
      console.log('Error submitting content: ', error);
    }
  });

  mainRouter.put('/edit/:slug', async (ctx) => {
    if (
      mainApplicationInstance.context.isProduction &&
      ctx.request.body.secret !== configurationManager.get('authSecret')
    ) {
      ctx.status = 400;
      return;
    }

    const existingItem = await ContentItem.query()
      .filter('slug', ctx.params.slug)
      .findOne();

    if (!existingItem) {
      ctx.status = 404;
      return;
    }

    try {
      existingItem.md = ctx.request.body.md;
      existingItem.tags = ctx.request.body.tags;
      existingItem.title = ctx.request.body.title;
      existingItem.body = ctx.request.body.body || existingItem.body;

      if (!existingItem.published || !ctx.request.body.published) {
        existingItem.assignSlug();
      }
      existingItem.published = ctx.request.body.published;
      
      const updatedItem = await new ContentItem(existingItem).persist();
      ctx.body = updatedItem;
      ctx.type = 'application/json';
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
      ctx.type = 'application/json';
      console.log(error);
    }
  });

  mainRouter.post('/preview', async (ctx) => {
    const tempItem = new ContentItem(ctx.request.body);
    await ctx.render('preview', { pageTitle: tempItem.data.title, item: tempItem.data });
  });

  mainRouter.post('/content/:slug/comment', async (ctx) => {
    if (!(ctx.request.body && ctx.request.body.name && ctx.request.body.body)) {
      ctx.status = 500;
      return;
    }

    const targetItem = await ContentItem.query()
      .filter('slug', ctx.params.slug)
      .filter('published', true)
      .findOne();

    if (!targetItem) {
      ctx.status = 404;
      return;
    }

    try {
      const newComment = {
        name: ctx.request.body.name,
        body: ctx.request.body.body,
        date: new Date()
      };
      targetItem.comments.push(newComment);
      targetItem.numComments = targetItem.comments.length;

      globalNotifier.trigger('commentReceived', newComment);

      const updatedItem = await new ContentItem(targetItem).persist();
      ctx.body = updatedItem;
      ctx.type = 'application/json';
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
      ctx.type = 'application/json';
      console.log('Error submitting comment: ', error);
    }
  });

  if (configurationManager.get('rssFeed')) {
    mainRouter.get('/rss.xml', async (ctx) => {
      try {
        const feedItems = await ContentItem.query()
          .filter('published', true)
          .sort({ date: 'desc' })
          .limit(configurationManager.get('rssFeed').limit || 10)
          .retrieve();

        const siteBase = ctx.state.siteBaseUrl;

        const feedDetails = new RssFeedGenerator({
          title: configurationManager.get('blogName'),
          description: configurationManager.get('rssFeed').description || '',
          feed_url: siteBase + '/rss.xml',
          site_url: siteBase,
          image_url: siteBase + (configurationManager.get('rssFeed').img || '/favicon.ico'),
          author: configurationManager.get('rssFeed').author || configurationManager.get('blogName')
        });

        for (const item of feedItems) {
          feedDetails.item({
            title: item.title,
            description: item.body,
            url: siteBase + '/content/' + item.slug,
            date: item.date
          });
        }

        ctx.type = 'application/xml';
        ctx.body = feedDetails.xml();
      } catch (err) {
        ctx.status = 500;
        console.warn('Failed to generate RSS feed: ', err.stack);
      }
    });
  }

  mainApplicationInstance.use(mainRouter.routes());
  mainApplicationInstance.use(mainRouter.allowedMethods());

  mainApplicationInstance.use(async (ctx) => {
    ctx.status = 404;
    await ctx.render('error', {
      pageTitle: 'Resource Not Found'
    });
  });

  appConfiguredStatus = true;
};

// --- Server Launch ---
const launchServerProcess = async () => {
  if (!appConfiguredStatus) {
    await initializeApplication();
  }

  const serverPort = mainApplicationInstance.context.port;
  mainApplicationInstance.listen(serverPort, () => {
    console.log(`Initialized ${configurationManager.get('blogName')} on port ${serverPort}`);
    globalNotifier.trigger('serverStarted', { config: configurationManager.currentSettings });
  });
};

// Export the necessary components
module.exports.coreApplication = mainApplicationInstance;
module.exports.setupProcessor = initializeApplication;
module.exports.serverLauncher = launchServerProcess;
module.exports.eventEmitterBridge = globalNotifier;