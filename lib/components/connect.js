'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = connect;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('whatwg-fetch');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilsIsPlainObject = require('../utils/isPlainObject');

var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);

var _utilsDeepValue = require('../utils/deepValue');

var _utilsDeepValue2 = _interopRequireDefault(_utilsDeepValue);

var _utilsShallowEqual = require('../utils/shallowEqual');

var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);

var _utilsErrors = require('../utils/errors');

var _utilsErrors2 = _interopRequireDefault(_utilsErrors);

var _PromiseState = require('../PromiseState');

var _PromiseState2 = _interopRequireDefault(_PromiseState);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var defaultMapPropsToRequestsToProps = function defaultMapPropsToRequestsToProps() {
  return {};
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// Helps track hot reloading.
var nextVersion = 0;

function connect(mapPropsToRequestsToProps) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var finalMapPropsToRequestsToProps = mapPropsToRequestsToProps || defaultMapPropsToRequestsToProps;
  var _options$withRef = options.withRef;
  var withRef = _options$withRef === undefined ? false : _options$withRef;

  // Helps track hot reloading.
  var version = nextVersion++;

  // Filled by the contextProvider
  var _context = undefined;

  function coerceMappings(rawMappings) {
    _invariant2['default'](_utilsIsPlainObject2['default'](rawMappings), '`mapPropsToRequestsToProps` must return an object. Instead received %s.', rawMappings);

    var mappings = {};
    Object.keys(rawMappings).forEach(function (prop) {
      mappings[prop] = coerceMapping(prop, rawMappings[prop]);
    });
    return mappings;
  }

  function coerceMapping(prop, mapping) {
    var _context2 = _context;
    var baseUrl = _context2.baseUrl;
    var authToken = _context2.authToken;

    if (Function.prototype.isPrototypeOf(mapping)) {
      return mapping;
    }

    if (typeof mapping === 'string') {
      mapping = { url: mapping };
    }

    _invariant2['default'](_utilsIsPlainObject2['default'](mapping), 'Request for `%s` must be either a string or a plain object. Instead received %s', prop, mapping);
    _invariant2['default'](mapping.url || mapping.value, 'Request object for `%s` must have `url` (or `value`) attribute.', prop);
    _invariant2['default'](!(mapping.url && mapping.value), 'Request object for `%s` must not have both `url` and `value` attributes.', prop);

    mapping = assignDefaults(mapping);

    // Add baseUrl
    mapping.url = '' + baseUrl + mapping.url;
    // Add an authentication header.
    mapping.headers.Authorization = 'bearer ' + authToken;

    mapping.equals = (function (that) {
      var _this = this;

      if (this.comparison !== undefined) {
        return this.comparison === that.comparison;
      }

      return ['value', 'url', 'method', 'headers', 'body'].every(function (c) {
        return _utilsShallowEqual2['default'](_utilsDeepValue2['default'](_this, c), _utilsDeepValue2['default'](that, c));
      });
    }).bind(mapping);

    return mapping;
  }

  function assignDefaults(mapping) {
    return Object.assign({
      method: 'GET',
      credentials: 'cors',
      redirect: 'follow'
    }, mapping, {
      headers: Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, mapping.headers)
    });
  }

  function buildRequest(mapping) {
    return new window.Request(mapping.url, {
      method: mapping.method,
      headers: mapping.headers,
      credentials: mapping.credentials,
      redirect: mapping.redirect,
      body: mapping.body
    });
  }

  function handleResponse(response) {
    var json = response.json(); // TODO: support other response types
    if (response.status >= 200 && response.status < 300) {
      // TODO: support custom acceptable statuses
      return json;
    } else {
      return json.then(function (cause) {
        return Promise.reject(_utilsErrors2['default'](cause));
      });
    }
  }

  return function wrapWithConnect(WrappedComponent) {
    var RefetchConnect = (function (_Component) {
      _inherits(RefetchConnect, _Component);

      _createClass(RefetchConnect, null, [{
        key: 'contextTypes',
        value: {
          baseUrl: _react.PropTypes.string.isRequired,
          authToken: _react.PropTypes.string.isRequired
        },
        enumerable: true
      }]);

      function RefetchConnect(props, context) {
        _classCallCheck(this, RefetchConnect);

        _Component.call(this, props, context);
        this.version = version;
        this.state = { mappings: {}, startedAts: {}, data: {}, refreshTimeouts: {} };
        _context = context;
      }

      RefetchConnect.prototype.componentWillMount = function componentWillMount() {
        this.refetchDataFromProps();
      };

      RefetchConnect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        this.refetchDataFromProps(nextProps);
      };

      RefetchConnect.prototype.componentWillUnmount = function componentWillUnmount() {
        this.clearAllRefreshTimeouts();
      };

      RefetchConnect.prototype.render = function render() {
        var ref = withRef ? 'wrappedInstance' : null;
        return _react2['default'].createElement(WrappedComponent, _extends({}, this.state.data, this.props, { ref: ref }));
      };

      RefetchConnect.prototype.getWrappedInstance = function getWrappedInstance() {
        _invariant2['default'](withRef, 'To access the wrapped instance, you need to specify ' + '{ withRef: true } as the fourth argument of the connect() call.');

        return this.refs.wrappedInstance;
      };

      RefetchConnect.prototype.refetchDataFromProps = function refetchDataFromProps() {
        var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

        this.refetchDataFromMappings(finalMapPropsToRequestsToProps(props) || {});
      };

      RefetchConnect.prototype.refetchDataFromMappings = function refetchDataFromMappings(mappings) {
        var _this2 = this;

        mappings = coerceMappings(mappings, this.context);
        Object.keys(mappings).forEach(function (prop) {
          var mapping = mappings[prop];

          if (Function.prototype.isPrototypeOf(mapping)) {
            _this2.setAtomicState(prop, new Date(), mapping, function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              _this2.refetchDataFromMappings(mapping.apply(undefined, args || {}));
            });
            return;
          }

          if (mapping.force || !mapping.equals(_this2.state.mappings[prop] || {})) {
            _this2.refetchDatum(prop, mapping);
          }
        });
      };

      RefetchConnect.prototype.refetchDatum = function refetchDatum(prop, mapping) {
        var startedAt = new Date();

        if (this.state.refreshTimeouts[prop]) {
          window.clearTimeout(this.state.refreshTimeouts[prop]);
        }

        return this.createPromise(prop, mapping, startedAt);
      };

      RefetchConnect.prototype.createPromise = function createPromise(prop, mapping, startedAt) {
        var _this3 = this;

        var initPS = this.createInitialPromiseState(prop, mapping);
        var onFulfillment = this.createPromiseStateOnFulfillment(prop, mapping, startedAt);
        var onRejection = this.createPromiseStateOnRejection(prop, mapping, startedAt);

        if (mapping.value) {
          var meta = mapping.meta || {};
          this.setAtomicState(prop, startedAt, mapping, initPS(meta));
          return Promise.resolve(mapping.value).then(onFulfillment(meta), onRejection(meta));
        } else {
          var _ret = (function () {
            var request = buildRequest(mapping);
            var meta = { request: request };
            _this3.setAtomicState(prop, startedAt, mapping, initPS(meta));

            var fetched = window.fetch(request);
            return {
              v: fetched.then(function (response) {
                meta.response = response;
                return fetched.then(handleResponse).then(onFulfillment(meta), onRejection(meta));
              })
            };
          })();

          if (typeof _ret === 'object') return _ret.v;
        }
      };

      RefetchConnect.prototype.createInitialPromiseState = function createInitialPromiseState(prop, mapping) {
        var _this4 = this;

        return function (meta) {
          return mapping.refreshing ? _PromiseState2['default'].refresh(_this4.state.data[prop], meta) : _PromiseState2['default'].create(meta);
        };
      };

      RefetchConnect.prototype.createPromiseStateOnFulfillment = function createPromiseStateOnFulfillment(prop, mapping, startedAt) {
        var _this5 = this;

        return function (meta) {
          return function (value) {
            var refreshTimeout = null;
            if (mapping.refreshInterval > 0) {
              refreshTimeout = window.setTimeout(function () {
                _this5.refetchDatum(prop, Object.assign({}, mapping, { refreshing: true, force: true }));
              }, mapping.refreshInterval);
            }

            if (Function.prototype.isPrototypeOf(mapping.then)) {
              _this5.refetchDatum(prop, coerceMapping(null, mapping.then(value, meta)));
              return;
            }

            _this5.setAtomicState(prop, startedAt, mapping, _PromiseState2['default'].resolve(value, meta), refreshTimeout, function () {
              if (Function.prototype.isPrototypeOf(mapping.andThen)) {
                _this5.refetchDataFromMappings(mapping.andThen(value, meta));
              }
            });
          };
        };
      };

      RefetchConnect.prototype.createPromiseStateOnRejection = function createPromiseStateOnRejection(prop, mapping, startedAt) {
        var _this6 = this;

        return function (meta) {
          return function (reason) {
            if (Function.prototype.isPrototypeOf(mapping['catch'])) {
              _this6.refetchDatum(prop, coerceMapping(null, mapping['catch'](reason, meta)));
              return;
            }

            _this6.setAtomicState(prop, startedAt, mapping, _PromiseState2['default'].reject(reason, meta), null, function () {
              if (Function.prototype.isPrototypeOf(mapping.andCatch)) {
                _this6.refetchDataFromMappings(mapping.andCatch(reason, meta));
              }
            });
          };
        };
      };

      RefetchConnect.prototype.setAtomicState = function setAtomicState(prop, startedAt, mapping, datum, refreshTimeout, callback) {
        this.setState(function (prevState) {
          var _Object$assign, _Object$assign2, _Object$assign3, _Object$assign4;

          if (startedAt < prevState.startedAts[prop]) {
            return {};
          }

          return {
            startedAts: Object.assign(prevState.startedAts, (_Object$assign = {}, _Object$assign[prop] = startedAt, _Object$assign)),
            mappings: Object.assign(prevState.mappings, (_Object$assign2 = {}, _Object$assign2[prop] = mapping, _Object$assign2)),
            data: Object.assign(prevState.data, (_Object$assign3 = {}, _Object$assign3[prop] = datum, _Object$assign3)),
            refreshTimeouts: Object.assign(prevState.refreshTimeouts, (_Object$assign4 = {}, _Object$assign4[prop] = refreshTimeout, _Object$assign4))
          };
        }, callback);
      };

      RefetchConnect.prototype.clearAllRefreshTimeouts = function clearAllRefreshTimeouts() {
        var _this7 = this;

        Object.keys(this.state.refreshTimeouts).forEach(function (prop) {
          clearTimeout(_this7.state.refreshTimeouts[prop]);
        });
      };

      return RefetchConnect;
    })(_react.Component);

    RefetchConnect.displayName = 'Refetch.connect(' + getDisplayName(WrappedComponent) + ')';
    RefetchConnect.WrappedComponent = WrappedComponent;

    if (process.env.NODE_ENV !== 'production') {
      RefetchConnect.prototype.componentWillUpdate = function componentWillUpdate() {
        if (this.version === version) {
          return;
        }

        // We are hot reloading!
        this.version = version;
        this.clearAllRefreshTimeouts();
        this.refetchDataFromProps();
      };
    }

    return _hoistNonReactStatics2['default'](RefetchConnect, WrappedComponent);
  };
}

module.exports = exports['default'];