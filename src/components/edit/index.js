import Vue from 'vue';
import CellInput from './cell-input.vue';
import CellInputNumber from './cell-input-number.vue';
import CellTextarea from './cell-textarea.vue';
import CellSelect from './cell-select.vue';
export default {
  input(config) {
    useEditor(config, 'input');
  },
  inputNumber(config) {
    useEditor(config, 'input-number');
  },
  select(config) {
    useEditor(config, 'select');
  },
  textarea(config) {
    const { event: ev, value, callback } = config;
    const tdEl = ev.currentTarget;
    if (tdEl.classList.contains('is-editor')) {
      return;
    }
    tdEl.classList.add('is-editor');
    const div = document.createElement('div');
    const inner = document.createElement('div');
    div.appendChild(inner);
    div.classList.add('base-table__td-content');
    document.body.appendChild(div);
    const InputConstructor = Vue.extend(CellTextarea);
    const instance = new InputConstructor({
      propsData: {
        value: value,
      },
    }).$mount(inner);
    instance.$on('change', (newVlaue) => {
      if (typeof callback === 'function') {
        callback(newVlaue, value);
      }
    });
    instance.$on('close', () => {
      instance.$destroy();
      document.body.removeChild(div);
      tdEl.classList.remove('is-editor');
    });
  },
};

function useEditor(config, componentName) {
  const { event: ev, value, callback } = config;
  const tdEl = ev.currentTarget;
  if (tdEl.classList.contains('is-editor')) {
    return;
  }
  tdEl.classList.add('is-editor');
  const computedStyle = window.getComputedStyle(tdEl);
  const position = computedStyle.getPropertyValue('position');

  if (position === 'static') {
    tdEl.style.position = 'relative';
  }

  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.left = '0';
  div.style.top = '0';
  div.style.bottom = '0';
  div.style.right = '0';
  div.style.zIndex = '10';
  const inner = document.createElement('div');
  div.appendChild(inner);
  tdEl.appendChild(div);

  const Component = {
    'input': CellInput,
    'input-number': CellInputNumber,
    'select': CellSelect,
  };

  const propsData = {
    value: value,
  };
  if (componentName === 'select') {
    propsData.options = config.options;
  }

  const InputConstructor = Vue.extend(Component[componentName]);
  const instance = new InputConstructor({
    propsData: propsData,
  }).$mount(inner);
  instance.$on('change', (newValue) => {
    if (typeof callback === 'function') {
      callback(newValue, value);
    }
  });
  instance.$on('close', () => {
    instance.$destroy();
    tdEl.removeChild(div);
    tdEl.classList.remove('is-editor');
    tdEl.style.position = position;
  });
}
