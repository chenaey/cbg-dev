import type { CodeBlock, ResponsePayload, SerializeOptions } from '@/codegen/types'
import type { DesignComponent, Plugin } from '@/shared/types'

// 直接导入代码生成所需的工具和插件
import defaultPlugin from '@/plugins/default'
import { serializeComponent } from '@/utils/component'
import { serializeCSS } from '@/utils/css'

/**
 * 生成代码块
 * 该函数取代了原来使用Worker的实现，直接在主线程中执行代码生成逻辑
 */
export async function codegen(
  style: Record<string, string>,
  component: DesignComponent | null,
  options: SerializeOptions,
  pluginCode?: string
): Promise<ResponsePayload> {
  try {
    
    const plugin: Plugin = defaultPlugin
    
    // 从插件配置中提取各类输出选项
    const {
      component: componentOptions,
      css: cssOptions,
      js: jsOptions,
      ...otherOptions
    } = plugin?.code ?? {}
    
    // 存储所有生成的代码块
    const codeBlocks: CodeBlock[] = []
    
    // 处理组件代码
    if (componentOptions && component) {
      const { lang, transformComponent } = componentOptions
      const componentCode = serializeComponent(component, { lang }, { transformComponent })
      if (componentCode) {
        codeBlocks.push({
          name: 'component',
          title: componentOptions?.title ?? 'Component',
          lang: componentOptions?.lang ?? 'jsx',
          code: componentCode
        })
      }
    }

    // 处理CSS代码
    if (cssOptions !== false) {
      const cssCode = serializeCSS(style, options, cssOptions)
      if (cssCode) {
        codeBlocks.push({
          name: 'css',
          title: cssOptions?.title ?? 'CSS',
          lang: cssOptions?.lang ?? 'css',
          code: cssCode
        })
      }
    }

    // 处理JavaScript代码
    if (jsOptions !== false) {
      const jsCode = serializeCSS(style, { ...options, toJS: true }, jsOptions)
      if (jsCode) {
        codeBlocks.push({
          name: 'js',
          title: jsOptions?.title ?? 'JavaScript',
          lang: jsOptions?.lang ?? 'js',
          code: jsCode
        })
      }
    }

    // 处理其他代码格式
    if (Object.keys(otherOptions).length > 0) {
      const extraBlocks = Object.keys(otherOptions)
        .map((name) => {
          const extraOptions = otherOptions[name]
          if (extraOptions === false) {
            return null
          }

          const code = serializeCSS(style, options, extraOptions)
          if (!code) {
            return null
          }
          return {
            name,
            title: extraOptions.title ?? name,
            lang: extraOptions.lang ?? 'css',
            code
          }
        })
        .filter((item): item is CodeBlock => item != null)
      
      codeBlocks.push(...extraBlocks)
    }
    return { codeBlocks, pluginName: plugin?.name }
  } catch (error) {
    console.error('代码生成过程中出错:', error)
    return { codeBlocks: [], pluginName: 'error' }
  }
}
