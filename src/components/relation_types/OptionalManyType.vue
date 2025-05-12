<template>
  <g :transform="`rotate(${angleInDegrees})`">
    <circle r="5" cy="-18" fill="white" stroke="black" stroke-width="2" />
    <line x1="10" y1="0" x2="0" y2="-10" stroke="black" stroke-width="2" />
    <line x1="0" y1="-10" x2="-10" y2="0" stroke="black" stroke-width="2" />
  </g>
</template>
<script setup>
  import { computed, defineProps } from 'vue';

  const props = defineProps({
    angle: Number,
  });

  const angleInDegrees = computed(() => props.angle * 180 / Math.PI + 90);
</script>