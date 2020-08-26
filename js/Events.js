/**
  * backbone Events
  */
!function($){
  $(document).ready(function() {
    var events = {}
    // 把事件对象混入到自己的对象当中
    _.extend(events, Backbone.Events)

    var hello = function () {
      console.log('hello Backbone.Events!')
    }
    events.on('hello:start', hello)

    events.trigger('hello:start')

    // 取消事件off
    // 监听其他对象上的事件listenTo

    /* 把模型绑定到视图 */
      // 创建模型
      // 创建视图
      // 在视图的initialize函数中 this.listenTo(this.model, 'change', this.render, this)

      // 创建模型实例
      // 创建视图实例
      // 渲染视图view.render()


    /* 把集合绑定到视图 */
    // 定义好所需的模型和集合
    var InvoiceItemModel = Backbone.Model.extend({
      defaults: {
        desc: '',
        price: 0,
        quantity: 0
      }
    })
    var InvoiceItemCollection = Backbone.Collection.extend({
      model: InvoiceItemModel
    })

    // 定义一个渲染单个模型的视图
    var InvoiceItemView = Backbone.View.extend({
      tagName: 'tr',
      render: function() {
        var html = _.map([
          this.model.get('desc'),
          this.model.get('price'),
          this.model.get('quantity')
        ], function(val, key){
          return '<td>' + val + '</td>'
        })

        $(this.el).html(html)

        return this;
      },
      initialize: function() {
        this.listenTo(this.model, 'destroy', this.remove, this)
      }
    })

    // 定义一个渲染集合的视图
    var InvoiceItemListView = Backbone.View.extend({
      tagName: 'table',
      className: 'table-class',

      render: function() {
        $(this.el).empty()

        // 添加表头
        this.$el.append('<tr></tr>').html(_.map(['desc', 'price', 'quantity'],
        function(val, key) {
          return '<th>' + val + '</th>'
        }))

        // 把行添加到table中
        _.each(this.collection.models, function(model, key) {
          this.append(model)
        }, this)

        return this
      },

      append: function(model) {
        $(this.el).append(
          new InvoiceItemView({model: model}).render().el
        )
      },

      // 处理集合的add事件
      initialize: function() {
        this.listenTo(this.collection, 'add', this.append, this)
      }
    })

    // 定义一个Add和Remove相关视图
    var InvoiceItemListControlsView = Backbone.View.extend({
      render: function() {
        var html = 
        '<br><input id="add" type="button" value="add">\
        <br><input id="remove" type="button" value="remove">'

        this.$el.html(html)

        return this
      },

      // 处理html事件
      events: {
        'click #add': 'addInvoiceItem',
        'click #remove': 'removeInvoiceItem'
      },

      addInvoiceItem: function() {
        this.collection.add([{
          desc: prompt('输入描述', ''),
          price: prompt('输入价格', '0'),
          quantity: prompt('输入数量', '1')
        }])
      },
      removeInvoiceItem: function() {
        var pos = prompt('输入删除对象的序号:', '')

        var model = this.collection.at(pos)
        model.destroy()
      }
    })

    // 定义一个渲染整个页面的视图
    var InvoiceItemListPageView = Backbone.View.extend({
      render: function() {
        $(this.el).html(
          new InvoiceItemListView({
            collection: this.collection
          }).render().el
        )

        $(this.el).append(
          new InvoiceItemListControlsView({
            collection: this.collection
          }).render().el
        )
      }
    })

    // 初始化集合实例
    var invoiceItemCollection = new InvoiceItemCollection([
      { desc: '1', price: 10, quantity: 3},
      { desc: '2', price: 20, quantity: 4}
    ])

    // 创建整个页面的视图实例，并渲染
    new InvoiceItemListPageView({
      el: 'body',
      collection: invoiceItemCollection
    }).render()


    /* 双向绑定：插件backbone.stickit */
    /* https://github.com/nytimes/backbone.stickit */


    /* 快捷键处理，Mousetrap库 */


  })
}(jQuery) 