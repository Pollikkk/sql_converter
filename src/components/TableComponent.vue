<template>
    <div
      class="element"
      :class="{ selected: store.selectedElements.includes(element.id) }"
      :style="{
        left: element.x + 'px',
        top: element.y + 'px',
        cursor: dragging ? 'grabbing' : 'grab'
      }"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
      @mousedown="startDrag"
      @click.stop="store.selectElement(element.id)"
    >
      <div class="table-header">
        <input v-model="localName" class="table-title" />
        <button class="delete-btn" @click.stop="store.removeElement(element.id)">🗑</button>
      </div>
  
      <table class="table-content">
        <tr>
          <th></th>
          <th>PK</th>
          <th>Name</th>
          <th>Type</th>
        </tr>
        <tr v-for="(col, index) in element.columns" :key="index">
          <button class="delete-column" @click.stop="store.removeColumn(element.id, col.id)">🗑</button>
          <span v-if="col.isPK">🔑</span>
          <span v-else-if="col.isFK">🔗</span>
          <td><input type="checkbox" v-model="col.isPK" /></td>
          <td><input v-model="col.name" class="column-input" /></td>
          <td>
            <select v-model="col.type" class="type-select">
              <option value="INT">INT</option>
              <option value="VARCHAR(255)">VARCHAR(255)</option>
              <option value="TEXT">TEXT</option>
              <option value="BOOLEAN">BOOLEAN</option>
              <option value="DATE">DATE</option>
              <option value="FLOAT">FLOAT</option>
            </select>
          </td>
        </tr>
      </table>
  
      <button class="add-column-button" @click.stop="store.addColumn(element.id)">+</button>
  
      <!-- Anchor-точки -->
      <template v-if="store.isAddingRelation && hovered">
        <div
          v-for="anchor in anchors"
          :key="anchor.name"
          class="anchor-point"
          :style="{ left: anchor.x + 'px', top: anchor.y + 'px' }"
          @click.stop="handleAnchorClick(element.id, anchor)"
        />
      </template>
    </div>
  </template>
  
  <script setup>
    import { ref, watch, computed, defineProps, defineEmits } from 'vue'
    import { useDiagramStore } from '@/store/DiagramStore'

    // Получаем props
    const props = defineProps(['element'])

    // Регистрируем события
    const emit = defineEmits(['update-name', 'drag-start'])

    // Состояние
    const store = useDiagramStore()
    const localName = ref(props.element.name)

    watch(localName, (newVal) => {
      emit('update-name', props.element.id, newVal)
    })

    const hovered = ref(false)
    const dragging = ref(false)

    const startDrag = (event) => {
      dragging.value = true
      emit('drag-start', props.element.id, event)
    }

    const anchors = computed(() => {
      const tableEl = document.querySelector(`[data-id="${props.element.id}"]`)
      if (!tableEl) return []
      const rect = tableEl.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      return [
        { name: 'top-left', x: 0, y: 0 },
        { name: 'top-center', x: width / 2, y: 0 },
        { name: 'top-right', x: width, y: 0 },
        { name: 'right-center', x: width, y: height / 2 },
        { name: 'bottom-right', x: width, y: height },
        { name: 'bottom-center', x: width / 2, y: height },
        { name: 'bottom-left', x: 0, y: height },
        { name: 'left-center', x: 0, y: height / 2 }
      ]
    })

    const handleAnchorClick = (tableId, anchor) => {
      if (!store.relationStart) {
        store.startRelation(tableId, anchor)
      } else {
        store.finishRelation(tableId, anchor)
      }
    }
  </script>
  