'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var APIContext = (function (_Component) {
  _inherits(APIContext, _Component);

  function APIContext() {
    _classCallCheck(this, APIContext);

    _Component.apply(this, arguments);
  }

  APIContext.prototype.getChildContext = function getChildContext() {
    var _props = this.props;
    var baseUrl = _props.baseUrl;
    var authToken = _props.authToken;

    return { baseUrl: baseUrl, authToken: authToken };
  };

  APIContext.prototype.render = function render() {
    var children = this.props.children;

    return _react.Children.only(children);
  };

  _createClass(APIContext, null, [{
    key: 'propTypes',
    value: {
      baseUrl: _react.PropTypes.string.isRequired,
      authToken: _react.PropTypes.string.isRequired
    },
    enumerable: true
  }, {
    key: 'childContextTypes',
    value: {
      baseUrl: _react.PropTypes.string.isRequired,
      authToken: _react.PropTypes.string.isRequired
    },
    enumerable: true
  }]);

  return APIContext;
})(_react.Component);

exports['default'] = APIContext;
module.exports = exports['default'];