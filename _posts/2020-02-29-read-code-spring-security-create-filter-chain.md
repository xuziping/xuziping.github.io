---
layout: post
title: Spring Security核心过滤器链创建部分的源码走读
categories: 读源码
description: Spring Security源码分析之一
keywords: 读源码, Spring Security
---

### Spring Security是什么
Spring Security是Spring社区的一个顶级项目，也是Spring Boot官方推荐使用的Security框架。

### Spring Security功能是什么
Spring Security功能主要就是**认证**和**授权**。

### Spring Security实现原理是什么

Spring Security的实现原理就是过**滤器链**，结构图如下：

![]({{site.url}}/images/posts/20200229/filter_chain.png)

先简单介绍下主要过滤器：

1. SecurityContextPersistenceFilter

> 	请求进入时，从配置好的 SecurityContextRepository 中获取 SecurityContext，把它塞给 SecurityContextHolder。在响应离开时，将 SecurityContextHolder 里的 SecurityContext 保存到SecurityContextRepository，并且清除 securityContextHolder 持有的 SecurityContext。

2. UsernamePasswordAuthenticationFilter 
> 	用来处理来自表单提交的用户名和密码的认证。内部还有成功和失败对应的 AuthenticationSuccessHandler 和 AuthenticationFailureHandler 处理。

3. ExceptionTranslationFilter
> 	能够捕获过滤器中的异常并且处理 AuthenticationException 和 AccessDeniedException。在处理异常前，它会先用 RequestCache 把当前的HttpServerletRequest的信息保存起来，使用户成功登陆后可以跳到之前页面。

4. FilterSecurityInterceptor 
> 	保护Http资源，之前授权不通过就抛出异常。


### Spring Security如何使用

> 自己写个配置类，继承自 WebSecurityConfigurerAdapter，重写几个configure()方法。


***接下去进入正题，我们通过跟踪源码，了解Spring Security是如何创建出这个过滤器链的，好戏开场====>***

---
### 过滤器链实现过程的代码走读

**剧透及摘要：**

* Spring Security的核心过滤器链，名叫 **springSecurityFilterChain**, 类型是 **FilterChainProxy**
*  **FilterChainProxy** 里是一个过滤器链（列表），名叫filterChains(不重要），类型是 **List<SecurityFilterChain>**，每个 **SecurityFilterChain** 都是一组URL匹配规则 + 一个Filter列表
*  FilterChainProxy是 **WebSecurity** 去创建的（制造厂是 WebSecurityConfiguration)
*  SecurityFilterChain 是 **HttpSecurity** 去创建的


**DEBUG代码**

我们在使用Spring Security时，通常会在Application启动类或者继承WebSecurityConfigurerAdapter的自定义配置类中加上 **@EnableWebSecurity**，这个注解就是我们这次源码分析的进入点。

可以看到EnableWebSecurity中引入了WebSecurityConfiguration类，如图所示：

![]({{site.url}}/images/posts/20200229/EnableWebSecurity.png)

---

点开**WebSecurityConfiguration**类，可以看到这个类的介绍，【重复一遍】：*“它是通过一个WebSecurity去创建FilterChainProxy，Spring Security的核心就是过滤器，这个过滤器链名字叫"springSecurityFilterChain"，类型就是FilterChainProxy”*。

WebSecurityConfiguration类中，主要关注两个方法，如方法名取的那样，springSecurityFilterChain()就是创建过滤器链，而setFilterChainProxySecurityConfigurer()就是设过滤配置器。

我们先看setFilterChainProxySecurityConfigurer()方法：

* public void setFilterChainProxySecurityConfigurer(ObjectPostProcessor<Object> objectPostProcessor, List<SecurityConfigurer<Filter, WebSecurity>> webSecurityConfigurers)

	![]({{site.url}}/images/posts/20200229/setFilterChainProxySecurityConfigurer.png)

	如红框圈出，这个方法主要做了三件事：

	1. **通过objectPostProcessor创建webSecurity对象** (容易被忽视)
	2. 对传入的参数webSecurityConfigurers进行排序以及校验它们order注解的唯一性
	3. 向第一步创建的webSecurity对象中依次添加第二步中的webSecruityConfigurers

	这里带出以下问题：

	1. objectPostProcessor是什么，为什么这么用？
	
		>    OjbectPostProcessor是Spring Security中用到的一个修改和替换bean的工具。为什么要用到这个工具？因为Spring Security的Java配置不会公开其配置的每个对象的每个属性，毕竟数量繁多，这很大简化了大多数用户的使用成本。但是可能仍然会有人要去定制化配置，所以Spring Security引入了这个工具，它可以修改或者替换Java配置创建的许多对象的实例。这意味着一个对象在调用postProcess方法后可以增强功能或者直接被一个新对象替换掉，这和 BeanProcess, BeanFactoryProcess功能类似，但ObjectPostProcessor不是在Spring生命周期内进行的，而是在Spring容器初始化完成后手工调用处理的。
	
	2. 入参webSecurityConfigurers从哪里来？
	
		>  从BeanFactory中基于type收集所有的实现 WebSecurityConfigurer 接口的类，**也即是所有自定义配置继承了 WebSecurityConfigurerAdapter的配置类实例**。换言之，我们可以简单认为所有 WebSecurityConfigurerAdapter的子类都被放入到了 WebSecurityConfiguration的 webSecurityConfigurers上。
	

  在理清webSecurityConfigurers的逻辑后，我们来看生成springSecurityFilterChain的实现：

