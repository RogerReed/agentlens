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

  // node_modules/.pnpm/fflate@0.8.3/node_modules/fflate/esm/browser.js
  var u8 = Uint8Array;
  var u16 = Uint16Array;
  var i32 = Int32Array;
  var fleb = new u8([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0,
    /* unused */
    0,
    0,
    /* impossible */
    0
  ]);
  var fdeb = new u8([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13,
    /* unused */
    0,
    0
  ]);
  var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  var freb = function(eb, start) {
    var b4 = new u16(31);
    for (var i4 = 0; i4 < 31; ++i4) {
      b4[i4] = start += 1 << eb[i4 - 1];
    }
    var r5 = new i32(b4[30]);
    for (var i4 = 1; i4 < 30; ++i4) {
      for (var j4 = b4[i4]; j4 < b4[i4 + 1]; ++j4) {
        r5[j4] = j4 - b4[i4] << 5 | i4;
      }
    }
    return { b: b4, r: r5 };
  };
  var _a = freb(fleb, 2);
  var fl = _a.b;
  var revfl = _a.r;
  fl[28] = 258, revfl[258] = 28;
  var _b = freb(fdeb, 0);
  var fd = _b.b;
  var revfd = _b.r;
  var rev = new u16(32768);
  for (i4 = 0; i4 < 32768; ++i4) {
    x4 = (i4 & 43690) >> 1 | (i4 & 21845) << 1;
    x4 = (x4 & 52428) >> 2 | (x4 & 13107) << 2;
    x4 = (x4 & 61680) >> 4 | (x4 & 3855) << 4;
    rev[i4] = ((x4 & 65280) >> 8 | (x4 & 255) << 8) >> 1;
  }
  var x4;
  var i4;
  var hMap = (function(cd, mb, r5) {
    var s4 = cd.length;
    var i4 = 0;
    var l5 = new u16(mb);
    for (; i4 < s4; ++i4) {
      if (cd[i4])
        ++l5[cd[i4] - 1];
    }
    var le = new u16(mb);
    for (i4 = 1; i4 < mb; ++i4) {
      le[i4] = le[i4 - 1] + l5[i4 - 1] << 1;
    }
    var co;
    if (r5) {
      co = new u16(1 << mb);
      var rvb = 15 - mb;
      for (i4 = 0; i4 < s4; ++i4) {
        if (cd[i4]) {
          var sv = i4 << 4 | cd[i4];
          var r_1 = mb - cd[i4];
          var v4 = le[cd[i4] - 1]++ << r_1;
          for (var m4 = v4 | (1 << r_1) - 1; v4 <= m4; ++v4) {
            co[rev[v4] >> rvb] = sv;
          }
        }
      }
    } else {
      co = new u16(s4);
      for (i4 = 0; i4 < s4; ++i4) {
        if (cd[i4]) {
          co[i4] = rev[le[cd[i4] - 1]++] >> 15 - cd[i4];
        }
      }
    }
    return co;
  });
  var flt = new u8(288);
  for (i4 = 0; i4 < 144; ++i4)
    flt[i4] = 8;
  var i4;
  for (i4 = 144; i4 < 256; ++i4)
    flt[i4] = 9;
  var i4;
  for (i4 = 256; i4 < 280; ++i4)
    flt[i4] = 7;
  var i4;
  for (i4 = 280; i4 < 288; ++i4)
    flt[i4] = 8;
  var i4;
  var fdt = new u8(32);
  for (i4 = 0; i4 < 32; ++i4)
    fdt[i4] = 5;
  var i4;
  var flm = /* @__PURE__ */ hMap(flt, 9, 0);
  var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
  var shft = function(p5) {
    return (p5 + 7) / 8 | 0;
  };
  var slc = function(v4, s4, e4) {
    if (s4 == null || s4 < 0)
      s4 = 0;
    if (e4 == null || e4 > v4.length)
      e4 = v4.length;
    return new u8(v4.subarray(s4, e4));
  };
  var ec = [
    "unexpected EOF",
    "invalid block type",
    "invalid length/literal",
    "invalid distance",
    "stream finished",
    "no stream handler",
    ,
    // determined by compression function
    "no callback",
    "invalid UTF-8 data",
    "extra field too long",
    "date not in range 1980-2099",
    "filename too long",
    "stream finishing",
    "invalid zip data"
    // determined by unknown compression method
  ];
  var err = function(ind, msg, nt) {
    var e4 = new Error(msg || ec[ind]);
    e4.code = ind;
    if (Error.captureStackTrace)
      Error.captureStackTrace(e4, err);
    if (!nt)
      throw e4;
    return e4;
  };
  var wbits = function(d5, p5, v4) {
    v4 <<= p5 & 7;
    var o4 = p5 / 8 | 0;
    d5[o4] |= v4;
    d5[o4 + 1] |= v4 >> 8;
  };
  var wbits16 = function(d5, p5, v4) {
    v4 <<= p5 & 7;
    var o4 = p5 / 8 | 0;
    d5[o4] |= v4;
    d5[o4 + 1] |= v4 >> 8;
    d5[o4 + 2] |= v4 >> 16;
  };
  var hTree = function(d5, mb) {
    var t4 = [];
    for (var i4 = 0; i4 < d5.length; ++i4) {
      if (d5[i4])
        t4.push({ s: i4, f: d5[i4] });
    }
    var s4 = t4.length;
    var t22 = t4.slice();
    if (!s4)
      return { t: et, l: 0 };
    if (s4 == 1) {
      var v4 = new u8(t4[0].s + 1);
      v4[t4[0].s] = 1;
      return { t: v4, l: 1 };
    }
    t4.sort(function(a4, b4) {
      return a4.f - b4.f;
    });
    t4.push({ s: -1, f: 25001 });
    var l5 = t4[0], r5 = t4[1], i0 = 0, i1 = 1, i22 = 2;
    t4[0] = { s: -1, f: l5.f + r5.f, l: l5, r: r5 };
    while (i1 != s4 - 1) {
      l5 = t4[t4[i0].f < t4[i22].f ? i0++ : i22++];
      r5 = t4[i0 != i1 && t4[i0].f < t4[i22].f ? i0++ : i22++];
      t4[i1++] = { s: -1, f: l5.f + r5.f, l: l5, r: r5 };
    }
    var maxSym = t22[0].s;
    for (var i4 = 1; i4 < s4; ++i4) {
      if (t22[i4].s > maxSym)
        maxSym = t22[i4].s;
    }
    var tr = new u16(maxSym + 1);
    var mbt = ln(t4[i1 - 1], tr, 0);
    if (mbt > mb) {
      var i4 = 0, dt = 0;
      var lft = mbt - mb, cst = 1 << lft;
      t22.sort(function(a4, b4) {
        return tr[b4.s] - tr[a4.s] || a4.f - b4.f;
      });
      for (; i4 < s4; ++i4) {
        var i2_1 = t22[i4].s;
        if (tr[i2_1] > mb) {
          dt += cst - (1 << mbt - tr[i2_1]);
          tr[i2_1] = mb;
        } else
          break;
      }
      dt >>= lft;
      while (dt > 0) {
        var i2_2 = t22[i4].s;
        if (tr[i2_2] < mb)
          dt -= 1 << mb - tr[i2_2]++ - 1;
        else
          ++i4;
      }
      for (; i4 >= 0 && dt; --i4) {
        var i2_3 = t22[i4].s;
        if (tr[i2_3] == mb) {
          --tr[i2_3];
          ++dt;
        }
      }
      mbt = mb;
    }
    return { t: new u8(tr), l: mbt };
  };
  var ln = function(n3, l5, d5) {
    return n3.s == -1 ? Math.max(ln(n3.l, l5, d5 + 1), ln(n3.r, l5, d5 + 1)) : l5[n3.s] = d5;
  };
  var lc = function(c4) {
    var s4 = c4.length;
    while (s4 && !c4[--s4])
      ;
    var cl = new u16(++s4);
    var cli = 0, cln = c4[0], cls = 1;
    var w5 = function(v4) {
      cl[cli++] = v4;
    };
    for (var i4 = 1; i4 <= s4; ++i4) {
      if (c4[i4] == cln && i4 != s4)
        ++cls;
      else {
        if (!cln && cls > 2) {
          for (; cls > 138; cls -= 138)
            w5(32754);
          if (cls > 2) {
            w5(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
            cls = 0;
          }
        } else if (cls > 3) {
          w5(cln), --cls;
          for (; cls > 6; cls -= 6)
            w5(8304);
          if (cls > 2)
            w5(cls - 3 << 5 | 8208), cls = 0;
        }
        while (cls--)
          w5(cln);
        cls = 1;
        cln = c4[i4];
      }
    }
    return { c: cl.subarray(0, cli), n: s4 };
  };
  var clen = function(cf, cl) {
    var l5 = 0;
    for (var i4 = 0; i4 < cl.length; ++i4)
      l5 += cf[i4] * cl[i4];
    return l5;
  };
  var wfblk = function(out, pos, dat) {
    var s4 = dat.length;
    var o4 = shft(pos + 2);
    out[o4] = s4 & 255;
    out[o4 + 1] = s4 >> 8;
    out[o4 + 2] = out[o4] ^ 255;
    out[o4 + 3] = out[o4 + 1] ^ 255;
    for (var i4 = 0; i4 < s4; ++i4)
      out[o4 + i4 + 4] = dat[i4];
    return (o4 + 4 + s4) * 8;
  };
  var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p5) {
    wbits(out, p5++, final);
    ++lf[256];
    var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
    var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
    var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
    var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
    var lcfreq = new u16(19);
    for (var i4 = 0; i4 < lclt.length; ++i4)
      ++lcfreq[lclt[i4] & 31];
    for (var i4 = 0; i4 < lcdt.length; ++i4)
      ++lcfreq[lcdt[i4] & 31];
    var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
      ;
    var flen = bl + 5 << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
      return wfblk(out, p5, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p5, 1 + (dtlen < ftlen)), p5 += 2;
    if (dtlen < ftlen) {
      lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
      var llm = hMap(lct, mlcb, 0);
      wbits(out, p5, nlc - 257);
      wbits(out, p5 + 5, ndc - 1);
      wbits(out, p5 + 10, nlcc - 4);
      p5 += 14;
      for (var i4 = 0; i4 < nlcc; ++i4)
        wbits(out, p5 + 3 * i4, lct[clim[i4]]);
      p5 += 3 * nlcc;
      var lcts = [lclt, lcdt];
      for (var it = 0; it < 2; ++it) {
        var clct = lcts[it];
        for (var i4 = 0; i4 < clct.length; ++i4) {
          var len = clct[i4] & 31;
          wbits(out, p5, llm[len]), p5 += lct[len];
          if (len > 15)
            wbits(out, p5, clct[i4] >> 5 & 127), p5 += clct[i4] >> 12;
        }
      }
    } else {
      lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i4 = 0; i4 < li; ++i4) {
      var sym = syms[i4];
      if (sym > 255) {
        var len = sym >> 18 & 31;
        wbits16(out, p5, lm[len + 257]), p5 += ll[len + 257];
        if (len > 7)
          wbits(out, p5, sym >> 23 & 31), p5 += fleb[len];
        var dst = sym & 31;
        wbits16(out, p5, dm[dst]), p5 += dl[dst];
        if (dst > 3)
          wbits16(out, p5, sym >> 5 & 8191), p5 += fdeb[dst];
      } else {
        wbits16(out, p5, lm[sym]), p5 += ll[sym];
      }
    }
    wbits16(out, p5, lm[256]);
    return p5 + ll[256];
  };
  var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
  var et = /* @__PURE__ */ new u8(0);
  var dflt = function(dat, lvl, plvl, pre, post, st) {
    var s4 = st.z || dat.length;
    var o4 = new u8(pre + s4 + 5 * (1 + Math.ceil(s4 / 7e3)) + post);
    var w5 = o4.subarray(pre, o4.length - post);
    var lst = st.l;
    var pos = (st.r || 0) & 7;
    if (lvl) {
      if (pos)
        w5[0] = st.r >> 3;
      var opt = deo[lvl - 1];
      var n3 = opt >> 13, c4 = opt & 8191;
      var msk_1 = (1 << plvl) - 1;
      var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
      var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
      var hsh = function(i5) {
        return (dat[i5] ^ dat[i5 + 1] << bs1_1 ^ dat[i5 + 2] << bs2_1) & msk_1;
      };
      var syms = new i32(25e3);
      var lf = new u16(288), df = new u16(32);
      var lc_1 = 0, eb = 0, i4 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
      for (; i4 + 2 < s4; ++i4) {
        var hv = hsh(i4);
        var imod = i4 & 32767, pimod = head[hv];
        prev[imod] = pimod;
        head[hv] = imod;
        if (wi <= i4) {
          var rem = s4 - i4;
          if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
            pos = wblk(dat, w5, 0, syms, lf, df, eb, li, bs, i4 - bs, pos);
            li = lc_1 = eb = 0, bs = i4;
            for (var j4 = 0; j4 < 286; ++j4)
              lf[j4] = 0;
            for (var j4 = 0; j4 < 30; ++j4)
              df[j4] = 0;
          }
          var l5 = 2, d5 = 0, ch_1 = c4, dif = imod - pimod & 32767;
          if (rem > 2 && hv == hsh(i4 - dif)) {
            var maxn = Math.min(n3, rem) - 1;
            var maxd = Math.min(32767, i4);
            var ml = Math.min(258, rem);
            while (dif <= maxd && --ch_1 && imod != pimod) {
              if (dat[i4 + l5] == dat[i4 + l5 - dif]) {
                var nl = 0;
                for (; nl < ml && dat[i4 + nl] == dat[i4 + nl - dif]; ++nl)
                  ;
                if (nl > l5) {
                  l5 = nl, d5 = dif;
                  if (nl > maxn)
                    break;
                  var mmd = Math.min(dif, nl - 2);
                  var md = 0;
                  for (var j4 = 0; j4 < mmd; ++j4) {
                    var ti = i4 - dif + j4 & 32767;
                    var pti = prev[ti];
                    var cd = ti - pti & 32767;
                    if (cd > md)
                      md = cd, pimod = ti;
                  }
                }
              }
              imod = pimod, pimod = prev[imod];
              dif += imod - pimod & 32767;
            }
          }
          if (d5) {
            syms[li++] = 268435456 | revfl[l5] << 18 | revfd[d5];
            var lin = revfl[l5] & 31, din = revfd[d5] & 31;
            eb += fleb[lin] + fdeb[din];
            ++lf[257 + lin];
            ++df[din];
            wi = i4 + l5;
            ++lc_1;
          } else {
            syms[li++] = dat[i4];
            ++lf[dat[i4]];
          }
        }
      }
      for (i4 = Math.max(i4, wi); i4 < s4; ++i4) {
        syms[li++] = dat[i4];
        ++lf[dat[i4]];
      }
      pos = wblk(dat, w5, lst, syms, lf, df, eb, li, bs, i4 - bs, pos);
      if (!lst) {
        st.r = pos & 7 | w5[pos / 8 | 0] << 3;
        pos -= 7;
        st.h = head, st.p = prev, st.i = i4, st.w = wi;
      }
    } else {
      for (var i4 = st.w || 0; i4 < s4 + lst; i4 += 65535) {
        var e4 = i4 + 65535;
        if (e4 >= s4) {
          w5[pos / 8 | 0] = lst;
          e4 = s4;
        }
        pos = wfblk(w5, pos + 1, dat.subarray(i4, e4));
      }
      st.i = s4;
    }
    return slc(o4, 0, pre + shft(pos) + post);
  };
  var crct = /* @__PURE__ */ (function() {
    var t4 = new Int32Array(256);
    for (var i4 = 0; i4 < 256; ++i4) {
      var c4 = i4, k3 = 9;
      while (--k3)
        c4 = (c4 & 1 && -306674912) ^ c4 >>> 1;
      t4[i4] = c4;
    }
    return t4;
  })();
  var crc = function() {
    var c4 = -1;
    return {
      p: function(d5) {
        var cr = c4;
        for (var i4 = 0; i4 < d5.length; ++i4)
          cr = crct[cr & 255 ^ d5[i4]] ^ cr >>> 8;
        c4 = cr;
      },
      d: function() {
        return ~c4;
      }
    };
  };
  var dopt = function(dat, opt, pre, post, st) {
    if (!st) {
      st = { l: 1 };
      if (opt.dictionary) {
        var dict = opt.dictionary.subarray(-32768);
        var newDat = new u8(dict.length + dat.length);
        newDat.set(dict);
        newDat.set(dat, dict.length);
        dat = newDat;
        st.w = dict.length;
      }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
  };
  var mrg = function(a4, b4) {
    var o4 = {};
    for (var k3 in a4)
      o4[k3] = a4[k3];
    for (var k3 in b4)
      o4[k3] = b4[k3];
    return o4;
  };
  var wbytes = function(d5, b4, v4) {
    for (; v4; ++b4)
      d5[b4] = v4, v4 >>>= 8;
  };
  function deflateSync(data, opts) {
    return dopt(data, opts || {}, 0, 0);
  }
  var fltn = function(d5, p5, t4, o4) {
    for (var k3 in d5) {
      var val = d5[k3], n3 = p5 + k3, op = o4;
      if (Array.isArray(val))
        op = mrg(o4, val[1]), val = val[0];
      if (ArrayBuffer.isView(val))
        t4[n3] = [val, op];
      else {
        t4[n3 += "/"] = [new u8(0), op];
        fltn(val, n3, t4, o4);
      }
    }
  };
  var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
  var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
  var tds = 0;
  try {
    td.decode(et, { stream: true });
    tds = 1;
  } catch (e4) {
  }
  function strToU8(str, latin1) {
    if (latin1) {
      var ar_1 = new u8(str.length);
      for (var i4 = 0; i4 < str.length; ++i4)
        ar_1[i4] = str.charCodeAt(i4);
      return ar_1;
    }
    if (te)
      return te.encode(str);
    var l5 = str.length;
    var ar = new u8(str.length + (str.length >> 1));
    var ai = 0;
    var w5 = function(v4) {
      ar[ai++] = v4;
    };
    for (var i4 = 0; i4 < l5; ++i4) {
      if (ai + 5 > ar.length) {
        var n3 = new u8(ai + 8 + (l5 - i4 << 1));
        n3.set(ar);
        ar = n3;
      }
      var c4 = str.charCodeAt(i4);
      if (c4 < 128 || latin1)
        w5(c4);
      else if (c4 < 2048)
        w5(192 | c4 >> 6), w5(128 | c4 & 63);
      else if (c4 > 55295 && c4 < 57344)
        c4 = 65536 + (c4 & 1023 << 10) | str.charCodeAt(++i4) & 1023, w5(240 | c4 >> 18), w5(128 | c4 >> 12 & 63), w5(128 | c4 >> 6 & 63), w5(128 | c4 & 63);
      else
        w5(224 | c4 >> 12), w5(128 | c4 >> 6 & 63), w5(128 | c4 & 63);
    }
    return slc(ar, 0, ai);
  }
  var exfl = function(ex) {
    var le = 0;
    if (ex) {
      for (var k3 in ex) {
        var l5 = ex[k3].length;
        if (l5 > 65535)
          err(9);
        le += l5 + 4;
      }
    }
    return le;
  };
  var wzh = function(d5, b4, f5, fn, u5, c4, ce, co) {
    var fl2 = fn.length, ex = f5.extra, col = co && co.length;
    var exl = exfl(ex);
    wbytes(d5, b4, ce != null ? 33639248 : 67324752), b4 += 4;
    if (ce != null)
      d5[b4++] = 20, d5[b4++] = f5.os;
    d5[b4] = 20, b4 += 2;
    d5[b4++] = f5.flag << 1 | (c4 < 0 && 8), d5[b4++] = u5 && 8;
    d5[b4++] = f5.compression & 255, d5[b4++] = f5.compression >> 8;
    var dt = new Date(f5.mtime == null ? Date.now() : f5.mtime), y5 = dt.getFullYear() - 1980;
    if (y5 < 0 || y5 > 119)
      err(10);
    wbytes(d5, b4, y5 << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b4 += 4;
    if (c4 != -1) {
      wbytes(d5, b4, f5.crc);
      wbytes(d5, b4 + 4, c4 < 0 ? -c4 - 2 : c4);
      wbytes(d5, b4 + 8, f5.size);
    }
    wbytes(d5, b4 + 12, fl2);
    wbytes(d5, b4 + 14, exl), b4 += 16;
    if (ce != null) {
      wbytes(d5, b4, col);
      wbytes(d5, b4 + 6, f5.attrs);
      wbytes(d5, b4 + 10, ce), b4 += 14;
    }
    d5.set(fn, b4);
    b4 += fl2;
    if (exl) {
      for (var k3 in ex) {
        var exf = ex[k3], l5 = exf.length;
        wbytes(d5, b4, +k3);
        wbytes(d5, b4 + 2, l5);
        d5.set(exf, b4 + 4), b4 += 4 + l5;
      }
    }
    if (col)
      d5.set(co, b4), b4 += col;
    return b4;
  };
  var wzf = function(o4, b4, c4, d5, e4) {
    wbytes(o4, b4, 101010256);
    wbytes(o4, b4 + 8, c4);
    wbytes(o4, b4 + 10, c4);
    wbytes(o4, b4 + 12, d5);
    wbytes(o4, b4 + 16, e4);
  };
  function zipSync(data, opts) {
    if (!opts)
      opts = {};
    var r5 = {};
    var files = [];
    fltn(data, "", r5, opts);
    var o4 = 0;
    var tot = 0;
    for (var fn in r5) {
      var _a2 = r5[fn], file = _a2[0], p5 = _a2[1];
      var compression = p5.level == 0 ? 0 : 8;
      var f5 = strToU8(fn), s4 = f5.length;
      var com = p5.comment, m4 = com && strToU8(com), ms = m4 && m4.length;
      var exl = exfl(p5.extra);
      if (s4 > 65535)
        err(11);
      var d5 = compression ? deflateSync(file, p5) : file, l5 = d5.length;
      var c4 = crc();
      c4.p(file);
      files.push(mrg(p5, {
        size: file.length,
        crc: c4.d(),
        c: d5,
        f: f5,
        m: m4,
        u: s4 != fn.length || m4 && com.length != ms,
        o: o4,
        compression
      }));
      o4 += 30 + s4 + exl + l5;
      tot += 76 + 2 * (s4 + exl) + (ms || 0) + l5;
    }
    var out = new u8(tot + 22), oe = o4, cdl = tot - o4;
    for (var i4 = 0; i4 < files.length; ++i4) {
      var f5 = files[i4];
      wzh(out, f5.o, f5, f5.f, f5.u, f5.c.length);
      var badd = 30 + f5.f.length + exfl(f5.extra);
      out.set(f5.c, f5.o + badd);
      wzh(out, o4, f5, f5.f, f5.u, f5.c.length, f5.o, f5.m), o4 += 16 + badd + (f5.m ? f5.m.length : 0);
    }
    wzf(out, o4, files.length, cdl, oe);
    return out;
  }

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
  function nanoToMs(n3) {
    try {
      return Number(BigInt(n3 ?? 0) / BigInt(1e6));
    } catch {
      return parseInt(String(n3)) / 1e6 || 0;
    }
  }
  function timestampToMs(value) {
    if (value === void 0 || value === null || value === "") return 0;
    if (typeof value === "number") return value;
    const raw = String(value);
    if (/^\d+$/.test(raw)) return nanoToMs(raw);
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function sessionStartMs(session) {
    return timestampToMs(session.startTime);
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
  function getAttr(span, key) {
    const a4 = (span.attributes ?? []).find((x4) => x4.key === key);
    if (!a4) return null;
    const v4 = a4.value;
    return v4.stringValue ?? v4.intValue ?? v4.doubleValue ?? v4.boolValue ?? null;
  }
  function intAttr(attrs, key) {
    const a4 = attrs.find((x4) => x4.key === key);
    if (!a4) return 0;
    return parseInt(String(a4.value.intValue ?? a4.value.stringValue ?? 0)) || 0;
  }
  function getInputTokens(span) {
    const attrs = span.attributes ?? [];
    const genAiBase = intAttr(attrs, "gen_ai.usage.input_tokens");
    const genAiCache = intAttr(attrs, "gen_ai.usage.cache_read.input_tokens") + intAttr(attrs, "gen_ai.usage.cache_creation.input_tokens");
    if (genAiBase > 0 || genAiCache > 0) return genAiBase + genAiCache;
    return intAttr(attrs, "input_tokens") + intAttr(attrs, "prompt_tokens") + intAttr(attrs, "cache_read_tokens") + intAttr(attrs, "cache_creation_tokens") + intAttr(attrs, "input_token_count") + intAttr(attrs, "cached_token_count") + intAttr(attrs, "codex.turn.token_usage.input_tokens") + intAttr(attrs, "codex.turn.token_usage.cached_input_tokens");
  }
  function getOutputTokens(span) {
    const attrs = span.attributes ?? [];
    return intAttr(attrs, "gen_ai.usage.output_tokens") || intAttr(attrs, "output_tokens") || intAttr(attrs, "completion_tokens") || intAttr(attrs, "output_token_count") + intAttr(attrs, "reasoning_token_count") || intAttr(attrs, "codex.turn.token_usage.output_tokens");
  }
  function getTokenCount(span) {
    let total = 0;
    let foundTotal = false;
    for (const a4 of span.attributes ?? []) {
      if (/total.?tokens/i.test(a4.key)) {
        total = parseInt(String(a4.value.intValue ?? a4.value.stringValue ?? a4.value.doubleValue)) || 0;
        foundTotal = true;
      }
    }
    if (foundTotal) return total;
    return getInputTokens(span) + getOutputTokens(span);
  }
  function isSessionSpan(name) {
    return name.indexOf("invoke_agent") === 0 || name === "claude_code.interaction" || name === "codex.user_prompt" || name === "codex.prompt" || name === "codex.user_message" || name === "codex.session_start";
  }
  function isLlmSpanName(name) {
    return name.indexOf("chat") === 0 || name === "claude_code.llm_request" || name === "handle_responses" || name === "codex.stream_event" || name === "codex.api_request" || name === "codex.completion" || name === "codex.response" || name === "codex.sse_event";
  }
  function isToolSpanName(name) {
    return name.indexOf("execute_tool") === 0 || name === "claude_code.tool" || name === "exec_command" || name.indexOf("codex.tool") === 0;
  }
  function inferSpanSource(span) {
    const name = span?.name ? String(span.name) : "";
    if (name.indexOf("claude_code.") === 0) return "claude_code";
    if (name.indexOf("codex.") === 0) return "codex";
    if (getCodexSessionId(span)) return "codex";
    if (name.indexOf("invoke_agent") === 0 || name.indexOf("chat") === 0 || name.indexOf("execute_tool") === 0) return "copilot";
    return null;
  }
  function getCodexSessionId(span) {
    const explicit = getAttr(span, "codex.session.id");
    if (explicit) return String(explicit);
    const conversationId = getAttr(span, "thread.id") ?? getAttr(span, "thread_id") ?? getAttr(span, "conversation.id") ?? getAttr(span, "conversation_id") ?? getAttr(span, "codex.conversation.id");
    const turnId = getAttr(span, "turn.id") ?? getAttr(span, "turn_id") ?? getAttr(span, "codex.turn.id");
    if (conversationId && turnId) {
      return "codex:" + String(conversationId) + ":" + String(turnId);
    }
    return "";
  }
  function getSessionUserRequest(span) {
    return String(
      getAttr(span, "copilot_chat.user_request") ?? getAttr(span, "user_prompt") ?? getAttr(span, "prompt") ?? getAttr(span, "codex.user_prompt") ?? getAttr(span, "codex.prompt") ?? getAttr(span, "codex.user_message") ?? getAttr(span, "codex.input") ?? ""
    );
  }
  function extractUserRequest(raw) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed.indexOf("<userRequest>") !== -1) {
      const match = trimmed.match(/<userRequest>\s*([\s\S]*?)\s*<\/userRequest>/);
      return match ? match[1].trim() : trimmed;
    }
    const codexMatch = trimmed.match(/(?:^|\n)##\s+My request(?:\s+for\s+[^\n:]+)?:\s*\n([\s\S]*)$/i);
    if (codexMatch?.[1]?.trim()) return codexMatch[1].trim();
    const stripped = trimmed.replace(/<ide_[^>]*>[\s\S]*?<\/ide_[^>]*>/gi, "").trim();
    return stripped || trimmed;
  }
  function spanTypeBadge(span) {
    const n3 = (span.name ?? "").toLowerCase();
    const otelName = String(getAttr(span, "otel.name") ?? "").toLowerCase();
    if (getInputTokens(span) > 0 || getOutputTokens(span) > 0 || isLlmSpanName(span.name ?? "") || n3 === "handle_responses") return { label: "LLM", color: "var(--accent)" };
    if (n3.includes("llm") || n3.includes("chat") || n3.includes("completion")) return { label: "LLM", color: "var(--accent)" };
    if (isToolSpanName(span.name ?? "") || n3.includes("tool")) return { label: "TOOL", color: "#B8E986" };
    if (n3.includes("agent") || n3.includes("session") || n3.includes("turn") || otelName.includes("session_task")) return { label: "AGENT", color: "#C49CFF" };
    if (n3.includes("embed")) return { label: "EMBED", color: "#FF85A1" };
    if (n3.includes("search") || n3.includes("retrieve")) return { label: "RAG", color: "#85E0D0" };
    return { label: "SPAN", color: "var(--muted)" };
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
  function buildDisplaySummary() {
    const sessions = displaySessions.value;
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
  function getAgentDotHtml(source) {
    if (!source) return "";
    return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${getAgentColor(source)};vertical-align:middle" title="${getAgentSourceLabel(source)}"></span>`;
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
        return toolName2 + " " + args;
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
  function buildSpanTree(traceSpans) {
    const byId = {};
    const roots = [];
    traceSpans.forEach((s4) => {
      byId[s4.spanId] = { span: s4, children: [], depth: 0 };
    });
    traceSpans.forEach((s4) => {
      const node = byId[s4.spanId];
      if (s4.parentSpanId && byId[s4.parentSpanId]) {
        byId[s4.parentSpanId].children.push(node);
      } else {
        roots.push(node);
      }
    });
    function setDepth(node, d5) {
      node.depth = d5;
      node.children.sort((a4, b4) => nanoToMs(a4.span.startTime) - nanoToMs(b4.span.startTime));
      node.children.forEach((c4) => setDepth(c4, d5 + 1));
    }
    roots.sort((a4, b4) => nanoToMs(a4.span.startTime) - nanoToMs(b4.span.startTime));
    roots.forEach((r5) => setDepth(r5, 0));
    const flat = [];
    function flatten(node) {
      flat.push(node);
      node.children.forEach(flatten);
    }
    roots.forEach(flatten);
    return flat;
  }

  // media/src/state.ts
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
  var spans = y3(window.__INITIAL_SPANS__ ?? []);
  var sessionSummary = y3(window.__INITIAL_SESSION_SUMMARY__ ?? null);
  var toolCalls = y3(window.__INITIAL_TOOL_CALLS__ ?? {});
  var sessionLimit = y3(10);
  var selectedAgentFilter = y3("all");
  var insightFilter = y3("all");
  var activeTab = y3("efficiency");
  var retainWaterfall = y3(true);
  var retainSummaryWaterfall = y3(true);
  var waterfallSpans = y3([]);
  var swRetainedSessions = y3([]);
  var swLastSessionCount = y3(0);
  var expandedSpanIds = makeSetSignal();
  var dismissedSpanIds = makeSetSignal();
  var lastSeenTraceIds = makeSetSignal();
  var ignoredInsightKeys = makeSetSignal();
  var vscode = null;
  function setVscode(api) {
    vscode = api;
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
    const all = sessionSummary.value?.sessions ?? [];
    const filter = selectedAgentFilter.value;
    if (filter === "all") return all;
    return all.filter((s4) => s4.source === filter);
  });
  var displaySessions = g2(() => {
    const all = agentFilteredSessions.value;
    const limit = sessionLimit.value;
    if (limit >= all.length) return all;
    return all.slice(all.length - limit);
  });
  var displaySpans = g2(() => {
    const ds = displaySessions.value;
    if (!ds.length) {
      const filter = selectedAgentFilter.value;
      if (filter === "all") return spans.value;
      return spans.value.filter((s4) => inferSpanSource(s4) === filter);
    }
    const traceIds = new Set(ds.map((s4) => s4.traceId).filter(Boolean));
    if (traceIds.size === 0) {
      const filter = selectedAgentFilter.value;
      if (filter === "all") return spans.value;
      return spans.value.filter((s4) => inferSpanSource(s4) === filter);
    }
    return spans.value.filter((s4) => traceIds.has(s4.traceId));
  });
  var agentPresence = g2(() => {
    const sessions = displaySessions.value;
    return {
      claude: sessions.some((s4) => s4.source === "claude_code"),
      copilot: sessions.some((s4) => s4.source === "copilot"),
      codex: sessions.some((s4) => s4.source === "codex")
    };
  });

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

  // media/src/tabs/Efficiency.tsx
  function ContextGrowthChart({ sessions }) {
    const canvasRef = A2(null);
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const seriesData = [];
      let globalMax = 0, globalMin = Infinity, globalMaxPoints = 0;
      sessions.forEach((sess, idx) => {
        const llmEntries = (sess.timeline ?? []).filter((e4) => e4.type === "llm" && (e4.inputTokens ?? 0) > 0);
        if (llmEntries.length < 1) return;
        const points = llmEntries.map((e4) => e4.inputTokens ?? 0);
        const max = Math.max(...points), min = Math.min(...points);
        if (max > globalMax) globalMax = max;
        if (min < globalMin) globalMin = min;
        if (points.length > globalMaxPoints) globalMaxPoints = points.length;
        const sessionNum = getSessionGlobalNumber(sess) || idx + 1;
        seriesData.push({ label: "" + sessionNum, points, color: getAgentColor(sess.source) || COLORS[idx % COLORS.length] });
      });
      if (seriesData.length === 0) {
        canvas.style.display = "none";
        return;
      }
      canvas.style.display = "block";
      const dataRange = globalMax - globalMin;
      const adjRange = dataRange === 0 ? globalMax * 0.1 || 1 : dataRange;
      const yPad = adjRange * 0.1;
      const yMin = Math.max(0, globalMin - yPad), yMax = globalMax + yPad;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w5 = rect.width, h5 = rect.height;
      ctx.clearRect(0, 0, w5, h5);
      const pad = { top: 8, right: 40, bottom: 24, left: 64 };
      const chartW = w5 - pad.left - pad.right, chartH = h5 - pad.top - pad.bottom;
      const cs = getComputedStyle(document.body);
      const gridColor = cs.getPropertyValue("--vscode-panel-border").trim() || "#333";
      const textColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
      const fontStr = "10px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
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
      ctx.save();
      ctx.translate(10, pad.top + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = textColor;
      ctx.font = fontStr;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Input Tokens", 0, 0);
      ctx.restore();
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Turns (LLM Calls)", pad.left + chartW / 2, pad.top + chartH + 10);
      seriesData.forEach((series) => {
        const pts = series.points;
        const lastX = pad.left + (pts.length - 1) / Math.max(globalMaxPoints - 1, 1) * chartW;
        const lastY = pad.top + chartH - (pts[pts.length - 1] - yMin) / (yMax - yMin) * chartH;
        if (pts.length >= 2) {
          ctx.beginPath();
          for (let j4 = 0; j4 < pts.length; j4++) {
            const x4 = pad.left + j4 / Math.max(globalMaxPoints - 1, 1) * chartW;
            const y5 = pad.top + chartH - (pts[j4] - yMin) / (yMax - yMin) * chartH;
            j4 === 0 ? ctx.moveTo(x4, y5) : ctx.lineTo(x4, y5);
          }
          ctx.strokeStyle = series.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(lastX, lastY, pts.length === 1 ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = series.color;
        ctx.fill();
        ctx.fillStyle = series.color;
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(series.label, lastX + (pts.length === 1 ? 9 : 5), lastY);
      });
    });
    return /* @__PURE__ */ u4("canvas", { ref: canvasRef, id: "context-growth-chart", style: "width:100%;height:180px;display:block" });
  }
  var HELP_TOOLTIPS = {
    "help-tool-failures": "Failures come from guessed file paths or unavailable commands. Provide exact paths and tell the agent which tools and runtimes are available.",
    "help-high-turns": "Prompt describes the goal but not the location. Add explicit file paths, stopping conditions, and break multi-step tasks into separate prompts.",
    "help-cache-rate": "Cache breaks when the prompt prefix changes between calls. Keep static instructions identical at the top; avoid timestamps in instruction files.",
    "help-large-context": "Large instruction files make every session start expensive. Audit and trim instruction files; move reference docs out of instruction files.",
    "help-context-bloat": "Tool results and instruction files expand context each turn. Keep instruction files under 4 KB; use line-ranged reads instead of full file reads."
  };
  function renderHeatReason(r5) {
    if (!r5.linkPhrase || !r5.helpId) return /* @__PURE__ */ u4("span", { style: "color:var(--fg)", children: r5.text });
    const idx = r5.text.indexOf(r5.linkPhrase);
    if (idx === -1) return /* @__PURE__ */ u4("span", { style: "color:var(--fg)", children: r5.text });
    const before = r5.text.slice(0, idx);
    const after = r5.text.slice(idx + r5.linkPhrase.length);
    const tip = HELP_TOOLTIPS[r5.helpId] || "";
    return /* @__PURE__ */ u4("span", { style: "color:var(--fg)", children: [
      before,
      /* @__PURE__ */ u4("span", { "data-tip": tip, style: "border-bottom:1px dotted currentColor;cursor:help", children: r5.linkPhrase }),
      after
    ] });
  }
  function SessionDiagRow({ reasons }) {
    return /* @__PURE__ */ u4("tr", { children: /* @__PURE__ */ u4("td", { colSpan: 11, style: "padding:0", children: /* @__PURE__ */ u4("div", { style: "padding:8px 16px 12px 32px;background:var(--vscode-editorWidget-background,var(--bg));border-top:1px solid var(--border);font-size:11px", children: [
      /* @__PURE__ */ u4("div", { style: "font-weight:600;color:var(--muted);margin-bottom:4px;font-size:10px;text-transform:uppercase", children: "What needs attention" }),
      reasons.map((r5, i4) => /* @__PURE__ */ u4("div", { style: "display:flex;align-items:baseline;gap:6px;margin-bottom:3px", children: [
        /* @__PURE__ */ u4("span", { style: "color:var(--error);flex-shrink:0", children: "\u2022" }),
        renderHeatReason(r5)
      ] }, i4))
    ] }) }) });
  }
  function SessionRow({ sess, idx, heat, expanded, onToggle }) {
    const realIdx = getSessionGlobalNumber(sess) || idx + 1;
    const cacheRate = sess.inputTokens > 0 ? (sess.cacheReadTokens / sess.inputTokens * 100).toFixed(0) : "\u2014";
    const agentDotColor = getAgentColor(sess.source);
    let rowBg = "";
    if (heat.score > 60) rowBg = "rgba(255,50,50," + (0.15 + Math.min(heat.score - 60, 40) / 40 * 0.25) + ")";
    else if (heat.score > 30) rowBg = "rgba(255,140,0," + (0.12 + (heat.score - 30) / 30 * 0.18) + ")";
    else if (heat.score > 10) rowBg = "rgba(255,180,50," + (0.1 + (heat.score - 10) / 20 * 0.15) + ")";
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("tr", { style: "background:" + (rowBg || "transparent") + ";cursor:pointer", onClick: onToggle, children: [
        /* @__PURE__ */ u4("td", { style: "text-align:center;font-weight:bold;white-space:nowrap", children: [
          /* @__PURE__ */ u4("span", { style: "font-size:9px;color:var(--muted);margin-right:3px", children: expanded ? "\u25BC" : "\u25B6" }),
          realIdx,
          " ",
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:8px;height:8px;border-radius:50%;background:" + agentDotColor + ";vertical-align:middle" })
        ] }),
        /* @__PURE__ */ u4("td", { style: "text-align:left;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", title: sess.userRequest, children: [
          (sess.userRequest ?? "").slice(0, 60),
          (sess.userRequest ?? "").length > 60 ? "\u2026" : ""
        ] }),
        /* @__PURE__ */ u4("td", { style: "text-align:left;white-space:nowrap;color:var(--muted);font-size:10px", title: sess.model, children: sess.model ? sess.model.split("/").pop() : "\u2014" }),
        /* @__PURE__ */ u4("td", { style: "text-align:left;white-space:nowrap;font-size:10px;font-family:monospace;color:var(--muted)", title: sess.conversationId || "", children: sess.conversationId ? sess.conversationId.slice(0, 8) : "\u2014" }),
        /* @__PURE__ */ u4("td", { class: "right", children: sess.totalLlmCalls }),
        /* @__PURE__ */ u4("td", { class: "right", children: sess.totalToolCalls }),
        /* @__PURE__ */ u4("td", { class: "right", children: sess.inputTokens.toLocaleString() }),
        /* @__PURE__ */ u4("td", { class: "right", children: sess.outputTokens.toLocaleString() }),
        /* @__PURE__ */ u4("td", { class: "right", children: [
          cacheRate,
          "%"
        ] }),
        /* @__PURE__ */ u4("td", { class: "right", children: formatMs(sess.durationMs) }),
        /* @__PURE__ */ u4("td", { style: "text-align:right" + (sess.errors > 0 ? ";color:var(--error)" : ""), children: sess.errors })
      ] }),
      expanded && heat.reasons.length > 0 && /* @__PURE__ */ u4(SessionDiagRow, { reasons: heat.reasons })
    ] });
  }
  function Efficiency() {
    const summary = sessionSummary.value;
    const [expandedRows, setExpandedRows] = d2(/* @__PURE__ */ new Set([0]));
    if (!summary?.sessions?.length) {
      return /* @__PURE__ */ u4("div", { id: "efficiency-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const displaySess = displaySessions.value;
    const breakdownSessions = displaySess.slice().reverse();
    const sessionHeats = breakdownSessions.map((sess) => {
      let score = 0;
      const reasons = [];
      if (sess.errors > 0) {
        score += Math.min(sess.errors * 25, 40);
        reasons.push({ text: sess.errors + " error" + (sess.errors > 1 ? "s" : "") + " \u2014 be explicit about file locations and command availability to avoid failed tool calls", linkPhrase: "be explicit about file locations and command availability", helpId: "help-tool-failures" });
      }
      if (sess.totalLlmCalls > 8) {
        score += Math.min((sess.totalLlmCalls - 8) * 4, 30);
        reasons.push({ text: sess.totalLlmCalls + " LLM calls \u2014 break the task into smaller pieces with explicit stopping conditions", linkPhrase: "break the task into smaller pieces with explicit stopping conditions", helpId: "help-high-turns" });
      }
      const cacheRateNum = sess.inputTokens > 0 ? sess.cacheReadTokens / sess.inputTokens * 100 : 100;
      if (cacheRateNum < 50 && sess.inputTokens > 5e3) {
        score += Math.min((50 - cacheRateNum) * 0.5, 20);
        reasons.push({ text: "Cache hit rate " + cacheRateNum.toFixed(0) + "% \u2014 keep static content at the top of prompts so the cache prefix stays stable", linkPhrase: "keep static content at the top of prompts so the cache prefix stays stable", helpId: "help-cache-rate" });
      }
      if (sess.inputTokens > 1e5) {
        score += 10;
        reasons.push({ text: sess.inputTokens.toLocaleString() + " input tokens \u2014 audit your instruction files and remove verbose examples", linkPhrase: "audit your instruction files and remove verbose examples", helpId: "help-large-context" });
      }
      const llmEntries = (sess.timeline ?? []).filter((e4) => e4.type === "llm" && (e4.inputTokens ?? 0) > 0);
      if (llmEntries.length >= 3) {
        const first = llmEntries[0].inputTokens ?? 0, last = llmEntries[llmEntries.length - 1].inputTokens ?? 0;
        const growthPct = first > 0 ? (last - first) / first * 100 : 0;
        if (growthPct > 50) {
          score += Math.min(growthPct / 10, 15);
          reasons.push({ text: "Context grew " + growthPct.toFixed(0) + "% \u2014 review instruction file sizes and use narrower tool reads", linkPhrase: "review instruction file sizes and use narrower tool reads", helpId: "help-context-bloat" });
        }
      }
      return { score: Math.min(score, 100), reasons };
    });
    let totLlm = 0, totTool = 0, totIn = 0, totOut = 0, totDur = 0, totErr = 0;
    breakdownSessions.forEach((s4) => {
      totLlm += s4.totalLlmCalls;
      totTool += s4.totalToolCalls;
      totIn += s4.inputTokens;
      totOut += s4.outputTokens;
      totDur += s4.durationMs;
      totErr += s4.errors;
    });
    const sessionsWithGrowth = breakdownSessions.filter(
      (sess) => (sess.timeline ?? []).filter((e4) => e4.type === "llm" && (e4.inputTokens ?? 0) > 0).length >= 1
    );
    return /* @__PURE__ */ u4("div", { id: "efficiency-content", children: [
      sessionsWithGrowth.length > 0 && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("h3", { class: "has-metric-tip", style: "margin:24px 0 12px;font-size:13px;color:var(--muted)", "data-tip": "Input tokens sent per LLM call within each session. Rising lines indicate context accumulation. A sharp drop mid-session indicates context compaction. A single dot marks an in-progress session with one LLM call so far.", children: "CONTEXT GROWTH PER SESSION" }),
        /* @__PURE__ */ u4(ContextGrowthChart, { sessions: breakdownSessions }),
        /* @__PURE__ */ u4("div", { style: "font-size:10px;color:var(--muted);opacity:0.7;margin:4px 0 12px 2px", children: "Suggestion: If the graph appears crowded, consider refining the view by selecting fewer sessions (such as \u201CLast 5\u201D) or filtering by a specific agent to enhance clarity." })
      ] }),
      breakdownSessions.length > 0 && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("h3", { class: "has-metric-tip", style: "margin:24px 0 12px;font-size:13px;color:var(--muted)", "data-tip": "Per-session metrics with heat coloring. Warmer colors indicate higher token usage or more errors. Expand a row to see efficiency notes.", children: "SESSION BREAKDOWN" }),
        /* @__PURE__ */ u4("div", { style: "display:flex;gap:16px;margin-bottom:4px;font-size:10px;color:var(--muted);align-items:center", children: [
          /* @__PURE__ */ u4("span", { style: "font-weight:600", children: "Usage:" }),
          /* @__PURE__ */ u4("span", { class: "flex-4", children: [
            /* @__PURE__ */ u4("span", { style: "display:inline-block;width:12px;height:10px;border-radius:2px;background:var(--vscode-editorWidget-background,var(--bg));border:1px solid var(--border)" }),
            " Minimal"
          ] }),
          /* @__PURE__ */ u4("span", { class: "flex-4", children: [
            /* @__PURE__ */ u4("span", { style: "display:inline-block;width:12px;height:10px;border-radius:2px;background:rgba(255,180,50,0.25);border:1px solid rgba(255,180,50,0.4)" }),
            " Light"
          ] }),
          /* @__PURE__ */ u4("span", { class: "flex-4", children: [
            /* @__PURE__ */ u4("span", { style: "display:inline-block;width:12px;height:10px;border-radius:2px;background:rgba(255,140,0,0.30);border:1px solid rgba(255,140,0,0.5)" }),
            " Moderate"
          ] }),
          /* @__PURE__ */ u4("span", { class: "flex-4", children: [
            /* @__PURE__ */ u4("span", { style: "display:inline-block;width:12px;height:10px;border-radius:2px;background:rgba(255,50,50,0.35);border:1px solid rgba(255,50,50,0.5)" }),
            " Heavy"
          ] })
        ] }),
        /* @__PURE__ */ u4("table", { class: "tool-insights-table", children: [
          /* @__PURE__ */ u4("thead", { children: /* @__PURE__ */ u4("tr", { children: [
            /* @__PURE__ */ u4("th", { style: "text-align:center", "data-tip": "Session number", children: "#" }),
            /* @__PURE__ */ u4("th", { style: "text-align:left", "data-tip": "The user prompt that started this session", children: "Prompt" }),
            /* @__PURE__ */ u4("th", { style: "text-align:left", "data-tip": "LLM model used", children: "Model" }),
            /* @__PURE__ */ u4("th", { style: "text-align:left", "data-tip": "Conversation thread ID \u2014 groups multiple sessions from the same chat thread. Copilot and Codex report this; Claude sessions are standalone with no conversation wrapper.", children: "Conv ID" }),
            /* @__PURE__ */ u4("th", { class: "right", "data-tip": "LLM round-trips", children: "LLM Calls" }),
            /* @__PURE__ */ u4("th", { class: "right", "data-tip": "Tool invocations", children: "Tool Calls" }),
            /* @__PURE__ */ u4("th", { class: "right", "data-tip": "Total input tokens", children: "Input Tokens" }),
            /* @__PURE__ */ u4("th", { class: "right", "data-tip": "Total output tokens", children: "Output Tokens" }),
            /* @__PURE__ */ u4("th", { class: "right", "data-tip": "Cache hit rate", children: "Cache Hit" }),
            /* @__PURE__ */ u4("th", { class: "right", "data-tip": "Wall-clock duration", children: "Duration" }),
            /* @__PURE__ */ u4("th", { class: "right", "data-tip": "Error count", children: "Errors" })
          ] }) }),
          /* @__PURE__ */ u4("tbody", { children: breakdownSessions.map((sess, idx) => /* @__PURE__ */ u4(
            SessionRow,
            {
              sess,
              idx,
              heat: sessionHeats[idx],
              expanded: expandedRows.has(idx),
              onToggle: () => setExpandedRows((prev) => {
                const next = new Set(prev);
                next.has(idx) ? next.delete(idx) : next.add(idx);
                return next;
              })
            },
            sess.traceId + idx
          )) }),
          /* @__PURE__ */ u4("tfoot", { children: /* @__PURE__ */ u4("tr", { children: [
            /* @__PURE__ */ u4("td", {}),
            /* @__PURE__ */ u4("td", { style: "text-align:left", children: /* @__PURE__ */ u4("strong", { children: "Total" }) }),
            /* @__PURE__ */ u4("td", {}),
            /* @__PURE__ */ u4("td", {}),
            /* @__PURE__ */ u4("td", { class: "right", children: /* @__PURE__ */ u4("strong", { children: totLlm }) }),
            /* @__PURE__ */ u4("td", { class: "right", children: /* @__PURE__ */ u4("strong", { children: totTool }) }),
            /* @__PURE__ */ u4("td", { class: "right", children: /* @__PURE__ */ u4("strong", { children: totIn.toLocaleString() }) }),
            /* @__PURE__ */ u4("td", { class: "right", children: /* @__PURE__ */ u4("strong", { children: totOut.toLocaleString() }) }),
            /* @__PURE__ */ u4("td", {}),
            /* @__PURE__ */ u4("td", { class: "right", children: /* @__PURE__ */ u4("strong", { children: formatMs(totDur) }) }),
            /* @__PURE__ */ u4("td", { style: "text-align:right" + (totErr > 0 ? ";color:var(--error)" : ""), children: /* @__PURE__ */ u4("strong", { children: totErr }) })
          ] }) })
        ] })
      ] })
    ] });
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

  // media/src/tabs/Recommendations.tsx
  function recommendationScopeLabel(filter) {
    if (filter === "loop") return "loop recommendations";
    if (filter === "efficiency") return "efficiency recommendations";
    return "recommendations";
  }
  function noActiveTakeawayText(filter) {
    if (filter === "loop") return "No active loop or malfunction signals in this view.";
    if (filter === "efficiency") return "No active efficiency issues in this view.";
    return "No significant inefficiencies detected. Token usage looks healthy.";
  }
  function summarizeTakeaways(insights) {
    const summary = {
      loopCount: 0,
      hasContextBloat: false,
      hasCacheIssue: false,
      hasToolIssue: false,
      hasRepeatedOperations: false
    };
    for (const insight of insights) {
      const title = insight.title.toLowerCase();
      if (insight.category === "loop") summary.loopCount++;
      if (title.includes("context grew") || title.includes("starts with")) summary.hasContextBloat = true;
      if (title.includes("cache hit")) summary.hasCacheIssue = true;
      if (title.includes("tool failure") || title.includes("tool definitions") || title.includes("large tool")) summary.hasToolIssue = true;
      if (title.includes("files read multiple") || title.includes("duplicate searches") || title.includes("files appear")) summary.hasRepeatedOperations = true;
    }
    return summary;
  }
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
    const sessionNum = session ? getSessionGlobalNumber(session) : 0;
    const titleSessionMatch = session && sessionNum > 0 ? ins.title.match(/^\[Session\s+\d+\]\s*(.*)$/) : null;
    const sessionModel = session?.model || "";
    const sessionAgentLabel = session ? getAgentSourceLabel(session.source) : "";
    const sessionAgentColor = session ? getAgentColor(session.source) : "";
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
      lines.push("Recommendation: " + ins.action);
      return lines.join("\n");
    }
    return /* @__PURE__ */ u4("div", { class: clsx_default("insight-card", "insight-" + ins.severity), style: isIgnored ? "opacity:0.55" : "", children: [
      /* @__PURE__ */ u4("div", { class: "insight-header", children: [
        /* @__PURE__ */ u4("span", { class: "insight-icon", children: icon }),
        /* @__PURE__ */ u4("span", { class: "insight-title", style: "flex:1", children: titleSessionMatch ? /* @__PURE__ */ u4(S, { children: [
          /* @__PURE__ */ u4("span", { children: [
            "[Session ",
            sessionNum,
            sessionModel ? ` \u2013 ${sessionModel}` : "",
            "]"
          ] }),
          " ",
          /* @__PURE__ */ u4(
            "span",
            {
              title: sessionAgentLabel,
              "aria-label": sessionAgentLabel,
              style: "display:inline-block;width:8px;height:8px;border-radius:50%;background:" + sessionAgentColor + ";vertical-align:middle"
            }
          ),
          " ",
          /* @__PURE__ */ u4("span", { children: titleSessionMatch[1] })
        ] }) : ins.title }),
        isIgnored ? /* @__PURE__ */ u4("button", { class: "insight-restore-btn", title: "Restore", onClick: () => ignoredInsightKeys.delete(ins.title), children: "Restore" }) : /* @__PURE__ */ u4("button", { class: "insight-ignore-btn", title: "Ignore", onClick: () => ignoredInsightKeys.add(ins.title), children: "Ignore" })
      ] }),
      ins.detail && /* @__PURE__ */ u4("div", { class: "insight-detail", style: "white-space:pre-wrap", children: ins.detail }),
      /* @__PURE__ */ u4("div", { class: "insight-action", children: [
        /* @__PURE__ */ u4("span", { class: "insight-action-label", children: [
          "Recommendation",
          ins.helpId && HELP_WHY[ins.helpId] && /* @__PURE__ */ u4("span", { "data-tip": HELP_WHY[ins.helpId], style: "margin-left:4px;cursor:help;opacity:0.55;font-size:11px", children: "\u24D8" }),
          ":"
        ] }),
        " ",
        /* @__PURE__ */ u4("span", { style: "white-space:pre-wrap", children: ins.action })
      ] }),
      !isIgnored && (() => {
        const buttonForAgent = (agent) => {
          const label = getAgentSourceLabel(agent);
          return {
            agent,
            label: "Copy for " + label,
            color: getAgentColor(agent)
          };
        };
        let buttons;
        if (session) {
          buttons = [buttonForAgent(session.source)];
        } else {
          const presence = agentPresence.value;
          buttons = [
            presence.copilot && buttonForAgent("copilot"),
            presence.claude && buttonForAgent("claude_code"),
            presence.codex && buttonForAgent("codex")
          ].filter(Boolean);
        }
        if (buttons.length === 0) buttons.push({ agent: "generic", label: "Copy to Clipboard", color: "var(--accent)" });
        const prompt = buildAiPrompt();
        return /* @__PURE__ */ u4("div", { class: "insight-ask-ai-group", children: buttons.map((b4) => /* @__PURE__ */ u4(
          "button",
          {
            class: "insight-ask-ai",
            onClick: () => vscode?.postMessage({ type: "askAI", prompt, agent: b4.agent, label: ins.title }),
            children: [
              /* @__PURE__ */ u4("span", { style: "color:" + b4.color + ";font-size:8px", children: "\u25CF" }),
              " ",
              b4.label
            ]
          },
          b4.agent
        )) });
      })()
    ] });
  }
  function IgnoredSection({ insights, sessions }) {
    const [open, setOpen] = d2(false);
    return /* @__PURE__ */ u4("div", { style: "margin-top:12px", children: [
      /* @__PURE__ */ u4(
        "h3",
        {
          style: "margin:28px 0 12px;font-size:13px;color:var(--muted);display:flex;align-items:center;gap:8px;cursor:pointer",
          onClick: () => setOpen((v4) => !v4),
          children: [
            /* @__PURE__ */ u4("span", { children: open ? "\u25BC" : "\u25B6" }),
            "IGNORED (",
            insights.length,
            ")"
          ]
        }
      ),
      open && insights.map((ins) => /* @__PURE__ */ u4(InsightCard, { ins, isIgnored: true, sessions }, ins.title))
    ] });
  }
  function Recommendations() {
    const filter = insightFilter.value;
    const ignored = ignoredInsightKeys.value;
    const allSessions = displaySessions.value;
    if (!allSessions.length) {
      return /* @__PURE__ */ u4("div", { id: "recommendations-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const displaySummary = buildDisplaySummary();
    const allInsights = generateInsights(displaySummary, allSessions);
    let loopCount = 0;
    let effCount = 0;
    const active = [];
    const ignoredList = [];
    for (const insight of allInsights) {
      const isIgnored = ignored.has(insight.title);
      if (!isIgnored) {
        if (insight.category === "loop") loopCount++;
        if (insight.category === "efficiency") effCount++;
      }
      if (filter === "all" || insight.category === filter) {
        if (isIgnored) ignoredList.push(insight);
        else active.push(insight);
      }
    }
    const sessions = displaySummary.sessions;
    const takeaways = summarizeTakeaways(active);
    const scopeLabel = recommendationScopeLabel(filter);
    return /* @__PURE__ */ u4("div", { id: "recommendations-content", children: [
      /* @__PURE__ */ u4("div", { style: "font-size:11px;color:var(--muted);padding:6px 10px;margin-bottom:12px;border-left:2px solid var(--border)", children: /* @__PURE__ */ u4("strong", { children: "Recommendations are based on general heuristics and may include false positives. Review suggestions carefully and consider your specific context before making changes." }) }),
      /* @__PURE__ */ u4("div", { style: "padding:12px 16px;margin:0 0 16px;border-radius:6px;border:1px solid var(--border);background:var(--vscode-editorWidget-background,var(--bg));font-size:12px", children: [
        /* @__PURE__ */ u4("div", { class: "section-label", children: "Key Takeaways" }),
        active.length > 0 ? /* @__PURE__ */ u4("ul", { style: "margin:0;padding:0 0 0 16px;list-style:disc", children: [
          takeaways.loopCount > 0 && /* @__PURE__ */ u4("li", { style: "margin-bottom:2px", children: [
            takeaways.loopCount,
            " agent loop or malfunction signal",
            takeaways.loopCount > 1 ? "s" : "",
            " detected"
          ] }),
          takeaways.hasContextBloat && /* @__PURE__ */ u4("li", { style: "margin-bottom:2px", children: "Context bloat detected \u2014 input tokens growing significantly across turns" }),
          takeaways.hasCacheIssue && /* @__PURE__ */ u4("li", { style: "margin-bottom:2px", children: "Low prompt cache hit rate \u2014 tokens are being re-processed instead of cached" }),
          takeaways.hasToolIssue && /* @__PURE__ */ u4("li", { style: "margin-bottom:2px", children: "Tool inefficiency detected" }),
          takeaways.hasRepeatedOperations && /* @__PURE__ */ u4("li", { style: "margin-bottom:2px", children: "Repeated file or search operations detected" })
        ] }) : /* @__PURE__ */ u4("div", { style: "color:var(--vscode-testing-iconPassed,#4caf50)", children: [
          "\u2713 ",
          noActiveTakeawayText(filter)
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { class: "insight-filter-bar", children: [
        { key: "all", label: "All", badge: loopCount + effCount },
        { key: "loop", label: "Loops", badge: loopCount },
        { key: "efficiency", label: "Inefficiencies", badge: effCount }
      ].map((p5) => /* @__PURE__ */ u4(
        "button",
        {
          class: clsx_default("insight-filter-pill", { active: filter === p5.key }),
          onClick: () => {
            insightFilter.value = p5.key;
          },
          children: [
            p5.label,
            p5.badge > 0 && /* @__PURE__ */ u4("span", { class: "insight-filter-badge", children: p5.badge })
          ]
        },
        p5.key
      )) }),
      active.length > 0 ? /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("div", { style: "font-size:11px;color:var(--muted);margin-bottom:12px", children: [
          active.length,
          " recommendation",
          active.length !== 1 ? "s" : "",
          ", newest sessions first"
        ] }),
        active.map((ins) => /* @__PURE__ */ u4(InsightCard, { ins, isIgnored: false, sessions }, ins.title))
      ] }) : ignoredList.length > 0 ? /* @__PURE__ */ u4("div", { class: "insight-card insight-success", children: [
        /* @__PURE__ */ u4("div", { class: "insight-header", children: [
          /* @__PURE__ */ u4("span", { class: "insight-icon", children: "\u2713" }),
          /* @__PURE__ */ u4("span", { class: "insight-title", children: [
            "All ",
            scopeLabel,
            " addressed or ignored"
          ] })
        ] }),
        /* @__PURE__ */ u4("div", { class: "insight-detail", children: "New ones will appear as your session data changes." })
      ] }) : /* @__PURE__ */ u4("div", { class: "insight-card insight-success", children: [
        /* @__PURE__ */ u4("div", { class: "insight-header", children: [
          /* @__PURE__ */ u4("span", { class: "insight-icon", children: "\u2713" }),
          /* @__PURE__ */ u4("span", { class: "insight-title", children: [
            "No ",
            scopeLabel,
            " detected"
          ] })
        ] }),
        /* @__PURE__ */ u4("div", { class: "insight-detail", children: "Token usage, cache rates, and session patterns look reasonable." })
      ] }),
      ignoredList.length > 0 && /* @__PURE__ */ u4(IgnoredSection, { insights: ignoredList, sessions })
    ] });
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
  var PRICING_LAST_UPDATED = "2026-05-27";
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
    // TBD per docs
    // ── Anthropic ──────────────────────────────────────────────────────────────────────────────────
    "claude-haiku-4-5": { inputPerMTok: 1, cacheReadPerMTok: 0.1, cacheWritePerMTok: 1.25, outputPerMTok: 5, multiplier: 0.33, multiplierAnnualPostJun1: 0.33 },
    "claude-sonnet-4": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, multiplier: 1, multiplierAnnualPostJun1: 1 },
    "claude-sonnet-4-5": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, multiplier: 1, multiplierAnnualPostJun1: 6 },
    "claude-sonnet-4-6": { inputPerMTok: 3, cacheReadPerMTok: 0.3, cacheWritePerMTok: 3.75, outputPerMTok: 15, multiplier: 1, multiplierAnnualPostJun1: 9 },
    "claude-opus-4-5": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, multiplier: 3, multiplierAnnualPostJun1: 15 },
    "claude-opus-4-6": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, multiplier: 3, multiplierAnnualPostJun1: 27 },
    "claude-opus-4-6-fast": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, multiplier: 30, multiplierAnnualPostJun1: 30 },
    "claude-opus-4-7": { inputPerMTok: 5, cacheReadPerMTok: 0.5, cacheWritePerMTok: 6.25, outputPerMTok: 25, multiplier: 15, multiplierAnnualPostJun1: 27 },
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

  // media/src/AgentThresholdValues.tsx
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
  function computeAlertCount() {
    const configs = getAlertConfigs();
    const profiles = getAgentProfiles();
    const { sessions, efficiency } = buildDisplaySummary();
    return configs.filter((cfg) => cfg.enabled && evaluateAlert(cfg, sessions, efficiency, profiles).triggered).length;
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

  // media/src/tabs/Tokens.tsx
  function getOutputTokenCount(span) {
    let output = 0;
    (span.attributes ?? []).forEach((a4) => {
      if (/output.?tokens|completion.?tokens/i.test(a4.key))
        output = parseInt(String(a4.value.intValue ?? a4.value.stringValue ?? a4.value.doubleValue)) || 0;
    });
    return output;
  }
  function SessionChart({ sessions }) {
    const canvasRef = A2(null);
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const sessionData = sessions.map((sess, idx) => {
        const totalIn = sess.inputTokens ?? 0, totalOut = sess.outputTokens ?? 0;
        const inputs = [], outputs = [];
        (sess.timeline ?? []).forEach((e4) => {
          if (e4.type === "llm" && ((e4.inputTokens ?? 0) > 0 || (e4.outputTokens ?? 0) > 0)) {
            inputs.push(e4.inputTokens ?? 0);
            outputs.push(e4.outputTokens ?? 0);
          }
        });
        if (inputs.length === 0 && (totalIn > 0 || totalOut > 0)) {
          inputs.push(totalIn);
          outputs.push(totalOut);
        }
        const num = getSessionGlobalNumber(sess) || idx + 1;
        return totalIn + totalOut > 0 ? { session: num, tokens: totalIn + totalOut, inputTokens: inputs, outputTokens: outputs, source: sess.source } : null;
      }).filter(Boolean).reverse();
      if (sessionData.length === 0) {
        canvas.style.display = "none";
        return;
      }
      canvas.style.display = "block";
      const dpr = window.devicePixelRatio || 1;
      const drect = canvas.getBoundingClientRect();
      canvas.width = drect.width * dpr;
      canvas.height = drect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      const w5 = drect.width, h5 = drect.height;
      ctx.clearRect(0, 0, w5, h5);
      const pad = { top: 8, right: 44, bottom: 34, left: 44 };
      const chartW = w5 - pad.left - pad.right, chartH = h5 - pad.top - pad.bottom;
      const sessionTotals = sessionData.map((d5) => {
        const input = d5.inputTokens.reduce((a4, b4) => a4 + b4, 0);
        const output = d5.outputTokens.reduce((a4, b4) => a4 + b4, 0);
        return { input, output, session: d5.session, source: d5.source };
      });
      const maxIn = Math.max(...sessionTotals.map((s4) => s4.input)) || 1;
      const maxOut = Math.max(...sessionTotals.map((s4) => s4.output)) || 1;
      const cs = getComputedStyle(document.body);
      const gridColor = cs.getPropertyValue("--vscode-panel-border").trim() || "#333";
      const textColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
      const fontStr = "10px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
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
      const barGap = 8;
      const sl = sessionData.length;
      const groupWidth = Math.max(12, (chartW - barGap * (sl + 1)) / sl);
      const halfBar = groupWidth / 2;
      const totalBarsW = sl * groupWidth + (sl + 1) * barGap;
      const offsetX = pad.left + (chartW - totalBarsW) / 2 + barGap;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      sessionTotals.forEach((s4, i4) => {
        const x4 = offsetX + i4 * (groupWidth + barGap);
        const inH = s4.input / maxIn * chartH;
        const inY = pad.top + chartH - inH;
        ctx.fillStyle = "#FFB74D";
        ctx.fillRect(x4, inY, halfBar, inH);
        const outH = s4.output / maxOut * chartH;
        const outY = pad.top + chartH - outH;
        ctx.fillStyle = "#81C784";
        ctx.fillRect(x4 + halfBar, outY, halfBar, outH);
        ctx.fillStyle = textColor;
        ctx.fillText("" + s4.session, x4 + groupWidth / 2, pad.top + chartH + 4);
        ctx.beginPath();
        ctx.arc(x4 + groupWidth / 2, pad.top + chartH + 18, 3, 0, Math.PI * 2);
        ctx.fillStyle = getAgentColor(s4.source);
        ctx.fill();
      });
    });
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("canvas", { ref: canvasRef, id: "dashboard-session-chart", style: "width:100%;height:200px;display:block" }),
      /* @__PURE__ */ u4("div", { class: "heatmap-axis-label", children: "\u2190 Session (latest to earliest) \u2192" })
    ] });
  }
  function agentLabel(source) {
    if (source === "claude_code") return "Claude";
    if (source === "copilot") return "Copilot";
    if (source === "codex") return "Codex";
    return "Agent";
  }
  function Tokens() {
    const spans2 = displaySpans.value;
    const sessions = displaySessions.value;
    const byName = {};
    if (sessions.length > 0) {
      sessions.forEach((sess) => {
        ;
        (sess.timeline ?? []).forEach((entry) => {
          const tokens = (entry.inputTokens ?? 0) + (entry.outputTokens ?? 0);
          if (tokens <= 0) {
            return;
          }
          const name = entry.type === "llm" ? entry.model || `${agentLabel(sess.source)} LLM` : `${agentLabel(sess.source)} ${entry.label}`;
          if (!byName[name]) byName[name] = { tokens: 0, count: 0 };
          byName[name].tokens += tokens;
          byName[name].count++;
        });
      });
    } else {
      const tokenSpans = spans2.filter((s4) => getTokenCount(s4) > 0 && !isSessionSpan(s4.name));
      tokenSpans.forEach((s4) => {
        if (!byName[s4.name]) byName[s4.name] = { tokens: 0, count: 0 };
        byName[s4.name].tokens += getTokenCount(s4);
        byName[s4.name].count++;
      });
    }
    if (Object.keys(byName).length === 0) {
      return /* @__PURE__ */ u4("div", { id: "tokens-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const _totalOutput = spans2.reduce((s4, sp) => s4 + getOutputTokenCount(sp), 0);
    const data = Object.entries(byName).map(([name, v4]) => ({ name, ...v4 })).sort((a4, b4) => b4.tokens - a4.tokens);
    const maxTokensBar = data.length > 0 ? data[0].tokens : 1;
    return /* @__PURE__ */ u4("div", { id: "tokens-content", children: [
      /* @__PURE__ */ u4("div", { style: "margin-bottom:24px", children: [
        /* @__PURE__ */ u4("h3", { style: "margin:0 0 8px;font-size:13px;color:var(--muted)", children: "TOKEN USAGE PER SESSION" }),
        /* @__PURE__ */ u4("div", { style: "display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)", children: [
          /* @__PURE__ */ u4("span", { children: [
            /* @__PURE__ */ u4("span", { style: "display:inline-block;width:10px;height:3px;background:#FFB74D;border-radius:1px;vertical-align:middle" }),
            " Input"
          ] }),
          /* @__PURE__ */ u4("span", { children: [
            /* @__PURE__ */ u4("span", { style: "display:inline-block;width:10px;height:3px;background:#81C784;border-radius:1px;vertical-align:middle" }),
            " Output"
          ] })
        ] }),
        /* @__PURE__ */ u4(SessionChart, { sessions })
      ] }),
      /* @__PURE__ */ u4("h3", { style: "margin:32px 0 12px;font-size:13px;color:var(--muted)", children: "TOKENS BY SPAN TYPE" }),
      /* @__PURE__ */ u4("div", { class: "bar-chart-container", style: "margin-top:32px", children: [
        /* @__PURE__ */ u4("div", { class: "bar-chart", children: data.slice(0, 20).map((d5) => {
          const h5 = Math.max(d5.tokens / maxTokensBar * 180, 2);
          const label = d5.name.split("/").pop() ?? d5.name;
          const countLabel = d5.count > 1 ? ` (${d5.count}\xD7)` : "";
          return /* @__PURE__ */ u4("div", { class: "bar-col", children: [
            /* @__PURE__ */ u4("div", { class: "bar-value", children: d5.tokens.toLocaleString() }),
            /* @__PURE__ */ u4("div", { class: "bar-rect", style: "height:" + h5 + "px", title: `${d5.name}: ${d5.tokens.toLocaleString()} tokens${countLabel}` }),
            /* @__PURE__ */ u4("div", { class: "bar-label", children: [
              label,
              countLabel
            ] })
          ] }, d5.name);
        }) }),
        /* @__PURE__ */ u4("div", { class: "axis-label", children: "Token consumption by operation type (top 20, aggregated)" })
      ] })
    ] });
  }

  // media/src/tabs/Cost.tsx
  function fmtUsd(usd) {
    if (usd === 0) return "$0.00";
    if (usd < 1e-3) return "<$0.001";
    if (usd < 1) return "$" + usd.toFixed(3);
    return "$" + usd.toFixed(2);
  }
  function fmtCredits(credits) {
    if (credits === 0) return "0";
    if (credits < 0.1) return "<0.1";
    return credits.toFixed(1);
  }
  function CostBarChart({ sessions, mode }) {
    const canvasRef = A2(null);
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const data = sessions.map((sess, idx) => {
        const cost = calcSessionCost(sess, mode);
        return { cost: cost.totalUsd, unknown: cost.modelUnknown, session: getSessionGlobalNumber(sess) || idx + 1, source: sess.source };
      }).reverse();
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
      const pad = { top: 8, right: 16, bottom: 30, left: 64 };
      const chartW = w5 - pad.left - pad.right;
      const chartH = h5 - pad.top - pad.bottom;
      const cs = getComputedStyle(document.body);
      const gridColor = cs.getPropertyValue("--vscode-panel-border").trim() || "#333";
      const textColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
      const fontStr = "10px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
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
      const barGap = 6;
      const barW = Math.max(10, (chartW - barGap * (data.length + 1)) / data.length);
      const offsetX = pad.left + (chartW - (data.length * barW + (data.length + 1) * barGap)) / 2 + barGap;
      data.forEach((d5, i4) => {
        const x4 = offsetX + i4 * (barW + barGap);
        const barH = d5.cost / maxCost * chartH;
        const y5 = pad.top + chartH - barH;
        const color = d5.unknown ? "#666" : getAgentColor(d5.source);
        if (barH < 1) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x4, pad.top + chartH);
          ctx.lineTo(x4 + barW, pad.top + chartH);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x4, y5, barW, barH);
        }
        ctx.fillStyle = textColor;
        ctx.font = fontStr;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(String(d5.session), x4 + barW / 2, pad.top + chartH + 4);
        if (d5.unknown) {
          ctx.fillStyle = "#999";
          ctx.textBaseline = "bottom";
          ctx.fillText("?", x4 + barW / 2, pad.top + chartH - 3);
        }
      });
    });
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("canvas", { ref: canvasRef, style: "width:100%;height:180px;display:block" }),
      /* @__PURE__ */ u4("div", { class: "heatmap-axis-label", children: "\u2190 Session (latest to earliest) \u2192" })
    ] });
  }
  function Cost() {
    const sessions = displaySessions.value;
    const [mode, setMode] = d2("token");
    const copilotSessions = sessions.filter((s4) => s4.source === "copilot");
    const scopeNote = /* @__PURE__ */ u4("div", { style: "font-size:11px;color:var(--muted);background:var(--hover);border:1px solid var(--border);border-radius:4px;padding:7px 10px;margin-bottom:12px;line-height:1.5", children: [
      "Cost estimation is currently implemented for ",
      /* @__PURE__ */ u4("strong", { children: "Copilot" }),
      " sessions only. Claude and Codex support coming soon."
    ] });
    const disclaimer = /* @__PURE__ */ u4("div", { style: "font-size:11px;background:var(--hover);border:1px solid var(--border);border-left:3px solid var(--warning,#ffb74d);border-radius:4px;padding:8px 10px;margin-bottom:16px;line-height:1.6;color:var(--muted);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap", children: [
      /* @__PURE__ */ u4("span", { children: [
        /* @__PURE__ */ u4("strong", { style: "color:var(--foreground)", children: "Estimates only" }),
        " \u2014 not your actual bill. ",
        /* @__PURE__ */ u4("a", { href: "#cost-known-gaps", style: "color:inherit;text-decoration:underline;text-underline-offset:2px", children: "See known gaps." })
      ] }),
      /* @__PURE__ */ u4("span", { style: "white-space:nowrap", children: [
        "Rates last updated: ",
        PRICING_LAST_UPDATED
      ] })
    ] });
    if (copilotSessions.length === 0) {
      return /* @__PURE__ */ u4("div", { id: "cost-content", children: [
        scopeNote,
        disclaimer,
        /* @__PURE__ */ u4("div", { class: "empty-state", children: "No Copilot sessions recorded \u2014 start a Copilot chat session to see cost estimates" })
      ] });
    }
    const costs = copilotSessions.map((s4) => ({ session: s4, cost: calcSessionCost(s4, mode) }));
    const totalUsd = costs.reduce((sum, c4) => sum + c4.cost.totalUsd, 0);
    const totalCredits = totalUsd / 0.01;
    const anyUnknown = costs.some((c4) => c4.cost.modelUnknown);
    const sessionRows = costs.slice().reverse();
    return /* @__PURE__ */ u4("div", { id: "cost-content", children: [
      scopeNote,
      disclaimer,
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap", children: [
        /* @__PURE__ */ u4("span", { style: "font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px", children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:7px;height:7px;border-radius:50%;background:" + getAgentColor("copilot") + ";vertical-align:middle;margin-right:5px" }),
          "Copilot \u2014 pricing model"
        ] }),
        /* @__PURE__ */ u4("div", { style: "display:flex;gap:4px;flex-wrap:wrap", children: [
          /* @__PURE__ */ u4(
            "button",
            {
              class: "tab-mini" + (mode === "token" ? " active" : ""),
              onClick: () => setMode("token"),
              title: "Token-based AI Credits billing, effective Jun 1, 2026",
              children: "Token-based (from Jun 1, 2026)"
            }
          ),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "tab-mini" + (mode === "request" ? " active" : ""),
              onClick: () => setMode("request"),
              title: "Request-based billing with model multipliers, active before Jun 1, 2026",
              children: "Request-based (pre-Jun 1, 2026)"
            }
          ),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "tab-mini" + (mode === "request-annual" ? " active" : ""),
              onClick: () => setMode("request-annual"),
              title: "Annual plan holders staying on request billing after Jun 1, 2026 face significantly higher multipliers",
              children: "Annual plan request-based (post-Jun 1, 2026)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ u4("h3", { style: "margin:0 0 8px;font-size:13px;color:var(--muted)", children: "ESTIMATED COST PER SESSION" }),
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:12px;margin-bottom:6px;font-size:10px;color:var(--muted)", children: [
        /* @__PURE__ */ u4("span", { children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:8px;height:8px;border-radius:2px;background:#00EAFF;vertical-align:middle;margin-right:3px" }),
          "Copilot"
        ] }),
        /* @__PURE__ */ u4("span", { children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:8px;height:8px;border-radius:2px;background:#FFB085;vertical-align:middle;margin-right:3px" }),
          "Claude"
        ] }),
        /* @__PURE__ */ u4("span", { children: [
          /* @__PURE__ */ u4("span", { style: "display:inline-block;width:8px;height:8px;border-radius:2px;background:#F0FF42;vertical-align:middle;margin-right:3px" }),
          "Codex"
        ] })
      ] }),
      /* @__PURE__ */ u4(CostBarChart, { sessions: copilotSessions, mode }),
      /* @__PURE__ */ u4("h3", { style: "margin:24px 0 8px;font-size:13px;color:var(--muted)", children: "SESSION COST TABLE" }),
      /* @__PURE__ */ u4("div", { style: "overflow-x:auto", children: /* @__PURE__ */ u4("table", { style: "width:100%;border-collapse:collapse;font-size:11px", children: [
        /* @__PURE__ */ u4("thead", { children: /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--vscode-panel-border);color:var(--muted);text-align:left", children: [
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px", children: "#" }),
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px", children: "Agent" }),
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px", children: "Model" }),
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px;text-align:right", children: "Turns" }),
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px;text-align:right", children: "Input tok" }),
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px;text-align:right", children: "Output tok" }),
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px;text-align:right", children: "Cache read" }),
          /* @__PURE__ */ u4("th", { style: "padding:4px 8px;text-align:right", children: "Est. cost" }),
          mode === "token" && /* @__PURE__ */ u4("th", { style: "padding:4px 8px;text-align:right", "data-tip": "Copilot AI Credits (1 credit = $0.01)", children: "Credits" })
        ] }) }),
        /* @__PURE__ */ u4("tbody", { children: sessionRows.map(({ session: s4, cost }) => {
          const num = getSessionGlobalNumber(s4);
          const rawInput = Math.max(0, s4.inputTokens - s4.cacheReadTokens - s4.cacheCreateTokens);
          return /* @__PURE__ */ u4("tr", { style: "border-bottom:1px solid var(--vscode-panel-border)", children: [
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px;color:var(--muted)", children: num }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px", children: [
              /* @__PURE__ */ u4("span", { style: "display:inline-block;width:6px;height:6px;border-radius:50%;background:" + getAgentColor(s4.source) + ";margin-right:5px;vertical-align:middle" }),
              getAgentSourceLabel(s4.source)
            ] }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px;color:var(--muted);font-size:10px", children: s4.model || "\u2014" }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px;text-align:right", children: s4.turns }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px;text-align:right", children: formatCompact(rawInput) }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px;text-align:right", children: formatCompact(s4.outputTokens) }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px;text-align:right", children: s4.cacheReadTokens > 0 ? formatCompact(s4.cacheReadTokens) : "\u2014" }),
            /* @__PURE__ */ u4("td", { style: "padding:4px 8px;text-align:right;font-weight:600", children: cost.modelUnknown ? /* @__PURE__ */ u4("span", { style: "color:var(--muted)", "data-tip": 'Model "' + s4.model + '" not in rate table \u2014 add rates in pricing.ts', children: "~$?" }) : fmtUsd(cost.totalUsd) }),
            mode === "token" && /* @__PURE__ */ u4("td", { style: "padding:4px 8px;text-align:right;color:var(--muted)", children: cost.modelUnknown ? "?" : fmtCredits(cost.aiCredits) })
          ] }, s4.sessionId);
        }) }),
        /* @__PURE__ */ u4("tfoot", { children: /* @__PURE__ */ u4("tr", { style: "border-top:2px solid var(--vscode-panel-border);font-weight:600", children: [
          /* @__PURE__ */ u4("td", { colSpan: 7, style: "padding:6px 8px;text-align:right;color:var(--muted)", children: [
            "Total (",
            copilotSessions.length,
            " Copilot session",
            copilotSessions.length !== 1 ? "s" : "",
            ")"
          ] }),
          /* @__PURE__ */ u4("td", { style: "padding:6px 8px;text-align:right", children: [
            anyUnknown ? "~" : "",
            fmtUsd(totalUsd)
          ] }),
          mode === "token" && /* @__PURE__ */ u4("td", { style: "padding:6px 8px;text-align:right;color:var(--muted)", children: [
            anyUnknown ? "~" : "",
            fmtCredits(totalCredits)
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ u4("div", { style: "margin-top:16px;font-size:10px;color:var(--muted);line-height:1.6", children: mode === "token" ? "Token-based AI Credits: effective Jun 1, 2026. Per-turn chart uses input+output only; session totals include cache tokens." : mode === "request" ? "Request-based: active before Jun 1, 2026. Cost = multiplier \xD7 $0.04 per user prompt. Models marked 0\xD7 (e.g. GPT-4.1) are free under this model." : "Annual plan request-based: for annual-plan holders staying on old billing after Jun 1, 2026. Multipliers are significantly higher on this plan post-June." }),
      /* @__PURE__ */ u4("div", { id: "cost-known-gaps", style: "margin-top:24px;padding-top:16px;border-top:1px solid var(--vscode-panel-border);font-size:11px;color:var(--muted);line-height:1.7", children: [
        /* @__PURE__ */ u4("strong", { style: "color:var(--foreground);font-size:12px", children: "Known gaps" }),
        /* @__PURE__ */ u4("div", { style: "margin-top:8px", children: [
          /* @__PURE__ */ u4("span", { style: "font-size:10px;text-transform:uppercase;letter-spacing:.4px", children: [
            /* @__PURE__ */ u4("span", { style: "display:inline-block;width:6px;height:6px;border-radius:50%;background:" + getAgentColor("copilot") + ";vertical-align:middle;margin-right:4px" }),
            "Copilot"
          ] }),
          /* @__PURE__ */ u4("ul", { style: "margin:4px 0 0;padding-left:18px", children: [
            /* @__PURE__ */ u4("li", { children: "Long-context surcharges are not applied \u2014 GPT-5.4 (prompts >272K tokens) and Gemini 2.5 Pro / 3.1 Pro (prompts >200K tokens) have higher rates above those thresholds, which require per-prompt token counts not available in session telemetry." }),
            /* @__PURE__ */ u4("li", { children: [
              "Models not in the rate table are shown as ",
              /* @__PURE__ */ u4("strong", { children: "~$?" }),
              " \u2014 this can happen when GitHub releases a new model after the last rate update, or when the model ID in telemetry doesn't match the published name."
            ] }),
            /* @__PURE__ */ u4("li", { children: "Request-based cost uses session turn count as a proxy for billable prompts, which may not match exactly for all session shapes." })
          ] })
        ] })
      ] })
    ] });
  }

  // media/src/tabs/Latency.tsx
  function TtftChart({ sessions }) {
    const canvasRef = A2(null);
    y2(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const barData = sessions.map((sess, idx) => {
        const llmEntries = (sess.timeline ?? []).filter((e4) => e4.type === "llm" && (e4.ttft ?? 0) > 0);
        if (llmEntries.length === 0) return null;
        const ttft = Math.round(llmEntries.reduce((s4, e4) => s4 + (e4.ttft ?? 0), 0) / llmEntries.length);
        return ttft > 0 ? { session: getSessionGlobalNumber(sess) || idx + 1, ttft, source: sess.source } : null;
      }).filter(Boolean).reverse();
      if (barData.length === 0) {
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
      const pad = { top: 8, right: 44, bottom: 34, left: 44 };
      const chartW = w5 - pad.left - pad.right, chartH = h5 - pad.top - pad.bottom;
      const maxTtft = Math.max(...barData.map((d5) => d5.ttft)) || 1;
      const cs = getComputedStyle(document.body);
      const gridColor = cs.getPropertyValue("--vscode-panel-border").trim() || "#333";
      const textColor = cs.getPropertyValue("--vscode-descriptionForeground").trim() || "#888";
      const fontStr = "10px " + (cs.getPropertyValue("--vscode-font-family").trim() || "sans-serif");
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
        const val = maxTtft * (4 - i4) / 4;
        if (val > 0) ctx.fillText(formatCompact(val), pad.left - 4, pad.top + chartH * i4 / 4);
      }
      const barGap = 8;
      const sl = barData.length;
      const barWidth = Math.max(12, (chartW - barGap * (sl + 1)) / sl);
      const totalBarsW = sl * barWidth + (sl + 1) * barGap;
      const offsetX = pad.left + (chartW - totalBarsW) / 2 + barGap;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      barData.forEach((d5, i4) => {
        const x4 = offsetX + i4 * (barWidth + barGap);
        const barH = d5.ttft / maxTtft * chartH;
        const barY = pad.top + chartH - barH;
        ctx.fillStyle = getAgentColor(d5.source);
        ctx.fillRect(x4, barY, barWidth, barH);
        ctx.fillStyle = textColor;
        ctx.font = fontStr;
        ctx.fillText("" + d5.session, x4 + barWidth / 2, pad.top + chartH + 4);
      });
    });
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("canvas", { ref: canvasRef, style: "width:100%;height:200px;display:block" }),
      /* @__PURE__ */ u4("div", { class: "heatmap-axis-label", children: "\u2190 Session (latest to earliest) \u2192" })
    ] });
  }
  function Latency() {
    const spans2 = displaySpans.value;
    const sessions = displaySessions.value;
    if (spans2.length === 0) {
      return /* @__PURE__ */ u4("div", { id: "latency-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    let displayGroups;
    if (sessions.length === 0) {
      displayGroups = [{ label: "1", spans: spans2 }];
    } else {
      displayGroups = sessions.map((sess, idx) => ({
        label: "" + (getSessionGlobalNumber(sess) || idx + 1),
        source: sess.source,
        spans: spans2.filter((s4) => s4.traceId === sess.traceId)
      }));
    }
    displayGroups.reverse();
    if (displayGroups.length > 20) displayGroups = displayGroups.slice(0, 20);
    const nameSet = /* @__PURE__ */ new Set();
    spans2.forEach((s4) => nameSet.add(s4.name.split("/")[0] ?? s4.name));
    let names = Array.from(nameSet);
    names.sort((a4, b4) => {
      const aA = isSessionSpan(a4) ? 0 : 1;
      const bA = isSessionSpan(b4) ? 0 : 1;
      if (aA !== bA) return aA - bA;
      return a4.localeCompare(b4);
    });
    names = names.filter(
      (name) => displayGroups.some((g4) => g4.spans.some((s4) => {
        const sName = s4.name.split("/")[0] ?? s4.name;
        if (sName !== name) return false;
        return nanoToMs(s4.endTime) - nanoToMs(s4.startTime) > 0;
      }))
    );
    const grid = {};
    let maxDur = 0;
    names.forEach((name) => {
      grid[name] = displayGroups.map((g4) => {
        let best = 0;
        g4.spans.forEach((s4) => {
          const sName = s4.name.split("/")[0] ?? s4.name;
          if (sName === name) {
            const dur = nanoToMs(s4.endTime) - nanoToMs(s4.startTime);
            if (dur > best) best = dur;
          }
        });
        if (best > maxDur) maxDur = best;
        return best;
      });
    });
    maxDur = maxDur || 1;
    const slowest = names.map((name) => ({ name, dur: Math.max(...grid[name]) })).filter((x4) => x4.dur > 0).sort((a4, b4) => b4.dur - a4.dur);
    const _consistentlySlow = slowest.filter((s4) => {
      const allDurs = grid[s4.name].filter((d5) => d5 > 0);
      if (allDurs.length < 2) return false;
      const avg = allDurs.reduce((sum, d5) => sum + d5, 0) / allDurs.length;
      return avg > maxDur * 0.5;
    });
    const sessionsWithTtft = sessions.filter((s4) => (s4.timeline ?? []).some((e4) => e4.type === "llm" && (e4.ttft ?? 0) > 0));
    return /* @__PURE__ */ u4("div", { id: "latency-content", children: [
      sessionsWithTtft.length > 0 && /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("h3", { class: "has-metric-tip", style: "margin:0 0 12px;font-size:13px;color:var(--muted)", "data-tip": "Time to first token per session, broken out by agent. Each dot is one session. A rising trend indicates model load or growing context is increasing response start latency.", children: "TIME TO FIRST TOKEN" }),
        /* @__PURE__ */ u4(TtftChart, { sessions })
      ] }),
      /* @__PURE__ */ u4("h3", { style: "margin:24px 0 12px;font-size:13px;color:var(--muted)", children: "SPAN DURATION HEATMAP" }),
      /* @__PURE__ */ u4("div", { class: "heatmap", children: [
        /* @__PURE__ */ u4("table", { style: "border-collapse:collapse", children: [
          /* @__PURE__ */ u4("thead", { children: /* @__PURE__ */ u4("tr", { children: [
            /* @__PURE__ */ u4("td", {}),
            displayGroups.map((g4, gi) => /* @__PURE__ */ u4("td", { style: "text-align:center;width:32px;min-width:32px;padding:2px 4px;vertical-align:bottom", children: /* @__PURE__ */ u4("div", { style: "font-size:10px;white-space:nowrap;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:2px", children: [
              /* @__PURE__ */ u4("span", { style: "opacity:0.6", children: g4.label }),
              g4.source && /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: getAgentDotHtml(g4.source) } })
            ] }) }, gi))
          ] }) }),
          /* @__PURE__ */ u4("tbody", { children: names.map((name) => /* @__PURE__ */ u4("tr", { children: [
            /* @__PURE__ */ u4("td", { class: "heatmap-row-label", children: name }),
            grid[name].map((dur, idx) => {
              const intensity = dur / maxDur;
              const r5 = Math.round(79 + intensity * 176);
              const g4 = Math.round(195 - intensity * 130);
              const bl = Math.round(247 - intensity * 180);
              const bg = dur > 0 ? `rgb(${r5},${g4},${bl})` : "transparent";
              return /* @__PURE__ */ u4("td", { style: "text-align:center;width:32px;min-width:32px;padding:2px 4px", children: /* @__PURE__ */ u4("div", { class: "heatmap-cell", style: "background:" + bg, children: dur > 0 && /* @__PURE__ */ u4("span", { class: "htip", children: [
                name,
                " session ",
                displayGroups[idx].label,
                ": ",
                formatMs(dur)
              ] }) }) }, idx);
            })
          ] }, name)) })
        ] }),
        /* @__PURE__ */ u4("div", { class: "heatmap-axis-label", children: "\u2190 Session (latest to earliest) \u2192" }),
        /* @__PURE__ */ u4("div", { class: "heatmap-legend", children: [
          /* @__PURE__ */ u4("span", { children: "Duration:" }),
          /* @__PURE__ */ u4("span", { children: "Low" }),
          /* @__PURE__ */ u4("div", { class: "heatmap-legend-bar", children: Array.from({ length: 6 }, (_4, li) => {
            const int = li / 5;
            const lr = Math.round(79 + int * 176);
            const lg = Math.round(195 - int * 130);
            const lb = Math.round(247 - int * 180);
            return /* @__PURE__ */ u4("span", { style: `background:rgb(${lr},${lg},${lb})` }, li);
          }) }),
          /* @__PURE__ */ u4("span", { children: [
            "High (",
            formatMs(maxDur),
            ")"
          ] })
        ] })
      ] })
    ] });
  }

  // media/src/tabs/Summaries.tsx
  function BgSummaryBlock({ bgSpans }) {
    const [open, setOpen] = d2(false);
    if (!bgSpans?.length) return null;
    const groups = {};
    let totalTokens = 0;
    bgSpans.forEach((bg) => {
      const key = bg.purpose || bg.name || "Unknown";
      if (!groups[key]) groups[key] = { count: 0, tokens: 0, model: bg.model || "" };
      groups[key].count++;
      const tok = (bg.inputTokens ?? 0) + (bg.outputTokens ?? 0);
      groups[key].tokens += tok;
      totalTokens += tok;
    });
    const descriptions = {
      "Generate chat title": "Creates the title shown in the chat history sidebar.",
      "Generate progress messages": "Produces the status messages shown while the agent works.",
      "Extension language model call": "LLM call made by a VS Code extension \u2014 often used for completions or inline suggestions."
    };
    const purposes = Object.keys(groups).sort((a4, b4) => groups[b4].tokens - groups[a4].tokens);
    return /* @__PURE__ */ u4("div", { class: "sw-bg-group", children: [
      /* @__PURE__ */ u4("div", { class: "sw-bg-header", onClick: () => setOpen((v4) => !v4), children: [
        /* @__PURE__ */ u4("span", { class: "sw-bg-chevron", children: open ? "\u25BC" : "\u25B6" }),
        " ",
        /* @__PURE__ */ u4("span", { children: "Background Overhead" }),
        /* @__PURE__ */ u4("span", { class: "sw-bg-summary", children: [
          bgSpans.length,
          " calls \xB7 ",
          totalTokens.toLocaleString(),
          " tokens"
        ] })
      ] }),
      open && /* @__PURE__ */ u4("div", { class: "sw-bg-body", children: [
        /* @__PURE__ */ u4("div", { class: "sw-bg-note", children: "Automatic LLM calls that ran alongside this prompt. These are not part of your agent session but still consume tokens." }),
        purposes.map((purpose) => /* @__PURE__ */ u4("div", { class: "sw-bg-item", children: [
          /* @__PURE__ */ u4("div", { class: "sw-bg-item-header", children: [
            /* @__PURE__ */ u4("span", { class: "sw-bg-item-name", children: purpose }),
            /* @__PURE__ */ u4("span", { class: "sw-bg-item-stats", children: [
              groups[purpose].count,
              "\xD7 \xB7 ",
              groups[purpose].tokens.toLocaleString(),
              " tok \xB7 ",
              groups[purpose].model
            ] })
          ] }),
          descriptions[purpose] && /* @__PURE__ */ u4("div", { class: "sw-bg-item-desc", children: descriptions[purpose] })
        ] }, purpose))
      ] })
    ] });
  }
  function StepDetail({ step, idx, sessIdx }) {
    const [showOutput, setShowOutput] = d2(false);
    const entry = step.entry;
    if (entry.type === "llm") {
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
            ] }),
            entry.responseText && /* @__PURE__ */ u4("button", { class: "sw-show-full-btn", style: "margin-left:8px", onClick: () => setShowOutput((v4) => !v4), children: showOutput ? "hide output" : "view output" })
          ] })
        ] }),
        showOutput && entry.responseText && /* @__PURE__ */ u4(LongTextSection, { heading: "Output", text: entry.responseText, id: "sw-output-" + sessIdx + "-" + idx }),
        (entry.ttft ?? 0) > 0 && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Time to First Token" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: formatMs(entry.ttft) })
        ] }),
        /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Duration" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: formatMs(step.durationMs) })
        ] }),
        entry.action && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Decision" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: entry.action })
        ] }),
        entry.thinking && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Reasoning" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-thinking", style: "white-space:pre-wrap", children: entry.thinking })
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
      const resultText = entry.fullResult || entry.resultSummary || "";
      return /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Tool" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: /* @__PURE__ */ u4("code", { children: tName }) })
        ] }),
        tArgs && /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Arguments" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: /* @__PURE__ */ u4("code", { children: tArgs }) })
        ] }),
        /* @__PURE__ */ u4("div", { class: "sw-detail-section", children: [
          /* @__PURE__ */ u4("div", { class: "sw-detail-heading", children: "Duration" }),
          /* @__PURE__ */ u4("div", { class: "sw-detail-value", children: formatMs(step.durationMs) })
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
  function StepRow({ step, idx, sessIdx, sessionDur }) {
    const [open, setOpen] = d2(false);
    const entry = step.entry;
    let badgeLabel, barColor;
    if (entry.type === "llm") {
      badgeLabel = "LLM";
      barColor = "var(--accent)";
    } else if (entry.type === "tool") {
      badgeLabel = "TOOL";
      barColor = "#B8E986";
    } else {
      badgeLabel = "BG";
      barColor = "var(--muted)";
    }
    if (entry.isError) barColor = "var(--error)";
    const rowLabel = entry.type === "llm" ? formatLlmLabel(entry) : entry.type === "tool" ? formatToolLabel(entry) + (formatToolResult(entry) ? " \u2192 " + formatToolResult(entry) : "") : entry.label || "";
    const left = sessionDur > 0 ? step.offsetMs / sessionDur * 100 : 0;
    const width = sessionDur > 0 ? Math.max(step.durationMs / sessionDur * 100, 0.5) : 100;
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("div", { class: "wf-row", onClick: () => setOpen((v4) => !v4), children: [
        /* @__PURE__ */ u4("div", { class: "wf-label", title: rowLabel, children: [
          /* @__PURE__ */ u4("span", { class: "wf-indent" }),
          /* @__PURE__ */ u4("span", { class: "sw-chevron", children: open ? "\u25BC" : "\u25B6" }),
          /* @__PURE__ */ u4("span", { class: "wf-type-badge", style: "background:" + barColor + ";color:#000", children: badgeLabel }),
          /* @__PURE__ */ u4("span", { class: "wf-name", children: rowLabel })
        ] }),
        /* @__PURE__ */ u4("div", { class: "wf-bar-area", children: /* @__PURE__ */ u4("div", { class: "wf-bar", style: `left:${left.toFixed(2)}%;width:${width.toFixed(2)}%`, children: /* @__PURE__ */ u4("div", { class: "wf-bar-inner", style: "background:" + barColor + ";opacity:" + (entry.isError ? "1" : "0.7") }) }) }),
        /* @__PURE__ */ u4("div", { class: "wf-info", children: [
          formatMs(step.durationMs),
          entry.type === "llm" && ((entry.inputTokens ?? 0) > 0 || (entry.outputTokens ?? 0) > 0) && /* @__PURE__ */ u4("div", { style: "font-size:9px;color:var(--muted);white-space:nowrap;margin-top:2px", children: [
            "\u2191",
            formatCompact(entry.inputTokens ?? 0),
            " \u2193",
            formatCompact(entry.outputTokens ?? 0)
          ] })
        ] })
      ] }),
      open && /* @__PURE__ */ u4("div", { class: "sw-detail open", children: /* @__PURE__ */ u4(StepDetail, { step, idx, sessIdx }) })
    ] });
  }
  function SessionBlock({ sess, sessIdx, totalCount, isFirst }) {
    const [collapsed, setCollapsed] = d2(!isFirst);
    const [promptExpanded, setPromptExpanded] = d2(false);
    const isLongPrompt = (sess.userRequest?.length ?? 0) > 100;
    const sessionNum = getSessionGlobalNumber(sess) || totalCount - sessIdx;
    const sessionStartMs2 = sess.startTime ? new Date(sess.startTime).getTime() : 0;
    let sessionDur = sess.durationMs || 1;
    const steps = (sess.timeline ?? []).map((entry) => {
      const entryStart = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
      const offset = sessionStartMs2 > 0 && entryStart > 0 ? entryStart - sessionStartMs2 : 0;
      return { entry, offsetMs: Math.max(offset, 0), durationMs: entry.durationMs || 0 };
    });
    if (steps.length > 0) {
      const maxEnd = Math.max(...steps.map((s4) => s4.offsetMs + s4.durationMs));
      if (maxEnd > sessionDur) sessionDur = maxEnd;
    }
    if (sessionDur <= 0) sessionDur = 1;
    const errorCount = sess.errors || 0;
    const outcomeLabel = sess.outcome === "text_response" ? "Responded" : sess.outcome === "tool_calls" ? "Tool calls" : null;
    return /* @__PURE__ */ u4("div", { class: "wf-trace-group", children: [
      /* @__PURE__ */ u4("div", { class: "wf-trace-header", onClick: () => setCollapsed((v4) => !v4), children: [
        /* @__PURE__ */ u4("span", { children: [
          /* @__PURE__ */ u4("span", { class: "wf-header-chevron", children: collapsed ? "\u25B6" : "\u25BC" }),
          /* @__PURE__ */ u4("strong", { children: sessionNum }),
          " ",
          /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: getAgentDotHtml(sess.source) } }),
          " ",
          '"',
          sess.userRequest.slice(0, 100),
          isLongPrompt ? "\u2026" : "",
          '"',
          isLongPrompt && /* @__PURE__ */ u4("button", { class: "sw-show-full-btn", style: "margin-left:8px", onClick: (e4) => {
            e4.stopPropagation();
            setPromptExpanded((v4) => !v4);
          }, children: promptExpanded ? "Collapse" : "Show full prompt" })
        ] }),
        /* @__PURE__ */ u4("span", { class: "wf-trace-stats", children: [
          steps.length,
          " steps \xB7 ",
          formatMs(sessionDur),
          " \xB7 ",
          sess.model,
          errorCount > 0 && /* @__PURE__ */ u4("span", { class: "err", children: [
            " \xB7 ",
            errorCount,
            " errors"
          ] }),
          outcomeLabel && /* @__PURE__ */ u4(S, { children: [
            " \xB7 ",
            outcomeLabel
          ] })
        ] })
      ] }),
      promptExpanded && /* @__PURE__ */ u4("div", { style: "padding:6px 10px 6px 28px;background:var(--hover);border-left:1px solid var(--border);border-right:1px solid var(--border);font-size:11px;color:var(--fg);white-space:pre-wrap;word-break:break-word", children: sess.userRequest }),
      !collapsed && /* @__PURE__ */ u4("div", { class: "wf-trace-body", children: [
        /* @__PURE__ */ u4("div", { class: "wf-time-ruler", children: Array.from({ length: 6 }, (_4, t4) => /* @__PURE__ */ u4("span", { children: formatMs(sessionDur * t4 / 5) }, t4)) }),
        steps.map((step, si) => /* @__PURE__ */ u4(StepRow, { step, idx: si, sessIdx, sessionDur }, step.entry.spanId + si))
      ] })
    ] });
  }
  function Summaries() {
    const base = displaySessions.value;
    const summary = sessionSummary.value;
    if (!summary?.sessions?.length) {
      return /* @__PURE__ */ u4("div", { id: "summary-traces-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const sessionsToShow = [...base].reverse();
    const totalLlmCalls = sessionsToShow.reduce((s4, sess) => s4 + sess.totalLlmCalls, 0);
    const totalToolCalls = sessionsToShow.reduce((s4, sess) => s4 + sess.totalToolCalls, 0);
    const totalTokens = sessionsToShow.reduce((s4, sess) => s4 + sess.inputTokens + sess.outputTokens, 0);
    return /* @__PURE__ */ u4("div", { id: "summary-traces-content", children: [
      /* @__PURE__ */ u4("div", { class: "tab-stats", children: [
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: sessionsToShow.length }),
          " sessions"
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: totalLlmCalls }),
          " LLM calls"
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: totalToolCalls }),
          " tool calls"
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: formatCompact(totalTokens) }),
          " tokens"
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { style: "font-size:11px;color:var(--muted);padding:6px 10px;margin-bottom:12px;border-left:2px solid var(--border)", children: "Each agent exposes different OTEL data \u2014 some fields may be missing or estimated. See the Traces tab for raw span-level detail." }),
      /* @__PURE__ */ u4("div", { class: "waterfall", children: [
        sessionsToShow.map((sess, idx) => /* @__PURE__ */ u4(
          SessionBlock,
          {
            sess,
            sessIdx: idx,
            totalCount: sessionsToShow.length,
            isFirst: idx === 0
          },
          sess.traceId + idx
        )),
        sessionsToShow.length === 0 && /* @__PURE__ */ u4("div", { class: "empty-state", children: "No sessions to display" })
      ] }),
      summary.backgroundSpans?.length > 0 && /* @__PURE__ */ u4(BgSummaryBlock, { bgSpans: summary.backgroundSpans })
    ] });
  }

  // media/src/tabs/Traces.tsx
  function isCodexWebsocketSpan(span) {
    const name = (span.name ?? "").toLowerCase();
    if (!name.includes("websocket")) return false;
    const eventName = String(getAttr(span, "event.name") ?? "").toLowerCase();
    return name.startsWith("codex.") || eventName.startsWith("codex.") || Boolean(getCodexSessionId(span));
  }
  function SpanRow({ span, minStart, traceRange, depth }) {
    const isExpanded = expandedSpanIds.has(span.spanId);
    const [localOpen, setLocalOpen] = d2(isExpanded);
    const st = nanoToMs(span.startTime), en = nanoToMs(span.endTime);
    const dur = en - st;
    const left = minStart > 0 && st > 0 ? (st - minStart) / traceRange * 100 : 0;
    const width = traceRange > 0 ? Math.max(dur / traceRange * 100, 0.5) : 100;
    const badge = spanTypeBadge(span);
    const isErr = span.status?.code === 2;
    const barColor = isErr ? "var(--error)" : badge.color;
    const attrs = span.attributes ?? [];
    const tipLines = [
      span.name,
      "Duration: " + formatMs(dur),
      "Span: " + span.spanId,
      ...span.parentSpanId ? ["Parent: " + span.parentSpanId] : [],
      ...attrs.slice(0, 8).map((a4) => {
        const v4 = a4.value;
        const display = v4.stringValue ?? v4.intValue ?? v4.doubleValue ?? v4.boolValue;
        return a4.key + ": " + String(display ?? JSON.stringify(v4));
      }),
      ...attrs.length > 8 ? ["... +" + (attrs.length - 8) + " more attributes"] : []
    ];
    const detailLines = [
      { k: "Span ID", v: span.spanId ?? "\u2014" },
      { k: "Trace ID", v: span.traceId ?? "\u2014" },
      ...span.parentSpanId ? [{ k: "Parent Span ID", v: span.parentSpanId }] : [],
      { k: "Status", v: span.status ? (span.status.code === 0 ? "OK" : span.status.code === 2 ? "ERROR" : "UNSET") + (span.status.message ? " \u2014 " + span.status.message : "") : "UNSET" },
      ...attrs.map((a4) => {
        const v4 = a4.value;
        const display = v4.stringValue ?? v4.intValue ?? v4.doubleValue ?? v4.boolValue;
        return { k: a4.key, v: String(display ?? JSON.stringify(v4)) };
      })
    ];
    function toggle() {
      const next = !localOpen;
      setLocalOpen(next);
      if (next) expandedSpanIds.add(span.spanId);
      else expandedSpanIds.delete(span.spanId);
    }
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("div", { class: clsx_default("wf-row", { selected: localOpen }), onClick: toggle, children: [
        /* @__PURE__ */ u4("div", { class: "wf-label", title: span.name, children: [
          Array.from({ length: depth }, (_4, i4) => /* @__PURE__ */ u4("span", { class: "wf-indent" }, i4)),
          /* @__PURE__ */ u4("span", { class: "wf-chevron", children: localOpen ? "\u25BC" : "\u25B6" }),
          /* @__PURE__ */ u4("span", { class: "wf-type-badge", style: "background:" + barColor + ";color:#000", children: badge.label }),
          /* @__PURE__ */ u4("span", { class: "wf-name", children: span.name })
        ] }),
        /* @__PURE__ */ u4("div", { class: "wf-bar-area", children: /* @__PURE__ */ u4("div", { class: "wf-bar", style: `left:${left.toFixed(2)}%;width:${width.toFixed(2)}%`, children: [
          /* @__PURE__ */ u4("div", { class: "wf-bar-inner", style: "background:" + barColor + ";opacity:" + (isErr ? "1" : "0.7") }),
          width < 15 && /* @__PURE__ */ u4("span", { class: "wf-dur", children: formatMs(dur) }),
          /* @__PURE__ */ u4("div", { class: "wf-tip", dangerouslySetInnerHTML: { __html: tipLines.map((l5) => esc(l5)).join("<br>") } })
        ] }) }),
        /* @__PURE__ */ u4("div", { class: "wf-info", children: formatMs(dur) })
      ] }),
      /* @__PURE__ */ u4("div", { class: clsx_default("wf-detail", { open: localOpen }), id: "detail-" + span.spanId, children: detailLines.map((dl) => /* @__PURE__ */ u4("div", { class: "wf-detail-row", children: [
        /* @__PURE__ */ u4("span", { class: "wf-detail-key", children: dl.k }),
        /* @__PURE__ */ u4("span", { class: "wf-detail-val", children: dl.v })
      ] }, dl.k)) })
    ] });
  }
  function TraceGroup({
    traceId,
    traceSpans,
    sessionNum,
    source,
    sessionPrompt,
    model,
    isFirst
  }) {
    const [collapsed, setCollapsed] = d2(!isFirst);
    const [promptExpanded, setPromptExpanded] = d2(false);
    const minStart = Math.min(...traceSpans.map((s4) => nanoToMs(s4.startTime)).filter((t4) => t4 > 0)) || 0;
    const maxEnd = Math.max(...traceSpans.map((s4) => nanoToMs(s4.endTime)));
    const traceRange = maxEnd - minStart || 1;
    const traceDur = formatMs(traceRange);
    const errorCount = traceSpans.filter((s4) => s4.status?.code === 2).length;
    const tree = buildSpanTree(traceSpans);
    const traceLabel = sessionNum ? /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4("strong", { children: sessionNum }),
      " ",
      source && /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: getAgentDotHtml(source) } }),
      " "
    ] }) : null;
    const sessionTitle = sessionNum ? sessionPrompt || "[session in progress]" : sessionPrompt;
    const isLongPrompt = (sessionTitle?.length ?? 0) > 120;
    const promptSnippet = sessionTitle ? ` ${isLongPrompt ? sessionTitle.slice(0, 120) + "\u2026" : sessionTitle}` : "";
    const idLabel = traceId.startsWith("codex:") ? "Session" : "Trace";
    const timeMarks = Array.from({ length: 6 }, (_4, t4) => formatMs(traceRange * t4 / 5));
    return /* @__PURE__ */ u4("div", { class: "wf-trace-group", children: [
      /* @__PURE__ */ u4("div", { class: "wf-trace-header", onClick: () => setCollapsed((c4) => !c4), children: [
        /* @__PURE__ */ u4("span", { children: [
          /* @__PURE__ */ u4("span", { class: "wf-header-chevron", children: collapsed ? "\u25B6" : "\u25BC" }),
          traceLabel,
          promptSnippet,
          isLongPrompt && /* @__PURE__ */ u4("button", { class: "sw-show-full-btn", style: "margin-left:8px", onClick: (e4) => {
            e4.stopPropagation();
            setPromptExpanded((v4) => !v4);
          }, children: promptExpanded ? "Collapse" : "Show full prompt" })
        ] }),
        /* @__PURE__ */ u4("span", { class: "wf-trace-stats", children: [
          /* @__PURE__ */ u4("span", { class: "wf-trace-id", children: [
            idLabel,
            " ",
            traceId.substring(0, 16),
            "..."
          ] }),
          " \xB7 ",
          traceSpans.length,
          " spans",
          " \xB7 ",
          traceDur,
          model && /* @__PURE__ */ u4(S, { children: [
            " \xB7 ",
            model
          ] }),
          errorCount > 0 && /* @__PURE__ */ u4("span", { class: "err", children: [
            " \xB7 ",
            errorCount,
            " errors"
          ] })
        ] })
      ] }),
      promptExpanded && sessionTitle && /* @__PURE__ */ u4("div", { style: "padding:6px 10px 6px 28px;background:var(--hover);border-left:1px solid var(--border);border-right:1px solid var(--border);font-size:11px;color:var(--fg);white-space:pre-wrap;word-break:break-word", children: sessionTitle }),
      /* @__PURE__ */ u4("div", { class: clsx_default("wf-trace-body", { collapsed }), children: [
        /* @__PURE__ */ u4("div", { class: "wf-time-ruler", children: timeMarks.map((m4, i4) => /* @__PURE__ */ u4("span", { children: m4 }, i4)) }),
        tree.map((node) => /* @__PURE__ */ u4(
          SpanRow,
          {
            span: node.span,
            minStart,
            traceRange,
            depth: node.depth
          },
          node.span.spanId
        ))
      ] })
    ] });
  }
  function Traces() {
    const wfSpans = waterfallSpans.value;
    const sessions = displaySessions.value;
    const codexRawTraceSessionMap = /* @__PURE__ */ new Map();
    wfSpans.forEach((span) => {
      const sessionId = getCodexSessionId(span);
      const rawTraceId = getAttr(span, "otel.trace_id");
      if (sessionId && rawTraceId) codexRawTraceSessionMap.set(String(rawTraceId), sessionId);
    });
    const sessionSpanMap = /* @__PURE__ */ new Map();
    sessions.forEach((sess) => {
      if (sess.source !== "codex" || !sess.traceId) return;
      if (sess.sessionId) sessionSpanMap.set(sess.sessionId, sess.traceId);
      for (const entry of sess.timeline ?? []) {
        if (entry.spanId) sessionSpanMap.set(entry.spanId, sess.traceId);
      }
    });
    const groupKeyForSpan = (span) => sessionSpanMap.get(span.spanId) || getCodexSessionId(span) || codexRawTraceSessionMap.get(span.traceId) || span.traceId;
    const displayTraceIds = sessions.length > 0 ? new Set(sessions.map((s4) => s4.traceId).filter(Boolean)) : null;
    const allSessionTraceIds = new Set(
      (sessionSummary.value?.sessions ?? []).map((s4) => s4.traceId).filter(Boolean)
    );
    const filtered = wfSpans.filter((s4) => {
      if (isCodexWebsocketSpan(s4)) return false;
      const groupKey = groupKeyForSpan(s4);
      return !displayTraceIds || displayTraceIds.has(groupKey) || !allSessionTraceIds.has(groupKey);
    });
    const traceMap = {};
    const traceOrder = [];
    filtered.forEach((s4) => {
      const groupKey = groupKeyForSpan(s4);
      if (!traceMap[groupKey]) {
        traceMap[groupKey] = [];
        traceOrder.push(groupKey);
      }
      traceMap[groupKey].push(s4);
    });
    const spanCount = filtered.length;
    const traceCount = new Set(filtered.map((s4) => groupKeyForSpan(s4))).size;
    const errorCount = filtered.filter((s4) => s4.status?.code === 2).length;
    const sessionTraceMap = {};
    const sessionPromptMap = {};
    const sessionSourceMap = {};
    const sessionModelMap = {};
    sessions.forEach((sess) => {
      if (sess.traceId) {
        sessionTraceMap[sess.traceId] = getSessionGlobalNumber(sess);
        sessionPromptMap[sess.traceId] = sess.userRequest ?? "";
        sessionSourceMap[sess.traceId] = sess.source ?? "";
        sessionModelMap[sess.traceId] = sess.model ?? "";
      }
    });
    const reverseOrder = [...traceOrder].reverse();
    const sessionTraceIdsFromSummary = sessions.map((sess) => sess.traceId).filter((traceId) => Boolean(traceId && traceMap[traceId]));
    const seenSessionTraceIds = new Set(sessionTraceIdsFromSummary);
    const sessionTraceIdsRev = [
      ...sessionTraceIdsFromSummary.reverse(),
      ...reverseOrder.filter((tid) => sessionTraceMap[tid] && !seenSessionTraceIds.has(tid))
    ];
    const bgTraceIdsRev = reverseOrder.filter((tid) => !sessionTraceMap[tid]);
    const toRender = sessionTraceIdsRev.length > 0 ? sessionTraceIdsRev : reverseOrder;
    return /* @__PURE__ */ u4("div", { id: "traces-content", children: [
      /* @__PURE__ */ u4("div", { class: "tab-stats", children: [
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: spanCount }),
          " spans"
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: traceCount }),
          " traces"
        ] }),
        errorCount > 0 && /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val err", children: errorCount }),
          " errors"
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { id: "traces-content-inner", children: filtered.length === 0 ? /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) : /* @__PURE__ */ u4(S, { children: /* @__PURE__ */ u4("div", { class: "waterfall", children: [
        toRender.map((tid, i4) => {
          const prompt = sessionPromptMap[tid] || (() => {
            const spans2 = traceMap[tid] ?? [];
            for (const s4 of spans2) {
              if (isSessionSpan(s4.name)) return extractUserRequest(getSessionUserRequest(s4));
            }
            return "";
          })();
          return /* @__PURE__ */ u4(
            TraceGroup,
            {
              traceId: tid,
              traceSpans: traceMap[tid],
              sessionNum: sessionTraceMap[tid],
              source: sessionSourceMap[tid],
              sessionPrompt: prompt,
              model: sessionModelMap[tid],
              isFirst: i4 === 0
            },
            tid
          );
        }),
        bgTraceIdsRev.length > 0 && sessionTraceIdsRev.length > 0 && /* @__PURE__ */ u4(BgGroup, { bgTraceIds: bgTraceIdsRev, traceMap })
      ] }) }) })
    ] });
  }
  function BgGroup({ bgTraceIds, traceMap }) {
    const [collapsed, setCollapsed] = d2(true);
    const totalBgSpans = bgTraceIds.reduce((s4, tid) => s4 + (traceMap[tid]?.length ?? 0), 0);
    return /* @__PURE__ */ u4("div", { class: "sw-bg-group", style: "margin-top:16px", children: [
      /* @__PURE__ */ u4("div", { class: "sw-bg-header", onClick: () => setCollapsed((c4) => !c4), children: [
        /* @__PURE__ */ u4("span", { class: "sw-bg-chevron", children: collapsed ? "\u25B6" : "\u25BC" }),
        /* @__PURE__ */ u4("strong", { children: "Background Overhead" }),
        /* @__PURE__ */ u4("span", { class: "sw-bg-summary", children: [
          bgTraceIds.length,
          " trace",
          bgTraceIds.length !== 1 ? "s" : "",
          " \xB7 ",
          totalBgSpans,
          " spans"
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { class: clsx_default("sw-bg-body", { collapsed }), children: bgTraceIds.map((tid, _i) => /* @__PURE__ */ u4(TraceGroup, { traceId: tid, traceSpans: traceMap[tid], isFirst: false }, tid)) })
    ] });
  }

  // media/src/tabs/Files.tsx
  function countLines(s4) {
    return s4 ? s4.split("\n").length : 0;
  }
  function editLineCounts(edits) {
    let added = 0, removed = 0;
    for (const e4 of edits) {
      if (e4.content) {
        added += countLines(e4.content);
      } else {
        added += countLines(e4.newString);
        removed += countLines(e4.oldString);
      }
    }
    return { added, removed };
  }
  function DiffLines({ lines, type }) {
    const bg = type === "added" ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)";
    const border = type === "added" ? "rgba(76,175,80,0.3)" : "rgba(244,67,54,0.3)";
    const prefix = type === "added" ? "+ " : "- ";
    return /* @__PURE__ */ u4("div", { style: "font-family:var(--vscode-editor-font-family,monospace);font-size:11px;line-height:1.5;overflow-x:auto;white-space:pre", children: lines.map((line, i4) => /* @__PURE__ */ u4("div", { style: `padding:0 10px;background:${bg};border-left:3px solid ${border}`, children: [
      prefix,
      line
    ] }, i4)) });
  }
  function EditBlock({ edit, ei }) {
    return /* @__PURE__ */ u4("div", { children: [
      /* @__PURE__ */ u4("div", { style: "padding:4px 10px;font-size:10px;color:var(--muted);background:var(--vscode-editorWidget-background,var(--bg));border-top:" + (ei > 0 ? "1px solid var(--border)" : "none") + ";font-weight:600;display:flex;align-items:center;gap:8px", children: [
        /* @__PURE__ */ u4("span", { children: [
          "Change ",
          ei + 1
        ] }),
        /* @__PURE__ */ u4("span", { style: "text-transform:uppercase;opacity:0.7", children: edit.tool })
      ] }),
      edit.content && /* @__PURE__ */ u4(DiffLines, { lines: edit.content.split("\n"), type: "added" }),
      !edit.content && /* @__PURE__ */ u4(S, { children: [
        edit.oldString && /* @__PURE__ */ u4(S, { children: [
          /* @__PURE__ */ u4("div", { style: "padding:4px 10px;font-size:10px;color:var(--muted);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border)", children: "Removed" }),
          /* @__PURE__ */ u4(DiffLines, { lines: edit.oldString.split("\n"), type: "removed" })
        ] }),
        edit.oldString && edit.newString && /* @__PURE__ */ u4("div", { style: "padding:2px 10px;color:var(--muted);font-size:10px;background:var(--border);text-align:center;user-select:none", children: "\u2192" }),
        edit.newString && /* @__PURE__ */ u4(S, { children: [
          /* @__PURE__ */ u4("div", { style: "padding:4px 10px;font-size:10px;color:var(--muted);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border)", children: "Added" }),
          /* @__PURE__ */ u4(DiffLines, { lines: edit.newString.split("\n"), type: "added" })
        ] })
      ] })
    ] });
  }
  function FileItem({ fp, edits, ridx: _ridx }) {
    const [editsOpen, setEditsOpen] = d2(false);
    const parts = fp.split("/");
    const fileName = parts.pop() ?? fp;
    const dirPath = parts.join("/");
    const isCreated = edits.some((e4) => e4.tool === "create_file");
    const editCount = edits.length;
    const hasDiffs = edits.some((e4) => e4.oldString || e4.newString || e4.content);
    const { added, removed } = hasDiffs ? editLineCounts(edits) : { added: 0, removed: 0 };
    function handleClick() {
      vscode?.postMessage({ type: "openFile", filePath: fp });
    }
    return /* @__PURE__ */ u4(S, { children: [
      /* @__PURE__ */ u4(
        "div",
        {
          class: "files-file-item",
          onClick: handleClick,
          style: "display:flex;align-items:center;gap:10px;padding:8px 16px 8px 42px;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer",
          children: [
            !window.__STANDALONE__ && /* @__PURE__ */ u4("span", { style: "font-size:14px;width:18px;text-align:center;color:" + (isCreated ? "var(--vscode-testing-iconPassed,#4c4)" : "var(--accent)"), children: isCreated ? "\uFF0B" : "\u270E" }),
            /* @__PURE__ */ u4("span", { style: "flex:1;min-width:0;font-family:var(--vscode-editor-font-family,monospace);font-size:12px", children: [
              /* @__PURE__ */ u4("span", { style: "color:var(--fg);font-weight:500", children: fileName }),
              dirPath && /* @__PURE__ */ u4("span", { class: "muted", children: [
                " ",
                dirPath
              ] })
            ] }),
            /* @__PURE__ */ u4("span", { style: "font-size:9px;padding:1px 6px;border-radius:3px;font-weight:600;text-transform:uppercase;" + (isCreated ? "background:rgba(76,175,80,0.15);color:var(--vscode-testing-iconPassed,#4c4)" : "background:rgba(79,195,247,0.15);color:var(--accent)"), children: isCreated ? "Created" : "Edited" }),
            editCount > 1 && /* @__PURE__ */ u4("span", { style: "font-size:9px;padding:1px 6px;border-radius:3px;font-weight:600;background:rgba(79,195,247,0.15);color:var(--accent)", children: [
              editCount,
              " edits"
            ] }),
            added > 0 && /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:600;color:#4caf50", children: [
              "+",
              added
            ] }),
            removed > 0 && /* @__PURE__ */ u4("span", { style: "font-size:10px;font-weight:600;color:#f44336", children: [
              "-",
              removed
            ] })
          ]
        }
      ),
      hasDiffs && /* @__PURE__ */ u4("div", { style: "border:1px solid var(--border);border-radius:4px;margin:0 16px 12px 42px;background:var(--bg);overflow:hidden", children: [
        /* @__PURE__ */ u4(
          "div",
          {
            class: "files-edit-header",
            onClick: (e4) => {
              e4.stopPropagation();
              setEditsOpen((o4) => !o4);
            },
            style: "display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;user-select:none;font-size:11px",
            children: [
              /* @__PURE__ */ u4("span", { class: "files-edit-chevron", style: "font-size:9px;color:var(--muted);width:12px", children: editsOpen ? "\u25BC" : "\u25B6" }),
              /* @__PURE__ */ u4("span", { style: "color:var(--muted);font-size:11px", children: [
                editCount,
                " change",
                editCount !== 1 ? "s" : "",
                " \u2014 click to ",
                editsOpen ? "collapse" : "expand"
              ] })
            ]
          }
        ),
        editsOpen && /* @__PURE__ */ u4("div", { style: "border-top:1px solid var(--border)", children: edits.map((edit, ei) => /* @__PURE__ */ u4(EditBlock, { edit, ei }, edit.editKey)) })
      ] })
    ] });
  }
  function SessionBlock2({ sess, ridx, allCount, isOpen: defaultOpen }) {
    const [open, setOpen] = d2(defaultOpen);
    const sessionNum = getSessionGlobalNumber(sess) || allCount - ridx;
    const changedFiles = sess.filesChanged ?? [];
    const filesChangedNote = sess.filesChangedNote ?? "";
    const fileEdits = {};
    let editIdx = 0;
    (sess.timeline ?? []).forEach((e4) => {
      if (!e4.editDetails?.length) return;
      const entryLabel = (e4.label ?? "").split(" ")[0];
      e4.editDetails.forEach((ed) => {
        const fp = ed.filePath;
        if (!fp) return;
        if (!fileEdits[fp]) fileEdits[fp] = [];
        fileEdits[fp].push({ tool: ed.toolName || entryLabel, oldString: ed.oldString, newString: ed.newString, content: ed.content, editKey: ridx + "-" + editIdx });
        editIdx++;
      });
    });
    const fileCountSess = changedFiles.length;
    const fileCountLabel = fileCountSess === 0 && filesChangedNote ? "paths unavailable" : fileCountSess + " file" + (fileCountSess !== 1 ? "s" : "");
    return /* @__PURE__ */ u4("div", { style: "background:var(--vscode-editorWidget-background,var(--bg));border:1px solid var(--border);border-radius:8px;margin-bottom:12px;overflow:hidden", children: [
      /* @__PURE__ */ u4(
        "div",
        {
          class: "files-session-header",
          onClick: () => setOpen((o4) => !o4),
          style: "display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;user-select:none",
          children: [
            /* @__PURE__ */ u4("span", { style: "font-size:10px;color:var(--muted);width:14px;text-align:center", children: open ? "\u25BC" : "\u25B6" }),
            /* @__PURE__ */ u4("span", { style: "font-weight:700;font-size:12px;color:var(--fg)", children: sessionNum }),
            /* @__PURE__ */ u4("span", { dangerouslySetInnerHTML: { __html: getAgentDotHtml(sess.source) } }),
            /* @__PURE__ */ u4("span", { style: "flex:1;min-width:0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis", title: sess.userRequest ?? "", children: sess.userRequest }),
            /* @__PURE__ */ u4("span", { style: "font-size:11px;color:var(--muted);background:var(--bg);padding:2px 8px;border-radius:4px", children: fileCountLabel })
          ]
        }
      ),
      open && /* @__PURE__ */ u4("div", { style: "border-top:1px solid var(--border)", children: changedFiles.length === 0 ? /* @__PURE__ */ u4("div", { style: "padding:16px 42px;color:var(--muted);font-style:italic;font-size:12px", children: [
        filesChangedNote ? "Changed files could not be recovered for this session" : "No files were modified in this session",
        filesChangedNote && /* @__PURE__ */ u4("div", { style: "margin-top:8px;padding:10px 12px;border-radius:6px;border:1px solid rgba(217,119,87,0.35);background:rgba(217,119,87,0.08);color:var(--fg);font-style:normal;line-height:1.45", children: filesChangedNote })
      ] }) : changedFiles.map((fp) => /* @__PURE__ */ u4(FileItem, { fp, edits: fileEdits[fp] ?? [], ridx }, fp)) })
    ] });
  }
  function Files() {
    const sessions = displaySessions.value;
    if (!sessions.length) {
      return /* @__PURE__ */ u4("div", { id: "files-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const reversed = sessions.slice().reverse();
    const totalFilesSet = /* @__PURE__ */ new Set();
    let totalEdits = 0, totalAdded = 0, totalRemoved = 0;
    reversed.forEach((sess) => {
      ;
      (sess.filesChanged ?? []).forEach((f5) => totalFilesSet.add(f5));
      (sess.timeline ?? []).forEach((e4) => {
        totalEdits += e4.editDetails?.length ?? 0;
        for (const ed of e4.editDetails ?? []) {
          if (ed.content) {
            totalAdded += countLines(ed.content);
          } else {
            totalAdded += countLines(ed.newString);
            totalRemoved += countLines(ed.oldString);
          }
        }
      });
    });
    return /* @__PURE__ */ u4("div", { id: "files-content", children: [
      /* @__PURE__ */ u4("div", { class: "tab-stats", children: [
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: totalFilesSet.size }),
          " files changed"
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: totalEdits }),
          " edit operations"
        ] }),
        totalAdded > 0 && /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", style: "color:#4caf50", children: [
            "+",
            totalAdded
          ] }),
          " lines added"
        ] }),
        totalRemoved > 0 && /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", style: "color:#f44336", children: [
            "-",
            totalRemoved
          ] }),
          " lines removed"
        ] }),
        /* @__PURE__ */ u4("div", { children: [
          /* @__PURE__ */ u4("strong", { class: "tab-stat-val", children: reversed.length }),
          " sessions"
        ] })
      ] }),
      reversed.map((sess, ridx) => /* @__PURE__ */ u4(
        SessionBlock2,
        {
          sess,
          ridx,
          allCount: sessions.length,
          isOpen: ridx === 0
        },
        sess.traceId + ridx
      ))
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
  function Flow() {
    const sessions = displaySessions.value;
    const [selectedIdx, setSelectedIdx] = d2(-1);
    const [isPlaying, setIsPlaying] = d2(false);
    const setIsPlayingRef = A2(setIsPlaying);
    setIsPlayingRef.current = setIsPlaying;
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
      // node indices for LLM turns in order
      playbackIdx: 0,
      playbackPlaying: false,
      playbackTimer: null
    });
    if (sessions.length === 0) {
      return /* @__PURE__ */ u4("div", { id: "flow-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const allSessions = sessions.map((sess, idx) => {
      const num = getSessionGlobalNumber(sess) || idx + 1;
      const src = getAgentSourceLabel(sess.source);
      const turns = sess.totalLlmCalls ?? 0;
      const tools = sess.totalToolCalls ?? 0;
      return {
        label: `${num} \xB7 ${src} \xB7 ${turns} turns \xB7 ${tools} tool calls`,
        sess
      };
    });
    const clampedIdx = Math.max(0, Math.min(
      selectedIdx < 0 ? allSessions.length - 1 : selectedIdx,
      allSessions.length - 1
    ));
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
      const sess = allSessions[clampedIdx]?.sess;
      const timeline = (sess?.timeline ?? []).filter((e4) => e4.type !== "background");
      const turns = sess ? buildTurnGroups(sess, timeline) : [];
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
    }, [sessions, clampedIdx]);
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
      const speedSel = canvas.closest("#flow-content")?.querySelector("#flow-speed");
      const prog = canvas.closest("#flow-content")?.querySelector("#flow-progress");
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
      const speed = parseInt(speedSel?.value ?? "800") || 800;
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
      }, speed);
    }
    return /* @__PURE__ */ u4("div", { id: "flow-content", children: [
      /* @__PURE__ */ u4("div", { class: "flow-controls", style: "margin-bottom:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap", children: [
        /* @__PURE__ */ u4(
          "select",
          {
            id: "flow-session-select",
            class: "toolbar-select",
            value: clampedIdx,
            onChange: (e4) => setSelectedIdx(parseInt(e4.target.value) || 0),
            children: allSessions.map((s4, idx) => /* @__PURE__ */ u4("option", { value: idx, children: s4.label }, idx))
          }
        ),
        /* @__PURE__ */ u4("button", { class: "flow-btn", onClick: handleZoomIn, children: "+" }),
        /* @__PURE__ */ u4("button", { class: "flow-btn", onClick: handleZoomOut, children: "\u2212" }),
        /* @__PURE__ */ u4("button", { class: "flow-btn", onClick: handleReset, children: "Reset" }),
        /* @__PURE__ */ u4("span", { style: "width:1px;height:16px;background:var(--border);margin:0 4px" }),
        /* @__PURE__ */ u4("button", { class: "flow-btn", title: "Animate turn sequence", onClick: handlePlayPause, children: isPlaying ? "\u23F8" : "\u25B6" }),
        /* @__PURE__ */ u4("span", { class: "toolbar-control-label", children: "Speed" }),
        /* @__PURE__ */ u4("select", { id: "flow-speed", class: "toolbar-select", children: [
          /* @__PURE__ */ u4("option", { value: "2000", children: "Slow" }),
          /* @__PURE__ */ u4("option", { value: "800", selected: true, children: "Normal" }),
          /* @__PURE__ */ u4("option", { value: "300", children: "Fast" })
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { style: "display:flex;gap:12px;margin-bottom:8px;font-size:10px;color:var(--muted);flex-wrap:wrap;align-items:center", children: [
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
          id: "flow-canvas",
          style: "width:100%;height:520px;display:block;border:1px solid var(--border);border-radius:4px;cursor:grab"
        }
      )
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
  function KV({ k: k3, v: v4, accent }) {
    return /* @__PURE__ */ u4("div", { style: "padding:5px 8px;background:var(--panel-bg);border-radius:4px", children: [
      /* @__PURE__ */ u4("div", { style: "font-size:18px;font-weight:bold;color:" + accent, children: v4 }),
      /* @__PURE__ */ u4("div", { style: "font-size:10px;color:var(--muted)", children: k3 })
    ] });
  }
  function AgentCol({ label, accent, stats }) {
    const topTools = Object.keys(stats.toolCounts).sort((a4, b4) => stats.toolCounts[b4] - stats.toolCounts[a4]).slice(0, 8);
    return /* @__PURE__ */ u4("div", { style: "border:1px solid var(--border);border-radius:6px;padding:12px", children: [
      /* @__PURE__ */ u4("div", { style: "display:flex;align-items:center;gap:8px;margin-bottom:10px", children: [
        /* @__PURE__ */ u4("span", { style: "width:10px;height:10px;border-radius:50%;background:" + accent + ";display:inline-block" }),
        /* @__PURE__ */ u4("strong", { style: "font-size:13px", children: label })
      ] }),
      stats.sessions === 0 ? /* @__PURE__ */ u4("div", { class: "empty-state", style: "font-size:12px;padding:12px 0", children: [
        "No agent sessions recorded \u2014 start a ",
        label,
        " session"
      ] }) : /* @__PURE__ */ u4(S, { children: [
        /* @__PURE__ */ u4("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px", children: [
          /* @__PURE__ */ u4(KV, { k: "Sessions", v: stats.sessions, accent }),
          /* @__PURE__ */ u4(KV, { k: "LLM Calls", v: stats.totalLlm, accent }),
          /* @__PURE__ */ u4(KV, { k: "Input Tokens", v: formatCompact(stats.totalInput), accent }),
          /* @__PURE__ */ u4(KV, { k: "Output Tokens", v: formatCompact(stats.totalOutput), accent }),
          stats.totalCache > 0 && /* @__PURE__ */ u4(KV, { k: "Cache Tokens", v: formatCompact(stats.totalCache), accent }),
          stats.totalCache > 0 && /* @__PURE__ */ u4(KV, { k: "Cache Hit Rate", v: (stats.cacheHitRate * 100).toFixed(0) + "%", accent }),
          stats.avgTtft > 0 && /* @__PURE__ */ u4(KV, { k: "Avg TTFT", v: formatMs(stats.avgTtft), accent }),
          /* @__PURE__ */ u4(KV, { k: "Avg Duration", v: formatMs(stats.avgDuration), accent }),
          /* @__PURE__ */ u4(KV, { k: "Total Tools", v: stats.totalTools, accent })
        ] }),
        topTools.length > 0 && /* @__PURE__ */ u4(S, { children: [
          /* @__PURE__ */ u4("div", { style: "font-size:10px;color:var(--muted);font-weight:600;margin-bottom:5px;text-transform:uppercase", children: "Top Tools" }),
          /* @__PURE__ */ u4("div", { style: "display:flex;flex-wrap:wrap;gap:4px", children: topTools.map((t4) => /* @__PURE__ */ u4("span", { style: "padding:2px 7px;background:var(--panel-bg);border-radius:3px;font-size:11px", children: [
            t4,
            " ",
            /* @__PURE__ */ u4("span", { style: "color:" + accent, children: stats.toolCounts[t4] })
          ] }, t4)) })
        ] })
      ] })
    ] });
  }
  function Agents() {
    const allSessions = displaySessions.value;
    if (!allSessions.length) {
      return /* @__PURE__ */ u4("div", { id: "agents-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const copStats = computeStats(allSessions.filter((s4) => s4.source === "copilot"));
    const cldStats = computeStats(allSessions.filter((s4) => s4.source === "claude_code"));
    const cdxStats = computeStats(allSessions.filter((s4) => s4.source === "codex"));
    return /* @__PURE__ */ u4("div", { id: "agents-content", children: /* @__PURE__ */ u4("div", { style: "display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px", children: [
      /* @__PURE__ */ u4(AgentCol, { label: "GitHub Copilot", accent: "#00EAFF", stats: copStats }),
      /* @__PURE__ */ u4(AgentCol, { label: "Claude", accent: "#FFB085", stats: cldStats }),
      /* @__PURE__ */ u4(AgentCol, { label: "OpenAI Codex", accent: "#F0FF42", stats: cdxStats })
    ] }) });
  }

  // media/src/tabs/Tools.tsx
  function getInputTokenCount(span) {
    let input = 0;
    (span?.attributes ?? []).forEach((a4) => {
      if (/input.?tokens|prompt.?tokens/i.test(a4.key))
        input = parseInt(String(a4.value.intValue ?? a4.value.stringValue ?? a4.value.doubleValue)) || 0;
    });
    return input;
  }
  function getOutputTokenCount2(span) {
    let output = 0;
    (span?.attributes ?? []).forEach((a4) => {
      if (/output.?tokens|completion.?tokens/i.test(a4.key))
        output = parseInt(String(a4.value.intValue ?? a4.value.stringValue ?? a4.value.doubleValue)) || 0;
    });
    return output;
  }
  function Tools() {
    const spans2 = displaySpans.value;
    const sessions = displaySessions.value;
    const traceSourceMap = {};
    sessions.forEach((sess) => {
      if (sess.traceId && sess.source) traceSourceMap[sess.traceId] = sess.source;
    });
    const counts = {};
    const toolTokens = {};
    const toolDurations = {};
    const toolErrors = {};
    const toolAgents = {};
    spans2.forEach((s4) => {
      if (s4.name?.includes("tool")) {
        const name = s4.name;
        counts[name] = (counts[name] ?? 0) + 1;
        if (!toolTokens[name]) toolTokens[name] = { input: 0, output: 0 };
        toolTokens[name].input += getInputTokenCount(s4);
        toolTokens[name].output += getOutputTokenCount2(s4);
        if (!toolDurations[name]) toolDurations[name] = [];
        const dur = nanoToMs(s4.endTime) - nanoToMs(s4.startTime);
        if (dur > 0) toolDurations[name].push(dur);
        if (s4.status?.code === 2) toolErrors[name] = (toolErrors[name] ?? 0) + 1;
        const src = s4.traceId && traceSourceMap[s4.traceId] || inferSpanSource(s4) || null;
        if (src) {
          if (!toolAgents[name]) toolAgents[name] = {};
          toolAgents[name][src] = true;
        }
      }
    });
    const entries = Object.entries(counts).sort((a4, b4) => b4[1] - a4[1]);
    if (entries.length === 0) {
      return /* @__PURE__ */ u4("div", { id: "tools-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No agent sessions recorded \u2014 start a Copilot, Claude, or Codex session" }) });
    }
    const total = entries.reduce((sum, e4) => sum + e4[1], 0);
    const _totalErrors = entries.reduce((s4, e4) => s4 + (toolErrors[e4[0]] ?? 0), 0);
    const _failedTools = entries.filter((e4) => (toolErrors[e4[0]] ?? 0) > 0);
    const _mostUsed = entries[0];
    const mostTokens = entries.slice().sort((a4, b4) => {
      const tA = toolTokens[a4[0]] ? toolTokens[a4[0]].input + toolTokens[a4[0]].output : 0;
      const tB = toolTokens[b4[0]] ? toolTokens[b4[0]].input + toolTokens[b4[0]].output : 0;
      return tB - tA;
    })[0];
    const _mostTokVal = mostTokens && toolTokens[mostTokens[0]] ? toolTokens[mostTokens[0]].input + toolTokens[mostTokens[0]].output : 0;
    const r5 = 80, cx = 100, cy = 100, sw = 30;
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
    let grandErrors = 0;
    return /* @__PURE__ */ u4("div", { id: "tools-content", children: [
      /* @__PURE__ */ u4("h3", { style: "margin:0 0 16px;font-size:13px;color:var(--muted)", children: "TOOL CALL DISTRIBUTION" }),
      /* @__PURE__ */ u4("div", { class: "donut-container", children: [
        /* @__PURE__ */ u4("svg", { width: "200", height: "200", viewBox: "0 0 200 200", children: [
          slices.map(
            (sl) => sl.pct >= 1 ? /* @__PURE__ */ u4("circle", { cx, cy, r: r5, fill: "none", stroke: sl.color, "stroke-width": sw }, sl.name) : /* @__PURE__ */ u4("path", { d: arcPath(sl.startA, sl.endA), fill: "none", stroke: sl.color, "stroke-width": sw, "stroke-linecap": "butt" }, sl.name)
          ),
          /* @__PURE__ */ u4("text", { x: cx, y: cy, "text-anchor": "middle", dy: "4", "font-size": "18", "font-weight": "bold", fill: "var(--fg)", children: total }),
          /* @__PURE__ */ u4("text", { x: cx, y: cy + 16, "text-anchor": "middle", "font-size": "10", fill: "var(--muted)", opacity: "0.7", children: "total" })
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
      /* @__PURE__ */ u4("h3", { style: "margin:24px 0 12px;font-size:13px;color:var(--muted)", children: "TOOL TOKEN USAGE & PERFORMANCE" }),
      /* @__PURE__ */ u4("table", { class: "tool-insights-table", children: [
        /* @__PURE__ */ u4("thead", { children: /* @__PURE__ */ u4("tr", { children: [
          /* @__PURE__ */ u4("th", { children: "Tool" }),
          /* @__PURE__ */ u4("th", { children: "Calls" }),
          /* @__PURE__ */ u4("th", { children: "Errors" }),
          /* @__PURE__ */ u4("th", { children: "Avg Duration" })
        ] }) }),
        /* @__PURE__ */ u4("tbody", { children: entries.map(([name, callCount]) => {
          const durations = toolDurations[name] ?? [];
          const errCount = toolErrors[name] ?? 0;
          grandErrors += errCount;
          const avgDur = durations.length > 0 ? durations.reduce((s4, d5) => s4 + d5, 0) / durations.length : 0;
          const agents = toolAgents[name] ? Object.keys(toolAgents[name]) : [];
          return /* @__PURE__ */ u4("tr", { children: [
            /* @__PURE__ */ u4("td", { children: [
              agents.map((a4) => /* @__PURE__ */ u4("span", { style: "display:inline-block;width:8px;height:8px;border-radius:50%;background:" + getAgentColor(a4) + ";vertical-align:middle;margin-right:4px", title: getAgentSourceLabel(a4) }, a4)),
              name
            ] }),
            /* @__PURE__ */ u4("td", { class: "right", children: callCount }),
            /* @__PURE__ */ u4("td", { style: "text-align:right" + (errCount > 0 ? ";color:var(--error)" : ""), children: errCount }),
            /* @__PURE__ */ u4("td", { class: "right", children: avgDur > 0 ? formatMs(avgDur) : "\u2014" })
          ] }, name);
        }) }),
        /* @__PURE__ */ u4("tfoot", { children: /* @__PURE__ */ u4("tr", { children: [
          /* @__PURE__ */ u4("td", { children: /* @__PURE__ */ u4("strong", { children: "Total" }) }),
          /* @__PURE__ */ u4("td", { class: "right", children: /* @__PURE__ */ u4("strong", { children: total }) }),
          /* @__PURE__ */ u4("td", { style: "text-align:right" + (grandErrors > 0 ? ";color:var(--error)" : ""), children: /* @__PURE__ */ u4("strong", { children: grandErrors }) }),
          /* @__PURE__ */ u4("td", {})
        ] }) })
      ] })
    ] });
  }

  // media/src/tabs/Errors.tsx
  function ErrorItem({ span, source }) {
    const [open, setOpen] = d2(false);
    const st = nanoToMs(span.startTime);
    const en = nanoToMs(span.endTime);
    const dur = en - st;
    const badge = spanTypeBadge(span);
    const statusMsg = span.status?.message ?? "";
    const dotColor = source ? getAgentColor(source) : null;
    const detailLines = [
      { k: "Span Name", v: span.name ?? "\u2014" },
      { k: "Span ID", v: span.spanId ?? "\u2014" },
      { k: "Trace ID", v: span.traceId ?? "\u2014" },
      ...span.parentSpanId ? [{ k: "Parent Span ID", v: span.parentSpanId }] : [],
      { k: "Start Time", v: st > 0 ? new Date(st).toISOString() : "\u2014" },
      { k: "End Time", v: en > 0 ? new Date(en).toISOString() : "\u2014" },
      { k: "Duration", v: dur > 0 ? formatMs(dur) : "\u2014" },
      ...(span.attributes ?? []).map((a4) => {
        const v4 = a4.value;
        const display = v4.stringValue ?? v4.intValue ?? v4.doubleValue ?? v4.boolValue;
        return { k: a4.key, v: String(display ?? JSON.stringify(v4)) };
      })
    ];
    return /* @__PURE__ */ u4("div", { class: clsx_default("error-item", { open }), children: [
      /* @__PURE__ */ u4("div", { class: "error-item-header", onClick: () => setOpen((o4) => !o4), "data-error-id": span.spanId, children: [
        /* @__PURE__ */ u4("span", { class: "error-chevron", children: open ? "\u25BC" : "\u25B6" }),
        /* @__PURE__ */ u4("span", { class: "wf-type-badge", style: "background:" + badge.color + ";color:#000", children: badge.label }),
        /* @__PURE__ */ u4("span", { class: "error-name", children: [
          dotColor && /* @__PURE__ */ u4("span", { style: "display:inline-block;width:8px;height:8px;border-radius:50%;background:" + dotColor + ";vertical-align:middle;margin-right:4px", title: source ? getAgentSourceLabel(source) : "" }),
          span.name
        ] }),
        /* @__PURE__ */ u4("span", { class: "error-dur", children: formatMs(dur) }),
        st > 0 && /* @__PURE__ */ u4("span", { class: "error-time", children: new Date(st).toLocaleTimeString() })
      ] }),
      /* @__PURE__ */ u4("div", { class: clsx_default("error-detail", { open }), children: [
        statusMsg && /* @__PURE__ */ u4("div", { class: "error-message", children: statusMsg }),
        detailLines.map((dl) => /* @__PURE__ */ u4("div", { class: "wf-detail-row", children: [
          /* @__PURE__ */ u4("span", { class: "wf-detail-key", children: dl.k }),
          /* @__PURE__ */ u4("span", { class: "wf-detail-val", children: dl.v })
        ] }, dl.k))
      ] })
    ] });
  }
  function Errors() {
    const spans2 = displaySpans.value;
    const sessions = displaySessions.value;
    const traceSourceMap = {};
    sessions.forEach((sess) => {
      if (sess.traceId && sess.source) traceSourceMap[sess.traceId] = sess.source;
    });
    const errorSpans = spans2.filter((s4) => s4.status?.code === 2).sort((a4, b4) => nanoToMs(b4.startTime) - nanoToMs(a4.startTime));
    if (errorSpans.length === 0) {
      return /* @__PURE__ */ u4("div", { id: "errors-content", children: /* @__PURE__ */ u4("div", { class: "empty-state", children: "No errors recorded" }) });
    }
    return /* @__PURE__ */ u4("div", { id: "errors-content", children: /* @__PURE__ */ u4("div", { class: "error-list", children: errorSpans.map((s4) => {
      const src = s4.traceId && traceSourceMap[s4.traceId] || inferSpanSource(s4) || null;
      return /* @__PURE__ */ u4(ErrorItem, { span: s4, source: src }, s4.spanId);
    }) }) });
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
    const spanCount = displaySpans.value.length;
    const sessionCount = displaySessions.value.length;
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
    const empty = spanCount === 0;
    return /* @__PURE__ */ u4("div", { id: "export-content", children: [
      /* @__PURE__ */ u4("div", { class: "export-meta", children: [
        sessionCount,
        " session",
        sessionCount !== 1 ? "s" : "",
        " \xB7 ",
        spanCount,
        " span",
        spanCount !== 1 ? "s" : "",
        standalone && /* @__PURE__ */ u4("span", { class: "export-meta-mode", children: " \xB7 browser download" }),
        !standalone && /* @__PURE__ */ u4("span", { class: "export-meta-mode", children: " \xB7 written to workspace root" })
      ] }),
      /* @__PURE__ */ u4("div", { class: "export-cards", children: [
        /* @__PURE__ */ u4("div", { class: "export-card", children: [
          /* @__PURE__ */ u4("div", { class: "export-card-header", children: [
            /* @__PURE__ */ u4("span", { class: "export-card-title", children: "Export OTEL Data" }),
            /* @__PURE__ */ u4("span", { class: "export-card-badge export-badge-raw", children: "Raw" })
          ] }),
          /* @__PURE__ */ u4("p", { class: "export-card-desc", children: "All span attributes exported as-is \u2014 includes prompt text, tool inputs, tool outputs, and any other captured telemetry." }),
          /* @__PURE__ */ u4("ul", { class: "export-card-includes", children: [
            /* @__PURE__ */ u4("li", { children: "Prompt text and LLM responses" }),
            /* @__PURE__ */ u4("li", { children: "Tool call inputs and outputs" }),
            /* @__PURE__ */ u4("li", { children: "Token counts, timing, model names" }),
            /* @__PURE__ */ u4("li", { children: "File paths and diffs" })
          ] }),
          /* @__PURE__ */ u4("div", { class: "export-card-warning", children: "Keep private \u2014 may contain sensitive content." }),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "export-btn" + (rawDone ? " export-btn-done" : ""),
              onClick: doExport,
              disabled: empty,
              children: rawDone ? "\u2713 Exported" : "Export OTEL Data"
            }
          )
        ] }),
        /* @__PURE__ */ u4("div", { class: "export-card export-card-redacted", children: [
          /* @__PURE__ */ u4("div", { class: "export-card-header", children: [
            /* @__PURE__ */ u4("span", { class: "export-card-title", children: "Export Redacted" }),
            /* @__PURE__ */ u4("span", { class: "export-card-badge export-badge-redacted", children: "Safer to share" })
          ] }),
          /* @__PURE__ */ u4("p", { class: "export-card-desc", children: [
            "Same export with all sensitive values replaced by ",
            /* @__PURE__ */ u4("code", { children: "[redacted]" }),
            "before the file is written. Safe to attach to bug reports or share with teammates."
          ] }),
          /* @__PURE__ */ u4("ul", { class: "export-card-includes", children: [
            /* @__PURE__ */ u4("li", { children: [
              /* @__PURE__ */ u4("span", { class: "export-redacted-label", children: "[redacted]" }),
              " Prompt text and LLM responses"
            ] }),
            /* @__PURE__ */ u4("li", { children: [
              /* @__PURE__ */ u4("span", { class: "export-redacted-label", children: "[redacted]" }),
              " Tool call inputs and outputs"
            ] }),
            /* @__PURE__ */ u4("li", { children: "\u2713 Token counts, timing, model names" }),
            /* @__PURE__ */ u4("li", { children: "\u2713 Span structure and trace IDs" }),
            /* @__PURE__ */ u4("li", { children: [
              /* @__PURE__ */ u4("span", { class: "export-redacted-label", children: "[redacted]" }),
              " user.id, user.email, org.*"
            ] })
          ] }),
          /* @__PURE__ */ u4("div", { class: "export-card-safe", children: "Safer to share \u2014 review before sending, as file paths and custom attributes are not redacted." }),
          /* @__PURE__ */ u4(
            "button",
            {
              class: "export-btn export-btn-secondary" + (redactedDone ? " export-btn-done" : ""),
              onClick: doRedacted,
              disabled: empty,
              children: redactedDone ? "\u2713 Exported" : "Export Redacted"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ u4("div", { class: "export-replay-box", children: [
        /* @__PURE__ */ u4("div", { class: "export-replay-title", children: "Replay an export in the dashboard" }),
        /* @__PURE__ */ u4("p", { class: "export-replay-desc", children: [
          "Replay any exported file to re-examine a past session without running an agent. Works with both the VS Code extension and the standalone server \u2014 whichever is on port ",
          /* @__PURE__ */ u4("code", { children: "4318" }),
          "."
        ] }),
        /* @__PURE__ */ u4("pre", { class: "export-replay-cmd", children: "pnpm run demo -- --file ./export_redacted_claude_main_20260522_152343.json" }),
        /* @__PURE__ */ u4("p", { class: "export-replay-note", children: [
          "Each replay assigns fresh trace IDs so the session appears as a new entry. Pass ",
          /* @__PURE__ */ u4("code", { children: "--speed 4" }),
          " to pace the replay instead of sending all spans at once."
        ] })
      ] })
    ] });
  }

  // media/src/tabs/Help.tsx
  var VIEWS = [
    ["Efficiency", "The default tab. Per-session metrics (turns, cache hit rate, error rate), a heat-scored session breakdown table, and a context growth chart showing input token accumulation across LLM calls within each session."],
    ["Recommendations", "Actionable insights for improving prompt efficiency, plus loop and malfunction detection. Two signal categories: efficiency insights (token waste, cache, tool failures) and loop signals (tool deadlock, state spirals, error recurrence, runaway steps, context accumulation)."],
    ["Alerts", "Configurable alerts with shared context/cache rules plus per-agent thresholds for turns, errors, active session time, and identical tool repeats. The tab badge shows the count of active alerts."],
    ["Automation", "Automated prompts triggered when session thresholds are crossed. Configure per-agent automations for Loop Breaker, Turn Limit Wrap-up, and Context Dump. In the VS Code extension, automations show a notification or open the agent chat directly; in standalone mode they write to a file-based relay."],
    ["Summaries", "A human-readable session waterfall with LLM decisions, tool arguments and results, token usage per step, and background overhead breakdown."],
    ["Files", "Files created or modified by the agent, organized by session with inline before/after diffs showing exactly what changed."],
    ["Agents", "Side-by-side comparison of Copilot, Claude, and Codex with per-agent token totals, cache rates, time-to-first-token, and top tools, plus a full session history table."],
    ["Traces", "Raw OTLP spans as horizontal bars on a time axis, preserving the full parent-child nesting hierarchy and exact timing."],
    ["Tokens", "Token consumption aggregated by span name and per session, sorted from highest to lowest."],
    ["Cost", "Estimated session cost for Copilot and Codex sessions. Copilot supports three billing models: token-based AI Credits (Jun 2026+), request-based with multipliers (pre-Jun 2026), and annual-plan request-based (post-Jun 2026 for annual plan holders). Codex always uses token-based pricing. Shows a per-session bar chart and a cost table. Estimates only \u2014 not your actual bill."],
    ["Tools", "Donut chart of tool call distribution broken down by tool name, with call counts and error rates per tool."],
    ["Timeline", "All spans in chronological order as a vertical event list. Click any item to expand its attributes as formatted JSON."],
    ["Latency", "Span durations as a color-coded grid, helping identify which operations are consistently slow."],
    ["Errors", "All spans that completed with an error status. Click any item to expand its full details and attributes."],
    ["Flow", "LLM turns and tool calls visualized as a semantic graph \u2014 one node per turn, one per unique tool, edges weighted by call frequency. Supports zoom, pan, and playback animation."],
    ["Help", "This tab \u2014 an overview of the plugin, setup, agent OTEL data shapes, view descriptions, a glossary, and documentation for Recommendations and malfunction detection."]
  ];
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
    ["Loop Signal", "A behavioral signal in the Recommendations tab indicating the agent is stuck, oscillating, or making no forward progress. Shown with a \u21BA icon."],
    ["LLM", "Large Language Model. The underlying AI model (e.g. GPT-4o, Claude Sonnet) that generates text, answers questions, or produces code. The agent sends requests to the LLM as needed; the model itself does not manage tools or workflow. It is the engine that generates language and code for the agent to act on."],
    ["LLM Call", "A single request-response cycle to the language model. One session typically includes multiple LLM calls as the agent iterates."],
    ["OTLP", "OpenTelemetry Protocol \u2014 the standard format used to collect and transmit telemetry from AI agents to this extension. AgentLens accepts trace spans and log-derived events."],
    ["Outcome", 'How a session concluded: "text" means the agent responded with a text answer; "tool" means the last action was a tool call.'],
    ["Output Tokens", "The number of tokens generated by the language model in its response, including reasoning, tool call instructions, and final answers."],
    ["Output Ratio", "Percentage of total tokens that are output (generated by the model). In cached agentic coding sessions this can be naturally tiny, so AgentLens no longer uses it as a standalone alert."],
    ["Prompt", "The text you type into the AI chat to request work. Each prompt initiates a new session."],
    ["Request", "The user-visible message sent to the agent in a single prompt. In OTEL terms, the request anchor differs by agent: Copilot uses invoke_agent, Claude uses claude_code.interaction, and Codex is normalized from prompt log events."],
    ["Retain Spans", "A waterfall checkbox option. When checked, spans from previous prompts are kept visible alongside new ones."],
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
    ["Waterfall", "A visualization where spans are displayed as horizontal bars on a time axis, with nesting depth shown by indentation."]
  ];
  function termId(term) {
    return "gl-" + term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  var HELP_SECTIONS = {
    overview: {
      href: "#help-overview",
      heading: "Overview"
    },
    config: {
      href: "#help-config",
      heading: "Setup"
    },
    otel: {
      href: "#help-otel",
      heading: "OTEL Data"
    },
    insights: {
      href: "#help-insights",
      heading: "Insights"
    },
    loops: {
      href: "#help-loops",
      heading: "Loops"
    },
    views: {
      href: "#help-views",
      heading: "Views"
    },
    glossary: {
      href: "#help-glossary",
      heading: "Glossary"
    }
  };
  var TOC_SECTIONS = Object.values(HELP_SECTIONS);
  var AGENT_OTEL_SHAPES = [
    {
      agent: "Copilot",
      format: 'OpenTelemetry <a href="#gl-trace">trace</a> <a href="#gl-span">spans</a> with a clean single-trace hierarchy. Each conversation is one trace; <a href="#gl-llm-call">LLM calls</a> and tool calls are child spans nested under a session root. No extra configuration needed.',
      coverage: 'Prompt text, token counts (<a href="#gl-input-tokens">input</a>, <a href="#gl-output-tokens">output</a>), model name, <a href="#gl-ttft">TTFT</a>, tool names, tool arguments, tool results, and file paths are all present natively without any extra configuration.',
      gaps: `<a href="#gl-cache-read-tokens">Cache</a> token data (read/create) is not part of Copilot's telemetry. No additional configuration unlocks further data \u2014 what Copilot exposes is already fully available.`
    },
    {
      agent: "Claude Code",
      format: "OpenTelemetry trace spans. The session root span closes when the interaction ends, with LLM calls and tool calls as children. Optional supplemental log records are emitted when enhanced telemetry env vars are set.",
      coverage: "With the recommended configuration (all three OTEL_LOG_* vars set): prompt text, token counts, model, tool names, tool arguments, file paths, and full file diff content are all available.",
      gaps: "The three OTEL_LOG_* env vars are not enabled by default \u2014 without them, tool arguments are absent, prompt text is omitted, and file diff content is unavailable. Cache token data is only present when using a model that supports prompt caching."
    },
    {
      agent: "OpenAI Codex",
      format: "Primarily flat OTLP log records (structured JSON events sent to /v1/logs), not trace spans. Each session is a stream of log events grouped by conversation and turn identifiers. Adding trace_exporter to ~/.codex/config.toml also emits timing spans to /v1/traces. Both the CLI and the VS Code extension read the same config file.",
      coverage: "With the recommended configuration (log_user_prompt = true and both exporters set): prompt text, token counts, model name, TTFT, tool names, tool arguments, tool results, and span timing are all present.",
      gaps: "Trace and Timeline tabs have less span granularity than Copilot or Claude Code since Codex is primarily log-based. Without trace_exporter, span waterfall data is limited."
    }
  ];
  var codeStyle = "font-size:11px;background:var(--panel-bg);padding:1px 4px;border-radius:3px";
  var preStyle = "background:var(--panel-bg);border:1px solid var(--border);border-radius:5px;padding:10px 14px;font-size:11.5px;line-height:1.6;overflow-x:auto;white-space:pre";
  var h4Style = "font-size:13px;font-weight:600;margin:0 0 6px;color:var(--fg,inherit)";
  var mutedP = "font-size:12px;color:var(--muted);margin:0 0 8px";
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
      /* @__PURE__ */ u4("nav", { class: "help-toc", "aria-label": "Help sections", style: "position:sticky;top:0;z-index:20;background:var(--vscode-editorWidget-background,var(--bg));border-bottom:1px solid var(--border);padding:7px 0 8px;margin:0 -16px 20px -12px;padding-left:12px;display:flex;gap:4px;flex-wrap:wrap", children: TOC_SECTIONS.map((s4) => /* @__PURE__ */ u4("a", { href: s4.href, children: s4.heading })) })
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
        " is a local observability dashboard for AI coding ",
        /* @__PURE__ */ u4("a", { href: "#gl-agent", children: "agents" }),
        " \u2014 GitHub Copilot, Claude Code, and Codex. It captures the ",
        /* @__PURE__ */ u4("a", { href: "#gl-otlp", children: "OpenTelemetry (OTLP)" }),
        " traces each agent emits and surfaces them through an interactive dashboard showing ",
        /* @__PURE__ */ u4("a", { href: "#gl-tokens", children: "token" }),
        " usage, cost, latency, ",
        /* @__PURE__ */ u4("a", { href: "#gl-tool-call", children: "tool calls" }),
        ", file changes, ",
        /* @__PURE__ */ u4("a", { href: "#gl-cache-hit-rate", children: "cache" }),
        " performance, and ",
        /* @__PURE__ */ u4("a", { href: "#gl-agent-loop-malfunction", children: "loop" }),
        " detection in real time. All data stays on your machine. Available as a VS Code extension or a standalone Docker image."
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
      /* @__PURE__ */ u4("pre", { style: "font-size:11px;background:var(--panel-bg);border:1px solid var(--border);border-radius:3px;padding:6px 10px;margin:0 0 8px;overflow-x:auto;white-space:pre", children: `# macOS / Linux \u2014 all agents, or pick one:
./scripts/configure-agents.sh
./scripts/configure-agents.sh --agent claude
./scripts/configure-agents.sh --agent codex
./scripts/configure-agents.sh --agent copilot

# Windows (PowerShell):
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
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "OpenAI Codex" }),
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
          /* @__PURE__ */ u4("td", { style: "padding:4px 12px 4px 0;white-space:nowrap;vertical-align:top;color:var(--foreground)", children: "OpenAI Codex" }),
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
      /* @__PURE__ */ u4("h4", { style: h4Style, children: "OpenAI Codex" }),
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
        /* @__PURE__ */ u4("p", { style: "margin-top:14px;font-size:12px;color:var(--muted)", children: [
          "The practical effect: ",
          /* @__PURE__ */ u4("a", { href: "#gl-trace", children: "Traces" }),
          " and Timeline stay closest to the raw OTEL structure, while Efficiency, Summaries, Recommendations, Alerts, Automation, Agents, and Flow use the normalized session model so the three agents can be compared side by side."
        ] })
      ] })
    ] });
  }
  function InsightsSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-insights", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.insights.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: [
          "The ",
          /* @__PURE__ */ u4("strong", { children: "Recommendations" }),
          " tab surfaces efficiency insights for ",
          /* @__PURE__ */ u4("a", { href: "#gl-tokens", children: "token" }),
          " waste, ",
          /* @__PURE__ */ u4("a", { href: "#gl-cache-hit-rate", children: "cache" }),
          " patterns, tool behavior, and prompt shape. These are the signals meant to help you spend fewer ",
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
              steps: `<li>Provide exact file paths in your prompt.</li><li>Tell the agent which package manager and runtime are available.</li><li>Check the Errors tab to see what paths were guessed.</li><li>Verify files exist before prompting.</li>`,
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
        ] })
      ] })
    ] });
  }
  function LoopsSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-loops", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.loops.heading }),
      /* @__PURE__ */ u4("div", { class: "help-overview-body", children: [
        /* @__PURE__ */ u4("p", { children: [
          /* @__PURE__ */ u4("a", { href: "#gl-loop-signal", children: "Loop signals" }),
          " are behavioral patterns indicating the ",
          /* @__PURE__ */ u4("a", { href: "#gl-agent", children: "agent" }),
          " is stuck, oscillating, or spiraling into unproductive work. They appear in Recommendations with warning or critical severity."
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
              steps: `<li>Stop immediately \u2014 cost compounds with no progress.</li><li>Start fresh with a focused prompt stating what was already read.</li><li>Include the specific target state, not just the problem.</li><li>Use the Summaries tab to review what was accomplished.</li>`,
              impact: "Catching at 4 calls instead of 10 saves ~390,000 input tokens at peak context size."
            }
          )
        ] }),
        /* @__PURE__ */ u4("p", { style: "margin-top:16px;font-size:12px;color:var(--muted)", children: [
          "Loop signals appear first in the Recommendations list, sorted by severity. Use the ",
          /* @__PURE__ */ u4("strong", { children: "Loops" }),
          " filter pill to view only malfunction signals. Use ",
          /* @__PURE__ */ u4("strong", { children: "Ignore" }),
          " to dismiss a signal if it was intentional behavior."
        ] })
      ] })
    ] });
  }
  function ViewsSection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-views", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.views.heading }),
      /* @__PURE__ */ u4("div", { class: "glossary", children: VIEWS.map(([name, desc]) => /* @__PURE__ */ u4("div", { class: "glossary-item", children: [
        /* @__PURE__ */ u4("dt", { class: "glossary-term", children: name }),
        /* @__PURE__ */ u4("dd", { class: "glossary-def", children: desc })
      ] })) })
    ] });
  }
  function GlossarySection() {
    return /* @__PURE__ */ u4("div", { class: "help-section", id: "help-glossary", children: [
      /* @__PURE__ */ u4("h3", { class: "help-heading", children: HELP_SECTIONS.glossary.heading }),
      /* @__PURE__ */ u4("div", { class: "glossary", children: TERMS.map(([term, def]) => /* @__PURE__ */ u4("div", { class: "glossary-item", id: termId(term), style: "scroll-margin-top:44px", children: [
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
      /* @__PURE__ */ u4(InsightsSection, {}),
      /* @__PURE__ */ u4(LoopsSection, {}),
      /* @__PURE__ */ u4(ViewsSection, {}),
      /* @__PURE__ */ u4(GlossarySection, {}),
      /* @__PURE__ */ u4("p", { style: "font-size:11px;color:var(--muted);margin-top:24px;padding-top:12px;border-top:1px solid var(--border);line-height:1.6", children: [
        /* @__PURE__ */ u4("strong", { children: "Disclaimer:" }),
        " AgentLens is an independent open-source project and is not affiliated with, endorsed by, or associated with GitHub, Inc. or Microsoft Corporation (GitHub Copilot); Anthropic, PBC (Claude / Claude Code); or OpenAI, LLC (Codex / OpenAI Codex CLI). All product names, trademarks, and registered trademarks are the property of their respective owners. AgentLens interacts with these products solely through their publicly documented OpenTelemetry telemetry interfaces."
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
  var TABS = [
    { id: "efficiency", label: "Efficiency", title: "Per-session metrics and token usage breakdown." },
    { id: "recommendations", label: "Recommendations", title: "Actionable insights and recommendations for improving prompt efficiency and reducing token waste." },
    { id: "alerts", label: "Alerts", title: "Configurable alerts for context window usage, error rates, session length, and other efficiency signals." },
    { id: "automation", label: "Automation", title: "Real-time automations that prompt agents to compact context, break loops, and self-assess when configured thresholds are crossed." },
    { id: "tokens", label: "Tokens", title: "Token consumption aggregated by span name and per session, sorted from highest to lowest." },
    { id: "cost", label: "Cost", title: "Estimated session cost based on token usage and Copilot AI Credits pricing. Supports both token-based (Jun 2026+) and legacy request-based billing." },
    { id: "latency", label: "Latency", title: "Span durations as a color-coded grid, helping identify which operations are consistently slow." },
    { id: "summaries", label: "Summaries", title: "A high-level, human-readable timeline of each session \u2014 LLM calls with their decisions, tool calls with arguments, and token usage." },
    { id: "traces", label: "Traces", title: "Raw OTLP spans as horizontal bars on a time axis, preserving the full parent-child nesting hierarchy and exact timing." },
    { id: "files", label: "Files", title: "Files created or modified by the agent, organized by session with inline diffs." },
    { id: "flow", label: "Flow", title: "LLM turns and tool calls visualized as a semantic graph \u2014 one node per turn, one per unique tool, edges weighted by call frequency." },
    { id: "agents", label: "Agents", title: "Copilot, Claude, and Codex \u2014 session counts, token usage, tools, and latency broken down by agent source." },
    { id: "tools", label: "Tools", title: "Tool call distribution broken down by tool name, with token usage and performance stats per tool." },
    { id: "errors", label: "Errors", title: "All spans that completed with an error status. Click any item to expand its full details and attributes." },
    { id: "export", label: "Export", title: "Export raw or redacted OTEL span data as JSON files." },
    { id: "help", label: "Help", title: "Overview of the plugin, descriptions of each view, and a glossary of terms used throughout the dashboard." }
  ];
  function fillMissingClaudeSessions(summary, allSpans) {
    if (!summary) return null;
    const sessionTraceIds = new Set(summary.sessions.map((s4) => s4.traceId).filter(Boolean));
    const claudeTraceMap = {};
    for (const span of allSpans) {
      if (!span.traceId || sessionTraceIds.has(span.traceId)) continue;
      if (span.name !== "claude_code.llm_request" && span.name !== "claude_code.tool") continue;
      if (!claudeTraceMap[span.traceId]) claudeTraceMap[span.traceId] = [];
      claudeTraceMap[span.traceId].push(span);
    }
    const traceIds = Object.keys(claudeTraceMap);
    if (traceIds.length === 0) return summary;
    const attrStr = (span, key) => {
      const a4 = (span.attributes ?? []).find((x4) => x4.key === key);
      return String(a4?.value?.stringValue ?? a4?.value?.intValue ?? a4?.value?.doubleValue ?? "");
    };
    const attrInt = (span, key) => {
      const a4 = (span.attributes ?? []).find((x4) => x4.key === key);
      return parseInt(String(a4?.value?.intValue ?? a4?.value?.stringValue ?? 0)) || 0;
    };
    const newSessions = traceIds.map((traceId) => {
      const traceSpans = claudeTraceMap[traceId];
      const llmSpans = traceSpans.filter((s4) => s4.name === "claude_code.llm_request");
      const toolSpans = traceSpans.filter((s4) => s4.name === "claude_code.tool");
      const allSorted = [...traceSpans].sort((a4, b4) => (a4.startTime ?? "0") < (b4.startTime ?? "0") ? -1 : 1);
      let inputTokens = 0, outputTokens = 0, cacheReadTokens = 0, cacheCreateTokens = 0;
      let model = "";
      for (const s4 of llmSpans) {
        inputTokens += attrInt(s4, "input_tokens");
        outputTokens += attrInt(s4, "output_tokens");
        cacheReadTokens += attrInt(s4, "cache_read_tokens");
        cacheCreateTokens += attrInt(s4, "cache_creation_tokens");
        const m4 = attrStr(s4, "gen_ai.request.model") || attrStr(s4, "model");
        if (m4) model = m4;
      }
      const totalInput = inputTokens + cacheReadTokens + cacheCreateTokens;
      const timeline = [...llmSpans, ...toolSpans].sort((a4, b4) => (a4.startTime ?? "0") < (b4.startTime ?? "0") ? -1 : 1).map((s4) => {
        const st = nanoToMs(s4.startTime), en = nanoToMs(s4.endTime);
        const dur = Math.max(en - st, 0);
        if (s4.name === "claude_code.llm_request") {
          const inTok = attrInt(s4, "input_tokens") + attrInt(s4, "cache_read_tokens") + attrInt(s4, "cache_creation_tokens");
          const llmModel = attrStr(s4, "gen_ai.request.model") || attrStr(s4, "model");
          const stopReason = attrStr(s4, "stop_reason");
          return {
            type: "llm",
            spanId: s4.spanId,
            label: llmModel || "LLM",
            model: llmModel,
            inputTokens: inTok,
            outputTokens: attrInt(s4, "output_tokens"),
            ttft: attrInt(s4, "ttft_ms"),
            durationMs: dur,
            action: stopReason === "tool_use" ? "called tools" : stopReason === "end_turn" ? "text response" : stopReason || "unknown",
            isError: s4.status?.code === 2,
            errorMessage: s4.status?.code === 2 ? s4.status?.message || void 0 : void 0,
            timestamp: st > 0 ? new Date(st).toISOString() : ""
          };
        } else {
          const toolName2 = attrStr(s4, "tool_name") || s4.name;
          return {
            type: "tool",
            spanId: s4.spanId,
            label: toolName2,
            durationMs: dur,
            toolInput: attrStr(s4, "tool_input") || attrStr(s4, "input") || void 0,
            isError: s4.status?.code === 2,
            errorMessage: s4.status?.code === 2 ? s4.status?.message || void 0 : void 0,
            timestamp: st > 0 ? new Date(st).toISOString() : ""
          };
        }
      });
      const toolCounts = {};
      for (const s4 of toolSpans) {
        const tn = attrStr(s4, "tool_name") || s4.name;
        toolCounts[tn] = (toolCounts[tn] || 0) + 1;
      }
      const startMs = nanoToMs(allSorted[0]?.startTime);
      const endMs = nanoToMs(allSorted[allSorted.length - 1]?.endTime);
      return {
        sessionId: `synth-${traceId.slice(0, 12)}`,
        traceId,
        source: "claude_code",
        userRequest: "[session in progress]",
        model,
        turns: llmSpans.length,
        inputTokens: totalInput,
        outputTokens,
        cacheReadTokens,
        cacheCreateTokens,
        cacheHitRate: totalInput > 0 ? cacheReadTokens / totalInput : 0,
        durationMs: endMs - startMs,
        startTime: startMs > 0 ? new Date(startMs).toISOString() : "",
        filesRead: [],
        filesSearched: [],
        filesChanged: [],
        filesChangedNote: "Session in progress \u2014 file changes will appear when the interaction completes.",
        toolCounts,
        totalToolCalls: toolSpans.length,
        totalLlmCalls: llmSpans.length,
        errors: traceSpans.filter((s4) => s4.status?.code === 2).length,
        outcome: "unknown",
        timeline,
        backgroundSpans: [],
        loopSignals: []
      };
    });
    const combined = [...summary.sessions, ...newSessions].sort((a4, b4) => sessionStartMs(a4) - sessionStartMs(b4));
    return { ...summary, sessions: combined };
  }
  function updateWaterfall(newSpans) {
    if (retainWaterfall.value) {
      const existingIds = new Set(waterfallSpans.value.map((s4) => s4.spanId));
      const toAdd = newSpans.filter((s4) => !existingIds.has(s4.spanId) && !dismissedSpanIds.has(s4.spanId));
      if (toAdd.length > 0) {
        waterfallSpans.value = [...waterfallSpans.value, ...toAdd];
      }
    } else {
      const agentSpans = newSpans.filter((s4) => isSessionSpan(s4.name));
      if (agentSpans.length > 0) {
        agentSpans.sort((a4, b4) => {
          const ta = a4.startTime ?? "0", tb = b4.startTime ?? "0";
          return ta < tb ? 1 : ta > tb ? -1 : 0;
        });
        const latestTraceId = agentSpans[0].traceId;
        const relatedTraceIds = /* @__PURE__ */ new Set([latestTraceId]);
        for (const s4 of newSpans) {
          if (s4.traceId !== latestTraceId) continue;
          const rawTraceId = getAttr(s4, "otel.trace_id");
          if (rawTraceId) relatedTraceIds.add(String(rawTraceId));
        }
        waterfallSpans.value = newSpans.filter(
          (s4) => relatedTraceIds.has(s4.traceId) && !dismissedSpanIds.has(s4.spanId)
        );
      } else {
        waterfallSpans.value = newSpans.filter((s4) => !dismissedSpanIds.has(s4.spanId));
      }
    }
  }
  function ActivePanel() {
    const tab = normalizeTabId(activeTab.value);
    switch (tab) {
      case "efficiency":
        return /* @__PURE__ */ u4(Efficiency, {});
      case "recommendations":
        return /* @__PURE__ */ u4(Recommendations, {});
      case "alerts":
        return /* @__PURE__ */ u4(Alerts, {});
      case "tokens":
        return /* @__PURE__ */ u4(Tokens, {});
      case "cost":
        return /* @__PURE__ */ u4(Cost, {});
      case "latency":
        return /* @__PURE__ */ u4(Latency, {});
      case "summaries":
        return /* @__PURE__ */ u4(Summaries, {});
      case "traces":
        return /* @__PURE__ */ u4(Traces, {});
      case "files":
        return /* @__PURE__ */ u4(Files, {});
      case "flow":
        return /* @__PURE__ */ u4(Flow, {});
      case "agents":
        return /* @__PURE__ */ u4(Agents, {});
      case "tools":
        return /* @__PURE__ */ u4(Tools, {});
      case "errors":
        return /* @__PURE__ */ u4(Errors, {});
      case "export":
        return /* @__PURE__ */ u4(Export, {});
      case "automation":
        return /* @__PURE__ */ u4(Automation, {});
      case "help":
        return /* @__PURE__ */ u4(Help, {});
      default:
        return null;
    }
  }
  function normalizeTabId(tab) {
    return tab === "dependencies" ? "flow" : tab;
  }
  function App() {
    y2(() => {
      const exportHandler = (e4) => {
        const type = e4.data?.type;
        if (type !== "exportSessionData" && type !== "exportSessionDataRedacted") return;
        if (!window.__STANDALONE__) return;
        const redact = type === "exportSessionDataRedacted";
        const allSpans = spans.value;
        const sessions = displaySessions.value;
        const _now = /* @__PURE__ */ new Date();
        const _pad = (n3) => n3.toString().padStart(2, "0");
        const timestamp = `${_now.getFullYear()}${_pad(_now.getMonth() + 1)}${_pad(_now.getDate())}_${_pad(_now.getHours())}${_pad(_now.getMinutes())}${_pad(_now.getSeconds())}`;
        const prefix = redact ? "export_redacted" : "export";
        const REDACT_CONTENT = /* @__PURE__ */ new Set([
          "gen_ai.prompt",
          "gen_ai.completion",
          "llm.prompts",
          "llm.completions",
          "tool_input",
          "tool_result",
          "user_prompt",
          "system_prompt",
          "input",
          "output"
        ]);
        const REDACT_PII = /* @__PURE__ */ new Set([
          "user.id",
          "user.name",
          "user.email",
          "user.username",
          "enduser.id",
          "enduser.name",
          "enduser.email",
          "organization.id",
          "organization.name",
          "github.copilot.user",
          "github.user"
        ]);
        const shouldRedact = (key) => REDACT_CONTENT.has(key) || REDACT_PII.has(key) || key.endsWith(".content") || key.includes("prompt") || key.includes("tool_input") || key.includes("tool_result") || key.startsWith("user.") || key.startsWith("enduser.") || key.startsWith("organization.");
        const traceAgent = {};
        for (const s4 of sessions) {
          const agent = s4.source === "claude_code" ? "claude" : s4.source || "unknown";
          if (s4.traceId) traceAgent[s4.traceId] = agent;
        }
        const groups = {};
        for (const span of allSpans) {
          const agent = traceAgent[span.traceId];
          if (!agent) continue;
          const attrs = Array.isArray(span.attributes) ? span.attributes : [];
          const rawPath = attrs.find((a4) => a4.key === "_agentlens.collector_path")?.value?.stringValue || "";
          const endpoint = rawPath ? rawPath.replace(/^\//, "").replace(/\//g, "-") : "main";
          const key = `${endpoint}__${agent}`;
          if (!groups[key]) groups[key] = [];
          const exportSpan = redact ? { ...span, attributes: attrs.map((a4) => shouldRedact(a4.key) ? { key: a4.key, value: { stringValue: "[redacted]" } } : a4) } : span;
          groups[key].push(exportSpan);
        }
        const triggerDownload = (blob2, filename) => {
          const url = URL.createObjectURL(blob2);
          const a4 = document.createElement("a");
          a4.href = url;
          a4.download = filename;
          document.body.appendChild(a4);
          a4.click();
          setTimeout(() => {
            document.body.removeChild(a4);
            URL.revokeObjectURL(url);
          }, 100);
        };
        const groupEntries = Object.entries(groups);
        if (groupEntries.length === 0) return;
        const files = {};
        for (const [key, groupSpans] of groupEntries) {
          const [endpoint, agent] = key.split("__");
          files[`${prefix}_${agent}_${endpoint}_${timestamp}.json`] = strToU8(JSON.stringify(groupSpans, null, 2));
        }
        const blob = new Blob([zipSync(files)], { type: "application/zip" });
        triggerDownload(blob, `agentlens_${prefix}_${timestamp}.zip`);
      };
      window.addEventListener("message", exportHandler);
      return () => window.removeEventListener("message", exportHandler);
    }, []);
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
      if (spans.value.length > 0) {
        if (waterfallSpans.value.length === 0) updateWaterfall(spans.value);
        const supplemented = fillMissingClaudeSessions(sessionSummary.value, spans.value);
        if (supplemented) sessionSummary.value = supplemented;
      }
    }, []);
    y2(() => {
      let initialLoadDone = false;
      const handler = (e4) => {
        const msg = e4.data;
        if (msg.type === "update") {
          spans.value = msg.spans ?? [];
          if (msg.summary?.toolCalls) toolCalls.value = msg.summary.toolCalls;
          const incomingSummary = msg.sessionSummary ?? sessionSummary.value;
          const supplemented = fillMissingClaudeSessions(incomingSummary, spans.value);
          if (supplemented) sessionSummary.value = supplemented;
          updateWaterfall(spans.value);
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
        } else if (msg.type === "switchTab" && msg.tab) {
          activeTab.value = normalizeTabId(msg.tab);
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
        } else if (msg.type === "clearAll") {
          spans.value = [];
          toolCalls.value = {};
          sessionSummary.value = null;
          waterfallSpans.value = [];
          swRetainedSessions.value = [];
          swLastSessionCount.value = 0;
          dismissedSpanIds.clear();
          lastSeenTraceIds.clear();
          expandedSpanIds.clear();
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, []);
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
        TABS.map(
          (t4) => t4.id === "alerts" ? /* @__PURE__ */ u4(AlertsTab, {}, "alerts") : /* @__PURE__ */ u4(Tab, { id: t4.id, label: t4.label }, t4.id)
        )
      ] }),
      /* @__PURE__ */ u4("div", { class: "panel active", children: /* @__PURE__ */ u4(ActivePanel, {}) }),
      /* @__PURE__ */ u4("img", { id: "mascot-img", src: "", alt: "AgentLens mascot", style: "display:none" })
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
  function AlertsTab() {
    const isActive = activeTab.value === "alerts";
    const _s = displaySessions.value;
    const count = computeAlertCount();
    return /* @__PURE__ */ u4(
      "button",
      {
        class: "tab" + (isActive ? " active" : ""),
        "data-tab": "alerts",
        onClick: () => {
          activeTab.value = "alerts";
        },
        children: count > 0 ? /* @__PURE__ */ u4("span", { style: "color:var(--error);font-weight:700", children: [
          "Alerts \u26A0 ",
          count
        ] }) : "Alerts"
      }
    );
  }

  // media/src/dashboard.tsx
  var vscode2 = window.acquireVsCodeApi();
  setVscode(vscode2);
  R(/* @__PURE__ */ u4(App, {}), document.getElementById("app"));
})();
//# sourceMappingURL=dashboard.js.map
