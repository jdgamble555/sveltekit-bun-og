// html-to-og-strict.ts
export type OgChild = OgNode | string | null;

export type OgNode = {
  type: 'div';
  props: {
    class?: string;
    tw?: string;
    style?: Record<string, string | number>;
    children?: OgChild | OgChild[];
  };
};

export function htmlToOgStrict(html: string): OgNode {
  // Strip Svelte/comments like <!--[--> <!--]--> etc.
  const cleaned = html.replace(/<!--[\s\S]*?-->/g, '');

  let root: OgNode | null = null;
  const stack: OgNode[] = [];

  const tagRegex = /<\/?div[^>]*>/gi;
  let i = 0;
  let match: RegExpExecArray | null;

  function pushChild(parent: OgNode, child: OgChild) {
    const current = parent.props.children;
    if (!current) {
      parent.props.children = [child];
    } else if (Array.isArray(current)) {
      current.push(child);
    } else {
      parent.props.children = [current, child];
    }
  }

  while ((match = tagRegex.exec(cleaned))) {
    const tagStart = match.index;
    const tagEnd = tagRegex.lastIndex;

    // Text between tags goes to the current top of stack
    if (tagStart > i && stack.length > 0) {
      const text = cleaned.slice(i, tagStart).trim();
      if (text) {
        const parent = stack[stack.length - 1];
        pushChild(parent, text);
      }
    }

    const tagSource = match[0];

    if (tagSource.startsWith('</')) {
      // closing </div>
      if (stack.length > 0) stack.pop();
    } else {
      // opening <div ...>
      const classMatch = /class\s*=\s*"([^"]*)"/i.exec(tagSource);
      const cls = classMatch ? classMatch[1] : undefined;

      const node: OgNode = {
        type: 'div',
        props: {},
      };

      if (cls) {
        node.props.class = cls;
        node.props.tw = cls;
      }

      if (!root) {
        // first real <div> becomes the root inner node
        root = node;
      } else {
        const parent = stack[stack.length - 1];
        pushChild(parent, node);
      }

      stack.push(node);
    }

    i = tagEnd;
  }

  // Trailing text after last tag, still inside last-open div
  if (i < cleaned.length && stack.length > 0) {
    const text = cleaned.slice(i).trim();
    if (text) {
      const parent = stack[stack.length - 1];
      pushChild(parent, text);
    }
  }

  if (!root) {
    // No <div> at all; fall back to empty
    root = {
      type: 'div',
      props: {},
    };
  }

  // Normalize children: if a node has exactly one string child,
  // collapse children: ["foo"] → "foo"
  function normalize(node: OgNode) {
    const ch = node.props.children;
    if (!ch) return;

    const arr = Array.isArray(ch) ? ch : [ch];

    // normalize nested nodes
    for (const child of arr) {
      if (child && typeof child === 'object') {
        normalize(child as OgNode);
      }
    }

    if (arr.length === 1 && typeof arr[0] === 'string') {
      // collapse to direct string
      node.props.children = arr[0];
    } else {
      node.props.children = arr;
    }
  }

  normalize(root);

  // Outer wrapper with fixed style and [null, root] children
  const wrapper: OgNode = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      },
      children: [null, root],
    },
  };

  return wrapper;
}
