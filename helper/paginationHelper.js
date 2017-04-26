
var lodash = require('lodash');
//define moules

var paging = {};
module.exports = paging;

var pageObject = function () {
    this.skip = -1;
    this.limit = -1;
};

paging.makePageObject = function (object) {
    if (object.pageNo && object.pageSize) {
        var pageNo = parseInt(object.pageNo);
        var pageSize = parseInt(object.pageSize);
        if (lodash.isFinite(pageNo) && lodash.isFinite(pageSize)) {
            var skip = (pageNo - 1) * pageSize;
            var limit = pageSize;
            var pageInfo = new pageObject();
            pageInfo.skip = skip;
            pageInfo.limit = limit;
            return pageInfo;
        }
    }
    return new pageObject();
};