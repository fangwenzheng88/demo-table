<template>
  <div id="app">
    <base-table max-height="300px" row-key="key" :columns="columns" :data="tableData"></base-table>

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
          title: 'Name',
          dataIndex: 'name',
          fixed: 'left',
          width: 100,
        },
        {
          title: 'Salary',
          dataIndex: 'salary',
          width: 100,
        },
        {
          title: 'Address',
          dataIndex: 'address',
          width: 100,
        },
        {
          title: 'right',
          dataIndex: 'right',
          width: 100,
          fixed: 'right',
        },
        {
          title: 'Email',
          dataIndex: 'email',
          width: 300,
          fixed: 'right',
        },
      ],
      tableData: [],
      key: 0,
    };
  },
  methods: {
    onAdd() {
      for (let i = 0; i < 5; i++) {
        this.tableData.push({
          key: this.key++,
          name: 'Jane Doe',
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
