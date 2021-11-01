import { ref as e, reactive as t, onMounted as r, nextTick as n, onBeforeUnmount as a, computed as i, openBlock as o, createElementBlock as s, normalizeClass as l, unref as u, createElementVNode as d, normalizeStyle as c, renderSlot as g, withDirectives as m, Fragment as p, renderList as h, vShow as v } from "vue";
const f = { class: "crsl__pagination" }, P = ["onClick"], _ = { name: "CarouselView" };
var b = ((e2, t2) => {
  for (const [r2, n2] of t2)
    e2[r2] = n2;
  return e2;
})(Object.assign(_, { props: { direction: { type: String, default: "horizontal", validator: (e2) => ["vertical", "horizontal"].indexOf(e2) > -1 }, mousewheelControl: { type: Boolean, default: true }, performanceMode: { type: Boolean, default: false }, paginationVisible: { type: Boolean, default: true }, paginationClickable: { type: Boolean, default: false }, loop: { type: Boolean, default: true }, speed: { type: Number, default: 300 }, autoHeight: { type: Boolean, default: true }, autoWidth: { type: Boolean, default: true }, indicatorColor: { type: String, default: () => "rgba(153, 153, 153, 0.5)" }, indicatorTintColor: { type: String, default: () => "#007aff" } }, emits: ["slider-move", "slide-change-start", "slide-revert-start", "slide-change-end", "slide-revert-end"], setup: function(_2, { emit: b2 }) {
  const w2 = _2, y2 = e(null), E = t({ currentPage: 1, lastPage: 1, translateX: 0, translateY: 0, startTranslate: 0, delta: 0, dragging: false, startPos: null, transitioning: false, slideEls: [], translateOffset: 0, transitionDuration: 0, currentHeight: "unset", currentWidth: "unset", startTime: 0, observer: void 0 });
  r(() => {
    E.slideEls = [].map.call(y2.value.children, (e2) => e2), w2.loop ? (n(function() {
      $(), B(E.currentPage, true);
    }), C()) : B(E.currentPage);
  }), a(() => {
    T();
  });
  const C = () => {
    const e2 = document.querySelector(".crsl__wr");
    if (!e2)
      return;
    const t2 = window.MutationObserver || window.WebKitMutationObserver;
    E.observer = new t2(F), E.observer.observe(e2, { subtree: true, childList: true, attributes: true });
  }, T = () => {
    E.observer && (E.observer.disconnect(), E.observer = null), D();
  }, D = () => {
    document.removeEventListener("touchmove", V), document.removeEventListener("touchend", k), document.removeEventListener("mousemove", V), document.removeEventListener("mouseup", k);
  }, L = () => {
    const e2 = E.currentPage;
    e2 < E.slideEls.length || w2.loop ? B(e2 + 1) : M();
  }, W = () => {
    const e2 = E.currentPage;
    e2 > 1 || w2.loop ? B(e2 - 1) : M();
  }, B = (e2, t2) => {
    E.lastPage = E.currentPage, e2 === 0 ? E.currentPage = E.slideEls.length : e2 === E.slideEls.length + 1 ? E.currentPage = 1 : E.currentPage = e2, w2.loop ? (E.delta === 0 && j(K(E.lastPage)), setTimeout(function() {
      j(K(e2)), t2 || X();
    }, 0)) : (j(K(e2)), t2 || X());
  }, H = i(() => w2.direction === "horizontal"), O = i(() => w2.direction === "vertical"), S = (e2) => {
    E.startPos = Y(e2), E.delta = 0, E.startTranslate = K(E.currentPage), E.startTime = new Date().getTime(), E.dragging = true, E.transitionDuration = 0, document.addEventListener("touchmove", V, { passive: false }), document.addEventListener("touchend", k, { passive: false }), document.addEventListener("mousemove", V, { passive: false }), document.addEventListener("mouseup", k, { passive: false });
  }, V = (e2) => {
    E.delta = Y(e2) - E.startPos, w2.performanceMode || (j(E.startTranslate + E.delta), b2("slider-move", I())), (O || H && Math.abs(E.delta) > 0) && e2.preventDefault();
  }, k = (e2) => {
    E.dragging = false, E.transitionDuration = w2.speed;
    const t2 = new Date().getTime() - E.startTime < 1e3;
    E.delta < -100 || t2 && E.delta < -15 ? L() : E.delta > 100 || t2 && E.delta > 15 ? W() : M(), D();
  }, x = (e2) => {
    w2.mousewheelControl && (E.transitioning || (e2.deltaY > 0 ? L() : W()), q() && e2.preventDefault());
  }, M = () => {
    B(E.currentPage);
  }, Y = (e2) => {
    const t2 = H ? "pageX" : "pageY";
    return e2.changedTouches ? e2.changedTouches[0][t2] : e2[t2];
  }, X = () => {
    E.transitioning = true, E.transitionDuration = w2.speed, q() ? b2("slide-change-start", E.currentPage) : b2("slide-revert-start", E.currentPage);
  }, z = () => {
    E.transitioning = false, E.transitionDuration = 0, E.delta = 0, q() ? b2("slide-change-end", E.currentPage) : b2("slide-revert-end", E.currentPage), w2.autoHeight && H && A(), w2.autoWidth && O && N();
  }, A = () => {
    const e2 = y2.value;
    if (!e2 || !e2.children)
      return;
    E.currentHeight = "auto";
    const t2 = [...e2.children].filter((e3) => ![...e3.classList].includes("crsl__mirror")), r2 = getComputedStyle(t2[E.currentPage - 1], null).getPropertyValue("height");
    E.transitionDuration = w2.speed, n(() => {
      E.currentHeight = r2, setTimeout(() => {
        E.transitionDuration = 0;
      }, w2.speed);
    });
  }, N = () => {
    const e2 = y2.value;
    if (!e2 || !e2.children)
      return;
    E.currentWidth = "auto";
    const t2 = [...e2.children].filter((e3) => ![...e3.classList].includes("crsl__mirror")), r2 = getComputedStyle(t2[E.currentPage - 1], null).getPropertyValue("width");
    E.transitionDuration = w2.speed, n(() => {
      E.currentWidth = r2, setTimeout(() => {
        E.transitionDuration = 0;
      }, w2.speed);
    });
  }, q = () => E.lastPage !== E.currentPage, j = (e2) => {
    E[H ? "translateX" : "translateY"] = e2;
  }, I = () => E[H ? "translateX" : "translateY"], K = (e2) => {
    if (e2 === 0)
      return 0;
    const t2 = H ? "clientWidth" : "clientHeight";
    return -[].reduce.call(E.slideEls, function(r2, n2, a2) {
      return a2 > e2 - 2 ? r2 : r2 + n2[t2];
    }, 0) + E.translateOffset;
  }, $ = () => {
    const e2 = H ? "clientWidth" : "clientHeight", t2 = y2.value;
    if (!t2)
      return;
    const r2 = t2.firstElementChild.cloneNode(true), n2 = t2.lastElementChild.cloneNode(true);
    r2.setAttribute("class", "crsl__mirror crsl__mirror-first"), n2.setAttribute("class", "crsl__mirror crsl__mirror-last"), t2.insertBefore(n2, t2.firstElementChild), t2.appendChild(r2), E.translateOffset = -n2[e2];
  }, F = (e2, t2) => {
    const r2 = y2.value;
    if (!r2 || e2.some((e3) => e3.target === r2))
      return;
    const a2 = r2.querySelectorAll(".crsl__mirror");
    if (a2 && a2.length) {
      for (let e3 = 0, t3 = a2.length >>> 0; e3 < t3; e3++)
        n(() => a2[e3].remove());
      n(() => $());
    }
  };
  return (e2, t2) => (o(), s("div", { class: l(["crsl__wrapper", [_2.direction, { dragging: u(E).dragging }]]), onTouchstart: S, onMousedown: S, onWheel: x }, [d("div", { class: "crsl__wr", ref: (e3, t3) => {
    t3.rf = e3, y2.value = e3;
  }, style: c({ transform: "translate3d(" + u(E).translateX + "px," + u(E).translateY + "px, 0)", "transition-duration": u(E).transitionDuration + "ms", "max-height": u(E).currentHeight, "max-width": u(E).currentWidth }), onTransitionend: z }, [g(e2.$slots, "default", {}, void 0, true)], 36), m(d("div", f, [(o(true), s(p, null, h(u(E).slideEls, (e3, t3) => (o(), s("span", { class: l(["crsl__pagination-bullet", { active: t3 + 1 === u(E).currentPage }]), style: c({ background: t3 + 1 === u(E).currentPage ? _2.indicatorTintColor : _2.indicatorColor }), key: t3, onClick: (e4) => _2.paginationClickable && B(t3 + 1) }, null, 14, P))), 128))], 512), [[v, _2.paginationVisible]])], 34));
} }), [["__scopeId", "data-v-48884066"]]);
const w = [b], y = function(e2) {
  w.forEach((t2) => {
    e2.component(t2.name, t2);
  });
};
typeof window != "undefined" && window.Vue && y(window.Vue);
export { b as CarouselView, y as default };
