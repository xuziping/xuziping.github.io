---
layout: post
title: Spring Security初始化过滤器链源码分析
categories: 读源码
description: Spring Security源码分析之一
keywords: 读源码, ![](imagesSpring Security
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

WebSecurityConfiguration类中，主要关注两个方法，如方法名取的那样，springSecurityFilterChain()就是创建过滤器链，而setFilterChainProxySecurityConfigurer()则是为前者服务。

我们先看setFilterChainProxySecurityConfigurer()方法：

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

其中需要关注 init(), configure()，performBuild() 方法。我们依次展开来讲，最终还会回到这里，因为performBuild()会进行创建最终需要的过滤器；当然，performBuild()方法在AbstractConfiguredSecurityBuilder中只是抽象方法，见下图：

![]({{site.url}}/images/posts/20200229/AbstractConfiguredSecurityBuilder_methods.png)

我们先来看AbstractConfiguredSecurityBuilder抽象类中的init()方法，这个方法会进行两次迭代，把所有的SecurityConfigurer都遍历调用它们自己的init()方法。稍后我们会看到这些init()方法中又会创建httpSecurity以及调用httpSecurity的configure方法。

看到这里你也许会有困惑，对于WebSecurity，HttpSecurity等理不清它们的关系，我们这里整理一下：

* Spring Security核心是过滤器Filter，name=springSecurityFilterChain, class=FilterChainProxy
* FilterChainProxy中存放过滤器链（List<SecurityFilterChain>)，然后这个过滤器链的每个元素SecurityFilterChain本质是又是一个过滤器列表（List<Filter>)
* WebSecurity用来创建核心过滤器，即FilterrChainProxy；HttpSecurity用来创建过滤器链的每个元素，即SecurityFilterChain
* 像HttpSecurity，WebSecurity虽然创建对象不同，但都继承AbstractConfiguredSecurityBuilder。之前提到的那些configurer

好，我们继续看下SecurityConfigurer的init()方法的实现，其实是WebSecurityConfigurer中去实现，相关我们可以参考上面已经说过的 WebSecurityConfiguration 中的setFilterChainProxySecurityConfigurer()。实现了WebSecurityConfigurer接口的是WebSecurityConfigurerAdapter适配器类，它init()代码如下图：

![]({{site.url}}/images/posts/20200229/WebSecurityConfigurerAdapter_init.png)

这个方法主要做三件事：

1. 创建httpSecurity
2. 把创建的httpSecurity对象添加到WebSecurity中的securityFilterChainBuilders中
3. 设置了一个webSecurity build之后会马上执行的线程，即webSecurity添加一个过滤器（虽然这个过滤器叫securityInterceptor）

接下来，我们看下它是怎么创建 httpSecurity的：

![]({{site.url}}/images/posts/20200229/WebSecurityConfigurerAdapter_getHttp.png)

我们可以看到：

1. httpSecurity是直接被new出来的
2. httpSecurity基于AuthenticationManagerBuilder对象去创建，因此我们稍后会看下 authenticationManager()方法的实现
3. httpSecurity创建后会初始化它默认的拦截策略
4. 最后通过调用可配置的configure(http)，我们一般会通过继承WebSecurityConfigurerAdapter去覆写这个方法。我们稍后可以看下它默认的配置

我们首先来看authenticationManager()方法的实现：

![]({{site.url}}/images/posts/20200229/WebSecurityConfigurerAdapter_authenticationManager.png)

在config()中，配置了disableLocalConfigureAuthenticationBldr，同样可以在WebSecurityConfigurerAdapter的继承类中覆写这个方法。

AbstractConfiguredSecurityBuilder.doBuilder()中的init()已经介绍完，然后我们回头继续看它的configure()方法。

![]({{site.url}}/images/posts/20200229/AbstractConfiguredSecurityBuilder_configure.png)

它主要就是迭代了WebSecurityConfigurer的configurer()方法，参数是它本身即webSecurity。这个接口同样可以在WebSecurityConfigurerAdapter的继承类中被覆写。

到目前为止，我们在Spring Security使用中会继承的WebSecurityConfigurerAdapter的三个常见的被覆写的方法都介绍完了。它们如下:

* configure(AuthenticationManagerBuilder auth);
* configure(WebSecurity web);
* configure(HttpSecurity http);

最后，作为创建Spring Security过滤器链的最后一步，我们再次回到AbstractConfiguredSecurityBuilder的performBuild()抽象方法上，我们看它在其子类 WebSecurity中的实现：

![]({{site.url}}/images/posts/20200229/WebSecurity_performBuild.png)

1. 每个WebSecurityConfigurerAdapter对应一个HttpSecurity，参见第一处框出来的代码，这里会遍历所有的HttpSecurity，调用HtppSecurity的build()构建对应的过滤器链SecurityFilterChain实例，并将SecurityFilterChain添加到securityFilterChains列表中。
2. 然后基于上面的securityFilterChains直接new一个FilterChainProxy，即最终的过滤器链。如果需要debug，它还会包装一层DebugFilter
3. 最后通过 postBuildAction.run() 来实现一个延迟加载的功能，把早先定义的httpSecurity过滤器加到WebSecurity上。

到此为止，Spring Security整个初始化过滤器链流程结束。我们在使用Spring Security中，一般继承WebSecurityConfigurerAdapter并且覆写一个或多个configure方法。
