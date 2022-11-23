<template>
  <div class="order-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-input placeholder="请输入内容" v-model="input3" class="selInp">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
      <!-- 订单信息表格 -->
      <el-table
        :data="orderList"
        style="width: 100%"
        border
        stripe
        >
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="350"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="100">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.order_pay === 0">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="100"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <!-- 过滤器格式化时间 -->
          <template v-slot="scope">
            {{scope.row.create_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" class="el-icon-edit" size="mini" @click="editBtn"></el-button>
            <el-button type="success" class="el-icon-location" size="mini" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="orderInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="orderInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
      >
      <el-form ref="addressForm" :rules="addressRules" :model="addressForm" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="CityData"
            :props="cascaderProps"
            clearable
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
    >
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入省市区/县数据
import CityData from './citydata.js'
export default {
  name: 'MyOrder',
  data() {
    return {
      // 订单信息
      orderList: [],
      input3: '',
      // 获取订单列表时提交的参数
      orderInfo: {
        // 查询参数
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总数据条数
      total: 0,
      // 编辑修改地址对话框开关
      addressDialogVisible: false,
      // 修改地址表单数据
      addressForm: {
        // 地址信息
        address1: [],
        address2: ''
      },
      // 地址表单验证规则
      addressRules: {
        // 地址
        address1: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 省市区/县数据
      CityData,
      // 级联选择器
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'value',
        lable: 'label',
        children: 'children'
      },
      // 物流进度对话框开关
      progressVisible: false,
      // 物流进度信息
      progressInfo: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        }
      ]
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.orderInfo })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    // 页码改变
    handleSizeChange(size) {
      this.orderInfo.pagesize = size
      this.getOrderList()
    },
    // 每页显示条数改变
    handleCurrentChange(current) {
      this.orderInfo.pagenum = current
      this.getOrderList()
    },
    // 编辑
    editBtn() {
      this.addressDialogVisible = true
    },
    // 提交地址信息
    addressBtn() {
      // 进行表单验证
      this.$refs.addressForm.validate(valid => {
        if (!valid) return this.$message.error('请填写必要地址信息')
        console.log(this.addressForm)
        this.addressDialogVisible = false
      })
    },
    // 对话框关闭
    addressDialogClosed() {
      this.$refs.addressForm.resetFields()
    },
    // 物流显示对话框
    async showProgress() {
      // 获取物流进度信息,这里后端接口有问题，用假数据模拟
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
  .selInp {
    width: 30%;
  }
  .el-table {
    margin-top: 10px;
  }
  .el-pagination {
    margin-top: 10px;
  }
</style>
