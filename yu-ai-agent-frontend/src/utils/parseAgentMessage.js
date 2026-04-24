import {
  YUAI_ACT_END,
  YUAI_ACT_START,
  YUAI_THINK_END,
  YUAI_THINK_START,
} from '../constants/agentTags.js'

/** @typedef {{ kind: 'think'|'act'|'text'|'json', value: string }} MessageSegment */

/**
 * 从文本中拆分 ```json ... ``` 围栏（语言标识大小写不敏感）。
 * 未闭合围栏时整段作为 text 原样保留，避免 SSE 流式截断丢字。
 * @param {string} text
 * @returns {MessageSegment[]}
 */
export function splitJsonFences(text) {
  if (!text) return [{ kind: 'text', value: '' }]
  const parts = /** @type {MessageSegment[]} */ ([])
  const re = /```\s*json\s*\n?([\s\S]*?)```/gi
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ kind: 'text', value: text.slice(last, m.index) })
    }
    parts.push({ kind: 'json', value: (m[1] ?? '').trim() })
    last = re.lastIndex
  }
  if (last < text.length) {
    parts.push({ kind: 'text', value: text.slice(last) })
  }
  return parts.length ? parts : [{ kind: 'text', value: text }]
}

/**
 * 按顺序解析 yuai_think / yuai_act；未闭合标签时后缀整段作为 text。
 * @param {string} input
 * @returns {MessageSegment[]}
 */
export function parseThinkActBlocks(input) {
  if (input == null || input === '') {
    return [{ kind: 'text', value: '' }]
  }
  /** @type {MessageSegment[]} */
  const out = []
  let i = 0
  while (i < input.length) {
    const tStart = input.indexOf(YUAI_THINK_START, i)
    const aStart = input.indexOf(YUAI_ACT_START, i)
    let next = -1
    /** @type {'think'|'act'|null} */
    let which = null
    if (tStart >= 0 && (aStart < 0 || tStart <= aStart)) {
      next = tStart
      which = 'think'
    } else if (aStart >= 0) {
      next = aStart
      which = 'act'
    }
    if (next < 0) {
      if (i < input.length) {
        out.push({ kind: 'text', value: input.slice(i) })
      }
      break
    }
    if (next > i) {
      out.push({ kind: 'text', value: input.slice(i, next) })
    }
    const open = which === 'think' ? YUAI_THINK_START : YUAI_ACT_START
    const close = which === 'think' ? YUAI_THINK_END : YUAI_ACT_END
    const innerStart = next + open.length
    const closeIdx = input.indexOf(close, innerStart)
    if (closeIdx < 0) {
      out.push({ kind: 'text', value: input.slice(next) })
      break
    }
    out.push({ kind: which, value: input.slice(innerStart, closeIdx) })
    i = closeIdx + close.length
  }
  return out
}

/**
 * think/act 块 + 正文中的 json 围栏
 * @param {string} input
 * @returns {MessageSegment[]}
 */
export function parseAgentMessage(input) {
  const blocks = parseThinkActBlocks(input ?? '')
  /** @type {MessageSegment[]} */
  const flat = []
  for (const b of blocks) {
    if (b.kind === 'think' || b.kind === 'act') {
      flat.push(b)
    } else {
      const sub = splitJsonFences(b.value)
      for (const s of sub) {
        if (s.kind === 'text' && s.value === '') continue
        flat.push(s)
      }
    }
  }
  if (flat.length === 0) {
    return [{ kind: 'text', value: '' }]
  }
  return flat
}
