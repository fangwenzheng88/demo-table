import Vue from 'vue';
export function useDrag({ onDrop }) {
  const DragStore = Vue.extend({
    data() {
      return {
        dragging: false,
        sourceKey: '',
        sourceIndex: undefined,
        sourcePath: [],
        targetKey: '',
        targetIndex: undefined,
        targetPath: [],
        data: {},
        proxyPosition: 0,
      };
    },
    methods: {
      clearDragState() {
        this.dragging = false;
        this.sourceKey = '';
        this.sourcePath = [];
        this.targetPath = [];
        this.targetKey = '';
        this.targetIndex = undefined;
        this.data = {};
      },

      handleDragStart(ev, { sourceKey, sourceIndex, data, sourcePath }) {
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
        this.sourcePath = sourcePath;
        this.data = data;
      },

      handleDragEnter(ev, { targetKey, targetIndex, targetPath }) {
        if (ev.dataTransfer) {
          ev.dataTransfer.dropEffect = 'move';
        }
        this.targetKey = targetKey;
        this.targetIndex = targetIndex;
        this.targetPath = targetPath;
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
        onDrop({
          sourceKey: this.sourceKey,
          sourceIndex: this.sourceIndex,
          sourcePath: this.sourcePath,
          targetKey: this.targetKey,
          targetIndex: this.targetIndex,
          targetPath: this.targetPath,
          data: this.data,
        });
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
        data: {},
      };
    },
    computed: {
      isHover() {
        return !!this.activeKey;
      },
    },
    methods: {
      clearDragState() {
        this.activeKey = '';
        this.data = {};
      },

      handleMouseenter(ev, activeKey, data) {
        this.activeKey = activeKey;
        this.data = data;
      },

      handleMouseleave(ev) {
        this.clearDragState();
        ev.preventDefault();
      },
    },
  });

  return new HoverStore();
}
