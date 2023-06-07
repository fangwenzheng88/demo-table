import Vue from 'vue';
import CellInput from './cell-input.vue';
import CellInputNumber from './cell-input-number.vue';
export default {
  input(ev, { record, column }, callback) {
    const tdEl = ev.currentTarget;
    if (tdEl.classList.contains('is-editor')) {
      return;
    }
    tdEl.classList.add('is-editor');
    const cellEl = tdEl.querySelector('.base-table__cell');
    const div = document.createElement('div');
    const inner = document.createElement('div');
    div.appendChild(inner);
    div.classList.add('base-table__td-content');
    const contentEl = cellEl.querySelector('.base-table__td-content');
    const height = contentEl.offsetHeight;
    const display = contentEl.style.display;
    contentEl.style.display = 'none';
    cellEl.appendChild(div);
    const InputConstructor = Vue.extend(CellInput);
    const instance = new InputConstructor({
      propsData: {
        height,
        value: record[column.dataIndex],
      },
    }).$mount(inner);
    instance.$on('change', (value) => {
      if (typeof callback === 'function') {
        callback(value, record[column.dataIndex]);
      }
    });
    instance.$on('close', () => {
      instance.$destroy();
      cellEl.removeChild(div);
      contentEl.style.display = display;
      tdEl.classList.remove('is-editor');
    });
  },
  inputNumber(ev, { record, column }, callback) {
    const tdEl = ev.currentTarget;
    if (tdEl.classList.contains('is-editor')) {
      return;
    }
    tdEl.classList.add('is-editor');
    const cellEl = tdEl.querySelector('.base-table__cell');
    const div = document.createElement('div');
    const inner = document.createElement('div');
    div.appendChild(inner);
    div.classList.add('base-table__td-content');
    const contentEl = cellEl.querySelector('.base-table__td-content');
    const height = contentEl.offsetHeight;
    const display = contentEl.style.display;
    contentEl.style.display = 'none';
    cellEl.appendChild(div);
    const InputConstructor = Vue.extend(CellInputNumber);
    const instance = new InputConstructor({
      propsData: {
        height,
        value: record[column.dataIndex],
      },
    }).$mount(inner);
    instance.$on('change', (value) => {
      if (typeof callback === 'function') {
        callback(value, record[column.dataIndex]);
      }
    });
    instance.$on('close', () => {
      instance.$destroy();
      cellEl.removeChild(div);
      contentEl.style.display = display;
      tdEl.classList.remove('is-editor');
    });
  },
};
