/**
 * 模拟器布局系统
 * 提供统一的三段式布局：固定顶部状态栏 + 可滚动内容区 + 固定底部导航栏
 */
;(function() {
  'use strict';

  /**
   * 初始化模拟器布局
   * @param {Object} options 配置选项
   * @param {string} options.title - 页面标题
   * @param {string} options.titleIcon - 标题图标 (Font Awesome class)
   * @param {string} options.role - 角色类型: 'operator' | 'dispatcher' | 'director'
   * @param {string} options.activeNav - 当前激活的导航项: 'home' | 'tasks' | 'operate' | 'messages' | 'profile'
   * @param {HTMLElement|string} options.content - 内容元素或 HTML 字符串
   * @param {boolean} options.showStatusBar - 是否显示状态栏，默认 true
   * @param {boolean} options.showBottomNav - 是否显示底部导航栏，默认 true
   */
  window.initSimulatorLayout = function(options) {
    options = options || {};
    
    const title = options.title || '页面';
    const titleIcon = options.titleIcon || 'fas fa-home';
    const role = options.role || 'operator';
    const activeNav = options.activeNav || 'home';
    const showStatusBar = options.showStatusBar !== false;
    const showBottomNav = options.showBottomNav !== false;

    // 查找或创建容器
    let container = document.querySelector('.iphone-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'iphone-container';
      document.body.appendChild(container);
    }

    // 清空容器
    container.innerHTML = '';

    // 创建屏幕
    const screen = document.createElement('div');
    screen.className = 'screen';

    // 动态岛
    const island = document.createElement('div');
    island.className = 'dynamic-island';
    screen.appendChild(island);

    // 固定顶部状态栏
    if (showStatusBar) {
      const statusBar = document.createElement('div');
      statusBar.className = 'status-bar px-6 flex justify-between items-center';
      statusBar.innerHTML = `
        <div class="flex items-center space-x-2">
          <i class="${titleIcon} text-indigo-600"></i>
          <span class="text-sm font-semibold text-gray-800">${title}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-600">9:41</span>
          <div class="flex items-center space-x-1">
            <i class="fas fa-signal text-xs text-gray-600"></i>
            <i class="fas fa-wifi text-xs text-gray-600"></i>
            <i class="fas fa-battery-full text-xs text-gray-600"></i>
          </div>
        </div>
      `;
      screen.appendChild(statusBar);
    }

    // 可滚动内容区
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';
    contentArea.id = 'mainContent';
    
    if (options.content) {
      if (typeof options.content === 'string') {
        contentArea.innerHTML = options.content;
      } else if (options.content instanceof HTMLElement) {
        contentArea.appendChild(options.content);
      }
    }
    screen.appendChild(contentArea);

    // 固定底部导航栏区域
    if (showBottomNav) {
      const bottomNavArea = document.createElement('div');
      bottomNavArea.className = 'bottom-nav-area';
      bottomNavArea.id = 'bottomNavContainer';
      screen.appendChild(bottomNavArea);
    }

    container.appendChild(screen);

    // 挂载底部导航栏
    if (showBottomNav) {
      if (role === 'operator' && window.operatorNavbarMount) {
        window.operatorNavbarMount(activeNav);
      } else if (role === 'dispatcher' && window.dispatcherNavbarMount) {
        window.dispatcherNavbarMount(activeNav);
      } else if (role === 'director' && window.directorNavbarMount) {
        window.directorNavbarMount(activeNav);
      }
    }

    return {
      container: container,
      screen: screen,
      contentArea: contentArea
    };
  };

  /**
   * 获取内容区域元素
   * @returns {HTMLElement}
   */
  window.getContentArea = function() {
    return document.getElementById('mainContent');
  };

  /**
   * 设置内容区域的 HTML
   * @param {string|HTMLElement} content
   */
  window.setContent = function(content) {
    const contentArea = getContentArea();
    if (!contentArea) return;
    
    if (typeof content === 'string') {
      contentArea.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      contentArea.innerHTML = '';
      contentArea.appendChild(content);
    }
  };

  /**
   * 向内容区域追加内容
   * @param {string|HTMLElement} content
   */
  window.appendContent = function(content) {
    const contentArea = getContentArea();
    if (!contentArea) return;
    
    if (typeof content === 'string') {
      const temp = document.createElement('div');
      temp.innerHTML = content;
      while (temp.firstChild) {
        contentArea.appendChild(temp.firstChild);
      }
    } else if (content instanceof HTMLElement) {
      contentArea.appendChild(content);
    }
  };

  /**
   * 添加通用样式
   * 如果页面已有这些样式，则不重复添加
   */
  window.injectSimulatorStyles = function() {
    // 检查是否已注入
    if (document.getElementById('simulator-layout-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'simulator-layout-styles';
    style.textContent = `
      :root {
        --ui-primary: #6366f1;
        --ui-primary-hover: #4f46e5;
        --ui-secondary: #22c55e;
        --ui-secondary-hover: #16a34a;
        --ui-dark: #111827;
        --ui-dark-hover: #000000;
        --ui-card-bg: rgba(255, 255, 255, 0.95);
        --ui-card-border: rgba(229, 231, 235, 0.8);
      }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        background: linear-gradient(135deg, #6366f1 0%, #22c55e 100%); 
        min-height: 100vh;
        margin: 0;
        padding: 0;
      }
      .iphone-container { 
        width: 393px; 
        height: 852px; 
        margin: 0 auto; 
        background: #000; 
        border-radius: 47px; 
        padding: 10px; 
        position: relative; 
        overflow: hidden; 
      }
      .screen { 
        width: 100%; 
        height: 100%; 
        background: #fff; 
        border-radius: 37px; 
        overflow: hidden; 
        position: relative; 
        display: flex; 
        flex-direction: column; 
      }
      .dynamic-island { 
        position: absolute; 
        top: 10px; 
        left: 50%; 
        transform: translateX(-50%); 
        width: 126px; 
        height: 30px; 
        background: #000; 
        border-radius: 20px; 
        z-index: 100; 
      }
      .status-bar { 
        background: rgba(255, 255, 255, 0.95); 
        backdrop-filter: blur(10px); 
        padding-top: 50px; 
        padding-bottom: 10px; 
        flex-shrink: 0; 
      }
      .content-area { 
        flex: 1; 
        overflow-y: auto; 
        overflow-x: hidden;
      }
      .bottom-nav-area { 
        flex-shrink: 0; 
        height: 52px; 
      }
      .card { 
        background: var(--ui-card-bg); 
        backdrop-filter: blur(10px); 
        border: 1px solid var(--ui-card-border); 
      }
      .btn-primary { 
        background: linear-gradient(135deg, var(--ui-primary) 0%, var(--ui-secondary) 100%); 
        transition: all .3s ease; 
      }
      .btn-primary:hover { 
        transform: translateY(-2px); 
        box-shadow: 0 10px 20px rgba(99, 102, 241, .3); 
      }
      /* Common UI components */
      .ui-btn { 
        display: inline-flex; 
        align-items: center; 
        justify-content: center; 
        border-radius: 0.5rem; 
        padding: 0.5rem 0.75rem; 
        font-size: 0.875rem; 
        transition: all .2s ease; 
      }
      .ui-btn-primary { 
        background: var(--ui-primary); 
        color: #fff; 
      }
      .ui-btn-primary:hover { 
        background: var(--ui-primary-hover); 
      }
      .ui-btn-secondary { 
        background: var(--ui-secondary); 
        color: #fff; 
      }
      .ui-btn-secondary:hover { 
        background: var(--ui-secondary-hover); 
      }
      .ui-btn-dark { 
        background: var(--ui-dark); 
        color: #fff; 
      }
      .ui-btn-dark:hover { 
        background: var(--ui-dark-hover); 
      }
      .ui-quick { 
        border-radius: 1rem; 
        padding: 1rem; 
        text-align: left; 
        box-shadow: 0 2px 6px rgba(0,0,0,.05); 
      }
      .ui-quick .title { 
        font-weight: 600; 
        margin-bottom: 0.5rem; 
      }
      .ui-quick .desc { 
        font-size: 0.75rem; 
        opacity: .9; 
      }
      .ui-quick-primary { 
        background: linear-gradient(135deg, var(--ui-primary) 0%, var(--ui-secondary) 100%);
        color: #fff;
      }
      .ui-quick-indigo { 
        background: var(--ui-primary);
        color: #fff;
      }
      .ui-quick-dark { 
        background: var(--ui-dark);
        color: #fff;
      }
      .badge { 
        display: inline-block; 
        padding: 2px 8px; 
        border-radius: 999px; 
        font-size: 12px; 
      }
      .badge-green { background: #dcfce7; color: #16a34a; }
      .badge-indigo { background: #e0e7ff; color: #4f46e5; }
      .badge-gray { background: #f3f4f6; color: #374151; }
      .ui-list { 
        background: #f9fafb; 
        border-radius: 0.75rem; 
        padding: 0.75rem; 
      }
      .ui-list-item { 
        display: flex; 
        align-items: center; 
        justify-content: space-between; 
        padding: 0.5rem 0; 
        border-bottom: 1px solid #e5e7eb; 
      }
      .ui-list-item:last-child { border-bottom: none; }
      .tab-btn {
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        background: #f3f4f6;
      }
      .tab-active {
        background: #e0e7ff;
        color: #4f46e5;
      }
    `;
    document.head.appendChild(style);
  };

  // 自动注入样式（如果在浏览器环境中）
  if (typeof document !== 'undefined' && document.readyState !== 'loading') {
    window.injectSimulatorStyles();
  } else if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', window.injectSimulatorStyles);
  }
})();
