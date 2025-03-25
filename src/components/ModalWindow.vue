<template>
    <div v-if="props.isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <pre class="sql-output">{{ store.sqlCode }}</pre>
        <button @click="closeModal" class="close-btn">Закрыть</button>
      </div>
    </div>
  </template>
  
  <script setup>
    import { defineProps, defineEmits } from "vue";
    import { useDiagramStore } from "@/store/DiagramStore"

    const store = useDiagramStore()
    const props = defineProps({
      isOpen: Boolean
    });
    const emit = defineEmits(["close"]);

    const closeModal = () => {
      emit("close");
    };
</script>
  
  <style scoped>
  .sql-output {
    white-space: pre-line; /* Это сохранит переносы строк и пробелы */
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    width: 80%;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    min-width: 300px;
  }
  
  .close-btn {
    margin-top: 10px;
    padding: 5px 10px;
    border: none;
    background: red;
    color: white;
    cursor: pointer;
    border-radius: 5px;
  }
  </style>
  