---
layout: post
title: Spring Security初始化过滤器链源码分析
categories: 读源码
description: Spring Security源码分析之一
keywords: 读源码, Spring Security
---


Spring Security通过过滤器链实现，简单的用户名密码的过滤器链如下图：

![](images/posts/20200229/filter_chain.png)
（图片来自网络）
