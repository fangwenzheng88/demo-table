import Vue from 'vue';

export function useDrag({ onDrop }) {
  const DragStore = Vue.extend({
    data() {
      return {
        dragging: false,
        sourceKey: '',
        sourceIndex: undefined,
        targetKey: '',
        targetIndex: undefined,
        data: {},
      };
    },
    methods: {
      clearDragState() {
        this.dragging = false;
        this.sourceKey = '';
        this.targetKey = '';
        this.targetIndex = undefined;
        this.data = {};
      },

      handleDragStart(ev, sourceKey, sourceIndex, data) {
        if (ev.dataTransfer) {
          ev.dataTransfer.effectAllowed = 'move';
          let el = ev.target;
          while (el.tagName !== 'TR') {
            el = el.parentElement;
          }
          el.style.opacity = '1';
          ev.dataTransfer.setDragImage(el, 0, 0);
        }
        this.dragging = true;
        this.sourceKey = sourceKey;
        this.sourceIndex = sourceIndex;
        this.data = data;
      },

      handleDragEnter(ev, targetKey, targetIndex) {
        if (ev.dataTransfer) {
          ev.dataTransfer.dropEffect = 'move';
        }
        this.targetKey = targetKey;
        this.targetIndex = targetIndex;
        ev.preventDefault();
      },

      handleDragLeave() {},

      handleDragover(ev) {
        if (ev.dataTransfer) {
          ev.dataTransfer.dropEffect = 'move';
        }
        ev.preventDefault();
      },

      handleDragEnd(ev) {
        if (ev.dataTransfer?.dropEffect === 'none') {
          this.clearDragState();
        }
      },

      handleDrop(ev) {
        onDrop({ sourceKey: this.sourceKey, sourceIndex: this.sourceIndex, targetKey: this.targetKey, targetIndex: this.targetIndex, data: this.data });
        this.clearDragState();
        ev.preventDefault();
      },
    },
  });

  return new DragStore();
}

export function useHover() {
  const HoverStore = Vue.extend({
    data() {
      return {
        activeKey: '',
      };
    },
    methods: {
      clearDragState() {
        this.activeKey = '';
      },

      handleMouseenter(ev, activeKey) {
        this.activeKey = activeKey;
      },

      handleMouseleave(ev) {
        this.clearDragState();
        ev.preventDefault();
      },
    },
  });

  return new HoverStore();
}
