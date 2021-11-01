# CarouselView

"a responsive & lightweight carousel component for vue 3.x

> [vue 2.x supports](https://github.com/litt1e-p/carouselView)

#### Installation

```js
npm i carousel-view@next
```

#### Usage

1. Global registration

You may install Vue Carousel globally:

```js
// in main.js
import CarouselView from 'carousel-view'
import 'carousel-view/dist/style/carousel-view.css'

createApp(App).use(Transitions)
```

2. Local component

Include the carousel directly into your component using import:

> or just use \<script setup\>

```js
// in your vue file
import { defineComponent } from 'vue'
import { CarouselView } from 'carousel-view'
import 'carousel-view/dist/style/carousel-view.css'

export default defineComponent({
  components: {
    CarouselView
  }
  ...
})
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