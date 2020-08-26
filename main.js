
(function($) {
  $(document).ready(function() {
    /* Model */
    var InvoiceItemModel = Backbone.Model.extend({
      // 默认值
      defaults: {
        price: 0,
        quantity: 0
      },

      // validate, save()前调用，或者set时传入validate option
      validate: function(attrs) {
        if (attrs.price <= 0) {
          return 'invalidation price'
        }
      },

      calAmount: function() {
        // 应该get,set等方法访问，直接访问破坏backbone的事件触发机制
        console.log(this.attributes.price) 
        return this.get("price") * this.get("quantity")
      }
    })

    // 初始化, 传入的属性会set到model
    var invoiceItemModel = new InvoiceItemModel({
      price: 2,
      quantity: 3
    })
    

    /* View，负责对模型进行渲染 */
    var PreviewInvoiceItemView = Backbone.View.extend({
      // Underscore.js template
      template: _.template('\
        Price: <%= price %>\
        Quantity: <%= quantity %>\
        Amount: <%= amount %>\
      '),

      // 渲染数据、产生HTML代码
      render: function() {
        var html = this.template({
          price: this.model.get('price'),
          quantity: this.model.get('quantity'),
          amount: this.model.calAmount()
        })

        // 视图绑定到HTML元素上
        $(this.el).html(html)
      },
    })

    // 初始化：constructor/initialize
    var previewInvoiceItemView = new PreviewInvoiceItemView({
      model: invoiceItemModel,
      el: 'body'
    })


    /* 手动运行，渲染视图 */
    previewInvoiceItemView.render()


    // 或者
    /* 使用路由器运行应用 */
    var WorkSpace = Backbone.Router.extend({
      routes: {
        '': 'invoiceList',
        'invoice/:id': 'invoiceList'
      },

      invoiceList: function(id) {
        // 加载对应的视图
        var invoiceListView = new InvoiceListView({
          el: 'body',
          id: id
        })

        invoiceListView.render()
      }
    });

    var InvoiceListView = Backbone.View.extend({
      render: function() {
        $(this.el).text('invoice'+ (this.id || '') + ' list page!')
      }
    })

    new WorkSpace();
    // 手动运行或者用这个
    // Backbone.history.start()

  })
})(jQuery)