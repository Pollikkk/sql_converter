<template>
  <g>
    <line
      :x1="fromCenter.x"
      :y1="fromCenter.y"
      :x2="toCenter.x"
      :y2="toCenter.y"
      stroke="gray"
      stroke-width="2"
    />

    <polygon
      v-if="showArrow"
      :points="arrowPoints"
      fill="gray"
    />
  </g>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { useDiagramStore } from '@/store/DiagramStore'

const props = defineProps({
  fromId: String,
  toId: String,
  showArrow: { type: Boolean, default: true }
})

const store = useDiagramStore()

const getToElementCenter = (id) => {
  const el = store.elements.find(e => e.id === id)
  const domEl = document.querySelector(`[data-id="${id}"]`)
  if (!el || !domEl) return { x: 0, y: 0 }

  const rect = domEl.getBoundingClientRect()
  return {
    x: el.x + rect.width / 2,
    y: el.y
  }
}

const getFromElementCenter = (id) => {
  const el = store.elements.find(e => e.id === id)
  const domEl = document.querySelector(`[data-id="${id}"]`)
  if (!el || !domEl) return { x: 0, y: 0 }

  const rect = domEl.getBoundingClientRect()
  return {
    x: el.x + rect.width / 2,
    y: el.y + rect.height
  }
}

const fromCenter = computed(() => getFromElementCenter(props.fromId))
const toCenter = computed(() => getToElementCenter(props.toId))

const arrowPoints = computed(() => {
  const angle = Math.atan2(
    fromCenter.value.y - toCenter.value.y,
    fromCenter.value.x - toCenter.value.x
  )
  const length = 10
  const tipX = toCenter.value.x
  const tipY = toCenter.value.y
  const leftX = tipX + length * Math.cos(angle + Math.PI / 6)
  const leftY = tipY + length * Math.sin(angle + Math.PI / 6)
  const rightX = tipX + length * Math.cos(angle - Math.PI / 6)
  const rightY = tipY + length * Math.sin(angle - Math.PI / 6)

  return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`
})
</script>
