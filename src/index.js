import CarouselView from './lib'

const components = [CarouselView]

const install = function (Vue) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default install
export { CarouselView } // if need to install as component
