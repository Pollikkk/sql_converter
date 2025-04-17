<template>
  <g :transform="`rotate(${angleInDegrees})`">
    <line x1="-6" y1="12" x2="6" y2="12" stroke="black" stroke-width="2" />
    <line x1="-6" y1="-12" x2="6" y2="-12" stroke="black" stroke-width="2" />
  </g>
</template>

<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  angle: Number,
});

const angleInDegrees = computed(() => props.angle * 180 / Math.PI + 90);
</script>

<style>

</style>
