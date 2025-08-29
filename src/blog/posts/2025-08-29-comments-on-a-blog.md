---
title: "Enabling Comments With Utterances"
thumbnail: 2025-08-29-comments-on-a-blog/thumbnail.avif #TODO: make it dynamic type
small-thumbnail: 2025-08-29-comments-on-a-blog/small-thumbnail.webp #TODO: make it dynamic type
tags:
    - blog
    - utterances
---

When I migrated this blog from Medium to my own site I have thought about allowing readers to leave comments on posts.
In the initial version of the site I decided not to pursue a comments section because the existing solutions did not meet my needs.

<!-- excerpt -->
From past experience as a blog maintainer and reader I had some requirements:

1. Free
1. No ads
1. No spam comments (or at least a minimal amount)
1. Low overhead (implementation and/or for users to leave a comment)

A few days ago I was reading [this awesome blog](https://www.taniarascia.com/blog/) and found [this post about adding comments to a blog](https://www.taniarascia.com/adding-comments-to-my-blog/). Tania used a really cool tool called [Utterances](https://utteranc.es/) that seemed super easy to setup and met the above requirements.

Here's a comparison between [Utterances](https://utteranc.es/) and other solutions I have previously considered. Note that "Roll My Own™" refers to building and hosting a soltion that I implement myself while "Self Hosted" refers to using an existing solution and hosting it on my own infrastructure.

| Solution                           | Free                  | No Ads                               | Low Spam | Low Overhead |
| ---------------------------------- | --------------------- | ------------------------------------ | -------- | ------------ |
| Roll My Own™                       | ✅                    | ✅                                   | ❌       | ❌           |
| Self Hosted                        | ✅                    | ✅                                   | ❌       | ❌           |
| [Disqus](https://disqus.com/)      | ✅                    | ❌[^ads-in-disqus][^ads-in-disqus-2] | ✅       | ✅           |
| [Commento](https://commento.io/)   | ❌[^commento-pricing] | ✅                                   | ✅       | ✅           |
| [Utterances](https://utteranc.es/) | ✅                    | ✅                                   | ✅       | ✅           |

Based on the above requirements, Utterances felt like a great candidate for my blog. I followed the instructions on the website and had it working pretty quickly (10 - 15 minutes).
The only real "downside" with Utterances is that users need to have a GitHub account to leave a comment – but based on the content of my blog I felt that was likely true for most readers – and creating a GitHub account is pretty easy IMO.

Everything else about it is super slick, you sign into GitHub with one click and then you can leave a comment on the post. Utterances uses GitHub issues to track comments so [I created a repo](https://github.com/pureooze/comments) just for the comments. From here the admin experience becomes similar to the repo maintainer experience – something I am already familiar with so that was a nice win.

[^ads-in-disqus]: [Disqus Hits Sites with Unwanted Advertising](https://wptavern.com/disqus-hits-sites-with-unwanted-advertising-plans-to-charge-large-publishers-a-monthly-fee-to-remove-ads)
[^ads-in-disqus-2]: [StackOverflow: How do I disable or hide the unwanted Disqus ads on my website?](https://stackoverflow.com/questions/49131980/how-do-i-disable-or-hide-the-unwanted-disqus-ads-on-my-website)
[^commento-pricing]: [Commento: Not free. By design.](https://commento.io/pricing)
