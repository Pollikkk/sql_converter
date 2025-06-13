<template>
  <div class="upperButtons">
    <button @click="showSaveModal = true"><img src="../assets/buttons/save.svg" alt="Icon" width="30px" height="30px" /></button>
    <button @click="showAllSchemasModal = true"><img src="../assets/buttons/folder.svg" alt="Icon" width="30px" height="30px" /></button>
  </div>
  <SaveSchemaModal v-if="showSaveModal"  @close="showSaveModal = false" />
  <MySchemasModal v-if="showAllSchemasModal" @close="showAllSchemasModal = false" />
  <div class="canvas">
    <div class="canvas-content" @click="clearSelection" @mousemove="move" @mouseup="drop">
    <div
      v-for="element in store.elements"
      :key="element.id"
      :data-testid="'element-id'"
      :data-id="element.id"
      class="element"
      :class="{ selected: store.selectedElements.includes(element.id) }"
      :style="{
        left: element.x + 'px',
        top: element.y + 'px',
        cursor: draggingElementId === element.id ? 'grabbing' : 'grab'
      }"
      @mouseenter="hoveredTableId = element.id"
      @mouseleave="hoveredTableId = null"
      @mousedown="drag($event, element.id)"
      @click.stop="store.selectElement(element.id)"
    >
    <!-- ТАБЛИЦА -->
    <div>
      <div class="table-header">
        <input v-model="element.name" class="table-title" />
        <button class="delete-btn" @click.stop="store.removeElement(element.id)"><img src="../assets/buttons/trash.svg" alt="Icon" width="20px" height="20px" /></button>
      </div>
      <table class="table-content">
        <tr>
          <th></th>
          <th>PK</th>
          <th>Name</th>
          <th>Type</th>
        </tr>
        <tr v-for="(col, index) in element.columns" :key="index">
          <button class="delete-column" @click.stop="store.removeColumn(element.id, col.id)"><img src="../assets/buttons/trash.svg" alt="Icon" width="15px" height="15px" /></button>
          <span v-if="col.isPK">🔑</span>
          <span v-if="col.isFK">🔗</span>
          <td><input type="checkbox" v-model="col.isPK" /></td>
          <td><input v-model="col.name" class="column-input" /></td>
          <td>
            <select v-model="col.type" class="type-select">
              <option value="INT">INT</option>
              <option value="VARCHAR(256)">VARCHAR(256)</option>
              <option value="TEXT">TEXT</option>
              <option value="BOOLEAN">BOOLEAN</option>
              <option value="DATE">DATE</option>
              <option value="FLOAT">FLOAT</option>
            </select>
          </td>
        </tr>
      </table>
      <button class="add-column-button" @click.stop="store.addColumn(element.id)">+</button>

      <button class="add-table-button" v-if="element.type == 'parentTable'" @click.stop="store.addTableToCompositeElement(element.id, element.x, element.y)"><img src="../assets/buttons/table_add.svg" alt="Icon" width="30px" height="30px" /></button>

      <!-- Anchor-точки -->
      <template v-if="store.isAddingRelation && hoveredTableId === element.id">
        <div
          v-for="anchor in getAnchors(element)"
          :key="anchor.name"
          class="anchor-point"
          :style="{
            left: anchor.x + 'px',
            top: anchor.y + 'px'
          }"
          @click.stop="handleAnchorClick(element.id, anchor)"
        />
      </template>
  </div>
</div>
<!-- Рисуем связи -->
    <svg class="relations">
      <RelationLine
        v-for="(relation, index) in store.standardRelations"
        :key="index"
        :relation="relation"
        :index="index"
        :selected="selectedRelationId === index"
        @toggle="toggleDeleteButton"
      />
      <InheritanceLine
        v-for="(relation, index) in store.inheritanceRelations"
        :key="'inh-' + index"
        :from-id="relation.from"
        :to-id="relation.to"
      />
    </svg>
  </div>
  </div>
</template>

