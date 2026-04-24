<template>
  <div class="md-render" v-html="safeHtml" />
</template>

<script setup>
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = defineProps({
  source: {
    type: String,
    default: '',
  },
})

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

const safeHtml = computed(() => {
  const raw = md.render(props.source ?? '')
  return DOMPurify.sanitize(raw)
})
</script>

<style scoped>
.md-render {
  font-size: 15px;
  line-height: 1.55;
  word-break: break-word;
  white-space: normal;
}

.md-render :deep(p) {
  margin: 0.4em 0;
}

.md-render :deep(p:first-child) {
  margin-top: 0;
}

.md-render :deep(p:last-child) {
  margin-bottom: 0;
}

.md-render :deep(ul),
.md-render :deep(ol) {
  margin: 0.35em 0;
  padding-left: 1.35em;
}

.md-render :deep(pre) {
  margin: 0.5em 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: #1e293b;
  color: #e2e8f0;
  overflow-x: auto;
  font-size: 13px;
}

.md-render :deep(code) {
  padding: 0.15em 0.35em;
  border-radius: 4px;
  background: #eef2f7;
  font-size: 0.9em;
}

.md-render :deep(pre code) {
  padding: 0;
  background: transparent;
  color: inherit;
}

.md-render :deep(a) {
  color: #2563eb;
}
</style>
