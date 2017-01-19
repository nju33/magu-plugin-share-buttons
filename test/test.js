import fs from 'fs';
import test from 'ava';
import marked from 'marked';
import cheerio from 'cheerio';
import buttons from '../dist/magu-plugin-shere-buttons';

const md = fs.readFileSync(`${__dirname}/fixtures.md`, 'utf-8');

test.todo('todo');
