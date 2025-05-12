<template>
    <div v-if="props.isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="scrollable-content">
          <pre class="sql-output">{{ store.sqlCode }}</pre>
        </div>
        <button @click="copyToClipboard" class="copy-btn">
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" stroke-width="2" />
          </svg>
          {{ copied ? "Скопировано" : "Копировать" }}
        </button>
        <button @click="closeModal" class="close-btn">Закрыть</button>
      </div>
    </div>
  </template>
  
  <script setup>
    import { defineProps, defineEmits, ref } from "vue";
    import { useDiagramStore } from "@/store/DiagramStore"

    const copied = ref(false);

    const store = useDiagramStore()
    const props = defineProps({
      isOpen: Boolean
    });

    const emit = defineEmits(["close"]);

    const closeModal = () => {
      emit("close");
    };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(store.sqlCode);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000); // скрыть через 2 секунды
      } catch (err) {
        console.error("Ошибка при копировании:", err);
      }
    };

</script>
  
<style lang="scss">

.sql-output {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.scrollable-content {
  max-height: 300px; /* задаёт высоту области с прокруткой */
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
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
    background: rgb(0, 0, 0);
    color: white;
    cursor: pointer;
    border-radius: 5px;
  }

  .close-btn:hover {
    background: rgb(62, 62, 62);
  }

  .copy-notification {
    background: #4caf50;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    text-align: center;
    animation: fadeInOut 2s ease-out;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-5px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; }
    100% { opacity: 0; transform: translateY(-5px); }
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-right: 10px;
    padding: 5px 10px;
    border: none;
    background: #5d5d5d;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    transition: background 0.2s;
  }
  
  .copy-btn:hover {
    background: #c2c2c2;
  }
  
  .copy-btn .icon {
    width: 16px;
    height: 16px;
  }




  </style>
  