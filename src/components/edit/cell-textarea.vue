<template>
  <el-dialog title="编辑" :visible="true" width="600px" :before-close="onCancel">
    <el-input autofocus :autosize="{ minRows: 4 }" ref="inputEl" type="textarea" placeholder="请输入内容" v-model="newValue"> </el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      required: false,
      default: '',
    },
  },
  data() {
    return {
      newValue: '',
    };
  },
  mounted() {
    this.newValue = this.value;
    // 用户双击后，让其处于获取焦点的状态
    this.$nextTick(() => {
      this.$refs.inputEl.focus();
    });
  },
  methods: {
    onCancel() {
      this.$emit('close');
    },
    onConfirm() {
      if (this.newValue != this.value) {
        this.$emit('change', this.newValue);
      }
      this.onCancel();
    },
  },
};
</script>
