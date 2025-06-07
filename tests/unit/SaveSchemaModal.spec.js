import { mount } from '@vue/test-utils'
import SaveSchemaModal from '@/components/SaveSchemaModal.vue'
import { setActivePinia, createPinia } from 'pinia'
import { useDiagramStore } from '@/store/DiagramStore'
import { useDiagramApiStore } from '@/store/DiagramApiStore'

describe('SaveSchemaModal.vue', () => {
  let wrapper
  let diagramStore
  let diagramApiStore
  let alertMock

  beforeEach(() => {
    setActivePinia(createPinia())

    diagramStore = useDiagramStore()
    diagramApiStore = useDiagramApiStore()

    // Зададим примеры элементов и связей, чтобы saveSchema корректно отработал
    diagramStore.elements = [
      {
        id: 1,
        columns: [{ id: 11, isPK: true, isFK: false }],
      },
    ]
    diagramStore.relations = [
      {
        from: 1,
        to: 1,
        fromAnchor: { name: 'top', x: 10, y: 20 },
        toAnchor: { name: 'bottom', x: 30, y: 40 },
      },
    ]

    // Мокаем saveSchema и alert
    diagramApiStore.saveSchema = jest.fn().mockResolvedValue()
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})

    wrapper = mount(SaveSchemaModal)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('рендерит все элементы', () => {
    expect(wrapper.find('h3').text()).toBe('Сохранить схему')
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('эмитит close при клике на кнопку "Отмена"', async () => {
    await wrapper.findAll('button').at(1).trigger('click') // вторая кнопка - Отмена
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('показывает alert при попытке сохранить с пустым именем', async () => {
    await wrapper.find('input').setValue('   ') // пустое имя с пробелами
    await wrapper.find('button').trigger('click') // первая кнопка - Сохранить

    expect(alertMock).toHaveBeenCalledWith('Название схемы не может быть пустым')
    expect(diagramApiStore.saveSchema).not.toHaveBeenCalled()
  })

  it('вызывает saveSchema и закрывает модалку при валидном имени', async () => {
    await wrapper.find('input').setValue('Моя схема')
    await wrapper.find('button').trigger('click')

    expect(diagramApiStore.saveSchema).toHaveBeenCalledWith(expect.objectContaining({
      userId: '123',
      name: 'Моя схема',
      elements: expect.any(Array),
      relations: expect.any(Array),
    }))

    expect(alertMock).toHaveBeenCalledWith('Схема сохранена!')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.find('input').element.value).toBe('') // поле очищено
  })

  it('показывает alert при ошибке сохранения', async () => {
    diagramApiStore.saveSchema.mockRejectedValue(new Error('Ошибка'))

    await wrapper.find('input').setValue('Моя схема')
    await wrapper.find('button').trigger('click')

    expect(alertMock).toHaveBeenCalledWith('Ошибка при сохранении схемы.')
  })
})
