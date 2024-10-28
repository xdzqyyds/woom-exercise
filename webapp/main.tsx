// React入口文件
import React from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'    // 导入样式页面，会覆盖APP组件
import 'virtual:uno.css'
import App from './app'
import { DevTools } from 'jotai-devtools'

import '@unocss/reset/tailwind-compat.css'

// 获取根节点，即获取 index.html 中的<div id="root"></div>这个元素
//此元素就是 React 应用的挂载点，React 会将整个应用渲染到这个 div 元素中
//container 变量存储了这个 div 元素的引用，后续代码会用它来指定 React 应用的挂载位置
const container = document.getElementById('root')

// 在 container 中创建一个 抽象的 React 根节点，用于渲染 React 应用 
//本质与container一样，但使用的是最新的渲染机制
const root = createRoot(container!)

// 在根节点处渲染组件    <DevTools />  和    <App />
root.render(
  <React.StrictMode>
    <DevTools />
    <App />
  </React.StrictMode>,
)