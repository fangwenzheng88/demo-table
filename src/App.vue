<template>
  <div id="app">
    <base-table
      :line-clamp="2"
      default-expand-all
      row-key="key"
      :columns="columns"
      :data="tableData"
      :onDrop="onDrop"
      :allow-drop-method="allowDropMethod"
      :row-class="rowClass"
      @cell-click="cellClick"
    >
    </base-table>
  </div>
</template>

<script>
import BaseTable from './components/base-table/index.js';
import editor from './components/edit';

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
          width: 40,
          fixed: 'left',
          align: 'center',
        },
        {
          title: '名称',
          type: 'expand',
          dataIndex: 'name',
          width: 200,
          fixed: 'left',
          tooltip: true,
        },
        {
          title: '数量',
          dataIndex: 'salary',
          width: 400,
          tooltip: true,
        },
        {
          title: '总价',
          dataIndex: 'address',
          width: 400,
          tooltip: true,
        },
        {
          title: '单价',
          dataIndex: 'right',
          width: 400,
          tooltip: true,
        },
        {
          title: 'xxx',
          dataIndex: 'email',
          width: 400,
          tooltip: true,
        },
      ],
      tableData: [
        {
          key: '1', // key唯一不可缺少，字段名称有row-key参数决定
          name: 'Jane Doe',
          salary: 23000,
          address: '32 Park Road, London',
          email: 'jane.doe@example.com',
          children: [
            {
              key: '1-1',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '1-2',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '1-3',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
          ],
        },
        {
          key: '2',
          name: 'Jane Doe',
          salary: 23000,
          address: '32 Park Road, London',
          email: 'jane.doe@example.com',
          children: [
            {
              key: '2-1',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '2-2',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '2-3',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
          ],
        },
      ],
    };
  },
  methods: {
    cellClick(ev, data) {
      console.log('cellClick', ev, data);
      if (data.column.dataIndex === 'name') {
        editor.input(ev, data, (newValue, oldValue) => {
          console.log(newValue, oldValue);
          data.record[data.column.dataIndex] = newValue;
        });
      } else if (data.column.dataIndex === 'salary') {
        editor.inputNumber(ev, data, (newValue, oldValue) => {
          console.log(newValue, oldValue);
          data.record[data.column.dataIndex] = newValue;
        });
      }
    },
    rowClass({ record }) {
      if (Array.isArray(record.children) && record.children.length > 0) {
        return {
          'tr-bg': true,
        };
      } else {
        return {};
      }
    },
    allowDropMethod({ sourcePath, targetPath }) {
      // 只允许低层级拖拽到高层级中
      if (sourcePath.length < targetPath.length) {
        return false;
      }
    },
    onDrop(data) {
      console.log('onDrop', data);
      //[this.tableData[data.sourceIndex], this.tableData[data.targetIndex]] = [this.tableData[data.targetIndex], this.tableData[data.sourceIndex]];
    },
  },
};
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.tr-bg {
  .base-table__td {
    background-color: rgb(230, 246, 254);
  }
}
</style>
