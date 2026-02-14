---
title: "Memory Bank: Labels In HTML"
thumbnail: 2025-10-07-aria-vs-title/thumbnail.webp #TODO: make it dynamic type
small-thumbnail: 2025-10-07-aria-vs-title/thumbnail.webp #TODO: make it dynamic type
tags: 
  - accessibility
  - aria
  - memory-bank
---
What is the right way to label something in HTML?

This came up in something I was working on recently.  I always forget the best practices for labeling so I wanted to write this blog post to help me remember... and as a quick reference when I inevitably forget 😉.

<!-- excerpt -->

## Default Accessible Names

Some elements provide a [default accessible name](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name) that can be used by screen readers to provide a label for a given element. For example in a button the value between the open and close tags is the default accessible name.

```html
<button>this is a close button</button>
```

Sometimes the default accessible name is inaccurate and a separate label needs to be provided to give users accurate context. In these situations labels can help. 

Imagine if the `<button>` in the code above needed to have `X` as its text. This is not very informative to screen reader users and we need a better way to indicate what this button does. There are also many elements that do not have default accessible names, so we may need to provide labels for them as well.

## Labeling Elements
The `title` [attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title) contains text to provide advisory information related to its target element. This information is often presented to users through a tooltip and read by **some** screen readers. Note that `title` is a [global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes) so it is available on all HTML elements.

Unfortunately because `title` was introduced in very early versions of HTML there are several accessibility issues with it which created the need for more modern approaches:
- the `<label>` element
- `aria-labelledby`
- `aria-label`

The `<label>` element provides a **visible** caption for an element. It is often used in user interfaces like forms to provide context on a field. Label requires using the `for` attribute to reference another elements via their `id` and it only works with [labelable elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories#labelable).

```html
<div class="my-ui">
  <label for="blog">I like writing</label>
  <input type="checkbox" name="blog" id="blog" />
</div>
```

The `aria-labelledby` [attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby) references another element on the page to provide an accessible label. Note that `aria-labelledby` takes priority over ALL other methods of providing accessible names.

```html
<span id="my-label">A label</span>
<div aria-labelledby="my-label"></div>
```

The `aria-label` [attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label) contains text to label an element when no other label is present. Since `aria-label` is **not visible** it is often used to provide text that is only available to screen readers. Note that `aria-label` [does not work with some elements](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-label#associated_roles).

```html
<button aria-label="Close"> X </button>
```

## So What Should You Use?
Using `title` for labelling causes issues for [several groups of people](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title#accessibility_concerns) (via MDN):
- People using touch-only devices
- People navigating with keyboards
- People navigating with assistive technology such as screen readers or magnifiers
- People experiencing fine motor control impairment
- People with cognitive concerns

> "If you want to hide content from mobile and tablet users as well as assistive tech users and keyboard only users, use the title attribute."
>
> — [The Paciello Group blog](https://www.tpgi.com/using-the-html-title-attribute-updated/)

With that in mind it's safe to say that `title` should not be relied on for labeling elements.
The best practice is to use visible labels over invisible labels like `aria-label`. Prefer the use of `<label>` or `aria-labelledby` because they provide visible labels. Use `aria-label` if these other options are not available. Remember not to use both visible and invisible labels on the same element as the `aria-labelledby` attribute always take precedence.
