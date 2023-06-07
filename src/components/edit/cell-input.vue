<template>
  <div class="cell-input" :style="{ height: `${currentHeight}px` }">
    <textarea rows="1" :style="{ height: `${currentHeight}px` }" class="cell-input-inner" ref="inputEl" size="mini" v-model.trim="newValue" @blur="handleBlur" @input="updateHeight" />
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: Number,
      required: true,
    },
    value: {
      type: [String, Number],
      required: false,
      default: '',
    },
  },
  data() {
    return {
      newValue: '',
      currentHeight: this.height,
    };
  },
  mounted() {
    this.newValue = this.value;
    // 用户双击后，让其处于获取焦点的状态
    this.$refs.inputEl.focus();
  },
  methods: {
    updateHeight() {
      const textarea = this.$refs.inputEl;
      textarea.style.height = 'auto';
      this.currentHeight = textarea.scrollHeight;
      textarea.style.height = `${this.currentHeight}px`;
      this.$emit('input', this.value); // 将自适应高度 textarea 的值传递给父组件
    },
    handleBlur() {
      if (this.newValue !== this.value) {
        this.$emit('change', this.newValue);
      }
      this.$emit('close');
    },
  },
};
</script>

<style>
.cell-input {
  width: 100%;
  height: 100%;
  background-color: transparent;
  font-size: inherit;
  .cell-input-inner {
    margin: 0;
    padding: 0;
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
  }
}
</style>
