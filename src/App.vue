<template>
  <div id="app">
    <base-table
      max-height="700px"
      row-key="key"
      :columns="columns"
      :data="tableData"
      :custom-tr="renderTr"
      :span-method="spanMethod"
      :allow-drag-method="allowDragMethod"
      :allow-drop-method="allowDropMethod"
      :onDrop="onDrop"
    >
      <template #name="{ record, column, rowIndex }">
        <span>{{ rowIndex }}</span>
        <a>{{ record[column.dataIndex] }}</a>
      </template>
      <template #header-tr="{ record }">
        <tr class="base-table__tr">
          <td class="base-table__td" :colspan="columns.length">
            <div class="base-table__cell">{{ record.name }}</div>
          </td>
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
          type: 'sort',
          width: 200,
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
          width: 300,
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
    /* renderTr(record, rowIndex) {
      if (rowIndex % 4 === 0) {
        return (
          <tr class="base-table__tr">
            <td class="base-table__td" colspan={this.columns.length}>
              12341234141
            </td>
          </tr>
        );
      } else {
        return null;
      }
    }, */
    // eslint-disable-next-line no-unused-vars
    spanMethod({ record, rowIndex, column, columnIndex }) {
      /* if (rowIndex === 1 && columnIndex === 0) {
        return {
          rowspan: 2,
          colspan: 2,
        };
      }
      /* if (rowIndex % 4 === 0) {
        return { colspan: this.columns.length };
      } */
    },
    renderTr(record, rowIndex) {
      if (rowIndex % 4 === 0) {
        return 'header-tr';
      } else {
        return null;
      }
    },
    allowDragMethod({ rowIndex }) {
      if (rowIndex === 1) {
        return false;
      }
    },
    allowDropMethod({ sourceIndex, targetIndex }) {
      if (Math.abs(sourceIndex - targetIndex) < 2) {
        return true;
      } else {
        return false;
      }
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
