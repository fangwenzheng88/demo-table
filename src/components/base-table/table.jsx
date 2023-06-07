import { getScrollbarWidth, debounce } from './utils';
import { useDrag, useHover } from './store.js';
export default {
  name: 'BaseTable',
  props: {
    maxHeight: {
      type: String,
      required: false,
      default: undefined,
    },
    rowKey: {
      type: String,
      required: false,
      default: 'id',
    },
    columns: {
      type: Array,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    customTr: {
      type: Function,
      required: false,
      default: () => null,
    },
    spanMethod: {
      type: Function,
      required: false,
      default: () => {
        return { rowspan: 1, colspan: 1 };
      },
    },
    rowClass: {
      type: Function,
      required: false,
      default: () => {
        return {};
      },
    },
    rowStyle: {
      type: Function,
      required: false,
      default: () => {
        return {};
      },
    },
    allowDragMethod: {
      type: Function,
      required: false,
      default: () => true,
    },
    allowDropMethod: {
      type: Function,
      required: false,
      default: () => true,
    },
    onDrop: {
      type: Function,
      required: false,
      default: () => {},
    },
    defaultExpandAll: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    const dragStore = useDrag({
      onDrop: this.onDrop,
    });
    const hoverStore = useHover();
    return {
      dragStore,
      hoverStore,
      bodyWrapWidth: 0,
      columnWidths: [],
      scrollBarWidth: 15,
      dragPoxy: {
        visible: false,
        left: 0,
      },
      isScrollToRight: false,
      isScrollToLeft: true,
      isScrollX: false,
      isScrollY: false,
      expandedKeys: [],
      collapsedKeys: [],
      expandAll: this.defaultExpandAll,
    };
  },
  computed: {
    tableWidth() {
      let tableWidth = this.columnWidths.reduce((total, column) => {
        total += column.width;
        return total;
      }, 0);
      return tableWidth;
    },
    hasGutter() {
      if (this.bodyWrapWidth - this.tableWidth >= 1) {
        return false;
      } else {
        return true;
      }
    },
    tableSpan() {
      const span = {};
      if (this.spanMethod) {
        this.data.forEach((record, rowIndex) => {
          this.columns.forEach((column, columnIndex) => {
            const { rowspan = 1, colspan = 1 } =
              this.spanMethod?.({
                record: record.raw,
                column,
                rowIndex,
                columnIndex,
              }) ?? {};
            if (rowspan > 1 || colspan > 1) {
              span[`${rowIndex}-${columnIndex}`] = [rowspan, colspan];
            }
          });
        });
      }

      return span;
    },
    removedCells() {
      const data = [];
      for (const indexKey of Object.keys(this.tableSpan)) {
        const indexArray = indexKey.split('-').map((item) => Number(item));
        const span = this.tableSpan[indexKey];
        for (let i = 1; i < span[0]; i++) {
          data.push(`${indexArray[0] + i}-${indexArray[1]}`);
          for (let j = 1; j < span[1]; j++) {
            data.push(`${indexArray[0] + i}-${indexArray[1] + j}`);
          }
        }
        for (let i = 1; i < span[1]; i++) {
          data.push(`${indexArray[0]}-${indexArray[1] + i}`);
        }
      }
      return data;
    },
  },
  mounted() {
    this.scrollBarWidth = getScrollbarWidth();
    this.initColumnsWidth();
    this.listenerTableBodyWrapResize();
    this.listenerTableBodyResize();
  },
  methods: {
    listenerTableBodyWrapResize() {
      const el = this.$refs.bodyWrapEl;
      const resizeObserver = new ResizeObserver(
        debounce(async (entries) => {
          this.scrollBarWidth = getScrollbarWidth();
          const width = entries[0].contentRect.width;
          if (this.bodyWrapWidth != width) {
            this.bodyWrapWidth = width;
          }
          if (el.scrollHeight > el.clientHeight) {
            this.isScrollY = true;
          } else {
            this.isScrollY = false;
          }
          this.setColumnsWidth();
          if (this.tableWidth - this.bodyWrapWidth >= 1) {
            this.isScrollX = true;
          } else {
            this.isScrollX = false;
          }

          await this.$nextTick();
          this.isScrollToRight = el.scrollLeft >= el.scrollWidth - el.offsetWidth;
          this.isScrollToLeft = el.scrollLeft === 0;
        })
      );
      // 监听元素
      resizeObserver.observe(el);

      this.$once('hook:beforeDestory', () => {
        resizeObserver.unobserve(el);
      });
    },
    initColumnsWidth() {
      let el = this.$refs.bodyWrapEl;
      if (!el) {
        return;
      }
      let width = el.offsetWidth;
      let totalWidth = 0;
      let autoWidthColumnTotal = 0;
      this.columns.forEach((col) => {
        if (col.width !== undefined) {
          totalWidth += col.width;
        } else {
          autoWidthColumnTotal += 1;
        }
      });
      this.columnWidths = this.columns.map((col) => {
        let calcColumnWidth = 0;
        if (col.width === undefined) {
          if (totalWidth < width) {
            calcColumnWidth = Math.max((width - totalWidth) / autoWidthColumnTotal, 80);
          } else {
            calcColumnWidth = 80;
          }
        } else {
          calcColumnWidth = col.width;
        }
        if (autoWidthColumnTotal === 0 && totalWidth < width) {
          calcColumnWidth += (calcColumnWidth / totalWidth) * (width - totalWidth);
        }
        return {
          dataIndex: col.dataIndex,
          originWidth: col.width,
          width: calcColumnWidth,
          resized: false,
        };
      });
    },
    setColumnsWidth() {
      let el = this.$refs.bodyWrapEl;
      if (!el) {
        return;
      }
      let width = el.offsetWidth;
      if (this.isScrollY) {
        width -= this.scrollBarWidth;
      }
      let totalWidth = 0;
      let autoWidthColumnTotal = 0;
      let autoWdith = 0;
      this.columnWidths.forEach((col) => {
        if (col.resized !== true) {
          if (col.originWidth !== undefined) {
            totalWidth += col.originWidth;
            autoWdith += col.originWidth;
          } else {
            autoWidthColumnTotal += 1;
          }
        } else {
          totalWidth += col.width;
        }
      });
      this.columnWidths.forEach((col) => {
        let calcColumnWidth = 0;
        if (!col.resized) {
          if (col.originWidth === undefined) {
            if (totalWidth < width) {
              calcColumnWidth = Math.max((width - totalWidth) / autoWidthColumnTotal, 80);
            } else {
              calcColumnWidth = 80;
            }
          } else {
            calcColumnWidth = col.originWidth;
          }
          if (autoWidthColumnTotal === 0 && totalWidth < width) {
            calcColumnWidth += (calcColumnWidth / autoWdith) * (width - totalWidth);
          }
        } else {
          calcColumnWidth = col.width;
        }
        col.width = calcColumnWidth;
      });
    },
    listenerTableBodyResize() {
      const ele = this.$refs.tableBodyEl;
      const resizeObserver = new ResizeObserver(
        debounce(async () => {
          let el = this.$refs.bodyWrapEl;
          if (el) {
            if (el.scrollHeight > el.clientHeight) {
              this.isScrollY = true;
            } else {
              this.isScrollY = false;
            }
            this.setColumnsWidth();
            if (this.tableWidth - this.bodyWrapWidth >= 1) {
              this.isScrollX = true;
            } else {
              this.isScrollX = false;
            }

            await this.$nextTick();
            this.isScrollToRight = el.scrollLeft >= el.scrollWidth - el.offsetWidth;
            this.isScrollToLeft = el.scrollLeft === 0;
          }
        })
      );
      // 监听元素
      resizeObserver.observe(ele);
      this.$once('hook:beforeDestory', () => {
        resizeObserver.unobserve(ele);
      });
    },
    onScroll(e) {
      const currentTarget = e.currentTarget;
      this.$refs.headerWrapEl.scrollLeft = currentTarget.scrollLeft;
      this.isScrollToRight = currentTarget.scrollLeft >= currentTarget.scrollWidth - currentTarget.offsetWidth;
      this.isScrollToLeft = currentTarget.scrollLeft === 0;
    },
    handleMouseDown(e, column, index) {
      this.draggingColumn = this.columnWidths[index];
      this.startX = e.clientX;
      this.startWidth = this.draggingColumn.width;
      this.draggingColumn.resized = true;
      document.addEventListener('mouseup', this.handleMouseUp);
      document.addEventListener('mousemove', this.handleMouseMove);
      this.handleMouseMove(e);
      this.dragPoxy.visible = true;
    },
    handleMouseMove(e) {
      if (this.draggingColumn) {
        this.dragPoxy.left = e.clientX - this.$el.getBoundingClientRect().left;
      }
    },
    handleMouseUp(e) {
      if (this.draggingColumn) {
        const diff = e.clientX - this.startX;
        this.draggingColumn.width = this.startWidth + diff;
      }
      document.removeEventListener('mouseup', this.handleMouseUp);
      document.removeEventListener('mousemove', this.handleMouseMove);
      this.dragPoxy.visible = false;
      this.draggingColumn = null;
      this.startX = 0;
      this.startWidth = 0;
    },
    getFixedStyle(column, index, type) {
      if (column.fixed === 'left') {
        const left = this.columnWidths.slice(0, index).reduce((total, column) => {
          total += column.width;
          return total;
        }, 0);
        return { left: `${left}px` };
      } else if (column.fixed === 'right') {
        let right = this.columnWidths.slice(index + 1, this.columnWidths.length).reduce((total, column) => {
          total += column.width;
          return total;
        }, 0);
        if (this.isScrollY && type === 'th') {
          right += this.scrollBarWidth;
        }
        console.log(right, type);
        return { right: `${right}px` };
      } else {
        return {};
      }
    },
    isFirstFixedRight(index) {
      let flag = false;
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].fixed === 'right') {
          if (i === index) {
            flag = true;
          } else {
            flag = false;
          }
          break;
        }
      }
      return flag;
    },
    isLastFixedLeft(index) {
      let flag = false;
      for (let i = this.columns.length - 1; i >= 0; i--) {
        if (this.columns[i].fixed === 'left') {
          if (i === index) {
            flag = true;
          } else {
            flag = false;
          }
          break;
        }
      }
      return flag;
    },
    renderTbody() {
      return this.data.map((record, rowIndex) => {
        return this.renderTr({ record, rowIndex, path: [] });
      });
    },
    renderTr({ record, rowIndex, path }) {
      const tr = this.customTr({ record, rowIndex, path });
      if (typeof tr === 'string') {
        return this.$scopedSlots[tr]({ record, rowIndex });
      } else if (tr) {
        return tr;
      }

      const currentPath = [...path, rowIndex];

      const dragTargetEvent = {
        onDragenter: (ev) => {
          const allowDrop =
            this.allowDropMethod({
              targetKey: record[this.rowKey],
              targetIndex: rowIndex,
              targetPath: currentPath,
              sourceIndex: this.dragStore.sourceIndex,
              sourceKey: this.dragStore.sourceKey,
              sourcePath: this.dragStore.sourcePath,
            }) ?? true;
          if (!allowDrop) return;
          this.dragStore.handleDragEnter(ev, { targetKey: record[this.rowKey], targetIndex: rowIndex, targetPath: currentPath });
          this.dragStore.proxyPosition = ev.currentTarget.getBoundingClientRect().bottom - this.$el.getBoundingClientRect().top - 2;
        },
        onDragover: (ev) => {
          const allowDrop =
            this.allowDropMethod({
              targetKey: record[this.rowKey],
              targetIndex: rowIndex,
              targetPath: currentPath,
              sourceIndex: this.dragStore.sourceIndex,
              sourceKey: this.dragStore.sourceKey,
              sourcePath: this.dragStore.sourcePath,
            }) ?? true;
          if (!allowDrop) return;
          this.dragStore.handleDragover(ev);
        },
        onDrop: (ev) => {
          const allowDrop =
            this.allowDropMethod({
              targetKey: record[this.rowKey],
              targetIndex: rowIndex,
              targetPath: currentPath,
              sourceIndex: this.dragStore.sourceIndex,
              sourceKey: this.dragStore.sourceKey,
              sourcePath: this.dragStore.sourcePath,
            }) ?? true;
          if (!allowDrop) return;
          this.dragStore.handleDrop(ev);
        },
      };

      const hoverEvent = {
        onMouseenter: (ev) => {
          this.hoverStore.handleMouseenter(ev, record[this.rowKey], record);
        },
        onMouseleave: (ev) => {
          this.hoverStore.handleMouseleave(ev);
        },
      };
      const expanded = (this.expandAll && !this.collapsedKeys.includes(record[this.rowKey])) || this.expandedKeys.includes(record[this.rowKey]);
      return [
        <tr
          class={[
            'base-table__tr',
            { 'base-table__tr-hover': this.hoverStore.activeKey === record[this.rowKey], 'base-table__tr-drag': this.dragStore.sourceKey === record[this.rowKey] },
            this.rowClass({ record, rowIndex }),
          ]}
          onMouseenter={hoverEvent.onMouseenter}
          onMouseleave={hoverEvent.onMouseleave}
          onDragenter={dragTargetEvent.onDragenter}
          onDragover={dragTargetEvent.onDragover}
          onDrop={dragTargetEvent.onDrop}
          key={record[this.rowKey]}
        >
          {this.columns.map((column, columnIndex) => {
            return this.renderTd({ record, rowIndex, column, columnIndex, path: currentPath });
          })}
        </tr>,
        expanded ? this.renderChildren({ children: record.children, path: currentPath }) : null,
      ];
    },
    renderChildren({ children, path }) {
      if (Array.isArray(children)) {
        return children.map((el, i) => {
          return this.renderTr({ record: el, rowIndex: i, path: path });
        });
      }
    },
    renderSortTd({ record, rowIndex, column, columnIndex, path }) {
      const allowDrag = this.allowDragMethod({ record, rowIndex }) ?? true;
      const dragSourceEvent = {
        draggable: allowDrag,
        onDragstart: (ev) => {
          if (!allowDrag) return;
          this.dragStore.handleDragStart(ev, { sourceKey: record[this.rowKey], sourceIndex: rowIndex, data: record, sourcePath: path });
        },
        onDragend: (ev) => {
          if (!allowDrag) return;
          this.dragStore.handleDragEnd(ev);
        },
      };

      const cellId = `${rowIndex}-${columnIndex}`;
      const [rowspan, colspan] = this.tableSpan[cellId] ?? [1, 1];
      if (this.removedCells.includes(cellId)) {
        return null;
      }

      return (
        <td
          rowSpan={rowspan}
          colSpan={colspan}
          class={[
            {
              'base-table__column-fixed': column.fixed,
              'base-table__fixed-right-is-first': this.isFirstFixedRight(columnIndex),
              'base-table__fixed-left-is-last': this.isLastFixedLeft(columnIndex),
            },
            'base-table__td',
          ]}
          style={this.getFixedStyle(column, columnIndex)}
          key={column.dataIndex}
        >
          <div
            class={[
              'base-table__drag-td base-table__cell',
              {
                'text-left': column.align === 'left',
                'text-right': column.align === 'right',
                'text-center': column.align === 'center',
              },
            ]}
          >
            <div
              class={['base-table__drag-handler', { 'base-table__drag-disabled': !dragSourceEvent.draggable }]}
              draggable={dragSourceEvent.draggable}
              onDragstart={dragSourceEvent.onDragstart}
              onDragend={dragSourceEvent.onDragend}
            >
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                class="arco-icon arco-icon-drag-dot-vertical"
                stroke-width="4"
                stroke-linecap="butt"
                stroke-linejoin="miter"
                width="14"
                height="14"
              >
                <path d="M17 8h2v2h-2V8ZM17 23h2v2h-2v-2ZM17 38h2v2h-2v-2ZM29 8h2v2h-2V8ZM29 23h2v2h-2v-2ZM29 38h2v2h-2v-2Z" fill="currentColor" stroke="none"></path>
                <path d="M17 8h2v2h-2V8ZM17 23h2v2h-2v-2ZM17 38h2v2h-2v-2ZM29 8h2v2h-2V8ZM29 23h2v2h-2v-2ZM29 38h2v2h-2v-2Z"></path>
              </svg>
            </div>
          </div>
        </td>
      );
    },
    renderExpandAllIcon({ column }) {
      if (column.type === 'expand') {
        const handleAdd = () => {
          this.expandAll = true;
          this.collapsedKeys = [];
        };

        const handleDelete = () => {
          this.expandAll = false;
          this.expandedKeys = [];
        };
        if (!this.expandAll) {
          return (
            <button onClick={handleAdd} type="button" class="base-table__expand-btn">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                class="arco-icon arco-icon-plus"
                stroke-width="4"
                stroke-linecap="butt"
                stroke-linejoin="miter"
              >
                <path d="M5 24h38M24 5v38"></path>
              </svg>
            </button>
          );
        } else {
          return (
            <button onClick={handleDelete} type="button" class="base-table__expand-btn">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                class="arco-icon arco-icon-minus"
                stroke-width="4"
                stroke-linecap="butt"
                stroke-linejoin="miter"
              >
                <path d="M5 24h38"></path>
              </svg>
            </button>
          );
        }
      } else {
        {
          return null;
        }
      }
    },
    renderExpandIcon({ record, column }) {
      if (column.type === 'expand' && Array.isArray(record.children)) {
        const expanded = (this.expandAll && !this.collapsedKeys.includes(record[this.rowKey])) || this.expandedKeys.includes(record[this.rowKey]);
        const handleAdd = (ev) => {
          ev.stopPropagation();
          const collapseIdx = this.collapsedKeys.indexOf(record[this.rowKey]);
          if (collapseIdx !== -1) {
            this.collapsedKeys.splice(collapseIdx, 1);
          }

          const idx = this.expandedKeys.indexOf(record[this.rowKey]);
          if (idx === -1) {
            this.expandedKeys.push(record[this.rowKey]);
          }
        };

        const handleDelete = (ev) => {
          ev.stopPropagation();
          const collapseIdx = this.collapsedKeys.indexOf(record[this.rowKey]);
          if (collapseIdx === -1) {
            this.collapsedKeys.push(record[this.rowKey]);
          }

          const idx = this.expandedKeys.indexOf(record[this.rowKey]);
          if (idx !== -1) {
            this.expandedKeys.splice(idx, 1);
          }
        };
        if (!expanded) {
          return (
            <button onClick={handleAdd} type="button" class="base-table__expand-btn">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                class="arco-icon arco-icon-plus"
                stroke-width="4"
                stroke-linecap="butt"
                stroke-linejoin="miter"
              >
                <path d="M5 24h38M24 5v38"></path>
              </svg>
            </button>
          );
        } else {
          return (
            <button onClick={handleDelete} type="button" class="base-table__expand-btn">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                class="arco-icon arco-icon-minus"
                stroke-width="4"
                stroke-linecap="butt"
                stroke-linejoin="miter"
              >
                <path d="M5 24h38"></path>
              </svg>
            </button>
          );
        }
      } else {
        {
          return null;
        }
      }
    },
    handleCellClick(ev, data) {
      this.$emit('cell-click', ev, data);
    },
    renderTd({ record, rowIndex, column, columnIndex, path }) {
      if (column.type === 'sort') {
        return this.renderSortTd({ record, rowIndex, column, columnIndex, path });
      }
      const cellId = `${rowIndex}-${columnIndex}`;
      const [rowspan, colspan] = this.tableSpan[cellId] ?? [1, 1];
      if (this.removedCells.includes(cellId)) {
        return null;
      }
      return (
        <td
          rowSpan={rowspan}
          colSpan={colspan}
          class={[
            {
              'base-table__column-fixed': column.fixed,
              'base-table__fixed-right-is-first': this.isFirstFixedRight(columnIndex),
              'base-table__fixed-left-is-last': this.isLastFixedLeft(columnIndex),
            },
            'base-table__td',
          ]}
          style={this.getFixedStyle(column, columnIndex)}
          key={column.dataIndex}
          onClick={(ev) => this.handleCellClick(ev, { record, rowIndex, column, columnIndex })}
        >
          <div
            class={[
              'base-table__cell',
              {
                'text-left': column.align === 'left',
                'text-right': column.align === 'right',
                'text-center': column.align === 'center',
              },
            ]}
          >
            {column.type === 'expand' && path.length > 1 && <div style={`padding-left:${20 * (path.length - 1)}px`}></div>}
            {this.renderExpandIcon({ record, column })}
            <span class="base-table__td-content">{this.renderCell(record, rowIndex, column, columnIndex)}</span>
          </div>
        </td>
      );
    },
    renderCell(record, rowIndex, column, columnIndex) {
      if (column.slotName && this.$scopedSlots[column.slotName]) {
        return this.$scopedSlots[column.slotName]({
          record,
          rowIndex,
          column,
          columnIndex,
        });
      } else {
        return record[column.dataIndex];
      }
    },
  },
  render() {
    const renderEmptBlock = () => {
      if (this.data && this.data.length > 0) {
        return null;
      }
      return <div class="base-table__empty-block">暂无数据</div>;
    };
    return (
      <div
        class={[
          'base-table',
          {
            'base-table__scroll-x': this.isScrollX,
            'base-table__scroll-y': this.isScrollY,
            'base-table__scroll': this.isScrollX || this.isScrollY,
            'base-table__scroll-position-left': this.isScrollToLeft,
            'base-table__scroll-position-right': this.isScrollToRight,
            'base-table__scroll-position-middle': !this.isScrollToLeft && !this.isScrollToRight,
          },
        ]}
      >
        <div class="base-table__header-wrapper" ref="headerWrapEl">
          <table class="base-table__element" cellpadding="0" cellspacing="0" style={{ width: `${this.tableWidth}px` }}>
            <colgroup>
              {this.columnWidths.map((column) => {
                return (
                  <col
                    key={column.dataIndex}
                    style={{
                      minWidth: `${column.width}px`,
                      width: `${column.width}px`,
                      maxWidth: `${column.width}px`,
                    }}
                  />
                );
              })}
              <col
                style={{
                  minWidth: `${this.scrollBarWidth}px`,
                  width: `${this.scrollBarWidth}px`,
                  maxWidth: `${this.scrollBarWidth}px`,
                }}
              ></col>
            </colgroup>
            <thead>
              <tr class="base-table__tr">
                {this.columns.map((column, index) => {
                  return (
                    <th
                      class={[
                        {
                          'base-table__thead-fixed': column.fixed,
                          'base-table__fixed-right-is-first': this.isFirstFixedRight(index),
                          'base-table__fixed-left-is-last': this.isLastFixedLeft(index),
                        },
                        'base-table__th',
                      ]}
                      style={this.getFixedStyle(column, index, 'th')}
                      key={column.dataIndex}
                    >
                      <div class="base-table__cell">
                        {this.renderExpandAllIcon({ column })}
                        <span class="base-table__th-title">{column.title}</span>
                      </div>
                      <div class="base-table__resize-handle" onMousedown={(e) => this.handleMouseDown(e, column, index)}></div>
                    </th>
                  );
                })}
                {this.isScrollY && <th class="base-table__th base-table__gutter" style={{ width: `${this.scrollBarWidth}px`, visibility: this.hasGutter ? 'visible' : 'hidden' }}></th>}
              </tr>
            </thead>
          </table>
        </div>
        <div ref="bodyWrapEl" class="base-table__body-wrapper" style={{ maxHeight: this.maxHeight ? this.maxHeight : 'unset' }} onScroll={this.onScroll}>
          <table ref="tableBodyEl" class="base-table__element base-table__body" cellpadding="0" cellspacing="0" style={{ width: this.tableWidth ? `${this.tableWidth}px` : '100%' }}>
            <colgroup>
              {this.columnWidths.map((column) => {
                return (
                  <col
                    key={column.dataIndex}
                    style={{
                      minWidth: `${column.width}px`,
                      width: `${column.width}px`,
                      maxWidth: `${column.width}px`,
                    }}
                  />
                );
              })}
            </colgroup>
            <tbody class="base-table__body">{this.renderTbody()}</tbody>
          </table>
          {renderEmptBlock()}
        </div>
        <div
          class="base-table__column-resize-proxy"
          style={{
            display: this.dragPoxy.visible ? 'block' : 'none',
            left: `${this.dragPoxy.left}px`,
          }}
        ></div>
        <div
          class="base-table__drag-proxy"
          style={{
            display: this.dragStore.dragging ? 'block' : 'none',
            top: `${this.dragStore.proxyPosition}px`,
          }}
        ></div>
      </div>
    );
  },
};
