import { mount } from '@vue/test-utils'
import RelationLine from '@/components/RelationLine.vue'
import ManyType from '@/components/relation_types/ManyType.vue'
import OneType from '@/components/relation_types/OneType.vue'
import OptionalOneType from '@/components/relation_types/OptionalOneType.vue'
import OptionalManyType from '@/components/relation_types/OptionalManyType.vue'

import { setActivePinia, createPinia } from 'pinia'
import { useDiagramStore } from '@/store/DiagramStore'

// Убираем jest.mock!

describe('RelationLine.vue', () => {
  const relation = {
    from: 1,
    fromAnchor: { name: 'top-left' },
    to: 2,
    toAnchor: { name: 'bottom-right' },
    fromType: 'M',
    toType: '1',
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    document.body.innerHTML = `
      <div data-id="1" style="width: 100px; height: 50px;"></div>
      <div data-id="2" style="width: 120px; height: 60px;"></div>
    `
    const div1 = document.querySelector('[data-id="1"]')
    const div2 = document.querySelector('[data-id="2"]')

    div1.getBoundingClientRect = jest.fn(() => ({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      top: 20,
      left: 10,
      right: 110,
      bottom: 70,
      toJSON: () => {},
    }))

    div2.getBoundingClientRect = jest.fn(() => ({
      x: 110,
      y: 120,
      width: 120,
      height: 60,
      top: 120,
      left: 110,
      right: 230,
      bottom: 180,
      toJSON: () => {},
    }))
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('рендерит линию с правильными координатами', () => {
    const wrapper = mount(RelationLine, {
      props: { relation, index: 0, selected: false },
    })

    const line = wrapper.find('line')
    expect(line.exists()).toBe(true)

    expect(Number(line.attributes('x1'))).not.toBeNaN()
    expect(Number(line.attributes('y1'))).not.toBeNaN()
    expect(Number(line.attributes('x2'))).not.toBeNaN()
    expect(Number(line.attributes('y2'))).not.toBeNaN()
  })

  it('рендерит правильные компоненты для fromType и toType', () => {
    const wrapper = mount(RelationLine, {
      props: { relation, index: 0, selected: false },
    })

    expect(wrapper.findComponent(ManyType).exists()).toBe(true)
    expect(wrapper.findComponent(OneType).exists()).toBe(true)
  })

  it('эмиттит событие toggle при клике на линию', async () => {
    const wrapper = mount(RelationLine, {
      props: { relation, index: 123, selected: false },
    })

    await wrapper.find('line').trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
    expect(wrapper.emitted('toggle')[0]).toEqual([123])
  })

  it('показывает кнопку удаления при selected и вызывает removeRelation при клике', async () => {
    const store = useDiagramStore()
    store.removeRelation = jest.fn()  // мокируем метод

    const wrapper = mount(RelationLine, {
      props: { relation, index: 5, selected: true },
    })

    const rect = wrapper.find('rect')
    const text = wrapper.find('text')

    expect(rect.exists()).toBe(true)
    expect(text.exists()).toBe(true)

    await rect.trigger('click')
    expect(store.removeRelation).toHaveBeenCalledWith(5)

    await text.trigger('click')
    expect(store.removeRelation).toHaveBeenCalledWith(5)
  })
})
