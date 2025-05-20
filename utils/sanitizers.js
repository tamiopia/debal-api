const xss = require('xss');

exports.sanitize = (content) => {
  return xss(content, {
    whiteList: {}, // empty means filter all tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
};