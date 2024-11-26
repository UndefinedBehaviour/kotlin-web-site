export type Result = {
    id: string
    html: string
}

export async function convertToFlatUrls({ topLevelIds, entities }: {
    entities: { pages: Record<string, { url?: string, pages: string[] }> },
    topLevelIds: string[]
}) {
    const result: string[] = [];
    const visited = new Set<string>();
    const stack = [...topLevelIds.reverse()]; // Reverse to maintain order
    const data = entities.pages;
    while (stack.length) {
        const id = stack.pop();

        if (visited.has(id)) continue;
        visited.add(id);

        const page = data[id];
        if (!page) continue;
        const { url, pages } = page;

        if (url) result.push(page.url);

        if (pages?.length) {
            for (let i = page.pages.length - 1; i >= 0; i--) {
                stack.push(page.pages[i]);
            }
        }
    }

    return result;
}