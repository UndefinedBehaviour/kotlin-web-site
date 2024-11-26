import { readFile, writeFile } from 'node:fs/promises';

async function sortList(filename) {
    const result = JSON.parse(await readFile(filename, { encoding: 'utf-8' }))
        .sort((a, b) => a.objectID.localeCompare(b.objectID));
    await writeFile(filename, JSON.stringify(result, null, 2), 'utf8');
}

await Promise.all([
    sortList('index-new.json'),
    sortList('search-index.json5')
]);
