<template>
<div class="cate-container">
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片区域 -->
  <el-card>
    <!-- 添加分类按钮 -->
    <el-button type="primary" @click="showCateDialog">添加分类</el-button>
    <!-- 树状表格区域 -->
    <el-table
    :data="cateList"
    style="width: 100%"
    border
    stripe
    row-key="cat_id"
    :tree-props="{children: 'children', hasChildren: true}">
    >
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column prop="cat_name" label="分类名称"></el-table-column>
      <el-table-column  label="是否有效">
        <template v-slot="scope">
          <i class="el-icon-error" v-if="scope.row.cat_deleted" style="color:red"></i>
          <i class="el-icon-success" style="color:lightgreen"></i>
        </template>
      </el-table-column>
      <el-table-column label="排序">
        <template v-slot="scope">
          <el-tag type="success" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="danger" v-else>三级</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" class="el-icon-edit">编辑</el-button>
          <el-button type="danger" class="el-icon-delete" @click="delCate(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 页码 -->
    <el-pagination
      @size-change="cateHandleSizeChange"
      @current-change="cateHandleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3,5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>

  <!-- 添加分类对话框 -->
  <el-dialog
  title="请输入添加的信息"
  :visible.sync="cateDialogVisible"
  width="50%"
  @close="addCateDialogClosed"
  >
  <div>
    <el-form ref="cateForm" :rules="cateFormRules" :model="postCateForm" label-width="100px">
      <!-- 分类名称 -->
      <el-form-item label="分类名称："  prop="cat_name">
        <el-input v-model="postCateForm.cat_name"></el-input>
      </el-form-item>
      <!-- 父级分类 -->
      <!-- props必填，用来显示效果和选择 -->
      <el-form-item label="父级分类：" prop="cat_name">
        <el-cascader
          v-model="parentCateList"
          :options="getParentList"
          :props="cascaderProps"
          @change="parentCateSelected"
          clearable
          ref="cascaderCate"
        >
        </el-cascader>
      </el-form-item>
    </el-form>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="cateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  name: 'MyCate',
  data() {
    return {
      // 商品分类参数
      cateList: [],
      // 传递参数
      queryInfo: {
        // 获得多少级别的分类
        type: 3,
        // 当前页码值
        pagenum: 1,
        // 每页多少跳数据
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 添加分类对话框
      cateDialogVisible: false,
      // 分类参数用于post请求发起数据
      postCateForm: {
        cat_pid: 0,
        cat_name: '',
        // 父级分类默认一级
        cat_level: 0
      },
      // 分类参数规则
      cateFormRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      // 获取前两级分类列表
      getParentList: [],
      // 级联选择器配置props
      cascaderProps: {
        // 次级菜单展开方式
        expandTrigger: 'hover',
        value: 'cat_id',
        // 展示的内容
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 级联选择器选中后返回的数组
      parentCateList: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.cateList = res.data.result
      this.total = res.data.total
      console.log(this.cateList)
    },
    // 每页显示数改变
    cateHandleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 页码改变
    cateHandleCurrentChange(newCurrent) {
      this.queryInfo.pagenum = newCurrent
      this.getCateList()
    },
    // 展开添加分类对话框
    showCateDialog() {
      // 获取二级数据
      this.getParentCateList()
      this.cateDialogVisible = true
    },
    // 获取前两级数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      console.log(res)
      this.getParentList = res.data
      console.log(this.getParentList)
    },
    // 级联选择器选则后返回的数据
    parentCateSelected() {
      if (this.parentCateList.length > 0) {
        this.postCateForm.cat_pid = this.parentCateList[this.parentCateList.length - 1]
        this.postCateForm.cat_level = this.parentCateList.length
      } else {
        // 长度不为0，则将等级和pid重置为0
        this.postCateForm.cat_pid = 0
        this.postCateForm.cat_level = 0
        console.log(this.postCateForm)
      }
      console.log('改变阶段', this.postCateForm)
    },
    // 点击添加
    async addCate() {
      console.log('添加阶段', this.postCateForm)
      const { data: res } = await this.$http.post('categories', this.postCateForm)
      if (res.meta.status !== 201) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      this.getCateList()
      this.cateDialogVisible = false
    },
    // 监听对话框关闭
    addCateDialogClosed() {
      // 清空cascader选中的
      this.$refs.cateForm.resetFields()
      this.parentCateList = []
    },
    // 删除数据
    async delCate(cate) {
      console.log(cate.cat_id)
      const { data: res } = await this.$http.delete('categories/' + cate.cat_id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      let totalPage = Math.ceil((this.total - 1) / this.queryInfo.pagesize)
      let pageNum = this.queryInfo.pagenum > totalPage ? totalPage : this.queryInfo.pagenum
      this.queryInfo.pagenum = pageNum > 1 ? pageNum : 1
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
  .el-pagination {
    margin-top: 10px;
  }
  .el-button {
    margin-bottom: 10px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