* public Filter springSecurityFilterChain()

	![]({{site.url}}/images/posts/20200229/springSecurityFilterChain.png)

	如上图代码，springSecurityFilterChain()方法中主要做两件事：
	
	1. 判断有没有webSecurityConfigurers（已经在上面的setFilterChainProxySecurityConfigurer方法中初始化），没有（用户没有自定义Spring Security的配置）就新建一个webSecurityConfigurerAdapter（实现了webSecurityConfigurer接口），并且把它应用到webSecurity上，这部分逻辑就和setFilterChainProxySecurityConfigurer()中的逻辑一样。
	2.  关键在于webSecurity.build()上，创建真正的SpringSecurityFilterChain。

***WebSecurityConfiguration类介绍得差不多了，留了个尾巴，我们进入WebSecurity看看====>***

---

开始Debug **WebSecurity**，点开webSecurity.build()，进入的是它的抽象类AbstractSecurityBuilder的build()方法实现中，代码如下：

![]({{site.url}}/images/posts/20200229/AbstractSecurityBuilder_build.png)

如上图中标识的，这里通过CAS原子操作保证build()执行时的线程安全。

我们看下doBuild()方法的实现，在AbstractSecurityBuilder中这个方法是个抽象方法，它的实现是在子抽象类AbstractConfiguredSecurityBuilder中，如下图：

![]({{site.url}}/images/posts/20200229/AbstractConfiguredSecurityBuilder_doBuild.png)

其中需要关注 init(), configure()，performBuild() 方法。我们依次展开来讲，最终还会回到这里，因为performBuild()会进行创建最终需要的过滤器；当然，performBuild()方法在AbstractConfiguredSecurityBuilder中只是抽象方法，见下图：

![]({{site.url}}/images/posts/20200229/AbstractConfiguredSecurityBuilder_methods.png)

我们先来看AbstractConfiguredSecurityBuilder抽象类中的init()方法，这个方法会进行两次迭代，把所有的SecurityConfigurer都遍历调用它们自己的init()方法。(稍后我们会看到这些init()方法中又会创建httpSecurity以及调用httpSecurity的configure方法)

***WebSecurity介绍好了，然后我们进入WebSecurityConfigurerAdapter去看一看 httpSecurity是怎么创建出来的====>***

---

我们继续看下SecurityConfigurer的init()方法的实现，是在WebSecurityConfigurerAdapter中去实现，代码如下图：

![]({{site.url}}/images/posts/20200229/WebSecurityConfigurerAdapter_init.png)

这个方法主要做三件事：

1. **创建httpSecurity**
2. 把创建的httpSecurity对象添加到WebSecurity中的securityFilterChainBuilders中
3. webSecurity build之后会执行的一个线程实现

接下来，我们看下它是怎么创建 httpSecurity的：

![]({{site.url}}/images/posts/20200229/WebSecurityConfigurerAdapter_getHttp.png)

我们可以看到：

1. httpSecurity是直接被new出来的
2. httpSecurity基于AuthenticationManagerBuilder对象去创建，因此我们稍后会看下 authenticationManager()方法的实现
3. httpSecurity创建后会初始化它默认的拦截策略
4. 最后通过调用可配置的configure(http)，我们一般会通过继承WebSecurityConfigurerAdapter去覆写这个方法。我们稍后可以看下它默认的配置

我们首先来看authenticationManager()方法的实现：

![]({{site.url}}/images/posts/20200229/WebSecurityConfigurerAdapter_authenticationManager.png)

配置了disableLocalConfigureAuthenticationBldr，同样可以在WebSecurityConfigurerAdapter的继承类中覆写这个方法。

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

到此为止，Spring Security整个初始化过滤器链流程结束。

最后我们看下时序图：

![]({{site.url}}/images/posts/20200229/time_seq_chart.png)


