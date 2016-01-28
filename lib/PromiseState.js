"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PromiseState = (function () {
  _createClass(PromiseState, null, [{
    key: "create",

    // creates a new PromiseState that is pending
    value: function create(meta) {
      return new PromiseState({
        pending: true,
        meta: meta
      });
    }

    // creates as PromiseState that is refreshing
    // can be called without a previous PromiseState and will be both pending and refreshing
  }, {
    key: "refresh",
    value: function refresh(previous, meta) {
      var ps = previous || PromiseState.create(meta);
      ps.refreshing = true;
      return ps;
    }

    // creates a PromiseState that is resolved with the given value
  }, {
    key: "resolve",
    value: function resolve(value, meta) {
      return new PromiseState({
        fulfilled: true,
        value: value,
        meta: meta
      });
    }

    // creates a PromiseState that is rejected with the given reason
  }, {
    key: "reject",
    value: function reject(reason, meta) {
      return new PromiseState({
        rejected: true,
        reason: reason,
        meta: meta
      });
    }

    // The PromiseState.all(iterable) method returns a PromiseState
    // that resolves when all of the PromiseStates in the iterable
    // argument have resolved, or rejects with the reason of the
    // first passed PromiseState that rejects.
  }, {
    key: "all",
    value: function all(iterable) {
      return new PromiseState({
        pending: iterable.some(function (ps) {
          return ps.pending;
        }),
        refreshing: iterable.some(function (ps) {
          return ps.refreshing;
        }),
        fulfilled: iterable.every(function (ps) {
          return ps.fulfilled;
        }),
        rejected: iterable.some(function (ps) {
          return ps.rejected;
        }),
        value: iterable.map(function (ps) {
          return ps.value;
        }),
        reason: (iterable.find(function (ps) {
          return ps.reason;
        }) || {}).reason,
        meta: iterable.map(function (ps) {
          return ps.meta;
        })
      });
    }

    // The PromiseState.race(iterable) method returns a PromiseState
    // that resolves or rejects as soon as one of the PromiseStates in
    // the iterable resolves or rejects, with the value or reason
    // from that PromiseState.
  }, {
    key: "race",
    value: function race(iterable) {
      var winner = iterable.find(function (ps) {
        return ps.settled;
      });

      return new PromiseState({
        pending: !winner && iterable.some(function (ps) {
          return ps.pending;
        }),
        refreshing: !winner && iterable.some(function (ps) {
          return ps.refreshing;
        }),
        fulfilled: winner && winner.fulfilled,
        rejected: winner && winner.rejected,
        value: winner && winner.value,
        reason: winner && winner.reason,
        meta: winner && winner.meta
      });
    }

    // Constructor for creating a raw PromiseState. DO NOT USE DIRECTLY. Instead, use PromiseState.create() or other static constructors
  }]);

  function PromiseState(_ref) {
    var _ref$pending = _ref.pending;
    var pending = _ref$pending === undefined ? false : _ref$pending;
    var _ref$refreshing = _ref.refreshing;
    var refreshing = _ref$refreshing === undefined ? false : _ref$refreshing;
    var _ref$fulfilled = _ref.fulfilled;
    var fulfilled = _ref$fulfilled === undefined ? false : _ref$fulfilled;
    var _ref$rejected = _ref.rejected;
    var rejected = _ref$rejected === undefined ? false : _ref$rejected;
    var _ref$value = _ref.value;
    var value = _ref$value === undefined ? null : _ref$value;
    var _ref$reason = _ref.reason;
    var reason = _ref$reason === undefined ? null : _ref$reason;
    var _ref$meta = _ref.meta;
    var meta = _ref$meta === undefined ? {} : _ref$meta;

    _classCallCheck(this, PromiseState);

    this.pending = pending;
    this.refreshing = refreshing;
    this.fulfilled = fulfilled;
    this.rejected = rejected;
    this.settled = fulfilled || rejected;
    this.value = value;
    this.reason = reason;
    this.meta = meta;
  }

  // Appends and calls fulfillment and rejection handlers on the PromiseState,
  // and returns a new PromiseState resolving to the return value of the called handler,
  // or to its original settled value if the promise was not handled.
  // The handler functions take the value/reason and meta as parameters.
  // (i.e. if the relevant handler onFulfilled or onRejected is undefined).
  // Note, unlike Promise.then(), these handlers are called immediately.

  _createClass(PromiseState, [{
    key: "then",
    value: function then(onFulFilled, onRejected) {
      if (this.fulfilled && onFulFilled) {
        return this._mapFlatMapValue(onFulFilled(this.value, this.meta));
      }

      if (this.rejected && onRejected) {
        return this._mapFlatMapValue(onRejected(this.reason, this.meta));
      }

      return this;
    }

    // Appends and calls a rejection handler callback to the PromiseState,
    // and returns a new PromiseState resolving to the return value of the
    // callback if it is called, or to its original fulfillment value if
    // the PromiseState is instead fulfilled. The handler function take
    // the reason and meta as parameters. Note, unlike Promise.catch(),
    // this handlers is called immediately.
  }, {
    key: "catch",
    value: function _catch(onRejected) {
      return this.then(undefined, onRejected);
    }
  }, {
    key: "_mapFlatMapValue",
    value: function _mapFlatMapValue(value) {
      if (value instanceof PromiseState) {
        return value;
      } else {
        return PromiseState.resolve(value, this.meta);
      }
    }
  }]);

  return PromiseState;
})();

exports["default"] = PromiseState;
module.exports = exports["default"];