import { defineStore } from "pinia";
import { reactive } from 'vue';

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    elements: [], // Таблицы
    relations: [],  // Связи между таблицами
    selectedElements: [], // Выбранные элементы для связи
    sqlCode: "",
    isAddingRelation: false, //состояние, когда строится связь
    relationStart: null, //кардинальность начала связи при построении связи
    relationType: {//тип связи, которую строим
      first: "1",
      second: "1"
    },
    activeSubTab: null         // '1to1' | '1to01' | '01to01' | '1toM' | '01toM' | 'MtoM' | null
  }),
  getters: {
    inheritanceRelations(state) {
      console.log('relations', this.relations)
      return state.relations.filter(r => r.type === 'inheritance')
    },
    standardRelations(state) {
      console.log('relations', this.relations)
      return state.relations.filter(r => r.type !== 'inheritance')
    }
  },
  actions: {
    setactiveSubTab(){

    },
    addElement() {
      const newElement = {
        id: Date.now(),
        type: 'simpleTable',
        x: 100,
        y: 100,
        name: "Новая таблица",
        columns: [
          {
            id: Date.now(),
            isPK: true,
            isFK: false,
            name: "id",
            type: "INT"
          },
          {
            id: Date.now() + 1,
            name: "name",
            type: "VARCHAR(256)",
            isPK: false,
            isFK: false
          }
        ]
      };
      this.elements.push(newElement);
      console.log(this.elements);
    },

    addCompositeElement(){
      const baseId = Date.now();
      const leftId = baseId + 1;
      const rightId = baseId + 2;
      //const diamondId = baseId + 3;

      const base = reactive({
        id: baseId,
        type: 'simpleTable',
        name: 'Parent',
        x: 400,
        y: 200,
        columns: reactive([
          {
            id: Date.now(),
            name: 'id',
            type: 'INT',
            isPK: true,
            isFK: false,
          }
        ])
      });
    
      const left = reactive({
        id: leftId,
        type: 'simpleTable',
        name: 'Child 1',
        x: 250,
        y: 400,
        columns: reactive([
          {
            id: Date.now() + 1,
            name: 'id',
            type: 'INT',
            isPK: true,
            isFK: true,
            references: {
              tableId: baseId,
              columnId: base.columns[0].id
            }
          }
        ])
      });
    
      const right = reactive({
        id: rightId,
        type: 'simpleTable',
        name: 'Child 2',
        x: 550,
        y: 400,
        columns: reactive([
          {
            id: Date.now() + 2,
            name: 'id',
            type: 'INT',
            isPK: true,
            isFK: true,
            references: {
              tableId: baseId,
              columnId: base.columns[0].id
            }
          }
        ])
      });
    
      this.elements.push(base, left, right);
    
      // Добавляем наследственные связи
      this.relations.push(
        { from: baseId, to: leftId, type: 'inheritance' },
        { from: baseId, to: rightId, type: 'inheritance' }
      );

      console.log('Relations: '+this.relations);
      console.log('Tables: '+this.elements);
    },
    removeElement(id) {
      // Удаляем таблицу
      const rel = this.relations.find(r => r.from == id || r.to == id);
      console.log("REL: "+ rel);
      if (rel) {
        const fromTable = this.elements.find(e => e.id === rel.from);//
        const toTable = this.elements.find(e => e.id === rel.to);
        const pkFrom = fromTable?.columns.find(c => c.isPK);
        const pkTo = toTable?.columns.find(c => c.isPK);

        if (pkFrom && toTable) {
          toTable.columns = toTable.columns.filter(col => !(col.isFK && col.references?.columnId === pkFrom.id));
        }
        if (pkTo && fromTable) {
          fromTable.columns = fromTable.columns.filter(col => !(col.isFK && col.references?.columnId === pkTo.id));
        }
      }
      
      this.elements = this.elements.filter(e => e.id !== id);
      // Удаляем все связи, связанные с этой таблицей
      this.relations = this.relations.filter(r => r.from !== id && r.to !== id);
      // Если таблица была выделена, убираем её из выделенных
      this.selectedElements = this.selectedElements.filter(e => e !== id);
    },
    addColumn(id) {
      const element = this.elements.find(e => e.id === id);
      if (element) {
        element.columns.push(reactive({ id: Date.now(), isPK: false, name: "new_column", type: "VARCHAR(255)" }));
      }
    },
    removeColumn(elId, colId) {
      const element = this.elements.find(e => e.id === elId);
      if (element) {
        element.columns = element.columns.filter(c => c.id !== colId);
      }
    },
    updatePosition(id, x, y) {
      const el = this.elements.find(e => e.id === id);
      if (el) {
        el.x = x;
        el.y = y;
      }
    },
    selectElement(id) {
      if (this.selectedElements.includes(id)) {
        this.selectedElements = this.selectedElements.filter(e => e !== id);
      } else {
        this.selectedElements.push(id);
      }
    },
    addRelation(type) {
      if (this.selectedElements.length === 2) {
        //const parts = type.split(':');
        this.relations.push({
          from: this.selectedElements[0],
          to: this.selectedElements[1],
          fromType: this.relationType.first,
          toType: this.relationType.second,
          type: 'common'
        });
        this.selectedElements = []; // Очистить выбор после создания связи
        console.log(this.relations);
        console.log(type);
      }
    },
    getRelationSymbol(type) {
      if (type === '1') return 'OneType';
      if (type === '0..1') return 'OptionalOneType';
      if (type === 'M') return 'ManyType';
      if (type === '0..M') return 'OptionalManyType';
      
      return null;
    },
    removeRelation(index) {
      //убираем внешние ключи
      const rel = this.relations[index];
      if (!rel) return;

      const fromTable = this.elements.find(e => e.id === rel.from);
      const toTable = this.elements.find(e => e.id === rel.to);
      const pkFrom = fromTable?.columns.find(c => c.isPK);
      const pkTo = toTable?.columns.find(c => c.isPK);

      if (pkFrom && toTable) {
        toTable.columns = toTable.columns.filter(col => !(col.isFK && col.references?.columnId === pkFrom.id));
      }
      if (pkTo && fromTable) {
        fromTable.columns = fromTable.columns.filter(col => !(col.isFK && col.references?.columnId === pkTo.id));
      }

      this.relations.splice(index, 1);
    },
    
    startRelation(tableId, anchor){
      this.relationStart = { tableId, anchor };
    },
    finishRelation(tableId, anchor){
      if (!this.relationStart) return;
  
      console.log("to: " +tableId);
      console.log("toAnchor: " + anchor.name);
      console.log("from: " + this.relationStart.tableId);
      console.log("fromAnchor: " + this.relationStart.anchor.name);


      const fromTableId = this.relationStart.tableId;
      const toTableId = tableId;

      //Проверка на дублирование связи
      const exists = this.relations.some(r =>
        r.from === this.relationStart.tableId &&
        r.to === tableId
      );
      
      if (exists) {
        console.warn("Такая связь уже существует");
        this.cancelRelation();
        return;
      }

      //const parts = this.relationType.split(':');
      this.relations.push({
        from: this.relationStart.tableId,
        fromAnchor: this.relationStart.anchor, // сохраняем имя/позицию
        fromType: this.relationType.first,
        to: tableId,
        toAnchor: anchor,
        toType: this.relationType.second,
        type: 'common'
      });
  
  
      //addForeignKey(tableId);
      const fromTable = this.elements.find(e => e.id === fromTableId);
      const toTable = this.elements.find(e => e.id === toTableId);
      if(this.relationType.first == '1' && this.relationType.second == '1' || this.relationType.first == '0..1' && this.relationType.second == '0..1' || this.relationType.first == '1' && this.relationType.second == 'M' || this.relationType.first == '0..1' && this.relationType.second == 'M' || this.relationType.first == '1' && this.relationType.second == '0..1'){
        if (fromTable && toTable) {
          const pk = fromTable.columns.find(c => c.isPK);
          if (pk) {
            const fkName = `${fromTable.name.toLowerCase()}_${pk.name}_fk`;
            toTable.columns.push({
              id: Date.now(),
              name: fkName,
              type: pk.type,
              isPK: false,
              isFK: true,
              references: {
                tableId: fromTable.id,
                columnId: pk.id
              }
            });
          }
        }
      }

      if(this.relationType.first == 'M' && this.relationType.second == '1' || this.relationType.first == 'M' && this.relationType.second == '0..1' || this.relationType.first == '0..1' && this.relationType.second == '1'){
        if (fromTable && toTable) {
          const pk = toTable.columns.find(c => c.isPK);
          if (pk) {
            const fkName = `${toTable.name.toLowerCase()}_${pk.name}_fk`;
            fromTable.columns.push({
              id: Date.now(),
              name: fkName,
              type: pk.type,
              isPK: false,
              isFK: true,
              references: {
                tableId: toTable.id,
                columnId: pk.id
              }
            });
          }
        }
      }

      if(this.relationType.first == 'M' && this.relationType.second == 'M'){
        if (fromTable && toTable) {
          const pk1 = fromTable.columns.find(c => c.isPK);
          const pk2 = toTable.columns.find(c => c.isPK);
          if (pk1) {
            const fkName = `${fromTable.name.toLowerCase()}_${pk1.name}_fk`;
            toTable.columns.push({
              id: Date.now(),
              name: fkName,
              type: pk1.type,
              isPK: false,
              isFK: true,
              references: {
                tableId: fromTable.id,
                columnId: pk1.id
              }
            });
          }
          if (pk2) {
            const fkName = `${toTable.name.toLowerCase()}_${pk2.name}_fk`;
            fromTable.columns.push({
              id: Date.now(),
              name: fkName,
              type: pk2.type,
              isPK: false,
              isFK: true,
              references: {
                tableId: toTable.id,
                columnId: pk2.id
              }
            });
          }
        }
      }

      // Очистка после добавления
      this.relationStart = null;
      this.isAddingRelation = false;
      this.relationType.first = "";
      this.relationType.second = "";
      this.activeSubTab = null;
      console.log(this.relations);
      console.log(this.elements);
    },
    cancelRelation(){
      this.relationStart = null;
      this.isAddingRelation = false;
    },
    updateElementName(id, newName) {
      const el = this.elements.find(e => e.id === id);
      if (el) el.name = newName;
    },
    

    convertToSql(){
      let sql_code = '';
      this.sqlCode = '';
      //let simpleTables = this.elements.filter(t => t.type === 'simpleTable');

      if (this.checkErrors()) {
        alert("Исправьте ошибки перед генерацией SQL");
        return;
      }

      const intermediateTables = []; // для M:N связей
    
      // Сначала DROP всех таблиц
      this.elements.forEach((table) => {
        sql_code += `DROP TABLE IF EXISTS ${table.name} CASCADE;\n`;
      });
      sql_code += '\n';
      console.log(sql_code);
    
      // DROP промежуточных таблиц для связей M:N
      this.relations.forEach((rel, index) => {
        if (rel.type === 'M:N') {
          const intermediateTableName = `${this.elements.find(t => t.id === rel.from)?.name}_${this.elements.find(t => t.id === rel.to)?.name}_link_${index}`;
          sql_code += `DROP TABLE IF EXISTS ${intermediateTableName} CASCADE;\n`;
        }
      });
    
      sql_code += '\n';
    
      // Теперь создаем обычные таблицы
      this.elements.filter(t => t.type === 'simpleTable').forEach((table) => {
        sql_code += `CREATE TABLE ${table.name} (\n`;
    
        const columnDefs = [];
        const pkColumns = [];
    
        table.columns.forEach((col) => {
          columnDefs.push(`\u00a0\u00a0\u00a0\u00a0${col.name} ${col.type}`);
    
          if (col.isPK) {
            pkColumns.push(col.name);
          }
        });
    
        sql_code += columnDefs.join(',\n');
    
        if (pkColumns.length > 0) {
          sql_code += ',\n';
          sql_code += `\u00a0\u00a0\u00a0\u00a0PRIMARY KEY (${pkColumns.join(', ')})`;
        }
    
        sql_code += `\n);\n\n`;
      });
    
      // Теперь обрабатываем связи 1:1 и 1:N
      this.relations.forEach((rel, index) => {
        const fromTable = this.elements.find(t => t.id === rel.from);
        const toTable = this.elements.find(t => t.id === rel.to);
        if (!fromTable || !toTable) return;
    
        const fromPK = fromTable.columns.find(c => c.isPK);
        const toPK = toTable.columns.find(c => c.isPK);
        if (!fromPK || !toPK) return;
    
        if (!(rel.fromType === 'M' && rel.toType === 'M' || rel.fromType === '0..M' && rel.toType === '0..M')) {
          let conditionfor_del_upd = '';
          if(rel.fromType === '1' && rel.toType === '1'){
            conditionfor_del_upd = 'ON DELETE CASCADE ON UPDATE CASCADE';
          } else if((rel.fromType === '0..1' || rel.fromType === 'M') && rel.toType === '0..1' || rel.fromType === '0..1' && (rel.toType === '0..1' || rel.toType === 'M')){
            conditionfor_del_upd = 'ON DELETE SET NULL ON UPDATE CASCADE';
          } else if((rel.fromType === '0..1' || rel.toType === '0..1')||(rel.fromType === '1' && rel.toType === 'M')||(rel.fromType === 'M' && rel.toType === '1')){
            conditionfor_del_upd = 'ON UPDATE CASCADE';
          }
          sql_code += `ALTER TABLE ${toTable.name}\n`;
          sql_code += `\u00a0\u00a0\u00a0\u00a0 ADD FOREIGN KEY (${rel.fkName || `${fromTable.name.toLowerCase()}_${fromPK.name}`}) REFERENCES ${fromTable.name}(${fromPK.name}) ${conditionfor_del_upd};\n\n`;
        } else if (rel.fromType === 'M' && rel.toType === 'M') {
          const intermediateTableName = `${fromTable.name}_${toTable.name}_link_${index}`;
          intermediateTables.push({
            name: intermediateTableName,
            fromTable,
            toTable,
            fromPK,
            toPK,
          });
        }
      });
    
      // Промежуточные таблицы для M:M связей
      intermediateTables.forEach(intermediate => {
        sql_code += `CREATE TABLE ${intermediate.name} (\n`;
        sql_code += `\u00a0\u00a0\u00a0\u00a0${intermediate.fromTable.name.toLowerCase()}_${intermediate.fromPK.name} ${intermediate.fromPK.type},\n`;
        sql_code += `\u00a0\u00a0\u00a0\u00a0${intermediate.toTable.name.toLowerCase()}_${intermediate.toPK.name} ${intermediate.toPK.type},\n`;
        sql_code += `\u00a0\u00a0\u00a0\u00a0PRIMARY KEY (${intermediate.fromTable.name.toLowerCase()}_${intermediate.fromPK.name}, ${intermediate.toTable.name.toLowerCase()}_${intermediate.toPK.name}),\n`;
        sql_code += `\u00a0\u00a0\u00a0\u00a0FOREIGN KEY (${intermediate.fromTable.name.toLowerCase()}_${intermediate.fromPK.name}) REFERENCES ${intermediate.fromTable.name}(${intermediate.fromPK.name}) ON DELETE CASCADE,\n`;
        sql_code += `\u00a0\u00a0\u00a0\u00a0FOREIGN KEY (${intermediate.toTable.name.toLowerCase()}_${intermediate.toPK.name}) REFERENCES ${intermediate.toTable.name}(${intermediate.toPK.name}) ON DELETE CASCADE\n`;
        sql_code += `);\n\n`;
      });
    
      this.sqlCode = sql_code;
      console.log(sql_code);
      
    },
    checkErrors() {
      let hasErrors = false;
      
      this.elements.filter(t => t.type === 'simpleTable').forEach(table => {
        table.hasError = false; // сброс ошибок
    
        // Проверяем имя таблицы
        if (!table.name || table.name.trim() === '') {
          table.hasError = true;
          hasErrors = true;
        }
    
        const pkColumns = Array.isArray(table.columns) ? table.columns.filter(col => col.isPK) : [];
        if (pkColumns.length === 0) {
          table.hasError = true;
          hasErrors = true;
        }
        
        table.columns.forEach(col => {
          col.hasError = false; // сброс ошибок
          if (!col.name || !col.type) {
            col.hasError = true;
            table.hasError = true;
            hasErrors = true;
          }
        });
      });
    
      // Проверяем связи
      this.relations.forEach(relation => {
        const fromTable = this.elements.find(t => t.id === relation.from);
        const toTable = this.elements.find(t => t.id === relation.to);
    
        if (!fromTable || !toTable) return;
    
        const fromPK = Array.isArray(fromTable.columns) ? fromTable.columns.find(c => c.isPK) : null;
        const toPK = Array.isArray(toTable.columns) ? toTable.columns.find(c => c.isPK) : null;
    
        if (!fromPK || !toPK) {
          if (fromTable) fromTable.hasError = true;
          if (toTable) toTable.hasError = true;
          hasErrors = true;
        }
      });
    
      return hasErrors;
    }
  },
});
