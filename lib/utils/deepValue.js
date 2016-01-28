'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = deepValue;

function deepValue(obj, path) {
  for (var i = 0, spath = path.split('.'), len = spath.length; i < len; i++) {
    if (obj === undefined) {
      return obj;
    }
    obj = obj[spath[i]];
  }
  return obj;
}

module.exports = exports['default'];