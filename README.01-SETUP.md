## make *.svg files

- [ ] make your logo and other images to *.svg files (from *.png,*.jpg files )
```powershell
# eg.
# $des="M:\zero-iconfont-hiicon\src\assets";$null=mkdir -p "$des" -ErrorAction SilentlyContinue ;
$src="M:\iconfont\hiicon\01\home.png";$des="M:\zero-iconfont-hiicon\src\assets\home.svg";magick convert  $src  $des;
```

- [ ] resize svg files
```bash
# magick convert -resize 1024x1024 ./svg/2.svg icons/home.svg
# magick convert -resize 50x50 ./svg/2.svg icons/home.svg
# $src="M:\iconfont\hiicon\01\home.png";$des="M:\zero-iconfont-hiicon\src\assets\home.svg";magick convert  $src  $des;
```

- [x] prepare icons to make fonts (copy)
```bash
cp ./svg/2.svg icons/home.svg
cp ./svg/1.svg icons/lock.svg
cp ./svg/2.svg icons/setting.svg
```

- [ ] merge some *.svg files to one svg file (svg sprite?)

- the main content of this file iconfont.svg
```svg
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
<svg xmlns="http://www.w3.org/2000/svg">
  <metadata>Created by iconfont</metadata>
  <defs>
  <font id="iconfont" horiz-adv-x="1024">
    <!-- CUSTOM YOUR FONT FAMILY HERE -->
    <font-face
      font-family="iconfont"
      font-weight="400"
      font-stretch="normal"
      units-per-em="1024"
      ascent="896"
      descent="-128"
    />
      <missing-glyph />
      <!-- CUSTOM glyph-name,unicode, -->
      <!-- HERE ARE THREE glyph:home,menu,setting -->
      <glyph glyph-name="home" unicode="&#58880;" d="XXX"  horiz-adv-x="1024" />
      <glyph glyph-name="menu" unicode="&#58881;" d="XXX"  horiz-adv-x="1024" />
      <glyph glyph-name="setting" unicode="&#58882;" d=""  horiz-adv-x="1024" />
    </font>
  </defs>
</svg>

```

- [x] *.svg files compression with svgo

```powershell
pnpm add -g svgo;

svgo src/assets/home.svg -o src/assets/home.min.svg
svgo src/assets/home.svg -o src/assets/icon/home.svg
# svgo home.svg -o home.min.svg
# svgo -f src/iconfont -o asset/iconfont
```


## make font files
- [x] select/design/upload icon in iconfont.cn or  icon8s.com

- [x] *.svg files to \*.css,\*.json,\*.ttf,\*.woff,\*.wof2 fonts (svgtofont)
```powershell
pnpm add -g svgtofont;
svgtofont --sources ./svg --output ./font --fontName uiw-font
# https://www.npmjs.com/package/svgtofont
```

## use fonts files
- [x] use font files in the .css file 
```css
/* import font files */
@font-face {
  font-family: 'iconfont';
  src: 
       url('data:application/x-font-woff2;xxxxxx') format('woff2'),
       url('iconfont.woff?t=1698035743461') format('woff'),
       url('iconfont.ttf?t=1698035743461') format('truetype'),
       url('iconfont.svg?t=1698035743461#iconfont') format('svg');
}
```

```css
/* define commom icon class */
.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [x] use local .css file
```html
<!-- import *.css file -->
<link rel="stylesheet" href="dist/iconfont.css">
```

- [x] use remote .css file
```html
<!-- import *.css file -->
<!-- eg. your cdn, or other -->
<link rel="stylesheet" href="dist/iconfont.css">
```

- [x] use icon with font unicode
```html
<i class="iconfont">&#xe664;</i>
```

- [x] use icon with font class
```html
<i class="iconfont icon-home"></i>
```


- [x] use with font symbol
```html
<!-- import js file -->
<script src="./iconfont.js"></script>
```

```css
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
```

```html
<svg class="icon" aria-hidden="true">
  <use xlink:href="#icon-xxx"></use>
</svg>
```

- [x] use one way from above to make some template engine component (vue.js)
```html
<!-- for vue.js template engine -->
<!-- define svg-icon component -->
<template>
  <svg class="svg-icon" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
  export default {
    name: 'SvgIcon',
    props: {
      iconClass: {
        type: String,
        required: true
      }
    },
    computed: {
      iconName() {
        return `#icon-${this.iconClass}`
      }
    }
  }
</script>

<style>
  .svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
```

```ts
//  register svg-icon componnet in your vuejs app
import IconSvg from '@/components/SvgIcon'
// import SvgIcon from '../components/SvgIcon'

// register svg-icon componnet in app level
Vue.component('svg-icon', SvgIcon)

// import all *.svg files in src/icons/svg dir
const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
```

```html
<!-- use svg-icon component -->
<svg-icon icon-class="home" />
```


## ## make font files (npm)
- [x] install code

- [x] install deps
```bash
pnpm install

# read more:
# pnpm add -P svgo svgtofont
# pnpm add @types/svgtofont
# pnpm add -g tsx
# pnpm add -g terser
```

- [x] build code to *.js files (dev)
```bash
pnpm run dev;
# then coding:
# ...

# read more:
pnpm run build;node lib/index.js;
# tsx src/index.ts
```

- [x] build code to *.js files (pro)
```bash
pnpm run build;
```

- [x] run *.js files (pro)
```bash
node lib/index.js
# node bin/index.js
```

- [x] mini *.js file
```bash
# pnpm add -g terser;
terser ./lib/index.js --compress --mangle --output ./lib/index.min.js
```

- [x] get file size
```bash
#  pnpm add brotli ; pnpm add -D @types/brotli
# tsx src/cli.ts file-size
```