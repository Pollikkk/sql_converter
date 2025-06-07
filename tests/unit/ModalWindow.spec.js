import { mount } from '@vue/test-utils'
import ModalWindow from '@/components/ModalWindow.vue'
import { useDiagramStore } from '@/store/DiagramStore'

// Мокаем Pinia store
jest.mock('@/store/DiagramStore', () => ({
  useDiagramStore: jest.fn(),
}))

describe('ModalWindow.vue', () => {
  let mockStore
  let clipboardWriteTextMock

  beforeEach(() => {
    mockStore = { sqlCode: 'SELECT * FROM users;' }
    useDiagramStore.mockReturnValue(mockStore)

    // Мокаем navigator.clipboard
    clipboardWriteTextMock = jest.fn().mockResolvedValue()
    global.navigator.clipboard = { writeText: clipboardWriteTextMock }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('показывает модальное окно, если isOpen = true', () => {
    const wrapper = mount(ModalWindow, {
      props: { isOpen: true },
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.sql-output').text()).toBe(mockStore.sqlCode)
  })

  it('не показывает модальное окно, если isOpen = false', () => {
    const wrapper = mount(ModalWindow, {
      props: { isOpen: false },
    })

    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('вызывает событие close при клике на кнопку "Закрыть"', async () => {
    const wrapper = mount(ModalWindow, {
      props: { isOpen: true },
    })

    await wrapper.find('.close-btn').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('копирует SQL-код в буфер и показывает "Скопировано"', async () => {
    jest.useFakeTimers()

    const wrapper = mount(ModalWindow, {
      props: { isOpen: true },
    })

    const copyButton = wrapper.find('.copy-btn')
    await copyButton.trigger('click')

    expect(clipboardWriteTextMock).toHaveBeenCalledWith(mockStore.sqlCode)
    expect(wrapper.text()).toContain('Скопировано')

    // Имитация задержки 2 сек
    jest.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Копировать')

    jest.useRealTimers()
  })
})
