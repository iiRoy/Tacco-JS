const globalApplicationRegistry = {};

globalApplicationRegistry.accessCredential = '3Uj5hvL773MVNlhFJC5gyVftNh4Qxci3hqoPkU3nAzp9bFJ8UB';
globalApplicationRegistry.primaryDomain = 'demo.tumblr.com';
globalApplicationRegistry.rootContainer = document.getElementById('application-root') || document.body;

function executeJsonpCall(endpointURL, callbackIdentifier) {
    return new Promise((completionCallback, failureCallback) => {
        const scriptElement = document.createElement('script');
        const dynamicCallbackName = callbackIdentifier || `jsonp_response_handler_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

        window[dynamicCallbackName] = (receivedData) => {
            delete window[dynamicCallbackName];
            if (scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
            completionCallback(receivedData);
        };

        scriptElement.onerror = (err) => {
            delete window[dynamicCallbackName];
            if (scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
            failureCallback(new Error(`JSONP fetch failed: ${err.message}`));
        };

        scriptElement.src = `${endpointURL}&callback=${dynamicCallbackName}`;
        document.head.appendChild(scriptElement);
    });
}

globalApplicationRegistry.apiClient = {
    fetchData: function(options = {}) {
        const defaultParameters = {
            action: 'posts',
            api_key: globalApplicationRegistry.accessCredential,
            base_hostname: globalApplicationRegistry.primaryDomain
        };
        const queryParameters = { ...defaultParameters, ...options };

        let url = `http://api.tumblr.com/v2/blog/${queryParameters.base_hostname}/${queryParameters.action}?`;
        const paramsToEncode = Object.keys(queryParameters)
            .map(key => `${key}=${encodeURIComponent(queryParameters[key])}`)
            .join('&');

        return executeJsonpCall(url + paramsToEncode);
    }
};

globalApplicationRegistry.processIncomingContent = (inputPayload) => {
    if (!inputPayload || !inputPayload.response || !inputPayload.response.posts) {
        return inputPayload;
    }

    const transformedPosts = inputPayload.response.posts.map(postItem => {
        const modifiedPost = { ...postItem };

        modifiedPost.renderLayout = `/static/partials/tumblr-${modifiedPost.type}-post.html`;

        if (modifiedPost.photos) {
            modifiedPost.photos = modifiedPost.photos.map(photoItem => {
                const modifiedPhoto = { ...photoItem };
                photoItem.alt_sizes.forEach(sizeInfo => {
                    if (sizeInfo.width === 75) {
                        modifiedPost.previewImage = sizeInfo.url;
                    } else {
                        modifiedPhoto[`imageSource_${sizeInfo.width}`] = sizeInfo.url;
                    }
                });
                return modifiedPhoto;
            });
        }

        if (modifiedPost.type === 'video' && modifiedPost.player) {
            modifiedPost.player.forEach(embedInfo => {
                modifiedPost[`clipEmbed_${embedInfo.width}`] = embedInfo.embed_code;
            });
        }
        return modifiedPost;
    });

    return {
        ...inputPayload,
        response: {
            ...inputPayload.response,
            posts: transformedPosts
        }
    };
};

globalApplicationRegistry.expressAffection = (contentItem) => {
    const targetURL = `http://www.tumblr.com/like/${contentItem.reblog_key}?id=${contentItem.id}`;
    console.log(`Liking: ${targetURL}`);
    const hiddenFrame = document.createElement('iframe');
    hiddenFrame.src = targetURL;
    hiddenFrame.style.cssText = 'position:absolute;left:-9999em;width:1px;height:1px;border:none;';
    document.body.appendChild(hiddenFrame);
    setTimeout(() => {
        if (document.body.contains(hiddenFrame)) {
            document.body.removeChild(hiddenFrame);
        }
    }, 5000);
};

const applicationRouter = {
    routes: [],
    defaultRoute: null,

    addRoute: function(pathPattern, componentFunction) {
        this.routes.push({
            pattern: new RegExp(`^${pathPattern.replace(/:([a-zA-Z0-9_]+)/g, '(?<$1>[^/]+)')}$`),
            handler: componentFunction
        });
    },

    setDefault: function(componentFunction, initialParams) {
        this.defaultRoute = { handler: componentFunction, params: initialParams };
    },

    navigate: function(path, pushState = true) {
        if (pushState) {
            window.history.pushState({}, '', path);
        }
        this.matchRoute();
    },

    matchRoute: function() {
        const path = window.location.pathname;
        for (const route of this.routes) {
            const match = path.match(route.pattern);
            if (match) {
                const params = match.groups || {};
                route.handler(params);
                return;
            }
        }
        if (this.defaultRoute) {
            this.defaultRoute.handler(this.defaultRoute.params);
        }
    },

    start: function() {
        window.addEventListener('popstate', () => this.matchRoute());
        this.matchRoute();
    }
};

const componentTemplates = {
    postListing: (data) => `
        <section class="post-list-container">
            <h1>Blog Posts</h1>
            <div class="pagination-controls">
                <button onclick="applicationRouter.navigate('/page/${data.activePageNumber - 1}')" ${data.isFirstSegment() ? 'disabled' : ''}>Previous</button>
                <span>Page ${data.activePageNumber}</span>
                <button onclick="applicationRouter.navigate('/page/${data.activePageNumber + 1}')" ${data.isLastSegment() ? 'disabled' : ''}>Next</button>
            </div>
            <div class="posts-grid">
                ${data.posts.map(p => `
                    <article class="blog-post-card">
                        <h2><a href="/post/${p.id}">${p.title || p.type}</a></h2>
                        <p>${p.summary || p.caption || ''}</p>
                        ${p.previewImage ? `<img src="${p.previewImage}" alt="Thumbnail"/>` : ''}
                        <button onclick="globalApplicationRegistry.expressAffection({id:'${p.id}', reblog_key:'${p.reblog_key}'})">Like</button>
                    </article>
                `).join('')}
            </div>
        </section>
    `,
    postDetail: (data) => `
        <article class="post-detail-view">
            <h1>${data.post.title || data.post.type}</h1>
            <p>${data.post.body || data.post.text || data.post.caption || ''}</p>
            ${data.post.photos ? data.post.photos.map(photo => `<img src="${photo.imageSource_500 || photo.imageSource_400 || photo.original_size.url}" alt="Post Image"/>`).join('') : ''}
            ${data.post.clipEmbed_500 ? `<div>${data.post.clipEmbed_500}</div>` : ''}
            <button onclick="globalApplicationRegistry.expressAffection({id:'${data.post.id}', reblog_key:'${data.post.reblog_key}'})">Like this post</button>
            <p><a href="/page/1">Back to posts</a></p>
        </article>
    `,
    blogInfo: (data) => `
        <header class="blog-header">
            <h1>${data.blog.title}</h1>
            <p>${data.blog.description}</p>
            <p>Total posts: ${data.blog.posts}</p>
        </header>
    `
};

function BlogInfoWidget(targetElement) {
    this.element = targetElement;
    this.data = { blog: null };

    this.render = function() {
        if (this.data.blog) {
            this.element.innerHTML = componentTemplates.blogInfo(this.data);
        }
    };

    this.fetchAndRender = async function() {
        try {
            const blogData = await globalApplicationRegistry.apiClient.fetchData({ action: 'info' });
            this.data.blog = blogData.response.blog;
            globalApplicationRegistry.blogWideInfo = this.data.blog;
            this.render();
        } catch (error) {
            console.error('Failed to load blog info:', error);
            this.element.innerHTML = '<p>Error loading blog information.</p>';
        }
    };

    this.fetchAndRender();
}

function PostListingWidget(routeParameters) {
    const targetElement = globalApplicationRegistry.rootContainer;
    const viewContext = {
        activePageNumber: parseInt(routeParameters.page || '1', 10),
        itemsPerPageCount: 5,
        posts: [],
        blog: globalApplicationRegistry.blogWideInfo
    };

    viewContext.isFirstSegment = () => viewContext.activePageNumber === 1;
    viewContext.isLastSegment = () => {
        // Replicating the original's try...finally { return false } behavior.
        // This means the lastPage check always returns false, regardless of calculated value.
        return false;
    };

    globalApplicationRegistry.apiClient.fetchData({
        offset: (viewContext.activePageNumber - 1) * viewContext.itemsPerPageCount,
        limit: viewContext.itemsPerPageCount
    }).then(rawJson => {
        const processedJson = globalApplicationRegistry.processIncomingContent(rawJson);
        viewContext.posts = processedJson.response.posts;
        targetElement.innerHTML = componentTemplates.postListing(viewContext);
    }).catch(error => {
        console.error('Failed to load posts:', error);
        targetElement.innerHTML = '<p>Error loading posts.</p>';
    });
}

function PostDetailWidget(routeParameters) {
    const targetElement = globalApplicationRegistry.rootContainer;
    const viewContext = {
        uniqueIdentifier: routeParameters.id,
        post: null
    };

    globalApplicationRegistry.apiClient.fetchData({
        id: viewContext.uniqueIdentifier
    }).then(rawJson => {
        const processedJson = globalApplicationRegistry.processIncomingContent(rawJson);
        viewContext.post = processedJson.response.posts[0];
        if (viewContext.post) {
            viewContext.post.is_detail = true;
            targetElement.innerHTML = componentTemplates.postDetail(viewContext);
        } else {
            targetElement.innerHTML = '<p>Post not found.</p>';
        }
    }).catch(error => {
        console.error('Failed to load post detail:', error);
        targetElement.innerHTML = '<p>Error loading post detail.</p>';
    });
}

function startApplication() {
    new BlogInfoWidget(document.createElement('div'));

    applicationRouter.addRoute('/page/:page', PostListingWidget);
    applicationRouter.addRoute('/post/:id', PostDetailWidget);
    applicationRouter.setDefault(PostListingWidget, { page: '1' });

    applicationRouter.start();
}

document.addEventListener('DOMContentLoaded', startApplication);