import fs from 'fs';
import pupa from 'pupa';
import defineLazyProp from 'define-lazy-prop';

const defaultOpts = {
  selector: 'share-buttons',
  material: {},
  listTemplate: '<ul class=share-buttons__list></ul>',
  itemTemplate: '<li class=share-buttons__item></li>',
  btnTemplate: `
<a class="share-buttons__btn share-buttons__btn--{name}"
   onclick="{onclick}">
  <svg class="share-buttons__icon share-buttons__icon--{name}"
       version=1.1 xmlns="http://www.w3.org/2000/svg">
    <use xlink:href=#{name} />
  </svg>
</a>
  `,
  css: `
.{list} {
  list-style: none;
  overflow: hidden;
  padding: 0;
}

.{item} {
  float: left;
}

.{btn} {
  display: block;
  width: 1em;
  padding: .3em;
  cursor: pointer;
}

.{icon} {
  display: inline-block;
  width: 1em;
  height: 1em;
}

svg[class*=twitter] {
  fill: #1da1f2;
}

svg[class*=facebook] {
  fill: #3b5998;
}
  `
};
export {defaultOpts};

defineLazyProp(defaultOpts.material, 'twitter', () => {
  return Object.assign(readFile('twitter'), {
    color: '#1da1f2'
  });
});

defineLazyProp(defaultOpts.material, 'facebook', () => {
  return Object.assign(readFile('facebook'), {
    color: '#3b5998'
  });
});

function readFile(name) {
  const svg = fs.readFileSync(`${__dirname}/icons/${name}.svg`, 'utf-8');
  const onclick = fs.readFileSync(
    `${__dirname}/onclicks/${name}.txt`, 'utf-8'
  ).replace(/\s*\n\s*/g, '');
  return {svg, onclick};
}

export default function buttons(opts = {}) {
  opts = Object.assign({}, defaultOpts, opts);
  return ($, cheerio) => {
    const $shareButtons = $(opts.selector);
    const $svgSymbol = cheerio.load(readSvgWrapper());
    const symbolCache = [];

    $shareButtons.each((idx, elem) => {
      const $elem = $(elem);
      const list = $elem.attr('list');
      const items = list.split(',').map(item => item.trim());

      const $list = cheerio.load(opts.listTemplate, {
        decodeEntities: false
      });
      const listClass = $list('ul').attr('class').split(/\s+/)[0];

      items.forEach((name, idx) => {
        const {svg, onclick} = opts.material[name];
        const item = pupa(opts.itemTemplate, {name});
        const btn = pupa(opts.btnTemplate, {name, onclick});
        const $item = $list(item).appendTo($list('ul'));
        $item.append(btn);

        const itemClass = $item.attr('class').split(/\s+/)[0];
        const btnClass = $item.find('a').attr('class').split(/\s+/)[0];
        const iconClass = $item.find('svg').attr('class').split(/\s+/)[0];

        if (symbolCache.indexOf(name) === -1) {
          const $svg = cheerio.load(svg);
          const viewBox = $svg('svg').attr('viewbox');
          const pas = $svg('path').toString();

          $svgSymbol('svg')
            .append(`<symbol id=${name} viewBox="${viewBox}">${pas}</symbol>`);
          symbolCache.push(name);
        }

        if (idx === 0 && typeof opts.css === 'string') {
          const css = pupa(opts.css, {
            list: listClass,
            item: itemClass,
            btn: btnClass,
            icon: iconClass
          }).replace(/\s*\n\s*/g, '');
          $(`
<script>
  var style = document.createElement('style');
  style.innerHTML = '${css}';
  document.head.appendChild(style);
</script>
            `).prependTo($.root());
        }
      });

      $elem.replaceWith($list.html());
    });

    $svgSymbol.root().prependTo($.root());
    return $;
  };
}

function readSvgWrapper() {
  return fs.readFileSync(`${__dirname}/_templates/svg.txt`, 'utf-8');
}
