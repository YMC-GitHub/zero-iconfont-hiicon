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


## make font files (npm)
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

## zero fonts

- [x] use font on zero project in iconfont.cn

```css
/* use font on zero project in iconfont.cn */

@font-face {
  font-family: 'iconfont';
  src: 
       url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAASUAAsAAAAACUAAAARHAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDDAqGBIUFATYCJAMQCwoABCAFhGcHPxv0B8gOJR2RwKCAoYBhPHyuke8n2T1GxehaHk+oCXxZAhlbIWtsNZKwB/P/nv4tBjiT0sFIMqFBoZPewe3oR/oP/ib+uFc1c9rP+QPwzDE1+MFiEyhAe9tuReq9ClMX9YJO0Md7BJqtSMI9mlWAAdObTVABHPG5rUFRHTfFTBPQV0zKADc0auupW4t4AyrSU+5twOvk9+O/sNAnqTL3lGOXM0lw/j14z+U9/q8B8gdRi4DTEypkLFzMEueGXSfwstQCnuYuF98UBYqwZdH/PX6BSHTtf3mEJBM1V9WKxI105hcIQPALJH6ZZMSX2Y1owTaxBcTRuiSr+0P5/LazYRyTLk4XvdR26bj1ojW5qNmxzS6QoU4ELtMS49tBerzd0DCePAyRZ/cBSO3k8J7s7OI8MDKS70Lk+Q5A+QgzDRbAXHDiPWKV1rFi2Spb26eE7dKt1tjdPGLp0gqCWS8uUq4X8DZbWz8+doUNvlzjgC0ut7F5gtss2WJXcScXX7IE8o5MRNstWyZRbhXHt9nZPavAn7WSWKGxd8Z3BxExp2MisMNRRNzNpDhsL1rhulLr5EbsE+Dx5/KjK45F4pE3EmMr9gRjLs3jjx9rnjyZePZM+/Rp1fbj4yfP7tXuO3dq4sSZPZrdfnFza7taI+Avr18wsrNlp1vG5tvL68pblTpAvmqlq4m7SYOJhSl23jvDB/fJ8D6PN+SOkUJoGJb/LisKMe/3cm/MW5g2AvTRRsHGkxvRgJ/Ug32H+LlJxanFYbwVj+W60vIMi/aMjdWI/1Xzesf/G5BKM+98ZMN/R4uGq/Y1yDwmsojLdMG4sZnDuclFcyjDmRwXPA4R4Qs19KMWzmPVx8QS8/qn9tVumzLbLWIzXHE4Dlt/MjYiprs8O/Aq4xWk+bjPSvb2C9fNclRBjNeVwK6MLDY8RtbHUXHWUb68JewbGlSe1R25OqoqIqJa6vNjs7Q642Pc08XiYZiHCVaEJ1jPBwG4C2DvaT7CCwCA/D5pgL0p3uvc/w9Nc//iiv8NHQlf9VseY9vXmu2TFNib4oNp5TRKTBb9MepLE1GLFaaULlkg+Qtdb9VKIqHZi7IHXF+351toeriS0KingKTBiD5DzRhiC3EOKi3WoNZoHzSbl7m7RQ8VnihNmDIAEDrtgKTdO8g6XcMW4jOo9PsAtU5/odmZMDmuxVQI01mqCVIk0tyBiIVKBe1rYTJoGcW0yJrYtjhBsWoxRpFQNKSezaYUFLvGCnUrEwYhjdCsUo5kSbdRMpkSUbFKCSWEqAhCVZxAQHd9CypUykE6FqUJRCEhmnVAiAkpKdAROqz+vTIURguZJuxELOFgqVlIgyNCoUImYLNViklNL3KKWitGGAiiIWgsZOQQWYqDIjNTSghV9yQJihCEEi1IqMQReGj0VBV6vEZ+e/ugmbu0RIocJSrlqlJO8f2xihY9NQWhWMEAAAA=') format('woff2'),
       url('//at.alicdn.com/t/c/font_4297845_ghb4bshau4n.woff?t=1698035724441') format('woff'),
       url('//at.alicdn.com/t/c/font_4297845_ghb4bshau4n.ttf?t=1698035724441') format('truetype'),
       url('//at.alicdn.com/t/c/font_4297845_ghb4bshau4n.svg?t=1698035724441#iconfont') format('svg');
}
```

- [x] use font on zero project in github (for china)