***代码走读完了，可能仍然不太清楚，我们可以从过滤器链的组织结构来看====>***

---

### 从过滤器链的结构理清关系

* DelegatingFilterProxy, FilterChainProxy 以及 SecurityFilterChain 的关系，哪个才是真正的 Spring Security的过滤器链?

	- org.springframework.web.filter.DelegatingFilterProxy
		
		它不是Spring Security中的类，而是 Spring Web中的类。因为Spring不想有太强侵入性，因此使用 DelegatingFilterProxy 来实现委托代理。DelegatingFilterProxy 也是 Spring Web 中六大代理中的第五个，是全局唯一的。DelegatingFilterProxy实现了Filter接口，它代理的就是FilterChainProxy。
		
		Debug代码，我们可以看到创建DelegatingFilterProxy对象的入参 targetBeanName 是 "springSecurityFilterChain"，如图
		
		![]({{site.url}}/images/posts/20200229/DelegatingFilterProxy_new.png)
		
		然后我们继续Debug看下 springSecurityFilterChain 是哪个Bean：
		
		![]({{site.url}}/images/posts/20200229/DelegatingFilterProxy_springSecurityFilterChain.png)
		
		如图可见，springSecurityFilterChain 就是 FilterChainProxy。
	
	- org.springframework.security.web.FilterChainProxy
	
		FilterChainProxy同样是代理类，全局唯一。我们可以看它源码中有:
		
		> 		private List<SecurityFilterChain> filterChains;
		
		 它有一组filterChains，对应于不同url mapping，对应代码如下：
		 
		![]({{site.url}}/images/posts/20200229/FilterChainProxy_getFilters.png)

		当根据URL匹配到对应的filter集合后，会调用一个内部类来实现代理功能。这个内部代理的类在  doFilterInternal() 中被创建：
		
		![]({{site.url}}/images/posts/20200229/FilterChainProxy_doFilterInternal.png)
	
		接下来，我们看下这个内部代理的具体实现：
		
		![]({{site.url}}/images/posts/20200229/FilterChainProxy_VirtualFilterChain.png)
	
		它根据URL匹配出的过滤器链中的过滤器依次进行过滤。之前 doFilterInternal() 方法中的 getFilters(fwRequest) 获取到的 List<FIlter> filters，会被当做 additionalFilters 传入 VirtualFilterChain中进行处理；而这个 filters 就包含了如 UsernamePasswordAuthenticationFilter，SecurityContextPersistenceFilter，FilterSecurityInterceptor 等在内的我们常见的有具体业务职责的过滤器。
	
	- org.springframework.security.web.SecurityFilterChain

		FilterChainProxy 中的核心属性 filterChains 就是一个 SecurityFilterChain 列表，如图：
		
		![]({{site.url}}/images/posts/20200229/FilterChainProxy_filterChains.png)

		然后我们看下 SecurityFilterChain 其实就是一个很简单的接口：
		
		![]({{site.url}}/images/posts/20200229/SecurityFilterChain.png)
		
		它的实现类DefaultSecurityFilterChain也非常简单：
		
		![]({{site.url}}/images/posts/20200229/DefaultSecurityFilterChain.png)
		
		话说DefaultSeccurityFilterChain这个实现类的名字是不是有点熟悉，其实它的初始化方法在WebSecurity和HttpSecurity的performBuild()中都分别调用过，这在之前已经说过，我们可以再看下。
		
		WebSecurity添加DefaultSecurityFilterChain对象：
		
		![]({{site.url}}/images/posts/20200229/WebSecurity_addDefaultSecurityFilterChain.png)
		
		HttpSecurity添加DefaultSecurityFilterChain对象：
		
		![]({{site.url}}/images/posts/20200229/HttpSecurity_addDefaultSecurityFilterChain.png)

		至此，是不是和之前看的代码汇合到了一起？
		
### 总结

整个过程走下来比自己预想中要麻烦，自己约莫了解了这部分源码的七八成，但是试图讲给别人的时候，我觉得听众也许只是云里雾里听了个一两成吧。日后可能只能大概记了几个类名，WebSecurity, HttpSecurity之类。

这是无可奈何的事，因为解析走读源码本身就是一个需要亲力亲为的事，最好的方式就是自己在源码里顺着脉络点着前进后退反复看，看迷糊了网上查查别人的总结再理清思路从头看。要把源码说清楚，总不是那个味儿，如果顺着类图，时序图等说，又有点隔靴搔痒的感觉。

但不管怎么说，这毕竟是个很不错的尝试。


> P.S.
> 时序图和过滤器链图源于网络，如有侵犯版权，请联系我删除，谢谢！