// 使用模板把html从应用程序中分离出来

/* 步骤 */
// 定义用到的模型和集合对象
// 定义视图时，指定template属性（包含了具体的HTML模板），随后视图渲染过程中调用template返回经过渲染的HTML代码。
// 创建一个集合实例
// 创建一个视图实例并进行渲染，把结果复制给页面的body元素


// Underscore _.template()
// <% ... %> 定义包含js代码的HTML模板
// <%= ... %> 变量输出到模板时 使用
// <%- ... %> 变量值先转义再输出到模板时 使用
// collection.toJSON 集合中对象先转换再传给模板使用

// 把模板拆分成 部件（以函数的方式来调用的模板）
// test