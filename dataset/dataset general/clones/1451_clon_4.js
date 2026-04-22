const locatorOfResource = 'pagination-pager/components/page-item';

const acquireAndProvide = function() {
    const acquiredEntity = require(locatorOfResource);
    return acquiredEntity;
};

module.exports = acquireAndProvide();