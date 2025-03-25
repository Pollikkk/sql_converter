<template>
  <div class="canvas" @click="clearSelection" @mousemove="move" @mouseup="drop">
    <!-- Рисуем связи -->
    <svg class="relations">
      <g v-for="(relation, index) in store.relations" :key="index">
        <line
          :x1="getConnectionPoint(relation.from, getElement(relation.to)?.x, getElement(relation.to)?.y).x"
          :y1="getConnectionPoint(relation.from, getElement(relation.to)?.x, getElement(relation.to)?.y).y"
          :x2="getConnectionPoint(relation.to, getElement(relation.from)?.x, getElement(relation.from)?.y).x"
          :y2="getConnectionPoint(relation.to, getElement(relation.from)?.x, getElement(relation.from)?.y).y"
          stroke="black"
          stroke-width="2"
          class="relation-line"
          @click.stop="toggleDeleteButton(index)"
        />
      <!-- Кнопка удаления связи -->
      <g v-if="selectedRelationId  === index">
          <rect
            :x="getMidX(index) - 10"
            :y="getMidY(index) - 10"
            width="20"
            height="20"
            fill="black"
            rx="5"
            cursor="pointer"
            @click.stop="store.removeRelation(index)"
          />
          <text
            :x="getMidX(index)"
            :y="getMidY(index) + 5"
            font-size="14"
            fill="white"
            text-anchor="middle"
            cursor="pointer"
            @click.stop="store.removeRelation(index)"
          >✖</text>
        </g>
      </g>
    </svg>
    <!-- Отображение таблиц -->
    <div
      v-for="element in store.elements"
      :key="element.id"
      :data-id="element.id"
      class="element"
      :class="{ selected: store.selectedElements.includes(element.id) }"
      :style="{
        left: element.x + 'px',
        top: element.y + 'px',
        cursor: draggingElementId === element.id ? 'grabbing' : 'grab'
      }"
      @mousedown="drag($event, element.id)"
      @click.stop="store.selectElement(element.id)"
    >
      <div class="table-header">
        <input v-model="element.name" class="table-title" />
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
          <td>
            <input type="checkbox" v-model="col.isPK" class="" />
          </td>
          <td>
            <input v-model="col.name" class="column-input" />
          </td>
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
    </div>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { useDiagramStore } from "@/store/DiagramStore";

  const store = useDiagramStore();
  const draggingElementId = ref(null);
  const dragOffset = ref({ x: 0, y: 0 });
  const selectedRelationId  = ref(null);

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

    const element = store.elements.find(e => e.id === draggingElementId.value);
    if (element) {
      // Получаем размеры канвы
      const canvas = document.querySelector(".canvas");
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const elementNode = document.querySelector(`[data-id="${element.id}"]`); // Получаем DOM-элемент таблицы
      if (!elementNode) return;

      const elementRect = elementNode.getBoundingClientRect(); // Определяем реальные размеры таблицы

      // Ограничиваем координаты
      const newX = event.clientX - dragOffset.value.x;
      const newY = event.clientY - dragOffset.value.y;

      element.x = Math.max(0, Math.min(newX, canvasRect.width - elementRect.width));
      element.y = Math.max(0, Math.min(newY, canvasRect.height - elementRect.height));
  }
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

  // Функция для поиска элемента по id
  const getElement = (id) => store.elements.find(e => e.id === id);

  const getMidX = (index) => {
    const relation = store.relations[index];
    const from = getElement(relation.from);
    const to = getElement(relation.to);
    return from && to ? (from.x + to.x) / 2 + 75 : 0;
  };
  const getMidY = (index) => {
    const relation = store.relations[index];
    const from = getElement(relation.from);
    const to = getElement(relation.to);
    return from && to ? (from.y + to.y) / 2 + 25 : 0;
  };

  const getConnectionPoint = (tableId, targetX, targetY) => {
    const table = document.querySelector(`[data-id="${tableId}"]`);
    if (!table) return { x: 0, y: 0 };

    console.log("TABLE : " + tableId );//

    const rect = table.getBoundingClientRect();
    console.log("rect.x : " + rect.x );//
    console.log("rect.y: " + rect.y);
    console.log("rect.width : " + rect.width );//
    console.log("rect.height: " + rect.height);

    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    console.log("centerX: " + centerX);//
    console.log("centerY: " + centerY);//

    const dx = targetX - centerX;
    const dy = targetY - centerY;
    const aspectRatio = rect.width / rect.height;
    console.log("dx: " + dx);
    console.log("dy: " + dy);
    console.log("aspectRatio: " + aspectRatio);

    let x = centerX;
    let y = centerY;
    console.log("x: " + x);
    console.log("y: " + y);

    if (Math.abs(dx / dy) > aspectRatio) {
      // Соединяемся с левой или правой границей
      x = dx > 0 ? rect.x + rect.width : rect.x;
      y = centerY + (rect.height / 2) * (dy / Math.abs(dx));
      console.log("x: " + x);
      console.log("y: " + y);
    } else {
      // Соединяемся с верхней или нижней границей
      x = centerX + (rect.width / 2) * (dx / Math.abs(dy));
      y = dy > 0 ? rect.y + rect.height : rect.y;
      console.log("x: " + x);
      console.log("y: " + y);
    }

    return { x, y };
  };

</script>

<style scoped>
  .canvas {
    flex: 1;
    position: relative;
    background: #fff;
    height: 95vh;
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

  .element {
    position: absolute;
    background: white;
    border: 2px solid #000;
    padding: 10px;
    border-radius: 5px;
    user-select: none;
    min-width: 200px;
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
    border: none;
    font-weight: bold;
    text-align: center;
  }

  .table-content {
    width: 100%;
    border-collapse: collapse;
  }

  .table-content td {
    border: 1px solid black;
    padding: 5px;
    text-align: center;
  }

  .table-content th {
    background-color: #aaaaaa;
    padding: 5px;
    text-align: center;
    font-size: small;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .column-input {
    width: 100%;
    height: 100%;
    border: none;
    text-align: center;
  }

  .type-select {
    width: 100%;
    height: 100%;
    border: none;
    background: #f5f5f5;
    cursor: pointer;
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
    padding: 2px 4px;
    width: 20px;
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
  }

  .add-column-button:hover {
    background-color: #aaaaaa;
  }

  button {
    margin-top: 5px;
    width: 100%;
    cursor: pointer;
  }


</style>
