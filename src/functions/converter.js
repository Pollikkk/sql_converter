//Перевод в sql-код
function Sql(){
    let allInp = d.getElementsByTagName("input");   //раскрашивает красные (незаполненные) до этого поля в белый, если они заполнены
    let allSel = d.getElementsByTagName("select");
    let tables = d.getElementsByTagName("div");

    //проверка, есть ли вообще хоть 1 таблица
    if(f.innerHTML == ''){
        alert("Рабочее поле пусто!");
        return;
    }
    else{
        //Проверка на пустые поля в таблице
        let Err = 0;//флаг, указывающий есть ли ошибка
        
        for(let i=0; i<last_id.length; i++){
            let tab = d.getElementById("t["+ i + "]");  //получили таблицу
            let name_tab = d.getElementById("name_table["+i+"]");   
            //name_tab.style.backgroundColor = "rgb(244, 123, 123)";
            if(name_tab.value == ''){   //проверяем название таблицы
                name_tab.style.backgroundColor = "rgb(244, 123, 123)";
                Err = 1;
            }
            //alert(last_id[i]["line"]);
            for(let j=0; j<last_id[i]["line"]; j++){  //проверяем поля таблиц
                let td1 = d.getElementsByName("name["+i+"]["+j+"]")[0];
                let td2 = d.getElementsByName("Type["+i+"]["+j+"]")[0];
                let td3 = d.getElementsByName("dataType["+i+"]["+j+"]")[0]; 
                if(td1!=null){
                    if(td1.value == ''){  
                        td1.style.backgroundColor = "rgb(244, 123, 123)";
                        Err = 1;
                    }
                    if(td2.value == "0"){  
                        td2.style.backgroundColor = "rgb(244, 123, 123)";
                        Err = 1;
                    }
                    if(td3.value == "0"){  
                        td3.style.backgroundColor = "rgb(244, 123, 123)";
                        Err = 1;
                    }
                }
            }
        }

        if(Err==1){ //выходим, если есть хоть одна незаполненная ячейка
            alert("Есть незаполненные поля!");
            return;
        }

        //если все данные заполнены генерируем sql-код:
        let sql_code='';
        
        //получаем поля таблиц
        for(let i=0; i<last_id.length; i++){
            let pk_s = [];  //тут будем помечать pk
            let tab = d.getElementById("t["+ i + "]");  //получили таблицу
            let name_tab = d.getElementById("name_table["+i+"]"); 
            if(tab!=null){
                sql_code += 'CREATE TABLE ' + name_tab.value + '\n(\n' ;
            }
            else{continue;}
              
            for(let j=0; j<last_id[i]["line"]; j++){  //проверяем поля таблиц
                let td1 = d.getElementsByName("name["+i+"]["+j+"]")[0];
                let td2 = d.getElementsByName("Type["+i+"]["+j+"]")[0];
                let td3 = d.getElementsByName("dataType["+i+"]["+j+"]")[0]; 
                let td4 = d.getElementsByName("pk["+i+"]["+j+"]")[0]; 

                if(td1!=null){  //проверка на наличие строчки(мы же можем по ходу редактирования удалять их)
                    sql_code += "\u00a0\u00a0\u00a0\u00a0" + td1.value + ' ' + td3.options[td3.selectedIndex].text + '\n';

                    if(td4.checked){
                        pk_s.push(td1.value);
                    }
                }
                
            }
            sql_code += '\n);\n' ;
            //перебираем pk
            if(pk_s.length == 0){   //если забыли указать, выходим
                alert("Вы забыли указать PK");
                //подсветить...
                tab.style.boxShadow = '0 0 20px red';
                return;
            }
            /*sql_code += '\nCREATE UNIQUE INDEX XPK'+name_tab.value+' ON '+ name_tab.value+'\n(';
            for(let i=0; i<pk_s.length; i++){   //если все хорошо
                sql_code += '\n'+"\u00a0\u00a0\u00a0\u00a0"+pk_s[i]+' ASC';
            }
            sql_code += '\n);\n';*/

            sql_code += '\nALTER TABLE ' + name_tab.value;
            for(let i=0; i<pk_s.length; i++){   
                sql_code += '\n'+"\u00a0\u00a0\u00a0\u00a0"+'ADD CONSTRAINT XPK'+name_tab.value+' PRIMARY KEY ('+pk_s[i]+');\n\n';
            }

        }

        //alert(sql_code);    //для проверки

        // добавляем содержимое при открытии модального окна
        modal.setBody(`<div id='sql_code' style='white-space:pre'>${sql_code}</div>`);

        //добавляем действие для кнопки копировать
        document.addEventListener('click', (e) => {
            // при клике по кнопке копировать
            if (e.target.closest('[data-action="copy"]')) {
                navigator.clipboard.writeText(sql_code);    //d.getElementById("sql_code").innerText
            }
          });

        // откроем модальное окно
        modal.show();
    }
}