<script setup>
  import { ref, watchEffect, onMounted } from "vue";
  import { useDiagramStore } from "@/store/DiagramStore";

  import RelationLine from  "./RelationLine.vue";
  import InheritanceLine from "./InheritanceLine.vue";
  import MySchemasModal from './MySchemasModal.vue' 
  import SaveSchemaModal from "./SaveSchemaModal.vue";
  
  const showSaveModal = ref(false)
  const showAllSchemasModal = ref(false);

  const store = useDiagramStore();
  const draggingElementId = ref(null);
  const dragOffset = ref({ x: 0, y: 0 });
  const selectedRelationId  = ref(null);

  const canvasRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    const canvas = canvasRef.value;
    if (canvas) {
      const contentWidth = 3000; // ширина canvas-content
      const contentHeight = 3000; // высота canvas-content
      const viewWidth = canvas.clientWidth;
      const viewHeight = canvas.clientHeight;

      canvas.scrollLeft = (contentWidth - viewWidth) / 2;
      canvas.scrollTop = (contentHeight - viewHeight) / 2;
    }
  });

  watchEffect(() => {
    //следим за размерами текущей схемы и расширяем канву
    const padding = 300; // отступ, чтобы было не впритык

    const maxX = Math.max(...store.elements.map(e => e.x + 200), 1000) + padding;
    const maxY = Math.max(...store.elements.map(e => e.y + 100), 1000) + padding;
    
    const canvasContent = document.querySelector(".canvas-content");
    if (canvasContent) {
      canvasContent.style.width = maxX + "px";
      canvasContent.style.height = maxY + "px";
    }

    //Следим за добавлением новых связей -> внешних ключей
    store.relations.forEach(relation => {
      const fromTable = store.elements.find(t => t.id === relation.from);
      const toTable = store.elements.find(t => t.id === relation.to);
      if (!fromTable || !toTable) return;

      const fromPK = Array.isArray(fromTable.columns)
        ? fromTable.columns.find(c => c.isPK)
        : null;
      const toPK = Array.isArray(toTable.columns)
        ? toTable.columns.find(c => c.isPK)
        : null;

      if (fromPK && Array.isArray(toTable.columns)) {
        toTable.columns.forEach(col => {
          if (col.isFK && col.references?.tableId === fromTable.id) {
            col.references.columnId = fromPK.id;
            col.name = `${fromTable.name.toLowerCase()}_${fromPK.name}_fk`;
          }
        });
      }

      if (toPK && Array.isArray(fromTable.columns)) {
        fromTable.columns.forEach(col => {
          if (col.isFK && col.references?.tableId === toTable.id) {
            col.references.columnId = toPK.id;
            col.name = `${toTable.name.toLowerCase()}_${toPK.name}_fk`;
          }
        });
      }
    });
  });



  const drag = (event, id) => {
    const element = store.elements.find(e => e.id === id);
    if (!element) return;

    draggingElementId.value = id;
    dragOffset.value = {
      x: event.clientX - element.x,
      y: event.clientY - element.y,
    };
  };

  const move = (event) => {
    if (draggingElementId.value === null) return;

    const newX = event.clientX - dragOffset.value.x;
    const newY = event.clientY - dragOffset.value.y;

    store.updatePosition(draggingElementId.value, newX, newY);
  };


  const drop = () => {
    draggingElementId.value = null;
  };

  // Функция выбора/отмены кнопки удаления связи
  const toggleDeleteButton = (index) => {
    selectedRelationId.value = selectedRelationId.value === index ? null : index;
  };


  // Функция для сброса выделения таблиц
  const clearSelection = () => {
    selectedRelationId.value = null;
    store.selectedElements = [];
  };

  const hoveredTableId = ref(null);

  const getAnchors = (element) => {
    const tableEl = document.querySelector(`[data-id="${element.id}"]`);
    if (!tableEl) return [];

    const rect = tableEl.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    return [
      { name: 'top-left', x: 0, y: 0 },
      { name: 'top-center', x: width / 2, y: 0 },
      { name: 'top-right', x: width, y: 0 },
      { name: 'right-center', x: width, y: height / 2 },
      { name: 'bottom-right', x: width, y: height },
      { name: 'bottom-center', x: width / 2, y: height },
      { name: 'bottom-left', x: 0, y: height },
      { name: 'left-center', x: 0, y: height / 2 }
    ];
  };

  const handleAnchorClick = (tableId, anchor) => {
    console.log("Clicked anchor:", { tableId, anchor });
    if (!store.relationStart) {
      console.log("Start relation");
      store.startRelation(tableId, anchor);
    } else {
      console.log("Finish relation");
      store.finishRelation(tableId, anchor);
    }
  };

</script>

