<template>
  <div class="cell-input" :style="{ height: `${height}px` }">
    <textarea rows="1" :style="{ height: `${height}px` }" class="cell-input-inner" ref="inputEl" size="mini" v-model.trim="newValue" @blur="handleBlur" />
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
