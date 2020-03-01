---
layout: post
title: Spring Security初始化过滤器链源码分析
categories: 读源码
description: Spring Security源码分析之一
keywords: 读源码, ![]({{site.url}}/imagesSpring Security
---


Spring Security是Spring社区的一个顶级项目，也是Spring Boot官方推荐使用的Security框架。Spring Boot检测到Spring Security存在的时候会自动进行默认配置。

Spring Security通过过滤器链实现，简单的过滤器链如下图：

![]({{site.url}}/images/posts/20200229/filter_chain.png)


接下去进入正题，我们通过跟踪源码，了解Spring Security是如果创建出这个过滤器链的。

--
我们在使用Spring Security时，通常会在Application启动类或者继承WebSecurityConfigurerAdapter的自定义配置类中加上 **@EnableWebSecurity**，这个注解就是我们这次源码分析的进入点。

可以看到EnableWebSecurity中引入了WebSecurityConfiguraiton类，如图所示：

![]({{site.url}}/images/posts/20200229/EnableWebSecurity.png)

--
点开**WebSecurityConfiguration**类，可以看到这个类的介绍，它是通过一个WebSecurity去创建FilterChainProxy，Spring Security的核心就是过滤器，这个过滤器链名字叫"springSecurityFiltrChain"，类型就是FilterChainProxy。

WebSecurityConfiguration类中，主要关注两个方法，如方法名取的那样，springSecurityFilterChain就是创建过滤器链，而setFilterChainProxySecurityConfigurer则是为前者服务。

我们先看setFilterChainProxySecurityConfigurer方法：

* public void setFilterChainProxySecurityConfigurer(ObjectPostProcessor<Object> objectPostProcessor, List<SecurityConfigurer<Filter, WebSecurity>> webSecurityConfigurers)

	![]({{site.url}}/images/posts/20200229/setFilterChainProxySecurityConfigurer.png)

	如红框圈出，这个方法主要做了三件事：

	1. 通过objectPostProcessor创建webSecuirty对象
	2. 对传入的参数webSecurityConfigurers进行排序以及校验它们order注解的唯一性
	3. 向第一步创建的webSecurity对象中依次添加第二步中的webSecruityConfigurers

	这里带出以下问题：

	1. objectPostProcessor是什么，为什么这么用？
	
		>    OjbectPostProcessor是Spring Security中用到的一个修改和替换bean的工具。为什么要用到这个工具？因为Spring Security的Java配置不会公开其配置的每个对象的每个属性，毕竟数量繁多，这很大简化了大多数用户的使用成本。但是可能仍然会有人要去定制化配置，所以Spring Security引入了这个工具，它可以修改或者替换Java配置创建的许多对象的实例。这意味着一个对象在调用postProcess方法后可以增强功能或者直接被一个新对象替换掉，这和 BeanProcess, BeanFactoryProcess功能类似，但ObjectPostProcessor不是在Spring生命周期内进行的，而是在Spring容器初始化完成后手工调用处理的。
	
	2. 入参webSecurityConfigurers从哪里来？
	
		>  从BeanFactory中基于type收集所有的实现 WebSecurityConfigurer 接口的类。
	
	3. webSecurity.add(webSecurityConfigurer)的实现？

		> todo	

  在理清webSecurityConfigurers的逻辑后，我们来看生成springSecurityFilterChain的实现：

* public Filter springSecurityFilterChain()

	![]({{site.url}}/images/posts/20200229/springSecurityFilterChain.png)

	如上图代码，springSecurityFilterChain()方法中主要做两件事：
	
	1. 判断有没有webSecurityConfigurers（已经在上面的setFilterChainProxySecurityConfigurer方法中初始化），没有就新建一个webSecurityConfigurerAdapter（实现了webSecurityConfigurer接口），并且把它应用到webSecurity上，这部分逻辑就和setFilterChainProxySecurityConfigurer()中的逻辑一样。
	2.  关键在于webSecurity.build()上，创建真正的SpringSecurityFilterChain。

--

继续跟踪**WebSecurity**，点开webSecurity.build()，进入的是它的抽象类AbstractSecurityBuilder的build()方法实现中，代码如下：

![]({{site.url}}/images/posts/20200229/AbstractSecurityBuilder_build.png)

如上图中标识的，这里通过CAS原子操作保证build()执行时的线程安全。

我们看下doBuild()方法的实现，在AbstractSecurityBuilder中这个方法是个抽象方法，它的实现是在子抽象类AbstractConfiguredSecurityBuilder中，如下图：

![]({{site.url}}/images/posts/20200229/AbstractConfiguredSecurityBuilder_doBuild.png)

其中我们需要关注 init(), configure()，performBuild() 方法。我们依次展开来讲。最终我们还会回到这里，因为performBuild()会进行创建最终需要的过滤器；当然，performBuild()方法在AbstractConfiguredSecurityBuilder中也只是抽象方法，见下图：

![]({{site.url}}/images/posts/20200229/AbstractConfiguredSecurityBuilder_methods.png)

我们先来看AbstractConfiguredSecurityBuilder抽象类中的init()方法，这个方法