<style scoped>
  .canvas {
    background: #fff;
    overflow: auto; /* включаем прокрутку */
    width: 100%;
    height: 95vh;
    overflow: auto;
    position: relative;
  }

  .canvas-content {
    position: relative;
    transition: width 0.2s, height 0.2s; /* плавное расширение */
  }

  .relations {
    position: absolute;
    width: 100%;
    height: 100%;
    /*pointer-events: none;*/
  }

  .relation-line {
    cursor: pointer;
    transition: stroke 0.2s ease-in-out;
  }

  .relation-line:hover {
    stroke-width: 3;
  }

  .delete-relation{
    z-index: 20;
  }

  .element {
    position: absolute;
    background: rgb(224, 224, 224);
    /*border: 2px solid #000;*/
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 5px;
    user-select: none;
    min-width: 200px;
    max-width: 350px;
    width: 250px;
    z-index: 10;
  }

  .element.selected {
    box-shadow:0 0 20px #ffbd52;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    text-align: center;
    margin-bottom: 5px;
  }

  .table-title {
    width: 100%;
    border: none; /* Убирает рамку */
    font-weight: bold;
    text-align: center;
    outline: none;         /* Убирает рамку при фокусе */
    height: 2.5rem;        /* Увеличивает высоту (можно задать больше) */
    font-size: 1.1rem;     /* При желании — чуть крупнее текст */
    padding: 0.5rem 0;     /* Немного вертикальных отступов */
    background-color: transparent; /* Убирает фон, если не нужен */
  }
  .table-content {
    width: 100%;
    border-collapse: collapse;
  }

  .table-content td {
    border: 1px solid #4a124f;
    padding: 5px;
    text-align: center;

  }

  .table-content th {
    border: 1px solid #4a124f;
    background-color: #4a124f;
    color: #fff;
    padding: 5px;
    text-align: center;
    font-size: small;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #37133a;
  }

  .column-input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;             /* убираем фокусную рамку */
    text-align: center;
    font-size: 1rem;
    padding: 0;                /* убираем лишние отступы */
    box-sizing: border-box;   /* гарантирует, что padding не ломает размер */
    background-color: transparent; /* если нужно без фона */
  }

  .type-select {
    width: 100%;
    height: 100%;
    border: none;
    outline: none; 
    background-color: transparent;
    cursor: pointer;
    padding: 0;               /* убираем лишние внутренние отступы */
    box-sizing: border-box;  /* учитывает padding внутри размеров */
    font-size: 1rem;          /* можно подстроить под общий стиль */
    appearance: none;
    text-align: center;
  }

  .type-select option {
    background-color: #fff;
    color: #333;
    padding: 10px; /* может не сработать */
  }

  .delete-btn {
    background: rgb(123, 123, 123);
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px;
    font-size: 12px;
    border-radius: 5px;
    width: 30px;
    /*height: 30px;*/
  }

  .delete-btn:hover {
    background: rgb(161, 161, 161);
  }

  .delete-column {
    position: absolute; /* Фиксируем внутри ячейки */
    left: -5px; /* Смещаем немного внутрь */
    /*left: -30px;*/
    cursor: pointer;
    opacity: 0;
    border-radius: 5px;
    padding: 4px 4px;
    width: 25px;
    /*margin-left: -30px;*/
    color: #ffff;
    background-color: #000;
    z-index: 10;
    transition: opacity 0.2s ease-in-out;
  }

  .delete-column:hover {
    opacity: 1;
  }

  .add-column-button {
    width: 100%;
    border-radius: 5px;
  }

  .add-column-button:hover {
    background-color: #ffffff;
  }

  .add-table-button{
    border-radius: 5px;
  }

  .add-table-button:hover{
    background-color: #ffffff;
  }

  button {
    margin-top: 5px;
    width: 100%;
    cursor: pointer;
  }

  .anchor-point {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #007bff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.2s;
    cursor: pointer;
    z-index: 25;
  }
  .anchor-point:hover{
    background-color: #71b6ff;
    width: 15px;
    height: 15px;
  }
  .diamond-shape {
    width: 20px;
    height: 20px;
    background-color: black;
    transform: rotate(45deg);
    margin: auto;
  }

  .upperButtons {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
    z-index: 10000; /* Поверх остального */
    background-color: #000;
    border-radius: 10px;
  }

  .upperButtons button {
    padding: 8px;
    font-size: 16px;
    cursor: pointer;
    margin: 0;
    background-color: #000;
    border-radius: 10px;
  }
  .upperButtons button:hover {
    background-color: #434343;
  }

</style>
