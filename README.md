# CarouselView

a responsive & lightweight carousel component for vue

> [vue 3.x supports](https://github.com/litt1e-p/carouselView/tree/next)

#### Installation

```js
npm i carousel-view
```

#### Usage

1. Global registration

You may install Vue CarouselView globally:

```js
// in main.js
import CarouselView from 'carousel-view'
import 'carousel-view/dist/style/carousel-view.css'

Vue.use(CarouselView)
```

2. Local component

Include the carousel directly into your component using import:

```js
// in your vue file
import { CarouselView } from 'carousel-view'
import 'carousel-view/dist/style/carousel-view.css'

export default {
  components: {
    CarouselView
  }
  ...
}
```

#### HTML Structure

```html
<carousel-view>
    ...your dom
</carousel-view>
```

#### Configuration

| Property | Type | Default | Description |
| ---------- |:----------:| ----------:| ----------:|
| direction  | enum(horizontal/vertical) | 'horizontal' | direction for carousel |
| loop | Boolean | true | Flag to make the carousel loop around when it reaches the end |
| autoHeight | Boolean | true | Adjust the height of the carousel for the current slide. |
| autoWidth | Boolean | false | Adjust the width of the carousel for the current slide. |
| mousewheelControl | Boolean | true | enable mousewheel control |
| paginationVisible | Boolean | true | visibility of pagination |
| paginationClickable | Boolean | true | carousel control via pagination click |
| speed | Number | 300 | animation speed |
| indicatorColor | String | rgba(153, 153, 153, 0.5) | color of indicator |
| indicatorTintColor | String | #007aff | tint color of indicator |
...

<!-- #### Screenshots -->

<!-- ![](./screenshots/img@2x.png) -->