<template>
  <div class="cell-input-number">
    <input class="cell-input-inner" ref="inputEl" size="mini" v-model.trim="newValue" @blur="handleBlur" @input="handleInput" />
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
      currentHeight: this.height,
    };
  },
  mounted() {
    this.newValue = this.value;
    // 用户双击后，让其处于获取焦点的状态
    this.$refs.inputEl.focus();
  },
  methods: {
    handleInput(event) {
      const { value, selectionStart, selectionEnd } = event.target;

      // 只保留数字和小数点
      let pureValue = value.replace(/[^\d.]/g, '');

      // 如果小数点超过一个，只保留第一个
      const idx = pureValue.indexOf('.');
      if (idx !== -1 && pureValue.indexOf('.', idx + 1) !== -1) {
        pureValue = pureValue.slice(0, idx + 1) + pureValue.slice(idx + 1).replace(/\./g, '');
      }

      // 如果小数点在开头，前面加 0
      const isBeginningWithDot = pureValue[0] === '.';
      let newValue = isBeginningWithDot ? `0${pureValue}` : pureValue;

      // 根据光标位置修改输入值
      const num = Number(newValue);
      if (num > 0 && selectionStart !== selectionEnd) {
        const start = Math.max(selectionStart, newValue.indexOf(num));
        const end = Math.min(selectionEnd, newValue.indexOf(num) + String(num).length);
        newValue = newValue.slice(0, start) + num + newValue.slice(end, newValue.length);
      }

      // 更新输入框中的值和组件中的值
      event.target.value = newValue;
      this.newValue = newValue;
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

<style lang="scss">
.cell-input-number {
  width: 100%;
  height: 100%;
  background-color: #fff;
  font-size: inherit;
  box-shadow: 0 0 24px #0000002e;
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