```css
/* use font on zero project in github  */
/* https://ghproxy.com/https://raw.githubusercontent.com/YMC-GitHub/zero-iconfont-hiicon/main/dist/ */
@font-face {
  font-family: 'iconfont';
  src: 
       url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAASUAAsAAAAACUAAAARHAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDDAqGBIUFATYCJAMQCwoABCAFhGcHPxv0B8gOJR2RwKCAoYBhPHyuke8n2T1GxehaHk+oCXxZAhlbIWtsNZKwB/P/nv4tBjiT0sFIMqFBoZPewe3oR/oP/ib+uFc1c9rP+QPwzDE1+MFiEyhAe9tuReq9ClMX9YJO0Md7BJqtSMI9mlWAAdObTVABHPG5rUFRHTfFTBPQV0zKADc0auupW4t4AyrSU+5twOvk9+O/sNAnqTL3lGOXM0lw/j14z+U9/q8B8gdRi4DTEypkLFzMEueGXSfwstQCnuYuF98UBYqwZdH/PX6BSHTtf3mEJBM1V9WKxI105hcIQPALJH6ZZMSX2Y1owTaxBcTRuiSr+0P5/LazYRyTLk4XvdR26bj1ojW5qNmxzS6QoU4ELtMS49tBerzd0DCePAyRZ/cBSO3k8J7s7OI8MDKS70Lk+Q5A+QgzDRbAXHDiPWKV1rFi2Spb26eE7dKt1tjdPGLp0gqCWS8uUq4X8DZbWz8+doUNvlzjgC0ut7F5gtss2WJXcScXX7IE8o5MRNstWyZRbhXHt9nZPavAn7WSWKGxd8Z3BxExp2MisMNRRNzNpDhsL1rhulLr5EbsE+Dx5/KjK45F4pE3EmMr9gRjLs3jjx9rnjyZePZM+/Rp1fbj4yfP7tXuO3dq4sSZPZrdfnFza7taI+Avr18wsrNlp1vG5tvL68pblTpAvmqlq4m7SYOJhSl23jvDB/fJ8D6PN+SOkUJoGJb/LisKMe/3cm/MW5g2AvTRRsHGkxvRgJ/Ug32H+LlJxanFYbwVj+W60vIMi/aMjdWI/1Xzesf/G5BKM+98ZMN/R4uGq/Y1yDwmsojLdMG4sZnDuclFcyjDmRwXPA4R4Qs19KMWzmPVx8QS8/qn9tVumzLbLWIzXHE4Dlt/MjYiprs8O/Aq4xWk+bjPSvb2C9fNclRBjNeVwK6MLDY8RtbHUXHWUb68JewbGlSe1R25OqoqIqJa6vNjs7Q642Pc08XiYZiHCVaEJ1jPBwG4C2DvaT7CCwCA/D5pgL0p3uvc/w9Nc//iiv8NHQlf9VseY9vXmu2TFNib4oNp5TRKTBb9MepLE1GLFaaULlkg+Qtdb9VKIqHZi7IHXF+351toeriS0KingKTBiD5DzRhiC3EOKi3WoNZoHzSbl7m7RQ8VnihNmDIAEDrtgKTdO8g6XcMW4jOo9PsAtU5/odmZMDmuxVQI01mqCVIk0tyBiIVKBe1rYTJoGcW0yJrYtjhBsWoxRpFQNKSezaYUFLvGCnUrEwYhjdCsUo5kSbdRMpkSUbFKCSWEqAhCVZxAQHd9CypUykE6FqUJRCEhmnVAiAkpKdAROqz+vTIURguZJuxELOFgqVlIgyNCoUImYLNViklNL3KKWitGGAiiIWgsZOQQWYqDIjNTSghV9yQJihCEEi1IqMQReGj0VBV6vEZ+e/ugmbu0RIocJSrlqlJO8f2xihY9NQWhWMEAAAA=') format('woff2'),
       url('https://ghproxy.com/https://raw.githubusercontent.com/YMC-GitHub/zero-iconfont-hiicon/main/dist/iconfont.woff?t=1698035724441') format('woff'),
       url('https://ghproxy.com/https://raw.githubusercontent.com/YMC-GitHub/zero-iconfont-hiicon/main/dist/iconfont.ttf?t=1698035724441') format('truetype'),
       url('https://ghproxy.com/https://raw.githubusercontent.com/YMC-GitHub/zero-iconfont-hiicon/main/dist/iconfont.svg?t=1698035724441#iconfont') format('svg');
}
```

##  usse fonts (cdn)
- [jsdiliver](https://www.jsdelivr.com/) -  include all resources of NPM, github and wordpress.

- [x] jsdiliver for github resources
```css
/* register font-family */
@font-face {
  font-family: "iconfont";
  src: url('//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.eot?t=1698068730733'); /* IE9*/
  src: url('//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.eot?t=1698068730733#iefix') format('embedded-opentype'), /* IE6-IE8 */
  url("//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.woff2?t=1698068730733") format("woff2"),
  url("//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.woff?t=1698068730733") format("woff"),
  url('//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.ttf?t=1698068730733') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
  url('//cdn.jsdelivr.net/gh/ymc-github/zero-iconfont-hiicon@main/dist/iconfont.svg?t=1698068730733#iconfont') format('svg'); /* iOS 4.1- */
}
```

```bash
# info css cdn for jsdiliver
tsx ./src/cli.ts css-cdn
```