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
      :spanMethod="spanMethod"
      @cell-click="cellClick"
      @add="handleAdd"
      @delete="handleDelete"
      @checkedAll="handleCheckedAll"
      :checkedKeys="checkedKeys"
      :custom-tr="renderTr"
    >
      <template #name="{ record, column }">
        <span>{{ record[column.dataIndex] }}</span>
        <i style="position: absolute; top: 50%; right: 2px; transform: translateY(-50%)" class="el-icon-edit"></i>
      </template>
      <template #header-tr="{ record }">
        <tr class="base-table__tr">
          <td class="base-table__td" :colspan="columns.length">
            <div class="base-table__cell">
              <el-tag size="mini">SS1</el-tag>
              <span>{{ record.name }}</span>
            </div>
          </td>
        </tr>
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
      columns: [
        {
          title: '序号',
          dataIndex: 'sort',
          type: 'sort',
          width: 100,
          fixed: 'left',
          align: 'left',
        },
        {
          title: '名称',
          type: 'expand',
          dataIndex: 'name',
          minWidth: 300,
          tooltip: true,
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
      checkedKeys: [],
    };
  },
  mounted() {
    this.onAdd();
  },
  methods: {
    renderTr({ path }) {
      if (path.length === 1) {
        return 'header-tr';
      } else {
        return null;
      }
    },
    handleAdd(data) {
      console.log('handleAdd', data);
    },
    handleDelete(data) {
      console.log('handleDelete', data);
    },
    handleCheckedAll(checkedAll) {
      if (checkedAll) {
        // 这里实现选择全部的功能
        this.checkedKeys.push('11-1-1');
      } else {
        this.checkedKeys = [];
      }
    },
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
    rowClass({ path }) {
      const level = path.length;
      return `tr-bg-${level}`;
    },
    spanMethod({ path, column }) {
      if (path.length === 2 && column.dataIndex === 'name') {
        return { rowspan: 1, colspan: this.columns.length - 1 };
      }
      return { rowspan: 1, colspan: 1 };
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
      this.tableData.push({
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
            children: [
              {
                key: '11-1-1',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
              {
                key: '11-1-2',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
              {
                key: '11-1-3',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
            ],
          },
          {
            key: '11-2',
            name: 'Jane Doe',
            salary: 23000,
            address: '32 Park Road, London',
            email: 'jane.doe@example.com',
            children: [
              {
                key: '11-2-1',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
              {
                key: '11-2-2',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
              {
                key: '11-2-3',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
            ],
          },
          {
            key: '11-3',
            name: 'Jane Doe',
            salary: 23000,
            address: '32 Park Road, London',
            email: 'jane.doe@example.com',
            children: [
              {
                key: '11-3-1',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
              {
                key: '11-3-2',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
              {
                key: '11-3-3',
                name: 'Jane Doe',
                salary: 23000,
                address: '32 Park Road, London',
                email: 'jane.doe@example.com',
              },
            ],
          },
        ],
      });
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
  padding: 20px;
}

.tr-bg-1 {
  .base-table__td {
    background-color: #fff;
  }
}
.tr-bg-2 {
  .base-table__td {
    background-color: rgb(230, 246, 254);
  }
}
</style>
