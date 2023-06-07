<template>
  <div id="app">
    <base-table max-height="700px" row-key="key" :columns="columns" :data="tableData" :allow-drag-method="allowDragMethod" :allow-drop-method="allowDropMethod" :onDrop="onDrop">
      <template #name="{ record, column, rowIndex }">
        <span>{{ rowIndex }}</span>
        <a>{{ record[column.dataIndex] }}</a>
      </template>
    </base-table>

    <button @click="onAdd">添加</button>
    <button @click="onDelete">减少</button>
  </div>
</template>

<script>
import BaseTable from './components/base-table/index.js';

export default {
  name: 'App',
  components: {
    BaseTable,
  },
  data() {
    return {
      columns: [
        {
          title: '',
          dataIndex: 'sort',
          type: 'sort',
          width: 60,
          fixed: 'left',
          align: 'center',
        },
        {
          title: 'Name',
          dataIndex: 'name',
          width: 200,
          fixed: 'left',
        },
        {
          title: 'Salary',
          dataIndex: 'salary',
          width: 400,
        },
        {
          title: 'Address',
          dataIndex: 'address',
          width: 400,
        },
        {
          title: 'right',
          dataIndex: 'right',
          width: 400,
        },
        {
          title: 'Email',
          dataIndex: 'email',
          width: 400,
        },
      ],
      tableData: [],
      key: 0,
    };
  },
  mounted() {
    this.onAdd();
  },
  methods: {
    allowDragMethod({ rowIndex }) {
      if (rowIndex === 1) {
        return false;
      }
    },
    // eslint-disable-next-line no-unused-vars
    allowDropMethod({ sourceIndex, targetIndex }) {
      /* if (Math.abs(sourceIndex - targetIndex) < 2) {
        return true;
      } else {
        return false;
      } */
    },
    onDrop(data) {
      [this.tableData[data.sourceIndex], this.tableData[data.targetIndex]] = [this.tableData[data.targetIndex], this.tableData[data.sourceIndex]];
    },
    onAdd() {
      for (let i = 0; i < 5; i++) {
        this.key += 1;
        this.tableData.push({
          key: this.key,
          name: 'Jane Doe' + this.key,
          salary: 23000,
          address: '32 Park Road, London',
          email: 'jane.doe@example.com',
        });
      }
    },
    onDelete() {
      this.tableData.splice(0, 5);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
