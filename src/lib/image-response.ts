import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { ImageResponse as OGImageResponse } from '@vercel/og';
import { htmlToOgStrict as html } from './parse-html';
//import { html } from 'satori-html';

export const prerender = false;


export const ImageResponse = <T extends Record<string, unknown>>(
    component: Component<T>,
    options?: ConstructorParameters<typeof OGImageResponse>['1'],
    props?: T
) => {
    const result = render(component as Component, { props });
    const data = html(result.body);
    //console.log(JSON.stringify(data, null, 2));
    return new OGImageResponse(data, options);
};
