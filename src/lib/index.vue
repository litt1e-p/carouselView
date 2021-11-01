<template>
    <div class="crsl__wrapper"
        :class="[direction, { 'dragging': state.dragging }]"
        @touchstart="_onTouchStart"
        @mousedown="_onTouchStart"
        @wheel="_onWheel">
        <div class="crsl__wr"
            ref="rf"
            :style="{
              'transform': 'translate3d(' + state.translateX + 'px,' + state.translateY + 'px, 0)',
              'transition-duration': state.transitionDuration + 'ms',
              'max-height': state.currentHeight,
              'max-width': state.currentWidth
            }"
            @transitionend="_onTransitionEnd">
          <slot></slot>
        </div>
        <div class="crsl__pagination"
            v-show="paginationVisible">
            <span class="crsl__pagination-bullet"
                  v-for="(slide, slideIndex) in state.slideEls"
                  :class="{'active': slideIndex + 1 === state.currentPage}"
                  :style="{ background: slideIndex + 1 === state.currentPage ? indicatorTintColor : indicatorColor }"
                  :key="slideIndex"
                  @click="paginationClickable && setPage(slideIndex+1)"></span>
        </div>
    </div>
</template>

<script>

export default {
  name: 'CarouselView'
}

</script>

<script setup>

import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'

const VERTICAL = 'vertical'
const HORIZONTAL = 'horizontal'

const props = defineProps({
  direction: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['vertical', 'horizontal'].indexOf(value) > -1
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
})

const emit = defineEmits(['slider-move', 'slide-change-start', 'slide-revert-start', 'slide-change-end', 'slide-revert-end'])

const rf = ref(null)

const state = reactive({
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
  currentWidth: 'unset',
  startTime: 0,
  observer: void 0
})

onMounted(() => {
  state.slideEls = [].map.call(rf.value.children, el => el)
  if (props.loop) {
    nextTick(function () {
      _createLoop()
      setPage(state.currentPage, true)
    })
    _initObserver()
  } else {
    setPage(state.currentPage)
  }
})

onBeforeUnmount(() => {
  _unObserver()
})

const _uniq = (n = 7) => {
  return (Math.random() * 0xFFFFFF << n).toString(16)
}

const _initObserver = () => {
  const el = document.querySelector('.crsl__wr')
  if (!el) {
    return
  }
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver
  state.observer = new MutationObserver(_updateLoop)
  state.observer.observe(el, {
    subtree: true,
    childList: true,
    attributes: true
  })
}

const _unObserver = () => {
  if (state.observer) {
    state.observer.disconnect()
    state.observer = null
  }
  _removeListeners()
}

const _removeListeners = () => {
  document.removeEventListener('touchmove', _onTouchMove)
  document.removeEventListener('touchend', _onTouchEnd)
  document.removeEventListener('mousemove', _onTouchMove)
  document.removeEventListener('mouseup', _onTouchEnd)
}

const next = () => {
  const page = state.currentPage
  if (page < state.slideEls.length || props.loop) {
    setPage(page + 1)
  } else {
    _revert()
  }
}

const prev = () => {
  const page = state.currentPage
  if (page > 1 || props.loop) {
    setPage(page - 1)
  } else {
    _revert()
  }
}

const setPage = (page, noAnimation) => {
  state.lastPage = state.currentPage
  if (page === 0) {
    state.currentPage = state.slideEls.length
  } else if (page === state.slideEls.length + 1) {
    state.currentPage = 1
  } else {
    state.currentPage = page
  }
  if (props.loop) {
    if (state.delta === 0) {
      _setTranslate(_getTranslateOfPage(state.lastPage))
    }
    setTimeout(function () {
      _setTranslate(_getTranslateOfPage(page))
      if (!noAnimation) _onTransitionStart()
    }, 0)
  } else {
    _setTranslate(_getTranslateOfPage(page))
    if (!noAnimation) _onTransitionStart()
  }
}

const isHorizontal = computed(() => {
  return props.direction === HORIZONTAL
})

const isVertical = computed(() => {
  return props.direction === VERTICAL
})

const _onTouchStart = (e) => {
  state.startPos = _getTouchPos(e)
  state.delta = 0
  state.startTranslate = _getTranslateOfPage(state.currentPage)
  state.startTime = new Date().getTime()
  state.dragging = true
  state.transitionDuration = 0

  document.addEventListener('touchmove', _onTouchMove, { passive: false })
  document.addEventListener('touchend', _onTouchEnd, { passive: false })
  document.addEventListener('mousemove', _onTouchMove, { passive: false })
  document.addEventListener('mouseup', _onTouchEnd, { passive: false })
}

const _onTouchMove = (e) => {
  state.delta = _getTouchPos(e) - state.startPos
  if (!props.performanceMode) {
    _setTranslate(state.startTranslate + state.delta)
    emit('slider-move', _getTranslate())
  }
  if (isVertical || (isHorizontal && Math.abs(state.delta) > 0)) {
    e.preventDefault()
  }
}

