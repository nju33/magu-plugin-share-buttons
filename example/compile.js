import fs from 'fs';
import magu from 'magu';
import buttons from '../dist/magu-plugin-shere-buttons';

magu({}, [buttons()])
  .process(`${__dirname}/example.md`)
  .then(result => {
    console.log(result.html);
    fs.writeFileSync(`${__dirname}/index.html`, result.html, 'utf-8');
  });
