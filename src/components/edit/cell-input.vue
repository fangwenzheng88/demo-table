<template>
  <div class="cell-input">
    <textarea rows="1" class="cell-input-inner" ref="inputEl" size="mini" v-model.trim="newValue" @blur="handleBlur" />
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
  },
  data() {
    return {
      newValue: '',
    };
  },
  mounted() {
    this.newValue = this.value;
    // 用户双击后，让其处于获取焦点的状态
    this.$refs.inputEl.focus();
  },
  methods: {
    handleBlur() {
      if (this.newValue !== this.value) {
        this.$emit('change', this.newValue);
      }
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss">
.cell-input {
  width: 100%;
  height: 100%;
  background-color: #fff;
  font-size: inherit;
  box-shadow: 0 0 24px #0000002e;
  overflow: hidden;
  .cell-input-inner {
    margin: 0;
    padding: 2px 8px;
    font-size: inherit;
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    background-color: transparent;
    line-height: 23px;
    resize: none;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: inherit;
    box-sizing: border-box;
  }
}
</style>
