// 引入我们的 MyPromise 实现
const MyPromise = require('./promise.js').MyPromise || require('./promise.js');

// promise-aplus-tests 需要的适配器
module.exports = {
  resolved: function(value) {
    return MyPromise.resolve(value);
  },
  
  rejected: function(reason) {
    return MyPromise.reject(reason);
  },
  
  deferred: function() {
    const dfd = {};
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
};