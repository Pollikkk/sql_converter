import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MySchemasModal from '@/components/MySchemasModal.vue'

// Мокаем сторы для Jest
jest.mock('@/store/DiagramStore', () => ({
  useDiagramStore: () => ({
    elements: [],
    relations: [],
  }),
}))

jest.mock('@/store/DiagramApiStore', () => ({
  useDiagramApiStore: () => ({
    schemas: [],
    fetchSchemaById: jest.fn(),
    deleteSchema: jest.fn(),
    fetchUserSchemas: jest.fn(),
  }),
}))

describe('MySchemasModal.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia()) // инициализируем Pinia
  })

  it('вызывает событие close при клике на кнопку "Закрыть"', async () => {
    const wrapper = mount(MySchemasModal)

    const closeButton = wrapper.findAll('button').find(btn => btn.text() === 'Закрыть')
    expect(closeButton).toBeTruthy()

    await closeButton.trigger('click')

    const emitted = wrapper.emitted('close')
    expect(emitted).toBeTruthy()
  })
})
