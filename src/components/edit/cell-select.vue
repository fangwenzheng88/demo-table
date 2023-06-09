<template>
  <div class="cell-select">
    <el-select automatic-dropdown ref="selectEl" v-model="newValue" placeholder="请选择" @visible-change="handleVisibleChange">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      required: false,
      default: '',
    },
    options: {
      type: Array,
      required: true,
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
      this.$refs.selectEl.focus();
    });
  },
  methods: {
    handleVisibleChange(visible) {
      if (visible === false) {
        if (this.newValue != this.value) {
          this.$emit('change', this.newValue);
        }
        this.$emit('close');
      }
    },
  },
};
</script>

<style lang="scss">
.cell-select {
  height: 100%;
  width: 100%;
  box-shadow: 0 0 24px #0000002e;
  .el-select {
    width: 100%;
    height: 100%;
    .el-input {
      width: 100%;
      height: 100%;
    }
    .el-input__inner {
      height: 100%;
      border: none;
      outline: none;
    }
  }
}
</style>
