<template>
    <div class="crsl__wrapper"
        :class="[direction, { 'dragging': dragging }]"
        @touchstart="_onTouchStart"
        @mousedown="_onTouchStart"
        @wheel="_onWheel">
        <div class="crsl__wr"
            :ref="ref"
            :style="{
              'transform': 'translate3d(' + translateX + 'px,' + translateY + 'px, 0)',
              'transition-duration': transitionDuration + 'ms',
              'max-height': currentHeight,
              'max-width': currentWidth
            }"
            @transitionend="_onTransitionEnd">
          <slot></slot>
        </div>
        <div class="crsl__pagination"
            v-show="paginationVisible">
            <span class="crsl__pagination-bullet"
                  :class="{'active': slideIndex + 1 === currentPage}"
                  :style="{ background: slideIndex + 1 === currentPage ? indicatorTintColor : indicatorColor }"
                  v-for="(slide, slideIndex) in slideEls"
                  :key="slideIndex"
                  @click="paginationClickable && setPage(slideIndex+1)"></span>
        </div>
    </div>
</template>

<script>

const VERTICAL = 'vertical'
const HORIZONTAL = 'horizontal'

export default {
  name: 'carouselView',
  props: {
    direction: {
      type: String,
      default: HORIZONTAL,
      validator: (value) => [VERTICAL, HORIZONTAL].indexOf(value) > -1
    },
    mousewheelControl: {
      type: Boolean,
      default: true
    },
    performanceMode: {
      type: Boolean,
      default: false
    },
    paginationVisible: {
      type: Boolean,
      default: true
    },
    paginationClickable: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: true
    },
    speed: {
      type: Number,
      default: 300
    },
    autoHeight: {
      type: Boolean,
      default: true
    },
    autoWidth: {
      type: Boolean,
      default: true
    },
    indicatorColor: {
      type: String,
      default: () => 'rgba(153, 153, 153, 0.5)'
    },
    indicatorTintColor: {
      type: String,
      default: () => '#007aff'
    }
  },
  data () {
    return {
      ref: void 0,
      currentPage: 1,
      lastPage: 1,
      translateX: 0,
      translateY: 0,
      startTranslate: 0,
      delta: 0,
      dragging: false,
      startPos: null,
      transitioning: false,
      slideEls: [],
      translateOffset: 0,
      transitionDuration: 0,
      currentHeight: 'unset',
      currentWidth: 'unset'
    }
  },
  created() {
    this.ref = this._uniq()
  },
  mounted () {
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)
    this.slideEls = [].map.call(this.$refs[this.ref].children, el => el)
    if (this.loop) {
      this.$nextTick(function () {
        this._createLoop()
        this.setPage(this.currentPage, true)
      })
      this._initObserver()
    } else {
      this.setPage(this.currentPage)
    }
  },
  beforeDestroy () {
    this._unObserver()
  },
  methods: {
    _uniq (n = 7) {
      return (Math.random() * 0xFFFFFF << n).toString(16)
    },
    _initObserver () {
      const el = document.querySelector('.crsl__wr')
      if (!el) {
        return
      }
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver
      this.observer = new MutationObserver(this._updateLoop)
      this.observer.observe(el, {
        subtree: true,
        childList: true,
        attributes: true
      })
    },
    _unObserver () {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
      this._removeListeners()
    },
    _removeListeners () {
      document.removeEventListener('touchmove', this._onTouchMove)
      document.removeEventListener('touchend', this._onTouchEnd)
      document.removeEventListener('mousemove', this._onTouchMove)
      document.removeEventListener('mouseup', this._onTouchEnd)
    },
    next () {
      const page = this.currentPage
      if (page < this.slideEls.length || this.loop) {
        this.setPage(page + 1)
      } else {
        this._revert()
      }
    },
    prev () {
      const page = this.currentPage
      if (page > 1 || this.loop) {
        this.setPage(page - 1)
      } else {
        this._revert()
      }
    },
    setPage (page, noAnimation) {
      const self = this
      this.lastPage = this.currentPage
      if (page === 0) {
        this.currentPage = this.slideEls.length
      } else if (page === this.slideEls.length + 1) {
        this.currentPage = 1
      } else {
        this.currentPage = page
      }
      if (this.loop) {
        if (this.delta === 0) {
          this._setTranslate(self._getTranslateOfPage(this.lastPage))
        }
        setTimeout(function () {
          self._setTranslate(self._getTranslateOfPage(page))
          if (!noAnimation) self._onTransitionStart()
        }, 0)
      } else {
        this._setTranslate(this._getTranslateOfPage(page))
        if (!noAnimation) this._onTransitionStart()
      }
    },
    isHorizontal () {
      return this.direction === HORIZONTAL
    },
    isVertical () {
      return this.direction === VERTICAL
    },
    _onTouchStart (e) {
      this.startPos = this._getTouchPos(e)
      this.delta = 0
      this.startTranslate = this._getTranslateOfPage(this.currentPage)
      this.startTime = new Date().getTime()
      this.dragging = true
      this.transitionDuration = 0

      document.addEventListener('touchmove', this._onTouchMove, { passive: false })
      document.addEventListener('touchend', this._onTouchEnd, { passive: false })
      document.addEventListener('mousemove', this._onTouchMove, { passive: false })
      document.addEventListener('mouseup', this._onTouchEnd, { passive: false })
    },
    _onTouchMove (e) {
      this.delta = this._getTouchPos(e) - this.startPos

      if (!this.performanceMode) {
        this._setTranslate(this.startTranslate + this.delta)
        this.$emit('slider-move', this._getTranslate())
      }

      if (this.isVertical() || (this.isHorizontal() && Math.abs(this.delta) > 0)) {
        e.preventDefault()
      }
    },
    _onTouchEnd (e) {
      this.dragging = false
      this.transitionDuration = this.speed
      const isQuickAction = new Date().getTime() - this.startTime < 1000
      if (this.delta < -100 || (isQuickAction && this.delta < -15)) {
        this.next()
      } else if (this.delta > 100 || (isQuickAction && this.delta > 15)) {
        this.prev()
      } else {
        this._revert()
      }
      this._removeListeners()
    },
    _onWheel (e) {
      if (this.mousewheelControl) {
        // TODO Support apple magic mouse and trackpad.
        if (!this.transitioning) {
          if (e.deltaY > 0) {
            this.next()
          } else {
            this.prev()
          }
        }
        if (this._isPageChanged()) e.preventDefault()
      }
    },
    _revert () {
      this.setPage(this.currentPage)
    },
    _getTouchPos (e) {
      const key = this.isHorizontal() ? 'pageX' : 'pageY'
      return e.changedTouches ? e.changedTouches[0][key] : e[key]
    },
    _onTransitionStart () {
      this.transitioning = true
      this.transitionDuration = this.speed
      if (this._isPageChanged()) {
        this.$emit('slide-change-start', this.currentPage)
      } else {
        this.$emit('slide-revert-start', this.currentPage)
      }
    },
    _onTransitionEnd () {
      this.transitioning = false
      this.transitionDuration = 0
      this.delta = 0
      if (this._isPageChanged()) {
        this.$emit('slide-change-end', this.currentPage)
      } else {
        this.$emit('slide-revert-end', this.currentPage)
      }
      if (this.autoHeight && this.isHorizontal()) {
        this._toggleHeight()
      }
      if (this.autoWidth && this.isVertical()) {
        this._toggleWidth()
      }
    },
    _toggleHeight () {
      const carouselWrapEl = this.$refs[this.ref]
      if (!carouselWrapEl || !carouselWrapEl.children) {
        return
      }
      this.currentHeight = 'auto'
      const els = [...carouselWrapEl.children].filter(i => ![...i.classList].includes('crsl__mirror'))
      const h = getComputedStyle(els[this.currentPage - 1], null).getPropertyValue('height')
      this.transitionDuration = this.speed
      this.$nextTick(() => {
        this.currentHeight = h
        setTimeout(() => {
          this.transitionDuration = 0
        }, this.speed)
      })
    },
    _toggleWidth () {
      const carouselWrapEl = this.$refs[this.ref]
      if (!carouselWrapEl || !carouselWrapEl.children) {
        return
      }
      this.currentWidth = 'auto'
      const els = [...carouselWrapEl.children].filter(i => ![...i.classList].includes('crsl__mirror'))
      const w = getComputedStyle(els[this.currentPage - 1], null).getPropertyValue('width')
      this.transitionDuration = this.speed
      this.$nextTick(() => {
        this.currentWidth = w
        setTimeout(() => {
          this.transitionDuration = 0
        }, this.speed)
      })
    },
    _isPageChanged () {
      return this.lastPage !== this.currentPage
    },
    _setTranslate (value) {
      const translateName = this.isHorizontal() ? 'translateX' : 'translateY'
      this[translateName] = value
    },
    _getTranslate () {
      const translateName = this.isHorizontal() ? 'translateX' : 'translateY'
      return this[translateName]
    },
    _getTranslateOfPage (page) {
      if (page === 0) return 0
      const propName = this.isHorizontal() ? 'clientWidth' : 'clientHeight'
      return -[].reduce.call(this.slideEls, function (total, el, i) {
        return i > page - 2 ? total : total + el[propName]
      }, 0) + this.translateOffset
    },
    _createLoop () {
      const propName = this.isHorizontal() ? 'clientWidth' : 'clientHeight'
      const carouselWrapEl = this.$refs[this.ref]
      if (!carouselWrapEl) {
        return
      }
      const duplicateFirstChild = carouselWrapEl.firstElementChild.cloneNode(true)
      const duplicateLastChild = carouselWrapEl.lastElementChild.cloneNode(true)
      duplicateFirstChild.setAttribute('class', 'crsl__mirror crsl__mirror-first')
      duplicateLastChild.setAttribute('class', 'crsl__mirror crsl__mirror-last')
      carouselWrapEl.insertBefore(duplicateLastChild, carouselWrapEl.firstElementChild)
      carouselWrapEl.appendChild(duplicateFirstChild)
      this.translateOffset = -duplicateLastChild[propName]
    },
    _updateLoop (mutations, observer) {
      const carouselWrapEl = this.$refs[this.ref]
      if (!carouselWrapEl || mutations.some(i => i.target === carouselWrapEl)) {
        return
      }
      const ms = carouselWrapEl.querySelectorAll('.crsl__mirror')
      if (ms && ms.length) {
        for (let i = 0, l = ms.length >>> 0; i < l; i++) {
          this.$nextTick(() => ms[i].remove())
        }
        this.$nextTick(() => this._createLoop())
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.crsl__wrapper {
  position: relative;
  overflow: hidden;
  padding-bottom: 1.59em;
  .crsl__wr {
    display: flex;
    width: 100%;
    height: 100%;
    transition: all 0ms ease-in-out;
    > div {
      overflow: hidden;
      flex-shrink: 0;
      width: 100%;
      height: 100%;
    }
  }

  &.horizontal .crsl__wr {
    flex-direction: row;
  }

  &.vertical .crsl__wr {
    flex-direction: column;
  }

  .crsl__pagination {
    position: absolute;
    line-height: 1.59em;
    .crsl__pagination-bullet {
      width: .43em;
      height: .43em;
      border-radius: 50%;
      background: rgba(153, 153, 153, 0.5);
      opacity: 1;
      transition: all .5s ease;
    }

    .crsl__pagination-bullet.active {
      background: #007aff;
      opacity: 1;
    }
  }

  &.vertical .crsl__pagination {
    right: .72em;
    top: 50%;
    transform: translate3d(0, -50%, 0);

    .crsl__pagination-bullet {
      display: block;
      margin: .43em 0;
    }
  }

  &.horizontal .crsl__pagination {
    bottom: 0;
    width: 100%;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
    text-align: center;

    .crsl__pagination-bullet {
      display: inline-block;
      margin: 0 .22em;
    }
  }
}
</style>
