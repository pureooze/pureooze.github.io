---
title: "Finding Temporal Coupling"
thumbnail: 2024-05-03-finding-temporal-coupling/thumbnail.avif #TODO: make it dynamic type
small-thumbnail: 2024-05-03-finding-temporal-coupling/small-thumbnail.avif #TODO: make it dynamic type
tags: 
    - technical debt
    - temporal coupling
    - refactoring
---

Temporal coupling can be described as a type of coupling 

https://docs.enterprise.codescene.io/versions/1.5.0/guides/technical/temporal-coupling.html
https://docs.enterprise.codescene.io/versions/3.4.0/guides/technical/temporal-coupling.html

```js
function main() {
    const options = { 
        "env": "development" 
    };
    
    const endpoint = getOptions(options); // temporal coupling
    const result = getResult(endpoint);
}
```