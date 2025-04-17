<template>
    <g>
      <line
        :x1="fromPos.x"
        :y1="fromPos.y"
        :x2="toPos.x"
        :y2="toPos.y"
        stroke="black"
        stroke-width="2"
        class="relation-line"
        @click.stop="toggleDeleteButton"
      />
  
      <!-- Маркер FROM -->
      <g :transform="`translate(${fromPos.x}, ${fromPos.y})`">
        <component
          :is="getRelationSymbol(relation.fromType)"
          :angle="angle"
        />
      </g>
  
      <!-- Маркер TO -->
      <g :transform="`translate(${toPos.x}, ${toPos.y})`">
        <component
          :is="getRelationSymbol(relation.toType)"
          :angle="reverseAngle"
        />
      </g>
  
      <!-- Кнопка удаления -->
      <g v-if="selected">
        <rect
          :x="midPoint.x - 10"
          :y="midPoint.y - 10"
          width="20"
          height="20"
          fill="black"
          rx="5"
          cursor="pointer"
          @click.stop="store.removeRelation(index)"
        />
        <text
          :x="midPoint.x"
          :y="midPoint.y + 5"
          font-size="14"
          fill="white"
          text-anchor="middle"
          cursor="pointer"
          @click.stop="store.removeRelation(index)"
        >✖</text>
      </g>
    </g>
  </template>
  
  <script setup>
  import { computed, defineProps, defineEmits } from 'vue'
  import { useDiagramStore } from '@/store/DiagramStore'
  import ManyType from './relation_types/ManyType.vue'
  import OneType from './relation_types/OneType.vue'
  
  const props = defineProps({
    relation: Object,
    index: Number,
    selected: Boolean,
  })
  
  const emit = defineEmits(['toggle'])
  
  const store = useDiagramStore()
  
  const getAnchorPosition = (tableId, anchorName) => {
    const table = store.elements.find(e => e.id === tableId)
    const table1 = document.querySelector(`[data-id="${tableId}"]`);
    const tableRect = table1.getBoundingClientRect();
    if (!table) return { x: 0, y: 0 }

    const { x, y } = table
    //const width = 200 // или table.width, если он есть
    //const height = 40 + (columns?.length || 1) * 30 // примерно высота таблицы
    const width = tableRect.width;
    const height = tableRect.height;

    const anchorOffsets = {
      'top-left': { x: 0, y: 0 },
      'top-center': { x: width / 2, y: 0 },
      'top-right': { x: width, y: 0 },
      'right-center': { x: width, y: height / 2 },
      'bottom-right': { x: width, y: height },
      'bottom-center': { x: width / 2, y: height },
      'bottom-left': { x: 0, y: height },
      'left-center': { x: 0, y: height / 2 }
    }

    const offset = anchorOffsets[anchorName] || { x: 0, y: 0 }

    return {
      x: x + offset.x,
      y: y + offset.y
    }
}

  /*const getAnchorPosition = (tableId, anchorName) => {
    const table = document.querySelector(`[data-id="${tableId}"]`);
    const canvas = document.querySelector(".canvas");
    if (!table || !canvas) return { x: 0, y: 0 };
  
    const tableRect = table.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
  
    const width = tableRect.width;
    const height = tableRect.height;
  
    const anchorOffsets = {
      'top-left': { x: 0, y: 0 },
      'top-center': { x: width / 2, y: 0 },
      'top-right': { x: width, y: 0 },
      'right-center': { x: width, y: height / 2 },
      'bottom-right': { x: width, y: height },
      'bottom-center': { x: width / 2, y: height },
      'bottom-left': { x: 0, y: height },
      'left-center': { x: 0, y: height / 2 }
    };
  
    const offset = anchorOffsets[anchorName] || { x: 0, y: 0 };
  
    return {
      x: tableRect.left - canvasRect.left + offset.x,
      y: tableRect.top - canvasRect.top + offset.y
    };
  };*/
  
  const fromPos = computed(() =>
    getAnchorPosition(props.relation.from, props.relation.fromAnchor.name)
  )
  
  const toPos = computed(() =>
    getAnchorPosition(props.relation.to, props.relation.toAnchor.name)
  )
  
  const midPoint = computed(() => ({
    x: (fromPos.value.x + toPos.value.x) / 2,
    y: (fromPos.value.y + toPos.value.y) / 2,
  }))
  
  const angle = computed(() => Math.atan2(
    toPos.value.y - fromPos.value.y,
    toPos.value.x - fromPos.value.x
  ))
  
  const reverseAngle = computed(() => Math.atan2(
    fromPos.value.y - toPos.value.y,
    fromPos.value.x - toPos.value.x
  ))
  
  const getRelationSymbol = (type) => {
    switch (type) {
      case 'M': return ManyType;
      case '1': return OneType;
      default: return OneType;
    }
  }
  
  const toggleDeleteButton = () => {
    emit('toggle', props.index)
  }
  </script>
  
  <style scoped>
  .relation-line {
    cursor: pointer;
    transition: stroke 0.2s ease-in-out;
  }
  .relation-line:hover {
    stroke-width: 3;
  }
  </style>
  