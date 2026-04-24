<template>
  <details class="collapsible-panel">
    <summary class="collapsible-panel__summary">{{ title }}</summary>
    <div class="collapsible-panel__body">
      <slot />
    </div>
  </details>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.collapsible-panel {
  margin: 0.5em 0;
  border: 1px solid #d0d4dc;
  border-radius: 8px;
  background: #fafbfc;
  overflow: hidden;
}

.collapsible-panel__summary {
  cursor: pointer;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  list-style: none;
  user-select: none;
}

.collapsible-panel__summary::-webkit-details-marker {
  display: none;
}

.collapsible-panel__summary::before {
  content: '▸ ';
  display: inline-block;
  transition: transform 0.15s ease;
}

.collapsible-panel[open] .collapsible-panel__summary::before {
  transform: rotate(90deg);
}

.collapsible-panel__body {
  padding: 0 12px 12px;
  border-top: 1px solid #eceef2;
}
</style>
