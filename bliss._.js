(function($) {
"use strict";

if (!Bliss || Bliss.shy) {
	return;
}

var _ = Bliss.property;

// Methods requiring Bliss Full
$.add({
	// Clone elements, with events and data
	clone: function () {
		var clone = this.cloneNode(true);
		var descendants = $.$("*", clone).concat(clone);

		$.$("*", this).concat(this).forEach(function(element, i, arr) {
			$.events(descendants[i], element);
			descendants[i]._.data = $.extend({}, element._.data);
		});

		return clone;
	}
}, {array: false});

// Define the _ property on arrays and elements

Object.defineProperty(Node.prototype, _, {
	// Written for IE compatability (see #49)
	get: function getter () {
		Object.defineProperty(Node.prototype, _, {
			get: undefined
		});
		Object.defineProperty(this, _, {
			value: new $.Element(this)
		});
		Object.defineProperty(Node.prototype, _, {
			get: getter
		});
		return this[_];
	},
	configurable: true
});

Object.defineProperty(Array.prototype, _, {
	get: function () {
		Object.defineProperty(this, _, {
			value: new $.Array(this)
		});

		return this[_];
	},
	configurable: true
});

// Hijack addEventListener and removeEventListener to store callbacks

if (self.EventTarget && "addEventListener" in EventTarget.prototype) {
	$.addEventListener = EventTarget.prototype.addEventListener;
	$.removeEventListener = EventTarget.prototype.removeEventListener;
	$.listeners = self.WeakMap? new WeakMap() : new Map();

	var equal = function(callback, capture, l) {
		return l.callback === callback && l.capture == capture;
	};
	var notEqual = function() {
		return !equal.apply(this, arguments);
	};

	EventTarget.prototype.addEventListener = function(type, callback, capture) {
		var listeners = $.listeners.get(this) || {};

		if (type.indexOf(".") > -1) {
			type = type.split(".");
			var className = type[1];
			type = type[0];
		}

		listeners[type] = listeners[type] || [];

		if (listeners[type].filter(equal.bind(null, callback, capture)).length === 0) {
			listeners[type].push({callback: callback, capture: capture, className: className});
		}

		$.listeners.set(this, listeners);

		return $.addEventListener.call(this, type, callback, capture);
	};

	EventTarget.prototype.removeEventListener = function(type, callback, capture) {
		if (callback) {
			var listeners = $.listeners.get(this);

			if (listeners && listeners[type]) {
				listeners[type] = listeners[type].filter(notEqual.bind(null, callback, capture));
			}
		}

		return $.removeEventListener.call(this, type, callback, capture);
	};
}

// Set $ and $$ convenience methods, if not taken
self.$ = self.$ || $;
self.$$ = self.$$ || $.$;

})(Bliss);
