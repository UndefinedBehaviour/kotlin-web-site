import { join } from 'node:path';
import { getType } from '../lib/files/type.js';
import { DIST_FOLDER } from '../lib/files/index.js';
import { Result } from './lib.js';

function sendEvent(...args: Parameters<typeof process.send>) {
    process.send(...args);
}

function sendWarning() {
    console.error('process.send is not defined');
}

const send = process.send ? sendEvent : sendWarning;

const HOME_HTML_CONTENT = '' +
    '<section class = "panel__content" ><div class = "container"><article class="article">' +
    '<h1 id = "home.xml">Kotlin Docs</h1>' +
    '</article><div id="disqus_thread"></div ></div></section>';

async function onMessage(relativePath: string) {
    let html: string = null;

    const path = join(DIST_FOLDER, relativePath);
    const [type, $] = await getType(relativePath, path);

    if (type === 'Page_Documentation') {
        const sections = $('section.panel__content');

        if (relativePath === 'docs/home.html') {
            html = HOME_HTML_CONTENT;
        } else if (sections.length > 0) {
            html = '';
            for (const node of sections) {
                $(node).find('.last-modified').remove();
                html += $.html(node)
                    // sample drop
                    .replace(/\/\/sampleStart/g, '')
                    .replace(/\/\/sampleEnd/g, '');
            }
        }
    }

    const data: Result = {
        id: relativePath,
        html: html || ''
    };

    send({ event: 'result', data });
}

process.on('message', onMessage);
send({ event: 'inited' });
