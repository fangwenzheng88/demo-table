import { getScrollbarWidth, debounce, hasClass, getCell } from './utils';
import { useDrag, useHover } from './store.js';
import { Tooltip as ElTooltip, Checkbox as ElCheckbox } from 'ccxd-ux';
export default {
  name: 'BaseTable',
  props: {
    lineClamp: {
      type: Number,
      required: false,
      default: 1,
    },
    maxHeight: {
      type: Number,
      required: false,
      default: undefined,
    },
    height: {
      type: Number,
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
    checkedKeys: {
      type: Array,
      required: false,
      default() {
        return [];
      },
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
      tableBodyWrap: 0,
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
      tooltipContent: '',
      headerHeight: 48,
      scrollLeft: 0,
      isCheckedAll: false,
    };
  },
  computed: {
    tableBodyMaxHeight() {
      if (this.height || this.maxHeight) {
        return (this.height || this.maxHeight) - this.headerHeight;
      } else {
        return undefined;
      }
    },
    tableWidth() {
      let tableWidth = this.columnWidths.reduce((total, column) => {
        total += column.realWidth;
        return total;
      }, 0);
      return tableWidth;
    },
    hasGutter() {
      if (this.tableBodyWrap - this.tableWidth > this.scrollBarWidth + 1) {
        return false;
      } else {
        return true;
      }
    },
    flattenData() {
      const data = this.data ?? [];
      function flagTree(arr, path = []) {
        const flagArr = [];
        arr.forEach((item, index) => {
          const currentPath = path.concat(index);
          flagArr.push({
            record: item,
            path: currentPath,
          });
          if (Array.isArray(item.children)) {
            flagArr.push(...flagTree(item.children, currentPath));
          }
        });
        return flagArr;
      }
      return flagTree(data);
    },
    tableSpan() {
      const span = {};
      if (this.spanMethod) {
        this.flattenData.forEach(({ record, path }, rowIndex) => {
          this.columns.forEach((column, columnIndex) => {
            const { rowspan = 1, colspan = 1 } =
              this.spanMethod?.({
                record,
                column,
                rowIndex,
                columnIndex,
                path,
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
  created() {
    this.activateTooltip = debounce((tooltip) => tooltip.handleShowPopper());
    this.onScroll = debounce((e) => {
      const currentTarget = e.target;
      const scrollLeft = currentTarget.scrollLeft;
      if (this.scrollLeft != scrollLeft) {
        this.scrollLeft = scrollLeft;
        this.$refs.headerWrapEl.scrollLeft = currentTarget.scrollLeft;
        this.isScrollToRight = currentTarget.scrollLeft >= currentTarget.scrollWidth - currentTarget.offsetWidth;
        this.isScrollToLeft = currentTarget.scrollLeft === 0;
      }
    }, 4);
  },
  mounted() {
    this.scrollBarWidth = getScrollbarWidth();
    this.listenerTableHeaderResize();
    this.listenerTableBodyWrapResize();
  },
  methods: {
    listenerTableBodyWrapResize() {
      const el = this.$refs.bodyWrapEl;

      const fun = () => {
        console.count('listenerTableBodyWrapResize');
        const width = el.clientWidth;
        if (this.tableBodyWrap != width) {
          this.scrollBarWidth = getScrollbarWidth();
          this.tableBodyWrap = width;
        }
        this.updateTableLayout();
      };

      const resizeObserver = new ResizeObserver(debounce(fun));
      // 监听元素
      this.$nextTick(() => {
        resizeObserver.observe(el);
      });
      fun();
      this.$once('hook:beforeDestory', () => {
        resizeObserver.unobserve(el);
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

      if (this.columnWidths.length === 0) {
        this.columnWidths = this.columns.map((col) => {
          return {
            dataIndex: col.dataIndex,
            width: col.width,
            minWidth: col.minWidth,
            realWidth: col.width || col.minWidth || 80,
          };
        });
      }

      let minTotalWidth = 0;
      let autoWidthTotal = 0;
      this.columnWidths.forEach((col) => {
        minTotalWidth += col.width || col.minWidth || 80;
        if (col.width === undefined) {
          autoWidthTotal += col.minWidth || 80;
        }
      });
      this.columnWidths.forEach((col) => {
        let calcColumnWidth = 0;
        if (col.width !== undefined) {
          calcColumnWidth = col.width;
        } else {
          calcColumnWidth = col.minWidth || 80;
          if (width > minTotalWidth) {
            calcColumnWidth += (calcColumnWidth / autoWidthTotal) * (width - minTotalWidth);
          }
        }
        col.realWidth = calcColumnWidth;
      });
    },
    listenerTableHeaderResize() {
      const ele = this.$refs.headerWrapEl;
      const fun = () => {
        const height = ele.offsetHeight;
        if (height != this.headerHeight) {
          this.headerHeight = height;
        }
      };
      const resizeObserver = new ResizeObserver(debounce(fun));
      // 监听元素
      resizeObserver.observe(ele);
      fun();
      this.$once('hook:beforeDestory', () => {
        resizeObserver.unobserve(ele);
      });
    },
    async updateTableLayout() {
      let el = this.$refs.bodyWrapEl;
      if (el) {
        if (el.scrollHeight > el.offsetHeight) {
          this.isScrollY = true;
        } else {
          this.isScrollY = false;
        }
        this.setColumnsWidth();
        if (this.tableWidth - this.tableBodyWrap >= 1) {
          this.isScrollX = true;
        } else {
          this.isScrollX = false;
        }

        await this.$nextTick();
        this.isScrollToRight = el.scrollLeft >= el.scrollWidth - el.offsetWidth;
        this.isScrollToLeft = el.scrollLeft === 0;
      }
    },
    handleMouseDown(e, column, index) {
      this.draggingColumn = this.columnWidths[index];
      this.startX = e.clientX;
      this.startWidth = this.draggingColumn.realWidth;
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
      this.updateTableLayout();
    },
    getFixedStyle(column, index, type) {
      if (column.fixed === 'left') {
        const left = this.columnWidths.slice(0, index).reduce((total, column) => {
          total += column.realWidth;
          return total;
        }, 0);
        return { left: `${left}px` };
      } else if (column.fixed === 'right') {
        let right = this.columnWidths.slice(index + 1, this.columnWidths.length).reduce((total, column) => {
          total += column.realWidth;
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
      return this.flattenData.map(({ record, path }, rowIndex) => {
        return this.renderTr({ record, rowIndex, path });
      });
    },
    renderTr({ record, rowIndex, path }) {
      const dragTargetEvent = {
        onDragenter: (ev) => {
          const allowDrop =
            this.allowDropMethod({
              targetKey: record[this.rowKey],
              targetIndex: rowIndex,
              targetPath: path,
              sourceIndex: this.dragStore.sourceIndex,
              sourceKey: this.dragStore.sourceKey,
              sourcePath: this.dragStore.sourcePath,
            }) ?? true;
          if (!allowDrop) return;
          this.dragStore.handleDragEnter(ev, { targetKey: record[this.rowKey], targetIndex: rowIndex, targetPath: path });
          this.dragStore.proxyPosition = ev.currentTarget.getBoundingClientRect().bottom - this.$el.getBoundingClientRect().top - 2;
        },
        onDragover: (ev) => {
          const allowDrop =
            this.allowDropMethod({
              targetKey: record[this.rowKey],
              targetIndex: rowIndex,
              targetPath: path,
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
              targetPath: path,
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
          this.hoverStore.proxyPosition = ev.currentTarget.getBoundingClientRect().bottom - this.$el.getBoundingClientRect().top - 2;
          this.hoverStore.handleMouseenter(ev, record[this.rowKey], record, path);
        },
        onMouseleave: (ev) => {
          this.hoverStore.handleMouseleave(ev);
        },
      };

      const tr = this.customTr({ record, rowIndex, path });
      if (typeof tr === 'string') {
        return this.$scopedSlots[tr]({ record, rowIndex, path });
      } else if (tr) {
        return tr;
      }

      return (
        <tr
          class={[
            'base-table__tr',
            { 'base-table__tr-hover': this.hoverStore.activeKey === record[this.rowKey], 'base-table__tr-drag': this.dragStore.sourceKey === record[this.rowKey] },
            this.rowClass({ record, rowIndex, path }),
          ]}
          onMouseenter={hoverEvent.onMouseenter}
          onMouseleave={hoverEvent.onMouseleave}
          onDragenter={dragTargetEvent.onDragenter}
          onDragover={dragTargetEvent.onDragover}
          onDrop={dragTargetEvent.onDrop}
          key={record[this.rowKey]}
        >
          {this.columns.map((column, columnIndex) => {
            return this.renderTd({ record, rowIndex, column, columnIndex, path });
          })}
        </tr>
      );
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

      const no = path
        .slice(1)
        .map((i) => i + 1)
        .join('.');

      const isChecked = this.checkedKeys.includes(record[this.rowKey]);

      const handleChecked = () => {
        if (isChecked) {
          const idx = this.checkedKeys.indexOf(record[this.rowKey]);
          if (idx !== -1) {
            // eslint-disable-next-line vue/no-mutating-props
            this.checkedKeys.splice(idx, 1);
          }
        } else {
          // eslint-disable-next-line vue/no-mutating-props
          this.checkedKeys.push(record[this.rowKey]);
        }
      };

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
            <div class={['base-table__drag-wrapper', { 'is-show': isChecked }]}>
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
              <ElCheckbox class="base-table__td-checkbox" value={isChecked} onChange={handleChecked}></ElCheckbox>
              <i class="el-icon-delete base-table__td-delete" onClick={() => this.handleDelete({ record, path })}></i>
            </div>
            <div class={['base-table__td-index', { 'is-hidden': isChecked }]}>{no}</div>
          </div>
        </td>
      );
    },
    handleCellClick(ev, data) {
      this.$emit('cell-click', ev, data);
    },
    handleCellMouseEnter(event) {
      const cell = getCell(event);
      if (hasClass(cell, 'is-editor')) {
        return;
      }
      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.base-table__td-content');
      if (!(hasClass(cellChild, 'base-table__tooltip') && cellChild.childNodes.length)) {
        return;
      }
      if ((cellChild.scrollWidth > cellChild.offsetWidth || cellChild.scrollHeight > cellChild.offsetHeight) && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip;
        // TODO 会引起整个 Table 的重新渲染，需要优化
        this.tooltipContent = cell.innerText || cell.textContent;
        tooltip.referenceElm = cell;
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
        tooltip.doDestroy();
        tooltip.setExpectedState(true);
        this.activateTooltip(tooltip);
      }
    },
    handleCellMouseLeave() {
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        tooltip.setExpectedState(false);
        tooltip.handleClosePopper();
      }
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
          onMouseenter={this.handleCellMouseEnter}
          onMouseleave={this.handleCellMouseLeave}
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
            <span class={['base-table__td-content', { 'base-table__tooltip': column.tooltip }]} style={{ '-webkit-line-clamp': this.lineClamp }}>
              {this.renderCell(record, rowIndex, column, columnIndex)}
            </span>
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
    handleAdd() {
      this.$emit('add', {
        rowKey: this.hoverStore.activeKey,
        record: this.hoverStore.data,
        path: this.hoverStore.targetPath,
      });
    },
    handleDelete(data) {
      this.$emit('delete', data);
    },
    handleChangeAll() {
      this.isCheckedAll = !this.isCheckedAll;
      this.$emit('checkedAll', this.isCheckedAll);
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
        style={{ maxHeight: this.maxHeight ? `${this.maxHeight}px` : 'unset', height: this.height ? `${this.height}px` : 'unset' }}
      >
        <div class="base-table__header-wrapper" ref="headerWrapEl">
          <table class="base-table__element" cellpadding="0" cellspacing="0" style={{ width: this.tableWidth ? `${this.tableWidth}px` : '100%' }}>
            <colgroup>
              {this.columnWidths.map((column) => {
                return (
                  <col
                    key={column.dataIndex}
                    style={{
                      minWidth: `${column.realWidth}px`,
                      width: `${column.realWidth}px`,
                      maxWidth: `${column.realWidth}px`,
                    }}
                  />
                );
              })}
              {this.columnWidths.length > 0 && (
                <col
                  style={{
                    minWidth: `${this.scrollBarWidth}px`,
                    width: `${this.scrollBarWidth}px`,
                    maxWidth: `${this.scrollBarWidth}px`,
                  }}
                ></col>
              )}
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
                        {column.type === 'sort' && <ElCheckbox value={this.isCheckedAll} onChange={this.handleChangeAll} class="base-table__th-checkbox"></ElCheckbox>}
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
        <div ref="bodyWrapEl" class="base-table__body-wrapper" onScroll={this.onScroll} style={{ maxHeight: this.tableBodyMaxHeight ? `${this.tableBodyMaxHeight}px` : 'unset' }}>
          <table ref="tableBodyEl" class="base-table__element base-table__body" cellpadding="0" cellspacing="0" style={{ width: this.tableWidth ? `${this.tableWidth}px` : '100%' }}>
            <colgroup>
              {this.columnWidths.map((column) => {
                return (
                  <col
                    key={column.dataIndex}
                    style={{
                      minWidth: `${column.realWidth}px`,
                      width: `${column.realWidth}px`,
                      maxWidth: `${column.realWidth}px`,
                    }}
                  />
                );
              })}
            </colgroup>
            <tbody class="base-table__body">{this.renderTbody()}</tbody>
          </table>
          {renderEmptBlock()}
        </div>
        <ElTooltip effect="light" placement="top" ref="tooltip" popper-class="base-table__tooltip" content={this.tooltipContent}></ElTooltip>
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
        <div
          onMouseenter={this.hoverStore.handleProxyMouseenter}
          onMouseleave={this.hoverStore.handleProxyMouseleave}
          onClick={this.handleAdd}
          class="base-table__hover-proxy"
          style={{
            display: this.hoverStore.isHover && !this.dragStore.dragging ? 'block' : 'none',
            top: `${this.hoverStore.proxyPosition}px`,
          }}
        >
          <div class="base-table__hover-proxy-button">+</div>
        </div>
      </div>
    );
  },
};
