"use strict";
(() => {
  // node_modules/.pnpm/preact@10.29.1/node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var t;
  var i;
  var r;
  var o;
  var e;
  var f;
  var c;
  var s;
  var a;
  var h;
  var p;
  var v;
  var y;
  var d = {};
  var w = [];
  var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var g = Array.isArray;
  function m(n3, l5) {
    for (var u5 in l5) n3[u5] = l5[u5];
    return n3;
  }
  function b(n3) {
    n3 && n3.parentNode && n3.parentNode.removeChild(n3);
  }
  function k(l5, u5, t4) {
    var i4, r5, o4, e4 = {};
    for (o4 in u5) "key" == o4 ? i4 = u5[o4] : "ref" == o4 ? r5 = u5[o4] : e4[o4] = u5[o4];
    if (arguments.length > 2 && (e4.children = arguments.length > 3 ? n.call(arguments, 2) : t4), "function" == typeof l5 && null != l5.defaultProps) for (o4 in l5.defaultProps) void 0 === e4[o4] && (e4[o4] = l5.defaultProps[o4]);
    return x(l5, e4, i4, r5, null);
  }
  function x(n3, t4, i4, r5, o4) {
    var e4 = { type: n3, props: t4, key: i4, ref: r5, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o4 ? ++u : o4, __i: -1, __u: 0 };
    return null == o4 && null != l.vnode && l.vnode(e4), e4;
  }
  function S(n3) {
    return n3.children;
  }
  function C(n3, l5) {
    this.props = n3, this.context = l5;
  }
  function $(n3, l5) {
    if (null == l5) return n3.__ ? $(n3.__, n3.__i + 1) : null;
    for (var u5; l5 < n3.__k.length; l5++) if (null != (u5 = n3.__k[l5]) && null != u5.__e) return u5.__e;
    return "function" == typeof n3.type ? $(n3) : null;
  }
  function I(n3) {
    if (n3.__P && n3.__d) {
      var u5 = n3.__v, t4 = u5.__e, i4 = [], r5 = [], o4 = m({}, u5);
      o4.__v = u5.__v + 1, l.vnode && l.vnode(o4), q(n3.__P, o4, u5, n3.__n, n3.__P.namespaceURI, 32 & u5.__u ? [t4] : null, i4, null == t4 ? $(u5) : t4, !!(32 & u5.__u), r5), o4.__v = u5.__v, o4.__.__k[o4.__i] = o4, D(i4, o4, r5), u5.__e = u5.__ = null, o4.__e != t4 && P(o4);
    }
  }
  function P(n3) {
    if (null != (n3 = n3.__) && null != n3.__c) return n3.__e = n3.__c.base = null, n3.__k.some(function(l5) {
      if (null != l5 && null != l5.__e) return n3.__e = n3.__c.base = l5.__e;
    }), P(n3);
  }
  function A(n3) {
    (!n3.__d && (n3.__d = true) && i.push(n3) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
  }
  function H() {
    try {
      for (var n3, l5 = 1; i.length; ) i.length > l5 && i.sort(e), n3 = i.shift(), l5 = i.length, I(n3);
    } finally {
      i.length = H.__r = 0;
    }
  }
  function L(n3, l5, u5, t4, i4, r5, o4, e4, f5, c4, s4) {
    var a4, h5, p5, v4, y5, _4, g4, m4 = t4 && t4.__k || w, b4 = l5.length;
    for (f5 = T(u5, l5, m4, f5, b4), a4 = 0; a4 < b4; a4++) null != (p5 = u5.__k[a4]) && (h5 = -1 != p5.__i && m4[p5.__i] || d, p5.__i = a4, _4 = q(n3, p5, h5, i4, r5, o4, e4, f5, c4, s4), v4 = p5.__e, p5.ref && h5.ref != p5.ref && (h5.ref && J(h5.ref, null, p5), s4.push(p5.ref, p5.__c || v4, p5)), null == y5 && null != v4 && (y5 = v4), (g4 = !!(4 & p5.__u)) || h5.__k === p5.__k ? (f5 = j(p5, f5, n3, g4), g4 && h5.__e && (h5.__e = null)) : "function" == typeof p5.type && void 0 !== _4 ? f5 = _4 : v4 && (f5 = v4.nextSibling), p5.__u &= -7);
    return u5.__e = y5, f5;
  }
  function T(n3, l5, u5, t4, i4) {
    var r5, o4, e4, f5, c4, s4 = u5.length, a4 = s4, h5 = 0;
    for (n3.__k = new Array(i4), r5 = 0; r5 < i4; r5++) null != (o4 = l5[r5]) && "boolean" != typeof o4 && "function" != typeof o4 ? ("string" == typeof o4 || "number" == typeof o4 || "bigint" == typeof o4 || o4.constructor == String ? o4 = n3.__k[r5] = x(null, o4, null, null, null) : g(o4) ? o4 = n3.__k[r5] = x(S, { children: o4 }, null, null, null) : void 0 === o4.constructor && o4.__b > 0 ? o4 = n3.__k[r5] = x(o4.type, o4.props, o4.key, o4.ref ? o4.ref : null, o4.__v) : n3.__k[r5] = o4, f5 = r5 + h5, o4.__ = n3, o4.__b = n3.__b + 1, e4 = null, -1 != (c4 = o4.__i = O(o4, u5, f5, a4)) && (a4--, (e4 = u5[c4]) && (e4.__u |= 2)), null == e4 || null == e4.__v ? (-1 == c4 && (i4 > s4 ? h5-- : i4 < s4 && h5++), "function" != typeof o4.type && (o4.__u |= 4)) : c4 != f5 && (c4 == f5 - 1 ? h5-- : c4 == f5 + 1 ? h5++ : (c4 > f5 ? h5-- : h5++, o4.__u |= 4))) : n3.__k[r5] = null;
    if (a4) for (r5 = 0; r5 < s4; r5++) null != (e4 = u5[r5]) && 0 == (2 & e4.__u) && (e4.__e == t4 && (t4 = $(e4)), K(e4, e4));
    return t4;
  }
  function j(n3, l5, u5, t4) {
    var i4, r5;
    if ("function" == typeof n3.type) {
      for (i4 = n3.__k, r5 = 0; i4 && r5 < i4.length; r5++) i4[r5] && (i4[r5].__ = n3, l5 = j(i4[r5], l5, u5, t4));
      return l5;
    }
    n3.__e != l5 && (t4 && (l5 && n3.type && !l5.parentNode && (l5 = $(n3)), u5.insertBefore(n3.__e, l5 || null)), l5 = n3.__e);
    do {
      l5 = l5 && l5.nextSibling;
    } while (null != l5 && 8 == l5.nodeType);
    return l5;
  }
  function O(n3, l5, u5, t4) {
    var i4, r5, o4, e4 = n3.key, f5 = n3.type, c4 = l5[u5], s4 = null != c4 && 0 == (2 & c4.__u);
    if (null === c4 && null == e4 || s4 && e4 == c4.key && f5 == c4.type) return u5;
    if (t4 > (s4 ? 1 : 0)) {
      for (i4 = u5 - 1, r5 = u5 + 1; i4 >= 0 || r5 < l5.length; ) if (null != (c4 = l5[o4 = i4 >= 0 ? i4-- : r5++]) && 0 == (2 & c4.__u) && e4 == c4.key && f5 == c4.type) return o4;
    }
    return -1;
  }
  function z(n3, l5, u5) {
    "-" == l5[0] ? n3.setProperty(l5, null == u5 ? "" : u5) : n3[l5] = null == u5 ? "" : "number" != typeof u5 || _.test(l5) ? u5 : u5 + "px";
  }
  function N(n3, l5, u5, t4, i4) {
    var r5, o4;
    n: if ("style" == l5) if ("string" == typeof u5) n3.style.cssText = u5;
    else {
      if ("string" == typeof t4 && (n3.style.cssText = t4 = ""), t4) for (l5 in t4) u5 && l5 in u5 || z(n3.style, l5, "");
      if (u5) for (l5 in u5) t4 && u5[l5] == t4[l5] || z(n3.style, l5, u5[l5]);
    }
    else if ("o" == l5[0] && "n" == l5[1]) r5 = l5 != (l5 = l5.replace(a, "$1")), o4 = l5.toLowerCase(), l5 = o4 in n3 || "onFocusOut" == l5 || "onFocusIn" == l5 ? o4.slice(2) : l5.slice(2), n3.l || (n3.l = {}), n3.l[l5 + r5] = u5, u5 ? t4 ? u5[s] = t4[s] : (u5[s] = h, n3.addEventListener(l5, r5 ? v : p, r5)) : n3.removeEventListener(l5, r5 ? v : p, r5);
    else {
      if ("http://www.w3.org/2000/svg" == i4) l5 = l5.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l5 && "height" != l5 && "href" != l5 && "list" != l5 && "form" != l5 && "tabIndex" != l5 && "download" != l5 && "rowSpan" != l5 && "colSpan" != l5 && "role" != l5 && "popover" != l5 && l5 in n3) try {
        n3[l5] = null == u5 ? "" : u5;
        break n;
      } catch (n4) {
      }
      "function" == typeof u5 || (null == u5 || false === u5 && "-" != l5[4] ? n3.removeAttribute(l5) : n3.setAttribute(l5, "popover" == l5 && 1 == u5 ? "" : u5));
    }
  }
  function V(n3) {
    return function(u5) {
      if (this.l) {
        var t4 = this.l[u5.type + n3];
        if (null == u5[c]) u5[c] = h++;
        else if (u5[c] < t4[s]) return;
        return t4(l.event ? l.event(u5) : u5);
      }
    };
  }
  function q(n3, u5, t4, i4, r5, o4, e4, f5, c4, s4) {
    var a4, h5, p5, v4, y5, d5, _4, k3, x4, M, $2, I2, P2, A3, H2, T4 = u5.type;
    if (void 0 !== u5.constructor) return null;
    128 & t4.__u && (c4 = !!(32 & t4.__u), o4 = [f5 = u5.__e = t4.__e]), (a4 = l.__b) && a4(u5);
    n: if ("function" == typeof T4) try {
      if (k3 = u5.props, x4 = T4.prototype && T4.prototype.render, M = (a4 = T4.contextType) && i4[a4.__c], $2 = a4 ? M ? M.props.value : a4.__ : i4, t4.__c ? _4 = (h5 = u5.__c = t4.__c).__ = h5.__E : (x4 ? u5.__c = h5 = new T4(k3, $2) : (u5.__c = h5 = new C(k3, $2), h5.constructor = T4, h5.render = Q), M && M.sub(h5), h5.state || (h5.state = {}), h5.__n = i4, p5 = h5.__d = true, h5.__h = [], h5._sb = []), x4 && null == h5.__s && (h5.__s = h5.state), x4 && null != T4.getDerivedStateFromProps && (h5.__s == h5.state && (h5.__s = m({}, h5.__s)), m(h5.__s, T4.getDerivedStateFromProps(k3, h5.__s))), v4 = h5.props, y5 = h5.state, h5.__v = u5, p5) x4 && null == T4.getDerivedStateFromProps && null != h5.componentWillMount && h5.componentWillMount(), x4 && null != h5.componentDidMount && h5.__h.push(h5.componentDidMount);
      else {
        if (x4 && null == T4.getDerivedStateFromProps && k3 !== v4 && null != h5.componentWillReceiveProps && h5.componentWillReceiveProps(k3, $2), u5.__v == t4.__v || !h5.__e && null != h5.shouldComponentUpdate && false === h5.shouldComponentUpdate(k3, h5.__s, $2)) {
          u5.__v != t4.__v && (h5.props = k3, h5.state = h5.__s, h5.__d = false), u5.__e = t4.__e, u5.__k = t4.__k, u5.__k.some(function(n4) {
            n4 && (n4.__ = u5);
          }), w.push.apply(h5.__h, h5._sb), h5._sb = [], h5.__h.length && e4.push(h5);
          break n;
        }
        null != h5.componentWillUpdate && h5.componentWillUpdate(k3, h5.__s, $2), x4 && null != h5.componentDidUpdate && h5.__h.push(function() {
          h5.componentDidUpdate(v4, y5, d5);
        });
      }
      if (h5.context = $2, h5.props = k3, h5.__P = n3, h5.__e = false, I2 = l.__r, P2 = 0, x4) h5.state = h5.__s, h5.__d = false, I2 && I2(u5), a4 = h5.render(h5.props, h5.state, h5.context), w.push.apply(h5.__h, h5._sb), h5._sb = [];
      else do {
        h5.__d = false, I2 && I2(u5), a4 = h5.render(h5.props, h5.state, h5.context), h5.state = h5.__s;
      } while (h5.__d && ++P2 < 25);
      h5.state = h5.__s, null != h5.getChildContext && (i4 = m(m({}, i4), h5.getChildContext())), x4 && !p5 && null != h5.getSnapshotBeforeUpdate && (d5 = h5.getSnapshotBeforeUpdate(v4, y5)), A3 = null != a4 && a4.type === S && null == a4.key ? E(a4.props.children) : a4, f5 = L(n3, g(A3) ? A3 : [A3], u5, t4, i4, r5, o4, e4, f5, c4, s4), h5.base = u5.__e, u5.__u &= -161, h5.__h.length && e4.push(h5), _4 && (h5.__E = h5.__ = null);
    } catch (n4) {
      if (u5.__v = null, c4 || null != o4) if (n4.then) {
        for (u5.__u |= c4 ? 160 : 128; f5 && 8 == f5.nodeType && f5.nextSibling; ) f5 = f5.nextSibling;
        o4[o4.indexOf(f5)] = null, u5.__e = f5;
      } else {
        for (H2 = o4.length; H2--; ) b(o4[H2]);
        B(u5);
      }
      else u5.__e = t4.__e, u5.__k = t4.__k, n4.then || B(u5);
      l.__e(n4, u5, t4);
    }
    else null == o4 && u5.__v == t4.__v ? (u5.__k = t4.__k, u5.__e = t4.__e) : f5 = u5.__e = G(t4.__e, u5, t4, i4, r5, o4, e4, c4, s4);
    return (a4 = l.diffed) && a4(u5), 128 & u5.__u ? void 0 : f5;
  }
  function B(n3) {
    n3 && (n3.__c && (n3.__c.__e = true), n3.__k && n3.__k.some(B));
  }
  function D(n3, u5, t4) {
    for (var i4 = 0; i4 < t4.length; i4++) J(t4[i4], t4[++i4], t4[++i4]);
    l.__c && l.__c(u5, n3), n3.some(function(u6) {
      try {
        n3 = u6.__h, u6.__h = [], n3.some(function(n4) {
          n4.call(u6);
        });
      } catch (n4) {
        l.__e(n4, u6.__v);
      }
    });
  }
  function E(n3) {
    return "object" != typeof n3 || null == n3 || n3.__b > 0 ? n3 : g(n3) ? n3.map(E) : m({}, n3);
  }
  function G(u5, t4, i4, r5, o4, e4, f5, c4, s4) {
    var a4, h5, p5, v4, y5, w5, _4, m4 = i4.props || d, k3 = t4.props, x4 = t4.type;
    if ("svg" == x4 ? o4 = "http://www.w3.org/2000/svg" : "math" == x4 ? o4 = "http://www.w3.org/1998/Math/MathML" : o4 || (o4 = "http://www.w3.org/1999/xhtml"), null != e4) {
      for (a4 = 0; a4 < e4.length; a4++) if ((y5 = e4[a4]) && "setAttribute" in y5 == !!x4 && (x4 ? y5.localName == x4 : 3 == y5.nodeType)) {
        u5 = y5, e4[a4] = null;
        break;
      }
    }
    if (null == u5) {
      if (null == x4) return document.createTextNode(k3);
      u5 = document.createElementNS(o4, x4, k3.is && k3), c4 && (l.__m && l.__m(t4, e4), c4 = false), e4 = null;
    }
    if (null == x4) m4 === k3 || c4 && u5.data == k3 || (u5.data = k3);
    else {
      if (e4 = e4 && n.call(u5.childNodes), !c4 && null != e4) for (m4 = {}, a4 = 0; a4 < u5.attributes.length; a4++) m4[(y5 = u5.attributes[a4]).name] = y5.value;
      for (a4 in m4) y5 = m4[a4], "dangerouslySetInnerHTML" == a4 ? p5 = y5 : "children" == a4 || a4 in k3 || "value" == a4 && "defaultValue" in k3 || "checked" == a4 && "defaultChecked" in k3 || N(u5, a4, null, y5, o4);
      for (a4 in k3) y5 = k3[a4], "children" == a4 ? v4 = y5 : "dangerouslySetInnerHTML" == a4 ? h5 = y5 : "value" == a4 ? w5 = y5 : "checked" == a4 ? _4 = y5 : c4 && "function" != typeof y5 || m4[a4] === y5 || N(u5, a4, y5, m4[a4], o4);
      if (h5) c4 || p5 && (h5.__html == p5.__html || h5.__html == u5.innerHTML) || (u5.innerHTML = h5.__html), t4.__k = [];
      else if (p5 && (u5.innerHTML = ""), L("template" == t4.type ? u5.content : u5, g(v4) ? v4 : [v4], t4, i4, r5, "foreignObject" == x4 ? "http://www.w3.org/1999/xhtml" : o4, e4, f5, e4 ? e4[0] : i4.__k && $(i4, 0), c4, s4), null != e4) for (a4 = e4.length; a4--; ) b(e4[a4]);
      c4 || (a4 = "value", "progress" == x4 && null == w5 ? u5.removeAttribute("value") : null != w5 && (w5 !== u5[a4] || "progress" == x4 && !w5 || "option" == x4 && w5 != m4[a4]) && N(u5, a4, w5, m4[a4], o4), a4 = "checked", null != _4 && _4 != u5[a4] && N(u5, a4, _4, m4[a4], o4));
    }
    return u5;
  }
  function J(n3, u5, t4) {
    try {
      if ("function" == typeof n3) {
        var i4 = "function" == typeof n3.__u;
        i4 && n3.__u(), i4 && null == u5 || (n3.__u = n3(u5));
      } else n3.current = u5;
    } catch (n4) {
      l.__e(n4, t4);
    }
  }
  function K(n3, u5, t4) {
    var i4, r5;
    if (l.unmount && l.unmount(n3), (i4 = n3.ref) && (i4.current && i4.current != n3.__e || J(i4, null, u5)), null != (i4 = n3.__c)) {
      if (i4.componentWillUnmount) try {
        i4.componentWillUnmount();
      } catch (n4) {
        l.__e(n4, u5);
      }
      i4.base = i4.__P = null;
    }
    if (i4 = n3.__k) for (r5 = 0; r5 < i4.length; r5++) i4[r5] && K(i4[r5], u5, t4 || "function" != typeof n3.type);
    t4 || b(n3.__e), n3.__c = n3.__ = n3.__e = void 0;
  }
  function Q(n3, l5, u5) {
    return this.constructor(n3, u5);
  }
  function R(u5, t4, i4) {
    var r5, o4, e4, f5;
    t4 == document && (t4 = document.documentElement), l.__ && l.__(u5, t4), o4 = (r5 = "function" == typeof i4) ? null : i4 && i4.__k || t4.__k, e4 = [], f5 = [], q(t4, u5 = (!r5 && i4 || t4).__k = k(S, null, [u5]), o4 || d, d, t4.namespaceURI, !r5 && i4 ? [i4] : o4 ? null : t4.firstChild ? n.call(t4.childNodes) : null, e4, !r5 && i4 ? i4 : o4 ? o4.__e : t4.firstChild, r5, f5), D(e4, u5, f5);
  }
  n = w.slice, l = { __e: function(n3, l5, u5, t4) {
    for (var i4, r5, o4; l5 = l5.__; ) if ((i4 = l5.__c) && !i4.__) try {
      if ((r5 = i4.constructor) && null != r5.getDerivedStateFromError && (i4.setState(r5.getDerivedStateFromError(n3)), o4 = i4.__d), null != i4.componentDidCatch && (i4.componentDidCatch(n3, t4 || {}), o4 = i4.__d), o4) return i4.__E = i4;
    } catch (l6) {
      n3 = l6;
    }
    throw n3;
  } }, u = 0, t = function(n3) {
    return null != n3 && void 0 === n3.constructor;
  }, C.prototype.setState = function(n3, l5) {
    var u5;
    u5 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n3 && (n3 = n3(m({}, u5), this.props)), n3 && m(u5, n3), null != n3 && this.__v && (l5 && this._sb.push(l5), A(this));
  }, C.prototype.forceUpdate = function(n3) {
    this.__v && (this.__e = true, n3 && this.__h.push(n3), A(this));
  }, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n3, l5) {
    return n3.__v.__b - l5.__v.__b;
  }, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, s = "__a" + f, a = /(PointerCapture)$|Capture$/i, h = 0, p = V(false), v = V(true), y = 0;

  // node_modules/.pnpm/preact@10.29.1/node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = l;
  var e2 = c2.__b;
  var a2 = c2.__r;
  var v2 = c2.diffed;
  var l2 = c2.__c;
  var m2 = c2.unmount;
  var s2 = c2.__;
  function p2(n3, t4) {
    c2.__h && c2.__h(r2, n3, o2 || t4), o2 = 0;
    var u5 = r2.__H || (r2.__H = { __: [], __h: [] });
    return n3 >= u5.__.length && u5.__.push({}), u5.__[n3];
  }
  function d2(n3) {
    return o2 = 1, h2(D2, n3);
  }
  function h2(n3, u5, i4) {
    var o4 = p2(t2++, 2);
    if (o4.t = n3, !o4.__c && (o4.__ = [i4 ? i4(u5) : D2(void 0, u5), function(n4) {
      var t4 = o4.__N ? o4.__N[0] : o4.__[0], r5 = o4.t(t4, n4);
      t4 !== r5 && (o4.__N = [r5, o4.__[1]], o4.__c.setState({}));
    }], o4.__c = r2, !r2.__f)) {
      var f5 = function(n4, t4, r5) {
        if (!o4.__c.__H) return true;
        var u6 = o4.__c.__H.__.filter(function(n5) {
          return n5.__c;
        });
        if (u6.every(function(n5) {
          return !n5.__N;
        })) return !c4 || c4.call(this, n4, t4, r5);
        var i5 = o4.__c.props !== n4;
        return u6.some(function(n5) {
          if (n5.__N) {
            var t5 = n5.__[0];
            n5.__ = n5.__N, n5.__N = void 0, t5 !== n5.__[0] && (i5 = true);
          }
        }), c4 && c4.call(this, n4, t4, r5) || i5;
      };
      r2.__f = true;
      var c4 = r2.shouldComponentUpdate, e4 = r2.componentWillUpdate;
      r2.componentWillUpdate = function(n4, t4, r5) {
        if (this.__e) {
          var u6 = c4;
          c4 = void 0, f5(n4, t4, r5), c4 = u6;
        }
        e4 && e4.call(this, n4, t4, r5);
      }, r2.shouldComponentUpdate = f5;
    }
    return o4.__N || o4.__;
  }
  function y2(n3, u5) {
    var i4 = p2(t2++, 3);
    !c2.__s && C2(i4.__H, u5) && (i4.__ = n3, i4.u = u5, r2.__H.__h.push(i4));
  }
  function A2(n3) {
    return o2 = 5, T2(function() {
      return { current: n3 };
    }, []);
  }
  function T2(n3, r5) {
    var u5 = p2(t2++, 7);
    return C2(u5.__H, r5) && (u5.__ = n3(), u5.__H = r5, u5.__h = n3), u5.__;
  }
  function j2() {
    for (var n3; n3 = f2.shift(); ) {
      var t4 = n3.__H;
      if (n3.__P && t4) try {
        t4.__h.some(z2), t4.__h.some(B2), t4.__h = [];
      } catch (r5) {
        t4.__h = [], c2.__e(r5, n3.__v);
      }
    }
  }
  c2.__b = function(n3) {
    r2 = null, e2 && e2(n3);
  }, c2.__ = function(n3, t4) {
    n3 && t4.__k && t4.__k.__m && (n3.__m = t4.__k.__m), s2 && s2(n3, t4);
  }, c2.__r = function(n3) {
    a2 && a2(n3), t2 = 0;
    var i4 = (r2 = n3.__c).__H;
    i4 && (u2 === r2 ? (i4.__h = [], r2.__h = [], i4.__.some(function(n4) {
      n4.__N && (n4.__ = n4.__N), n4.u = n4.__N = void 0;
    })) : (i4.__h.some(z2), i4.__h.some(B2), i4.__h = [], t2 = 0)), u2 = r2;
  }, c2.diffed = function(n3) {
    v2 && v2(n3);
    var t4 = n3.__c;
    t4 && t4.__H && (t4.__H.__h.length && (1 !== f2.push(t4) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t4.__H.__.some(function(n4) {
      n4.u && (n4.__H = n4.u), n4.u = void 0;
    })), u2 = r2 = null;
  }, c2.__c = function(n3, t4) {
    t4.some(function(n4) {
      try {
        n4.__h.some(z2), n4.__h = n4.__h.filter(function(n5) {
          return !n5.__ || B2(n5);
        });
      } catch (r5) {
        t4.some(function(n5) {
          n5.__h && (n5.__h = []);
        }), t4 = [], c2.__e(r5, n4.__v);
      }
    }), l2 && l2(n3, t4);
  }, c2.unmount = function(n3) {
    m2 && m2(n3);
    var t4, r5 = n3.__c;
    r5 && r5.__H && (r5.__H.__.some(function(n4) {
      try {
        z2(n4);
      } catch (n5) {
        t4 = n5;
      }
    }), r5.__H = void 0, t4 && c2.__e(t4, r5.__v));
  };
  var k2 = "function" == typeof requestAnimationFrame;
  function w2(n3) {
    var t4, r5 = function() {
      clearTimeout(u5), k2 && cancelAnimationFrame(t4), setTimeout(n3);
    }, u5 = setTimeout(r5, 35);
    k2 && (t4 = requestAnimationFrame(r5));
  }
  function z2(n3) {
    var t4 = r2, u5 = n3.__c;
    "function" == typeof u5 && (n3.__c = void 0, u5()), r2 = t4;
  }
  function B2(n3) {
    var t4 = r2;
    n3.__c = n3.__(), r2 = t4;
  }
  function C2(n3, t4) {
    return !n3 || n3.length !== t4.length || t4.some(function(t5, r5) {
      return t5 !== n3[r5];
    });
  }
  function D2(n3, t4) {
    return "function" == typeof t4 ? t4(n3) : t4;
  }

  // node_modules/.pnpm/@preact+signals-core@1.14.2/node_modules/@preact/signals-core/dist/signals-core.module.js
  var i3 = /* @__PURE__ */ Symbol.for("preact-signals");
  function t3() {
    if (!(s3 > 1)) {
      var i4, t4 = false;
      !(function() {
        var i5 = c3;
        c3 = void 0;
        while (void 0 !== i5) {
          if (i5.S.v === i5.v) i5.S.i = i5.i;
          i5 = i5.o;
        }
      })();
      while (void 0 !== h3) {
        var n3 = h3;
        h3 = void 0;
        v3++;
        while (void 0 !== n3) {
          var r5 = n3.u;
          n3.u = void 0;
          n3.f &= -3;
          if (!(8 & n3.f) && w3(n3)) try {
            n3.c();
          } catch (n4) {
            if (!t4) {
              i4 = n4;
              t4 = true;
            }
          }
          n3 = r5;
        }
      }
      v3 = 0;
      s3--;
      if (t4) throw i4;
    } else s3--;
  }
  function n2(i4) {
    if (s3 > 0) return i4();
    e3 = ++u3;
    s3++;
    try {
      return i4();
    } finally {
      t3();
    }
  }
  var r3 = void 0;
  function o3(i4) {
    var t4 = r3;
    r3 = void 0;
    try {
      return i4();
    } finally {
      r3 = t4;
    }
  }
  var f3;
  var h3 = void 0;
  var s3 = 0;
  var v3 = 0;
  var u3 = 0;
  var e3 = 0;
  var c3 = void 0;
  var d3 = 0;
  function a3(i4) {
    if (void 0 !== r3) {
      var t4 = i4.n;
      if (void 0 === t4 || t4.t !== r3) {
        t4 = { i: 0, S: i4, p: r3.s, n: void 0, t: r3, e: void 0, x: void 0, r: t4 };
        if (void 0 !== r3.s) r3.s.n = t4;
        r3.s = t4;
        i4.n = t4;
        if (32 & r3.f) i4.S(t4);
        return t4;
      } else if (-1 === t4.i) {
        t4.i = 0;
        if (void 0 !== t4.n) {
          t4.n.p = t4.p;
          if (void 0 !== t4.p) t4.p.n = t4.n;
          t4.p = r3.s;
          t4.n = void 0;
          r3.s.n = t4;
          r3.s = t4;
        }
        return t4;
      }
    }
  }
  function l3(i4, t4) {
    this.v = i4;
    this.i = 0;
    this.n = void 0;
    this.t = void 0;
    this.l = 0;
    this.W = null == t4 ? void 0 : t4.watched;
    this.Z = null == t4 ? void 0 : t4.unwatched;
    this.name = null == t4 ? void 0 : t4.name;
  }
  l3.prototype.brand = i3;
  l3.prototype.h = function() {
    return true;
  };
  l3.prototype.S = function(i4) {
    var t4 = this, n3 = this.t;
    if (n3 !== i4 && void 0 === i4.e) {
      i4.x = n3;
      this.t = i4;
      if (void 0 !== n3) n3.e = i4;
      else o3(function() {
        var i5;
        null == (i5 = t4.W) || i5.call(t4);
      });
    }
  };
  l3.prototype.U = function(i4) {
    var t4 = this;
    if (void 0 !== this.t) {
      var n3 = i4.e, r5 = i4.x;
      if (void 0 !== n3) {
        n3.x = r5;
        i4.e = void 0;
      }
      if (void 0 !== r5) {
        r5.e = n3;
        i4.x = void 0;
      }
      if (i4 === this.t) {
        this.t = r5;
        if (void 0 === r5) o3(function() {
          var i5;
          null == (i5 = t4.Z) || i5.call(t4);
        });
      }
    }
  };
  l3.prototype.subscribe = function(i4) {
    var t4 = this;
    return j3(function() {
      var n3 = t4.value, o4 = r3;
      r3 = void 0;
      try {
        i4(n3);
      } finally {
        r3 = o4;
      }
    }, { name: "sub" });
  };
  l3.prototype.valueOf = function() {
    return this.value;
  };
  l3.prototype.toString = function() {
    return this.value + "";
  };
  l3.prototype.toJSON = function() {
    return this.value;
  };
  l3.prototype.peek = function() {
    var i4 = this;
    return o3(function() {
      return i4.value;
    });
  };
  Object.defineProperty(l3.prototype, "value", { get: function() {
    var i4 = a3(this);
    if (void 0 !== i4) i4.i = this.i;
    return this.v;
  }, set: function(i4) {
    if (i4 !== this.v) {
      if (v3 > 100) throw new Error("Cycle detected");
      !(function(i5) {
        if (0 !== s3 && 0 === v3) {
          if (i5.l !== e3) {
            i5.l = e3;
            c3 = { S: i5, v: i5.v, i: i5.i, o: c3 };
          }
        }
      })(this);
      this.v = i4;
      this.i++;
      d3++;
      s3++;
      try {
        for (var n3 = this.t; void 0 !== n3; n3 = n3.x) n3.t.N();
      } finally {
        t3();
      }
    }
  } });
  function y3(i4, t4) {
    return new l3(i4, t4);
  }
  function w3(i4) {
    for (var t4 = i4.s; void 0 !== t4; t4 = t4.n) if (t4.S.i !== t4.i || !t4.S.h() || t4.S.i !== t4.i) return true;
    return false;
  }
  function _2(i4) {
    for (var t4 = i4.s; void 0 !== t4; t4 = t4.n) {
      var n3 = t4.S.n;
      if (void 0 !== n3) t4.r = n3;
      t4.S.n = t4;
      t4.i = -1;
      if (void 0 === t4.n) {
        i4.s = t4;
        break;
      }
    }
  }
  function b2(i4) {
    var t4 = i4.s, n3 = void 0;
    while (void 0 !== t4) {
      var r5 = t4.p;
      if (-1 === t4.i) {
        t4.S.U(t4);
        if (void 0 !== r5) r5.n = t4.n;
        if (void 0 !== t4.n) t4.n.p = r5;
      } else n3 = t4;
      t4.S.n = t4.r;
      if (void 0 !== t4.r) t4.r = void 0;
      t4 = r5;
    }
    i4.s = n3;
  }
  function p3(i4, t4) {
    l3.call(this, void 0);
    this.x = i4;
    this.s = void 0;
    this.g = d3 - 1;
    this.f = 4;
    this.W = null == t4 ? void 0 : t4.watched;
    this.Z = null == t4 ? void 0 : t4.unwatched;
    this.name = null == t4 ? void 0 : t4.name;
  }
  p3.prototype = new l3();
  p3.prototype.h = function() {
    this.f &= -3;
    if (1 & this.f) return false;
    if (32 == (36 & this.f)) return true;
    this.f &= -5;
    if (this.g === d3) return true;
    this.g = d3;
    this.f |= 1;
    if (this.i > 0 && !w3(this)) {
      this.f &= -2;
      return true;
    }
    var i4 = r3;
    try {
      _2(this);
      r3 = this;
      var t4 = this.x();
      if (16 & this.f || this.v !== t4 || 0 === this.i) {
        this.v = t4;
        this.f &= -17;
        this.i++;
      }
    } catch (i5) {
      this.v = i5;
      this.f |= 16;
      this.i++;
    }
    r3 = i4;
    b2(this);
    this.f &= -2;
    return true;
  };
  p3.prototype.S = function(i4) {
    if (void 0 === this.t) {
      this.f |= 36;
      for (var t4 = this.s; void 0 !== t4; t4 = t4.n) t4.S.S(t4);
    }
    l3.prototype.S.call(this, i4);
  };
  p3.prototype.U = function(i4) {
    if (void 0 !== this.t) {
      l3.prototype.U.call(this, i4);
      if (void 0 === this.t) {
        this.f &= -33;
        for (var t4 = this.s; void 0 !== t4; t4 = t4.n) t4.S.U(t4);
      }
    }
  };
  p3.prototype.N = function() {
    if (!(2 & this.f)) {
      this.f |= 6;
      for (var i4 = this.t; void 0 !== i4; i4 = i4.x) i4.t.N();
    }
  };
  Object.defineProperty(p3.prototype, "value", { get: function() {
    if (1 & this.f) throw new Error("Cycle detected");
    var i4 = a3(this);
    this.h();
    if (void 0 !== i4) i4.i = this.i;
    if (16 & this.f) throw this.v;
    return this.v;
  } });
  function g2(i4, t4) {
    return new p3(i4, t4);
  }
  function S2(i4) {
    var n3 = i4.m;
    i4.m = void 0;
    if ("function" == typeof n3) {
      s3++;
      var o4 = r3;
      r3 = void 0;
      try {
        n3();
      } catch (t4) {
        i4.f &= -2;
        i4.f |= 8;
        m3(i4);
        throw t4;
      } finally {
        r3 = o4;
        t3();
      }
    }
  }
  function m3(i4) {
    for (var t4 = i4.s; void 0 !== t4; t4 = t4.n) t4.S.U(t4);
    i4.x = void 0;
    i4.s = void 0;
    S2(i4);
  }
  function x2(i4) {
    if (r3 !== this) throw new Error("Out-of-order effect");
    b2(this);
    r3 = i4;
    this.f &= -2;
    if (8 & this.f) m3(this);
    t3();
  }
  function E2(i4, t4) {
    this.x = i4;
    this.m = void 0;
    this.s = void 0;
    this.u = void 0;
    this.f = 32;
    this.name = null == t4 ? void 0 : t4.name;
    if (f3) f3.push(this);
  }
  E2.prototype.c = function() {
    var i4 = this.S();
    try {
      if (8 & this.f) return;
      if (void 0 === this.x) return;
      var t4 = this.x();
      if ("function" == typeof t4) this.m = t4;
    } finally {
      i4();
    }
  };
  E2.prototype.S = function() {
    if (1 & this.f) throw new Error("Cycle detected");
    this.f |= 1;
    this.f &= -9;
    S2(this);
    _2(this);
    s3++;
    var i4 = r3;
    r3 = this;
    return x2.bind(this, i4);
  };
  E2.prototype.N = function() {
    if (!(2 & this.f)) {
      this.f |= 2;
      this.u = h3;
      h3 = this;
    }
  };
  E2.prototype.d = function() {
    this.f |= 8;
    if (!(1 & this.f)) m3(this);
  };
  E2.prototype.dispose = function() {
    this.d();
  };
  function j3(i4, t4) {
    var n3 = new E2(i4, t4);
    try {
      n3.c();
    } catch (i5) {
      n3.d();
      throw i5;
    }
    var r5 = n3.d.bind(n3);
    r5[Symbol.dispose] = r5;
    return r5;
  }

  // node_modules/.pnpm/@preact+signals@2.9.0_preact@10.29.1/node_modules/@preact/signals/dist/signals.module.js
  var l4;
  var d4;
  var h4;
  var p4 = "undefined" != typeof window && !!window.__PREACT_SIGNALS_DEVTOOLS__;
  var _3 = [];
  j3(function() {
    l4 = this.N;
  })();
  function g3(i4, r5) {
    l[i4] = r5.bind(null, l[i4] || function() {
    });
  }
  function b3(i4) {
    if (h4) {
      var n3 = h4;
      h4 = void 0;
      n3();
    }
    h4 = i4 && i4.S();
  }
  function y4(i4) {
    var n3 = this, t4 = i4.data, e4 = useSignal(t4);
    e4.value = t4;
    var f5 = T2(function() {
      var i5 = n3, t5 = n3.__v;
      while (t5 = t5.__) if (t5.__c) {
        t5.__c.__$f |= 4;
        break;
      }
      var o4 = g2(function() {
        var i6 = e4.value.value;
        return 0 === i6 ? 0 : true === i6 ? "" : i6 || "";
      }), f6 = g2(function() {
        return !Array.isArray(o4.value) && !t(o4.value);
      }), a5 = j3(function() {
        this.N = F;
        if (f6.value) {
          var n4 = o4.value;
          if (i5.__v && i5.__v.__e && 3 === i5.__v.__e.nodeType) i5.__v.__e.data = n4;
        }
      }), v5 = n3.__$u.d;
      n3.__$u.d = function() {
        a5();
        v5.call(this);
      };
      return [f6, o4];
    }, []), a4 = f5[0], v4 = f5[1];
    return a4.value ? v4.peek() : v4.value;
  }
  y4.displayName = "ReactiveTextNode";
  Object.defineProperties(l3.prototype, { constructor: { configurable: true, value: void 0 }, type: { configurable: true, value: y4 }, props: { configurable: true, get: function() {
    var i4 = this;
    return { data: { get value() {
      return i4.value;
    } } };
  } }, __b: { configurable: true, value: 1 } });
  g3("__b", function(i4, n3) {
    if ("string" == typeof n3.type) {
      var r5, t4 = n3.props;
      for (var o4 in t4) if ("children" !== o4) {
        var e4 = t4[o4];
        if (e4 instanceof l3) {
          if (!r5) n3.__np = r5 = {};
          r5[o4] = e4;
          t4[o4] = e4.peek();
        }
      }
    }
    i4(n3);
  });
  g3("__r", function(i4, n3) {
    i4(n3);
    if (n3.type !== S) {
      b3();
      var r5, o4 = n3.__c;
      if (o4) {
        o4.__$f &= -2;
        if (void 0 === (r5 = o4.__$u)) o4.__$u = r5 = (function(i5, n4) {
          var r6;
          j3(function() {
            r6 = this;
          }, { name: n4 });
          r6.c = i5;
          return r6;
        })(function() {
          var i5;
          if (p4) null == (i5 = r5.y) || i5.call(r5);
          o4.__$f |= 1;
          o4.setState({});
        }, "function" == typeof n3.type ? n3.type.displayName || n3.type.name : "");
      }
      d4 = o4;
      b3(r5);
    }
  });
  g3("__e", function(i4, n3, r5, t4) {
    b3();
    d4 = void 0;
    i4(n3, r5, t4);
  });
  g3("diffed", function(i4, n3) {
    b3();
    d4 = void 0;
    var r5;
    if ("string" == typeof n3.type && (r5 = n3.__e)) {
      var t4 = n3.__np, o4 = n3.props;
      if (t4) {
        var e4 = r5.U;
        if (e4) for (var f5 in e4) {
          var u5 = e4[f5];
          if (void 0 !== u5 && !(f5 in t4)) {
            u5.d();
            e4[f5] = void 0;
          }
        }
        else {
          e4 = {};
          r5.U = e4;
        }
        for (var a4 in t4) {
          var c4 = e4[a4], v4 = t4[a4];
          if (void 0 === c4) {
            c4 = w4(r5, a4, v4);
            e4[a4] = c4;
          } else c4.o(v4, o4);
        }
        for (var s4 in t4) o4[s4] = t4[s4];
      }
    }
    i4(n3);
  });
  function w4(i4, n3, r5, t4) {
    var o4 = n3 in i4 && void 0 === i4.ownerSVGElement, e4 = y3(r5), f5 = r5.peek();
    return { o: function(i5, n4) {
      e4.value = i5;
      f5 = i5.peek();
    }, d: j3(function() {
      this.N = F;
      var r6 = e4.value.value;
      if (f5 !== r6) {
        f5 = void 0;
        if (o4) i4[n3] = r6;
        else if (null != r6 && (false !== r6 || "-" === n3[4])) i4.setAttribute(n3, r6);
        else i4.removeAttribute(n3);
      } else f5 = void 0;
    }) };
  }
  g3("unmount", function(i4, n3) {
    if ("string" == typeof n3.type) {
      var r5 = n3.__e;
      if (r5) {
        var t4 = r5.U;
        if (t4) {
          r5.U = void 0;
          for (var o4 in t4) {
            var e4 = t4[o4];
            if (e4) e4.d();
          }
        }
      }
      n3.__np = void 0;
    } else {
      var f5 = n3.__c;
      if (f5) {
        var u5 = f5.__$u;
        if (u5) {
          f5.__$u = void 0;
          u5.d();
        }
      }
    }
    i4(n3);
  });
  g3("__h", function(i4, n3, r5, t4) {
    if (t4 < 3 || 9 === t4) n3.__$f |= 2;
    i4(n3, r5, t4);
  });
  C.prototype.shouldComponentUpdate = function(i4, n3) {
    if (this.__R) return true;
    var r5 = this.__$u, t4 = r5 && void 0 !== r5.s;
    for (var o4 in n3) return true;
    if (this.__f || "boolean" == typeof this.u && true === this.u) {
      var e4 = 2 & this.__$f;
      if (!(t4 || e4 || 4 & this.__$f)) return true;
      if (1 & this.__$f) return true;
    } else {
      if (!(t4 || 4 & this.__$f)) return true;
      if (3 & this.__$f) return true;
    }
    for (var f5 in i4) if ("__source" !== f5 && i4[f5] !== this.props[f5]) return true;
    for (var u5 in this.props) if (!(u5 in i4)) return true;
    return false;
  };
  function useSignal(i4, n3) {
    return T2(function() {
      return y3(i4, n3);
    }, []);
  }
  var q2 = function(i4) {
    queueMicrotask(function() {
      queueMicrotask(i4);
    });
  };
  function x3() {
    n2(function() {
      var i4;
      while (i4 = _3.shift()) l4.call(i4);
    });
  }
  function F() {
    if (1 === _3.push(this)) (l.requestAnimationFrame || q2)(x3);
  }

  // media/src/agentProfiles.ts
  var AGENT_ORDER = ["copilot", "claude_code", "codex"];
  var DEFAULT_AGENT_PROFILES = {
    claude_code: {
      source: "claude_code",
      label: "Claude",
      shortLabel: "CL",
      color: "#FFB085",
      contextWindowTokens: 2e5,
      turnNudge: 80,
      turnAlert: 150,
      identicalRepeatNudge: 3,
      identicalRepeatAlert: 4,
      consecutiveErrorNudge: 3,
      consecutiveErrorAlert: 4,
      activeMinutesAlert: 30
    },
    copilot: {
      source: "copilot",
      label: "Copilot",
      shortLabel: "CP",
      color: "#00EAFF",
      contextWindowTokens: 128e3,
      turnNudge: 150,
      turnAlert: 275,
      identicalRepeatNudge: 3,
      identicalRepeatAlert: 5,
      consecutiveErrorNudge: 3,
      consecutiveErrorAlert: 5,
      activeMinutesAlert: 45
    },
    codex: {
      source: "codex",
      label: "Codex",
      shortLabel: "CX",
      color: "#F0FF42",
      contextWindowTokens: 4e5,
      turnNudge: 250,
      turnAlert: 450,
      identicalRepeatNudge: 4,
      identicalRepeatAlert: 6,
      consecutiveErrorNudge: 4,
      consecutiveErrorAlert: 6,
      activeMinutesAlert: 60
    }
  };
  var AGENT_PROFILE_FIELD_META = {
    contextWindowTokens: { label: "Window", unit: "tokens", min: 16e3, max: 1e6, step: 1e3 },
    turnNudge: { label: "Turn nudge", unit: "turns", min: 10, max: 1e3, step: 5 },
    turnAlert: { label: "Turn alert", unit: "turns", min: 10, max: 1e3, step: 5 },
    identicalRepeatNudge: { label: "Repeat nudge", unit: "calls", min: 2, max: 8, step: 1 },
    identicalRepeatAlert: { label: "Repeat alert", unit: "calls", min: 2, max: 20, step: 1 },
    consecutiveErrorNudge: { label: "Error nudge", unit: "errors", min: 2, max: 8, step: 1 },
    consecutiveErrorAlert: { label: "Error alert", unit: "errors", min: 2, max: 20, step: 1 },
    activeMinutesAlert: { label: "Active alert", unit: "min", min: 5, max: 240, step: 5 }
  };
  function cloneDefaultProfiles() {
    return {
      claude_code: { ...DEFAULT_AGENT_PROFILES.claude_code },
      copilot: { ...DEFAULT_AGENT_PROFILES.copilot },
      codex: { ...DEFAULT_AGENT_PROFILES.codex }
    };
  }
  function validMetricValue(metric, value) {
    const n3 = Number(value);
    const meta = AGENT_PROFILE_FIELD_META[metric];
    if (!Number.isFinite(n3) || n3 < meta.min || n3 > meta.max) return null;
    return n3;
  }
  function getAgentProfiles() {
    const defaults = cloneDefaultProfiles();
    try {
      const stored = localStorage.getItem("agentLens.agentProfiles");
      if (!stored) return defaults;
      const saved = JSON.parse(stored);
      for (const source of AGENT_ORDER) {
        const profile = saved[source];
        if (!profile) continue;
        for (const metric of Object.keys(AGENT_PROFILE_FIELD_META)) {
          const value = validMetricValue(metric, profile[metric]);
          if (value !== null) {
            defaults[source][metric] = value;
          }
        }
      }
    } catch {
    }
    return defaults;
  }
  function saveAgentProfiles(profiles) {
    try {
      const payload = {};
      for (const source of AGENT_ORDER) {
        payload[source] = {};
        for (const metric of Object.keys(AGENT_PROFILE_FIELD_META)) {
          payload[source][metric] = profiles[source][metric];
        }
      }
      localStorage.setItem("agentLens.agentProfiles", JSON.stringify(payload));
    } catch {
    }
  }
  function resetAgentProfiles() {
    try {
      localStorage.removeItem("agentLens.agentProfiles");
    } catch {
    }
    return cloneDefaultProfiles();
  }
  function resolveAgentProfile(source, profiles = getAgentProfiles()) {
    if (source && profiles[source]) return profiles[source];
    return profiles.copilot;
  }

  // media/src/pricing.ts
  var PRICING_LAST_UPDATED = "2026-05-28";
  var RATES = {
    // ── OpenAI ─────────────────────────────────────────────────────────────────────────────────────
    //                                                                     token rates ──────────────────────────────────── │ pre-Jun1  │ annual post-Jun1
    // included models: 0× pre-Jun1 AND $0 in token mode (included in Copilot subscription per footnote 1)
    "gpt-4.1": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, multiplier: 0, multiplierAnnualPostJun1: 1 },
    "gpt-5-mini": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, multiplier: 0, multiplierAnnualPostJun1: 0.33 },
    "gpt-5 mini": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, multiplier: 0, multiplierAnnualPostJun1: 0.33 },
    // older included models kept for historical sessions
    "gpt-4o": { inputPerMTok: 2.5, cacheReadPerMTok: 1.25, cacheWritePerMTok: 0, outputPerMTok: 10, multiplier: 0, multiplierAnnualPostJun1: 0.33 },
    "gpt-4o-mini": { inputPerMTok: 0.15, cacheReadPerMTok: 0.075, cacheWritePerMTok: 0, outputPerMTok: 0.6, multiplier: 0, multiplierAnnualPostJun1: 0.33 },
    // GPT-5.1 family — in annual-plan table but not in new token pricing (request-only models)
    "gpt-5.1": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, multiplier: 1, multiplierAnnualPostJun1: 3 },
    "gpt-5.1-codex": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, multiplier: 1, multiplierAnnualPostJun1: 3 },
    "gpt-5.1-codex-mini": { inputPerMTok: 0.75, cacheReadPerMTok: 0.075, cacheWritePerMTok: 0, outputPerMTok: 4.5, multiplier: 0.33, multiplierAnnualPostJun1: 0.33 },
    "gpt-5.1-codex-max": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, multiplier: 1, multiplierAnnualPostJun1: 3 },
    // premium models
    "gpt-5.2": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, multiplier: 1, multiplierAnnualPostJun1: 3 },
    "gpt-5.2-codex": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, multiplier: 1, multiplierAnnualPostJun1: 3 },
    "gpt-5.3-codex": { inputPerMTok: 1.75, cacheReadPerMTok: 0.175, cacheWritePerMTok: 0, outputPerMTok: 14, multiplier: 1, multiplierAnnualPostJun1: 6 },
    "gpt-5.4": { inputPerMTok: 2.5, cacheReadPerMTok: 0.25, cacheWritePerMTok: 0, outputPerMTok: 15, multiplier: 1, multiplierAnnualPostJun1: 6 },
    // long-context surcharge (>272K tokens) not implemented
    "gpt-5.4-mini": { inputPerMTok: 0.75, cacheReadPerMTok: 0.075, cacheWritePerMTok: 0, outputPerMTok: 4.5, multiplier: 0.33, multiplierAnnualPostJun1: 6 },
    "gpt-5.4-nano": { inputPerMTok: 0.2, cacheReadPerMTok: 0.02, cacheWritePerMTok: 0, outputPerMTok: 1.25, multiplier: 0.25, multiplierAnnualPostJun1: 0.25 },
    "gpt-5.5": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 0, outputPerMTok: 30, multiplier: 7.5, multiplierAnnualPostJun1: 7.5 },
    // TBD per docs; long-context surcharge (>unknown threshold) not implemented
    // ── Codex-only models ──────────────────────────────────────────────────────────────────────────
    // codex-mini-latest: fine-tuned o4-mini; 75% cache discount (not the usual 90%); deprecated
    "codex-mini-latest": { inputPerMTok: 1.5, cacheReadPerMTok: 0.375, cacheWritePerMTok: 0, outputPerMTok: 6, multiplier: 0, multiplierAnnualPostJun1: 0 },
    // ── Anthropic ──────────────────────────────────────────────────────────────────────────────────
    // deprecated — for historical Claude Code sessions
    "claude-opus-4": { inputPerMTok: 15, cacheReadPerMTok: 1.5, cacheWritePerMTok: 18.75, outputPerMTok: 75, multiplier: 0, multiplierAnnualPostJun1: 0 },
    "claude-opus-4-1": { inputPerMTok: 15, cacheReadPerMTok: 1.5, cacheWritePerMTok: 18.75, outputPerMTok: 75, multiplier: 0, multiplierAnnualPostJun1: 0 },
    "claude-haiku-3-5": { inputPerMTok: 0.8, cacheReadPerMTok: 0.08, cacheWritePerMTok: 1, outputPerMTok: 4, multiplier: 0, multiplierAnnualPostJun1: 0 },
    // current
    "claude-haiku-4-5": { inputPerMTok: 1, cacheReadPerMTok: 0.1, cacheWritePerMTok: 1.25, outputPerMTok: 5, multiplier: 0.33, multiplierAnnualPostJun1: 0.33 },
    "claude-sonnet-4": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, multiplier: 1, multiplierAnnualPostJun1: 1 },
    "claude-sonnet-4-5": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, multiplier: 1, multiplierAnnualPostJun1: 6 },
    "claude-sonnet-4-6": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, multiplier: 1, multiplierAnnualPostJun1: 9 },
    "claude-opus-4-5": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, multiplier: 3, multiplierAnnualPostJun1: 15 },
    "claude-opus-4-6": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, multiplier: 3, multiplierAnnualPostJun1: 27 },
    "claude-opus-4-7": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, multiplier: 15, multiplierAnnualPostJun1: 27 },
    // fast mode (/fast toggle in Claude Code) — 6× standard Opus rates; model ID in telemetry does NOT include -fast suffix (known gap)
    "claude-opus-4-6-fast": { inputPerMTok: 30, cacheReadPerMTok: 3, cacheWritePerMTok: 37.5, outputPerMTok: 150, multiplier: 30, multiplierAnnualPostJun1: 30 },
    "claude-opus-4-7-fast": { inputPerMTok: 30, cacheReadPerMTok: 3, cacheWritePerMTok: 37.5, outputPerMTok: 150, multiplier: 30, multiplierAnnualPostJun1: 30 },
    // ── Google ─────────────────────────────────────────────────────────────────────────────────────
    "gemini-2.5-pro": { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10, multiplier: 1, multiplierAnnualPostJun1: 1 },
    // long-context surcharge (>200K tokens) not implemented
    "gemini-3-flash": { inputPerMTok: 0.5, cacheReadPerMTok: 0.05, cacheWritePerMTok: 0, outputPerMTok: 3, multiplier: 0.33, multiplierAnnualPostJun1: 0.33 },
    "gemini-3-pro": { inputPerMTok: 2, cacheReadPerMTok: 0.2, cacheWritePerMTok: 0, outputPerMTok: 12, multiplier: 1, multiplierAnnualPostJun1: 6 },
    "gemini-3.1-pro": { inputPerMTok: 2, cacheReadPerMTok: 0.2, cacheWritePerMTok: 0, outputPerMTok: 12, multiplier: 1, multiplierAnnualPostJun1: 6 },
    // long-context surcharge (>200K tokens) not implemented
    "gemini-3.5-flash": { inputPerMTok: 1.5, cacheReadPerMTok: 0.15, cacheWritePerMTok: 0, outputPerMTok: 9, multiplier: 14, multiplierAnnualPostJun1: 14 },
    // ── Fine-tuned ─────────────────────────────────────────────────────────────────────────────────
    // raptor-mini uses GPT-5 mini pricing per footnote 5 — included ($0) in token mode, same annual multiplier
    "raptor-mini": { inputPerMTok: 0, cacheReadPerMTok: 0, cacheWritePerMTok: 0, outputPerMTok: 0, multiplier: 0, multiplierAnnualPostJun1: 0.33 },
    "goldeneye": { inputPerMTok: 1.25, cacheReadPerMTok: 0.125, cacheWritePerMTok: 0, outputPerMTok: 10, multiplier: 0, multiplierAnnualPostJun1: 0 }
  };
  function normalizeModelId(modelId) {
    return modelId.toLowerCase().replace(/-\d{4}-\d{2}-\d{2}$/, "").replace(/-\d{8}$/, "").trim();
  }
  function lookupRates(modelId) {
    if (!modelId) return null;
    const normalized = normalizeModelId(modelId);
    if (RATES[normalized]) return RATES[normalized];
    for (const key of Object.keys(RATES)) {
      if (normalized.startsWith(key) || key.startsWith(normalized)) return RATES[key];
    }
    return null;
  }
  function calcTokenCost(inputTokens, cacheReadTokens, cacheWriteTokens, outputTokens, rates) {
    return inputTokens / 1e6 * rates.inputPerMTok + cacheReadTokens / 1e6 * rates.cacheReadPerMTok + cacheWriteTokens / 1e6 * rates.cacheWritePerMTok + outputTokens / 1e6 * rates.outputPerMTok;
  }

  // media/src/sessionMetrics.ts
  function fmtUsd(usd) {
    if (usd === 0) return "$0.00";
    if (usd < 1e-3) return "<$0.001";
    if (usd < 1) return "$" + usd.toFixed(3);
    return "$" + usd.toFixed(2);
  }
  function calcEntryCost(entry, sessionModel) {
    const rates = lookupRates(entry.model || sessionModel);
    if (!rates) return 0;
    return calcTokenCost(entry.inputTokens ?? 0, 0, 0, entry.outputTokens ?? 0, rates);
  }
  function calcSessionCost(session, mode) {
    const modelId = session.model || "";
    const rates = lookupRates(modelId);
    const llmEntries = (session.timeline ?? []).filter((e4) => e4.type === "llm");
    if (mode === "request" || mode === "request-annual") {
      const mult = mode === "request-annual" ? rates?.multiplierAnnualPostJun1 ?? 0 : rates?.multiplier ?? 0;
      if (!rates || mult === 0) {
        return { totalUsd: 0, aiCredits: 0, byTurn: llmEntries.map(() => 0), modelUnknown: !rates, pricingMode: mode };
      }
      const promptCount = session.turns || 1;
      const totalUsd2 = promptCount * mult * 0.04;
      const perPrompt = totalUsd2 / promptCount;
      let cum2 = 0;
      const byTurn2 = llmEntries.map(() => {
        cum2 = Math.min(cum2 + perPrompt, totalUsd2);
        return cum2;
      });
      return { totalUsd: totalUsd2, aiCredits: totalUsd2 / 0.01, byTurn: byTurn2, modelUnknown: false, pricingMode: mode };
    }
    const rawInput = Math.max(0, session.inputTokens - session.cacheReadTokens - session.cacheCreateTokens);
    const totalUsd = rates ? calcTokenCost(rawInput, session.cacheReadTokens, session.cacheCreateTokens, session.outputTokens, rates) : 0;
    let cum = 0;
    const byTurn = llmEntries.map((entry) => {
      const entryRates = lookupRates(entry.model || modelId) || rates;
      if (!entryRates) return cum;
      cum += calcTokenCost(entry.inputTokens ?? 0, 0, 0, entry.outputTokens ?? 0, entryRates);
      return cum;
    });
    return { totalUsd, aiCredits: totalUsd / 0.01, byTurn, modelUnknown: !rates, pricingMode: mode };
  }
  function sessionDisplayName(session) {
    const req = (session.userRequest ?? "").trim();
    if (!req || req === "[session in progress]") return "[session in progress]";
    return req.length > 70 ? req.slice(0, 70) + "..." : req;
  }
  function getPeakContextUsage(session, profiles = getAgentProfiles()) {
    const llmInputs = (session.timeline ?? []).filter((e4) => e4.type === "llm").map((e4) => e4.inputTokens ?? 0).filter((n3) => n3 > 0);
    const fallback = session.totalLlmCalls > 0 ? Math.round((session.inputTokens ?? 0) / session.totalLlmCalls) : 0;
    const peakTokens = llmInputs.length > 0 ? Math.max(...llmInputs) : fallback;
    const contextWindowTokens = resolveAgentProfile(session.source, profiles).contextWindowTokens;
    return {
      peakTokens,
      contextWindowTokens,
      percent: contextWindowTokens > 0 ? peakTokens / contextWindowTokens * 100 : 0
    };
  }
  function stableJson(value) {
    if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
    if (value && typeof value === "object") {
      const obj = value;
      return "{" + Object.keys(obj).sort().map((k3) => JSON.stringify(k3) + ":" + stableJson(obj[k3])).join(",") + "}";
    }
    return JSON.stringify(value);
  }
  function normalizeToolInput(input) {
    const raw = (input ?? "").trim();
    if (!raw) return "";
    try {
      return stableJson(JSON.parse(raw));
    } catch {
      return raw.replace(/\s+/g, " ");
    }
  }
  function toolName(entry) {
    return (entry.label ?? "").trim().split(/\s+/)[0] || "tool";
  }
  function changesFiles(entry) {
    if ((entry.editDetails ?? []).length > 0) return true;
    const label = (entry.label ?? "").toLowerCase();
    if (/(apply_patch|replace_string|create_file|edit_notebook|write_file|str_replace|multi_edit)/.test(label)) return true;
    if (!/(exec|shell|bash|command)/.test(label)) return false;
    const input = (entry.toolInput ?? "").toLowerCase();
    return /(apply_patch|sed\s+-i|perl\s+-i|>\s*[\w./~-]|>>\s*[\w./~-]|\btee\b|\btouch\b|\bmv\b|\bcp\b|\brm\b|\bmkdir\b)/.test(input);
  }
  function getIdenticalToolRepeat(session) {
    const counts = /* @__PURE__ */ new Map();
    let best = null;
    let fileChangeGeneration = 0;
    for (const entry of session.timeline ?? []) {
      if (entry.type === "tool") {
        const tool = toolName(entry);
        const normalizedInput = normalizeToolInput(entry.toolInput);
        const key = tool + "\n" + (normalizedInput || (entry.label ?? "").trim());
        const current = counts.get(key);
        const count = current && current.fileChangeGeneration === fileChangeGeneration ? current.count + 1 : 1;
        counts.set(key, {
          key,
          tool,
          count,
          display: normalizedInput ? tool + " " + normalizedInput.slice(0, 90) : entry.label ?? tool,
          fileChangeGeneration
        });
        if (count > 1 && (!best || count > best.count)) {
          best = { key, tool, count, display: normalizedInput ? tool + " " + normalizedInput.slice(0, 90) : entry.label ?? tool };
        }
      }
      if (changesFiles(entry)) {
        fileChangeGeneration++;
      }
    }
    return best;
  }
  function getErrorHealth(session) {
    const measured = (session.timeline ?? []).filter((e4) => e4.type === "llm" || e4.type === "tool");
    let maxConsecutive = 0;
    let current = 0;
    let errorCount = 0;
    const recentErrors = [];
    for (const entry of measured) {
      if (entry.isError) {
        errorCount++;
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
        const msg = entry.errorMessage || entry.label;
        if (msg) recentErrors.push(msg.slice(0, 140));
      } else {
        current = 0;
      }
    }
    const fallbackErrors = Math.max(errorCount, session.errors ?? 0);
    const measuredSteps = measured.length || (session.totalLlmCalls ?? 0) + (session.totalToolCalls ?? 0);
    return {
      errorCount: fallbackErrors,
      measuredSteps,
      maxConsecutive,
      trailingConsecutive: current,
      failureRate: measuredSteps > 0 ? fallbackErrors / measuredSteps : 0,
      recentErrors: recentErrors.slice(-3)
    };
  }
  function getActiveComputeMs(session) {
    return (session.timeline ?? []).filter((e4) => e4.type === "llm" || e4.type === "tool").reduce((sum, entry) => sum + Math.max(entry.durationMs ?? 0, 0), 0);
  }

  // media/src/state.ts
  var CHART_MAX = 25;
  var TIME_PRESETS = [
    { id: "1h", label: "1h", ms: 60 * 6e4 },
    { id: "6h", label: "6h", ms: 6 * 60 * 6e4 },
    { id: "24h", label: "24h", ms: 24 * 60 * 6e4 },
    { id: "7d", label: "7d", ms: 7 * 864e5 },
    { id: "30d", label: "30d", ms: 30 * 864e5 },
    { id: "all", label: "All", ms: null }
  ];
  function makeTimeRange(preset) {
    const p5 = TIME_PRESETS.find((t4) => t4.id === preset);
    if (p5.ms === null) return { preset };
    return { preset, since: Date.now() - p5.ms };
  }
  var timeRange = y3({ preset: "all" });
  var rangedSearchResults = y3(null);
  var dailyStats = y3([]);
  var lifetimeStats = y3(null);
  var burnRateData = y3(null);
  var searchResults = y3(null);
  var sessionTextFilter = y3("");
  var sessionSortKey = y3("start_time");
  var sessionSortDir = y3("desc");
  function makeSetSignal() {
    const s4 = y3(/* @__PURE__ */ new Set());
    return {
      get value() {
        return s4.value;
      },
      peek() {
        return s4.peek();
      },
      has(item) {
        return s4.value.has(item);
      },
      add(item) {
        const n3 = new Set(s4.value);
        n3.add(item);
        s4.value = n3;
      },
      delete(item) {
        const n3 = new Set(s4.value);
        n3.delete(item);
        s4.value = n3;
      },
      toggle(item) {
        const n3 = new Set(s4.value);
        n3.has(item) ? n3.delete(item) : n3.add(item);
        s4.value = n3;
      },
      clear() {
        s4.value = /* @__PURE__ */ new Set();
      },
      get size() {
        return s4.value.size;
      }
    };
  }
  var sessionSummary = y3(window.__INITIAL_SESSION_SUMMARY__ ?? null);
  var toolCalls = y3(window.__INITIAL_TOOL_CALLS__ ?? {});
  var sessionTimelines = y3({});
  var blobCache = y3({});
  var focusedSessionId = y3(null);
  var sessionLimit = y3(25);
  var selectedAgentFilter = y3("all");
  var initiatorFilter = y3("all");
  var dataSourceFilter = y3("all");
  var insightFilter = y3("all");
  var activeTab = y3("sessions");
  var swRetainedSessions = y3([]);
  var swLastSessionCount = y3(0);
  var dismissedSpanIds = makeSetSignal();
  var lastSeenTraceIds = makeSetSignal();
  var ignoredInsightKeys = makeSetSignal();
  var vscode = null;
  function setVscode(api) {
    vscode = api;
  }
  function goToHelp(anchor) {
    activeTab.value = "help";
    setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }
  var COLORS = [
    "#4fc3f7",
    "#81c784",
    "#ffb74d",
    "#e57373",
    "#ba68c8",
    "#4dd0e1",
    "#fff176",
    "#a1887f",
    "#90a4ae",
    "#f06292",
    "#aed581",
    "#7986cb"
  ];
  var agentFilteredSessions = g2(() => {
    let all = sessionSummary.value?.sessions ?? [];
    const filter = selectedAgentFilter.value;
    if (filter !== "all") all = all.filter((s4) => s4.source === filter);
    const dsFilter = dataSourceFilter.value;
    if (dsFilter !== "all") all = all.filter((s4) => (s4.dataSource ?? "otel") === dsFilter);
    return all;
  });
  var displaySessions = g2(() => {
    const all = agentFilteredSessions.value;
    const limit = sessionLimit.value;
    if (limit >= all.length) return all;
    return all.slice(0, limit);
  });
  var rangedSessions = g2(() => {
    const range = timeRange.value;
    const agent = selectedAgentFilter.value;
    if (range.preset === "all") {
      return agentFilteredSessions.value;
    }
    const since = range.since ?? 0;
    const until = range.until ?? Date.now();
    const allInMemory = agentFilteredSessions.value;
    const inMemory = allInMemory.filter((s4) => {
      if (!s4.startTime) return false;
      const ms = new Date(s4.startTime).getTime();
      return ms >= since && ms <= until;
    });
    const dbResults = rangedSearchResults.value;
    if (!dbResults) return inMemory;
    const dbIds = new Set(dbResults.sessions.map((s4) => s4.sessionId));
    const merged = [
      ...dbResults.sessions,
      ...inMemory.filter((s4) => !dbIds.has(s4.sessionId))
    ];
    merged.sort((a4, b4) => Date.parse(b4.startTime || "0") - Date.parse(a4.startTime || "0"));
    if (agent === "all") return merged;
    return merged.filter((s4) => s4.source === agent);
  });
  var filteredSessions = g2(() => {
    let sessions = rangedSessions.value;
    const text = sessionTextFilter.value.toLowerCase().trim();
    if (text) {
      sessions = sessions.filter((s4) => (s4.userRequest ?? "").toLowerCase().includes(text));
    }
    const iFilter = initiatorFilter.value;
    if (iFilter !== "all") {
      sessions = sessions.filter((s4) => (s4.initiator ?? "user") === iFilter);
    }
    const key = sessionSortKey.value;
    const dir = sessionSortDir.value;
    if (key === "start_time") return dir === "asc" ? [...sessions].reverse() : sessions;
    return [...sessions].sort((a4, b4) => {
      let cmp = 0;
      switch (key) {
        case "total_tokens":
          cmp = b4.inputTokens + b4.outputTokens - (a4.inputTokens + a4.outputTokens);
          break;
        case "duration_ms":
          cmp = b4.durationMs - a4.durationMs;
          break;
        case "errors":
          cmp = b4.errors - a4.errors;
          break;
        case "prompt":
          cmp = (a4.userRequest ?? "").localeCompare(b4.userRequest ?? "");
          break;
        case "model":
          cmp = (a4.model ?? "").localeCompare(b4.model ?? "");
          break;
        case "source":
          cmp = (a4.source ?? "").localeCompare(b4.source ?? "");
          break;
        case "cost": {
          const modeA = a4.source === "copilot" ? "token" : "token";
          const costA = calcSessionCost(a4, modeA).totalUsd;
          const costB = calcSessionCost(b4, modeA).totalUsd;
          cmp = costB - costA;
          break;
        }
      }
      return dir === "asc" ? -cmp : cmp;
    });
  });
  var agentPresence = g2(() => {
    const sessions = rangedSessions.value;
    return {
      claude: sessions.some((s4) => s4.source === "claude_code"),
      copilot: sessions.some((s4) => s4.source === "copilot"),
      codex: sessions.some((s4) => s4.source === "codex")
    };
  });

  // media/src/utils.ts
  function esc(s4) {
    if (!s4) return "";
    const d5 = document.createElement("div");
    d5.textContent = String(s4);
    return d5.innerHTML;
  }
  function syntaxHighlightJson(jsonStr) {
    return esc(jsonStr).replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="json-key">$1</span>:').replace(/:\s*("(?:\\.|[^"\\])*")/g, (_m, val) => ': <span class="json-string">' + val + "</span>").replace(/:\s*(\d+(?:\.\d+)?)/g, ': <span class="json-number">$1</span>').replace(/:\s*(true|false)/g, ': <span class="json-bool">$1</span>').replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
  }
  function formatMs(ms) {
    if (ms < 1) return "<1ms";
    if (ms < 1e3) return ms.toFixed(0) + "ms";
    if (ms < 6e4) return (ms / 1e3).toFixed(1) + "s";
    if (ms < 36e5) return (ms / 6e4).toFixed(1) + "min";
    return (ms / 36e5).toFixed(1) + "h";
  }
  function formatCompact(n3) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n3);
  }
  var DATA_SOURCE_TOOLTIP = {
    otel: "OTEL \u2014 Full telemetry: timing, speed, TTFT, loop signals",
    log: "Log \u2014 Conversation logs: tokens, tool calls, messages (no timing or speed data)"
  };
  function getDataSourceBadgeHtml(dataSource) {
    const ds = dataSource ?? "otel";
    const label = ds === "log" ? "Log" : "OTEL";
    const color = ds === "log" ? "#90a4ae" : "#ffffff";
    const tooltip = DATA_SOURCE_TOOLTIP[ds];
    return `<span style="font-size:9px;font-weight:600;padding:1px 4px;border-radius:2px;border:1px solid ${color};color:${color};letter-spacing:0.03em;vertical-align:middle;cursor:default" title="${tooltip}">${label}</span>`;
  }
  var INITIATOR_COLORS = { user: "#4a90d9", agent: "#b0bec5", api: "#90a4ae" };
  var INITIATOR_TOOLTIPS = {
    user: "Typed directly by a human in the chat",
    agent: "Spawned by the Agent tool (isSidechain) \u2014 a sub-task delegated by Claude",
    api: "Non-interactive API call (claude -p) \u2014 from a script or pipeline"
  };
  function getInitiatorBadgeHtml(initiator) {
    const key = initiator ?? "user";
    const color = INITIATOR_COLORS[key];
    const label = key === "api" ? "API" : key === "user" ? "User" : "Agent";
    return `<span style="font-size:9px;font-weight:600;padding:1px 4px;border-radius:2px;border:1px solid ${color};color:${color};letter-spacing:0.03em;vertical-align:middle;cursor:default;margin-left:3px" title="${INITIATOR_TOOLTIPS[key]}">${label}</span>`;
  }
  function getAgentSourceLabel(source) {
    if (source === "claude_code") return "Claude";
    if (source === "codex") return "Codex";
    return "Copilot";
  }
  function getAgentColor(source) {
    if (source === "claude_code") return "#FFB085";
    if (source === "codex") return "#F0FF42";
    if (source === "copilot") return "#00EAFF";
    return "#90a4ae";
  }
  function getAllSessionsChronological() {
    return sessionSummary.value?.sessions ?? [];
  }
  function formatSessionTime(sess) {
    if (!sess?.startTime) return "\u2014";
    const d5 = new Date(sess.startTime);
    if (isNaN(d5.getTime())) return "\u2014";
    return tsFormat(d5);
  }
  function tsFormat(d5) {
    const p5 = (n3, w5 = 2) => String(n3).padStart(w5, "0");
    return `${d5.getFullYear()}-${p5(d5.getMonth() + 1)}-${p5(d5.getDate())} ${p5(d5.getHours())}:${p5(d5.getMinutes())}:${p5(d5.getSeconds())}`;
  }
  function getSessionGlobalNumber(sess) {
    const all = getAllSessionsChronological();
    if (!sess || all.length === 0) return 0;
    const idx = all.indexOf(sess);
    if (idx !== -1) return idx + 1;
    for (let i4 = 0; i4 < all.length; i4++) {
      const s4 = all[i4];
      if (sess.sessionId && s4.sessionId === sess.sessionId) return i4 + 1;
      if (sess.traceId && sess.startTime && s4.traceId === sess.traceId && s4.startTime === sess.startTime) return i4 + 1;
      if (sess.traceId && sess.userRequest && s4.traceId === sess.traceId && s4.userRequest === sess.userRequest) return i4 + 1;
    }
    return 0;
  }
  function buildDisplaySummary(sessionsOverride) {
    const sessions = sessionsOverride ?? displaySessions.value;
    let totalInputTokens = 0, totalOutputTokens = 0, totalLlmCalls = 0, cacheRead = 0;
    sessions.forEach((s4) => {
      totalInputTokens += s4.inputTokens ?? 0;
      totalOutputTokens += s4.outputTokens ?? 0;
      totalLlmCalls += s4.totalLlmCalls ?? 0;
      cacheRead += s4.cacheReadTokens ?? 0;
    });
    return {
      sessions,
      efficiency: {
        totalInputTokens,
        totalOutputTokens,
        totalLlmCalls,
        avgInputPerCall: totalLlmCalls > 0 ? Math.round(totalInputTokens / totalLlmCalls) : 0,
        cacheHitRate: totalInputTokens > 0 ? cacheRead / totalInputTokens : 0,
        toolDefWaste: sessionSummary.value?.efficiency?.toolDefWaste ?? 0
      }
    };
  }
  function formatLlmLabel(entry) {
    const action = entry.action ?? "";
    if (action.indexOf("called ") === 0) {
      const tools = action.substring(7).split(/[,\s]+/).filter(Boolean);
      const counts = {};
      tools.forEach((t4) => {
        counts[t4] = (counts[t4] ?? 0) + 1;
      });
      const parts = Object.keys(counts).map((t4) => {
        const shortName = t4.replace(/^execute_tool\s*/, "");
        return counts[t4] > 1 ? counts[t4] + "\xD7 " + shortName : shortName;
      });
      return "Decide \u2192 " + parts.join(", ");
    }
    if (action === "text response") return "Respond with answer";
    return action || "LLM call";
  }
  function formatToolLabel(entry) {
    const label = entry.label ?? "";
    const parts = label.match(/^(\S+)\s*([\s\S]*)$/);
    if (!parts) return label;
    const toolName2 = parts[1];
    const args = parts[2] ?? "";
    if (!args.trim() && entry.toolInput) {
      const raw = entry.toolInput.trimStart();
      if (raw.startsWith("{")) {
        try {
          const parsed = JSON.parse(raw);
          const fp = String(parsed.file_path || parsed.filePath || "");
          if (fp) {
            const base = fp.split("/").pop() || fp;
            if (toolName2 === "MultiEdit" && Array.isArray(parsed.edits)) {
              const count = parsed.edits.length;
              return toolName2 + " " + base + (count > 1 ? " +" + (count - 1) : "");
            }
            return toolName2 + " " + base;
          }
          if (parsed.command) {
            const cmd = String(parsed.command);
            return "Bash " + (cmd.length > 60 ? cmd.slice(0, 57) + "\u2026" : cmd);
          }
          if (parsed.pattern) return toolName2 + " " + String(parsed.pattern);
          if (parsed.query) return toolName2 + " " + String(parsed.query);
        } catch {
        }
      } else {
        const isFilePath = raw.startsWith("/") || raw.startsWith("~") || /^[A-Za-z]:[/\\]/.test(raw);
        if (isFilePath) return toolName2 + " " + (raw.split("/").pop() || raw);
        return "Bash " + (raw.length > 60 ? raw.slice(0, 57) + "\u2026" : raw);
      }
    }
    switch (toolName2) {
      case "read_file": {
        const m4 = args.match(/^(\S+)\s*L(\d+)-(\d+)$/);
        if (m4) return "Read " + m4[1] + " :" + m4[2] + "-" + m4[3];
        return "Read " + args;
      }
      case "file_search": {
        const file = args.replace(/^\*\*\//, "").split("/").pop() ?? args;
        if (file.indexOf("*") !== -1) return "Find files matching " + file;
        return "Find " + file;
      }
      case "grep_search": {
        const gm = args.match(/^"([^"]*?)"\s+in\s+(.*)$/);
        if (gm) {
          const inFile = gm[2].replace(/^\*\*\//, "").split("/").pop() ?? gm[2];
          return 'Grep "' + gm[1] + '" in ' + inFile;
        }
        return "Grep " + args;
      }
      case "list_dir":
        return "List " + args + "/";
      case "manage_todo_list": {
        const tm = args.match(/(\d+)\s*items?\s*\(([^)]+)\)/);
        if (tm) return "Update todos (" + tm[2] + ")";
        const nm = args.match(/(\d+)\s*items?/);
        if (nm) return "Update todos (" + nm[1] + " items)";
        return "Check todos";
      }
      case "semantic_search":
        return "Search codebase " + args;
      case "replace_string_in_file":
      case "multi_replace_string_in_file":
        return "Edit " + args;
      case "create_file":
        return "Create " + args;
      case "run_in_terminal":
        return "Run: " + (args.length > 60 ? args.slice(0, 57) + "\u2026" : args);
      case "explore_subagent":
      case "runSubagent":
        return "Sub-agent: " + args;
      default:
        return toolName2 + (args ? " " + args : "");
    }
  }
  function formatToolResult(entry) {
    const rs = entry.resultSummary ?? "";
    if (!rs || rs === "empty") return "";
    if (rs === "No todo list found.") return "none";
    if (rs.match(/^Successfully/)) return "ok";
    if (rs === "no list") return "none";
    return rs;
  }

  // node_modules/.pnpm/preact@10.29.1/node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
  var f4 = 0;
  function u4(e4, t4, n3, o4, i4, u5) {
    t4 || (t4 = {});
    var a4, c4, p5 = t4;
    if ("ref" in p5) for (c4 in p5 = {}, t4) "ref" == c4 ? a4 = t4[c4] : p5[c4] = t4[c4];
    var l5 = { type: e4, props: p5, key: n3, ref: a4, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f4, __i: -1, __u: 0, __source: i4, __self: u5 };
    if ("function" == typeof e4 && (a4 = e4.defaultProps)) for (c4 in a4) void 0 === p5[c4] && (p5[c4] = a4[c4]);
    return l.vnode && l.vnode(l5), l5;
  }

  // media/src/tabs/Cost.tsx
  function fmtUsd2(usd) {
    if (usd === 0) return "$0.00";
    if (usd < 1e-3) return "<$0.001";
    if (usd < 1) return "$" + usd.toFixed(3);
    return "$" + usd.toFixed(2);
  }
  function sessionCostMode(session, mode) {
    return session.source === "codex" || session.source === "claude_code" ? "token" : mode;
  }
  function CostBarChart({ sessions, mode }) {
    const canvasRef = A2(null);
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const data = sessions.map((sess) => {
        const cost = calcSessionCost(sess, sessionCostMode(sess, mode));
        return { cost: cost.totalUsd, unknown: cost.modelUnknown, startTime: sess.startTime, source: sess.source };
      }).reverse();
      const dayKey = (t4) => t4 ? new Date(t4).toISOString().slice(0, 10) : "none";
      const dayTotals = /* @__PURE__ */ new Map();
      data.forEach((d5) => {
        const dk = dayKey(d5.startTime);
        dayTotals.set(dk, (dayTotals.get(dk) ?? 0) + d5.cost);
      });
      const maxDailyTotal = Math.max(...Array.from(dayTotals.values()), 1e-4);
      const maxCost = Math.max(...data.map((d5) => d5.cost), 1e-4);
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w5 = rect.width, h5 = rect.height;
      ctx.clearRect(0, 0, w5, h5);
      const pad = { top: 8, right: 58, bottom: 14, left: 64 };
      const chartW = w5 - pad.left - pad.right;
      const chartH = h5 - pad.top - pad.bottom;
      const cs = getComputedStyle(document.body);
      const gridColor = cs.getPropertyValue("--vscode-panel-border").trim() || "#333";
      const textColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
      const fontStr = "9px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      for (let i4 = 0; i4 <= 4; i4++) {
        const y5 = pad.top + chartH * i4 / 4;
        ctx.beginPath();
        ctx.moveTo(pad.left, y5);
        ctx.lineTo(pad.left + chartW, y5);
        ctx.stroke();
      }
      ctx.fillStyle = textColor;
      ctx.font = fontStr;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i4 = 0; i4 <= 4; i4++) {
        const val = maxCost * (4 - i4) / 4;
        ctx.fillText("$" + val.toFixed(val < 0.01 ? 3 : 2), pad.left - 4, pad.top + chartH * i4 / 4);
      }
      ctx.fillStyle = "rgba(129,199,132,0.85)";
      ctx.textAlign = "left";
      for (let i4 = 0; i4 <= 4; i4++) {
        const val = maxDailyTotal * (4 - i4) / 4;
        ctx.fillText("$" + val.toFixed(val < 0.1 ? 3 : 2), pad.left + chartW + 4, pad.top + chartH * i4 / 4);
      }
      const n3 = data.length;
      const slotW = chartW / Math.max(n3, 1);
      const barPad = n3 > 100 ? 0 : n3 > 50 ? 0.3 : n3 > 20 ? 0.7 : 1.2;
      const barW = Math.max(0.5, slotW - barPad * 2);
      const offsetX = pad.left;
      data.forEach((d5, i4) => {
        const x4 = offsetX + i4 * slotW + barPad;
        const barH = d5.cost / maxCost * chartH;
        const y5 = pad.top + chartH - barH;
        const color = d5.unknown ? "#666" : getAgentColor(d5.source);
        if (barH < 1) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x4, pad.top + chartH);
          ctx.lineTo(x4 + barW, pad.top + chartH);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x4, y5, barW, barH);
        }
        if (d5.unknown) {
          ctx.fillStyle = "#999";
          ctx.font = fontStr;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("?", x4 + barW / 2, pad.top + chartH - 2);
        }
      });
      const dayGroups = /* @__PURE__ */ new Map();
      data.forEach((d5, i4) => {
        const dk = dayKey(d5.startTime);
        if (!dayGroups.has(dk)) dayGroups.set(dk, { start: i4, end: i4 });
        dayGroups.get(dk).end = i4;
      });
      if (n3 > 0) {
        const labelFont = "8px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
        const MIN_LABEL_GAP = 30;
        let isFirst = true;
        let lastLabelX = -Infinity;
        for (const [dk, { start, end }] of dayGroups) {
          const x1 = offsetX + start * slotW + barPad;
          const midX = (offsetX + start * slotW + barPad + offsetX + end * slotW + barPad + barW) / 2;
          if (!isFirst) {
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 0.8;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x1, pad.top);
            ctx.lineTo(x1, pad.top + chartH);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          isFirst = false;
          if (midX - lastLabelX >= MIN_LABEL_GAP) {
            const label = dk.length >= 10 ? dk.slice(5, 10) : dk;
            ctx.font = labelFont;
            ctx.fillStyle = textColor;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(label, x1 + 2, pad.top + 1);
            lastLabelX = midX;
          }
        }
      }
      if (n3 > 0 && dayGroups.size > 0) {
        const pts = [];
        for (const [dk, { start, end }] of dayGroups) {
          const x1 = offsetX + start * slotW + barPad;
          const x22 = offsetX + end * slotW + barPad + barW;
          const midX = (x1 + x22) / 2;
          const daily = dayTotals.get(dk) ?? 0;
          const lineY = pad.top + chartH * (1 - daily / maxDailyTotal);
          pts.push({ x: midX, y: lineY });
        }
        ctx.strokeStyle = "rgba(129,199,132,0.9)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        pts.forEach((p5, i4) => {
          i4 === 0 ? ctx.moveTo(p5.x, p5.y) : ctx.lineTo(p5.x, p5.y);
        });
        ctx.stroke();
        ctx.fillStyle = "rgba(129,199,132,0.95)";
        pts.forEach((p5) => {
          ctx.beginPath();
          ctx.arc(p5.x, p5.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
    return /* @__PURE__ */ u4("div", { style: "margin-bottom:16px", children: /* @__PURE__ */ u4("canvas", { ref: canvasRef, style: "width:100%;height:230px;display:block" }) });
  }

  // node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
  function r4(e4) {
    var t4, f5, n3 = "";
    if ("string" == typeof e4 || "number" == typeof e4) n3 += e4;
    else if ("object" == typeof e4) if (Array.isArray(e4)) {
      var o4 = e4.length;
      for (t4 = 0; t4 < o4; t4++) e4[t4] && (f5 = r4(e4[t4])) && (n3 && (n3 += " "), n3 += f5);
    } else for (f5 in e4) e4[f5] && (n3 && (n3 += " "), n3 += f5);
    return n3;
  }
  function clsx() {
    for (var e4, t4, f5 = 0, n3 = "", o4 = arguments.length; f5 < o4; f5++) (e4 = arguments[f5]) && (t4 = r4(e4)) && (n3 && (n3 += " "), n3 += t4);
    return n3;
  }
  var clsx_default = clsx;

  // media/src/tabs/Insights.tsx
  var HELP_WHY = {
    "help-context-bloat": "Every LLM turn receives the full conversation so far. Each extra token in context multiplies cost across every remaining turn \u2014 a 10K growth in one session can mean 50K+ extra tokens billed.",
    "help-large-context": "Instruction files are sent on every LLM call in every session. 10,000 extra tokens in CLAUDE.md = 10,000 extra tokens per call, forever, regardless of task size.",
    "help-files-repeated": "Each re-read appends the full file to context again. Re-reading a 500-line file 4 times wastes ~2,000 tokens on every subsequent call in that session.",
    "help-high-turns": "Each additional LLM call costs tokens and time. Iterative discovery is ~10\xD7 more expensive than providing the same context upfront in the initial prompt.",
    "help-duplicate-searches": "Repeated searches append identical results to context without progress. The growing context also makes the model more likely to repeat the search again.",
    "help-tool-failures": "Each failure adds error text to context and forces a recovery turn. A cascade of 3 failures can waste 30,000+ tokens before a single useful edit is made.",
    "help-large-results": "Tool results are appended to context in full. A 50 KB file read adds ~12,500 tokens to every subsequent call in that session \u2014 not just the call that read it.",
    "help-tool-overhead": "Every LLM call includes all tool JSON schemas. 70+ tools = 8,000\u201315,000 overhead tokens per call that cannot be reduced by shortening your prompt.",
    "help-cache-rate": "Cached tokens cost roughly 10\xD7 less than fresh tokens. Going from 0% to 60% cache hit rate cuts session cost by 80\u201390% with no change to model behavior.",
    "help-tool-deadlock": "The agent is burning tokens repeating identical calls with zero progress. This loop runs until the context limit is hit \u2014 entire session cost with nothing accomplished.",
    "help-state-spiral": "Conflicting constraints cause the agent to undo its own work. Each oscillation adds both the edit and the revert to context, accelerating cost with each cycle.",
    "help-hallucination": "Each failed fix attempt adds the error to context, which anchors the model further from the real solution \u2014 the longer it runs, the harder it self-corrects.",
    "help-runaway-steps": "Scope creep compounds: each extra step the agent takes grows context for all future steps. 90-step sessions can cost 10\u201320\xD7 a well-scoped 5-step equivalent.",
    "help-context-accumulation": "Input tokens are growing while output shrinks \u2014 cost per call is compounding with diminishing returns. Continuing will likely hit the context limit with nothing saved."
  };
  function generateInsights(summary, allSessions) {
    const insights = [];
    const { sessions, efficiency: eff } = summary;
    if (!sessions.length) return insights;
    sessions.forEach((sess, idx) => {
      const llmEntries = (sess.timeline ?? []).filter((e4) => e4.type === "llm" && (e4.inputTokens ?? 0) > 0);
      const globalNum = getSessionGlobalNumber(sess) || idx + 1;
      const reqSnippet = (sess.userRequest ?? "").slice(0, 60);
      if (llmEntries.length >= 3) {
        const first = llmEntries[0].inputTokens ?? 0;
        const last = llmEntries[llmEntries.length - 1].inputTokens ?? 0;
        const growth = last - first;
        const growthPct = first > 0 ? growth / first * 100 : 0;
        if (growthPct > 20 && growth > 2e3) {
          insights.push({
            severity: "warning",
            category: "efficiency",
            sessionIdx: idx,
            helpId: "help-context-bloat",
            title: "[Session " + globalNum + "] Context grew " + growthPct.toFixed(0) + "%",
            detail: "Input tokens grew from " + first.toLocaleString() + " to " + last.toLocaleString() + " (+" + growth.toLocaleString() + " tokens) across " + llmEntries.length + " LLM calls" + (reqSnippet ? ' for "' + reqSnippet + '"' : "") + ".",
            action: "The first call used " + first.toLocaleString() + " tokens \u2014 audit your instruction files (CLAUDE.md, .agent.md, system prompt). Remove verbose examples and anything the agent can discover via tools. Target <5,000 tokens for combined static instructions."
          });
        }
      }
      const fileReads = {};
      (sess.timeline ?? []).forEach((e4) => {
        if (e4.type !== "tool") return;
        const m4 = (e4.label ?? "").match(/^read_file\s+(\S+)/);
        if (m4) fileReads[m4[1]] = (fileReads[m4[1]] ?? 0) + 1;
      });
      const repeats = Object.keys(fileReads).filter((f5) => fileReads[f5] > 1);
      if (repeats.length > 0) {
        const topFile = repeats.sort((a4, b4) => fileReads[b4] - fileReads[a4])[0];
        insights.push({
          severity: "info",
          category: "efficiency",
          sessionIdx: idx,
          helpId: "help-files-repeated",
          title: "[Session " + globalNum + "] Files read multiple times",
          detail: repeats.map((f5) => f5 + " (" + fileReads[f5] + "\xD7)").join(", ") + ".",
          action: repeats.length === 1 ? "The agent read " + topFile + " " + fileReads[topFile] + " times. Mention its path explicitly at the start of your prompt so the agent finds it without re-reading." : "The agent re-read " + repeats.length + " files, most often " + topFile + " (" + fileReads[topFile] + '\xD7). Try opening with the key paths listed: e.g. "The main files are: ' + repeats.slice(0, 2).join(", ") + '".'
        });
      }
      if (sess.totalLlmCalls > 8 && (sess.userRequest ?? "").length < 80) {
        const topTools = Object.entries(sess.toolCounts ?? {}).sort((a4, b4) => b4[1] - a4[1]).slice(0, 3).map(([t4, n3]) => t4 + " \xD7" + n3).join(", ");
        insights.push({
          severity: "info",
          category: "efficiency",
          sessionIdx: idx,
          helpId: "help-high-turns",
          title: "[Session " + globalNum + "] " + sess.totalLlmCalls + " LLM calls",
          detail: '"' + reqSnippet + '" required ' + sess.totalLlmCalls + " LLM calls and " + sess.totalToolCalls + " tool calls" + (topTools ? " (" + topTools + ")" : "") + ".",
          action: "For a " + sess.totalLlmCalls + "-turn session, break the task into smaller pieces with explicit stopping conditions. Provide specific file paths and line numbers so the agent spends turns doing instead of exploring."
        });
      }
      const firstLlm = (sess.timeline ?? []).find((e4) => e4.type === "llm" && (e4.inputTokens ?? 0) > 0);
      if (firstLlm && (firstLlm.inputTokens ?? 0) > 15e3) {
        insights.push({
          severity: "warning",
          category: "efficiency",
          sessionIdx: idx,
          helpId: "help-large-context",
          title: "[Session " + globalNum + "] Starts with " + (firstLlm.inputTokens ?? 0).toLocaleString() + " input tokens",
          detail: "The very first LLM call already has " + (firstLlm.inputTokens ?? 0).toLocaleString() + " tokens before any tool results are added.",
          action: "Audit your instruction files \u2014 " + (firstLlm.inputTokens ?? 0).toLocaleString() + " tokens before the first tool call is the baseline overhead. Remove verbose examples and information the agent can discover via tools. Target <5,000 tokens for combined instructions."
        });
      }
      const searches = {};
      (sess.timeline ?? []).forEach((e4) => {
        if (e4.type !== "tool") return;
        const m4 = (e4.label ?? "").match(/^(grep_search|file_search)\s+(.+)$/);
        if (m4) {
          const key = m4[1] + ":" + m4[2].replace(/\s+/g, " ").trim();
          searches[key] = (searches[key] ?? 0) + 1;
        }
      });
      const dupes = Object.keys(searches).filter((k3) => searches[k3] > 1);
      if (dupes.length > 0) {
        const examples = dupes.slice(0, 2).map((d5) => {
          const [, pattern] = d5.split(":");
          return '"' + pattern?.trim().slice(0, 40) + '"';
        });
        insights.push({
          severity: "info",
          category: "efficiency",
          sessionIdx: idx,
          helpId: "help-duplicate-searches",
          title: "[Session " + globalNum + "] Duplicate searches",
          detail: dupes.length + " search pattern(s) repeated: " + examples.join(", ") + ".",
          action: 'These repeated searches suggest the agent was uncertain where to look. Include directory names or specific file paths in your prompt \u2014 e.g. "search in src/api/" instead of a broad pattern.'
        });
      }
      const failedTools = {};
      (sess.timeline ?? []).forEach((e4) => {
        if (e4.type === "tool" && e4.isError) {
          const t4 = (e4.label ?? "").split(" ")[0];
          failedTools[t4] = (failedTools[t4] ?? 0) + 1;
        }
      });
      const failedEntries = Object.keys(failedTools);
      if (failedEntries.length > 0) {
        const totalFails = failedEntries.reduce((s4, t4) => s4 + failedTools[t4], 0);
        const toolAdvice = failedEntries.slice(0, 3).map((t4) => {
          const n3 = failedTools[t4];
          if (t4 === "bash" || t4 === "run_command") return t4 + " \xD7" + n3 + " (check the command exists in your environment)";
          if (t4 === "read_file" || t4 === "view") return t4 + " \xD7" + n3 + " (verify file paths are correct)";
          if (t4 === "grep_search" || t4 === "search_files") return t4 + " \xD7" + n3 + " (use more specific patterns)";
          return t4 + " \xD7" + n3;
        }).join("; ");
        insights.push({
          severity: totalFails > 2 ? "warning" : "info",
          category: "efficiency",
          sessionIdx: idx,
          helpId: "help-tool-failures",
          title: "[Session " + globalNum + "] " + totalFails + " tool failure(s)",
          detail: "Failed: " + toolAdvice + ". Each failure forces an extra LLM call to recover.",
          action: "Tool failures happen when the agent guesses paths or uses incorrect arguments. Be explicit in your prompt about file locations and command availability."
        });
      }
      const largeResults = [];
      (sess.timeline ?? []).forEach((e4) => {
        if (e4.type === "tool" && e4.fullResult && e4.fullResult.length > 1e4) {
          largeResults.push({ tool: (e4.label ?? "").split(" ")[0], size: e4.fullResult.length });
        }
      });
      if (largeResults.length > 0) {
        largeResults.sort((a4, b4) => b4.size - a4.size);
        const totalKb = largeResults.reduce((s4, r5) => s4 + r5.size, 0) / 1024;
        const topResult = largeResults[0];
        insights.push({
          severity: totalKb > 100 ? "warning" : "info",
          category: "efficiency",
          sessionIdx: idx,
          helpId: "help-large-results",
          title: "[Session " + globalNum + "] Large tool results (" + totalKb.toFixed(0) + "KB)",
          detail: largeResults.length + " tool call(s) returned large results: " + largeResults.slice(0, 3).map((r5) => r5.tool + " (" + (r5.size / 1024).toFixed(1) + "KB)").join(", ") + ".",
          action: topResult.tool.includes("read") ? "Use narrower reads \u2014 specify line ranges (e.g. read_file src/app.ts L1-50) instead of reading whole files." : "The largest result came from " + topResult.tool + " (" + (topResult.size / 1024).toFixed(0) + "KB). Use more targeted reads \u2014 specify line ranges with read_file, or tighter grep patterns."
        });
      }
      const loopHelpIds = {
        exact_tool_repeat: "help-tool-deadlock",
        edit_revert_cycle: "help-state-spiral",
        error_recurrence: "help-hallucination",
        runaway_steps: "help-runaway-steps",
        token_runaway: "help-context-accumulation"
      };
      (sess.loopSignals ?? []).forEach((sig) => {
        const examplesText = sig.examples?.length > 0 ? "\n\nExamples: " + sig.examples.join(" \xB7 ") : "";
        insights.push({
          severity: "loop-" + sig.severity,
          category: "loop",
          sessionIdx: idx,
          helpId: loopHelpIds[sig.type],
          title: "[Session " + globalNum + "] " + sig.patternName + " \u2014 " + sig.evidence,
          detail: examplesText.trim(),
          action: sig.action ?? sig.evidence,
          _loopType: sig.type
        });
      });
    });
    const crossSessions = allSessions ?? sessions;
    if (crossSessions.length >= 3) {
      const fileStats = {};
      for (const sess of crossSessions) {
        const hasProblems = (sess.errors ?? 0) > 0 || (sess.loopSignals?.length ?? 0) > 0;
        const files = [.../* @__PURE__ */ new Set([...sess.filesRead, ...sess.filesChanged, ...sess.filesSearched])];
        for (const f5 of files) {
          if (!fileStats[f5]) fileStats[f5] = { total: 0, problems: 0 };
          fileStats[f5].total++;
          if (hasProblems) fileStats[f5].problems++;
        }
      }
      const troubleFiles = Object.entries(fileStats).filter(([, v4]) => v4.total >= 3 && v4.problems / v4.total >= 0.6).sort((a4, b4) => b4[1].problems - a4[1].problems).slice(0, 4);
      if (troubleFiles.length > 0) {
        const names = troubleFiles.map(([f5]) => f5.split("/").pop() || f5);
        insights.push({
          severity: "warning",
          category: "efficiency",
          helpId: "help-files-repeated",
          title: troubleFiles.length + " file(s) appear in most sessions with errors or loops",
          detail: troubleFiles.map(
            ([f5, v4]) => (f5.split("/").pop() || f5) + ": " + v4.problems + "/" + v4.total + " sessions had issues"
          ).join("\n"),
          action: "These files appear frequently alongside agent difficulties: " + names.join(", ") + ". They may have conflicting constraints, be poorly documented for the agent, or be referenced with inconsistent paths. Consider adding a brief description of their role to your instruction files so the agent has reliable context before touching them."
        });
      }
      const recentN = Math.min(crossSessions.length, 8);
      const recent = crossSessions.slice(-recentN);
      const older = crossSessions.slice(0, -recentN);
      if (older.length >= 3) {
        const avgRecent = recent.reduce((s4, sess) => s4 + sess.cacheHitRate, 0) / recent.length;
        const avgOlder = older.reduce((s4, sess) => s4 + sess.cacheHitRate, 0) / older.length;
        const drop = avgOlder - avgRecent;
        if (drop > 0.15 && avgOlder > 0.3) {
          insights.push({
            severity: "warning",
            category: "efficiency",
            helpId: "help-cache-rate",
            title: "Cache hit rate declining \u2014 " + (avgOlder * 100).toFixed(0) + "% \u2192 " + (avgRecent * 100).toFixed(0) + "%",
            detail: "Average cache hit rate dropped " + (drop * 100).toFixed(0) + "% over your last " + recentN + " sessions.",
            action: "Cache hit rate drops when the stable prefix of your prompts changes. Recent changes to your instruction files (CLAUDE.md, .agent.md, system prompt) may be invalidating cached context. Keep static content at the top of prompts and avoid putting dynamic data (timestamps, file counts) in instructions."
          });
        }
      }
    }
    if (eff.toolDefWaste > 0.25) {
      insights.push({
        severity: "warning",
        category: "efficiency",
        helpId: "help-tool-overhead",
        title: "Tool definitions consuming ~" + (eff.toolDefWaste * 100).toFixed(0) + "% of context",
        detail: "A significant portion of each prompt is spent describing available tool schemas to the model.",
        action: 'Use tool restrictions in your .agent.md files with "tools:" to limit which tools are available.'
      });
    }
    if (eff.totalLlmCalls > 3 && eff.cacheHitRate < 0.5) {
      insights.push({
        severity: "warning",
        category: "efficiency",
        helpId: "help-cache-rate",
        title: "Low prompt cache hit rate (" + (eff.cacheHitRate * 100).toFixed(0) + "%)",
        detail: "Less than half of input tokens are being served from cache.",
        action: "Cache works best when the beginning of the prompt stays stable across turns. Keep static content at the top of your prompts."
      });
    }
    const severityOrder = { "loop-critical": 0, "loop-warning": 1, "warning": 2, "info": 3 };
    insights.sort((a4, b4) => {
      const aIdx = a4.sessionIdx ?? -1, bIdx = b4.sessionIdx ?? -1;
      if (aIdx !== bIdx) return bIdx - aIdx;
      return (severityOrder[a4.severity] ?? 4) - (severityOrder[b4.severity] ?? 4);
    });
    return insights;
  }
  function InsightCard({ ins, isIgnored, sessions }) {
    const icon = ins.severity.startsWith("loop") ? "\u21BA" : ins.severity === "warning" ? "\u26A0" : "\u2139";
    const session = ins.sessionIdx !== void 0 ? sessions[ins.sessionIdx] : void 0;
    const titleSessionMatch = ins.title.match(/^\[Session\s+\d+\]\s*(.*)$/);
    const insightTitle = titleSessionMatch ? titleSessionMatch[1] : ins.title;
    const sessionAgentColor = session ? getAgentColor(session.source) : "";
    const sessionTimestamp = session ? formatSessionTime(session) : "";
    const sessionPrompt = session?.userRequest || "";
    const [copied, setCopied] = d2(false);
    function buildAiPrompt() {
      const lines = [ins.title, ""];
      if (session?.userRequest && session.userRequest !== "[session in progress]") {
        lines.push('Task: "' + session.userRequest + '"', "");
      }
      if (ins.detail) lines.push(ins.detail, "");
      if (session) {
        const topTools = Object.entries(session.toolCounts ?? {}).sort((a4, b4) => b4[1] - a4[1]).slice(0, 5).map(([t4, n3]) => "  " + t4 + " \xD7" + n3).join("\n");
        if (topTools) lines.push("Top tools used:\n" + topTools, "");
        if (session.filesChanged.length > 0)
          lines.push("Files changed: " + session.filesChanged.slice(0, 5).join(", "), "");
        const errors = session.timeline.filter((e4) => e4.isError && e4.errorMessage).slice(0, 3);
        if (errors.length > 0)
          lines.push("Error messages:\n" + errors.map((e4) => "  - " + (e4.errorMessage ?? "").slice(0, 120)).join("\n"), "");
        lines.push("Session stats: " + session.totalLlmCalls + " LLM calls, " + session.totalToolCalls + " tool calls, " + (session.cacheHitRate * 100).toFixed(0) + "% cache hit rate", "");
      }
      lines.push("Action: " + ins.action);
      return lines.join("\n");
    }
    function buildClipboardPrompt() {
      const lines = [
        "I'm using an AI coding agent and the following issue was detected in my session.",
        "Please explain what's happening and suggest specific improvements to my workflow or prompt.",
        "",
        "--- Session context ---"
      ];
      if (session) {
        lines.push("Session ID: " + session.sessionId);
        lines.push(sessionTimestamp + " \xB7 " + getAgentSourceLabel(session.source));
        if (session.userRequest && session.userRequest !== "[session in progress]")
          lines.push('Task: "' + session.userRequest + '"');
      } else {
        lines.push("Across sessions");
      }
      lines.push("", "--- Insight ---", insightTitle);
      if (ins.detail) lines.push("", ins.detail);
      if (session) {
        lines.push("", "--- Session data ---");
        const topTools = Object.entries(session.toolCounts ?? {}).sort((a4, b4) => b4[1] - a4[1]).slice(0, 5).map(([t4, n3]) => t4 + " \xD7" + n3).join(", ");
        if (topTools) lines.push("Top tools: " + topTools);
        if (session.filesChanged.length > 0)
          lines.push("Files changed: " + session.filesChanged.slice(0, 5).join(", "));
        const errors = session.timeline.filter((e4) => e4.isError && e4.errorMessage).slice(0, 3);
        if (errors.length > 0)
          lines.push("Errors:\n" + errors.map((e4) => "  - " + (e4.errorMessage ?? "").slice(0, 120)).join("\n"));
        lines.push("Stats: " + session.totalLlmCalls + " LLM calls \xB7 " + session.totalToolCalls + " tool calls \xB7 " + (session.cacheHitRate * 100).toFixed(0) + "% cache hit");
      }
      lines.push("", "--- Recommended action ---", ins.action);
      return lines.join("\n");
    }
    function handleCopy() {
      navigator.clipboard.writeText(buildClipboardPrompt()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
    return /* @__PURE__ */ u4("div", { class: clsx_default("insight-card", "insight-" + ins.severity), style: isIgnored ? "opacity:0.55" : "", children: [
      /* @__PURE__ */ u4("div", { class: "insight-header", style: "align-items:flex-start;margin-bottom:4px", children: [
        /* @__PURE__ */ u4("span", { class: "insight-icon", style: "margin-top:1px", children: icon }),
        /* @__PURE__ */ u4("span", { class: "insight-title", style: "flex:1", children: insightTitle }),
        /* @__PURE__ */ u4(
          "button",
          {
            class: "insight-ignore-btn",
            title: "Copy prompt to clipboard",
            onClick: handleCopy,
            style: copied ? "color:var(--accent)" : "",
            children: copied ? "\u2713" : "\u29C9"
          }
        ),
        isIgnored ? /* @__PURE__ */ u4("button", { class: "insight-restore-btn", title: "Restore", onClick: () => ignoredInsightKeys.delete(ins.title), children: "Restore" }) : /* @__PURE__ */ u4("button", { class: "insight-ignore-btn", title: "Ignore", onClick: () => ignoredInsightKeys.add(ins.title), children: "Ignore" })
      ] }),
      /* @__PURE__ */ u4("div", { class: "insight-action", style: "margin-bottom:8px", children: [
        /* @__PURE__ */ u4("span", { class: "insight-action-label", children: [
          "Action",
          ins.helpId && HELP_WHY[ins.helpId] && /* @__PURE__ */ u4("span", { "data-tip": HELP_WHY[ins.helpId], style: "margin-left:4px;cursor:help;opacity:0.55;font-size:11px", children: "\u24D8" }),
          ":"
        ] }),
        " ",
        /* @__PURE__ */ u4("span", { style: "white-space:pre-wrap", children: ins.action })
      ] }),
      ins.detail && /* @__PURE__ */ u4("div", { class: "insight-detail", style: "white-space:pre-wrap", children: ins.detail })
    ] });
  }

  // media/src/tabs/Traces.tsx
  function StepDetail({ step, idx, sessIdx, sessionModel }) {
    const [showOutput, setShowOutput] = d2(false);
    const entry = step.entry;
    if (entry.type === "llm") {
      const PREVIEW_LEN = 400;
      const isLongResponse = (entry.responseText?.length ?? 0) > PREVIEW_LEN;
      const entryCost = calcEntryCost(entry, sessionModel);
      return /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Model" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: entry.model || "unknown" })
        ] }),
        ((entry.inputTokens ?? 0) > 0 || (entry.outputTokens ?? 0) > 0) && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Token Usage" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: [
            /* @__PURE__ */ u4("span", { class: "sw-token-in", children: [
              (entry.inputTokens ?? 0).toLocaleString(),
              " input"
            ] }),
            /* @__PURE__ */ u4("span", { class: "sw-token-arrow", children: " \u2192 " }),
            /* @__PURE__ */ u4("span", { class: "sw-token-out", children: [
              (entry.outputTokens ?? 0).toLocaleString(),
              " output"
            ] })
          ] })
        ] }),
        entryCost > 0 && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Cost" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: fmtUsd(entryCost) })
        ] }),
        entry.responseText && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: [
            "Response",
            isLongResponse && /* @__PURE__ */ u4("button", { class: "sw-show-full-btn", style: "margin-left:8px", onClick: () => setShowOutput((v4) => !v4), children: showOutput ? "Collapse" : "Show full response" })
          ] }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", style: "white-space:pre-wrap;word-break:break-word;font-size:11px;line-height:1.5", children: [
            showOutput ? entry.responseText : entry.responseText.slice(0, PREVIEW_LEN),
            isLongResponse && !showOutput && /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "\u2026" })
          ] })
        ] }),
        entry.thinking && /* @__PURE__ */ u4(LongTextSection, { heading: "Reasoning", text: entry.thinking, id: "sw-thinking-" + sessIdx + "-" + idx }),
        (entry.ttft ?? 0) > 0 && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Time to First Token" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: formatMs(entry.ttft) })
        ] }),
        /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Duration" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: formatMs(step.durationMs) })
        ] }),
        entry.action && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Stop reason" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: entry.action })
        ] }),
        entry.timestamp && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Timestamp" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value sw-detail-muted", children: entry.timestamp })
        ] })
      ] });
    }
    if (entry.type === "tool") {
      const toolParts = (entry.label ?? "").match(/^(\S+)\s*([\s\S]*)$/);
      const tName = toolParts ? toolParts[1] : entry.label;
      const tArgs = toolParts ? toolParts[2] : "";
      const isRaw = entry.toolInput && !entry.toolInput.trimStart().startsWith("{");
      const isFilePath = isRaw && (entry.toolInput.startsWith("/") || entry.toolInput.startsWith("~") || /^[A-Za-z]:[/\\]/.test(entry.toolInput));
      const inputHeading = !isRaw ? "Arguments" : isFilePath ? "File" : "Command";
      const inputText = isRaw ? entry.toolInput : tArgs || entry.toolInput || "";
      const resultText = entry.fullResult || entry.resultSummary || "";
      return /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Tool" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: /* @__PURE__ */ u4("code", { children: tName }) })
        ] }),
        inputText && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: inputHeading }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: /* @__PURE__ */ u4("code", { style: "white-space:pre-wrap;word-break:break-all", children: inputText }) })
        ] }),
        /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Duration" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: formatMs(step.durationMs) })
        ] }),
        entry.decision && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Decision" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", style: entry.decision === "rejected" ? "color:var(--error)" : "color:#8ec96b", children: entry.decision })
        ] }),
        resultText && /* @__PURE__ */ u4(LongTextSection, { heading: "Result", text: resultText, id: "sw-result-" + sessIdx + "-" + idx, isJson: true }),
        entry.isError && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading err", children: "Error" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value err", children: "This step failed" })
        ] }),
        entry.timestamp && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Timestamp" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value sw-detail-muted", children: entry.timestamp })
        ] })
      ] });
    }
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
        /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Background Task" }),
        /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: entry.label || "" })
      ] }),
      /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
        /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Duration" }),
        /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: formatMs(step.durationMs) })
      ] })
    ] });
  }
  function LongTextSection({ heading, text, id: _id, isJson }) {
    const [expanded, setExpanded] = d2(false);
    const maxPreviewChars = 600;
    const isLong = text.length > maxPreviewChars;
    let formatted = text.length > 6e3 ? text.slice(0, 6e3) + "\n... [truncated " + (text.length - 6e3).toLocaleString() + " chars]" : text;
    if (formatted.length <= 2e3) {
      try {
        formatted = JSON.stringify(JSON.parse(formatted), null, 2);
      } catch {
      }
    }
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: [
        heading,
        isLong && /* @__PURE__ */ u4("button", { class: "sw-show-full-btn", style: "margin-left:8px", onClick: () => setExpanded((v4) => !v4), children: expanded ? "Collapse" : "Show full" })
      ] }) }),
      !isLong || !expanded ? /* @__PURE__ */ u4("pre", { class: "sw-full-result-pre", style: "margin:0 0 8px", children: isJson && formatted.length <= 2e3 ? /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: syntaxHighlightJson(isLong ? text.slice(0, maxPreviewChars) : formatted) } }) : isLong ? text.slice(0, maxPreviewChars) + "\u2026" : formatted }) : /* @__PURE__ */ u4("pre", { class: "sw-full-result-pre", style: "margin:0 0 8px", children: isJson && formatted.length <= 2e3 ? /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: syntaxHighlightJson(formatted) } }) : formatted })
    ] });
  }
  function StepRow({ step, idx, sessIdx, sessionDur, sessionModel }) {
    const [open, setOpen] = d2(false);
    const entry = step.entry;
    const entryCost = entry.type === "llm" ? calcEntryCost(entry, sessionModel) : 0;
    let badgeLabel, barColor;
    if (entry.type === "llm") {
      badgeLabel = "LLM";
      barColor = "var(--accent)";
    } else if (entry.type === "tool") {
      badgeLabel = "TOOL";
      barColor = "#B8E986";
    } else if (entry.type === "user_input") {
      badgeLabel = "USER";
      barColor = "#F5A623";
    } else {
      badgeLabel = "BG";
      barColor = "var(--muted)";
    }
    if (entry.isError) barColor = "var(--error)";
    const rowLabel = entry.type === "llm" ? formatLlmLabel(entry) : entry.type === "tool" ? formatToolLabel(entry) + (formatToolResult(entry) ? " \u2192 " + formatToolResult(entry) : "") : entry.type === "user_input" ? entry.decision && entry.decision !== "unknown" ? `${entry.label} (${entry.decision})` : entry.label : entry.label || "";
    const toolSubtitle = (() => {
      if (entry.type !== "tool" || !entry.toolInput) return null;
      const raw = entry.toolInput.trimStart();
      if (raw.startsWith("{")) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.command) {
            const cmd = String(parsed.command);
            return cmd.length > 60 ? cmd : null;
          }
        } catch {
        }
        return null;
      }
      const isFilePath = raw.startsWith("/") || raw.startsWith("~") || /^[A-Za-z]:[/\\]/.test(raw);
      if (isFilePath) return null;
      return raw.length > 60 ? raw : null;
    })();
    const subtitle = toolSubtitle;
    const left = sessionDur > 0 ? step.offsetMs / sessionDur * 100 : 0;
    const width = sessionDur > 0 ? Math.max(step.durationMs / sessionDur * 100, 0.5) : 100;
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("div", { class: "wf-row", onClick: () => setOpen((v4) => !v4), children: [
        /* @__PURE__ */ u4("div", { class: "wf-label", title: subtitle ? rowLabel + " \u2014 " + subtitle : rowLabel, children: [
          /* @__PURE__ */ u4("span", { class: "wf-indent" }),
          /* @__PURE__ */ u4("span", { class: "sw-chevron", children: open ? "\u25BC" : "\u25B6" }),
          /* @__PURE__ */ u4("span", { class: "wf-type-badge", style: "background:" + barColor + ";color:#000", children: badgeLabel }),
          /* @__PURE__ */ u4("span", { style: "display:inline-flex;flex-direction:column;min-width:0", children: [
            /* @__PURE__ */ u4("span", { class: "wf-name", children: rowLabel }),
            subtitle && /* @__PURE__ */ u4("span", { style: "font-size:9px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px", children: subtitle })
          ] })
        ] }),
        /* @__PURE__ */ u4("div", { class: "wf-bar-area", children: /* @__PURE__ */ u4("div", { class: "wf-bar", style: `left:${left.toFixed(2)}%;width:${width.toFixed(2)}%`, children: /* @__PURE__ */ u4("div", { class: "wf-bar-inner", style: "background:" + barColor + ";opacity:" + (entry.isError ? "1" : "0.7") }) }) }),
        /* @__PURE__ */ u4("div", { class: "wf-info", children: [
          formatMs(step.durationMs),
          entry.type === "llm" && ((entry.inputTokens ?? 0) > 0 || (entry.outputTokens ?? 0) > 0) && /* @__PURE__ */ u4("div", { style: "font-size:9px;color:var(--muted);white-space:nowrap;margin-top:2px", children: [
            "\u2191",
            formatCompact(entry.inputTokens ?? 0),
            " \u2193",
            formatCompact(entry.outputTokens ?? 0)
          ] }),
          entryCost > 0 && /* @__PURE__ */ u4("div", { style: "font-size:9px;color:var(--muted);white-space:nowrap", children: [
            "~",
            fmtUsd(entryCost)
          ] })
        ] })
      ] }),
      open && /* @__PURE__ */ u4("div", { class: "sw-detail open", children: /* @__PURE__ */ u4(StepDetail, { step, idx, sessIdx, sessionModel }) })
    ] });
  }

  // media/src/tabs/Flow.tsx
  var LLM_COLOR = "#3794FF";
  var TOOL_COLOR = "#B8E986";
  var ERR_COLOR = "#f44747";
  var TURN_X = 130;
  var TOOL_X = 380;
  var LLM_R = 26;
  var TOOL_R = 22;
  function createInferredTurnEntry(sess, tools, index) {
    const sourceLabel = getAgentSourceLabel(sess.source);
    return {
      type: "llm",
      spanId: "flow-inferred-turn-" + index,
      label: sourceLabel + " tool phase",
      model: sess.model || sourceLabel,
      durationMs: 0,
      action: "Inferred turn for tool events emitted before a response",
      isError: tools.some((t4) => t4.isError),
      timestamp: tools[0]?.timestamp || sess.startTime
    };
  }
  function buildTurnGroups(sess, timeline) {
    const turns = [];
    let pendingTools = [];
    const pushInferredTurn = () => {
      if (pendingTools.length === 0) {
        return;
      }
      turns.push({
        entry: createInferredTurnEntry(sess, pendingTools, turns.length),
        tools: pendingTools
      });
      pendingTools = [];
    };
    for (const entry of timeline) {
      if (entry.type === "llm") {
        if (turns.length === 0) {
          pushInferredTurn();
        } else {
          turns[turns.length - 1].tools = pendingTools;
          pendingTools = [];
        }
        turns.push({ entry, tools: [] });
      } else if (entry.type === "tool") {
        pendingTools.push(entry);
      }
    }
    if (pendingTools.length > 0) {
      if (turns.length > 0) {
        turns[turns.length - 1].tools = pendingTools;
      } else {
        pushInferredTurn();
      }
    }
    return turns;
  }
  function isInferredTurn(entry) {
    return entry.spanId.startsWith("flow-inferred-turn-");
  }
  function FlowCanvas({ sess, height = 520 }) {
    const [isPlaying, setIsPlaying] = d2(false);
    const speedRef = A2(800);
    const setIsPlayingRef = A2(setIsPlaying);
    setIsPlayingRef.current = setIsPlaying;
    const progressId = "flow-prog-" + sess.sessionId;
    const canvasRef = A2(null);
    const stateRef = A2({
      zoom: 1,
      panX: 0,
      panY: 0,
      dragging: false,
      didDrag: false,
      lastMX: 0,
      lastMY: 0,
      hoverNodeId: null,
      clickedNodeId: null,
      nodes: [],
      edges: [],
      playbackTurns: [],
      playbackIdx: 0,
      playbackPlaying: false,
      playbackTimer: null
    });
    if (!sessionTimelines.value[sess.sessionId] && vscode) {
      vscode.postMessage({ type: "loadSessionDetail", sessionId: sess.sessionId });
    }
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const st = stateRef.current;
      if (st.playbackTimer) {
        clearInterval(st.playbackTimer);
        st.playbackTimer = null;
      }
      st.playbackPlaying = false;
      st.playbackIdx = 0;
      st.clickedNodeId = null;
      setIsPlayingRef.current(false);
      const loadedTimeline = sessionTimelines.value[sess.sessionId] ?? sess.timeline;
      const timeline = (loadedTimeline ?? []).filter((e4) => e4.type !== "background");
      const turns = buildTurnGroups(sess, timeline);
      const toolData = /* @__PURE__ */ new Map();
      turns.forEach((turn, ti) => {
        const seenThisTurn = /* @__PURE__ */ new Set();
        turn.tools.forEach((t4) => {
          const name = t4.label || "tool";
          if (!toolData.has(name)) toolData.set(name, { count: 0, totalMs: 0, errors: 0, turns: [] });
          const d5 = toolData.get(name);
          d5.count++;
          d5.totalMs += t4.durationMs || 0;
          if (t4.isError) d5.errors++;
          if (!seenThisTurn.has(name)) {
            d5.turns.push(ti);
            seenThisTurn.add(name);
          }
        });
      });
      const N2 = turns.length;
      const TURN_SPACING = N2 <= 1 ? 100 : Math.max(65, Math.min(100, Math.floor(480 / Math.max(N2 - 1, 1))));
      const TOOL_MIN_GAP = 68;
      const START_Y = 70;
      const nodes = [];
      const edges = [];
      const nodeIdxMap = {};
      turns.forEach((turn, i4) => {
        const inferred = isInferredTurn(turn.entry);
        const node = {
          id: "llm-" + i4,
          x: TURN_X,
          y: START_Y + i4 * TURN_SPACING,
          color: turn.entry.isError ? ERR_COLOR : LLM_COLOR,
          type: "llm",
          label: "T" + (i4 + 1),
          subLabel: inferred ? turn.tools.length + "\xD7" : (turn.entry.inputTokens ?? 0) > 0 ? Math.round((turn.entry.inputTokens ?? 0) / 1e3) + "K" : "",
          turnNum: i4 + 1,
          totalTurns: turns.length,
          inputTokens: turn.entry.inputTokens ?? 0,
          outputTokens: turn.entry.outputTokens ?? 0,
          costUsd: inferred ? void 0 : calcEntryCost(turn.entry, sess.model ?? "") || void 0,
          model: turn.entry.model ?? turn.entry.label ?? "",
          durationMs: turn.entry.durationMs ?? 0,
          action: turn.entry.action ?? "",
          note: inferred ? "Tool events arrived before a response event, so Flow anchors them to this inferred turn." : void 0,
          toolsUsed: [...new Set(turn.tools.map((t4) => t4.label || "tool"))],
          isError: turn.entry.isError
        };
        nodeIdxMap[node.id] = nodes.length;
        nodes.push(node);
      });
      for (let i4 = 0; i4 < turns.length - 1; i4++) {
        edges.push({ from: nodeIdxMap["llm-" + i4], to: nodeIdxMap["llm-" + (i4 + 1)], count: 1, kind: "seq" });
      }
      const toolNames = Array.from(toolData.keys());
      const toolTargetY = (name) => {
        const d5 = toolData.get(name);
        const avg = d5.turns.reduce((a4, b4) => a4 + b4, 0) / d5.turns.length;
        return START_Y + avg * TURN_SPACING;
      };
      const sortedTools = [...toolNames].sort((a4, b4) => toolTargetY(a4) - toolTargetY(b4));
      let prevY = -Infinity;
      const toolY = {};
      for (const name of sortedTools) {
        const ty = Math.max(toolTargetY(name), prevY + TOOL_MIN_GAP);
        toolY[name] = ty;
        prevY = ty;
      }
      if (sortedTools.length > 0) {
        const turnsCenter = START_Y + (N2 - 1) * TURN_SPACING / 2;
        const toolsFirst = toolY[sortedTools[0]];
        const toolsLast = toolY[sortedTools[sortedTools.length - 1]];
        const toolsCenter = (toolsFirst + toolsLast) / 2;
        const shift = turnsCenter - toolsCenter;
        sortedTools.forEach((name) => {
          toolY[name] += shift;
        });
      }
      sortedTools.forEach((name) => {
        const d5 = toolData.get(name);
        const node = {
          id: "tool-" + name,
          x: TOOL_X,
          y: toolY[name],
          color: d5.errors > 0 ? ERR_COLOR : TOOL_COLOR,
          type: "tool",
          label: name.length > 14 ? name.slice(0, 13) + "\u2026" : name,
          fullLabel: name,
          subLabel: d5.count + "\xD7",
          callCount: d5.count,
          totalDurationMs: d5.totalMs,
          avgDurationMs: d5.count > 0 ? Math.round(d5.totalMs / d5.count) : 0,
          errorCount: d5.errors,
          usedInTurns: d5.turns
        };
        nodeIdxMap[node.id] = nodes.length;
        nodes.push(node);
      });
      turns.forEach((turn, ti) => {
        const perTool = {};
        turn.tools.forEach((t4) => {
          const n3 = t4.label || "tool";
          perTool[n3] = (perTool[n3] || 0) + 1;
        });
        Object.entries(perTool).forEach(([name, count]) => {
          const from = nodeIdxMap["llm-" + ti];
          const to = nodeIdxMap["tool-" + name];
          if (from !== void 0 && to !== void 0) {
            edges.push({ from, to, count, kind: "use" });
          }
        });
      });
      st.nodes = nodes;
      st.edges = edges;
      st.playbackTurns = turns.map((_4, i4) => nodeIdxMap["llm-" + i4]).filter((i4) => i4 !== void 0);
      function nR(n3) {
        return n3.type === "llm" ? LLM_R : TOOL_R;
      }
      function centerGraph() {
        if (!canvas || nodes.length === 0) return;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach((n3) => {
          const pad = nR(n3) + 34;
          if (n3.x - pad < minX) minX = n3.x - pad;
          if (n3.y - pad < minY) minY = n3.y - pad;
          if (n3.x + pad > maxX) maxX = n3.x + pad;
          if (n3.y + pad > maxY) maxY = n3.y + pad;
        });
        const gW = maxX - minX + 40, gH = maxY - minY + 40;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        st.zoom = Math.max(0.15, Math.min(rect.width / gW, rect.height / gH, 1.4));
        st.panX = rect.width / 2 - (minX + maxX) / 2 * st.zoom;
        st.panY = rect.height / 2 - (minY + maxY) / 2 * st.zoom;
      }
      function draw() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.save();
        ctx.translate(st.panX, st.panY);
        ctx.scale(st.zoom, st.zoom);
        const cs = getComputedStyle(document.body);
        const fg = cs.getPropertyValue("--fg").trim() || "#ccc";
        const muted = cs.getPropertyValue("--muted").trim() || "#666";
        if (turns.length === 0) {
          ctx.restore();
          ctx.font = "13px sans-serif";
          ctx.fillStyle = muted;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("No timeline data for this session", rect.width / 2, rect.height / 2);
          return;
        }
        const activeId = st.clickedNodeId || st.hoverNodeId;
        const hlNodes = /* @__PURE__ */ new Set();
        const hlEdges = /* @__PURE__ */ new Set();
        if (activeId) {
          hlNodes.add(activeId);
          edges.forEach((e4, ei) => {
            const fn = nodes[e4.from], tn = nodes[e4.to];
            if (fn.id === activeId || tn.id === activeId) {
              hlEdges.add(ei);
              hlNodes.add(fn.id);
              hlNodes.add(tn.id);
            }
          });
        }
        const llmNodes = nodes.filter((n3) => n3.type === "llm");
        if (llmNodes.length >= 2) {
          const spineX = TURN_X - 44;
          ctx.save();
          ctx.setLineDash([4, 5]);
          ctx.strokeStyle = LLM_COLOR + "40";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(spineX, llmNodes[0].y);
          ctx.lineTo(spineX, llmNodes[llmNodes.length - 1].y);
          ctx.stroke();
          ctx.setLineDash([]);
          llmNodes.forEach((n3) => {
            ctx.strokeStyle = LLM_COLOR + "38";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(spineX, n3.y);
            ctx.lineTo(n3.x - LLM_R, n3.y);
            ctx.stroke();
          });
          ctx.restore();
        }
        edges.forEach((e4, ei) => {
          const a4 = nodes[e4.from], b4 = nodes[e4.to];
          const isHl = activeId ? hlEdges.has(ei) : false;
          const dimmed = activeId && !isHl;
          if (e4.kind === "seq") {
            const ax = a4.x + 8, ay = a4.y + LLM_R;
            const bx = b4.x + 8, by = b4.y - LLM_R;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = dimmed ? LLM_COLOR + "18" : isHl ? LLM_COLOR : LLM_COLOR + "50";
            ctx.lineWidth = isHl ? 2.5 : 1.5;
            ctx.stroke();
            const ang = Math.atan2(by - ay, bx - ax), aLen = 7;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx - aLen * Math.cos(ang - 0.4), by - aLen * Math.sin(ang - 0.4));
            ctx.lineTo(bx - aLen * Math.cos(ang + 0.4), by - aLen * Math.sin(ang + 0.4));
            ctx.closePath();
            ctx.fillStyle = dimmed ? LLM_COLOR + "18" : isHl ? LLM_COLOR : LLM_COLOR + "60";
            ctx.fill();
          } else {
            const sx = a4.x + LLM_R, sy = a4.y;
            const ex = b4.x - TOOL_R, ey = b4.y;
            const span = TOOL_X - TURN_X;
            const cp1x = sx + span * 0.45, cp1y = sy;
            const cp2x = ex - span * 0.45, cp2y = ey;
            const alpha = dimmed ? 0.08 : isHl ? 1 : Math.min(0.75, 0.28 + e4.count * 0.1);
            const lw = isHl ? 2.5 : Math.min(4, 1 + e4.count * 0.5);
            const hexA = Math.round(alpha * 255).toString(16).padStart(2, "0");
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
            ctx.strokeStyle = a4.color + hexA;
            ctx.lineWidth = lw;
            ctx.stroke();
            const ang = Math.atan2(ey - cp2y, ex - cp2x), aLen = 7;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - aLen * Math.cos(ang - 0.4), ey - aLen * Math.sin(ang - 0.4));
            ctx.lineTo(ex - aLen * Math.cos(ang + 0.4), ey - aLen * Math.sin(ang + 0.4));
            ctx.closePath();
            ctx.fillStyle = a4.color + hexA;
            ctx.fill();
            if (e4.count > 1 && !dimmed) {
              const mx = (sx + ex) / 2, my = (sy + ey) / 2 - 9;
              ctx.font = "bold 9px sans-serif";
              ctx.fillStyle = a4.color + "cc";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(e4.count + "\xD7", mx, my);
            }
          }
        });
        nodes.forEach((n3) => {
          const r5 = nR(n3);
          const isActive = n3.id === activeId;
          const inHL = activeId ? hlNodes.has(n3.id) : false;
          const dimmed = activeId && !inHL;
          if (isActive) {
            ctx.save();
            ctx.shadowColor = n3.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(n3.x, n3.y, r5 + 4, 0, Math.PI * 2);
            ctx.strokeStyle = n3.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
          ctx.beginPath();
          ctx.arc(n3.x, n3.y, r5, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? n3.color + "aa" : dimmed ? n3.color + "10" : n3.color + "28";
          ctx.fill();
          ctx.strokeStyle = dimmed ? n3.color + "30" : n3.color;
          ctx.lineWidth = isActive ? 3 : inHL ? 2.5 : 2;
          ctx.stroke();
          ctx.font = (isActive ? "bold " : "") + "10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = dimmed ? muted + "40" : fg;
          ctx.fillText(n3.label, n3.x, n3.y - (n3.subLabel ? 4 : 0));
          if (n3.subLabel) {
            ctx.font = "8px sans-serif";
            ctx.fillStyle = dimmed ? muted + "30" : n3.type === "llm" ? "#7bb3ff" : n3.color === ERR_COLOR ? "#f99" : "#8ec96b";
            ctx.fillText(n3.subLabel, n3.x, n3.y + 7);
          }
          ctx.font = "9px sans-serif";
          ctx.fillStyle = dimmed ? muted + "30" : muted;
          ctx.fillText(n3.type === "llm" ? "Turn " + n3.turnNum : "", n3.x, n3.y + r5 + 11);
        });
        const tipId = st.clickedNodeId || st.hoverNodeId;
        if (tipId) {
          const hn = nodes.find((n3) => n3.id === tipId);
          if (hn) {
            const trunc = (s4, max) => s4 && s4.length > max ? s4.slice(0, max) + "\u2026" : s4 || "";
            const lines = [];
            if (hn.type === "llm") {
              lines.push({ value: "Turn " + hn.turnNum + " of " + hn.totalTurns, bold: true, color: hn.color });
              if (hn.model) lines.push({ label: "Model", value: trunc(hn.model, 42) });
              if (hn.note) lines.push({ label: "Note", value: hn.note });
              if ((hn.inputTokens ?? 0) > 0 || (hn.outputTokens ?? 0) > 0)
                lines.push({ label: "Tokens", value: (hn.inputTokens ?? 0).toLocaleString() + " in \u2192 " + (hn.outputTokens ?? 0).toLocaleString() + " out" });
              if ((hn.costUsd ?? 0) > 0)
                lines.push({ label: "Cost", value: fmtUsd(hn.costUsd) });
              if (hn.durationMs) lines.push({ label: "Duration", value: formatMs(hn.durationMs) });
              if (hn.action) lines.push({ label: "Outcome", value: hn.action });
              if (hn.toolsUsed?.length) lines.push({ label: "Tools used", value: hn.toolsUsed.slice(0, 5).join(", ") + (hn.toolsUsed.length > 5 ? " +" + (hn.toolsUsed.length - 5) + " more" : "") });
              if (hn.isError) lines.push({ label: "Error", value: "This LLM call failed", color: ERR_COLOR });
            } else {
              lines.push({ value: hn.fullLabel || hn.label, bold: true, color: hn.color });
              lines.push({ label: "Total calls", value: String(hn.callCount) });
              if ((hn.usedInTurns?.length ?? 0) > 0)
                lines.push({ label: "Used in turns", value: "T" + (hn.usedInTurns ?? []).map((t4) => t4 + 1).join(", T") });
              if (hn.avgDurationMs) lines.push({ label: "Avg duration", value: formatMs(hn.avgDurationMs) });
              if (hn.totalDurationMs) lines.push({ label: "Total time", value: formatMs(hn.totalDurationMs) });
              if (hn.errorCount) lines.push({ label: "Errors", value: hn.errorCount + " failed call(s)", color: ERR_COLOR });
            }
            ctx.font = "11px sans-serif";
            const lineH = 19, padX = 12, padY = 10;
            let labelW = 0, valueW = 0;
            lines.forEach((line) => {
              if (line.label) {
                ctx.font = "bold 10px sans-serif";
                const lw = ctx.measureText(line.label + ":").width;
                if (lw > labelW) labelW = lw;
              }
              ctx.font = line.bold ? "bold 12px sans-serif" : "11px sans-serif";
              const vw = ctx.measureText(line.value).width;
              if (vw > valueW) valueW = vw;
            });
            const gapW = 10, contentW = Math.max(labelW + gapW + valueW, valueW);
            const boxW = Math.min(contentW + padX * 2, 390);
            const boxH = lines.length * lineH + padY * 2 + 4;
            let boxX = hn.x + nR(hn) + 14;
            const boxY = hn.y - boxH / 2;
            if (hn.x + nR(hn) + 14 + boxW > rect.width / st.zoom - st.panX / st.zoom - 20) {
              boxX = hn.x - nR(hn) - 14 - boxW;
            }
            const br = 7;
            ctx.fillStyle = "rgba(22,22,26,0.97)";
            ctx.strokeStyle = hn.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(boxX + br, boxY);
            ctx.lineTo(boxX + boxW - br, boxY);
            ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + br);
            ctx.lineTo(boxX + boxW, boxY + boxH - br);
            ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - br, boxY + boxH);
            ctx.lineTo(boxX + br, boxY + boxH);
            ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - br);
            ctx.lineTo(boxX, boxY + br);
            ctx.quadraticCurveTo(boxX, boxY, boxX + br, boxY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = hn.color + "cc";
            ctx.fillRect(boxX, boxY + br, 3, boxH - br * 2);
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            let dividerDrawn = false;
            lines.forEach((line, li) => {
              const ly = boxY + padY + li * lineH + 2;
              if (line.label) {
                if (!dividerDrawn) {
                  dividerDrawn = true;
                  ctx.strokeStyle = "rgba(255,255,255,0.08)";
                  ctx.lineWidth = 0.5;
                  ctx.beginPath();
                  ctx.moveTo(boxX + 10, ly - 4);
                  ctx.lineTo(boxX + boxW - 10, ly - 4);
                  ctx.stroke();
                }
                ctx.font = "bold 10px sans-serif";
                ctx.fillStyle = "#777";
                ctx.fillText(line.label + ":", boxX + padX + 4, ly + 1);
                ctx.font = "11px sans-serif";
                ctx.fillStyle = line.color || "#ddd";
                ctx.fillText(line.value, boxX + padX + 4 + labelW + gapW, ly);
              } else {
                ctx.font = line.bold ? "bold 12px sans-serif" : "11px sans-serif";
                ctx.fillStyle = line.color || "#fff";
                ctx.fillText(line.value, boxX + padX + 4, ly);
              }
            });
          }
        }
        ctx.restore();
      }
      requestAnimationFrame(() => {
        centerGraph();
        draw();
      });
      const onWheel = (e4) => {
        e4.preventDefault();
        const f5 = e4.deltaY < 0 ? 1.1 : 0.9;
        const wx = (e4.offsetX - st.panX) / st.zoom, wy = (e4.offsetY - st.panY) / st.zoom;
        st.zoom = Math.max(0.1, Math.min(5, st.zoom * f5));
        st.panX = e4.offsetX - wx * st.zoom;
        st.panY = e4.offsetY - wy * st.zoom;
        draw();
      };
      const onMouseDown = (e4) => {
        st.dragging = true;
        st.didDrag = false;
        st.lastMX = e4.offsetX;
        st.lastMY = e4.offsetY;
        canvas.style.cursor = "grabbing";
      };
      const onMouseMove = (e4) => {
        if (st.dragging) {
          st.didDrag = true;
          st.panX += e4.offsetX - st.lastMX;
          st.panY += e4.offsetY - st.lastMY;
          st.lastMX = e4.offsetX;
          st.lastMY = e4.offsetY;
          draw();
          return;
        }
        if (!st.playbackPlaying) {
          const rect = canvas.getBoundingClientRect();
          const mx = (e4.clientX - rect.left - st.panX) / st.zoom;
          const my = (e4.clientY - rect.top - st.panY) / st.zoom;
          let found = null;
          for (const n3 of nodes) {
            const r5 = nR(n3), dx = mx - n3.x, dy = my - n3.y;
            if (dx * dx + dy * dy <= r5 * r5) {
              found = n3.id;
              break;
            }
          }
          if (found !== st.hoverNodeId) {
            st.hoverNodeId = found;
            canvas.style.cursor = found ? "pointer" : "grab";
            draw();
          }
        }
      };
      const onMouseUp = () => {
        st.dragging = false;
        canvas.style.cursor = "grab";
      };
      const onMouseLeave = () => {
        st.dragging = false;
        st.hoverNodeId = null;
        canvas.style.cursor = "grab";
        draw();
      };
      const onClick = (e4) => {
        if (st.didDrag) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (e4.clientX - rect.left - st.panX) / st.zoom;
        const my = (e4.clientY - rect.top - st.panY) / st.zoom;
        for (const n3 of nodes) {
          const r5 = nR(n3), dx = mx - n3.x, dy = my - n3.y;
          if (dx * dx + dy * dy <= r5 * r5) {
            st.clickedNodeId = st.clickedNodeId === n3.id ? null : n3.id;
            draw();
            return;
          }
        }
        st.clickedNodeId = null;
        draw();
      };
      canvas.addEventListener("wheel", onWheel, { passive: false });
      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseup", onMouseUp);
      canvas.addEventListener("mouseleave", onMouseLeave);
      canvas.addEventListener("click", onClick);
      canvas.__flowDraw = draw;
      canvas.__flowCenter = centerGraph;
      return () => {
        if (st.playbackTimer) clearInterval(st.playbackTimer);
        canvas.removeEventListener("wheel", onWheel);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
        canvas.removeEventListener("mouseleave", onMouseLeave);
        canvas.removeEventListener("click", onClick);
      };
    }, [sess.sessionId, sessionTimelines.value[sess.sessionId]]);
    function handleZoomIn() {
      const c4 = canvasRef.current;
      if (!c4) return;
      stateRef.current.zoom = Math.min(5, stateRef.current.zoom * 1.3);
      c4.__flowDraw?.();
    }
    function handleZoomOut() {
      const c4 = canvasRef.current;
      if (!c4) return;
      stateRef.current.zoom = Math.max(0.1, stateRef.current.zoom / 1.3);
      c4.__flowDraw?.();
    }
    function handleReset() {
      const c4 = canvasRef.current;
      if (!c4) return;
      c4.__flowCenter?.();
      c4.__flowDraw?.();
    }
    function handlePlayPause() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const st = stateRef.current;
      const draw = canvas.__flowDraw;
      if (!draw) return;
      const prog = document.getElementById(progressId);
      if (st.playbackPlaying) {
        if (st.playbackTimer) clearInterval(st.playbackTimer);
        st.playbackTimer = null;
        st.playbackPlaying = false;
        st.clickedNodeId = null;
        setIsPlaying(false);
        if (prog) prog.textContent = "";
        draw();
        return;
      }
      if (st.playbackTurns.length === 0) return;
      st.playbackPlaying = true;
      setIsPlaying(true);
      st.playbackIdx = 0;
      st.clickedNodeId = st.nodes[st.playbackTurns[0]]?.id ?? null;
      if (prog) prog.textContent = "1 / " + st.playbackTurns.length;
      draw();
      st.playbackTimer = setInterval(() => {
        if (st.playbackIdx >= st.playbackTurns.length - 1) {
          clearInterval(st.playbackTimer);
          st.playbackTimer = null;
          st.playbackPlaying = false;
          st.clickedNodeId = null;
          setIsPlayingRef.current(false);
          if (prog) prog.textContent = "";
          draw();
          return;
        }
        st.playbackIdx++;
        st.clickedNodeId = st.nodes[st.playbackTurns[st.playbackIdx]]?.id ?? null;
        if (prog) prog.textContent = st.playbackIdx + 1 + " / " + st.playbackTurns.length;
        draw();
      }, speedRef.current);
    }
    return /* @__PURE__ */ u4("div", { children: [
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-bottom:6px", children: [
        /* @__PURE__ */ u4("button", { class: "flow-btn", onClick: handleZoomIn, children: "+" }),
        /* @__PURE__ */ u4("button", { class: "flow-btn", onClick: handleZoomOut, children: "\u2212" }),
        /* @__PURE__ */ u4("button", { class: "flow-btn", onClick: handleReset, children: "Reset" }),
        /* @__PURE__ */ u4("span", { style: "width:1px;height:16px;background:var(--border);margin:0 2px" }),
        /* @__PURE__ */ u4("button", { class: "flow-btn", title: "Animate turn sequence", onClick: handlePlayPause, children: isPlaying ? "\u23F8" : "\u25B6" }),
        /* @__PURE__ */ u4(
          "select",
          {
            class: "toolbar-select",
            onChange: (e4) => {
              speedRef.current = parseInt(e4.target.value) || 800;
            },
            children: [
              /* @__PURE__ */ u4("option", { value: "2000", children: "Slow" }),
              /* @__PURE__ */ u4("option", { value: "800", selected: true, children: "Normal" }),
              /* @__PURE__ */ u4("option", { value: "300", children: "Fast" })
            ]
          }
        ),
        /* @__PURE__ */ u4("span", { id: progressId, style: "font-size:10px;color:var(--muted)" })
      ] }),
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted);flex-wrap:wrap;align-items:center", children: [
        [
          { color: LLM_COLOR, label: "LLM turn" },
          { color: TOOL_COLOR, label: "Tool" },
          { color: ERR_COLOR, label: "Error" }
        ].map(({ color, label }) => /* @__PURE__ */ u4("span", { style: "display:flex;align-items:center;gap:4px", children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:9px;height:9px;border-radius:50%;background:" + color + "30;border:1.5px solid " + color }),
          label
        ] }, label)),
        /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "Edge thickness = call freq" })
      ] }),
      /* @__PURE__ */ u4(
        "canvas",
        {
          ref: canvasRef,
          style: `width:100%;height:${height}px;display:block;border:1px solid var(--border);border-radius:4px;cursor:grab`
        }
      )
    ] });
  }

  // media/src/tabs/Tools.tsx
  function ToolsChart({ sessions }) {
    const counts = {};
    const toolAgents = {};
    sessions.forEach((sess) => {
      Object.entries(sess.toolCounts ?? {}).forEach(([tool, count]) => {
        counts[tool] = (counts[tool] ?? 0) + count;
        if (!toolAgents[tool]) toolAgents[tool] = {};
        toolAgents[tool][sess.source] = true;
      });
    });
    const entries = Object.entries(counts).sort((a4, b4) => b4[1] - a4[1]);
    if (entries.length === 0) {
      return /* @__PURE__ */ u4("div", { class: "empty-state", children: "No tool calls recorded for this session" });
    }
    const total = entries.reduce((sum, e4) => sum + e4[1], 0);
    const r5 = 70, cx = 85, cy = 85, sw = 26;
    const angleOffset = -Math.PI / 2;
    let currentAngle = angleOffset;
    function arcPath(startAngle, endAngle) {
      const x1 = cx + r5 * Math.cos(startAngle), y1 = cy + r5 * Math.sin(startAngle);
      const x22 = cx + r5 * Math.cos(endAngle), y22 = cy + r5 * Math.sin(endAngle);
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      return `M ${x1} ${y1} A ${r5} ${r5} 0 ${largeArc} 1 ${x22} ${y22}`;
    }
    const slices = entries.map((e4, i4) => {
      const pct = e4[1] / total;
      const sliceAngle = pct * 2 * Math.PI;
      const color = COLORS[i4 % COLORS.length];
      const startA = currentAngle;
      currentAngle += sliceAngle;
      return { name: e4[0], count: e4[1], pct, color, startA, endA: currentAngle };
    });
    return /* @__PURE__ */ u4("div", { children: [
      /* @__PURE__ */ u4("div", { class: "donut-container", children: [
        /* @__PURE__ */ u4("svg", { width: "170", height: "170", viewBox: "0 0 170 170", children: [
          slices.map(
            (sl) => sl.pct >= 1 ? /* @__PURE__ */ u4("circle", { cx, cy, r: r5, fill: "none", stroke: sl.color, "stroke-width": sw }, sl.name) : /* @__PURE__ */ u4("path", { d: arcPath(sl.startA, sl.endA), fill: "none", stroke: sl.color, "stroke-width": sw, "stroke-linecap": "butt" }, sl.name)
          ),
          /* @__PURE__ */ u4("text", { x: cx, y: cy, "text-anchor": "middle", dy: "4", "font-size": "16", "font-weight": "bold", fill: "var(--fg)", children: total }),
          /* @__PURE__ */ u4("text", { x: cx, y: cy + 14, "text-anchor": "middle", "font-size": "9", fill: "var(--muted)", opacity: "0.7", children: "total" })
        ] }),
        /* @__PURE__ */ u4("div", { class: "donut-legend", children: slices.map((sl) => /* @__PURE__ */ u4("div", { class: "donut-legend-item", children: [
          /* @__PURE__ */ u4("div", { class: "donut-legend-color", style: "background:" + sl.color }),
          /* @__PURE__ */ u4("span", { children: [
            sl.name,
            " (",
            sl.count,
            ", ",
            (sl.pct * 100).toFixed(1),
            "%)"
          ] })
        ] }, sl.name)) })
      ] }),
      /* @__PURE__ */ u4("table", { class: "tool-insights-table", style: "margin-top:16px", children: [
        /* @__PURE__ */ u4("thead", { children: /* @__PURE__ */ u4("tr", { children: [
          /* @__PURE__ */ u4("th", { children: "Tool" }),
          /* @__PURE__ */ u4("th", { children: "Calls" }),
          /* @__PURE__ */ u4("th", { children: "%" }),
          /* @__PURE__ */ u4("th", { children: "Agents" })
        ] }) }),
        /* @__PURE__ */ u4("tbody", { children: entries.map(([name, callCount]) => {
          const agents = toolAgents[name] ? Object.keys(toolAgents[name]) : [];
          return /* @__PURE__ */ u4("tr", { children: [
            /* @__PURE__ */ u4("td", { children: name }),
            /* @__PURE__ */ u4("td", { class: "right", children: callCount }),
            /* @__PURE__ */ u4("td", { class: "right", children: [
              (callCount / total * 100).toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ u4("td", { children: agents.map((a4) => /* @__PURE__ */ u4("span", { style: "display:inline-block;width:8px;height:8px;border-radius:50%;background:" + getAgentColor(a4) + ";vertical-align:middle;margin-right:4px", title: getAgentSourceLabel(a4) }, a4)) })
          ] }, name);
        }) }),
        /* @__PURE__ */ u4("tfoot", { children: /* @__PURE__ */ u4("tr", { children: [
          /* @__PURE__ */ u4("td", { children: /* @__PURE__ */ u4("strong", { children: "Total" }) }),
          /* @__PURE__ */ u4("td", { class: "right", children: /* @__PURE__ */ u4("strong", { children: total }) }),
          /* @__PURE__ */ u4("td", {}),
          /* @__PURE__ */ u4("td", {})
        ] }) })
      ] })
    ] });
  }

  // media/src/tabs/Sessions.tsx
  function PromptBlock({ text }) {
    const [expanded, setExpanded] = d2(false);
    const PREVIEW_CHARS = 300;
    const truncated = !expanded && text.length > PREVIEW_CHARS;
    const display = truncated ? text.slice(0, PREVIEW_CHARS).trimEnd() + "\u2026" : text;
    return /* @__PURE__ */ u4("div", { style: "margin-bottom:10px", children: [
      /* @__PURE__ */ u4("div", { style: "font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:4px", children: "Prompt" }),
      /* @__PURE__ */ u4("div", { style: "background:var(--card-bg);border:1px solid var(--border);border-radius:4px;padding:7px 10px;font-size:11px;white-space:pre-wrap;word-break:break-word;line-height:1.5;color:var(--foreground);max-height:200px;overflow-y:auto", children: display }),
      text.length > PREVIEW_CHARS && /* @__PURE__ */ u4(
        "button",
        {
          onClick: () => setExpanded((e4) => !e4),
          style: "margin-top:4px;font-size:10px;color:var(--vscode-textLink-foreground,#4fc3f7);background:none;border:none;cursor:pointer;padding:0",
          children: expanded ? "Show less" : "Show full prompt"
        }
      )
    ] });
  }
  function SessionDetail({ sess }) {
    const [section, setSection] = d2("overview");
    const timelines = sessionTimelines.value;
    const timeline = timelines[sess.sessionId] ?? sess.timeline ?? [];
    const cost = calcSessionCost(sess, "token");
    const cacheRate = sess.inputTokens > 0 ? Math.round(sess.cacheReadTokens / sess.inputTokens * 100) : 0;
    const burnRate = burnRateData.value;
    if (!timelines[sess.sessionId] && vscode) {
      vscode.postMessage({ type: "loadSessionDetail", sessionId: sess.sessionId });
    }
    const ignored = ignoredInsightKeys.value;
    const summary = buildDisplaySummary([sess]);
    const sessInsights = generateInsights(summary, [sess]).filter((i4) => !ignored.has(i4.title));
    const visibleEntries = timeline.filter((e4) => e4.type !== "background");
    const sessionStartMs = sess.startTime ? new Date(sess.startTime).getTime() : 0;
    let sessionDur = sess.durationMs || 1;
    const steps = visibleEntries.map((entry) => {
      const entryStart = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
      const offset = sessionStartMs > 0 && entryStart > 0 ? entryStart - sessionStartMs : 0;
      return { entry, offsetMs: Math.max(offset, 0), durationMs: entry.durationMs || 0 };
    });
    if (steps.length > 0) {
      const maxEnd = Math.max(...steps.map((s4) => s4.offsetMs + s4.durationMs));
      if (maxEnd > sessionDur) sessionDur = maxEnd;
    }
    if (sessionDur <= 0) sessionDur = 1;
    const navBtn = (s4, label) => /* @__PURE__ */ u4(
      "button",
      {
        onClick: (e4) => {
          e4.stopPropagation();
          setSection(s4);
        },
        style: [
          "padding:3px 10px;font-size:11px;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;",
          section === s4 ? "color:var(--fg);border-bottom-color:var(--accent);font-weight:600" : "color:var(--muted)"
        ].join(""),
        children: label
      }
    );
    return /* @__PURE__ */ u4("div", { style: "border-top:1px solid var(--border)", onClick: (e4) => e4.stopPropagation(), children: [
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:0;padding:0 8px;border-bottom:1px solid var(--border);background:var(--vscode-editorWidget-background,var(--bg));overflow-x:auto", children: [
        navBtn("overview", "Overview"),
        navBtn("trace", `Trace${visibleEntries.length > 0 ? " (" + visibleEntries.length + ")" : ""}`),
        navBtn("flow", `Flow${sess.totalLlmCalls > 0 ? " (" + sess.totalLlmCalls + ")" : ""}`),
        navBtn("tools", `Tools${sess.totalToolCalls > 0 ? " (" + sess.totalToolCalls + ")" : ""}`),
        navBtn("files", `Files${sess.filesChanged.length > 0 ? " (" + sess.filesChanged.length + ")" : ""}`)
      ] }),
      /* @__PURE__ */ u4("div", { style: "padding:12px 14px", children: [
        section === "overview" && /* @__PURE__ */ u4("div", { children: [
          sess.dataSource === "log" && (() => {
            const isCopilot = sess.source === "copilot";
            if (isCopilot && sess.outputTokens === 0 && sess.turns > 0) {
              return /* @__PURE__ */ u4("div", { style: "margin-bottom:10px;padding:7px 10px;border-radius:4px;border-left:3px solid var(--vscode-editorWarning-foreground,#cca700);background:var(--hover);font-size:11px;color:var(--muted);line-height:1.5", children: [
                /* @__PURE__ */ u4("span", { style: "color:var(--vscode-editorWarning-foreground,#cca700);font-weight:600", children: "Log-only session \u2014 no token data" }),
                " \u2014 ",
                "VS Code Copilot Chat did not record token counts in this era. Token counts and cost estimates are unavailable and cannot be recovered."
              ] });
            }
            const missingTokens = isCopilot && sess.inputTokens === 0;
            const parts = ["traces & TTFT"];
            if (missingTokens) parts.push("input tokens & cache stats");
            if (isCopilot) parts.push("tool details");
            return /* @__PURE__ */ u4("div", { style: "margin-bottom:10px;padding:7px 10px;border-radius:4px;border-left:3px solid var(--vscode-editorWarning-foreground,#cca700);background:var(--hover);font-size:11px;color:var(--muted);line-height:1.5", children: [
              /* @__PURE__ */ u4("span", { style: "color:var(--vscode-editorWarning-foreground,#cca700);font-weight:600", children: "Log-only session" }),
              " \u2014 ",
              parts.join(", "),
              " not available from local logs. Enable OTEL ingestion via the Help tab for full telemetry."
            ] });
          })(),
          sess.userRequest ? /* @__PURE__ */ u4(PromptBlock, { text: sess.userRequest }) : sess.turns === 0 ? /* @__PURE__ */ u4("div", { style: "margin-bottom:10px;font-size:11px;color:var(--muted);font-style:italic", children: "Waiting for first turn\u2026" }) : /* @__PURE__ */ u4("div", { style: "margin-bottom:10px;font-size:11px;color:var(--muted)", children: "Prompt not captured for this session" }),
          /* @__PURE__ */ u4("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:6px;margin-bottom:10px", children: [
            { k: "LLM calls", v: String(sess.totalLlmCalls) },
            { k: "Tool calls", v: String(sess.totalToolCalls) },
            { k: "Input tokens", v: formatCompact(sess.inputTokens) },
            { k: "Output tokens", v: formatCompact(sess.outputTokens) },
            { k: "Cache hit", v: cacheRate + "%" },
            { k: "Duration", v: formatMs(sess.durationMs) },
            ...sess.errors > 0 ? [{ k: "Errors", v: String(sess.errors) }] : [],
            ...!cost.modelUnknown && cost.totalUsd > 0 ? [{ k: "Est. cost", v: fmtUsd2(cost.totalUsd) }] : []
          ].map(({ k: k3, v: v4 }) => /* @__PURE__ */ u4("div", { style: "background:var(--card-bg);border:1px solid var(--border);border-radius:4px;padding:5px 8px", children: [
            /* @__PURE__ */ u4("div", { style: "font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px", children: k3 }),
            /* @__PURE__ */ u4("div", { style: "font-size:14px;font-weight:600;color:var(--vscode-textLink-foreground,#4fc3f7)", children: v4 })
          ] }, k3)) }),
          burnRate && burnRate.sessionId === sess.sessionId && /* @__PURE__ */ u4("div", { style: "margin-bottom:10px;padding:6px 10px;border-radius:4px;border-left:3px solid #56D364;background:var(--hover);font-size:11px", children: [
            /* @__PURE__ */ u4("span", { style: "color:#56D364;font-weight:600", children: [
              formatCompact(Math.round(burnRate.burnRate.tokensPerMinute)),
              " tok/min"
            ] }),
            burnRate.burnRate.costPerHour > 1e-3 && /* @__PURE__ */ u4("span", { style: "color:var(--muted);margin-left:8px", children: [
              "~",
              fmtUsd2(burnRate.burnRate.costPerHour),
              "/hr"
            ] }),
            burnRate.projection && /* @__PURE__ */ u4("span", { style: "color:var(--muted);margin-left:8px", children: [
              burnRate.projection.contextFillPct.toFixed(0),
              "% context used"
            ] })
          ] }),
          sessInsights.length > 0 && /* @__PURE__ */ u4("div", { children: [
            /* @__PURE__ */ u4("div", { style: "font-size:10px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:6px", children: "Insights" }),
            sessInsights.slice(0, 4).map((ins) => /* @__PURE__ */ u4(InsightCard, { ins, isIgnored: false, sessions: [sess] }, ins.title))
          ] })
        ] }),
        section === "trace" && /* @__PURE__ */ u4("div", { children: steps.length === 0 ? timelines[sess.sessionId] !== void 0 ? /* @__PURE__ */ u4("div", { class: "empty-state", style: "padding:12px 0", children: "No trace data for this session" }) : /* @__PURE__ */ u4("div", { class: "empty-state", style: "padding:12px 0", children: "Loading\u2026" }) : /* @__PURE__ */ u4("div", { class: "waterfall", children: [
          /* @__PURE__ */ u4("div", { class: "wf-time-ruler", children: Array.from({ length: 6 }, (_4, t4) => /* @__PURE__ */ u4("span", { children: formatMs(sessionDur * t4 / 5) }, t4)) }),
          steps.map((step, si) => /* @__PURE__ */ u4(
            StepRow,
            {
              step,
              idx: si,
              sessIdx: 0,
              sessionDur,
              sessionModel: sess.model ?? ""
            },
            step.entry.spanId + si
          ))
        ] }) }),
        section === "flow" && /* @__PURE__ */ u4(FlowCanvas, { sess, height: 420 }),
        section === "tools" && /* @__PURE__ */ u4(ToolsChart, { sessions: [sess] }),
        section === "files" && /* @__PURE__ */ u4("div", { children: sess.filesChanged.length === 0 ? /* @__PURE__ */ u4("div", { class: "empty-state", style: "padding:12px 0", children: "No files modified" }) : /* @__PURE__ */ u4("div", { style: "display:flex;flex-direction:column;gap:3px", children: [
          sess.filesChanged.map((f5) => /* @__PURE__ */ u4(
            "div",
            {
              style: `display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--hover);border-radius:4px;font-size:11px${vscode ? ";cursor:pointer" : ""}`,
              onClick: () => vscode?.postMessage({ type: "openFile", filePath: f5 }),
              title: vscode ? "Click to open in editor" : f5,
              children: [
                /* @__PURE__ */ u4("span", { style: "color:var(--vscode-charts-green,#81c784);font-size:10px;flex-shrink:0", children: "M" }),
                /* @__PURE__ */ u4("span", { style: `font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap${vscode ? ";color:var(--vscode-textLink-foreground,#4fc3f7)" : ""}`, children: f5 })
              ]
            },
            f5
          )),
          sess.filesChangedNote && /* @__PURE__ */ u4("div", { style: "font-size:10px;color:var(--muted);margin-top:3px", children: sess.filesChangedNote })
        ] }) })
      ] })
    ] });
  }
  function SessionRow({ sess }) {
    const [expanded, setExpanded] = d2(false);
    const isFocused = focusedSessionId.value === sess.sessionId;
    const cost = calcSessionCost(sess, "token");
    const color = getAgentColor(sess.source);
    const prompt = sess.userRequest ?? "";
    function toggle() {
      const next = !expanded;
      setExpanded(next);
      focusedSessionId.value = next ? sess.sessionId : null;
    }
    const rowBg = isFocused ? "var(--hover)" : "transparent";
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4(
        "tr",
        {
          onClick: toggle,
          style: `cursor:pointer;background:${rowBg};border-bottom:1px solid var(--vscode-panel-border)`,
          children: [
            /* @__PURE__ */ u4("td", { style: "padding:4px 4px 4px 8px;width:16px;color:var(--muted);font-size:9px;white-space:nowrap", children: expanded ? "\u25BC" : "\u25B6" }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 4px;width:auto;white-space:nowrap", children: [
              /* @__PURE__ */ u4("span", { style: `display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;vertical-align:middle` }),
              /* @__PURE__ */ u4("span", { style: "margin-left:4px", dangerouslySetInnerHTML: { __html: getDataSourceBadgeHtml(sess.dataSource ?? "otel") } }),
              /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: getInitiatorBadgeHtml(sess.initiator) } })
            ] }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 6px;white-space:nowrap;font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums", children: formatSessionTime(sess) }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 6px;max-width:0;width:100%", children: prompt ? /* @__PURE__ */ u4("span", { style: "display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-style:italic;color:var(--foreground)", title: prompt, children: prompt }) : sess.turns === 0 ? /* @__PURE__ */ u4("span", { style: "color:var(--muted);font-size:11px", children: "\u2026" }) : /* @__PURE__ */ u4("span", { style: "color:var(--muted);font-size:11px", children: "\u2014" }) }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 6px;white-space:nowrap;font-size:10px;color:var(--muted);max-width:130px;overflow:hidden;text-overflow:ellipsis", children: sess.model || "\u2014" }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 6px;text-align:right;white-space:nowrap;font-size:10px;color:var(--muted)", children: formatCompact(sess.inputTokens + sess.outputTokens) }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 6px;text-align:right;white-space:nowrap;font-size:10px;color:var(--muted)", children: formatMs(sess.durationMs) }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px 4px 6px;text-align:right;white-space:nowrap;font-size:10px", children: !cost.modelUnknown && cost.totalUsd > 0 ? /* @__PURE__ */ u4("span", { style: "color:var(--vscode-charts-green,#81c784)", children: fmtUsd2(cost.totalUsd) }) : sess.errors > 0 ? /* @__PURE__ */ u4("span", { style: "color:var(--error)", children: [
              sess.errors,
              " err"
            ] }) : /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "\u2014" }) })
          ]
        }
      ),
      expanded && /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--vscode-panel-border)", children: /* @__PURE__ */ u4("td", { colspan: 8, style: "padding:0", children: /* @__PURE__ */ u4(SessionDetail, { sess }) }) })
    ] });
  }
  function Sessions() {
    const sessions = filteredSessions.value;
    const hasAny = (sessionSummary.value?.sessions?.length ?? 0) > 0;
    if (sessions.length === 0) {
      return /* @__PURE__ */ u4("div", { id: "sessions-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: hasAny ? "No sessions match the active filters." : "No sessions recorded yet." }) });
    }
    const sortKey = sessionSortKey.value;
    const sortDir = sessionSortDir.value;
    function sortArrow(key) {
      if (sortKey !== key) return /* @__PURE__ */ u4("span", { style: "opacity:0.3;margin-left:3px", children: "\u2195" });
      return /* @__PURE__ */ u4("span", { style: "margin-left:3px;color:var(--accent)", children: sortDir === "desc" ? "\u25BC" : "\u25B2" });
    }
    function onSortClick(key) {
      if (sessionSortKey.value === key) {
        sessionSortDir.value = sessionSortDir.value === "desc" ? "asc" : "desc";
      } else {
        sessionSortKey.value = key;
        sessionSortDir.value = "desc";
      }
    }
    const thBase = "padding:3px 6px;font-size:10px;font-weight:600;white-space:nowrap;user-select:none";
    const thSort = thBase + ";cursor:pointer;color:var(--fg)";
    const thMuted = thBase + ";color:var(--muted);font-weight:500";
    return /* @__PURE__ */ u4("div", { id: "sessions-content", children: [
      /* @__PURE__ */ u4("div", { style: "overflow-x:auto", children: /* @__PURE__ */ u4("table", { style: "width:100%;border-collapse:collapse;font-size:11px", children: [
        /* @__PURE__ */ u4("thead", { children: /* @__PURE__ */ u4("tr", { style: "border-bottom:2px solid var(--vscode-panel-border)", children: [
          /* @__PURE__ */ u4("th", { style: "width:16px;padding:3px 4px 3px 8px" }),
          /* @__PURE__ */ u4("th", { style: "width:10px;padding:3px 4px;" + thSort, onClick: () => onSortClick("source"), title: "Sort by agent", children: sortArrow("source") }),
          /* @__PURE__ */ u4("th", { style: "text-align:left;" + thSort, onClick: () => onSortClick("start_time"), children: [
            "Time",
            sortArrow("start_time")
          ] }),
          /* @__PURE__ */ u4("th", { style: "text-align:left;" + thSort, onClick: () => onSortClick("prompt"), children: [
            "Prompt",
            sortArrow("prompt")
          ] }),
          /* @__PURE__ */ u4("th", { style: "text-align:left;" + thSort, onClick: () => onSortClick("model"), children: [
            "Model",
            sortArrow("model")
          ] }),
          /* @__PURE__ */ u4("th", { style: "text-align:right;" + thSort, onClick: () => onSortClick("total_tokens"), children: [
            "Tokens",
            sortArrow("total_tokens")
          ] }),
          /* @__PURE__ */ u4("th", { style: "text-align:right;" + thSort, onClick: () => onSortClick("duration_ms"), children: [
            "Duration",
            sortArrow("duration_ms")
          ] }),
          /* @__PURE__ */ u4("th", { style: "text-align:right;padding:3px 8px 3px 6px;" + thSort, onClick: () => onSortClick("cost"), children: [
            "Cost",
            sortArrow("cost")
          ] })
        ] }) }),
        /* @__PURE__ */ u4("tbody", { children: sessions.map((sess) => /* @__PURE__ */ u4(SessionRow, { sess }, sess.sessionId)) })
      ] }) }),
      /* @__PURE__ */ u4("div", { style: "padding:6px 8px;font-size:11px;color:var(--muted);border-top:1px solid var(--vscode-panel-border)", children: /* @__PURE__ */ u4("span", { children: [
        sessionSummary.value?.sessions?.length ?? 0,
        " sessions stored \u2014 managed by retention policy"
      ] }) })
    ] });
  }

  // media/src/tabs/SessionCharts.tsx
  function TurnsLink() {
    return /* @__PURE__ */ u4(
      "span",
      {
        onClick: () => goToHelp("gl-turn"),
        style: "cursor:pointer;border-bottom:1px dotted currentColor",
        title: "View 'Turn' definition in glossary",
        children: "Turns"
      }
    );
  }
  var growthStateRef = { current: null };
  function formatGrowthLabel(sess) {
    if (!sess?.startTime) return "\u2014";
    const d5 = new Date(sess.startTime);
    if (isNaN(d5.getTime())) return "\u2014";
    const p5 = (n3) => String(n3).padStart(2, "0");
    return `${p5(d5.getMonth() + 1)}-${p5(d5.getDate())} ${p5(d5.getHours())}:${p5(d5.getMinutes())}`;
  }
  var BASE_MS = 900;
  function ContextGrowthChart({ sessions, timelines }) {
    const canvasRef = A2(null);
    const focusedId = focusedSessionId.value;
    const focusedIdRef = A2(null);
    focusedIdRef.current = focusedId;
    const [paused, setPaused] = d2(false);
    const [hasData, setHasData] = d2(false);
    const [speed, setSpeed] = d2(1);
    const pausedRef = A2(false);
    const speedRef = A2(1);
    const activeIdxRef = A2(0);
    const seriesCountRef = A2(0);
    const timerRef = A2(null);
    const drawFnRef = A2(null);
    function clearTimer() {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    function startTimer() {
      clearTimer();
      if (pausedRef.current || !drawFnRef.current || seriesCountRef.current === 0) return;
      timerRef.current = setInterval(() => {
        const next = (activeIdxRef.current + 1) % seriesCountRef.current;
        activeIdxRef.current = next;
        drawFnRef.current(next);
      }, Math.round(BASE_MS / speedRef.current));
    }
    function changeSpeed(s4) {
      speedRef.current = s4;
      setSpeed(s4);
      if (!pausedRef.current) startTimer();
    }
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const seriesData = [];
      sessions.forEach((sess) => {
        const llmEntries = (timelines[sess.sessionId] ?? sess.timeline ?? []).filter((e4) => e4.type === "llm" && (e4.inputTokens ?? 0) > 0);
        if (llmEntries.length < 1) return;
        seriesData.push({
          sessionId: sess.sessionId,
          label: formatGrowthLabel(sess),
          color: getAgentColor(sess.source) || COLORS[seriesData.length % COLORS.length],
          points: llmEntries.map((e4, i4) => ({ turn: i4 + 1, tokens: e4.inputTokens ?? 0 }))
        });
      });
      if (seriesData.length === 0) {
        canvas.style.display = "none";
        growthStateRef.current = null;
        drawFnRef.current = null;
        clearTimer();
        setHasData(false);
        return;
      }
      canvas.style.display = "block";
      setHasData(true);
      seriesCountRef.current = seriesData.length;
      const maxTurns = Math.max(...seriesData.map((s4) => s4.points.length), 2);
      const allTokens = seriesData.flatMap((s4) => s4.points.map((p5) => p5.tokens));
      const rawMin = Math.min(...allTokens), rawMax = Math.max(...allTokens);
      const spread = rawMax - rawMin || rawMax * 0.1 || 1;
      const yMin = Math.max(0, rawMin - spread * 0.1);
      const yMax = rawMax + spread * 0.1;
      const cs = getComputedStyle(document.body);
      const gridColor = cs.getPropertyValue("--vscode-panel-border").trim() || "#333";
      const textColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
      const fontStr = "9px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
      const smallFont = "8px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
      function draw(activeIdx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const w5 = rect.width, h5 = rect.height;
        ctx.clearRect(0, 0, w5, h5);
        const pad = { top: 8, right: 80, bottom: 22, left: 56 };
        const chartW = w5 - pad.left - pad.right, chartH = h5 - pad.top - pad.bottom;
        const xPos = (turn) => pad.left + (turn - 1) / Math.max(maxTurns - 1, 1) * chartW;
        const yPos = (tok) => pad.top + chartH - (tok - yMin) / (yMax - yMin) * chartH;
        const fId = focusedIdRef.current;
        growthStateRef.current = { series: seriesData, xPos, yPos, chartH, pad };
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        for (let i4 = 0; i4 <= 4; i4++) {
          const y5 = pad.top + chartH * i4 / 4;
          ctx.beginPath();
          ctx.moveTo(pad.left, y5);
          ctx.lineTo(pad.left + chartW, y5);
          ctx.stroke();
        }
        ctx.fillStyle = textColor;
        ctx.font = fontStr;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (let i4 = 0; i4 <= 4; i4++) {
          const val = yMax - (yMax - yMin) * i4 / 4;
          if (val > 0) ctx.fillText(formatCompact(val), pad.left - 4, pad.top + chartH * i4 / 4);
        }
        const minLabelPx = 32;
        const maxLabels = Math.max(2, Math.floor(chartW / minLabelPx));
        let xStep;
        if (maxTurns <= maxLabels) {
          xStep = 1;
        } else {
          const raw = maxTurns / maxLabels;
          if (raw <= 2) xStep = 2;
          else if (raw <= 5) xStep = 5;
          else if (raw <= 10) xStep = 10;
          else if (raw <= 20) xStep = 20;
          else if (raw <= 25) xStep = 25;
          else if (raw <= 50) xStep = 50;
          else xStep = Math.ceil(raw / 50) * 50;
        }
        ctx.fillStyle = textColor;
        ctx.font = fontStr;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (let t4 = 1; t4 <= maxTurns; t4 += xStep) {
          const x4 = xPos(t4);
          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x4, pad.top);
          ctx.lineTo(x4, pad.top + chartH);
          ctx.stroke();
          ctx.fillText("T" + t4, x4, pad.top + chartH + 4);
        }
        if (maxTurns > 1 && (maxTurns - 1) % xStep !== 0) {
          const lastRegularX = xPos(Math.floor((maxTurns - 1) / xStep) * xStep + 1);
          const lastX = xPos(maxTurns);
          if (lastX - lastRegularX >= minLabelPx) {
            ctx.fillText("T" + maxTurns, lastX, pad.top + chartH + 4);
          }
        }
        const highlighted = fId && pausedRef.current ? seriesData.findIndex((s4) => s4.sessionId === fId) : activeIdx;
        const order = [...seriesData.keys()].sort((a4, b4) => (a4 === highlighted ? 1 : 0) - (b4 === highlighted ? 1 : 0));
        order.forEach((i4) => {
          const series = seriesData[i4];
          const isHighlighted = i4 === highlighted;
          ctx.strokeStyle = isHighlighted ? series.color : series.color + "28";
          ctx.lineWidth = isHighlighted ? 2.5 : 1;
          ctx.beginPath();
          series.points.forEach(({ turn, tokens }, j4) => {
            const x4 = xPos(turn), y5 = yPos(tokens);
            j4 === 0 ? ctx.moveTo(x4, y5) : ctx.lineTo(x4, y5);
          });
          ctx.stroke();
          if (isHighlighted) {
            ctx.fillStyle = series.color;
            ctx.font = smallFont;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(series.label, pad.left + chartW + 4, pad.top);
          }
        });
      }
      drawFnRef.current = draw;
      clearTimer();
      const prevIds = growthStateRef.current?.series.map((s4) => s4.sessionId).join(",") ?? "";
      const newIds = seriesData.map((s4) => s4.sessionId).join(",");
      if (prevIds !== newIds) {
        activeIdxRef.current = 0;
        pausedRef.current = false;
        setPaused(false);
      }
      draw(activeIdxRef.current);
      startTimer();
      return () => clearTimer();
    }, [sessions, timelines]);
    y2(() => {
      drawFnRef.current?.(activeIdxRef.current);
    }, [focusedId]);
    function togglePause() {
      const next = !pausedRef.current;
      pausedRef.current = next;
      setPaused(next);
      if (!next) startTimer();
      else clearTimer();
    }
    function stepPrev() {
      clearTimer();
      pausedRef.current = true;
      setPaused(true);
      activeIdxRef.current = Math.max(0, activeIdxRef.current - 1);
      drawFnRef.current?.(activeIdxRef.current);
    }
    function stepNext() {
      clearTimer();
      pausedRef.current = true;
      setPaused(true);
      activeIdxRef.current = Math.min(seriesCountRef.current - 1, activeIdxRef.current + 1);
      drawFnRef.current?.(activeIdxRef.current);
    }
    function handleCanvasClick(e4) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const state = growthStateRef.current;
      if (!state || !state.series.length) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e4.clientX - rect.left, my = e4.clientY - rect.top;
      let bestDist = 20, bestId = "";
      state.series.forEach((s4) => {
        s4.points.forEach(({ turn, tokens }) => {
          const dx = mx - state.xPos(turn), dy = my - state.yPos(tokens);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = s4.sessionId;
          }
        });
      });
      if (bestId) focusedSessionId.value = focusedSessionId.peek() === bestId ? null : bestId;
    }
    const btnStyle = "padding:2px 8px;font-size:11px;cursor:pointer;background:transparent;border:1px solid var(--border);border-radius:3px;color:var(--muted);line-height:1.4";
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4(
        "canvas",
        {
          ref: canvasRef,
          id: "context-growth-chart",
          style: "width:100%;height:200px;display:block;cursor:pointer",
          onClick: handleCanvasClick,
          title: "Click a line to select that session"
        }
      ),
      hasData && /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;justify-content:space-between;margin-top:5px", children: [
        /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:6px", children: [
          /* @__PURE__ */ u4("button", { style: btnStyle, onClick: togglePause, title: paused ? "Play" : "Pause", children: paused ? "\u25B6" : "\u23F8" }),
          [0.5, 1, 2].map((s4) => /* @__PURE__ */ u4(
            "button",
            {
              style: btnStyle + (speed === s4 ? ";border-color:var(--accent);color:var(--accent)" : ""),
              onClick: () => changeSpeed(s4),
              title: `${s4}\xD7 speed`,
              children: s4 === 0.5 ? "\xBD\xD7" : `${s4}\xD7`
            },
            s4
          ))
        ] }),
        /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:6px", children: [
          /* @__PURE__ */ u4("button", { style: btnStyle, onClick: stepPrev, title: "Previous session", children: "\u25C0" }),
          /* @__PURE__ */ u4("button", { style: btnStyle, onClick: stepNext, title: "Next session", children: "\u25B6" })
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { style: "text-align:center;font-size:9px;color:var(--muted);margin-top:4px", children: /* @__PURE__ */ u4(TurnsLink, {}) })
    ] });
  }
  function SessionTokenChart({ sessions }) {
    const canvasRef = A2(null);
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const sessionData = [...sessions].reverse().map((sess) => {
        const input = sess.inputTokens ?? 0, output = sess.outputTokens ?? 0;
        return input + output > 0 ? { startTime: sess.startTime, input, output, source: sess.source } : null;
      }).filter(Boolean);
      if (sessionData.length === 0) {
        canvas.style.display = "none";
        return;
      }
      canvas.style.display = "block";
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      const w5 = rect.width, h5 = rect.height;
      ctx.clearRect(0, 0, w5, h5);
      const pad = { top: 8, right: 44, bottom: 14, left: 44 };
      const chartW = w5 - pad.left - pad.right, chartH = h5 - pad.top - pad.bottom;
      const maxIn = Math.max(...sessionData.map((s4) => s4.input)) || 1;
      const maxOut = Math.max(...sessionData.map((s4) => s4.output)) || 1;
      const cs = getComputedStyle(document.body);
      const gridColor = cs.getPropertyValue("--vscode-panel-border").trim() || "#333";
      const fontStr = "9px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      for (let i4 = 0; i4 <= 4; i4++) {
        const y5 = pad.top + chartH * i4 / 4;
        ctx.beginPath();
        ctx.moveTo(pad.left, y5);
        ctx.lineTo(pad.left + chartW, y5);
        ctx.stroke();
      }
      ctx.fillStyle = "#FFB74D";
      ctx.font = fontStr;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i4 = 0; i4 <= 4; i4++) {
        const val = maxIn * (4 - i4) / 4;
        if (val > 0) ctx.fillText(formatCompact(val), pad.left - 4, pad.top + chartH * i4 / 4);
      }
      ctx.fillStyle = "#81C784";
      ctx.textAlign = "left";
      for (let i4 = 0; i4 <= 4; i4++) {
        const val = maxOut * (4 - i4) / 4;
        if (val > 0) ctx.fillText(formatCompact(val), pad.left + chartW + 4, pad.top + chartH * i4 / 4);
      }
      const sl = sessionData.length;
      const slotW = chartW / Math.max(sl, 1);
      const barPad = sl > 100 ? 0 : sl > 50 ? 0.2 : sl > 20 ? 0.5 : 1;
      const halfSlot = slotW / 2;
      const halfBar = Math.max(0.5, halfSlot - barPad);
      const dayKey = (t4) => t4 ? new Date(t4).toISOString().slice(0, 10) : "none";
      const textColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
      let lastDayLabelX = -Infinity;
      const MIN_DAY_LABEL_GAP = 30;
      sessionData.forEach((s4, i4) => {
        const slotX = pad.left + i4 * slotW;
        const inH = s4.input / maxIn * chartH;
        ctx.fillStyle = "#FFB74D";
        ctx.fillRect(slotX + barPad, pad.top + chartH - inH, halfBar, inH);
        const outH = s4.output / maxOut * chartH;
        ctx.fillStyle = "#81C784";
        ctx.fillRect(slotX + halfSlot, pad.top + chartH - outH, halfBar, outH);
        ctx.beginPath();
        ctx.arc(slotX + slotW / 2, pad.top + chartH + 7, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = getAgentColor(s4.source);
        ctx.fill();
        if (i4 > 0 && dayKey(s4.startTime) !== dayKey(sessionData[i4 - 1].startTime)) {
          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(slotX, pad.top);
          ctx.lineTo(slotX, pad.top + chartH);
          ctx.stroke();
          const label = s4.startTime ? new Date(s4.startTime).toISOString().slice(5, 10) : "";
          if (label && slotX - lastDayLabelX >= MIN_DAY_LABEL_GAP) {
            ctx.fillStyle = textColor;
            ctx.font = "8px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(label, slotX + 2, pad.top + 1);
            lastDayLabelX = slotX;
          }
        }
      });
    });
    const presentSources = new Set(sessions.map((s4) => s4.source).filter(Boolean));
    const agentSources = ["copilot", "claude_code", "codex"].filter((src) => presentSources.has(src));
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("canvas", { ref: canvasRef, style: "width:100%;height:160px;display:block" }),
      agentSources.length > 0 && /* @__PURE__ */ u4("div", { style: "display:flex;gap:10px;justify-content:center;margin-top:4px;flex-wrap:wrap", children: agentSources.map((src) => /* @__PURE__ */ u4("span", { style: "display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted)", children: [
        /* @__PURE__ */ u4("span", { style: `display:inline-block;width:7px;height:7px;border-radius:50%;background:${getAgentColor(src)}` }),
        getAgentSourceLabel(src)
      ] }, src)) })
    ] });
  }

  // media/src/tabs/Agents.tsx
  function computeStats(sessions) {
    let totalInput = 0, totalOutput = 0, totalCache = 0;
    let totalLlm = 0, totalTools = 0, ttftSum = 0, ttftCount = 0, durSum = 0;
    const toolCounts = {};
    sessions.forEach((s4) => {
      totalInput += s4.inputTokens ?? 0;
      totalOutput += s4.outputTokens ?? 0;
      totalCache += (s4.cacheReadTokens ?? 0) + (s4.cacheCreateTokens ?? 0);
      totalLlm += s4.totalLlmCalls ?? 0;
      totalTools += s4.totalToolCalls ?? 0;
      durSum += s4.durationMs ?? 0;
      Object.keys(s4.toolCounts ?? {}).forEach((t4) => {
        toolCounts[t4] = (toolCounts[t4] ?? 0) + s4.toolCounts[t4];
      });
      (s4.timeline ?? []).forEach((e4) => {
        if (e4.type === "llm" && e4.ttft) {
          ttftSum += e4.ttft;
          ttftCount++;
        }
      });
    });
    return {
      sessions: sessions.length,
      totalInput,
      totalOutput,
      totalCache,
      totalLlm,
      totalTools,
      avgTtft: ttftCount > 0 ? Math.round(ttftSum / ttftCount) : 0,
      avgDuration: sessions.length > 0 ? Math.round(durSum / sessions.length) : 0,
      cacheHitRate: totalInput > 0 ? totalCache / totalInput : 0,
      toolCounts
    };
  }

  // media/src/tabs/Analytics.tsx
  function SectionHead({ title, tip }) {
    return /* @__PURE__ */ u4(
      "h3",
      {
        class: tip ? "has-metric-tip" : void 0,
        style: "margin:16px 0 6px;font-size:12px;color:var(--muted)",
        "data-tip": tip,
        children: title
      }
    );
  }
  function AgentCard({ source, sessions }) {
    const s4 = computeStats(sessions);
    if (s4.sessions === 0) return null;
    const color = getAgentColor(source);
    const label = getAgentSourceLabel(source);
    const topTools = Object.entries(s4.toolCounts).sort((a4, b4) => b4[1] - a4[1]).slice(0, 4);
    return /* @__PURE__ */ u4("div", { style: `background:var(--card-bg);border:1px solid var(--border);border-left:3px solid ${color};border-radius:6px;padding:12px 14px;flex:1;min-width:180px`, children: [
      /* @__PURE__ */ u4("div", { style: `display:flex;align-items:center;gap:6px;margin-bottom:10px`, children: [
        /* @__PURE__ */ u4("span", { style: `display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}` }),
        /* @__PURE__ */ u4("span", { style: "font-weight:600;font-size:13px", children: label }),
        /* @__PURE__ */ u4("span", { style: "font-size:11px;color:var(--muted);margin-left:auto", children: [
          s4.sessions,
          " session",
          s4.sessions !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px", children: [
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "LLM calls" }),
          " ",
          /* @__PURE__ */ u4("strong", { children: s4.totalLlm })
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "Tool calls" }),
          " ",
          /* @__PURE__ */ u4("strong", { children: s4.totalTools })
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "Input tokens" }),
          " ",
          /* @__PURE__ */ u4("strong", { children: formatCompact(s4.totalInput) })
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "Output tokens" }),
          " ",
          /* @__PURE__ */ u4("strong", { children: formatCompact(s4.totalOutput) })
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "Cache hit" }),
          " ",
          /* @__PURE__ */ u4("strong", { children: [
            (s4.cacheHitRate * 100).toFixed(0),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "Avg dur" }),
          " ",
          /* @__PURE__ */ u4("strong", { children: formatMs(s4.avgDuration) })
        ] }),
        s4.avgTtft > 0 && /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("span", { style: "color:var(--muted)", children: "Avg TTFT" }),
          " ",
          /* @__PURE__ */ u4("strong", { children: formatMs(s4.avgTtft) })
        ] })
      ] }),
      topTools.length > 0 && /* @__PURE__ */ u4("div", { style: "margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-size:10px;color:var(--muted)", children: [
        /* @__PURE__ */ u4("div", { style: "margin-bottom:3px;text-transform:uppercase;letter-spacing:.3px", children: "Top tools" }),
        topTools.map(([t4, n3]) => /* @__PURE__ */ u4("div", { style: "display:flex;justify-content:space-between;margin-bottom:1px", children: [
          /* @__PURE__ */ u4("span", { style: "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px", children: t4 }),
          /* @__PURE__ */ u4("span", { style: "color:var(--fg);margin-left:6px;flex-shrink:0", children: [
            n3,
            "\xD7"
          ] })
        ] }, t4))
      ] })
    ] });
  }
  function Analytics() {
    const [mode, setMode] = d2("token");
    const [abbrevTokens, setAbbrevTokens] = d2(true);
    const sessions = filteredSessions.value;
    const allFiltered = agentFilteredSessions.value;
    const timelines = sessionTimelines.value;
    const hasAny = (sessionSummary.value?.sessions?.length ?? 0) > 0;
    if (sessions.length === 0) {
      return /* @__PURE__ */ u4("div", { id: "analytics-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: hasAny ? "No sessions match the active filters." : "No sessions recorded yet." }) });
    }
    const pricedSess = sessions.filter((s4) => s4.source === "copilot" || s4.source === "codex" || s4.source === "claude_code");
    const copilotSess = sessions.filter((s4) => s4.source === "copilot");
    const claudeSess = sessions.filter((s4) => s4.source === "claude_code");
    const codexSess = sessions.filter((s4) => s4.source === "codex");
    const timeOrdered = rangedSessions.value;
    const pricedChartSess = timeOrdered.filter((s4) => s4.source === "copilot" || s4.source === "codex" || s4.source === "claude_code");
    const chartSessions = timeOrdered.slice().reverse();
    chartSessions.slice(0, CHART_MAX).forEach((sess) => {
      if (!sessionTimelines.value[sess.sessionId] && vscode) {
        vscode.postMessage({ type: "loadSessionDetail", sessionId: sess.sessionId });
      }
    });
    const disclaimer = /* @__PURE__ */ u4("div", { style: "font-size:11px;background:var(--hover);border:1px solid var(--border);border-radius:4px;padding:6px 10px;margin-bottom:8px;color:var(--muted)", children: [
      "Estimates only \u2014 not your actual bill. Rates last updated: ",
      PRICING_LAST_UPDATED
    ] });
    const dayMap = /* @__PURE__ */ new Map();
    pricedSess.forEach((sess) => {
      const day = sess.startTime ? new Date(sess.startTime).toISOString().slice(0, 10) : "unknown";
      const effMode = sess.source === "codex" || sess.source === "claude_code" ? "token" : mode;
      const cost = calcSessionCost(sess, effMode).totalUsd;
      if (!dayMap.has(day)) dayMap.set(day, { input: 0, output: 0, cacheCreate: 0, cacheRead: 0, cost: 0, agents: /* @__PURE__ */ new Map() });
      const de = dayMap.get(day);
      de.input += sess.inputTokens;
      de.output += sess.outputTokens;
      de.cacheCreate += sess.cacheCreateTokens ?? 0;
      de.cacheRead += sess.cacheReadTokens;
      de.cost += cost;
      if (!de.agents.has(sess.source)) de.agents.set(sess.source, { source: sess.source, input: 0, output: 0, cacheCreate: 0, cacheRead: 0, cost: 0, models: /* @__PURE__ */ new Set() });
      const ae = de.agents.get(sess.source);
      ae.input += sess.inputTokens;
      ae.output += sess.outputTokens;
      ae.cacheCreate += sess.cacheCreateTokens ?? 0;
      ae.cacheRead += sess.cacheReadTokens;
      ae.cost += cost;
      if (sess.model) ae.models.add(sess.model);
    });
    const dayRows = [...dayMap.entries()].sort((a4, b4) => a4[0].localeCompare(b4[0]));
    const grand = dayRows.reduce((g4, [, d5]) => ({
      input: g4.input + d5.input,
      output: g4.output + d5.output,
      cacheCreate: g4.cacheCreate + d5.cacheCreate,
      cacheRead: g4.cacheRead + d5.cacheRead,
      cost: g4.cost + d5.cost
    }), { input: 0, output: 0, cacheCreate: 0, cacheRead: 0, cost: 0 });
    const fmtModel = (m4) => {
      const s4 = m4.trim().toLowerCase();
      const cl = s4.match(/^claude-(opus|sonnet|haiku)-(\d+)(?:-(\d+))?(-fast)?$/);
      if (cl) {
        const tier = cl[1][0].toUpperCase() + cl[1].slice(1);
        const ver = cl[3] ? `${cl[2]}.${cl[3]}` : cl[2];
        return tier + " " + ver + (cl[4] ? " fast" : "");
      }
      const codex = s4.match(/^gpt-([\d.]+)-codex(-mini|-max|-nano)?$/);
      if (codex) return "Codex " + codex[1] + (codex[2] || "");
      if (s4 === "codex-mini-latest") return "Codex mini";
      if (s4.startsWith("gpt-")) return "GPT-" + m4.trim().slice(4);
      const gem = s4.match(/^gemini-([\d.]+)-(pro|flash|ultra)/);
      if (gem) return "Gemini " + gem[1] + " " + gem[2];
      return m4;
    };
    const fmtN = (n3) => {
      if (!abbrevTokens) return n3.toLocaleString();
      if (n3 >= 1e6) return (n3 / 1e6).toFixed(n3 >= 1e7 ? 1 : 2).replace(/\.0+$/, "") + "M";
      if (n3 >= 1e3) return (n3 / 1e3).toFixed(n3 >= 1e4 ? 0 : 1).replace(/\.0+$/, "") + "K";
      return String(n3);
    };
    return /* @__PURE__ */ u4("div", { id: "analytics-content", children: [
      pricedSess.length > 0 && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4(SectionHead, { title: "ESTIMATED COST" }),
        disclaimer,
        copilotSess.length > 0 && /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-bottom:8px", children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:6px;height:6px;border-radius:50%;background:" + getAgentColor("copilot") }),
          /* @__PURE__ */ u4("span", { style: "text-transform:uppercase;letter-spacing:.3px;font-size:10px", children: "Copilot" }),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "tab-mini" + (mode === "token" ? " active" : ""),
              onClick: () => setMode("token"),
              children: "Token-based"
            }
          ),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "tab-mini" + (mode === "request-annual" ? " active" : ""),
              onClick: () => setMode("request-annual"),
              children: "Annual request-based"
            }
          )
        ] }),
        /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted);margin-bottom:6px", children: [
          /* @__PURE__ */ u4("svg", { width: "16", height: "8", viewBox: "0 0 16 8", children: /* @__PURE__ */ u4("line", { x1: "0", y1: "4", x2: "16", y2: "4", stroke: "var(--vscode-charts-green,#81c784)", "stroke-width": "1.5", "stroke-dasharray": "4 2" }) }),
          "Daily total (right axis)"
        ] }),
        /* @__PURE__ */ u4(CostBarChart, { sessions: pricedChartSess, mode }),
        dayRows.length > 0 && /* @__PURE__ */ u4("div", { style: "display:flex;justify-content:flex-end;align-items:center;gap:4px;margin-bottom:4px", children: [
          /* @__PURE__ */ u4(
            "button",
            {
              onClick: () => setAbbrevTokens((a4) => !a4),
              title: abbrevTokens ? "Switch to full numbers" : "Switch to abbreviated numbers",
              style: "font-size:10px;padding:2px 8px;cursor:pointer;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--muted);white-space:nowrap",
              children: abbrevTokens ? "1.2M" : "1,234"
            }
          ),
          /* @__PURE__ */ u4(
            "button",
            {
              onClick: () => {
                const headers = ["Date", "Agent", "Model", "Input Tokens", "Output Tokens", "Cache Create Tokens", "Cache Read Tokens", "Total Tokens", "Cost (USD)"];
                const rows = [];
                for (const [day, d5] of dayRows) {
                  for (const [, ae] of d5.agents) {
                    rows.push([
                      day,
                      ae.source,
                      [...ae.models].join("/"),
                      String(ae.input),
                      String(ae.output),
                      String(ae.cacheCreate),
                      String(ae.cacheRead),
                      String(ae.input + ae.output + ae.cacheCreate + ae.cacheRead),
                      ae.cost.toFixed(4)
                    ]);
                  }
                }
                rows.push([
                  "TOTAL",
                  "",
                  "",
                  String(grand.input),
                  String(grand.output),
                  String(grand.cacheCreate),
                  String(grand.cacheRead),
                  String(grand.input + grand.output + grand.cacheCreate + grand.cacheRead),
                  grand.cost.toFixed(4)
                ]);
                const csv = [headers, ...rows].map((r5) => r5.map((v4) => `"${v4}"`).join(",")).join("\n");
                const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                const a4 = document.createElement("a");
                a4.href = url;
                a4.download = "agentlens-cost.csv";
                a4.click();
                URL.revokeObjectURL(url);
              },
              style: "font-size:10px;padding:2px 8px;cursor:pointer;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--muted);white-space:nowrap",
              children: "\u2193 CSV"
            }
          )
        ] }),
        dayRows.length > 0 && /* @__PURE__ */ u4("div", { style: "overflow-x:auto;margin-bottom:8px", children: /* @__PURE__ */ u4("table", { style: "border-collapse:collapse;font-size:10px;min-width:100%;white-space:nowrap", children: [
          /* @__PURE__ */ u4("thead", { children: /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border)", children: ["Date", "Agent", "Model", "Input", "Output", "Cache Create", "Cache Read", "Total Tokens", "Cost (USD)"].map((h5) => /* @__PURE__ */ u4("th", { style: `padding:3px 8px 3px ${h5 === "Date" ? "0" : "6px"};color:var(--muted);font-weight:500;text-align:${["Input", "Output", "Cache Create", "Cache Read", "Total Tokens", "Cost (USD)"].includes(h5) ? "right" : "left"}`, children: h5 }, h5)) }) }),
          /* @__PURE__ */ u4("tbody", { children: dayRows.map(([day, d5]) => {
            const agents = [...d5.agents.entries()].sort((a4, b4) => b4[1].cost - a4[1].cost);
            const dayTotal = d5.input + d5.output + d5.cacheCreate + d5.cacheRead;
            return /* @__PURE__ */ u4(S, { children: [
              /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border);background:var(--hover)", children: [
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px 3px 0;font-weight:600", children: day }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px;color:var(--muted)", children: "All" }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px" }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums", children: fmtN(d5.input) }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums", children: fmtN(d5.output) }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums", children: fmtN(d5.cacheCreate) }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums", children: fmtN(d5.cacheRead) }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-variant-numeric:tabular-nums", children: fmtN(dayTotal) }),
                /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;color:var(--vscode-charts-green,#81c784);font-weight:600", children: fmtUsd2(d5.cost) })
              ] }, day),
              agents.map(([src, ae]) => {
                const agentTotal = ae.input + ae.output + ae.cacheCreate + ae.cacheRead;
                const modelFull = [...ae.models].join(", ") || "\u2014";
                const modelShort = [...ae.models].map(fmtModel).join(", ") || "\u2014";
                return /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border)", children: [
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px 3px 0" }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px", children: [
                    /* @__PURE__ */ u4("span", { style: "display:inline-block;width:5px;height:5px;border-radius:50%;background:" + getAgentColor(src) + ";vertical-align:middle;margin-right:4px" }),
                    getAgentSourceLabel(src)
                  ] }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px;color:var(--muted);font-size:9px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", title: modelFull, children: modelShort }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums", children: fmtN(ae.input) }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums", children: fmtN(ae.output) }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums", children: fmtN(ae.cacheCreate) }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums", children: fmtN(ae.cacheRead) }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums", children: fmtN(agentTotal) }),
                  /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;color:var(--vscode-charts-green,#81c784)", children: fmtUsd2(ae.cost) })
                ] }, day + src);
              })
            ] });
          }) }),
          /* @__PURE__ */ u4("tfoot", { children: /* @__PURE__ */ u4("tr", { style: "border-top:2px solid var(--border)", children: [
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px 3px 0;font-weight:600", children: "Total" }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px" }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px" }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums", children: fmtN(grand.input) }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums", children: fmtN(grand.output) }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums", children: fmtN(grand.cacheCreate) }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums", children: fmtN(grand.cacheRead) }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums", children: fmtN(grand.input + grand.output + grand.cacheCreate + grand.cacheRead) }),
            /* @__PURE__ */ u4("td", { style: "padding:3px 8px;text-align:right;font-weight:600;color:var(--vscode-charts-green,#81c784)", children: fmtUsd2(grand.cost) })
          ] }) })
        ] }) })
      ] }),
      (copilotSess.length > 0 || claudeSess.length > 0 || codexSess.length > 0) && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4(SectionHead, { title: "AGENT BREAKDOWN" }),
        /* @__PURE__ */ u4("div", { style: "display:flex;gap:12px;flex-wrap:wrap", children: [
          copilotSess.length > 0 && /* @__PURE__ */ u4(AgentCard, { source: "copilot", sessions: copilotSess }),
          claudeSess.length > 0 && /* @__PURE__ */ u4(AgentCard, { source: "claude_code", sessions: claudeSess }),
          codexSess.length > 0 && /* @__PURE__ */ u4(AgentCard, { source: "codex", sessions: codexSess })
        ] })
      ] }),
      /* @__PURE__ */ u4(SectionHead, { title: "CONTEXT GROWTH" }),
      /* @__PURE__ */ u4(ContextGrowthChart, { sessions: chartSessions.slice(0, CHART_MAX), timelines }),
      /* @__PURE__ */ u4(SectionHead, { title: "TOKEN USAGE PER SESSION" }),
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)", children: [
        /* @__PURE__ */ u4("span", { children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:10px;height:3px;background:#FFB74D;border-radius:1px;vertical-align:middle" }),
          " Input tokens"
        ] }),
        /* @__PURE__ */ u4("span", { children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:10px;height:3px;background:#81C784;border-radius:1px;vertical-align:middle" }),
          " Output tokens"
        ] })
      ] }),
      /* @__PURE__ */ u4(SessionTokenChart, { sessions: timeOrdered })
    ] });
  }

  // media/src/AgentThresholdInputs.tsx
  var DISPLAY_AGENT_ORDER = ["copilot", "claude_code", "codex"];
  function ThresholdShell({ label, children }) {
    return /* @__PURE__ */ u4("div", { style: "display:grid;gap:6px;font-size:12px;margin:8px 0", children: [
      /* @__PURE__ */ u4("div", { class: "muted", style: "font-size:11px;text-transform:uppercase;letter-spacing:.4px;font-weight:700", children: label }),
      children
    ] });
  }
  function thresholdLabel() {
    return "Agent Thresholds";
  }
  function parseThresholdDraft(value, min, max) {
    if (!/^\d+$/.test(value)) return null;
    const next = Number(value);
    if (!Number.isSafeInteger(next) || next < min || next > max) return null;
    return next;
  }
  function thresholdInputStyle(width, invalid) {
    return "width:" + width + "px;background:var(--bg);color:var(--fg,inherit);border:1px solid " + (invalid ? "var(--error)" : "var(--border)") + ";border-radius:3px;padding:2px 6px;font-size:12px";
  }
  function ThresholdNumberTextInput({ value, min, max, width, ariaLabel, onChange }) {
    const [draft, setDraft] = d2(String(value));
    y2(() => {
      setDraft(String(value));
    }, [value]);
    const invalid = draft !== "" && parseThresholdDraft(draft, min, max) === null;
    return /* @__PURE__ */ u4(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        pattern: "[0-9]*",
        value: draft,
        "aria-label": ariaLabel,
        "aria-invalid": invalid ? "true" : "false",
        title: "Enter a number from " + min.toLocaleString() + " to " + max.toLocaleString(),
        onChange: (e4) => {
          const nextDraft = e4.target.value;
          if (!/^\d*$/.test(nextDraft)) return;
          setDraft(nextDraft);
          const next = parseThresholdDraft(nextDraft, min, max);
          if (next !== null) {
            onChange(next);
          }
        },
        onBlur: () => {
          if (parseThresholdDraft(draft, min, max) === null) {
            setDraft(String(value));
          }
        },
        style: thresholdInputStyle(width, invalid)
      }
    );
  }
  function AgentName({ source, profiles }) {
    const profile = profiles[source];
    return /* @__PURE__ */ u4("span", { style: "display:flex;align-items:center;gap:5px;white-space:nowrap", children: [
      /* @__PURE__ */ u4("span", { style: "display:inline-block;width:7px;height:7px;border-radius:50%;background:" + profile.color }),
      /* @__PURE__ */ u4("span", { children: profile.label })
    ] });
  }
  function AgentThresholdInputs({ profiles, metrics, onChange }) {
    return /* @__PURE__ */ u4(S, { children: metrics.map((metric) => {
      const meta = AGENT_PROFILE_FIELD_META[metric];
      return /* @__PURE__ */ u4(ThresholdShell, { label: thresholdLabel(), children: /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:8px;flex-wrap:wrap", children: DISPLAY_AGENT_ORDER.map((source) => /* @__PURE__ */ u4("label", { style: "display:flex;align-items:center;gap:6px;background:var(--panel-bg);border:1px solid var(--border);border-radius:4px;padding:4px 6px", children: [
        /* @__PURE__ */ u4(AgentName, { source, profiles }),
        /* @__PURE__ */ u4(
          ThresholdNumberTextInput,
          {
            value: profiles[source][metric],
            min: meta.min,
            max: meta.max,
            width: 50,
            ariaLabel: profiles[source].label + " " + meta.label,
            onChange: (next) => onChange(source, metric, next)
          }
        ),
        /* @__PURE__ */ u4("span", { class: "muted", children: meta.unit })
      ] }, source)) }) }, metric);
    }) });
  }
  function AgentThresholdNumberInputs({
    profiles,
    metricName,
    unit,
    values,
    min,
    max,
    onChange
  }) {
    return /* @__PURE__ */ u4(ThresholdShell, { label: thresholdLabel(), children: /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:8px;flex-wrap:wrap", children: DISPLAY_AGENT_ORDER.map((source) => /* @__PURE__ */ u4("label", { style: "display:flex;align-items:center;gap:6px;background:var(--panel-bg);border:1px solid var(--border);border-radius:4px;padding:4px 6px", children: [
      /* @__PURE__ */ u4(AgentName, { source, profiles }),
      /* @__PURE__ */ u4(
        ThresholdNumberTextInput,
        {
          value: values[source],
          min,
          max,
          width: 62,
          ariaLabel: profiles[source].label + " " + metricName,
          onChange: (next) => onChange(source, next)
        }
      ),
      /* @__PURE__ */ u4("span", { class: "muted", children: unit })
    ] }, source)) }) });
  }

  // media/src/tabs/Alerts.tsx
  var ALERT_TOOLTIPS = {
    context_window: "Peak context use is the largest single LLM input in a session, not the average. Cache hits can make high input cheap, but they still occupy the context window.",
    high_turns: "High turn counts often mean the task has become too broad. Ask for a wrap-up, split the task, or provide more exact files and stopping conditions.",
    error_spike: "Counts errors in the session. Stop retries and diagnose the root cause once the threshold is crossed.",
    long_session: "Uses active LLM/tool compute time, not wall-clock waiting time.",
    no_cache: "Only checks sessions above the input-token gate. Cache can be low for small sessions without being a problem.",
    tool_loop: "Counts identical tool plus argument repeats, not just the same tool name."
  };
  var DEFAULT_CONFIGS = [
    { id: "context_window", label: "Context Window Filling Up", severity: "warning", description: "Fires when any session reaches the configured peak input-token threshold for that agent.", enabled: true, threshold: 17e4, unit: "tokens", min: 1e4, max: 1e6, step: 1e3, agentThresholds: { claude_code: 17e4, copilot: 108800, codex: 34e4 } },
    { id: "high_turns", label: "Too Many Turns Per Session", severity: "warning", description: "Fires when any session reaches its agent-specific LLM turn alert threshold. High turn counts often indicate scope creep or a task that should be split.", enabled: true, threshold: 200, unit: "agent profile", min: 20, max: 500, step: 10 },
    { id: "error_spike", label: "Error Spike", severity: "error", description: "Fires when any session reaches its agent-specific error count threshold.", enabled: true, threshold: 5, unit: "agent profile", min: 2, max: 20, step: 1 },
    { id: "long_session", label: "Long Active Session", severity: "info", description: "Fires when active LLM/tool compute time exceeds the agent-specific threshold. Wall-clock idle time does not count.", enabled: true, threshold: 60, unit: "agent profile", min: 10, max: 240, step: 10 },
    { id: "no_cache", label: "Zero Cache Utilization", severity: "info", description: "Fires when any session above that agent's input-token gate has 0% cache hit rate.", enabled: true, threshold: 3e4, unit: "tokens", min: 5e3, max: 2e5, step: 5e3, agentThresholds: { claude_code: 3e4, copilot: 3e4, codex: 3e4 } },
    { id: "tool_loop", label: "Identical Tool Repeat", severity: "warning", description: "Fires when the same tool with identical arguments repeats beyond the agent-specific threshold without a file change between repeats.", enabled: true, threshold: 5, unit: "agent profile", min: 3, max: 20, step: 1 }
  ];
  function cloneAgentThresholds(thresholds) {
    if (!thresholds) return void 0;
    return {
      claude_code: thresholds.claude_code,
      copilot: thresholds.copilot,
      codex: thresholds.codex
    };
  }
  function cloneAlertConfig(config) {
    return {
      ...config,
      agentThresholds: cloneAgentThresholds(config.agentThresholds)
    };
  }
  function fallbackAgentThresholds(threshold) {
    return {
      claude_code: threshold,
      copilot: threshold,
      codex: threshold
    };
  }
  function normalizeAgentThresholds(def, saved) {
    const thresholds = cloneAgentThresholds(def.agentThresholds);
    if (!thresholds) return void 0;
    const legacyThreshold = Number(saved?.threshold);
    if (!saved?.agentThresholds && Number.isFinite(legacyThreshold) && legacyThreshold >= def.min && legacyThreshold <= def.max) {
      for (const source of AGENT_ORDER) {
        thresholds[source] = legacyThreshold;
      }
    }
    for (const source of AGENT_ORDER) {
      const value = Number(saved?.agentThresholds?.[source]);
      if (Number.isFinite(value) && value >= def.min && value <= def.max) {
        thresholds[source] = value;
      }
    }
    return thresholds;
  }
  function getConfigAgentThresholds(cfg) {
    return cloneAgentThresholds(cfg.agentThresholds) ?? fallbackAgentThresholds(cfg.threshold);
  }
  function getAlertAgentThreshold(cfg, source) {
    return cfg.agentThresholds?.[source] ?? cfg.threshold;
  }
  function getAlertConfigs() {
    try {
      const stored = localStorage.getItem("agentLens.alertConfigs");
      if (!stored) return DEFAULT_CONFIGS.map(cloneAlertConfig);
      const saved = JSON.parse(stored);
      return DEFAULT_CONFIGS.map((def) => {
        const s4 = saved.find((x4) => x4.id === def.id);
        if (!s4) return cloneAlertConfig(def);
        const savedThreshold = Number(s4.threshold);
        const threshold = savedThreshold >= def.min && savedThreshold <= def.max ? savedThreshold : def.threshold;
        return {
          ...cloneAlertConfig(def),
          enabled: typeof s4.enabled === "boolean" ? s4.enabled : def.enabled,
          threshold,
          agentThresholds: normalizeAgentThresholds(def, s4)
        };
      });
    } catch {
      return DEFAULT_CONFIGS.map(cloneAlertConfig);
    }
  }
  function saveAlertConfigs(configs) {
    try {
      localStorage.setItem("agentLens.alertConfigs", JSON.stringify(
        configs.map((c4) => ({ id: c4.id, enabled: c4.enabled, threshold: c4.threshold, agentThresholds: c4.agentThresholds }))
      ));
    } catch {
    }
  }
  function hasSharedThreshold(cfg) {
    return cfg.id === "context_window" || cfg.id === "no_cache";
  }
  function alertProfileMetrics(cfg) {
    switch (cfg.id) {
      case "high_turns":
        return ["turnAlert"];
      case "error_spike":
        return ["consecutiveErrorAlert"];
      case "long_session":
        return ["activeMinutesAlert"];
      case "tool_loop":
        return ["identicalRepeatAlert"];
      default:
        return [];
    }
  }
  function sharedAlertMetricName(cfg) {
    return cfg.id === "context_window" ? "Context window tokens" : "Input tokens";
  }
  function evaluateAlert(cfg, sessions, _eff, profiles = getAgentProfiles()) {
    if (!sessions?.length) return { triggered: false };
    switch (cfg.id) {
      case "context_window": {
        const rows = sessions.map((session) => ({
          session,
          usage: getPeakContextUsage(session, profiles),
          profile: resolveAgentProfile(session.source, profiles),
          threshold: getAlertAgentThreshold(cfg, session.source)
        })).filter((row) => row.usage.peakTokens > 0);
        if (!rows.length) return { triggered: false };
        const worst = rows.reduce((a4, b4) => {
          const aRatio = a4.usage.peakTokens / Math.max(a4.threshold, 1);
          const bRatio = b4.usage.peakTokens / Math.max(b4.threshold, 1);
          return bRatio > aRatio ? b4 : a4;
        }, rows[0]);
        if (worst.usage.peakTokens < worst.threshold) return { triggered: false };
        return {
          triggered: true,
          key: worst.session.traceId || worst.session.sessionId,
          detail: "Peak context " + worst.usage.peakTokens.toLocaleString() + " tokens vs " + worst.profile.label + " threshold " + worst.threshold.toLocaleString() + ' \u2014 "' + sessionDisplayName(worst.session) + '"'
        };
      }
      case "high_turns": {
        const over = sessions.map((session) => ({ session, profile: resolveAgentProfile(session.source, profiles) })).filter((row) => (row.session.totalLlmCalls ?? 0) >= row.profile.turnAlert);
        if (!over.length) return { triggered: false };
        const worst = over.reduce((a4, b4) => (b4.session.totalLlmCalls ?? 0) > (a4.session.totalLlmCalls ?? 0) ? b4 : a4, over[0]);
        return {
          triggered: true,
          key: worst.session.traceId || worst.session.sessionId,
          detail: over.length + " session(s) reached threshold. Worst: " + worst.session.totalLlmCalls + " turns vs " + worst.profile.label + " alert " + worst.profile.turnAlert + ' \u2014 "' + sessionDisplayName(worst.session) + '"'
        };
      }
      case "error_spike": {
        const rows = sessions.map((session) => ({ session, health: getErrorHealth(session), profile: resolveAgentProfile(session.source, profiles) }));
        const errSess = rows.filter((row) => row.health.errorCount >= row.profile.consecutiveErrorAlert);
        if (!errSess.length) return { triggered: false };
        const worst = errSess.reduce((a4, b4) => b4.health.errorCount > a4.health.errorCount ? b4 : a4, errSess[0]);
        return {
          triggered: true,
          key: worst.session.traceId || worst.session.sessionId,
          detail: "Worst: " + worst.health.errorCount + " error(s) vs " + worst.profile.label + " threshold " + worst.profile.consecutiveErrorAlert + ' \u2014 "' + sessionDisplayName(worst.session) + '"'
        };
      }
      case "long_session": {
        const long = sessions.map((session) => ({ session, activeMs: getActiveComputeMs(session), profile: resolveAgentProfile(session.source, profiles) })).filter((row) => row.activeMs >= row.profile.activeMinutesAlert * 60 * 1e3);
        if (!long.length) return { triggered: false };
        const longest = long.reduce((a4, b4) => b4.activeMs > a4.activeMs ? b4 : a4, long[0]);
        return {
          triggered: true,
          key: longest.session.traceId || longest.session.sessionId,
          detail: long.length + " session(s) exceeded threshold. Longest active compute: " + formatMs(longest.activeMs) + " vs " + longest.profile.label + " alert " + longest.profile.activeMinutesAlert + "min"
        };
      }
      case "no_cache": {
        const noCache = sessions.map((session) => ({
          session,
          profile: resolveAgentProfile(session.source, profiles),
          threshold: getAlertAgentThreshold(cfg, session.source)
        })).filter((row) => (row.session.inputTokens ?? 0) >= row.threshold && (row.session.cacheHitRate ?? 0) === 0);
        if (!noCache.length) return { triggered: false };
        const worst = noCache.reduce((a4, b4) => (b4.session.inputTokens ?? 0) > (a4.session.inputTokens ?? 0) ? b4 : a4, noCache[0]);
        return {
          triggered: true,
          key: worst.session.traceId || worst.session.sessionId,
          detail: "0% cache hit rate on " + worst.session.inputTokens.toLocaleString() + " input tokens vs " + worst.profile.label + " gate " + worst.threshold.toLocaleString() + ' \u2014 "' + sessionDisplayName(worst.session) + '"'
        };
      }
      case "tool_loop": {
        const rows = sessions.map((session) => ({ session, repeat: getIdenticalToolRepeat(session), profile: resolveAgentProfile(session.source, profiles) })).filter((row) => Boolean(row.repeat));
        const over = rows.filter((row) => row.repeat.count >= row.profile.identicalRepeatAlert);
        if (!over.length) return { triggered: false };
        const worst = over.reduce((a4, b4) => b4.repeat.count > a4.repeat.count ? b4 : a4, over[0]);
        return {
          triggered: true,
          key: (worst.session.traceId || worst.session.sessionId) + ":" + worst.repeat.key,
          detail: '"' + worst.repeat.display + '" repeated ' + worst.repeat.count + " times without intervening file changes vs " + worst.profile.label + " alert " + worst.profile.identicalRepeatAlert + ' \u2014 "' + sessionDisplayName(worst.session) + '"'
        };
      }
      default:
        return { triggered: false };
    }
  }
  function getTriggeredAlerts() {
    const configs = getAlertConfigs();
    const profiles = getAgentProfiles();
    const { sessions, efficiency } = buildDisplaySummary();
    const out = [];
    for (const cfg of configs) {
      if (!cfg.enabled) continue;
      const result = evaluateAlert(cfg, sessions, efficiency, profiles);
      if (result.triggered) out.push({ label: cfg.label, severity: cfg.severity, detail: result.detail ?? "" });
    }
    return out;
  }
  function computeAlertCount() {
    return getTriggeredAlerts().length;
  }
  var firedAlertKeys = /* @__PURE__ */ new Set();
  function checkAlerts() {
    const configs = getAlertConfigs();
    const profiles = getAgentProfiles();
    const { sessions, efficiency } = buildDisplaySummary();
    const now = Date.now();
    const RECENT_WINDOW_MS = 30 * 1e3;
    const recentSessions = sessions.filter((s4) => {
      const lastTs = s4.timeline && s4.timeline.length > 0 ? s4.timeline[s4.timeline.length - 1].timestamp : s4.startTime;
      if (!lastTs) return false;
      const tsNum = typeof lastTs === "number" ? lastTs : Date.parse(lastTs);
      return now - tsNum < RECENT_WINDOW_MS;
    });
    const notifications = [];
    const activeKeys = /* @__PURE__ */ new Set();
    for (const cfg of configs) {
      if (!cfg.enabled) {
        continue;
      }
      const result = evaluateAlert(cfg, recentSessions, efficiency, profiles);
      if (result.triggered) {
        const key = cfg.id + ":" + (result.key ?? "global");
        activeKeys.add(key);
        if (firedAlertKeys.has(key)) {
          continue;
        }
        firedAlertKeys.add(key);
        notifications.push({ label: cfg.label, detail: result.detail, severity: cfg.severity });
      }
    }
    for (const key of Array.from(firedAlertKeys)) {
      if (!activeKeys.has(key)) {
        firedAlertKeys.delete(key);
      }
    }
    return notifications;
  }
  function Alerts() {
    const sessions = displaySessions.value;
    const [configs, setConfigs] = d2(getAlertConfigs);
    const [profiles, setProfiles] = d2(getAgentProfiles);
    const hasSessions = sessions.length > 0;
    const { sessions: displayed, efficiency } = buildDisplaySummary();
    const results = configs.map((cfg) => ({
      config: cfg,
      ...cfg.enabled ? evaluateAlert(cfg, displayed, efficiency, profiles) : { triggered: false }
    }));
    const triggeredCount = results.filter((r5) => r5.triggered).length;
    function updateAgentThreshold(source, metric, value) {
      const next = {
        ...profiles,
        [source]: {
          ...profiles[source],
          [metric]: value
        }
      };
      saveAgentProfiles(next);
      setProfiles(next);
    }
    function updateConfig(id, changes) {
      setConfigs((prev) => {
        const next = prev.map((c4) => c4.id === id ? { ...c4, ...changes } : c4);
        saveAlertConfigs(next);
        return next;
      });
    }
    function updateConfigAgentThreshold(cfg, source, value) {
      updateConfig(cfg.id, {
        agentThresholds: {
          ...getConfigAgentThresholds(cfg),
          [source]: value
        }
      });
    }
    return /* @__PURE__ */ u4("div", { id: "alerts-content", children: [
      /* @__PURE__ */ u4("div", { style: "font-size:11px;color:var(--muted);padding:6px 10px;margin-bottom:12px;border-left:2px solid var(--border)", children: /* @__PURE__ */ u4("strong", { children: "Settings below are adjustable per agent. Reminder: your choice of LLM model significantly affects efficiency and may require threshold adjustments." }) }),
      !hasSessions ? /* @__PURE__ */ u4("div", { style: "background:var(--panel-bg);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin-bottom:14px", children: [
        /* @__PURE__ */ u4("strong", { children: "No agent sessions recorded" }),
        /* @__PURE__ */ u4("span", { style: "color:var(--muted);font-size:12px;margin-left:8px", children: "alert configuration is available below" })
      ] }) : triggeredCount > 0 ? /* @__PURE__ */ u4("div", { style: "background:rgba(239,83,80,0.12);border:1px solid var(--error);border-radius:6px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px", children: [
        /* @__PURE__ */ u4("span", { style: "font-size:18px", children: "\u26A0" }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "err", children: [
            triggeredCount,
            " alert",
            triggeredCount > 1 ? "s" : "",
            " triggered"
          ] }),
          /* @__PURE__ */ u4("span", { style: "color:var(--muted);font-size:12px;margin-left:8px", children: "based on your displayed sessions" })
        ] })
      ] }) : /* @__PURE__ */ u4("div", { style: "background:rgba(129,199,132,0.1);border:1px solid #81c784;border-radius:6px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px", children: [
        /* @__PURE__ */ u4("span", { style: "font-size:18px;color:#81c784", children: "\u2713" }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { style: "color:#81c784", children: "All clear" }),
          /* @__PURE__ */ u4("span", { style: "color:var(--muted);font-size:12px;margin-left:8px", children: "no alerts triggered for current sessions" })
        ] })
      ] }),
      results.map(({ config: cfg, triggered, detail }) => {
        const sev = cfg.severity;
        const trigColor = sev === "error" ? "var(--error)" : sev === "info" ? "#4fc3f7" : "#f6a623";
        const borderColor = triggered ? trigColor : "var(--border)";
        const statusIcon = !cfg.enabled ? "\u25CB" : triggered ? sev === "error" ? "\u26D4" : sev === "info" ? "\u2139" : "\u26A0" : "\u2713";
        const statusColor = !cfg.enabled ? "var(--muted)" : triggered ? trigColor : "#81c784";
        const profileMetrics = alertProfileMetrics(cfg);
        return /* @__PURE__ */ u4("div", { style: `border:1px solid ${borderColor};border-left:4px solid ${borderColor};border-radius:6px;padding:12px 14px;margin-bottom:10px`, children: [
          /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;justify-content:space-between;margin-bottom:6px", children: [
            /* @__PURE__ */ u4("div", { class: "flex-8", children: [
              /* @__PURE__ */ u4("span", { style: `font-size:15px;color:${statusColor};line-height:1`, children: statusIcon }),
              /* @__PURE__ */ u4("strong", { style: "font-size:13px", children: cfg.label }),
              triggered && /* @__PURE__ */ u4("span", { style: `font-size:10px;background:${trigColor};color:#000;padding:1px 7px;border-radius:3px;font-weight:700;letter-spacing:.4px`, children: "TRIGGERED" })
            ] }),
            /* @__PURE__ */ u4("label", { class: "toggle-switch", children: [
              /* @__PURE__ */ u4(
                "input",
                {
                  type: "checkbox",
                  checked: cfg.enabled,
                  onChange: (e4) => updateConfig(cfg.id, { enabled: e4.target.checked })
                }
              ),
              /* @__PURE__ */ u4("span", { class: "toggle-track", children: /* @__PURE__ */ u4("span", { class: "toggle-thumb" }) }),
              /* @__PURE__ */ u4("span", { class: "toggle-label" + (cfg.enabled ? " on" : ""), children: cfg.enabled ? "Enabled" : "Disabled" })
            ] })
          ] }),
          /* @__PURE__ */ u4("div", { style: "font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.5", children: [
            cfg.description,
            ALERT_TOOLTIPS[cfg.id] && /* @__PURE__ */ u4(S, { children: [
              " ",
              " ",
              /* @__PURE__ */ u4("span", { "data-tip": ALERT_TOOLTIPS[cfg.id], style: "font-size:11px;color:var(--vscode-textLink-foreground,#4fc3f7);border-bottom:1px dotted currentColor;cursor:help;white-space:nowrap", children: "Why?" })
            ] })
          ] }),
          triggered && detail && /* @__PURE__ */ u4("div", { style: `font-size:12px;padding:7px 10px;background:var(--panel-bg);border-radius:4px;border-left:3px solid ${trigColor};margin-bottom:8px;line-height:1.4`, children: detail }),
          hasSharedThreshold(cfg) ? /* @__PURE__ */ u4(
            AgentThresholdNumberInputs,
            {
              profiles,
              metricName: sharedAlertMetricName(cfg),
              unit: "tokens",
              values: getConfigAgentThresholds(cfg),
              min: cfg.min,
              max: cfg.max,
              onChange: (source, value) => updateConfigAgentThreshold(cfg, source, value)
            }
          ) : profileMetrics.length > 0 && /* @__PURE__ */ u4(
            AgentThresholdInputs,
            {
              profiles,
              metrics: profileMetrics,
              onChange: updateAgentThreshold
            }
          )
        ] }, cfg.id);
      }),
      /* @__PURE__ */ u4("div", { style: "margin-top:16px;padding-top:12px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px", children: [
        /* @__PURE__ */ u4("div", { style: "display:flex;gap:6px", children: [
          /* @__PURE__ */ u4(
            "button",
            {
              onClick: () => {
                const next = configs.map((c4) => ({ ...cloneAlertConfig(c4), enabled: true }));
                saveAlertConfigs(next);
                setConfigs(next);
              },
              style: "font-size:11px;background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer;color:var(--fg)",
              children: "Enable All"
            }
          ),
          /* @__PURE__ */ u4(
            "button",
            {
              onClick: () => {
                const next = configs.map((c4) => ({ ...cloneAlertConfig(c4), enabled: false }));
                saveAlertConfigs(next);
                setConfigs(next);
              },
              style: "font-size:11px;background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer;color:var(--muted)",
              children: "Disable All"
            }
          )
        ] }),
        /* @__PURE__ */ u4(
          "button",
          {
            onClick: () => {
              try {
                localStorage.removeItem("agentLens.alertConfigs");
              } catch {
              }
              setConfigs(DEFAULT_CONFIGS.map(cloneAlertConfig));
            },
            style: "font-size:11px;color:var(--muted);background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer",
            children: "Reset to Defaults"
          }
        ),
        /* @__PURE__ */ u4(
          "button",
          {
            onClick: () => setProfiles(resetAgentProfiles()),
            style: "font-size:11px;color:var(--muted);background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer",
            children: "Reset Agent Thresholds"
          }
        )
      ] })
    ] });
  }

  // media/src/tabs/Export.tsx
  function send(type) {
    if (vscode) {
      vscode.postMessage({ type });
    } else {
      window.dispatchEvent(new MessageEvent("message", { data: { type } }));
    }
  }
  function Export() {
    const [rawDone, setRawDone] = d2(false);
    const [redactedDone, setRedactedDone] = d2(false);
    const standalone = !!window.__STANDALONE__;
    const sessionCount = sessionSummary.value?.sessions?.length ?? 0;
    const doExport = () => {
      send("exportSessionData");
      setRawDone(true);
      setTimeout(() => setRawDone(false), 3e3);
    };
    const doRedacted = () => {
      send("exportSessionDataRedacted");
      setRedactedDone(true);
      setTimeout(() => setRedactedDone(false), 3e3);
    };
    const empty = sessionCount === 0;
    return /* @__PURE__ */ u4("div", { id: "export-content", children: [
      /* @__PURE__ */ u4("div", { class: "export-meta", children: [
        sessionCount,
        " session",
        sessionCount !== 1 ? "s" : "",
        standalone && /* @__PURE__ */ u4("span", { class: "export-meta-mode", children: " \xB7 browser download" }),
        !standalone && /* @__PURE__ */ u4("span", { class: "export-meta-mode", children: " \xB7 written to workspace root" })
      ] }),
      /* @__PURE__ */ u4("div", { class: "export-cards", children: [
        /* @__PURE__ */ u4("div", { class: "export-card", children: [
          /* @__PURE__ */ u4("div", { class: "export-card-header", children: [
            /* @__PURE__ */ u4("span", { class: "export-card-title", children: "Export Session Data" }),
            /* @__PURE__ */ u4("span", { class: "export-card-badge export-badge-raw", children: "Full" })
          ] }),
          /* @__PURE__ */ u4("p", { class: "export-card-desc", children: "All recorded sessions exported as JSON \u2014 includes prompt text, token counts, tool usage, file changes, cost estimates, and efficiency signals." }),
          /* @__PURE__ */ u4("ul", { class: "export-card-includes", children: [
            /* @__PURE__ */ u4("li", { children: "Prompt text (userRequest)" }),
            /* @__PURE__ */ u4("li", { children: "Token counts, cache stats, model names" }),
            /* @__PURE__ */ u4("li", { children: "Tool call counts and file paths changed" }),
            /* @__PURE__ */ u4("li", { children: "Duration, errors, outcome, loop signals" })
          ] }),
          /* @__PURE__ */ u4("div", { class: "export-card-warning", children: "Keep private \u2014 includes prompt text." }),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "export-btn" + (rawDone ? " export-btn-done" : ""),
              onClick: doExport,
              disabled: empty,
              children: rawDone ? "\u2713 Exported" : "Export Session Data"
            }
          )
        ] }),
        /* @__PURE__ */ u4("div", { class: "export-card export-card-redacted", children: [
          /* @__PURE__ */ u4("div", { class: "export-card-header", children: [
            /* @__PURE__ */ u4("span", { class: "export-card-title", children: "Export Session Data (Redacted)" }),
            /* @__PURE__ */ u4("span", { class: "export-card-badge export-badge-redacted", children: "Safer to share" })
          ] }),
          /* @__PURE__ */ u4("p", { class: "export-card-desc", children: "Same export with prompt text removed. Safe to attach to bug reports or share with teammates for cost and efficiency analysis." }),
          /* @__PURE__ */ u4("ul", { class: "export-card-includes", children: [
            /* @__PURE__ */ u4("li", { children: [
              /* @__PURE__ */ u4("span", { class: "export-redacted-label", children: "[removed]" }),
              " Prompt text"
            ] }),
            /* @__PURE__ */ u4("li", { children: "\u2713 Token counts, cache stats, model names" }),
            /* @__PURE__ */ u4("li", { children: "\u2713 Tool call counts and file paths changed" }),
            /* @__PURE__ */ u4("li", { children: "\u2713 Duration, errors, outcome, loop signals" })
          ] }),
          /* @__PURE__ */ u4("div", { class: "export-card-safe", children: "Safer to share \u2014 no prompt content." }),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "export-btn export-btn-secondary" + (redactedDone ? " export-btn-done" : ""),
              onClick: doRedacted,
              disabled: empty,
              children: redactedDone ? "\u2713 Exported" : "Export Session Data (Redacted)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { class: "export-replay-box", children: [
        /* @__PURE__ */ u4("div", { class: "export-replay-title", children: "About session data exports" }),
        /* @__PURE__ */ u4("p", { class: "export-replay-desc", children: "These exports contain aggregated session summaries \u2014 token counts, tool usage, cost estimates, file changes, and efficiency signals. They are useful for cost analysis, sharing with teammates, and offline review." }),
        /* @__PURE__ */ u4("p", { class: "export-replay-note", children: [
          /* @__PURE__ */ u4("strong", { children: "Note:" }),
          " Session summary exports cannot be replayed with",
          /* @__PURE__ */ u4("code", { children: "pnpm run demo --file" }),
          ". Replay requires raw OTEL span data, which is not yet persisted to disk. See the open issue for raw span export support."
        ] })
      ] })
    ] });
  }

  // media/src/tabs/Help.tsx
  var TERMS = [
    ["Agent Loop / Malfunction", "A behavioral pattern in which an AI agent is stuck, oscillating, or spiraling into unproductive work. AgentLens detects five patterns: Tool Call Deadlock, State Corruption Spiral, Hallucination Amplification Loop, Ambiguous Success / Escalating Scope, and Infinite Loop \u2014 Context Accumulation."],
    ["Agent", "The AI coding assistant (e.g. GitHub Copilot, Claude Code, Codex) that receives your prompt, reasons about the task, and decides which tools to use. It manages the workflow, breaks down tasks, and may call the underlying LLM multiple times per session to complete a single request. The agent is the orchestrator; the LLM is the engine it drives."],
    ["Avg Input/Call", "Average number of input tokens sent to the language model per LLM call. Lower means leaner prompts. Under 10K is lean; 10-30K is normal; 30K+ suggests large instruction files, verbose tool definitions, or accumulated context bloat."],
    ["Avg Turns/Session", "Average number of LLM round-trips per session. Lower is more efficient. 1-3 turns is typical for simple tasks; 5+ may indicate the agent is struggling or the prompt needs more specifics."],
    ["Background Span", "A span that runs outside the main request/response cycle \u2014 e.g., telemetry uploads, extension lifecycle events, or periodic health checks."],
    ["Cache Create Tokens", "Tokens written into the prompt cache on the server during this request. These tokens become available for cache hits on subsequent requests."],
    ["Cache Hit Rate", "The percentage of input tokens served from a server-side prompt cache instead of being reprocessed. Higher rates reduce latency and cost."],
    ["Cache Read Tokens", "Input tokens served from the server-side prompt cache, avoiding reprocessing. Shown in efficiency metrics."],
    ["Context Bloat", "An efficiency insight triggered when input tokens grow significantly across turns within a session."],
    ["Files Changed", "Unique files that were created or modified by the agent during the current data collection period."],
    ["Input Tokens", "The number of tokens sent to the language model in a request, including system instructions, conversation history, tool definitions, and the user prompt."],
    ["Loop Signal", "A behavioral signal in the Insights panel (inside the Overview sub-tab of each session) indicating the agent is stuck, oscillating, or making no forward progress. Shown with a \u21BA icon."],
    ["LLM", "Large Language Model. The underlying AI model (e.g. GPT-4o, Claude Sonnet) that generates text, answers questions, or produces code. The agent sends requests to the LLM as needed; the model itself does not manage tools or workflow. It is the engine that generates language and code for the agent to act on."],
    ["LLM Call", "A single request-response cycle to the language model. One session typically includes multiple LLM calls as the agent iterates."],
    ["OTLP", "OpenTelemetry Protocol \u2014 the standard format used to collect and transmit telemetry from AI agents to this extension. AgentLens accepts trace spans and log-derived events."],
    ["Outcome", 'How a session concluded: "text" means the agent responded with a text answer; "tool" means the last action was a tool call.'],
    ["Output Tokens", "The number of tokens generated by the language model in its response, including reasoning, tool call instructions, and final answers."],
    ["Output Ratio", "Percentage of total tokens that are output (generated by the model). In cached agentic coding sessions this can be naturally tiny, so AgentLens no longer uses it as a standalone alert."],
    ["Prompt", "The text you type into the AI chat to request work. Each prompt initiates a new session."],
    ["Request", "The user-visible message sent to the agent in a single prompt. In OTEL terms, the request anchor differs by agent: Copilot uses invoke_agent, Claude uses claude_code.interaction, and Codex is normalized from prompt log events."],
    ["Session", "A single prompt-to-response cycle. Starts when you send a prompt and ends when the agent delivers its final response. AgentLens normalizes different Copilot, Claude, and Codex OTEL shapes into this shared model."],
    ["Span", "A single timed operation recorded by OpenTelemetry. AgentLens displays true trace spans and normalized log events with a span-like name, duration, and attributes."],
    ["Span ID", "A unique identifier for a single span within a trace. Used to establish parent-child relationships between operations."],
    ["Sparkline", "A small inline chart shown below summary cards, depicting the trend of a metric over recent time buckets."],
    ["Tokens", "The fundamental unit language models use to process text. Roughly 1 token \u2248 4 characters or \xBE of a word."],
    ["Tool Call", "A single invocation of a tool by the agent \u2014 e.g., reading a file, running a search, or executing a terminal command."],
    ["Tool Definition Overhead", "An efficiency insight triggered when a large fraction of input tokens is consumed by tool definition schemas rather than actual content."],
    ["Trace", "A group of related spans sharing a Trace ID. Copilot and Claude usually map a trace to a session; Codex log events can require AgentLens to group records by conversation, session, thread, or turn attributes."],
    ["Trace ID", "A unique identifier linking all spans belonging to the same session/request."],
    ["Turn", "One LLM call within a session. A multi-turn session involves the agent calling the LLM, executing tools, then calling the LLM again."],
    ["TTFT", "Time to First Token \u2014 the latency between sending a prompt and receiving the first token of the response."],
    ["Waterfall", "A span visualization where operations are displayed as horizontal bars on a time axis, with nesting depth shown by indentation. Used in OpenTelemetry tooling; AgentLens surfaces span timing data through the Traces tab instead."]
  ];
  var HELP_SECTIONS = {
    overview: { href: "#help-overview", heading: "Overview" },
    config: { href: "#help-config", heading: "Setup" },
    otel: { href: "#help-otel", heading: "OTEL Data" },
    sessions: { href: "#help-sessions", heading: "Sessions" },
    analytics: { href: "#help-analytics", heading: "Analytics" },
    alerts: { href: "#help-alerts", heading: "Alerts" },
    automation: { href: "#help-automation", heading: "Automation" },
    export: { href: "#help-export", heading: "Export" },
    badges: { href: "#help-badges", heading: "Badges" },
    glossary: { href: "#help-glossary", heading: "Glossary" }
  };
  var TOC_SECTIONS = Object.values(HELP_SECTIONS);
  var AGENT_OTEL_SHAPES = [
    {
      agent: "Copilot",
      format: 'OpenTelemetry <a href="#gl-trace">trace</a> <a href="#gl-span">spans</a> with a clean single-trace hierarchy. Each conversation is one trace; <a href="#gl-llm-call">LLM calls</a> and tool calls are child spans nested under a session root. No extra configuration needed.',
      coverage: 'Prompt text, token counts (<a href="#gl-input-tokens">input</a>, <a href="#gl-output-tokens">output</a>, <a href="#gl-cache-read-tokens">cache read</a>), model name, <a href="#gl-ttft">TTFT</a>, tool names, tool arguments, tool results, and file paths are all present natively without any extra configuration.',
      gaps: "Cache <em>write</em> token counts are not available \u2014 Copilot manages cache creation server-side and does not expose it in telemetry. Cache <em>read</em> tokens are available. No additional configuration unlocks further data \u2014 what Copilot exposes is already fully available."
    },
    {
      agent: "Claude Code",
      format: "OpenTelemetry trace spans. The session root span closes when the interaction ends, with LLM calls and tool calls as children. Optional supplemental log records are emitted when enhanced telemetry env vars are set.",
      coverage: "With the recommended configuration (all three OTEL_LOG_* vars set): prompt text, token counts, model, tool names, tool arguments, file paths, and full file diff content are all available.",
      gaps: "The three OTEL_LOG_* env vars are not enabled by default \u2014 without them, tool arguments are absent, prompt text is omitted, and file diff content is unavailable. Cache token data is only present when using a model that supports prompt caching."
    },
    {
      agent: "Codex",
      format: "Primarily flat OTLP log records (structured JSON events sent to /v1/logs), not trace spans. Each session is a stream of log events grouped by conversation and turn identifiers. Adding trace_exporter to ~/.codex/config.toml also emits timing spans to /v1/traces. Both the CLI and the VS Code extension read the same config file.",
      coverage: "With the recommended configuration (log_user_prompt = true and both exporters set): prompt text, token counts, model name, TTFT, tool names, tool arguments, tool results, and span timing are all present.",
      gaps: "The Traces timeline has less span granularity than Copilot or Claude Code since Codex is primarily log-based. Without trace_exporter, timing data is limited."
    }
  ];
  var codeStyle = "font-size:11px;background:var(--panel-bg);padding:1px 4px;border-radius:3px";
  var preStyle = "background:var(--panel-bg);border:1px solid var(--border);border-radius:5px;padding:10px 14px;font-size:11.5px;line-height:1.6;overflow-x:auto;white-space:pre";
  var h4Style = "font-size:13px;font-weight:600;margin:0 0 6px;color:var(--fg,inherit)";
  var mutedP = "font-size:12px;color:var(--muted);margin:0 0 8px";
  var subHeadStyle = "font-size:13px;font-weight:600;margin:20px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--border);color:var(--fg)";
  function InsightBlock({ id, title, why, steps, impact }) {
    return /* @__PURE__ */ u4("div", { class: "glossary-item", id, style: "scroll-margin-top:12px;flex-direction:column;gap:0", children: [
      /* @__PURE__ */ u4("dt", { class: "glossary-term", style: "margin-bottom:6px", children: title }),
      /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: [
        /* @__PURE__ */ u4("p", { style: "margin:0 0 8px", children: [
          /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Why it happens: " }),
          /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: why } })
        ] }),
        /* @__PURE__ */ u4("p", { style: "margin:0 0 4px", children: /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "How to fix:" }) }),
        /* @__PURE__ */ u4("ol", { style: "margin:0 0 8px;padding-left:20px;font-size:12px;line-height:1.7", dangerouslySetInnerHTML: { __html: steps } }),
        /* @__PURE__ */ u4("p", { style: "margin:0;font-size:11px;color:var(--muted)", children: [
          /* @__PURE__ */ u4("strong", { style: "color:var(--fg);font-size:11px", children: "Expected impact: " }),
          /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: impact } })
        ] })
      ] })
    ] });
  }
  function LoopBlock({ id, title, why, example, steps, impact }) {
    return /* @__PURE__ */ u4("div", { class: "glossary-item", id, style: "scroll-margin-top:12px;flex-direction:column;gap:6px", children: [
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:12px;align-items:flex-start", children: [
        /* @__PURE__ */ u4("dt", { class: "glossary-term", style: "min-width:200px", children: title }),
        /* @__PURE__ */ u4("dd", { class: "glossary-def", dangerouslySetInnerHTML: { __html: why } })
      ] }),
      /* @__PURE__ */ u4("div", { style: "padding-left:8px;font-size:11px;color:var(--muted);line-height:1.5", children: [
        /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Example: " }),
        /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: example } })
      ] }),
      /* @__PURE__ */ u4("div", { style: "padding-left:8px;font-size:11px;line-height:1.6", children: [
        /* @__PURE__ */ u4("p", { style: "margin:0 0 3px", children: /* @__PURE__ */ u4("strong", { style: "color:var(--fg);font-size:11px", children: "How to fix:" }) }),
        /* @__PURE__ */ u4("ol", { style: "margin:0 0 6px;padding-left:18px;font-size:11px;line-height:1.7;color:var(--muted)", dangerouslySetInnerHTML: { __html: steps } }),
        /* @__PURE__ */ u4("p", { style: "margin:0;font-size:10px;color:var(--muted)", children: [
          /* @__PURE__ */ u4("strong", { style: "color:var(--fg);font-size:10px", children: "Expected impact: " }),
          /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: impact } })
        ] })
      ] })
    ] });
  }
  function Toc() {
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("style", { dangerouslySetInnerHTML: { __html: "html,body{scroll-behavior:smooth}.help-section{scroll-margin-top:44px}.glossary-item[id]{scroll-margin-top:44px}.help-toc a{display:inline-block;padding:3px 11px;border-radius:12px;font-size:11px;font-weight:500;color:var(--muted);text-decoration:none;border:1px solid var(--border);transition:color .1s,background .1s}.help-toc a:hover{color:var(--fg);background:var(--hover);border-color:var(--fg)}" } }),
      /* @__PURE__ */ u4("nav", { class: "help-toc", "aria-label": "Help sections", style: "position:sticky;top:0;z-index:20;background:var(--vscode-editorWidget-background,var(--bg));border-bottom:1px solid var(--border);padding:7px 0 8px;margin:0 -16px 20px -12px;padding-left:12px;display:flex;gap:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none", children: TOC_SECTIONS.map((s4) => /* @__PURE__ */ u4("a", { href: s4.href, children: s4.heading })) })
    ] });
  }
  function OverviewSection() {
    const mascotSrc = window.__MASCOT_URI__ ?? "";
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-overview", children: [
      mascotSrc && /* @__PURE__ */ u4("div", { style: { textAlign: "center", marginBottom: 16 }, children: [
        /* @__PURE__ */ u4("img", { src: esc(mascotSrc), alt: "AgentLens mascot", style: { maxWidth: "65%", height: "auto", display: "block", margin: "0 auto" } }),
        /* @__PURE__ */ u4("p", { style: { textAlign: "center", fontStyle: "italic", color: "var(--muted)", marginTop: 8, marginBottom: 0 }, children: "Watching your agents so you don't have to." })
      ] }),
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.overview.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: /* @__PURE__ */ u4("p", { children: [
        /* @__PURE__ */ u4("strong", { children: "AgentLens" }),
        " is a local observability tool that makes AI ",
        /* @__PURE__ */ u4("a", { href: "#gl-agent", children: "agent" }),
        " sessions more transparent \u2014 see what's happening inside each run. Available as a VS Code extension, a local web app (npx), or Docker, with no data leaving your machine. It captures ",
        /* @__PURE__ */ u4("a", { href: "#gl-otlp", children: "OpenTelemetry" }),
        " ",
        /* @__PURE__ */ u4("a", { href: "#gl-trace", children: "traces" }),
        " from GitHub Copilot, Claude Code, and Codex, and also reads ",
        /* @__PURE__ */ u4("strong", { children: "local session log files" }),
        " written automatically by each agent as a zero-config fallback \u2014 so history loads even without OTEL configured. Both sources feed one unified dashboard and surface efficiency metrics, session cost estimates, human-readable summaries, and actionable insights in real time."
      ] }) })
    ] });
  }
  function ConfigSection() {
    const standalone = window.__STANDALONE__ === true;
    const kbdStyle = "font-size:11px;background:var(--panel-bg);padding:1px 5px;border-radius:3px;border:1px solid var(--border)";
    const pathNote = (mac, win) => /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin:0 0 6px", children: [
      "macOS/Linux: ",
      /* @__PURE__ */ u4("code", { style: codeStyle, children: mac }),
      " \xA0\xB7\xA0 Windows: ",
      /* @__PURE__ */ u4("code", { style: codeStyle, children: win })
    ] });
    const callout = standalone ? /* @__PURE__ */ u4("div", { style: "margin-bottom:20px;background:var(--hover);border:1px solid var(--border);border-left:3px solid var(--warning,#ffb74d);border-radius:4px;padding:10px 14px", children: [
      /* @__PURE__ */ u4("p", { style: "font-size:12px;font-weight:600;margin:0 0 8px;color:var(--foreground)", children: "Not seeing any data?" }),
      /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin:0 0 6px", children: "Run the setup script once to configure agents automatically, then restart each agent." }),
      /* @__PURE__ */ u4("pre", { style: "font-size:11px;background:var(--panel-bg);border:1px solid var(--border);border-radius:3px;padding:6px 10px;margin:0 0 8px;overflow-x:auto;white-space:pre", children: `# macOS / Linux \u2014 make executable (once), then run:
chmod +x scripts/configure-agents.sh
./scripts/configure-agents.sh             # all agents
./scripts/configure-agents.sh --agent claude
./scripts/configure-agents.sh --agent codex
./scripts/configure-agents.sh --agent copilot

# Windows (PowerShell) \u2014 if blocked, allow scripts first (once):
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\\scripts\\configure-agents.ps1
.\\scripts\\configure-agents.ps1 -Agent claude
.\\scripts\\configure-agents.ps1 -Agent codex
.\\scripts\\configure-agents.ps1 -Agent copilot` }),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin:0 0 6px", children: [
        "Config is read at startup \u2014 restart each ",
        /* @__PURE__ */ u4("a", { href: "#gl-agent", children: "agent" }),
        " after running the script:"
      ] }),
      /* @__PURE__ */ u4("table", { style: "font-size:11px;border-collapse:collapse;width:100%", children: /* @__PURE__ */ u4("tbody", { style: "color:var(--muted)", children: [
        /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border)", children: [
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "Claude Code" }),
          /* @__PURE__ */ u4("td", { style: "padding:4px 0;vertical-align:top", children: [
            "Exit any running ",
            /* @__PURE__ */ u4("code", { style: codeStyle, children: "claude" }),
            " session and start a new one."
          ] })
        ] }),
        /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border)", children: [
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "Codex" }),
          /* @__PURE__ */ u4("td", { style: "padding:4px 0;vertical-align:top", children: [
            "Exit any running ",
            /* @__PURE__ */ u4("code", { style: codeStyle, children: "codex" }),
            " session and start a new one."
          ] })
        ] }),
        /* @__PURE__ */ u4("tr", { children: [
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "Copilot CLI" }),
          /* @__PURE__ */ u4("td", { style: "padding:4px 0;vertical-align:top", children: [
            "Open a new terminal (or restart your shell) to pick up the env vars, then run ",
            /* @__PURE__ */ u4("code", { style: codeStyle, children: "copilot" }),
            "."
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin:8px 0 0", children: [
        "Start a short ",
        /* @__PURE__ */ u4("a", { href: "#gl-session", children: "session" }),
        " and check whether a session card appears in the sidebar to confirm data is arriving."
      ] })
    ] }) : /* @__PURE__ */ u4("div", { style: "margin-bottom:20px;background:var(--hover);border:1px solid var(--border);border-left:3px solid var(--warning,#ffb74d);border-radius:4px;padding:10px 14px", children: [
      /* @__PURE__ */ u4("p", { style: "font-size:12px;font-weight:600;margin:0 0 8px;color:var(--foreground)", children: "Not seeing any data?" }),
      /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin:0 0 8px", children: [
        "AgentLens automatically configures all supported agents on first activation. Just restart each ",
        /* @__PURE__ */ u4("a", { href: "#gl-agent", children: "agent" }),
        " once \u2014 ",
        /* @__PURE__ */ u4("a", { href: "#gl-session", children: "sessions" }),
        " will start appearing immediately."
      ] }),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin:0 0 6px", children: "Config is read at startup \u2014 restart after AgentLens activates:" }),
      /* @__PURE__ */ u4("table", { style: "font-size:11px;border-collapse:collapse;width:100%", children: /* @__PURE__ */ u4("tbody", { style: "color:var(--muted)", children: [
        /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border)", children: [
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "GitHub Copilot" }),
          /* @__PURE__ */ u4("td", { style: "padding:4px 0;vertical-align:top", children: [
            /* @__PURE__ */ u4("kbd", { style: kbdStyle, children: "Cmd+Shift+P" }),
            " / ",
            /* @__PURE__ */ u4("kbd", { style: kbdStyle, children: "Ctrl+Shift+P" }),
            " \u2192 ",
            /* @__PURE__ */ u4("em", { children: "Reload Window" }),
            " to restart the VS Code extension host."
          ] })
        ] }),
        /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border)", children: [
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "Claude Code (CLI)" }),
          /* @__PURE__ */ u4("td", { style: "padding:4px 0;vertical-align:top", children: [
            "Exit any running ",
            /* @__PURE__ */ u4("code", { style: codeStyle, children: "claude" }),
            " session and start a new one."
          ] })
        ] }),
        /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--border)", children: [
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "Claude Code (VS Code)" }),
          /* @__PURE__ */ u4("td", { style: "padding:4px 0;vertical-align:top", children: [
            "Reload the VS Code window (",
            /* @__PURE__ */ u4("em", { children: "Reload Window" }),
            " from the Command Palette)."
          ] })
        ] }),
        /* @__PURE__ */ u4("tr", { children: [
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "Codex" }),
          /* @__PURE__ */ u4("td", { style: "padding:4px 0;vertical-align:top", children: [
            "Exit any running ",
            /* @__PURE__ */ u4("code", { style: codeStyle, children: "codex" }),
            " session and start a new one, or reload the VS Code window if using the Codex extension."
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin:8px 0 0", children: [
        "Open the ",
        /* @__PURE__ */ u4("em", { children: "AgentLens" }),
        " output channel (",
        /* @__PURE__ */ u4("em", { children: "View \u2192 Output \u2192 AgentLens" }),
        ") to confirm spans are arriving."
      ] })
    ] });
    const portNote = /* @__PURE__ */ u4("p", { style: mutedP, children: [
      "Manual configuration \u2014 replace ",
      /* @__PURE__ */ u4("code", { style: codeStyle, children: "4318" }),
      " with your custom port if you changed ",
      /* @__PURE__ */ u4("em", { children: "agentLens.otlpPort" }),
      "."
    ] });
    const copilotSection = /* @__PURE__ */ u4("div", { style: "margin-bottom:20px", children: [
      /* @__PURE__ */ u4("h4", { style: h4Style, children: "GitHub Copilot" }),
      standalone ? /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("p", { style: mutedP, children: [
          "Set these environment variables so they are available when you run ",
          /* @__PURE__ */ u4("code", { style: codeStyle, children: "copilot" }),
          ". The configure script updates your shell profile automatically; or set them manually."
        ] }),
        /* @__PURE__ */ u4("pre", { style: preStyle, children: `# macOS / Linux \u2014 add to ~/.zshrc or ~/.bashrc, then: source ~/.zshrc
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true

# Windows \u2014 run once in PowerShell (persists across sessions):
[System.Environment]::SetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318", "User")
[System.Environment]::SetEnvironmentVariable("OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT", "true", "User")` })
      ] }) : /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("p", { style: mutedP, children: [
          "Add to VS Code ",
          /* @__PURE__ */ u4("strong", { children: "User Settings" }),
          " (",
          /* @__PURE__ */ u4("kbd", { style: kbdStyle, children: "Cmd+Shift+P" }),
          " / ",
          /* @__PURE__ */ u4("kbd", { style: kbdStyle, children: "Ctrl+Shift+P" }),
          " \u2192 ",
          /* @__PURE__ */ u4("em", { children: "Preferences: Open User Settings (JSON)" }),
          "):"
        ] }),
        /* @__PURE__ */ u4("pre", { style: preStyle, children: `{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "otlp-http",
  "github.copilot.chat.otel.otlpEndpoint": "http://localhost:4318"
}` })
      ] })
    ] });
    const claudeSection = /* @__PURE__ */ u4("div", { style: "margin-bottom:20px", children: [
      /* @__PURE__ */ u4("h4", { style: h4Style, children: "Claude Code" }),
      /* @__PURE__ */ u4("p", { style: mutedP, children: [
        "The CLI and VS Code extension both read the same file. Add to the ",
        /* @__PURE__ */ u4("code", { style: codeStyle, children: '"env"' }),
        " block:"
      ] }),
      pathNote("~/.claude/settings.json", "%USERPROFILE%\\.claude\\settings.json"),
      /* @__PURE__ */ u4("pre", { style: preStyle, children: `{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4318",
    "OTEL_LOG_TOOL_DETAILS": "1",
    "OTEL_LOG_TOOL_CONTENT": "1",
    "OTEL_LOG_USER_PROMPTS": "1"
  }
}` }),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin-top:6px;line-height:1.6", children: [
        /* @__PURE__ */ u4("strong", { children: "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1" }),
        " enables span-level tracing \u2014 without it ",
        /* @__PURE__ */ u4("a", { href: "#gl-turn", children: "turns" }),
        " and ",
        /* @__PURE__ */ u4("a", { href: "#gl-llm-call", children: "LLM calls" }),
        " are indistinguishable and cache token breakdowns are unavailable.",
        " ",
        "The three ",
        /* @__PURE__ */ u4("strong", { children: "OTEL_LOG_*" }),
        " vars unlock tool details, file diff content (needed for the Files tab), and your typed prompt."
      ] })
    ] });
    const codexSection = /* @__PURE__ */ u4("div", { style: "margin-bottom:4px", children: [
      /* @__PURE__ */ u4("h4", { style: h4Style, children: "Codex" }),
      /* @__PURE__ */ u4("p", { style: mutedP, children: [
        "The CLI and VS Code extension both read the same file. Add an ",
        /* @__PURE__ */ u4("code", { style: codeStyle, children: "[otel]" }),
        " section:"
      ] }),
      pathNote("~/.codex/config.toml", "%USERPROFILE%\\.codex\\config.toml"),
      /* @__PURE__ */ u4("pre", { style: preStyle, children: `[otel]
log_user_prompt = true
exporter = { otlp-http = { endpoint = "http://localhost:4318", protocol = "json" } }
trace_exporter = { otlp-http = { endpoint = "http://localhost:4318", protocol = "json" } }` }),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin-top:6px;line-height:1.6", children: [
        /* @__PURE__ */ u4("strong", { children: "log_user_prompt=true" }),
        " includes your typed prompt; without it sessions show ",
        /* @__PURE__ */ u4("code", { style: codeStyle, children: "[session in progress]" }),
        ".",
        " ",
        /* @__PURE__ */ u4("code", { style: codeStyle, children: "exporter" }),
        " sends log events; ",
        /* @__PURE__ */ u4("code", { style: codeStyle, children: "trace_exporter" }),
        " sends ",
        /* @__PURE__ */ u4("a", { href: "#gl-span", children: "trace spans" }),
        ". Both point at the same endpoint."
      ] })
    ] });
    const manualHeading = /* @__PURE__ */ u4("h4", { style: "font-size:13px;font-weight:600;margin:20px 0 6px;padding-bottom:5px;border-bottom:1px solid var(--border);color:var(--fg)", children: "Manual Configuration" });
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-config", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.config.heading }),
      callout,
      manualHeading,
      portNote,
      copilotSection,
      claudeSection,
      codexSection
    ] });
  }
  function AgentOtelSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-otel", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.otel.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: [
          "AgentLens normalizes three different ",
          /* @__PURE__ */ u4("a", { href: "#gl-otlp", children: "OTEL" }),
          " shapes into one dashboard model. The shared model is a prompt-to-response ",
          /* @__PURE__ */ u4("a", { href: "#gl-session", children: "session" }),
          " with ",
          /* @__PURE__ */ u4("a", { href: "#gl-turn", children: "LLM turns" }),
          ", ",
          /* @__PURE__ */ u4("a", { href: "#gl-tool-call", children: "tool calls" }),
          ", ",
          /* @__PURE__ */ u4("a", { href: "#gl-tokens", children: "token" }),
          " usage, timing, errors, and files, but the raw data arrives differently for each agent."
        ] }),
        /* @__PURE__ */ u4("div", { class: "glossary", children: AGENT_OTEL_SHAPES.map((row) => /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:6px", children: [
          /* @__PURE__ */ u4("dt", { class: "glossary-term", children: row.agent }),
          /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: [
            /* @__PURE__ */ u4("p", { style: "margin:0 0 6px", children: [
              /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Format: " }),
              /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: row.format } })
            ] }),
            /* @__PURE__ */ u4("p", { style: "margin:0 0 6px", children: [
              /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "What's included: " }),
              /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: row.coverage } })
            ] }),
            /* @__PURE__ */ u4("p", { style: "margin:0", children: [
              /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Gaps: " }),
              /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: row.gaps } })
            ] })
          ] })
        ] })) }),
        /* @__PURE__ */ u4("p", { style: "margin-top:14px;font-size:12px;color:var(--muted)", children: "The practical effect: Traces and Timeline stay closest to the raw OTEL structure, while Efficiency, Insights, Alerts, Automation, Agents, and Flow use the normalized session model so the three agents can be compared side by side." })
      ] })
    ] });
  }
  function SessionsSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-sessions", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.sessions.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: "The Sessions tab shows all recorded sessions as a sortable table \u2014 timestamp, prompt, model, tokens, duration, and estimated cost per row. Use the filter bar to search by text, filter by agent, data source (OTEL / Log), or initiator (User / Agent / API), set a time range, or cap the number of rows shown. The Reset button clears all active filters back to defaults." }),
        /* @__PURE__ */ u4("p", { children: "Click any row to expand it in-place. Five sub-tabs appear beneath the row:" }),
        /* @__PURE__ */ u4("h4", { style: subHeadStyle, children: "Sub-tabs" }),
        /* @__PURE__ */ u4("div", { class: "glossary", style: "margin-bottom:20px", children: [
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Overview" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: [
              "Stat tiles \u2014 total tokens, estimated cost, duration, turn count, error count, and cache hit rate. A burn rate card shows tokens per minute for the session. Below the tiles is the ",
              /* @__PURE__ */ u4("strong", { children: "Insights panel" }),
              ", which surfaces efficiency signals and loop detection results for that session (see ",
              /* @__PURE__ */ u4("a", { href: "#help-insights", children: "Insights" }),
              " and ",
              /* @__PURE__ */ u4("a", { href: "#help-loops", children: "Loop Detection" }),
              " below)."
            ] })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Trace" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: [
              "Full waterfall of every ",
              /* @__PURE__ */ u4("a", { href: "#gl-llm-call", children: "LLM call" }),
              " and ",
              /* @__PURE__ */ u4("a", { href: "#gl-tool-call", children: "tool call" }),
              " in the session, displayed as horizontal timing bars with nesting depth. Expand any span row to see arguments, results, token counts, and estimated cost per call. The badge on the tab label shows the total span count."
            ] })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Flow" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "A turn-to-tool semantic graph showing how the agent moved through the session \u2014 which LLM turns triggered which tools, and in what order. Useful for spotting repeated tool calls or unusual branching. The badge shows the total node count." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Tools" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "A donut chart of tool call distribution for the session \u2014 how many times each tool was invoked, expressed as a percentage of all tool calls. The badge shows the total tool call count." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Files" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Every file created or modified during the session, grouped by path. Click any file to open a diff in the editor. The badge shows the number of unique files touched." })
          ] })
        ] }),
        /* @__PURE__ */ u4("h4", { id: "help-insights", style: subHeadStyle, children: "Insights" }),
        /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin:0 0 12px", children: [
          "The Insights panel appears inside the ",
          /* @__PURE__ */ u4("strong", { children: "Overview" }),
          " sub-tab of each expanded session row. It surfaces efficiency signals for ",
          /* @__PURE__ */ u4("a", { href: "#gl-tokens", children: "token" }),
          " waste, ",
          /* @__PURE__ */ u4("a", { href: "#gl-cache-hit-rate", children: "cache" }),
          " patterns, tool behavior, and prompt shape \u2014 the signals meant to help you spend fewer ",
          /* @__PURE__ */ u4("a", { href: "#gl-turn", children: "turns" }),
          " and fewer tokens on the same work."
        ] }),
        /* @__PURE__ */ u4("div", { class: "glossary", children: [
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-context-bloat",
              title: "Context Bloat",
              why: "Every LLM turn receives the full conversation so far. When tool results are large \u2014 full file reads, wide search outputs \u2014 the context balloons quickly. Instruction files that repeat the same guidance across turns are another common cause.",
              steps: `<li>Run <code style="${codeStyle}">wc -c ~/.claude/CLAUDE.md</code> to measure instruction file size. Target under 4 KB.</li><li>Remove verbose examples from instruction files.</li><li>Replace broad <code style="${codeStyle}">read_file</code> calls with line-ranged reads.</li><li>Add to your prompt: "Only include relevant excerpts in your reasoning."</li>`,
              impact: "Reducing context size by 30% typically halves cost per session and cuts TTFT by 15\u201325%."
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-files-repeated",
              title: "Files Read Multiple Times",
              why: "Agents re-read files when processing tasks in chunks, when the file path appears ambiguously in context, or when a previous read was so broad the model lost the relevant section.",
              steps: `<li>Explicitly name key files upfront in your prompt.</li><li>Specify which file contains what: <em>"The schema is in db/schema.sql lines 1-40"</em>.</li><li>Ask for a "read plan" before execution.</li><li>If a file is read 4+ times, paste the relevant lines directly into your prompt.</li>`,
              impact: "Eliminating repeated reads of a 500-line file saves 2,000\u20135,000 input tokens per extra read."
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-high-turns",
              title: "High Turn Count",
              why: `High turn counts happen when the agent discovers information iteratively. The prompt describes the <em>goal</em> but not the <em>location</em>; the task has implicit sub-tasks; or success criteria were not specified.`,
              steps: `<li>Add explicit file paths and line numbers.</li><li>Define explicit stopping conditions.</li><li>Break multi-step tasks into separate prompts.</li><li>Review the Timeline tab: if &gt;50% of turns are reads, add more upfront context.</li>`,
              impact: "Going from 12 turns to 5 reduces cost by 40\u201360% and cuts wall-clock time proportionally."
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-large-context",
              title: "Large Starting Context",
              why: "If your instruction files (CLAUDE.md, .agent.md, copilot-instructions.md) are large, every session starts expensive. Common culprits: long examples, full API docs pasted inline, duplicate instructions.",
              steps: `<li>Audit instruction files \u2014 look for sections longer than 20 lines.</li><li>Move reference material into separate docs the agent can read on demand.</li><li>Check for duplicate instruction sources across file levels.</li><li>Target a meaningful reduction in combined static instructions \u2014 even halving them cuts baseline cost per call.</li>`,
              impact: `Trimming 10,000 tokens from starting context saves those tokens on <em>every</em> LLM call. For a 10-turn session, that is 100,000 tokens recovered.`
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-duplicate-searches",
              title: "Duplicate Searches",
              why: "Agents repeat searches when results were too broad, when the model forgot a search was already run, or when handling multiple similar operations.",
              steps: `<li>Add directory scope: <em>"Search only in src/components/"</em>.</li><li>Provide the file name if you know it.</li><li>Use exact function/class names for symbol searches.</li><li>Add: <em>"Do not repeat a search you have already run."</em></li>`,
              impact: "Each eliminated search removes one tool call and ~5KB from context."
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-tool-failures",
              title: "Tool Failures",
              why: "Tool failures come from: (1) guessed file paths that don't exist, (2) unavailable commands, or (3) hallucinated APIs. Each failure adds error text to context.",
              steps: `<li>Provide exact file paths in your prompt.</li><li>Tell the agent which package manager and runtime are available.</li><li>Verify files exist before prompting.</li>`,
              impact: "Each eliminated failure saves one full LLM recovery turn \u2014 roughly 30,000 wasted tokens per failure cascade."
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-large-results",
              title: "Large Tool Results",
              why: "When the agent reads entire large files or runs broad searches, results are appended to context in full. A 50KB file adds ~12,500 tokens to every subsequent call.",
              steps: `<li>Use line-range reads: <em>"Read src/app.ts lines 1-80"</em>.</li><li>Provide tighter search patterns.</li><li>Pipe command output to head or limit lines.</li><li>Split large reads into separate steps.</li>`,
              impact: "Replacing a 300-line read with a 30-line read saves 2,700 tokens per turn."
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-tool-overhead",
              title: "Tool Definition Overhead",
              why: "Every LLM call includes the full JSON schema for every available tool. With 70+ tools, this overhead reaches 8,000\u201315,000 tokens per call.",
              steps: `<li>Create a task-specific <code style="${codeStyle}">.agent.md</code> with only needed tools.</li><li>Disable unused tools for specific task types.</li><li>Check your agent's documentation for tool restriction syntax.</li>`,
              impact: "Reducing from 70 to 10 tools saves ~10,000 tokens per LLM call."
            }
          ),
          /* @__PURE__ */ u4(
            InsightBlock,
            {
              id: "help-cache-rate",
              title: "Low Cache Hit Rate",
              why: "Prompt caching stores the stable prefix on the model server. The cache breaks when the prefix changes between calls \u2014 timestamps, reordered instructions, or modified instruction files.",
              steps: `<li>Keep static content at the <em>top</em> of prompts, identical across calls.</li><li>Avoid timestamps or counters in instruction files.</li><li>Cache rate will be low after editing instruction files until re-cached.</li><li>Ensure system prompt templates are not dynamically generated.</li>`,
              impact: `Going from 0% to 60% cache hit rate reduces effective cost by 80\u201390%. TTFT also drops significantly.`
            }
          )
        ] }),
        /* @__PURE__ */ u4("h4", { id: "help-loops", style: subHeadStyle, children: "Loop Detection" }),
        /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin:0 0 12px", children: [
          /* @__PURE__ */ u4("a", { href: "#gl-loop-signal", children: "Loop signals" }),
          " are behavioral patterns indicating the ",
          /* @__PURE__ */ u4("a", { href: "#gl-agent", children: "agent" }),
          " is stuck, oscillating, or spiraling into unproductive work. They appear in the Insights panel with warning or critical severity."
        ] }),
        /* @__PURE__ */ u4("div", { class: "glossary", children: [
          /* @__PURE__ */ u4(
            LoopBlock,
            {
              id: "help-tool-deadlock",
              title: "Tool Call Deadlock",
              why: "The same tool call \u2014 identical name and arguments \u2014 was executed 5+ times. The agent is not retaining the result, likely lost in a long context.",
              example: `The agent ran <code style="font-size:10px;background:var(--panel-bg);padding:1px 3px;border-radius:2px">read_file src/types.ts</code> eight times in one session.`,
              steps: `<li>Add: <em>"After reading a file, do not read it again unless you have modified it."</em></li><li>Scope the task so fewer files are needed.</li><li>Pin non-deterministic commands to fixed output.</li><li>Stop the session and restart with what was already read.</li>`,
              impact: "Stopping this pattern prevents runaway token accumulation. 200K tokens looping \u2192 20K tokens with a direct prompt."
            }
          ),
          /* @__PURE__ */ u4(
            LoopBlock,
            {
              id: "help-state-spiral",
              title: "State Corruption Spiral",
              why: "A file was edited (A\u2192B) then reverted (B\u2192A). The agent oscillates because two constraints are mutually exclusive.",
              example: "The agent added a null check (fixing one test), removed it (breaking another), then added it back \u2014 cycling.",
              steps: `<li>Clarify success criteria with explicit priority ordering.</li><li>Provide the exact final file state if possible.</li><li>Check if tests assert contradictory behavior.</li><li>Use the Files tab to spot A\u2192B\u2192A patterns.</li>`,
              impact: "Resolving the conflict takes 2\u20133 focused turns vs. 20\u201340 oscillating turns."
            }
          ),
          /* @__PURE__ */ u4(
            LoopBlock,
            {
              id: "help-hallucination",
              title: "Hallucination Amplification Loop",
              why: "The same error appeared 3+ times. The agent's fix attempts fail because the root cause is something the model invented \u2014 a nonexistent package, wrong function name, or outdated API.",
              example: `A <code style="font-size:10px;background:var(--panel-bg);padding:1px 3px;border-radius:2px">ModuleNotFoundError</code> appeared five times as the agent tried different import paths for a package not installed.`,
              steps: `<li>Stop and verify the root cause yourself.</li><li>Tell the agent explicitly what exists.</li><li>Paste actual API responses or function signatures.</li><li>After 2 failures, resolve the underlying issue before re-prompting.</li>`,
              impact: "Intervening after 2 recurrences instead of 6 saves ~120,000 tokens in a 30K-token session."
            }
          ),
          /* @__PURE__ */ u4(
            LoopBlock,
            {
              id: "help-runaway-steps",
              title: "Ambiguous Success / Escalating Scope",
              why: "The session consumed far more LLM calls than expected. The prompt has no stopping condition, uses open-ended phrasing, or the agent expands scope on its own.",
              example: `"Fix the login bug" accumulated 90+ steps \u2014 the agent then noticed unrelated issues and updated 3 extra files.`,
              steps: `<li>Add explicit stopping conditions.</li><li>Avoid open-ended phrasing \u2014 name specific functions and files.</li><li>Specify scope: <em>"Only change files in src/auth/"</em>.</li><li>Monitor the context growth chart for steep rises.</li>`,
              impact: "A 5-step prompt vs. a 90-step session saves 85 tool calls \u2014 a 5\u201320x token reduction."
            }
          ),
          /* @__PURE__ */ u4(
            LoopBlock,
            {
              id: "help-context-accumulation",
              title: "Infinite Loop \u2014 Context Accumulation",
              why: `<a href="#gl-input-tokens">Input tokens</a> grew by 30,000+ across 4+ calls while <a href="#gl-output-ratio">output-to-input ratio</a> collapsed by 70%+. The agent is consuming context while producing less output.`,
              example: "First call: 8K in \u2192 600 out (7.5%). Last call: 65K in \u2192 80 out (0.12%). Five turns reading the same files without edits.",
              steps: `<li>Stop immediately \u2014 cost compounds with no progress.</li><li>Start fresh with a focused prompt stating what was already read.</li><li>Include the specific target state, not just the problem.</li><li>Use the Traces tab to review what was accomplished.</li>`,
              impact: "Catching at 4 calls instead of 10 saves ~390,000 input tokens at peak context size."
            }
          )
        ] }),
        /* @__PURE__ */ u4("p", { style: "margin-top:16px;font-size:12px;color:var(--muted)", children: [
          "Loop signals appear in the Insights panel inside the ",
          /* @__PURE__ */ u4("strong", { children: "Overview" }),
          " sub-tab of each session, sorted by severity. Use the ",
          /* @__PURE__ */ u4("strong", { children: "Loops" }),
          " filter pill to view only malfunction signals. Use ",
          /* @__PURE__ */ u4("strong", { children: "Ignore" }),
          " to dismiss a signal if it was intentional behavior."
        ] })
      ] })
    ] });
  }
  function AnalyticsSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-analytics", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.analytics.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: "The Analytics tab shows aggregate charts and metrics across all sessions in the active time range. Use the Source filter to limit to OTEL-traced sessions or log-ingested sessions, and the time range picker to zoom into a specific window. The Reset button restores all filters to defaults." }),
        /* @__PURE__ */ u4("div", { class: "glossary", children: [
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Agent Breakdown" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "One card per agent showing total input tokens, output tokens, cache hit rate, estimated cost, and top tools used \u2014 all scoped to the active time range and source filter." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Estimated Cost" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: [
              "A bar chart of daily spend with a green total-per-day overlay line and inline date labels at day boundaries. Below the chart: a day-grouped cost table (date \u2192 agent \u2192 model) and a model breakdown table. The ",
              /* @__PURE__ */ u4("strong", { children: "\u2193 CSV" }),
              " button exports the cost data."
            ] })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Token Usage Per Session" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Slim horizontal bars, one per session, ordered oldest to newest. Each bar is colored by agent. Useful for spotting runaway sessions at a glance." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Context Growth" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Input token accumulation across LLM turns within each session, overlaid for all sessions in the active range. A steep upward slope indicates rapid context growth; a flat line means the agent is working efficiently. Click any line to highlight that session." })
          ] })
        ] })
      ] })
    ] });
  }
  function AlertsSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-alerts", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.alerts.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: "The Alerts tab lets you configure thresholds for six signals. When a live session crosses a threshold, an alert fires and the tab badge increments. Alerts clear automatically when the session ends or you dismiss them." }),
        /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin:0 0 12px", children: "Two alerts use shared token-count thresholds; the other four use per-agent profiles so you can tune Claude Code, Copilot, and Codex independently." }),
        /* @__PURE__ */ u4("div", { class: "glossary", children: [
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:2px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: [
              "Context Window Filling Up ",
              /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:400;color:var(--muted)", children: "(warning)" })
            ] }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when peak input tokens for a session reaches the per-agent threshold. Defaults: Claude Code 170K, Copilot 108K, Codex 340K. Adjust per agent or raise the shared baseline." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:2px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: [
              "Too Many Turns Per Session ",
              /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:400;color:var(--muted)", children: "(warning)" })
            ] }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when the LLM turn count reaches the per-agent threshold. High turn counts often indicate scope creep or a task that should be split. Default: 200 turns (adjustable per agent)." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:2px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: [
              "Error Spike ",
              /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:400;color:var(--muted)", children: "(error)" })
            ] }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when the error count in a session reaches the per-agent threshold. A spike usually means the agent is stuck in a failure loop. Default: 5 errors (adjustable per agent)." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:2px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: [
              "Long Active Session ",
              /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:400;color:var(--muted)", children: "(info)" })
            ] }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when active LLM/tool compute time exceeds the per-agent threshold. Idle time (waiting for you to respond) does not count. Default: 60 minutes (adjustable per agent)." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:2px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: [
              "Zero Cache Utilization ",
              /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:400;color:var(--muted)", children: "(info)" })
            ] }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when a session above the token gate has 0% cache hit rate. A large uncached session is paying full price for every token. The gate prevents noise from small sessions. Default gate: 30K tokens (shared, adjustable)." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:2px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: [
              "Identical Tool Repeat ",
              /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:400;color:var(--muted)", children: "(warning)" })
            ] }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when the same tool with identical arguments repeats beyond the per-agent threshold without a file change between repeats \u2014 a strong deadlock signal. Default: 5 repeats (adjustable per agent)." })
          ] })
        ] })
      ] })
    ] });
  }
  function AutomationSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-automation", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.automation.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: "The Automation tab configures prompts that are sent automatically to the agent when a session crosses a threshold \u2014 without you having to intervene manually. Each automation can be enabled per-agent with independent thresholds for Claude Code, Copilot, and Codex." }),
        /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin:0 0 12px", children: "In the VS Code extension, automations surface as a notification or open the agent chat directly. In local (npx) mode, they write the prompt to a file-based relay that the agent reads." }),
        /* @__PURE__ */ u4("div", { class: "glossary", children: [
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Context Dump" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when a session's peak input tokens reaches the configured threshold. Sends a prompt asking the agent to summarize its context and compact before continuing. Helps avoid context-window overflows and keeps token cost in check. Default: 140K tokens." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Loop Breaker" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when the same tool with identical arguments repeats beyond the threshold without a file change between repeats. Sends a prompt instructing the agent to stop and choose a different approach. A hard-stop backstop fires at 8 repeats regardless of configuration. Default: 3 repeats." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Turn Limit Wrap-up" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Fires when a session reaches the agent-specific turn threshold. Sends a prompt asking the agent to summarize progress, merge check-in details, and work toward a clean stopping point before hitting the model's hard turn limit. Default: 120 turns." })
          ] })
        ] })
      ] })
    ] });
  }
  function ExportSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-export", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.export.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: "The Export tab lets you download all recorded sessions as a JSON file. Exports draw from the full session history in the database, not just the active time-range window." }),
        /* @__PURE__ */ u4("div", { class: "glossary", children: [
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Full export" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Includes all session data \u2014 prompt text, tool arguments, tool results, and file diff content. Use this for personal analysis or sharing with yourself across machines." })
          ] }),
          /* @__PURE__ */ u4("div", { class: "glossary-item", style: "flex-direction:column;gap:4px", children: [
            /* @__PURE__ */ u4("dt", { class: "glossary-term", children: "Redacted export" }),
            /* @__PURE__ */ u4("dd", { class: "glossary-def", style: "display:block", children: "Prompt text is removed; all other fields (tokens, cost, timing, tool names, file paths, span structure) are retained. Use this when sharing data for debugging or support without exposing conversation content." })
          ] })
        ] }),
        /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin-top:12px", children: "Raw OTEL span export for session replay is planned but not yet available." })
      ] })
    ] });
  }
  function BadgesSection() {
    const badgeStyle = "font-size:9px;font-weight:600;padding:1px 5px;border-radius:2px;border:1px solid;letter-spacing:0.03em;vertical-align:middle;display:inline-block;margin-right:6px";
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-badges", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.badges.heading }),
      /* @__PURE__ */ u4("p", { style: "font-size:12px;color:var(--muted);margin:0 0 12px", children: "Each session row shows up to two small badges indicating where the data came from and who initiated the session." }),
      /* @__PURE__ */ u4("h4", { style: "font-size:11px;font-weight:600;color:var(--fg);margin:0 0 8px", children: "Data source" }),
      /* @__PURE__ */ u4("div", { class: "glossary", style: "margin-bottom:16px", children: [
        /* @__PURE__ */ u4("div", { class: "glossary-item", children: [
          /* @__PURE__ */ u4("dt", { class: "glossary-term", style: "min-width:0", children: /* @__PURE__ */ u4("span", { style: `${badgeStyle}color:#ffffff;border-color:#ffffff`, children: "OTEL" }) }),
          /* @__PURE__ */ u4("dd", { class: "glossary-def", children: "Full OpenTelemetry telemetry \u2014 timing, TTFT, span waterfall, loop signals. Requires the agent to be configured to export traces to AgentLens." })
        ] }),
        /* @__PURE__ */ u4("div", { class: "glossary-item", children: [
          /* @__PURE__ */ u4("dt", { class: "glossary-term", style: "min-width:0", children: /* @__PURE__ */ u4("span", { style: `${badgeStyle}color:#90a4ae;border-color:#90a4ae`, children: "Log" }) }),
          /* @__PURE__ */ u4("dd", { class: "glossary-def", children: "Parsed from local conversation log files (~/.claude/projects, ~/.codex/sessions, etc.) \u2014 tokens, tool calls, and messages are available, but timing and TTFT are not. No agent configuration needed." })
        ] })
      ] }),
      /* @__PURE__ */ u4("h4", { style: "font-size:11px;font-weight:600;color:var(--fg);margin:0 0 8px", children: "Initiator" }),
      /* @__PURE__ */ u4("div", { class: "glossary", style: "margin-bottom:8px", children: [
        /* @__PURE__ */ u4("div", { class: "glossary-item", children: [
          /* @__PURE__ */ u4("dt", { class: "glossary-term", style: "min-width:0", children: /* @__PURE__ */ u4("span", { style: `${badgeStyle}color:#4a90d9;border-color:#4a90d9`, children: "User" }) }),
          /* @__PURE__ */ u4("dd", { class: "glossary-def", children: "A human typed this prompt directly in the chat. The baseline case \u2014 most of your interactive sessions will carry this badge." })
        ] }),
        /* @__PURE__ */ u4("div", { class: "glossary-item", children: [
          /* @__PURE__ */ u4("dt", { class: "glossary-term", style: "min-width:0", children: /* @__PURE__ */ u4("span", { style: `${badgeStyle}color:#b0bec5;border-color:#b0bec5`, children: "Agent" }) }),
          /* @__PURE__ */ u4("dd", { class: "glossary-def", children: [
            "Spawned by the Agent tool (",
            /* @__PURE__ */ u4("code", { children: "isSidechain: true" }),
            " in the log). Claude delegated a sub-task to another Claude instance \u2014 common when using the Agent SDK or the FleetView multi-agent runner. The prompt was written by the model, not a human."
          ] })
        ] }),
        /* @__PURE__ */ u4("div", { class: "glossary-item", children: [
          /* @__PURE__ */ u4("dt", { class: "glossary-term", style: "min-width:0", children: /* @__PURE__ */ u4("span", { style: `${badgeStyle}color:#90a4ae;border-color:#90a4ae`, children: "API" }) }),
          /* @__PURE__ */ u4("dd", { class: "glossary-def", children: [
            "Started non-interactively via ",
            /* @__PURE__ */ u4("code", { children: "claude -p" }),
            " (pipeline mode). Comes from a script, CI job, or shell automation \u2014 human-authored but not a live conversation. Identified by the ",
            /* @__PURE__ */ u4("code", { children: "<local-command-caveat>" }),
            " prefix Claude Code prepends to the prompt."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin:0", children: [
        "Use the ",
        /* @__PURE__ */ u4("strong", { children: "From" }),
        " filter pills in the Sessions tab to show only user, agent, or api sessions."
      ] })
    ] });
  }
  function GlossarySection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-glossary", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.glossary.heading }),
      /* @__PURE__ */ u4("div", { class: "glossary", children: TERMS.map(([term, def]) => /* @__PURE__ */ u4("div", { class: "glossary-item", id: "gl-" + term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""), style: "scroll-margin-top:44px", children: [
        /* @__PURE__ */ u4("dt", { class: "glossary-term", children: term }),
        /* @__PURE__ */ u4("dd", { class: "glossary-def", children: def })
      ] })) })
    ] });
  }
  function Help() {
    return /* @__PURE__ */ u4("div", { id: "help-content", children: [
      /* @__PURE__ */ u4(Toc, {}),
      /* @__PURE__ */ u4(OverviewSection, {}),
      /* @__PURE__ */ u4(ConfigSection, {}),
      /* @__PURE__ */ u4(AgentOtelSection, {}),
      /* @__PURE__ */ u4(SessionsSection, {}),
      /* @__PURE__ */ u4(AnalyticsSection, {}),
      /* @__PURE__ */ u4(AlertsSection, {}),
      /* @__PURE__ */ u4(AutomationSection, {}),
      /* @__PURE__ */ u4(ExportSection, {}),
      /* @__PURE__ */ u4(BadgesSection, {}),
      /* @__PURE__ */ u4(GlossarySection, {}),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin-top:24px;padding-top:12px;border-top:1px solid var(--border);line-height:1.6", children: [
        /* @__PURE__ */ u4("strong", { children: "Disclaimer:" }),
        " AgentLens is an independent open-source project and is not affiliated with, endorsed by, or associated with GitHub, Inc. or Microsoft Corporation (GitHub Copilot); Anthropic, PBC (Claude / Claude Code); or OpenAI, LLC (Codex / Codex CLI). All product names, trademarks, and registered trademarks are the property of their respective owners. AgentLens interacts with these products solely through their publicly documented OpenTelemetry telemetry interfaces."
      ] })
    ] });
  }

  // media/src/tabs/Automation.tsx
  var HARD_STOP_IDENTICAL_TOOL_REPEATS = 8;
  var HARD_STOP_CONSECUTIVE_ERRORS = 8;
  var DEFAULT_AUTOMATION_CONFIGS = [
    {
      id: "context_compaction",
      label: "Context Compaction",
      severity: "warning",
      description: "When a session reaches the configured peak input-token threshold for that agent, prompt the agent to summarize and compact its context.",
      enabled: false,
      writePromptsFile: false,
      threshold: 14e4,
      unit: "tokens",
      min: 1e4,
      max: 1e6,
      step: 1e3,
      agentThresholds: { claude_code: 14e4, copilot: 89600, codex: 28e4 }
    },
    {
      id: "loop_break",
      label: "Loop Breaker",
      severity: "critical",
      description: "When the same tool with identical arguments repeats beyond the agent-specific threshold without file changes between repeats, prompt the agent to stop and choose a different approach. A hard-stop backstop fires at 8 repeats.",
      enabled: false,
      writePromptsFile: false,
      threshold: 3,
      unit: "agent profile",
      min: 3,
      max: 8,
      step: 1
    },
    {
      id: "error_cascade",
      label: "Error Cascade Stop",
      severity: "critical",
      description: "When a session hits its agent-specific consecutive-error streak, prompt the agent to stop, diagnose the root cause, and change strategy. A hard-stop backstop fires at 8 consecutive errors.",
      enabled: false,
      writePromptsFile: false,
      threshold: 3,
      unit: "agent profile",
      min: 2,
      max: 8,
      step: 1
    },
    {
      id: "high_turns",
      label: "Turn Limit Wrap-up",
      severity: "warning",
      description: "When a session reaches its agent-specific turn threshold, prompt the agent to summarize progress, merge check-in details, and work toward a stopping point.",
      enabled: false,
      writePromptsFile: false,
      threshold: 120,
      unit: "agent profile",
      min: 20,
      max: 300,
      step: 10
    }
  ];
  function cloneAgentThresholds2(thresholds) {
    if (!thresholds) return void 0;
    return {
      claude_code: thresholds.claude_code,
      copilot: thresholds.copilot,
      codex: thresholds.codex
    };
  }
  function cloneAutomationConfig(config) {
    return {
      ...config,
      agentThresholds: cloneAgentThresholds2(config.agentThresholds)
    };
  }
  function fallbackAgentThresholds2(threshold) {
    return {
      claude_code: threshold,
      copilot: threshold,
      codex: threshold
    };
  }
  function normalizeAgentThresholds2(def, saved) {
    const thresholds = cloneAgentThresholds2(def.agentThresholds);
    if (!thresholds) return void 0;
    const legacyThreshold = Number(saved?.threshold);
    if (!saved?.agentThresholds && Number.isFinite(legacyThreshold) && legacyThreshold >= def.min && legacyThreshold <= def.max) {
      for (const source of AGENT_ORDER) {
        thresholds[source] = legacyThreshold;
      }
    }
    for (const source of AGENT_ORDER) {
      const value = Number(saved?.agentThresholds?.[source]);
      if (Number.isFinite(value) && value >= def.min && value <= def.max) {
        thresholds[source] = value;
      }
    }
    return thresholds;
  }
  function getConfigAgentThresholds2(cfg) {
    return cloneAgentThresholds2(cfg.agentThresholds) ?? fallbackAgentThresholds2(cfg.threshold);
  }
  function getAutomationAgentThreshold(cfg, source) {
    return cfg.agentThresholds?.[source] ?? cfg.threshold;
  }
  function getAutomationConfigs() {
    try {
      const stored = localStorage.getItem("agentLens.automationConfigs");
      if (!stored) return DEFAULT_AUTOMATION_CONFIGS.map(cloneAutomationConfig);
      const saved = JSON.parse(stored);
      return DEFAULT_AUTOMATION_CONFIGS.map((def) => {
        const s4 = saved.find((x4) => x4.id === def.id);
        if (!s4) return cloneAutomationConfig(def);
        const savedThreshold = Number(s4.threshold);
        const threshold = savedThreshold >= def.min && savedThreshold <= def.max ? savedThreshold : def.threshold;
        return {
          ...cloneAutomationConfig(def),
          enabled: typeof s4.enabled === "boolean" ? s4.enabled : def.enabled,
          writePromptsFile: typeof s4.writePromptsFile === "boolean" ? s4.writePromptsFile : def.writePromptsFile,
          threshold,
          agentThresholds: normalizeAgentThresholds2(def, s4)
        };
      });
    } catch {
      return DEFAULT_AUTOMATION_CONFIGS.map(cloneAutomationConfig);
    }
  }
  function saveAutomationConfigs(configs) {
    try {
      localStorage.setItem(
        "agentLens.automationConfigs",
        JSON.stringify(configs.map((c4) => ({
          id: c4.id,
          enabled: c4.enabled,
          writePromptsFile: c4.writePromptsFile,
          threshold: c4.threshold,
          agentThresholds: c4.agentThresholds
        })))
      );
    } catch {
    }
  }
  function hasSharedThreshold2(cfg) {
    return cfg.id === "context_compaction";
  }
  function automationProfileMetrics(cfg) {
    switch (cfg.id) {
      case "high_turns":
        return ["turnNudge"];
      case "loop_break":
        return ["identicalRepeatNudge"];
      case "error_cascade":
        return ["consecutiveErrorNudge"];
      default:
        return [];
    }
  }
  function buildPrompt(id, session, _cfg, evaluation, profiles) {
    const evidenceBlock = `Triggering evidence:
- Session: ${sessionDisplayName(session)}
- Signal: ${evaluation.evidence}
- Threshold: ${evaluation.threshold.toLocaleString()} ${evaluation.unit}
`;
    switch (id) {
      case "context_compaction": {
        const usage = getPeakContextUsage(session, profiles);
        return `${evidenceBlock}
Your conversation context is large \u2014 peak input is ${usage.peakTokens.toLocaleString()} tokens, crossing the ${evaluation.threshold.toLocaleString()}-token threshold configured for this agent.

Please do the following right now:
1. Write a compact summary of: key decisions made, files changed, and what still needs to be done
2. Continue the task using only this summary as working context, discarding the detailed history

This will reduce token cost and prevent context window exhaustion.`;
      }
      case "loop_break": {
        const repeat = getIdenticalToolRepeat(session);
        const repeatedAction = repeat?.display ?? "the same tool call";
        const count = repeat?.count ?? evaluation.metric;
        const hardStop = evaluation.stage === "hard_stop";
        return `${hardStop ? "HARD STOP.\n\n" : ""}${evidenceBlock}
You have repeated the identical tool call "${repeatedAction}" ${count} times in this session \u2014 this indicates a stuck loop.

Stop calling that tool with those arguments immediately and:
1. Explain what you were trying to accomplish with this tool
2. Describe why the repeated calls have not worked
3. Choose a completely different approach to reach the goal

${hardStop ? "Do not make another tool call until you have written the diagnosis and a different plan." : "If you are genuinely blocked, ask for clarification rather than retrying the same action."}`;
      }
      case "error_cascade": {
        const health = getErrorHealth(session);
        const recentErrors = health.recentErrors.map((e4) => `  - ${e4}`).join("\n");
        const hardStop = evaluation.stage === "hard_stop";
        return `${hardStop ? "HARD STOP.\n\n" : ""}${evidenceBlock}
This session has hit ${health.maxConsecutive} consecutive error(s)${recentErrors ? `:
${recentErrors}
` : ". "}
Stop attempting the current approach and:
1. Identify the root cause of these repeated failures
2. Propose a different strategy before making any more tool calls
3. If you are blocked by missing information or permissions, say so explicitly

${hardStop ? "Do not make another tool call until the root cause and new strategy are clear." : "Do not proceed until you have a clear reason to believe the next attempt will succeed."}`;
      }
      case "high_turns": {
        const turns = session.totalLlmCalls ?? 0;
        return `${evidenceBlock}
This session has made ${turns} LLM calls. Please assess where things stand:

1. Summarize what has been completed
2. List what remains to be done
3. Decide whether you can finish in a few more steps
4. If not, stop and explain what guidance or information is needed

Aim to reach a clear stopping point or completion within the next 2-3 steps.`;
      }
      default:
        return "";
    }
  }
  var firedSet = /* @__PURE__ */ new Set();
  function getInProgressSessions(sessions) {
    return sessions.filter((s4) => s4.outcome === "unknown");
  }
  function evaluateAutomation(cfg, session, profiles) {
    const profile = resolveAgentProfile(session.source, profiles);
    switch (cfg.id) {
      case "context_compaction": {
        const usage = getPeakContextUsage(session, profiles);
        const threshold = getAutomationAgentThreshold(cfg, session.source);
        return {
          triggered: usage.peakTokens >= threshold,
          stage: "nudge",
          metric: usage.peakTokens,
          threshold,
          unit: "tokens",
          evidence: "peak context " + usage.peakTokens.toLocaleString() + " tokens"
        };
      }
      case "loop_break": {
        const repeat = getIdenticalToolRepeat(session);
        const count = repeat?.count ?? 0;
        const stage = count >= HARD_STOP_IDENTICAL_TOOL_REPEATS ? "hard_stop" : "nudge";
        return {
          triggered: count >= profile.identicalRepeatNudge,
          stage,
          metric: count,
          threshold: stage === "hard_stop" ? HARD_STOP_IDENTICAL_TOOL_REPEATS : profile.identicalRepeatNudge,
          unit: "identical repeats",
          evidence: repeat ? '"' + repeat.display + '" repeated ' + count + " times without intervening file changes" : "no identical tool repeat detected"
        };
      }
      case "error_cascade": {
        const health = getErrorHealth(session);
        const stage = health.maxConsecutive >= HARD_STOP_CONSECUTIVE_ERRORS ? "hard_stop" : "nudge";
        return {
          triggered: health.maxConsecutive >= profile.consecutiveErrorNudge,
          stage,
          metric: health.maxConsecutive,
          threshold: stage === "hard_stop" ? HARD_STOP_CONSECUTIVE_ERRORS : profile.consecutiveErrorNudge,
          unit: "consecutive errors",
          evidence: health.maxConsecutive + " consecutive error(s), " + health.errorCount + " total error(s)"
        };
      }
      case "high_turns": {
        const turns = session.totalLlmCalls ?? 0;
        return {
          triggered: turns >= profile.turnNudge,
          stage: "nudge",
          metric: turns,
          threshold: profile.turnNudge,
          unit: "LLM turns",
          evidence: turns + " LLM turn(s)"
        };
      }
      default:
        return { triggered: false, stage: "nudge", metric: 0, threshold: 0, unit: "", evidence: "" };
    }
  }
  var AUTOMATION_RECENCY_MS = 12e4;
  function checkAutomations(sessions) {
    if (!sessions.length) return [];
    const configs = getAutomationConfigs();
    const profiles = getAgentProfiles();
    const triggers = [];
    const allInProgress = getInProgressSessions(sessions);
    if (!allInProgress.length) return [];
    const now = Date.now();
    const active = allInProgress.filter((s4) => {
      const lastEntry = s4.timeline && s4.timeline.length > 0 ? s4.timeline[s4.timeline.length - 1] : null;
      const lastTs = lastEntry?.timestamp ?? s4.startTime;
      if (!lastTs) return false;
      const tsNum = typeof lastTs === "number" ? lastTs : Date.parse(lastTs);
      return now - tsNum < AUTOMATION_RECENCY_MS;
    });
    const activeKeys = /* @__PURE__ */ new Set();
    const visibleSessionKeys = new Set(active.map((s4) => s4.traceId ?? s4.sessionId));
    for (const cfg of configs) {
      if (!cfg.enabled) continue;
      for (const session of active) {
        const evaluation = evaluateAutomation(cfg, session, profiles);
        if (!evaluation.triggered) continue;
        const sessionKey = session.traceId ?? session.sessionId;
        const stageThreshold = evaluation.stage === "hard_stop" ? "hard" : String(evaluation.threshold);
        const key = `${cfg.id}:${sessionKey}:${evaluation.stage}:${stageThreshold}`;
        activeKeys.add(key);
        if (!firedSet.has(key)) {
          firedSet.add(key);
          const body = buildPrompt(cfg.id, session, cfg, evaluation, profiles);
          if (!body) continue;
          triggers.push({
            automationId: cfg.id,
            label: evaluation.stage === "hard_stop" ? cfg.label + " Hard Stop" : cfg.label,
            writePromptsFile: cfg.writePromptsFile,
            agent: session.source ?? "generic",
            sessionTitle: (session.userRequest ?? "").slice(0, 70) || "(session in progress)",
            sessionId: session.sessionId,
            prompt: body
          });
        }
      }
    }
    for (const key of Array.from(firedSet)) {
      if (activeKeys.has(key)) continue;
      const firstColon = key.indexOf(":");
      const rest = key.slice(firstColon + 1);
      const secondColon = rest.indexOf(":");
      const sessionKey = rest.slice(0, secondColon);
      if (visibleSessionKeys.has(sessionKey)) {
        firedSet.delete(key);
      }
    }
    return triggers;
  }
  function Automation() {
    const sessions = displaySessions.value;
    const [configs, setConfigs] = d2(getAutomationConfigs);
    const [profiles, setProfiles] = d2(getAgentProfiles);
    function updateConfig(id, changes) {
      setConfigs((prev) => {
        const next = prev.map((c4) => c4.id === id ? { ...c4, ...changes } : c4);
        saveAutomationConfigs(next);
        return next;
      });
    }
    function updateAgentThreshold(source, metric, value) {
      const next = {
        ...profiles,
        [source]: {
          ...profiles[source],
          [metric]: value
        }
      };
      saveAgentProfiles(next);
      setProfiles(next);
    }
    function updateConfigAgentThreshold(cfg, source, value) {
      updateConfig(cfg.id, {
        agentThresholds: {
          ...getConfigAgentThresholds2(cfg),
          [source]: value
        }
      });
    }
    const enabledCount = configs.filter((c4) => c4.enabled).length;
    const _inProgressCount = getInProgressSessions(sessions).length;
    const standalone = !!window.__STANDALONE__;
    return /* @__PURE__ */ u4("div", { id: "automation-content", children: [
      /* @__PURE__ */ u4("div", { style: "font-size:11px;color:var(--muted);padding:6px 10px;margin-bottom:12px;border-left:2px solid var(--border)", children: /* @__PURE__ */ u4("strong", { children: "Settings below are adjustable per agent. Reminder: your choice of LLM model significantly affects efficiency and may require threshold adjustments." }) }),
      /* @__PURE__ */ u4("div", { style: "padding:12px 16px;margin:0 0 16px;border-radius:6px;border:1px solid var(--border);background:var(--vscode-editorWidget-background,var(--bg));font-size:12px;line-height:1.6", children: [
        /* @__PURE__ */ u4("div", { class: "section-label", style: "margin-bottom:6px", children: "How Automation Works" }),
        /* @__PURE__ */ u4("div", { style: "color:var(--muted)", children: [
          "Automations monitor in-progress agent sessions only \u2014 completed sessions are ignored.",
          standalone ? /* @__PURE__ */ u4(S, { children: [
            " When a threshold is crossed, AgentLens shows a notification with a ",
            /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Copy Prompt" }),
            " button. Enable ",
            /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Write prompts file" }),
            " to automatically write the prompt to ",
            /* @__PURE__ */ u4("code", { children: "agentlens-prompts-{agent}.md" }),
            " in the current directory instead."
          ] }) : /* @__PURE__ */ u4(S, { children: [
            " When a threshold is crossed, AgentLens shows a VS Code notification with a ",
            /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Copy Prompt" }),
            " button. Enable ",
            /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "Write prompts file" }),
            " to automatically write the prompt to ",
            /* @__PURE__ */ u4("code", { children: "agentlens-prompts-{agent}.md" }),
            " in your workspace root instead."
          ] }),
          " ",
          "All automations are ",
          /* @__PURE__ */ u4("strong", { style: "color:var(--fg)", children: "off by default" }),
          " and debounce each threshold crossing."
        ] }),
        enabledCount > 0 && /* @__PURE__ */ u4("div", { style: "margin-top:8px;color:var(--accent);font-weight:600;font-size:11px", children: [
          enabledCount,
          " automation",
          enabledCount > 1 ? "s" : "",
          " active"
        ] })
      ] }),
      configs.map((cfg) => {
        const sev = cfg.severity;
        const sevColor = sev === "critical" ? "var(--error)" : sev === "warning" ? "#f6a623" : "var(--accent)";
        const borderColor = cfg.enabled ? sevColor : "var(--border)";
        const profileMetrics = automationProfileMetrics(cfg);
        return /* @__PURE__ */ u4("div", { style: `border:1px solid ${borderColor};border-left:4px solid ${borderColor};border-radius:6px;padding:12px 14px;margin-bottom:10px`, children: [
          /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;justify-content:space-between;margin-bottom:6px", children: [
            /* @__PURE__ */ u4("div", { class: "flex-8", children: [
              /* @__PURE__ */ u4("strong", { style: "font-size:13px", children: cfg.label }),
              /* @__PURE__ */ u4("span", { style: `font-size:10px;padding:1px 6px;border-radius:3px;background:${sevColor};color:#000;font-weight:700;letter-spacing:.4px`, children: sev.toUpperCase() })
            ] }),
            /* @__PURE__ */ u4("label", { class: "toggle-switch", children: [
              /* @__PURE__ */ u4(
                "input",
                {
                  type: "checkbox",
                  checked: cfg.enabled,
                  onChange: (e4) => updateConfig(cfg.id, { enabled: e4.target.checked })
                }
              ),
              /* @__PURE__ */ u4("span", { class: "toggle-track", children: /* @__PURE__ */ u4("span", { class: "toggle-thumb" }) }),
              /* @__PURE__ */ u4("span", { class: "toggle-label" + (cfg.enabled ? " on" : ""), children: cfg.enabled ? "Enabled" : "Disabled" })
            ] })
          ] }),
          /* @__PURE__ */ u4("div", { style: "font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.5", children: cfg.description }),
          hasSharedThreshold2(cfg) ? /* @__PURE__ */ u4(
            AgentThresholdNumberInputs,
            {
              profiles,
              metricName: "Context window tokens",
              unit: "tokens",
              values: getConfigAgentThresholds2(cfg),
              min: cfg.min,
              max: cfg.max,
              onChange: (source, value) => updateConfigAgentThreshold(cfg, source, value)
            }
          ) : profileMetrics.length > 0 && /* @__PURE__ */ u4(S, { children: [
            /* @__PURE__ */ u4(
              AgentThresholdInputs,
              {
                profiles,
                metrics: profileMetrics,
                onChange: updateAgentThreshold
              }
            ),
            (cfg.id === "loop_break" || cfg.id === "error_cascade") && /* @__PURE__ */ u4("div", { style: "font-size:12px;color:var(--muted);margin:6px 0 8px", children: "Hard stop: 8 for all agents" })
          ] }),
          cfg.enabled && /* @__PURE__ */ u4("label", { class: "toggle-switch", children: [
            /* @__PURE__ */ u4(
              "input",
              {
                type: "checkbox",
                checked: cfg.writePromptsFile,
                onChange: (e4) => updateConfig(cfg.id, { writePromptsFile: e4.target.checked })
              }
            ),
            /* @__PURE__ */ u4("span", { class: "toggle-track", children: /* @__PURE__ */ u4("span", { class: "toggle-thumb" }) }),
            /* @__PURE__ */ u4("span", { class: "toggle-label" + (cfg.writePromptsFile ? " on" : ""), children: [
              /* @__PURE__ */ u4("strong", { children: "Write prompts file" }),
              " \u2014 ",
              cfg.writePromptsFile ? "writes prompt to agentlens-prompts-{agent}.md automatically when triggered" : "show a Copy Prompt notification \u2014 click to copy, then paste into your agent"
            ] })
          ] })
        ] }, cfg.id);
      }),
      /* @__PURE__ */ u4("div", { style: "margin-top:16px;padding-top:12px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px", children: [
        /* @__PURE__ */ u4("div", { style: "display:flex;gap:6px", children: [
          /* @__PURE__ */ u4(
            "button",
            {
              onClick: () => {
                const next = configs.map((c4) => ({ ...cloneAutomationConfig(c4), enabled: true }));
                saveAutomationConfigs(next);
                setConfigs(next);
              },
              style: "font-size:11px;background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer;color:var(--fg)",
              children: "Enable All"
            }
          ),
          /* @__PURE__ */ u4(
            "button",
            {
              onClick: () => {
                const next = configs.map((c4) => ({ ...cloneAutomationConfig(c4), enabled: false }));
                saveAutomationConfigs(next);
                setConfigs(next);
              },
              style: "font-size:11px;background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer;color:var(--muted)",
              children: "Disable All"
            }
          )
        ] }),
        /* @__PURE__ */ u4(
          "button",
          {
            onClick: () => {
              firedSet.clear();
              try {
                localStorage.removeItem("agentLens.automationConfigs");
              } catch {
              }
              setConfigs(DEFAULT_AUTOMATION_CONFIGS.map(cloneAutomationConfig));
            },
            style: "font-size:11px;color:var(--muted);background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer",
            children: "Reset to Defaults"
          }
        ),
        /* @__PURE__ */ u4(
          "button",
          {
            onClick: () => setProfiles(resetAgentProfiles()),
            style: "font-size:11px;color:var(--muted);background:none;border:1px solid var(--border);border-radius:3px;padding:3px 10px;cursor:pointer",
            children: "Reset Agent Thresholds"
          }
        )
      ] })
    ] });
  }

  // media/src/App.tsx
  var sidebarOpen = y3(true);
  var configOpen = y3(false);
  var bellOpen = y3(false);
  var TABS = [
    { id: "sessions", label: "Sessions", title: "Session list with expand-in-place detail \u2014 trace, files, cost, and flagged issues for each session." },
    { id: "analytics", label: "Analytics", title: "Aggregate charts and metrics: token/cost trends, agent comparison, tool distribution, and active insights." },
    { id: "export", label: "Export", title: "Export raw or redacted OTEL span data as JSON files." }
  ];
  function ActivePanel() {
    const tab = normalizeTabId(activeTab.value);
    switch (tab) {
      case "sessions":
        return /* @__PURE__ */ u4(Sessions, {});
      case "analytics":
        return /* @__PURE__ */ u4(Analytics, {});
      case "export":
        return /* @__PURE__ */ u4(Export, {});
      case "help":
        return /* @__PURE__ */ u4(Help, {});
      default:
        return null;
    }
  }
  function normalizeTabId(tab) {
    return tab;
  }
  function CollapsibleSection({ title, children }) {
    const [open, setOpen] = d2(true);
    return /* @__PURE__ */ u4("div", { style: "border-bottom:1px solid var(--border)", children: [
      /* @__PURE__ */ u4(
        "button",
        {
          onClick: () => setOpen((o4) => !o4),
          style: "display:flex;align-items:center;gap:6px;width:100%;padding:10px 14px;background:none;border:none;cursor:pointer;text-align:left;color:var(--fg)",
          children: [
            /* @__PURE__ */ u4("span", { style: `color:var(--muted);font-size:9px;display:inline-block;transition:transform 0.15s;transform:rotate(${open ? 90 : 0}deg)`, children: "\u25B6" }),
            /* @__PURE__ */ u4("span", { style: "font-size:12px;font-weight:600", children: title })
          ]
        }
      ),
      open && /* @__PURE__ */ u4("div", { style: "padding:0 14px 14px", children })
    ] });
  }
  function ConfigPanel() {
    const open = configOpen.value;
    y2(() => {
      if (!open) return;
      function onKey(e4) {
        if (e4.key === "Escape") configOpen.value = false;
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open]);
    return /* @__PURE__ */ u4(
      "div",
      {
        style: `position:fixed;top:0;right:0;bottom:0;width:min(440px,100%);background:var(--vscode-editor-background);border-left:1px solid var(--border);z-index:200;overflow-y:auto;transition:transform 0.2s ease;transform:${open ? "translateX(0)" : "translateX(100%)"};box-shadow:-4px 0 20px rgba(0,0,0,0.4)`,
        children: [
          /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--vscode-editor-background);z-index:1", children: [
            /* @__PURE__ */ u4("span", { style: "font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)", children: "Settings" }),
            /* @__PURE__ */ u4(
              "button",
              {
                onClick: () => configOpen.value = false,
                style: "background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px;padding:0 4px;line-height:1",
                title: "Close (Esc)",
                children: "\xD7"
              }
            )
          ] }),
          /* @__PURE__ */ u4(CollapsibleSection, { title: "Alerts", children: /* @__PURE__ */ u4(Alerts, {}) }),
          /* @__PURE__ */ u4(CollapsibleSection, { title: "Automation", children: /* @__PURE__ */ u4(Automation, {}) })
        ]
      }
    );
  }
  var SEV_COLOR = {
    error: "#f44747",
    warning: "#f6a623",
    info: "#4fc3f7"
  };
  var SEV_ICON = {
    error: "\u26D4",
    warning: "\u26A0",
    info: "\u2139"
  };
  function AlertStatusCard({ alerts }) {
    y2(() => {
      function onKey(e4) {
        if (e4.key === "Escape") bellOpen.value = false;
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("div", { style: "position:fixed;inset:0;z-index:199", onClick: () => bellOpen.value = false }),
      /* @__PURE__ */ u4("div", { style: "position:fixed;top:35px;right:8px;width:min(400px,calc(100vw - 16px));background:var(--vscode-editor-background);border:1px solid var(--border);border-radius:6px;box-shadow:0 4px 20px rgba(0,0,0,0.5);z-index:200;overflow:hidden", children: [
        /* @__PURE__ */ u4("div", { style: "padding:8px 12px;border-bottom:1px solid var(--border);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--muted)", children: "Active Alerts" }),
        alerts.length === 0 ? /* @__PURE__ */ u4("div", { style: "padding:14px 12px;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:8px", children: [
          /* @__PURE__ */ u4("span", { style: "color:#81c784;font-size:14px", children: "\u2713" }),
          " All clear \u2014 no alerts triggered"
        ] }) : /* @__PURE__ */ u4("div", { children: alerts.map((a4, i4) => {
          const color = SEV_COLOR[a4.severity] ?? "#f6a623";
          return /* @__PURE__ */ u4("div", { style: `padding:10px 12px;border-left:3px solid ${color};${i4 > 0 ? "border-top:1px solid var(--border)" : ""}`, children: [
            /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:6px;margin-bottom:3px", children: [
              /* @__PURE__ */ u4("span", { style: "font-size:12px", children: SEV_ICON[a4.severity] ?? "\u26A0" }),
              /* @__PURE__ */ u4("span", { style: `font-size:12px;font-weight:600;color:${color}`, children: a4.label })
            ] }),
            a4.detail && /* @__PURE__ */ u4("div", { style: "font-size:11px;color:var(--muted);line-height:1.4", children: a4.detail })
          ] }, i4);
        }) }),
        /* @__PURE__ */ u4("div", { style: "padding:8px 12px;border-top:1px solid var(--border)", children: /* @__PURE__ */ u4(
          "button",
          {
            style: "font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;padding:0",
            onClick: () => {
              bellOpen.value = false;
              configOpen.value = true;
            },
            children: "Configure alerts \u2192"
          }
        ) })
      ] })
    ] });
  }
  function BellButton() {
    void displaySessions.value;
    const count = computeAlertCount();
    const open = bellOpen.value;
    return /* @__PURE__ */ u4("div", { style: "position:relative;display:flex;align-items:center", children: [
      /* @__PURE__ */ u4(
        "button",
        {
          class: "icon-btn" + (open ? " active" : ""),
          title: count > 0 ? `${count} alert${count > 1 ? "s" : ""} triggered` : "Alerts \u2014 none triggered",
          onClick: () => {
            bellOpen.value = !bellOpen.value;
          },
          children: "\u{1F514}"
        }
      ),
      count > 0 && /* @__PURE__ */ u4("span", { class: "alert-badge", children: count }),
      open && /* @__PURE__ */ u4(AlertStatusCard, { alerts: getTriggeredAlerts() })
    ] });
  }
  function GearButton() {
    const active = configOpen.value;
    return /* @__PURE__ */ u4(
      "button",
      {
        class: "icon-btn" + (active ? " active" : ""),
        title: "Settings \u2014 Alerts & Automation",
        onClick: () => {
          configOpen.value = !configOpen.value;
        },
        children: "\u2699"
      }
    );
  }
  function HelpButton() {
    const isActive = normalizeTabId(activeTab.value) === "help";
    return /* @__PURE__ */ u4(
      "button",
      {
        class: "icon-btn" + (isActive ? " active" : ""),
        title: "Help",
        onClick: () => {
          activeTab.value = "help";
        },
        children: "?"
      }
    );
  }
  function App() {
    y2(() => {
      let tipEl = null;
      function show(e4) {
        const target = e4.target.closest("[data-tip]");
        if (!target) return;
        const text = target.getAttribute("data-tip");
        if (!text) return;
        if (!tipEl) {
          tipEl = document.createElement("div");
          tipEl.className = "metric-tooltip";
          document.body.appendChild(tipEl);
        }
        tipEl.textContent = text;
        tipEl.style.display = "block";
        const rect = target.getBoundingClientRect();
        const tipW = 220, tipH = tipEl.offsetHeight || 60;
        let left = rect.left + rect.width / 2 - tipW / 2;
        let top = rect.bottom + 6;
        if (left < 4) left = 4;
        if (left + tipW > window.innerWidth - 4) left = window.innerWidth - tipW - 4;
        if (top + tipH > window.innerHeight - 4) top = rect.top - tipH - 6;
        tipEl.style.left = left + "px";
        tipEl.style.top = top + "px";
      }
      function hide() {
        if (tipEl) tipEl.style.display = "none";
      }
      document.addEventListener("mouseover", show);
      document.addEventListener("mouseout", hide);
      return () => {
        document.removeEventListener("mouseover", show);
        document.removeEventListener("mouseout", hide);
        if (tipEl) {
          tipEl.remove();
          tipEl = null;
        }
      };
    }, []);
    y2(() => {
      let initialLoadDone = false;
      const handler = (e4) => {
        const msg = e4.data;
        if (msg.type === "update") {
          if (msg.summary?.toolCalls) toolCalls.value = msg.summary.toolCalls;
          if (msg.sessionSummary !== void 0) sessionSummary.value = msg.sessionSummary;
          if (msg.analyticsData) {
            dailyStats.value = msg.analyticsData.dailyStats;
            lifetimeStats.value = msg.analyticsData.lifetimeStats;
          }
          if (msg.burnRate !== void 0) {
            burnRateData.value = msg.burnRate ?? null;
          }
          if (!initialLoadDone) {
            initialLoadDone = true;
            setTimeout(() => {
              checkAutomations(sessionSummary.value?.sessions ?? displaySessions.value);
              checkAlerts();
            }, 0);
          } else {
            setTimeout(() => {
              const triggers = checkAutomations(displaySessions.value);
              for (const t4 of triggers) {
                vscode?.postMessage({ type: "automation", ...t4 });
              }
              const alertNotifications = checkAlerts();
              for (const a4 of alertNotifications) {
                vscode?.postMessage({ type: "alert", label: a4.label, detail: a4.detail, severity: a4.severity });
              }
            }, 0);
          }
        } else if (msg.type === "sessionDetail" && msg.sessionId) {
          sessionTimelines.value = { ...sessionTimelines.value, [msg.sessionId]: msg.timeline ?? [] };
        } else if (msg.type === "blobContent" && msg.spanId && msg.field) {
          const key = `${msg.spanId}:${msg.field}`;
          if (msg.content != null) {
            blobCache.value = { ...blobCache.value, [key]: msg.content };
          }
        } else if (msg.type === "switchTab" && msg.tab) {
          const tab2 = normalizeTabId(msg.tab);
          if (tab2 === "alerts" || tab2 === "automation") {
            configOpen.value = true;
          } else {
            activeTab.value = tab2;
          }
        } else if (msg.type === "setFilter") {
          if (msg.agentFilter !== void 0) {
            selectedAgentFilter.value = msg.agentFilter;
            const sel = document.getElementById("agent-filter");
            if (sel) sel.value = msg.agentFilter;
          }
          if (msg.sessionLimit !== void 0) {
            const limit = Number(msg.sessionLimit);
            sessionLimit.value = limit;
            const sel = document.getElementById("session-limit");
            if (sel) sel.value = String(limit);
          }
        } else if (msg.type === "searchResults" && msg.sessions != null) {
          const data = {
            sessions: msg.sessions,
            totalCount: msg.totalCount ?? 0,
            offset: msg.offset ?? 0
          };
          if (msg.context === "timeRange") {
            rangedSearchResults.value = data;
          } else {
            searchResults.value = data;
          }
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, []);
    const tab = normalizeTabId(activeTab.value);
    const showFilterBars = tab !== "export" && tab !== "help";
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("div", { class: "tabs", children: [
        /* @__PURE__ */ u4(
          "button",
          {
            class: "sidebar-toggle-btn",
            title: sidebarOpen.value ? "Close AgentLens sidebar" : "Open AgentLens sidebar",
            onClick: () => {
              const opening = !sidebarOpen.value;
              sidebarOpen.value = opening;
              if (vscode) {
                vscode.postMessage({ type: opening ? "openSidebar" : "closeSidebar" });
              } else {
                window.dispatchEvent(new CustomEvent("agentlens:sidebar", { detail: { open: opening } }));
              }
            },
            children: sidebarOpen.value ? "\u25C4" : "\u25BA"
          }
        ),
        TABS.map((t4) => /* @__PURE__ */ u4(Tab, { id: t4.id, label: t4.label }, t4.id)),
        /* @__PURE__ */ u4("div", { style: "margin-left:auto;display:flex;align-items:center;border-left:1px solid var(--border);padding-left:2px", children: [
          /* @__PURE__ */ u4(BellButton, {}),
          /* @__PURE__ */ u4(GearButton, {}),
          /* @__PURE__ */ u4(HelpButton, {})
        ] })
      ] }),
      showFilterBars && /* @__PURE__ */ u4(TimeRangePicker, {}),
      showFilterBars && /* @__PURE__ */ u4(SearchFilterBar, {}),
      /* @__PURE__ */ u4("div", { class: "panel active", children: /* @__PURE__ */ u4(ActivePanel, {}) }),
      /* @__PURE__ */ u4(ConfigPanel, {}),
      /* @__PURE__ */ u4("img", { id: "mascot-img", src: "", alt: "AgentLens mascot", style: "display:none" })
    ] });
  }
  var AGENT_FILTER_OPTIONS = [
    { value: "all", label: "All", color: "var(--vscode-descriptionForeground,#888)", activeColor: "#ffffff" },
    { value: "copilot", label: "Copilot", color: "#00EAFF" },
    { value: "claude_code", label: "Claude", color: "#FFB085" },
    { value: "codex", label: "Codex", color: "#F0FF42" }
  ];
  function TimeRangePicker({ hideAgentFilter = false }) {
    const range = timeRange.value;
    const agent = selectedAgentFilter.value;
    const debounce = A2(null);
    const [loading, setLoading] = d2(false);
    const tab = normalizeTabId(activeTab.value);
    const showReset = tab === "sessions" || tab === "analytics";
    const isFiltered = sessionTextFilter.value !== "" || selectedAgentFilter.value !== "all" || initiatorFilter.value !== "all" || dataSourceFilter.value !== "all" || sessionLimit.value !== 25 || timeRange.value.preset !== "all" || sessionSortKey.value !== "start_time" || sessionSortDir.value !== "desc";
    function resetFilters() {
      sessionTextFilter.value = "";
      selectedAgentFilter.value = "all";
      initiatorFilter.value = "all";
      dataSourceFilter.value = "all";
      sessionLimit.value = 25;
      timeRange.value = { preset: "all" };
      sessionSortKey.value = "start_time";
      sessionSortDir.value = "desc";
    }
    function fireSearch(r5) {
      if (r5.preset === "all") {
        rangedSearchResults.value = null;
        setLoading(false);
        return;
      }
      setLoading(true);
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        vscode?.postMessage({
          type: "searchSessions",
          query: { since: r5.since, until: r5.until, limit: CHART_MAX, orderBy: "start_time", orderDir: "DESC" },
          context: "timeRange"
        });
      }, 120);
    }
    function selectPreset(id) {
      const r5 = makeTimeRange(id);
      timeRange.value = r5;
      fireSearch(r5);
    }
    y2(() => {
      if (rangedSearchResults.value !== null) setLoading(false);
    }, [rangedSearchResults.value]);
    const count = rangedSessions.value.length;
    const total = rangedSearchResults.value?.totalCount;
    const isActive = range.preset !== "all";
    const baseSessions = isActive ? rangedSessions.value : sessionSummary.value?.sessions ?? [];
    const presentSources = new Set(baseSessions.map((s4) => s4.source));
    return /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:0;padding:0 8px 6px;background:var(--vscode-editor-background);border-bottom:1px solid var(--vscode-panel-border);flex-shrink:0", children: [
      /* @__PURE__ */ u4("span", { style: "font-size:10px;color:var(--muted);margin-right:6px;white-space:nowrap;text-transform:uppercase;letter-spacing:.3px", children: "Time" }),
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:1px", children: TIME_PRESETS.map((p5) => /* @__PURE__ */ u4(
        "button",
        {
          onClick: () => selectPreset(p5.id),
          style: [
            "padding:2px 7px;font-size:11px;cursor:pointer;border:none;border-radius:3px;transition:background 0.1s",
            range.preset === p5.id ? "background:var(--vscode-button-background);color:var(--vscode-button-foreground);font-weight:600" : "background:transparent;color:var(--muted)"
          ].join(";"),
          title: p5.ms ? `Last ${p5.label}` : "All recorded sessions",
          children: p5.label
        },
        p5.id
      )) }),
      !hideAgentFilter && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("span", { style: "width:1px;height:14px;background:var(--border);margin:0 8px;flex-shrink:0" }),
        /* @__PURE__ */ u4("div", { style: "display:flex;gap:4px;align-items:center", children: [
          /* @__PURE__ */ u4("span", { style: "font-size:10px;color:var(--muted);margin-right:2px;white-space:nowrap;text-transform:uppercase;letter-spacing:.3px", children: "Agent" }),
          AGENT_FILTER_OPTIONS.filter((o4) => o4.value === "all" || presentSources.has(o4.value)).map((o4) => {
            const active = agent === o4.value;
            const displayColor = active && o4.activeColor ? o4.activeColor : o4.color;
            return /* @__PURE__ */ u4(
              "button",
              {
                onClick: () => {
                  selectedAgentFilter.value = o4.value;
                },
                style: [
                  "padding:2px 9px;font-size:11px;cursor:pointer;border-radius:10px;transition:all 0.1s;",
                  `border:1.5px solid ${displayColor};`,
                  active ? `background:${displayColor}33;color:${displayColor};font-weight:600` : "background:transparent;color:var(--muted)"
                ].join(""),
                children: o4.label
              },
              o4.value
            );
          })
        ] })
      ] }),
      showReset && isFiltered && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("span", { style: "width:1px;height:14px;background:var(--border);margin:0 8px;flex-shrink:0" }),
        /* @__PURE__ */ u4(
          "button",
          {
            onClick: resetFilters,
            style: "padding:3px 12px;font-size:12px;border-radius:4px;cursor:pointer;white-space:nowrap;border:1px solid var(--vscode-panel-border);background:transparent;color:var(--muted)",
            children: "Reset"
          }
        )
      ] }),
      loading && /* @__PURE__ */ u4("span", { style: "margin-left:8px;font-size:10px;color:var(--muted);opacity:0.6", children: "loading\u2026" }),
      isActive && !loading && /* @__PURE__ */ u4(
        "button",
        {
          onClick: () => fireSearch(makeTimeRange(range.preset)),
          style: "margin-left:6px;padding:2px 5px;font-size:11px;cursor:pointer;background:transparent;border:none;color:var(--muted);border-radius:3px",
          title: "Refresh this time range",
          children: "\u21BB"
        }
      )
    ] });
  }
  var DATA_SOURCE_FILTER_OPTIONS = [
    { value: "all", label: "All", color: "var(--vscode-descriptionForeground,#888)", activeColor: "#ffffff" },
    { value: "otel", label: "OTEL", color: "#ffffff" },
    { value: "log", label: "Log", color: "#90a4ae" }
  ];
  var INITIATOR_FILTER_OPTIONS = [
    { value: "all", label: "All", color: "var(--vscode-descriptionForeground,#888)", activeColor: "#ffffff" },
    { value: "user", label: "User", color: "#4a90d9" },
    { value: "agent", label: "Agent", color: "#b0bec5" },
    { value: "api", label: "API", color: "#90a4ae" }
  ];
  function FilterPills({ options, value, onChange }) {
    return /* @__PURE__ */ u4("div", { style: "display:flex;gap:3px", children: options.map((o4) => {
      const active = value === o4.value;
      const displayColor = active && o4.activeColor ? o4.activeColor : o4.color;
      return /* @__PURE__ */ u4(
        "button",
        {
          onClick: () => onChange(o4.value),
          style: [
            "padding:2px 7px;font-size:11px;cursor:pointer;border-radius:10px;transition:all 0.1s;",
            `border:1.5px solid ${displayColor};`,
            active ? `background:${displayColor}33;color:${displayColor};font-weight:600` : "background:transparent;color:var(--muted)"
          ].join(""),
          title: o4.title,
          children: o4.label
        },
        o4.value
      );
    }) });
  }
  function SearchFilterBar() {
    const text = sessionTextFilter.value;
    const iFilter = initiatorFilter.value;
    const dsFilter = dataSourceFilter.value;
    const tab = normalizeTabId(activeTab.value);
    const isSessionsTab = tab === "sessions";
    const isAnalyticsTab = tab === "analytics";
    return /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:5px;padding:4px 8px 6px;background:var(--vscode-editor-background);border-bottom:1px solid var(--vscode-panel-border);flex-shrink:0;flex-wrap:wrap", children: [
      isSessionsTab && /* @__PURE__ */ u4(
        "input",
        {
          type: "text",
          placeholder: "Filter sessions\u2026",
          value: text,
          onInput: (e4) => {
            sessionTextFilter.value = e4.target.value;
          },
          style: "flex:1;min-width:100px;max-width:200px;padding:3px 7px;font-size:11px;background:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#ccc);border:1px solid var(--vscode-input-border,#555);border-radius:3px;outline:none"
        }
      ),
      isSessionsTab && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("span", { style: "font-size:10px;color:var(--muted);white-space:nowrap;text-transform:uppercase;letter-spacing:.3px", children: "From" }),
        /* @__PURE__ */ u4(
          FilterPills,
          {
            options: INITIATOR_FILTER_OPTIONS.map((o4) => ({ ...o4, title: o4.value === "all" ? "Show all sessions" : o4.value === "user" ? "Human-typed prompts only" : o4.value === "agent" ? "Agent-spawned sub-tasks only" : "Non-interactive claude -p calls only" })),
            value: iFilter,
            onChange: (v4) => {
              initiatorFilter.value = v4;
            }
          }
        )
      ] }),
      (isSessionsTab || isAnalyticsTab) && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("span", { style: "font-size:10px;color:var(--muted);white-space:nowrap;text-transform:uppercase;letter-spacing:.3px", children: "Source" }),
        /* @__PURE__ */ u4(
          FilterPills,
          {
            options: DATA_SOURCE_FILTER_OPTIONS.map((o4) => ({ ...o4, title: o4.value === "all" ? "Show all data sources" : o4.value === "otel" ? "OpenTelemetry sessions only" : "Log-file sessions only" })),
            value: dsFilter,
            onChange: (v4) => {
              dataSourceFilter.value = v4;
            }
          }
        )
      ] }),
      /* @__PURE__ */ u4("span", { style: "margin-left:auto;font-size:10px;color:var(--muted);white-space:nowrap;padding-right:2px", children: [
        filteredSessions.value.length,
        " sessions"
      ] })
    ] });
  }
  function Tab({ id, label }) {
    const isActive = normalizeTabId(activeTab.value) === id;
    return /* @__PURE__ */ u4(
      "button",
      {
        class: "tab" + (isActive ? " active" : ""),
        "data-tab": id,
        onClick: () => {
          activeTab.value = id;
        },
        children: label
      }
    );
  }

  // media/src/dashboard.tsx
  var vscode3 = window.acquireVsCodeApi();
  setVscode(vscode3);
  R(/* @__PURE__ */ u4(App, {}), document.getElementById("app"));
})();
//# sourceMappingURL=dashboard.js.map
