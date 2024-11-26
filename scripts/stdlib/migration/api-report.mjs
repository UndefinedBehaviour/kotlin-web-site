import YAML from 'yaml';
import { readFile, writeFile } from 'node:fs/promises';

async function readRedirects() {
    const data = await readFile('../../../redirects/stdlib-redirects.yml', {
        encoding: 'utf-8'
    });

    const redirects = YAML.parse(data);
    const result = new Map();

    return Promise.all(redirects.map(async ({ from, to }) => {
        for (let old of Array.isArray(from) ? from : [from]) {
            if (old.endsWith('/index.html')) old = old.slice(0, -10);
            result.set(old, to);
        }
    }))
        .then(() => result);
}

async function readReport() {
    return JSON.parse(await readFile('../../../search-report.master/only-api-new.json', {
        encoding: 'utf-8'
    }));
}

const [redirects, report] = await Promise.all([readRedirects(), readReport()]);

const origin = (await Promise.all(Object.entries(report).map(([key, content]) => {
    let oldId = key.replace(/^https:\/\/(staging\.)?kotlinlang.org/, '');
    const url = redirects.get(oldId) || oldId;
    const uri = `https://kotlinlang.org${url}`;

    for (const item of content) {
        item.objectID = url.replace(/\.html$/, '') + item.objectID.substring(oldId.length);
        item.parent = url;
        item.url = uri;
        item.pageViews = 0;
    }

    return [`https://kotlinlang.org${url}`, content];
})));

await Promise.all([
    writeFile('report.origin.json', JSON.stringify(Object.fromEntries(origin), null, 4)),
    writeFile('report.sorted.json', JSON.stringify(
        Object.fromEntries(origin.sort(([a], [b]) => a.localeCompare(b))),
        null,
        4
    ))
]);
