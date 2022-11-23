<template>
  <div class="addgoods-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告提示 -->
      <el-alert title="添加商品信息" type="info" show-icon center></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 侧边栏 -->
      <!-- 表单 -->
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="100" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeLeaveTabs" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <!-- 商品分类选择 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="addGoodsProps"
                @change="addHandleChange"
                clearable
                >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 多选框 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.att_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,id) in item.attr_vals" :key="id" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 静态参数表单 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              list-type="picture"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headers"
              :on-success="handleSuccess"
              >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            />
            <!-- 提交按钮 -->
            <el-button type="primary" size="mini" class="addEditBtn" @click="addBtn">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片对话框 -->
    <el-dialog
      title="预览"
      :visible.sync="imgDialogVisible"
      width="50%"
      >
      <img :src="bg.img" alt="" width="100%" height="100%">
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash依赖进行对象深拷贝
import _ from 'lodash'
export default {
  name: 'MyAddGoods',
  data() {
    return {
      // 激活索引
      activeIndex: 0,
      // 添加的信息
      addForm: {
        goods_name: '',
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        // 因为提交过来的是数组,但是传递过去的时候需要转换为,分割字符串
        // 分类列表数据
        goods_cat: [],
        // 图片路径
        pics: [],
        // 描述信息
        goods_introduce: '',
        // 动态参数和静态属性对应的对象信息
        attrs: []
      },
      // 验证规则
      addRules: {
        // 名称
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品列表
      cateList: [],
      // 分类规则
      addGoodsProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 渲染多选框需要的参数列表数据
      manyTableData: [],
      onlyTableData: [],
      // 设置图片上传的请求头Authorization权限
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      bg: {
        img: undefined
      },
      // 预览图片对话框
      imgDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 分类选择变化
    addHandleChange() {
      console.log(this.addForm.goods_cat)
      // 判断必须选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换标签页
    beforeLeaveTabs(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 选择标签页
    async tabClick() {
      // 判断是否选中的是商品参数
      if (this.activeIndex === '1') {
        console.log(this.addForm.goods_cat[2])
        const { data: res } = await this.$http.get(`categories/${this.addForm.goods_cat[2]}/attributes`, {
          params: { sel: 'many' }
        })
        // 将获取到的attr_vals转换为数组，方便后面渲染
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        console.log('动态参数', res.data)
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.addForm.goods_cat[2]}/attributes`, {
          params: { sel: 'only' }
        })
        console.log('静态参数', res)
        if (res.meta.status !== 200) return this.$message.error('获取失败')
        this.onlyTableData = res.data
      }
    },
    // 预览图片触发函数
    handlePreview(file) {
      console.log(file)
      this.bg.img = URL.createObjectURL(file.raw)
      this.imgDialogVisible = true
    },
    // 移除图片触发函数
    handleRemove(file) {
      console.log(file)
      // 遍历路径数组pics，删除对应图片的路径信息对象
      this.addForm.pics.forEach((item, i) => {
        if (item.pic === file.response.data.tmp_path) {
          // 移除对应图片的路径
          this.addForm.pics.splice(i, 1)
        }
        console.log(this.addForm)
      })
    },
    // 上传成功时将图片路径保存到添加时需要发送的数据中
    handleSuccess(response) {
      this.addForm.pics.push({ pic: response.data.tmp_path })
      console.log(this.addForm)
    },
    // 提交添加商品信息
    addBtn() {
      // 先进行表单预验证
      this.$refs.addForm.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要项信息')
        // 验证成功，进行添加业务逻辑
        // 对提交数据进行深拷贝
        const newAddForm = _.cloneDeep(this.addForm)
        // 将goods_cat转换成逗号分割的字符串
        newAddForm.goods_cat = newAddForm.goods_cat.join(',')
        // 处理动态参数和静态属性的数据
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          newAddForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          newAddForm.attrs.push(newInfo)
        })
        console.log(newAddForm)
        const { data: res } = await this.$http.post('goods', newAddForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.$router.go(-1)
      })
    }
  }
}
</script>

<style lang="less" scoped>
 .el-card {
  margin-top: 15px;
 }
 .el-alert {
  margin-bottom: 10px;
 }
 .el-form {
  margin-left: 15px;
 }
 .el-row {
  margin-top: 10px;
 }
 .el-checkbox {
  margin: 0 10px 0 0!important;
 }
 .addEditBtn {
  margin-top: 10px;
 }
</style>
