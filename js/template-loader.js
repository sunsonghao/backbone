!function ($) {
  $(document).ready(function() {
    // 渲染时可以使用内存中的模板 $.tpl['name']
    $.tpl = {}
    $('script.template').each(function(index) {

      // load template from DOM
      $.tpl[$(this).attr('id')] = _.template($(this).html()) // 函数

      // remove template from DOM
      $(this).remove()
    })
  })
}(jQuery)