<template>
  <div id="app">
    <base-table max-height="900px" row-key="key" :columns="columns" :data="tableData" :custom-tr="renderTr" :colspan="colspanMethods">
      <template #name="{ record, column, rowIndex }">
        <span>{{ rowIndex }}</span>
        <a>{{ record[column.dataIndex] }}</a>
      </template>
      <template #header-tr="{ record }">
        <tr class="base-table-tr">
          <td class="base-table-td" :colspan="columns.length">{{ record.name }}</td>
        </tr>
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
          title: 'Name',
          dataIndex: 'name',
          width: 600,
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
          width: 100,
        },
        {
          title: 'Email',
          dataIndex: 'email',
          width: 100,
        },
      ],
      tableData: [],
      key: 0,
    };
  },
  methods: {
    /* renderTr(record, rowIndex) {
      if (rowIndex % 4 === 0) {
        return (
          <tr class="base-table-tr">
            <td class="base-table-td" colspan={this.columns.length}>
              12341234141
            </td>
          </tr>
        );
      } else {
        return null;
      }
    }, */
    colspanMethods(record, rowIndex, column, columnIndex) {
      console.log(record, rowIndex, column, columnIndex);
      if (column.dataIndex === 'name') {
        return 2;
      } else {
        return 1;
      }
    },
    renderTr(record, rowIndex) {
      if (rowIndex % 4 === 0) {
        return 'header-tr';
      } else {
        return null;
      }
    },
    onAdd() {
      for (let i = 0; i < 5; i++) {
        this.tableData.push({
          key: this.key++,
          name: 'Jane Doe' + this.key++,
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
