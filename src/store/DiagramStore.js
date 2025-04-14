import { defineStore } from "pinia";

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    elements: [], // Таблицы
    relations: [], // Связи между таблицами
    selectedElements: [], // Выбранные элементы для связи
    sqlCode: ""
  }),
  actions: {
    addElement(type) {
      const newElement = {
        id: Date.now(),
        type,
        x: 100,
        y: 100,
        name: "Новая таблица",
        columns: [{ id: Date.now(), isPK: true, name: "id", type: "INT" }, { id: Date.now() + 1, isPK: false, name: "name", type: "VARCHAR(255)" }], // Добавляем столбцы по умолчанию
      };
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
        element.columns.push({ id: Date.now(), isPK: false, name: "new_column", type: "VARCHAR(255)" });
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
    removeRelation(index) {
      this.relations.splice(index, 1);
    },
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
