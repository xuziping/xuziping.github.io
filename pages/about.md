---
layout: page
title: About
description: 技术徐话
keywords: ZiPing Xu, 徐子平
comments: false
menu: 关于
permalink: /about/
---

感觉像是被时代推着走。

技术迭代潮起潮落。

那就把沿途的风景记几笔下来。

### 联系

{% for website in site.data.social %}
* {{ website.sitename }}：[@{{ website.name }}]({{ website.url }})
{% endfor %}
<!-- 
### Skill Keywords

{% for category in site.data.skills %}
### {{ category.name }}
<div class="btn-inline">
{% for keyword in category.keywords %}
<button class="btn btn-outline" type="button">{{ keyword }}</button>
{% endfor %}
</div>
{% endfor %} -->
