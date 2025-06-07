<template> 
<div class="modal-overlay"> 
    <div class="modal"> 
        <h2>Мои схемы</h2> 
        <div class="allSchemes">
          <div class="card" v-for="schema in apiStore.schemas" :key="schema._id" @click="openSchema(schema._id)">
            <div class="card-name">{{ schema.name }}</div>
            <button class="btn-del-card" @click.stop="delSchema(schema._id)">🗑</button>
          </div>
        </div>
        <button @click="$emit('close')">Закрыть</button> 
    </div> 
</div> 
</template> 
<script setup> 
    import { useDiagramStore } from "@/store/DiagramStore"
    import { useDiagramApiStore } from '@/store/DiagramApiStore'
    import { onMounted, defineEmits } from 'vue' 
    

    const diagramStore = useDiagramStore()
    const apiStore = useDiagramApiStore()
    const emit = defineEmits(['close']) 

    async function openSchema(schemaId) {
        const schema = await apiStore.fetchSchemaById(schemaId)
        diagramStore.elements = schema.elements
        diagramStore.relations = schema.relations
        emit('close') 
    }

    async function delSchema(schemaId) {
        await apiStore.deleteSchema(schemaId)
        apiStore.fetchUserSchemas(123) 
    }

    onMounted(() => { 
        apiStore.fetchUserSchemas(123) 
    }) 
</script> 
<style scoped> 
.modal-overlay { 
    position: fixed; 
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    background: rgba(0,0,0,0.5); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
} 
.modal { 
    background: white; 
    padding: 2rem; 
    border-radius: 10px; 
    height: 80%;
    width: 80%;
    display: flex;
    flex-direction: column;
} 

.card{
    border: 1px solid #9c9b9b;
    border-radius: 10px;
    cursor: pointer;
    background-color: #f5f5f5;
    padding: 1rem;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    transition: background 0.2s ease;
    
}

.card:hover {
  background-color: #eaeaea;
}

.card-name {
  font-weight: bold;
  text-align: center;
}

.allSchemes{
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding-right: 0.5rem;
    margin-bottom: 1rem;
    flex: 1; /* чтобы занимало всё оставшееся пространство */
}

.btn-del-card{
    background-color: #37133a;
  color: #fff;
  border-radius: 16px;
  padding: 10px 15px;
  cursor: pointer;
  border: none;
}
</style>