const _onTouchEnd = (e) => {
  state.dragging = false
  state.transitionDuration = props.speed
  const isQuickAction = new Date().getTime() - state.startTime < 1000
  if (state.delta < -100 || (isQuickAction && state.delta < -15)) {
    next()
  } else if (state.delta > 100 || (isQuickAction && state.delta > 15)) {
    prev()
  } else {
    _revert()
  }
  _removeListeners()
}

const _onWheel = (e) => {
  if (props.mousewheelControl) {
    if (!state.transitioning) {
      if (e.deltaY > 0) {
        next()
      } else {
        prev()
      }
    }
    if (_isPageChanged()) e.preventDefault()
  }
}

const _revert = () => {
  setPage(state.currentPage)
}

const _getTouchPos = (e) => {
  const key = isHorizontal ? 'pageX' : 'pageY'
  return e.changedTouches ? e.changedTouches[0][key] : e[key]
}

const _onTransitionStart = () => {
  state.transitioning = true
  state.transitionDuration = props.speed
  if (_isPageChanged()) {
    emit('slide-change-start', state.currentPage)
  } else {
    emit('slide-revert-start', state.currentPage)
  }
}

const _onTransitionEnd = () => {
  state.transitioning = false
  state.transitionDuration = 0
  state.delta = 0
  if (_isPageChanged()) {
    emit('slide-change-end', state.currentPage)
  } else {
    emit('slide-revert-end', state.currentPage)
  }
  if (props.autoHeight && isHorizontal) {
    _toggleHeight()
  }
  if (props.autoWidth && isVertical) {
    _toggleWidth()
  }
}

const _toggleHeight = () => {
  const carouselWrapEl = rf.value
  if (!carouselWrapEl || !carouselWrapEl.children) {
    return
  }
  state.currentHeight = 'auto'
  const els = [...carouselWrapEl.children].filter(i => ![...i.classList].includes('crsl__mirror'))
  const h = getComputedStyle(els[state.currentPage - 1], null).getPropertyValue('height')
  state.transitionDuration = props.speed
  nextTick(() => {
    state.currentHeight = h
    setTimeout(() => {
      state.transitionDuration = 0
    }, props.speed)
  })
}

const _toggleWidth = () => {
  const carouselWrapEl = rf.value
  if (!carouselWrapEl || !carouselWrapEl.children) {
    return
  }
  state.currentWidth = 'auto'
  const els = [...carouselWrapEl.children].filter(i => ![...i.classList].includes('crsl__mirror'))
  const w = getComputedStyle(els[state.currentPage - 1], null).getPropertyValue('width')
  state.transitionDuration = props.speed
  nextTick(() => {
    state.currentWidth = w
    setTimeout(() => {
      state.transitionDuration = 0
    }, props.speed)
  })
}

const _isPageChanged = () => {
  return state.lastPage !== state.currentPage
}

const _setTranslate = (value) => {
  const translateName = isHorizontal ? 'translateX' : 'translateY'
  state[translateName] = value
}

const _getTranslate = () => {
  const translateName = isHorizontal ? 'translateX' : 'translateY'
  return state[translateName]
}

const _getTranslateOfPage = (page) => {
  if (page === 0) return 0
  const propName = isHorizontal ? 'clientWidth' : 'clientHeight'
  return -[].reduce.call(state.slideEls, function (total, el, i) {
    return i > page - 2 ? total : total + el[propName]
  }, 0) + state.translateOffset
}

const _createLoop = () => {
  const propName = isHorizontal ? 'clientWidth' : 'clientHeight'
  const carouselWrapEl = rf.value
  if (!carouselWrapEl) {
    return
  }
  const duplicateFirstChild = carouselWrapEl.firstElementChild.cloneNode(true)
  const duplicateLastChild = carouselWrapEl.lastElementChild.cloneNode(true)
  duplicateFirstChild.setAttribute('class', 'crsl__mirror crsl__mirror-first')
  duplicateLastChild.setAttribute('class', 'crsl__mirror crsl__mirror-last')
  carouselWrapEl.insertBefore(duplicateLastChild, carouselWrapEl.firstElementChild)
  carouselWrapEl.appendChild(duplicateFirstChild)
  state.translateOffset = -duplicateLastChild[propName]
}

const _updateLoop = (mutations, observer) => {
  const carouselWrapEl = rf.value
  if (!carouselWrapEl || mutations.some(i => i.target === carouselWrapEl)) {
    return
  }
  const ms = carouselWrapEl.querySelectorAll('.crsl__mirror')
  if (ms && ms.length) {
    for (let i = 0, l = ms.length >>> 0; i < l; i++) {
      nextTick(() => ms[i].remove())
    }
    nextTick(() => _createLoop())
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
    :deep(div) {
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
