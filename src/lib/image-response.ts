import type { Component } from 'svelte';
import { render } from 'svelte/server';
//import { ImageResponse as OGImageResponse } from '@cf-wasm/og';
import { ImageResponse as OGImageResponse } from '@vercel/og';
import { html } from 'satori-html';

export const prerender = false;


export const ImageResponse = <T extends Record<string, unknown>>(
    component: Component<T>,
    options?: ConstructorParameters<typeof OGImageResponse>['1'],
    props?: T
) => {
    const result = render(component as Component, { props });
    console.log('Svelte render result:', JSON.stringify(result));
    return new OGImageResponse(html(result.body), options);
};
