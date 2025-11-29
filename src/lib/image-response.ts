import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { ImageResponse as OGImageResponse } from '@cf-wasm/og';
import { html } from 'satori-html';

export const prerender = false;

const data = `<div class="flex h-full w-full flex-col items-center justify-center bg-white p-10">
	<div class="text-center text-[60px] font-bold text-black">Welcome to My Site</div>
	<div class="mt-5 text-[30px] text-gray-600">Generated with SvelteKit ImageResponse and Deployed to Cloudflare</div>
</div>
`


export const ImageResponse = async <T extends Record<string, unknown>>(
    component: Component<T>,
    options?: ConstructorParameters<typeof OGImageResponse>['1'],
    props?: T
) => {
    //const result = render(component as Component, { props });
    return await OGImageResponse.async(html(data), options);
};
