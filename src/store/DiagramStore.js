import { defineStore } from "pinia";
import { reactive } from 'vue';

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    elements: [], // Таблицы
    relations: [], // Связи между таблицами
    selectedElements: [], // Выбранные элементы для связи
    sqlCode: "",
    isAddingRelation: false,
    relationStart: null,
    relationType: ""
  }),
  actions: {
    addElement(type) {
      const newElement = reactive({
        id: Date.now(),
        type,
        x: 100,
        y: 100,
        name: "Новая таблица",
        columns: reactive([
          reactive({
            id: Date.now(),
            isPK: true,
            name: "id",
            type: "INT"
          }),
          reactive({
            id: Date.now() + 1,
            isPK: false,
            name: "name",
            type: "VARCHAR(255)"
          })
        ])
      });
      this.elements.push(newElement);
      console.log(this.elements);
    },
    removeElement(id) {
      // Удаляем таблицу
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
        const parts = type.split(':');
        this.relations.push({
          from: this.selectedElements[0],
          to: this.selectedElements[1],
          fromType: parts[0],
          toType: parts[1]
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

      const parts = this.relationType.split(':');
      this.relations.push({
        from: this.relationStart.tableId,
        fromAnchor: this.relationStart.anchor, // сохраняем имя/позицию
        fromType: parts[0],
        to: tableId,
        toAnchor: anchor,
        toType: parts[1]
      });
  
  
//ПОДУМАТЬ НАД ТЕМ, КАК КОНТРОЛИРОВАТЬ НАЗВАНИЯ ВНЕШНИХ КЛЮЧЕЙ ПРИ ИЗМЕНЕНИИ НАЗВАНИЯ, ПОЛЕЙ ТАБЛИЦЫ
      //addForeignKey(tableId);
      const fromTable = this.elements.find(e => e.id === fromTableId);
      const toTable = this.elements.find(e => e.id === toTableId);
      if(parts[0] == '1' && parts[1] == '1' || parts[0] == '1' && parts[1] == 'M'){
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

      if(parts[0] == 'M' && parts[1] == 'M'){
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
      this.relationType = "";
      console.log(this.relations);
    },
    cancelRelation(){
      this.relationStart = null;
      this.isAddingRelation = false;
    },

    /*addForeignKey(idTable){

    },*/

    convertToSql(){
      //checkScheme();

      //если все данные заполнены генерируем sql-код:
      let sql_code='';

      //==========================================
      this.elements.forEach((table) => {
        console.log("Table: " + table.name);

        let pk_s = [];  //тут будем помечать pk
        sql_code += 'CREATE TABLE ' + table.name + '\n(\n' ;
        table.columns.forEach((col) => {
          console.log("isPK: " + col.isPK + " name: " + col.name + " type: " + col.type);

          sql_code += "\u00a0\u00a0\u00a0\u00a0" + col.name + ' ' + col.type + '\n';
          if(col.isPK){
            pk_s.push(col.name);
          }
        })
        sql_code += '\n);\n';
        
        //перебираем pk
        if(pk_s.length == 0){   //если забыли указать, выходим
          alert("Вы забыли указать PK");
          //подсветить...
          //tab.style.boxShadow = '0 0 20px red';
          return;
        }
        sql_code += '\nALTER TABLE ' + table.name;
        for(let i=0; i<pk_s.length; i++){   
            sql_code += '\n'+"\u00a0\u00a0\u00a0\u00a0"+'ADD CONSTRAINT XPK'+table.name+' PRIMARY KEY ('+pk_s[i]+');\n\n';
        }
      })

      // Заменяем символы новой строки на <br>
      //this.sqlCode = sql_code.replace(/\n/g, '<br>');
      this.sqlCode = sql_code;
      console.log(sql_code);

      this.relations.forEach((rel) => {
        console.log("from: " + rel.from + " to: " + rel.to);
      })
      //=============================================



    },
    /*checkScheme(){  //проверка схемы

    }*/

  },
});
