import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { ImageResponse as OGImageResponse } from '@vercel/og';
import { htmlToOgStrict as html } from './parse-html';
//import { html } from 'satori-html';

// https://github.com/oven-sh/bun/pull/15047

export const prerender = false;


export const ImageResponse = <T extends Record<string, unknown>>(
    component: Component<T>,
    options?: ConstructorParameters<typeof OGImageResponse>['1'],
    props?: T
) => {
    const result = render(component as Component, { props });
    return new OGImageResponse(html(result.body), options);
};
