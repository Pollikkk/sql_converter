import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SidePanel from '@/components/SidePanel.vue'
import { useDiagramStore } from '@/store/DiagramStore'


describe('SidePanel.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDiagramStore()

    // Моки для действий стора
    store.addElement = jest.fn()
    store.addCompositeElement = jest.fn()
    store.convertToSql = jest.fn()

    wrapper = mount(SidePanel, {
      global: {
        stubs: {
          ModalWindow: {
            template: '<div class="modal-mock"><slot /></div>',
          },
        },
      },
    })
  })

  it('вызывает addElement при клике по кнопке простой сущности', async () => {
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    expect(store.addElement).toHaveBeenCalled()
  })

  it('вызывает addCompositeElement при клике по кнопке составной сущности', async () => {
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(store.addCompositeElement).toHaveBeenCalled()
  })

  it('переключает режим добавления связи и отображает селекты', async () => {
    const relationButton = wrapper.findAll('button')[2]
    await relationButton.trigger('click')
    expect(store.isAddingRelation).toBe(true)
    expect(wrapper.find('.type-of-relation').exists()).toBe(true)
  })

  it('изменяет кардинальности при выборе опций', async () => {
    store.isAddingRelation = true
    await wrapper.vm.$nextTick()

    const selects = wrapper.findAll('select')
    await selects[0].setValue('M')
    await selects[1].setValue('0..1')

    expect(store.relationType.first).toBe('M')
    expect(store.relationType.second).toBe('0..1')
  })

  it('вызывает convertToSql и открывает модалку', async () => {
    const convertBtn = wrapper.find('.convert')
    await convertBtn.trigger('click')

    expect(store.convertToSql).toHaveBeenCalled()
    expect(wrapper.find('.modal-mock').exists()).toBe(true)
  })
})
