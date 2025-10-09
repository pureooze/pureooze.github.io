---
title: "Memory Bank: Aria Tags vs Title"
thumbnail: 2025-10-07-aria-vs-title/thumbnail.jpg #TODO: make it dynamic type
small-thumbnail: 2025-10-07-aria-vs-title/thumbnail.jpg #TODO: make it dynamic type
tags: 
  - accessibility
  - aria
  - memory-bank
---

This came up in something I was working on recently and I always forget the difference so I wanted to write this blog post to help me remember... and have a quick reference when I inevitably forget 😉.

<!-- excerpt -->

## What Is title?
The `title` [attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title) contains text to provide advisory information [^advisory-information] related to its target element. This information is often presented to users through a tooltip. Note that `title` is a [global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes) so it is avaliable on all HTML elements.

## Accessible Names?
To understand when `aria-label` is appropriate to use, it's important to understand how browsers provide accessible names.

### Default Accessible Names
Some elements provide a [default accessible name](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name) that can be used by screen readers to provide a label for a given element. For example in a button the value between the open and close tags is the default accessible name.

```xml
<button>this is a default label</button>
```

Sometimes the default accessible name is inaccurate and a separate label needs to be provided to give users accurate context. In these situations labels can help.

### Labels

#### The Label Element
The `<label>` element provides a **visible** caption for an element. It is often used in user interfaces like forms to provide context on a field. Label requires using the `for` attribute to reference another elements via their `id` and it only works with [labelable elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories#labelable).

```xml
<div class="my-ui">
  <label for="blog">I like writing</label>
  <input type="checkbox" name="blog" id="blog" />
</div>
```

#### Label By Reference
The `aria-labelledby` [attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby) is similar to `aria-label` but instead of providing an accessible name it references other elements on a page to provide it.

Note that `aria-labelledby` takes priority over ALL other methods of providing accessible names.

### What Is aria-label?
The `aria-label` [attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) contains text to label an element when no other label is present.

There are some elements and roles that `aria-label` [does not work on](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label#associated_roles).

## When Should You Use Them?


[^advisory-information]: TODO