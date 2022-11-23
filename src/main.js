import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import
{
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Main,
  Aside,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox,
  Tag,
  Tree,
  Select,
  Option,
  Cascader,
  Alert,
  Tabs,
  TabPane,
  Steps,
  Step,
  Checkbox,
  CheckboxGroup,
  Upload,
  Timeline,
  TimelineItem
} from 'element-ui'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入自定义主题颜色
import './assets/element-theme-myelethe/index.css'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入相应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 导入axios请求
import axios from 'axios'
// 添加过渡效果(发起请求时，页面上会有线闪现)
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

// 进行axios相关配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器，设置请求头进行token绑定，获得数据
axios.interceptors.request.use(config => {
  // 在请求实现过渡线效果开始
  Nprogress.start()
  // 设置请求头字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 设置相应拦截器
axios.interceptors.response.use(config => {
  // 在响应结束关闭过渡效果
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.component(MessageBox.name, MessageBox)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Upload)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm

// 注册副文本编辑器
Vue.use(VueQuillEditor)
Vue.config.productionTip = false

// 全局过滤器对时间进行格式化
Vue.filter('dataFormat', function(originVal) {
  let dt = new Date(originVal)

  let y = fillZero(dt.getFullYear())
  let m = fillZero(dt.getMonth() + 1)
  let d = fillZero(dt.getDate())

  let hh = fillZero(dt.getHours())
  let mm = fillZero(dt.getMinutes())
  let ss = fillZero(dt.getSeconds())
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 补零
function fillZero(val) {
  let newDate = val > 10 ? val : '0' + val
  return newDate
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
