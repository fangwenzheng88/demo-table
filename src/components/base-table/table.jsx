import { getScrollbarWidth, debounce } from './utils';

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
    colspan: {
      type: Function,
      required: false,
      default: () => 1,
    },
  },
  data() {
    return {
      rootWidth: 0,
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
    };
  },
  watch: {
    isScrollY() {
      this.$nextTick(() => {
        this.setColumnsWidth();
      });
    },
    maxHeight() {
      this.$nextTick(() => {
        this.setColumnsWidth();
      });
    },
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
      if (this.rootWidth - this.tableWidth > this.scrollBarWidth) {
        return false;
      } else {
        return true;
      }
    },
  },
  mounted() {
    this.scrollBarWidth = getScrollbarWidth();
    const windowResize = () => {
      this.scrollBarWidth = getScrollbarWidth();
    };
    window.addEventListener('resize', windowResize);
    this.$once('hook:beforeDestory', () => {
      window.removeEventListener('resize', windowResize);
    });
    this.$nextTick(() => {
      this.rootWidth = this.$el.offsetWidth - 1;
      this.initColumnsWidth();
      this.listenerRootResize();
      this.listenerTableBodyResize();
    });
  },
  methods: {
    listenerRootResize() {
      const ele = this.$el;
      const resizeObserver = new ResizeObserver(
        debounce((entries) => {
          const width = entries[0].contentRect.width;
          this.rootWidth = width;
        })
      );
      // 监听元素
      resizeObserver.observe(ele);

      this.$once('hook:beforeDestory', () => {
        resizeObserver.unobserve(ele);
      });
    },
    initColumnsWidth() {
      let width = this.$el.offsetWidth - 1;
      let el = this.$refs.bodyWrapEl;
      if (el && el.scrollHeight > el.clientHeight) {
        width -= this.scrollBarWidth;
      }
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
      let width = this.$el.offsetWidth - 1;
      let el = this.$refs.bodyWrapEl;
      if (el) {
        if (el.scrollHeight > el.clientHeight) {
          width -= this.scrollBarWidth;
        }
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
        debounce(() => {
          let el = this.$refs.bodyWrapEl;
          if (el) {
            if (el.scrollHeight > el.clientHeight) {
              this.isScrollY = true;
            } else {
              this.isScrollY = false;
            }

            this.$nextTick(() => {
              if (el.scrollWidth > el.clientWidth) {
                this.isScrollX = true;
              } else {
                this.isScrollX = false;
              }

              this.isScrollToRight = el.scrollLeft >= el.scrollWidth - el.offsetWidth;
              this.isScrollToLeft = el.scrollLeft === 0;
            });
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
        console.log(this.draggingColumn, this.draggingColumn.width);
        this.$nextTick(() => {
          this.setColumnsWidth();
        });
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
        return this.renderTr(record, rowIndex);
      });
    },
    renderTr(record, rowIndex) {
      const tr = this.customTr(record, rowIndex);
      if (typeof tr === 'string') {
        return this.$scopedSlots[tr]({ record, rowIndex });
      } else if (tr) {
        return tr;
      }

      let colspan = 1;
      return (
        <tr class="base-table-tr" key={record[this.rowKey]}>
          {this.columns.map((column, columnIndex) => {
            if (colspan > 1) {
              colspan -= 1;
              return null;
            } else {
              colspan = this.colspan(record, rowIndex, column, columnIndex);
              return this.renderTd(record, rowIndex, column, columnIndex, colspan);
            }
          })}
        </tr>
      );
    },
    renderTd(record, rowIndex, column, columnIndex, colspan) {
      return (
        <td
          colspan={colspan}
          class={[
            {
              'base-table-column-fixed': column.fixed,
              'base-table-fixed-right-is-first': this.isFirstFixedRight(columnIndex),
              'base-table-fixed-left-is-last': this.isLastFixedLeft(columnIndex),
            },
            'base-table-td',
          ]}
          style={this.getFixedStyle(column, columnIndex)}
          key={column.dataIndex}
        >
          {this.renderCell(record, rowIndex, column, columnIndex)}
        </td>
      );
    },
    renderCell(record, rowIndex, column, columnIndex) {
      if (this.$scopedSlots[column.dataIndex]) {
        return this.$scopedSlots[column.dataIndex]({
          record,
          rowIndex,
          column,
          columnIndex,
        });
      } else {
        return <div class="base-table-cell">{record[column.dataIndex]}</div>;
      }
    },
  },
  render() {
    const renderEmptBlock = () => {
      if (this.data && this.data.length > 0) {
        return null;
      }
      return <div class="base-table-empty-block">暂无数据</div>;
    };
    return (
      <div
        class={[
          'base-table',
          {
            'base-table-scroll-x': this.isScrollX,
            'base-table-scroll-y': this.isScrollY,
            'base-table-scroll': this.isScrollX || this.isScrollY,
            'base-table-scroll-position-left': this.isScrollToLeft,
            'base-table-scroll-position-right': this.isScrollToRight,
            'base-table-scroll-position-middle': !this.isScrollToLeft && !this.isScrollToRight,
          },
        ]}
      >
        <div class="base-table-header-wrapper" ref="headerWrapEl">
          <table class="base-table-element" cellpadding="0" cellspacing="0" style={{ width: `${this.tableWidth}px` }}>
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
              <tr class="base-table-tr">
                {this.columns.map((column, index) => {
                  return (
                    <th
                      class={[
                        {
                          'base-table-thead-fixed': column.fixed,
                          'base-table-fixed-right-is-first': this.isFirstFixedRight(index),
                          'base-table-fixed-left-is-last': this.isLastFixedLeft(index),
                        },
                        'base-table-th',
                      ]}
                      style={this.getFixedStyle(column, index, 'th')}
                      key={column.dataIndex}
                    >
                      <div class="base-table-cell">{column.title}</div>
                      <div class="base-table-resize-handle" onMousedown={(e) => this.handleMouseDown(e, column, index)}></div>
                    </th>
                  );
                })}
                {this.isScrollY && <th class="base-table-th base-table-gutter" style={{ width: `${this.scrollBarWidth}px`, visibility: this.hasGutter ? 'visible' : 'hidden' }}></th>}
              </tr>
            </thead>
          </table>
        </div>
        <div ref="bodyWrapEl" class="base-table-body-wrapper" style={{ maxHeight: this.maxHeight ? this.maxHeight : 'unset' }} onScroll={this.onScroll}>
          <table ref="tableBodyEl" class="base-table-element base-table-body" cellpadding="0" cellspacing="0" style={{ width: this.tableWidth ? `${this.tableWidth}px` : '100%' }}>
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
            <tbody class="base-table-body">{this.renderTbody()}</tbody>
          </table>
          {renderEmptBlock()}
        </div>
        <div
          class="base-table-column-resize-proxy"
          style={{
            display: this.dragPoxy.visible ? 'block' : 'none',
            left: `${this.dragPoxy.left}px`,
          }}
        ></div>
      </div>
    );
  },
};
