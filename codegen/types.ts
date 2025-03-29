import type { DesignComponent, SupportedLang } from '@/shared/types'

export interface SerializeOptions {
  useRem: boolean
  rootFontSize: number
  scale: number
  project: string
}

export interface RequestPayload {
  style: Record<string, string>
  component?: DesignComponent
  options: SerializeOptions
  pluginCode?: string
}

export interface ResponsePayload {
  pluginName?: string
  codeBlocks: CodeBlock[]
}

export type CodeBlock = {
  name: string
  title: string
  code: string
  lang: SupportedLang
}
