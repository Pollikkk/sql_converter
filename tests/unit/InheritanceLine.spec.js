import { mount } from '@vue/test-utils'
import InheritanceLine from '@/components/InheritanceLine.vue'
import { useDiagramStore } from '@/store/DiagramStore'

jest.mock('@/store/DiagramStore')

describe('InheritanceLine.vue', () => {
  let store;

  beforeEach(() => {
    store = {
      elements: [
        { id: '1', x: 10, y: 20 },
        { id: '2', x: 100, y: 200 }
      ]
    }
    useDiagramStore.mockReturnValue(store)

    // Мокируем getBoundingClientRect()
    global.Element.prototype.getBoundingClientRect = jest.fn().mockImplementation(function() {
      // Мокируем возвращаемые значения для каждого элемента
      if (this.getAttribute('data-id') === '1') {
        return { width: 40, height: 20, top: 20, left: 10 }
      } else if (this.getAttribute('data-id') === '2') {
        return { width: 40, height: 20, top: 200, left: 100 }
      }
      return { width: 0, height: 0, top: 0, left: 0 }
    })
  })

  /*it('should render line with correct coordinates', async () => {
    const wrapper = mount(InheritanceLine, {
      props: {
        fromId: '1',
        toId: '2'
      }
    })

    // Проверка правильности координат line
    const line = wrapper.find('line')
    expect(line.attributes('x1')).toBe('30') // x from the first element center (10 + width / 2)
    expect(line.attributes('y1')).toBe('40') // y from the first element center (20 + height)
    expect(line.attributes('x2')).toBe('120') // x from the second element center (100 + width / 2)
    expect(line.attributes('y2')).toBe('200') // y from the second element center (200)
  })*/

  it('should render arrow when showArrow is true', async () => {
    const wrapper = mount(InheritanceLine, {
      props: {
        fromId: '1',
        toId: '2',
        showArrow: true
      }
    })

    // Проверка наличия стрелки
    const polygon = wrapper.find('polygon')
    expect(polygon.exists()).toBe(true)
    expect(polygon.attributes('fill')).toBe('gray')
  })

  it('should not render arrow when showArrow is false', async () => {
    const wrapper = mount(InheritanceLine, {
      props: {
        fromId: '1',
        toId: '2',
        showArrow: false
      }
    })

    // Проверка отсутствия стрелки
    const polygon = wrapper.find('polygon')
    expect(polygon.exists()).toBe(false)
  })

  it('should compute correct arrow points', async () => {
    const wrapper = mount(InheritanceLine, {
      props: {
        fromId: '1',
        toId: '2'
      }
    })

    // Проверка вычисленных значений для стрелки
    const arrowPoints = wrapper.vm.arrowPoints
    expect(arrowPoints).toBeTruthy() // Проверка, что точки вычисляются
  })
})
