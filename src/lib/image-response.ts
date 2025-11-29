import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { ImageResponse as OGImageResponse } from '@vercel/og';
import { html } from 'satori-html';

export const prerender = false;

function isBunRuntime(): boolean {
    // Bun exposes `Bun` global and `process.versions.bun`
    return typeof (globalThis as typeof globalThis & { Bun?: unknown }).Bun !== 'undefined';
}

type BunLike = {
    spawnSync: (cmd: string[] | string, options?: { stdin?: Uint8Array }) => {
        exitCode: number;
        stdout: Uint8Array;
        stderr: Uint8Array;
    };
};

function runSatoriHtmlInNode(htmlString: string) {
    // This uses Bun's spawnSync API. If you're using plain Node here,
    // swap this to child_process.spawnSync.
    const BunGlobal = (globalThis as { Bun?: BunLike }).Bun as BunLike;

    const payload = JSON.stringify({ html: htmlString });

    const proc = BunGlobal.spawnSync(['node', 'satori-worker.mjs'], {
        stdin: new TextEncoder().encode(payload),
    });

    if (proc.exitCode !== 0) {
        const stderr = new TextDecoder().decode(proc.stderr);
        throw new Error(`satori-worker failed (code ${proc.exitCode}): ${stderr}`);
    }

    const stdout = new TextDecoder().decode(proc.stdout);
    return JSON.parse(stdout);
}


export const ImageResponse = <T extends Record<string, unknown>>(
    component: Component<T>,
    options?: ConstructorParameters<typeof OGImageResponse>['1'],
    props?: T
) => {
    const result = render(component as Component, { props });

    if (!isBunRuntime()) {
        return new OGImageResponse(html(result.body), options);
    }

    return new OGImageResponse(runSatoriHtmlInNode(result.body), options);
};
