<template>
  <div id="app">
    <base-table
      :max-height="maxHeight"
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
      <template #name="{ record, column }">
        <span>{{ record[column.dataIndex] }}</span>
        <i style="position: absolute; top: 50%; right: 2px; transform: translateY(-50%)" class="el-icon-edit"></i>
      </template>
    </base-table>

    <button @click="onAdd">onAdd</button>
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
      maxHeight: 500,
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
          minWidth: 300,
          tooltip: true,
          slotName: 'name',
        },
        {
          title: '数量',
          dataIndex: 'salary',
          tooltip: true,
          minWidth: 300,
          slotName: 'name',
        },
        {
          title: '总价',
          dataIndex: 'address',
          minWidth: 300,
          tooltip: true,
        },
        {
          title: '单价',
          dataIndex: 'right',
          tooltip: true,
          minWidth: 300,
        },
        {
          title: 'select',
          dataIndex: 'select',
          minWidth: 300,
          tooltip: true,
        },
      ],
      tableData: [],
    };
  },
  methods: {
    cellClick(ev, data) {
      console.log('cellClick', ev, data);
      const { record, column } = data;
      const value = record[column.dataIndex];
      if (data.column.dataIndex === 'name') {
        editor.input({
          event: ev,
          value: value,
          callback(newValue, oldValue) {
            console.log(newValue, oldValue);
            data.record[data.column.dataIndex] = newValue;
          },
        });
      } else if (data.column.dataIndex === 'salary') {
        editor.inputNumber({
          event: ev,
          value: value,
          callback(newValue, oldValue) {
            console.log(newValue, oldValue);
            data.record[data.column.dataIndex] = newValue;
          },
        });
      } else if (data.column.dataIndex === 'address') {
        editor.textarea({
          event: ev,
          value: value,
          callback(newValue, oldValue) {
            console.log(newValue, oldValue);
            data.record[data.column.dataIndex] = newValue;
          },
        });
      } else if (data.column.dataIndex === 'select') {
        editor.select({
          event: ev,
          value: value,
          options: [
            {
              value: '选项1',
              label: '黄金糕',
            },
            {
              value: '选项2',
              label: '双皮奶',
            },
            {
              value: '选项3',
              label: '蚵仔煎',
            },
            {
              value: '选项4',
              label: '龙须面',
            },
            {
              value: '选项5',
              label: '北京烤鸭',
            },
          ],
          callback(newValue, oldValue) {
            console.log(newValue, oldValue);
            data.record[data.column.dataIndex] = newValue;
          },
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
    onAdd() {
      this.tableData.push(
        {
          key: '11', // key唯一不可缺少，字段名称有row-key参数决定
          name: 'Jane Doe',
          salary: 23000,
          address: '32 Park Road, London',
          email: 'jane.doe@example.com',
          select: '选项1',
          children: [
            {
              key: '11-1',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '11-2',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '11-3',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
          ],
        },
        {
          key: '12',
          name: 'Jane Doe',
          salary: 23000,
          address: '32 Park Road, London',
          email: 'jane.doe@example.com',
          children: [
            {
              key: '12-1',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '12-2',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
            {
              key: '12-3',
              name: 'Jane Doe',
              salary: 23000,
              address: '32 Park Road, London',
              email: 'jane.doe@example.com',
            },
          ],
        }
      );
    },
  },
};
</script>

<style lang="scss">
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
