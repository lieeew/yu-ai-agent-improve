<template>
  <div class="agent-message-content">
    <template v-for="(seg, idx) in segments" :key="idx">
      <CollapsiblePanel v-if="seg.kind === 'think'" title="思考过程">
        <MarkdownRender :source="seg.value" />
      </CollapsiblePanel>
      <div
        v-else-if="seg.kind === 'act' && isActShort(seg.value)"
        class="act-result-inline"
      >
        <div class="act-result-inline__label">工具执行结果</div>
        <div class="act-result-inline__body">
          <MarkdownRender :source="seg.value" />
        </div>
      </div>
      <CollapsiblePanel v-else-if="seg.kind === 'act'" title="工具执行结果">
        <MarkdownRender :source="seg.value" />
      </CollapsiblePanel>
      <CollapsiblePanel v-else-if="seg.kind === 'json'" title="JSON">
        <pre class="json-pre">{{ formatJson(seg.value) }}</pre>
      </CollapsiblePanel>
      <MarkdownRender v-else :source="seg.value" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { parseAgentMessage } from '../utils/parseAgentMessage.js'
import CollapsiblePanel from './CollapsiblePanel.vue'
import MarkdownRender from './MarkdownRender.vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const segments = computed(() => parseAgentMessage(props.content))

/** 工具结果少于此码点数（字）时默认展开，不折叠 */
const ACT_INLINE_CHAR_THRESHOLD = 400

function charCount(s) {
  return Array.from(s ?? '').length
}

function isActShort(s) {
  return charCount(s) < ACT_INLINE_CHAR_THRESHOLD
}

function formatJson(raw) {
  if (raw == null || raw === '') return ''
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}
</script>

<style scoped>
.agent-message-content {
  white-space: normal;
}

.act-result-inline {
  margin: 0.5em 0;
  border: 1px solid #d0d4dc;
  border-radius: 8px;
  background: #fafbfc;
  overflow: hidden;
}

.act-result-inline__label {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #eceef2;
}

.act-result-inline__body {
  padding: 8px 12px 12px;
}

.json-pre {
  margin: 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.45;
  overflow-x: auto;
  white-space: pre;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
