export function getScrollbarWidth() {
  // 创建一个div元素，设置样式
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '-9999px';
  div.style.width = '50px';
  div.style.height = '50px';
  div.style.overflow = 'scroll';
  document.body.appendChild(div);
  // 计算滚动条宽度
  const scrollbarWidth = div.offsetWidth - div.clientWidth;
  // 移除div元素
  document.body.removeChild(div);
  return scrollbarWidth;
}

export function debounce(fn, delay = 16) {
  // 定时器
  let timer = null;

  // 将debounce处理结果当作函数返回
  return function () {
    // 保留调用时的this上下文
    let context = this;
    // 保留调用时传入的参数
    let args = arguments;

    // 每次事件被触发时，都去清除之前的旧定时器
    if (timer) {
      clearTimeout(timer);
    }
    // 设立新定时器
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
